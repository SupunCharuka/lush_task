import express from 'express'
import Invoice from '../models/Invoice.js'
import puppeteer from 'puppeteer'
import { sendMail } from '../utils/mail.js'
import { renderInvoiceHTML } from '../utils/invoiceRenderer.js'

const router = express.Router()

function generateInvoiceNumber() {
    // Simple timestamp-based invoice number: INV-<timestamp>-<random>
    const ts = Date.now()
    const rand = Math.floor(Math.random() * 9000) + 1000
    return `INV-${ts}-${rand}`
}

function calculateTotals(data) {
    const items = Array.isArray(data.items) ? data.items : []
    const subtotal = items.reduce((s, i) => s + (Number(i.quantity || 0) * Number(i.price || 0)), 0)
    const taxPercent = Number(data.taxPercent || 0)
    const taxAmount = +(subtotal * (taxPercent / 100))
    const discount = Number(data.discount || 0)
    const total = +(subtotal + taxAmount - discount)
    return { subtotal, taxPercent, taxAmount, discount, total }
}

// GET /api/invoices
router.get('/invoices', async (req, res) => {
    try {
        const items = await Invoice.find().sort({ createdAt: -1 })
        res.json(items)
    } catch (err) {
        res.status(500).json({ error: String(err) })
    }
})

// GET /api/invoices/:id
router.get('/invoices/:id', async (req, res) => {
    try {
        const item = await Invoice.findById(req.params.id)
        if (!item) return res.status(404).json({ error: 'Invoice not found' })
        res.json(item)
    } catch (err) {
        res.status(500).json({ error: String(err) })
    }
})

// POST /api/invoices
router.post('/invoices', async (req, res) => {
    try {
        // Auto-generate invoiceNumber if not provided
        const body = { ...req.body }
        if (!body.invoiceNumber) body.invoiceNumber = generateInvoiceNumber()

        // compute totals server-side to avoid client tampering
        const calced = calculateTotals(body)
        body.subtotal = calced.subtotal
        body.taxPercent = calced.taxPercent
        body.taxAmount = calced.taxAmount
        body.discount = calced.discount
        body.total = calced.total

        // Try save; on duplicate invoiceNumber retry once
        try {
            const invoice = new Invoice(body)
            const saved = await invoice.save()
            return res.status(201).json(saved)
        } catch (err) {
            // Duplicate key error for invoiceNumber -> regenerate and retry once
            if (err && err.code === 11000 && err.message && err.message.includes('invoiceNumber')) {
                body.invoiceNumber = generateInvoiceNumber()
                const invoice = new Invoice(body)
                const saved = await invoice.save()
                return res.status(201).json(saved)
            }
            throw err
        }
    } catch (err) {
        res.status(400).json({ error: String(err) })
    }
})

// PUT /api/invoices/:id
router.put('/invoices/:id', async (req, res) => {
    try {
        // Merge existing invoice with incoming fields, then recalculate totals
        const existing = await Invoice.findById(req.params.id)
        if (!existing) return res.status(404).json({ error: 'Invoice not found' })

        const merged = { ...existing.toObject(), ...req.body }
        const calced = calculateTotals(merged)
        merged.subtotal = calced.subtotal
        merged.taxPercent = calced.taxPercent
        merged.taxAmount = calced.taxAmount
        merged.discount = calced.discount
        merged.total = calced.total

        const updated = await Invoice.findByIdAndUpdate(req.params.id, merged, { new: true })
        res.json(updated)
    } catch (err) {
        res.status(400).json({ error: String(err) })
    }
})

// DELETE /api/invoices/:id
router.delete('/invoices/:id', async (req, res) => {
    try {
        await Invoice.findByIdAndDelete(req.params.id)
        res.json({ success: true })
    } catch (err) {
        res.status(400).json({ error: String(err) })
    }
})

// POST /api/invoices/:id/send -> generate PDF and send invoice by email
router.post('/invoices/:id/send', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' })

        const to = invoice.customerEmail || req.body.to
        if (!to) return res.status(400).json({ error: 'No recipient email found. Add `customerEmail` to invoice or provide `to` in request body.' })

        // Render HTML and generate PDF buffer
        const html = renderInvoiceHTML(invoice)
        const browser = await getBrowser()
        const page = await (await browser).newPage()
        await page.setContent(html, { waitUntil: 'networkidle0' })
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } })
        await page.close()

        // Build email
        const subject = `Invoice ${invoice.invoiceNumber}`
        const text = `Please find attached invoice ${invoice.invoiceNumber}. Total: ${invoice.total}`

        // Send email with PDF attachment
        const mailResult = await sendMail({
            to,
            subject,
            text,
            html: `<p>${text}</p>`,
            attachments: [
                { filename: `${invoice.invoiceNumber || 'invoice'}.pdf`, content: pdfBuffer }
            ]
        })

        invoice.sentAt = new Date()
        invoice.status = invoice.status || 'Sent'
        await invoice.save()

        res.json({ success: true, sentAt: invoice.sentAt, mailResult })
    } catch (err) {
        console.error('Error sending invoice email:', err)
        res.status(500).json({ error: String(err) })
    }
})

// GET /api/invoices/check-overdue -> run overdue check now (manual)
router.get('/invoices/check-overdue', async (req, res) => {
    try {
        const result = await markOverdue()
        res.json({ success: true, result })
    } catch (err) {
        res.status(500).json({ error: String(err) })
    }
})

// Reuse browser across requests (improves performance)
let browserPromise = null;
async function getBrowser() {
    if (!browserPromise) browserPromise = puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    return browserPromise;
}



router.get('/invoices/:id/pdf', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

        const html = renderInvoiceHTML(invoice);
        const browser = await getBrowser();
        const page = await (await browser).newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
        await page.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber || 'invoice'}.pdf"`);
        res.send(pdfBuffer);
    } catch (err) {
        console.error('PDF generation error:', err);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

export default router

// Helper to mark invoices as Overdue when dueDate has passed
export async function markOverdue() {
    try {
        const now = new Date()
        // Find invoices that are past due and not paid or already overdue
        const result = await Invoice.updateMany(
            { dueDate: { $lt: now }, status: { $nin: ['Paid', 'Overdue'] } },
            { $set: { status: 'Overdue' } }
        )
        return result
    } catch (err) {
        console.error('markOverdue error', err)
        throw err
    }
}

