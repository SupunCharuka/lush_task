import express from 'express';
import cors from 'cors';
import devAuth from './middleware/auth.js';
import campaignsRouter from './routes/campaigns.js'
import incomesRouter from './routes/incomes.js'
import expensesRouter from './routes/expenses.js'
import invoicesRouter from './routes/invoices.js'
import metricsRouter from './routes/metrics.js'
import reportsRouter from './routes/reports.js'
import usersRouter from './routes/users.js'
import rolesRouter from './routes/roles.js'
import authRouter from './routes/auth.js'

const app = express();

app.use(express.json());

// Lightweight dev auth: sets req.user when Authorization header contains a user id
app.use(devAuth)

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(
    cors({
        origin: [frontendUrl],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
    })
)

// API routes
app.use('/api', campaignsRouter)
app.use('/api', incomesRouter)
app.use('/api', expensesRouter)
app.use('/api', invoicesRouter)
app.use('/api', authRouter)
app.use('/api', usersRouter)
app.use('/api', rolesRouter)
app.use('/api/metrics', metricsRouter)
app.use('/api', reportsRouter)

export default app;
