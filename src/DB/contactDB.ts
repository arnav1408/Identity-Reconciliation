import { Repository, In } from "typeorm";
import { Contact } from "../Entities/Contact";
import { dataSource } from '../config/database';

export class ContactDB {

    private contactRepository: Repository<Contact>;

    constructor() {
        this.contactRepository = dataSource.manager.getRepository(Contact);
    }

    // Return records with matching email AND phoneNumber
    async retrieveCompleteMatchRecords(email?: string, phoneNumber?: string): Promise<Contact[]> {
        return this.contactRepository.find({
            where: { email, phoneNumber }
        });
    }

    // Return records with matching email OR phoneNumber ordered by createdAt parameter in Ascending order
    async retrievePartialMatchRecords(email?: string, phoneNumber?: string): Promise<Contact[]> {
        return this.contactRepository.find({
            where: [
                { email },
                { phoneNumber }
            ],
            order: {
                createdAt: "ASC"
            }
        });
    }

    // Save the record to the database with the provided details
    async insertRecord(data: Partial<Contact>): Promise<Contact> {
        const contact = this.contactRepository.create(data);
        return this.contactRepository.save(contact);
    }

    // Return records containing id and linkedID with matching email OR phoneNumber 
    async retrieveIDsFromEmailPhone(email?: string, phoneNumber?: string): Promise<{ id: number, linkedId?: number }[]> {
        const records = await this.contactRepository.find({
            select: ["id", "linkedId"],
            where: [
                { email },
                { phoneNumber }
            ]
        });
        return records.map(record => ({
            id: record.id,
            linkedId: record.linkedId
        }));
    }

    // Return records containing id and linkedID with matching id or linkedId with all the ids
    async retrieveIDs(ids: number[]): Promise<{ id: number, linkedId?: number }[]> {
        return this.contactRepository.find({
            select: ["id", "linkedId"],
            where: [
                { id: In(ids) },
                { linkedId: In(ids) }
            ]
        });
    }

    // Return records where id matches any id of all the records in ascending order of creation
    async retrieveRecordsByIDs(ids: number[]): Promise<Contact[]> {
        return this.contactRepository.find({
            where: { id: In(ids) },
            order: {
                createdAt: "ASC"
            }
        });
    }

    // Return all records
    async retrieveAllRecords(): Promise<Contact[]> {
        return await this.contactRepository.find();
    }    
}

const ContactDBInstance = new ContactDB();
export default ContactDBInstance;
