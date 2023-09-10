import { Request, Response, NextFunction, response } from 'express';
import { Contact } from '../Entities/Contact';
import { body, validationResult } from 'express-validator';
import ContactInfo from '../DB/contactDB'
import { LinkPrecedence } from '../Entities/LinkPrecedenceTypes';

// Middleware to check for validation
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

        // Fetching records which have both email and phoneNumber as matching
        const exactMatchContacts = await ContactInfo.retrieveCompleteMatchRecords(email, phoneNumber);

        if (exactMatchContacts.length) {
            let responseReceived = await handleResponseGeneration(email, phoneNumber);
            return res.status(200).json(responseReceived);
        }

        // Fetching records with either email or phoneNumber as matching
        const partialMatchContacts = await ContactInfo.retrievePartialMatchRecords(email, phoneNumber);

        // Create new record as primary if none matches
        if (!partialMatchContacts || !partialMatchContacts.length) {
            await ContactInfo.insertRecord({ email, phoneNumber, linkPrecedence: LinkPrecedence.PRIMARY });
            let responseReceived = await handleResponseGeneration(email, phoneNumber);
            return res.status(200).json(responseReceived);
        }

        if (email || phoneNumber) {
            const records = [...partialMatchContacts];
        
            // Store the id of the first partial match record
            let linkId = records[0].id;
        
            // If email is not null and is not present among any records, 
            // create a new one with that email and link to the primary record
            if (email) {
                let isEmailFound = records.some(record => record.email === email);
        
                if (!isEmailFound) {
                    await ContactInfo.insertRecord({
                        email,
                        linkedId: linkId,
                        linkPrecedence: LinkPrecedence.SECONDARY
                    });
                }
            }
        
            // If phoneNumber is not null and is not present among any records, 
            // create a new one with that phoneNumber and link to the primary record
            if (phoneNumber) {
                let isPhoneFound = records.some(record => record.phoneNumber === phoneNumber);
        
                if (!isPhoneFound) {
                    await ContactInfo.insertRecord({
                        phoneNumber,
                        linkedId: linkId,
                        linkPrecedence: LinkPrecedence.SECONDARY
                    });
                }
            }
        
            // Update link precedence of primary records with matching email or phoneNumber
            for (let i = 1; i < records.length; i++) {
                const record = records[i];
        
                if (record.linkPrecedence !== LinkPrecedence.SECONDARY) {
                    await ContactInfo.insertRecord({
                        ...record,
                        linkedId: linkId,
                        linkPrecedence: LinkPrecedence.SECONDARY
                    });
                }
            }
        }
        
        let responseReceived = await handleResponseGeneration(email, phoneNumber);
        return res.status(200).json(responseReceived);
    } catch (error) {
        next(error);
    }
};

// Return response to be displayed
async function handleResponseGeneration(email?: string, phoneNumber?: string) {
    const ids = new Set<number>();
    let recordIds = await ContactInfo.retrieveIDsFromEmailPhone(email, phoneNumber);
    
    recordIds.forEach(record => {
        ids.add(record.id);
        if (record.linkedId) ids.add(record.linkedId);
    });

    // Add all the associated ids retrieved with the help of email and phone number
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

// Retrieve all the unique emails
function retrieveEmails(data: Contact[]): string[] {
    const emails = data.filter(d => d.email).map(d => d.email as string);
    return Array.from(new Set(emails));
}

// Retrieve all the unique phoneNumbers
function retrievePhoneNumbers(data: Contact[]): string[] {
    const phoneNumbers = data.filter(d => d.phoneNumber).map(d => d.phoneNumber as string);
    return Array.from(new Set(phoneNumbers));
}
