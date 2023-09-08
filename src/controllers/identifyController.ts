import { Request, Response, NextFunction, response } from 'express';
import { Contact } from '../Entities/Contact';
import { body, validationResult } from 'express-validator';
import ContactInfo from '../DB/contactDB'
import { LinkPrecedence } from '../Entities/LinkPrecedenceTypes';

export const validateIdentifyRequest = [
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (!req.body.email && !req.body.phoneNumber) {
            return res.status(400).json({ message: "Either email or phone number is required" });
        }
        next();
    }
];

export const identify = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, phoneNumber } = req.body;

        const completeRecord = await ContactInfo.retrieveFullRecord(email, phoneNumber);

        if (completeRecord && completeRecord.length) {
            let responseReceived = await handleResponseGeneration(email, phoneNumber);
            return res.status(200).json(responseReceived);
        }

        const partialRecords = await ContactInfo.retrieveLimitedRecord(email, phoneNumber);

        if (!partialRecords || !partialRecords.length) {
            await ContactInfo.insertRecord({ email, phoneNumber, linkPrecedence: LinkPrecedence.PRIMARY });
            let responseReceived = await handleResponseGeneration(email, phoneNumber);
            return res.status(200).json(responseReceived);
        }

        if (email || phoneNumber) {
            const records = partialRecords.map(record => ({
                id: record.id,
                phoneNumber: record.phoneNumber,
                email: record.email,
                linkedId: record.linkedId,
                linkPrecedence: record.linkPrecedence
            }));

            let linkId = records[0].id;
            let isEmailFound = email ? records.some(record => record.email === email) : true;
            let isPhoneFound = phoneNumber ? records.some(record => record.phoneNumber === phoneNumber) : true;

            for (let i = 1; i < records.length; i++) {
                const record = records[i];
                
                if (record.linkPrecedence !== LinkPrecedence.SECONDARY) {
                    await ContactInfo.insertRecord({
                        id: record.id,
                        phoneNumber: record.phoneNumber,
                        email: record.email,
                        linkedId: linkId,
                        linkPrecedence: LinkPrecedence.SECONDARY
                    });
                }
            
                if (email && !isEmailFound && record.email === email) {
                    isEmailFound = true;
                }
            
                if (phoneNumber && !isPhoneFound && record.phoneNumber === phoneNumber) {
                    isPhoneFound = true;
                }
            }            

            if (!isEmailFound || !isPhoneFound) {
                await ContactInfo.insertRecord({
                    phoneNumber,
                    email,
                    linkedId: linkId,
                    linkPrecedence: LinkPrecedence.SECONDARY
                });
            }
        }

        let responseReceived = await handleResponseGeneration(email, phoneNumber);
        return res.status(200).json(responseReceived);
    } catch (error) {
        next(error);
    }
};


async function handleResponseGeneration(email?: string, phoneNumber?: string) {
    const ids = new Set<number>();
    let recordIds = await ContactInfo.retrieveIDsFromEmailPhone(email, phoneNumber);

    recordIds.forEach(record => {
        ids.add(record.id);
        if (record.linkedId) ids.add(record.linkedId);
    });    

    recordIds = await ContactInfo.retrieveIDs(Array.from(ids));

    recordIds.forEach(record => {
        ids.add(record.id);
        if (record.linkedId) ids.add(record.linkedId);
    });

    let newIdsFound: boolean;
    do {
        newIdsFound = false;
        const currentSize = ids.size;

        const linkedRecordIds = await ContactInfo.retrieveIDs(Array.from(ids));
        linkedRecordIds.forEach(record => {
            ids.add(record.id);
            if (record.linkedId) ids.add(record.linkedId);
        });

        if (ids.size > currentSize) {
            newIdsFound = true;
        }
    } while (newIdsFound);

    const records = await ContactInfo.retrieveRecordsByIDs(Array.from(ids));

    const responsePayload = {
        contact: {
            primaryContactId: records[0].id,
            emails: retrieveEmails(records),
            phoneNumbers: retrievePhoneNumbers(records),
            secondaryContactIds: records.slice(1).map(record => record.id)
        }
    };
    return responsePayload;
}

function retrieveEmails(data: Contact[]): string[] {
    const emails = data.filter(d => d.email).map(d => d.email as string);
    return Array.from(new Set(emails));
}

function retrievePhoneNumbers(data: Contact[]): string[] {
    const phoneNumbers = data.filter(d => d.phoneNumber).map(d => d.phoneNumber as string);
    return Array.from(new Set(phoneNumbers));
}
