import 'dotenv/config';
import express from 'express';
import { PORT, mongoDBURL } from './config.js';
import mongoose from 'mongoose';
import cors from 'cors';
import campaignsRouter from './routes/campaigns.js'
import incomesRouter from './routes/incomes.js'
import expensesRouter from './routes/expenses.js'
import invoicesRouter from './routes/invoices.js'
import { markOverdue } from './routes/invoices.js'
import metricsRouter from './routes/metrics.js'
import reportsRouter from './routes/reports.js'
import usersRouter from './routes/users.js'
import rolesRouter from './routes/roles.js'

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
app.use('/api', invoicesRouter)
app.use('/api', usersRouter)
app.use('/api', rolesRouter)
app.use('/api/metrics', metricsRouter)
app.use('/api', reportsRouter)



mongoose
    .connect(mongoDBURL)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            // Run overdue check at startup
            try { markOverdue().then(r => console.log('Overdue check at startup:', r)) } catch (e) { console.error('Overdue check failed at startup', e) }
            // Schedule overdue check every 12 hours
            setInterval(() => {
                try { markOverdue().then(r => console.log('Scheduled overdue check:', r)) } catch (e) { console.error('Scheduled overdue check failed', e) }
            }, 1000 * 60 * 60 * 12)
        });
    }).catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });