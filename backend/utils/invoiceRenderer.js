export function renderInvoiceHTML(invoice) {
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
