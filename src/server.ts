import express from 'express';
import bodyParser from 'body-parser';
import connectDB from './config/database';
import routes from './routes'; // importing the routes

connectDB
    .initialize()
    .then(() => {
        console.log("Connected to SQLite database");

        const app = express();
        app.use(bodyParser.json());

        app.use('/', routes);  // using the routes

        // Error Handling Middleware
        app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (res.headersSent) {
                return next(err);
            }
            console.error(err.stack);
            res.status(500).json({ message: 'Internal Server Error' });
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(error => console.log("TypeORM connection error: ", error));
