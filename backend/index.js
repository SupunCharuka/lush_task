import express from 'express';
import { PORT, mongoDBURL } from './config.js';
import mongoose from 'mongoose';
import cors from 'cors';
import campaignsRouter from './routes/campaigns.js'
import incomesRouter from './routes/incomes.js'
import expensesRouter from './routes/expenses.js'

const app = express();

app.use(express.json());

app.use(
    cors({
        origin: ['http://localhost:5173'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type'],
    })
)

// API routes
app.use('/api', campaignsRouter)
app.use('/api', incomesRouter)
app.use('/api', expensesRouter)



mongoose
    .connect(mongoDBURL)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }).catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });