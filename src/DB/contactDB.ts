import { Repository, In } from "typeorm";
import { Contact } from "../Entities/Contact";
import { dataSource } from '../config/database';

export class ContactDB {

    private contactRepository: Repository<Contact>;

    constructor() {
        this.contactRepository = dataSource.manager.getRepository(Contact);
    }

    async retrieveFullRecord(email?: string, phoneNumber?: string): Promise<Contact[]> {
        return this.contactRepository.find({
            where: { email, phoneNumber }
        });
    }

    async retrieveLimitedRecord(email?: string, phoneNumber?: string): Promise<Contact[]> {
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

    async insertRecord(data: Partial<Contact>): Promise<Contact> {
        const contact = this.contactRepository.create(data);
        return this.contactRepository.save(contact);
    }

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

    async retrieveIDs(ids: number[]): Promise<{ id: number, linkedId?: number }[]> {
        return this.contactRepository.find({
            select: ["id", "linkedId"],
            where: [
                { id: In(ids) },
                { linkedId: In(ids) }
            ]
        });
    }

    async retrieveRecordsByIDs(ids: number[]): Promise<Contact[]> {
        return this.contactRepository.find({
            where: { id: In(ids) },
            order: {
                createdAt: "ASC"
            }
        });
    }

    async retrieveAllRecords(): Promise<Contact[]> {
        return await this.contactRepository.find();
    }    
}

const ContactDBInstance = new ContactDB();
export default ContactDBInstance;
