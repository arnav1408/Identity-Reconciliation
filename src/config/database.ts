import { DataSource, DataSourceOptions } from "typeorm";
import { Contact } from "../Entities/Contact";
import dotenv from "dotenv";

dotenv.config();

const dataSourceOptions: DataSourceOptions = {
    type: "sqlite",
    database: process.env.DATABASE_PATH as string,
    logging: false,
    synchronize: true,
    entities: [Contact]
};

export const dataSource = new DataSource(dataSourceOptions);
