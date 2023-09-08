import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Contact {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "text", nullable: true })
    phoneNumber?: string;

    @Column({ type: "text", nullable: true })
    email?: string;

    @Column({ type: "int", nullable: true })
    linkedId?: number;

    @Column({ type: "text", default: "primary" })
    linkPrecedence!: "secondary" | "primary";

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ type: "datetime", nullable: true })
    deletedAt?: Date;
}
