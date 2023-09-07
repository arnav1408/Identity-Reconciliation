import express from 'express';
import bodyParser from 'body-parser';
import connectDB from './config/database';

connectDB
    .initialize()  // this line actually might not be needed, since the `database.ts` already does the initialization. But it's here for clarity.
    .then(() => {
        console.log("Connected to SQLite database");

        const app = express();
        app.use(bodyParser.json());

        const PORT = process.env.PORT || 3000;

        app.get('/', (req, res) => {
            res.send('Identity Reconciliation Service is running!');
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(error => console.log("TypeORM connection error: ", error));
