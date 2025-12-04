import 'dotenv/config';
import mongoose from 'mongoose';
import { PORT, mongoDBURL } from './config.js';
import app from './app.js';
import { markOverdue } from './routes/invoices.js'

// Connect to MongoDB and start the Express server (local/dev use)
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