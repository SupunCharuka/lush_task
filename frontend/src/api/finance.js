// Lightweight mock API for Marketing & Finance features.
// Replace with real backend calls as needed.

const campaigns = [
  {name: 'Q4 Promo', platform: 'Facebook', duration: '2025-10 to 2025-11', budget: 1200, ROI: '120%'},
  {name: 'Search Ads', platform: 'Google', duration: '2025-09 to 2025-11', budget: 3000, ROI: '80%'}
]

const leadsByPlatform = [
  {platform: 'Facebook', leads: 120},
  {platform: 'Google', leads: 80},
  {platform: 'Email', leads: 26}
]

const income = [
  {date: '2025-11-01', source: 'Project A', amount: 5000, notes: 'Milestone 1'},
  {date: '2025-11-10', source: 'Customer Deposit', amount: 1000, notes: 'Deposit for Project B'}
]

const expenses = [
  {date: '2025-11-05', category: 'Salaries', amount: 8000, description: 'Monthly payroll'},
  {date: '2025-11-08', category: 'Software', amount: 200, description: 'SaaS subscriptions'}
]

const invoices = [
  {id: 'INV-1001', customer: 'Acme Co.', amount: 2500, due: '2025-11-15', status: 'Pending'},
  {id: 'INV-1000', customer: 'Beta LLC', amount: 4200, due: '2025-10-30', status: 'Paid'}
]

export function getCampaigns(){
  return Promise.resolve(campaigns)
}

export function getLeadsByPlatform(){
  return Promise.resolve(leadsByPlatform)
}

export function getIncome(){
  return Promise.resolve(income)
}

export function getExpenses(){
  return Promise.resolve(expenses)
}

export function getInvoices(){
  return Promise.resolve(invoices)
}

export function getSummary(){
  // simple aggregated mock
  return Promise.resolve({
    totalRevenue: income.reduce((s,i)=>s+i.amount,0),
    monthlyProfit: 12000 - expenses.reduce((s,e)=>s+e.amount,0),
    recentInvoices: invoices.map(inv=>[inv.id, inv.customer, `$${inv.amount}`, inv.status])
  })
}
