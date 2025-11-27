import express from 'express'
import Invoice from '../models/Invoice.js'
import puppeteer from 'puppeteer'

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

// POST /api/invoices/:id/send -> simulate sending invoice
router.post('/invoices/:id/send', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' })

        invoice.sentAt = new Date()
        if (!invoice.status) invoice.status = 'Pending'
        await invoice.save()

        // In a real app, integrate email / PDF generation here. For now return invoice and a simulated result.
        res.json({ success: true, sentAt: invoice.sentAt })
    } catch (err) {
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

function renderInvoiceHTML(invoice) {
    const itemsHtml = (invoice.items || []).map(it => `
    <tr>
      <td style="padding:8px;border:1px solid #eee">${it.description}</td>
      <td style="padding:8px;border:1px solid #eee;text-align:center">${it.quantity}</td>
      <td style="padding:8px;border:1px solid #eee;text-align:right">${Number(it.price).toFixed(2)}</td>
      <td style="padding:8px;border:1px solid #eee;text-align:right">${(it.quantity * it.price).toFixed(2)}</td>
    </tr>
  `).join('');

    const subtotal = invoice.subtotal ?? (invoice.items || []).reduce((s, i) => s + (i.quantity * i.price), 0);
    const taxAmount = invoice.taxAmount ?? subtotal * ((invoice.taxPercent || 0) / 100);
    const discount = invoice.discount || 0;
    const total = invoice.total ?? (subtotal + taxAmount - discount);

    return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 12px; color:#222; }
      .container { max-width: 800px; margin: 0 auto; padding: 20px; }
      .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
      .logo { font-weight:bold; font-size:18px; }
      table { width:100%; border-collapse: collapse; margin-top:12px; }
      th { text-align:left; padding:8px; background:#f5f5f5; border:1px solid #eee; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div>
         <div class="logo">My Company (Pvt) Ltd</div>
         <div>No. 15, Park Avenue, Nawala Road, Rajagiriya, Sri Lanka</div>
         <div>Hotline: +94 11 456 7890</div>
         <div>Email: support@Mycompany.com</div>
         <div>Web: www.mycompany.com</div>
        </div>
        <div>
          <div><strong>Invoice</strong></div>
          <div>${invoice.invoiceNumber}</div>
          <div>${invoice.dueDate ? new Date(invoice.dueDate).toISOString().slice(0, 10) : ''}</div>
        </div>
      </div>

      <div><strong>Bill To:</strong> ${invoice.customerName || ''}</div>

      <table>
        <thead>
          <tr><th style="width:50%">Description</th><th style="width:10%">Qty</th><th style="width:20%">Price</th><th style="width:20%">Line</th></tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="margin-top:12px; text-align:right;">
        <div>Subtotal: ${subtotal.toFixed(2)}</div>
        <div>Tax (${invoice.taxPercent || 0}%): ${taxAmount.toFixed(2)}</div>
        <div>Discount: ${discount.toFixed(2)}</div>
        <div style="font-weight:bold; margin-top:8px;">Total: ${total.toFixed(2)}</div>
      </div>
    </div>
  </body>
  </html>`;
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

