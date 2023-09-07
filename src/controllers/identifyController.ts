import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { Contact } from '../Entities/Contact';
import { body, validationResult } from 'express-validator';

// Validation
export const validateIdentifyRequest = [
    body('email').optional().isEmail().withMessage('Email is not valid'),
    body('phoneNumber').optional().isNumeric().withMessage('Phone number is not valid'),
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

export const identifyEndpoint = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const contactRepo = getRepository(Contact);
        let { email, phoneNumber } = req.body;

        // Finding primary contact using email or phone number
        const primaryContact = await contactRepo.findOne({
            where: [
                { email, linkPrecedence: 'primary' },
                { phoneNumber, linkPrecedence: 'primary' }
            ]
        });

        if (primaryContact) {
            const secondaryContacts = await contactRepo.find({
                where: { linkedId: primaryContact.id }
            });

            return res.json({
                contact: {
                    primaryContactId: primaryContact.id,
                    emails: [primaryContact.email, ...secondaryContacts.map(contact => contact.email)],
                    phoneNumbers: [primaryContact.phoneNumber, ...secondaryContacts.map(contact => contact.phoneNumber)],
                    secondaryContactIds: secondaryContacts.map(contact => contact.id)
                }
            });
        }

        // If there's no primary contact found, check for secondary contacts
        const secondaryContact = await contactRepo.findOne({
            where: [
                { email, linkPrecedence: 'secondary' },
                { phoneNumber, linkPrecedence: 'secondary' }
            ]
        });

        if (secondaryContact) {
            const newContact = contactRepo.create({
                email,
                phoneNumber,
                linkedId: secondaryContact.linkedId,
                linkPrecedence: 'secondary'
            });

            await contactRepo.save(newContact);

            return res.json({
                contact: {
                    primaryContactId: secondaryContact.linkedId,
                    emails: [secondaryContact.email, newContact.email],
                    phoneNumbers: [secondaryContact.phoneNumber, newContact.phoneNumber],
                    secondaryContactIds: [secondaryContact.id, newContact.id]
                }
            });
        }

        // If neither primary nor secondary contact exists, create a new primary contact
        const newContact = contactRepo.create({
            email,
            phoneNumber,
            linkPrecedence: 'primary'
        });
        await contactRepo.save(newContact);
        return res.status(201).json({
            contact: {
                primaryContactId: newContact.id,
                emails: [newContact.email],
                phoneNumbers: [newContact.phoneNumber],
                secondaryContactIds: []
            }
        });
    } catch (error) {
        next(error);
    }
};

