import express from 'express'
import Income from '../models/Income.js'
import Expense from '../models/Expense.js'
import puppeteer from 'puppeteer'
import ExcelJS from 'exceljs'
import { requirePermission } from '../middleware/authorization.js'

const router = express.Router()

function parseDateRange(from, to) {
  let query = {}
  if (from || to) {
    query.date = {}
    if (from) query.date.$gte = new Date(from)
    if (to) query.date.$lte = new Date(to)
  }
  return query
}

// GET /api/reports/export?type=income|expense&format=pdf|excel&from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/reports/export', requirePermission('reports:read'), async (req, res) => {
  try {
    const { type = 'income', format = 'pdf', from, to } = req.query
    const Model = type === 'expense' ? Expense : Income
    const query = parseDateRange(from, to)
    const items = await Model.find(query).sort({ date: -1 })

    const totals = items.reduce((acc, it) => acc + (it.amount || 0), 0)

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet(`${type}-statement`)

      sheet.columns = [
        { header: 'Date', key: 'date', width: 18 },
        { header: 'Amount', key: 'amount', width: 15 }
      ]

      items.forEach(it => {
        sheet.addRow({ date: new Date(it.date).toLocaleDateString(), amount: it.amount })
      })

      const totalRow = sheet.addRow({ date: 'Total', amount: totals })
      totalRow.font = { bold: true }

      // format amount column
      sheet.getColumn('amount').numFmt = '$#,##0.00;[Red]-$#,##0.00'

      const buffer = await workbook.xlsx.writeBuffer()
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      const filename = `${type}-statement${from || ''}-${to || ''}.xlsx`
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      return res.send(Buffer.from(buffer))
    }

    // default to PDF
    const htmlRows = items.map(it => `
      <tr>
        <td style="padding:6px;border:1px solid #ddd">${new Date(it.date).toLocaleDateString()}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right">${Number(it.amount).toFixed(2)}</td>
      </tr>
    `).join('')

    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>${type} statement</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; padding: 20px }
            table { border-collapse: collapse; width: 100% }
            th, td { border: 1px solid #ddd; padding: 8px }
            th { background: #f4f4f4; text-align:left }
          </style>
        </head>
        <body>
          <h2>${type.charAt(0).toUpperCase() + type.slice(1)} Statement</h2>
          <p>Range: ${from || '—'} to ${to || '—'}</p>
          <table>
            <thead>
              <tr>
                <th style="padding:6px">Date</th>
                <th style="padding:6px;text-align:right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${htmlRows}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding:6px;font-weight:bold">Total</td>
                <td style="padding:6px;text-align:right;font-weight:bold">${totals.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
    await browser.close()

    res.setHeader('Content-Type', 'application/pdf')
    const filename = `${type}-statement${from || ''}-${to || ''}.pdf`
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.send(pdfBuffer)
  } catch (err) {
    console.error('Export error', err)
    res.status(500).json({ error: String(err) })
  }
})

export default router
