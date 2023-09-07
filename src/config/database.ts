import { DataSource } from "typeorm";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectDB = new DataSource({
    type: "sqlite",
    database: process.env.DATABASE_NAME as string,
    logging: false,
    synchronize: false,
    entities: ["./src/Entities/**/*.ts"],
});

connectDB
    .initialize()
    .then(() => {
        console.log(`Data Source has been initialized`);
    })
    .catch((err) => {
        console.error(`Data Source initialization error`, err);
    });

export default connectDB;
