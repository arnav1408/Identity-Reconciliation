import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { dataSource } from './config/database'; // Updated path according to your structure.
import routes from './routes';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

// Initialize the database connection
dataSource.connect() // Using `connect()` method to establish the connection.
    .then(() => {
        console.log("Connected to SQLite database");

        const app = express();
        
        // Middleware
        app.use(bodyParser.json());

        // Routes
        app.use('/', routes);

        // Error handling middleware
        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.error(err.stack);
            res.status(500).send('Internal Server Error');
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(error => console.log("TypeORM connection error: ", error));
