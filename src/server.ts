import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { dataSource } from './config/database';
import routes from './routes';
import dotenv from 'dotenv';

dotenv.config();

dataSource.connect()
    .then(() => {
        console.log("Connected to SQLite database");

        const app = express();
        
        app.use(bodyParser.json());

        app.use('/', routes);

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
