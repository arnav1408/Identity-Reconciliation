import { DataSource, DataSourceOptions } from "typeorm";
import { Contact } from "../Entities/Contact"; // Ensure this path is correct.
import dotenv from "dotenv";

dotenv.config();

const dataSourceOptions: DataSourceOptions = {
    type: "sqlite",
    database: process.env.DATABASE_PATH as string, // Ensure the environment variable is set and points to the right SQLite database file.
    logging: false,
    synchronize: true,
    entities: [Contact] // List all your entities here.
};

export const dataSource = new DataSource(dataSourceOptions);
