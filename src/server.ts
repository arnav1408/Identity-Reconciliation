import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Identity Reconciliation Service is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
