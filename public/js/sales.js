// Admin Analytics & Sales Reporting JavaScript Handler

document.addEventListener('DOMContentLoaded', async () => {
  const kpiToday = document.getElementById('kpi-today-sales');
  const kpiMonthly = document.getElementById('kpi-monthly-sales');
  const kpiTotalRev = document.getElementById('kpi-total-revenue');
  const kpiTotalOrders = document.getElementById('kpi-total-orders');
  const kpiAOV = document.getElementById('kpi-aov');
  const kpiLowStock = document.getElementById('kpi-low-stock');

  const topProductsTable = document.getElementById('top-products-table');
  const categorySalesTable = document.getElementById('category-sales-table');
  const lowStockTable = document.getElementById('low-stock-table');

  if (!kpiToday && !topProductsTable) return;

  const authenticated = await AdminAuth.checkAuthOrRedirect();
  if (!authenticated) return;

  async function loadDashboardMetrics() {
    try {
      const res = await fetch('/api/sales/metrics', {
        headers: { 'Authorization': `Bearer ${AdminAuth.getToken()}` }
      });
      const data = await res.json();

      if (res.ok) {
        if (kpiToday) kpiToday.textContent = `$${data.todaySales.toFixed(2)}`;
        if (kpiMonthly) kpiMonthly.textContent = `$${data.monthlySales.toFixed(2)}`;
        if (kpiTotalRev) kpiTotalRev.textContent = `$${data.totalRevenue.toFixed(2)}`;
        if (kpiTotalOrders) kpiTotalOrders.textContent = data.totalOrders;
        if (kpiAOV) kpiAOV.textContent = `$${data.averageOrderValue.toFixed(2)}`;
        if (kpiLowStock) kpiLowStock.textContent = data.lowStockCount;
      }
    } catch (err) {
      console.error('Error loading KPI metrics:', err);
    }
  }

  async function loadReportingDetails() {
    try {
      const res = await fetch('/api/sales/reporting', {
        headers: { 'Authorization': `Bearer ${AdminAuth.getToken()}` }
      });
      const data = await res.json();

      if (res.ok) {
        // Render Top Performing Products
        if (topProductsTable) {
          if (data.salesByProduct.length === 0) {
            topProductsTable.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--color-text-secondary);">No sales data recorded yet.</td></tr>`;
          } else {
            topProductsTable.innerHTML = data.salesByProduct.map(p => `
              <tr>
                <td><strong>${p.name}</strong> <span style="font-size: 0.8rem; color: var(--color-text-muted);">(${p.sku})</span></td>
                <td>${p.category}</td>
                <td>${p.units_sold} units</td>
                <td style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: var(--color-gold);">$${p.total_revenue.toFixed(2)}</td>
              </tr>
            `).join('');
          }
        }

        // Render Sales by Category
        if (categorySalesTable) {
          if (data.salesByCategory.length === 0) {
            categorySalesTable.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--color-text-secondary);">No sales data recorded yet.</td></tr>`;
          } else {
            categorySalesTable.innerHTML = data.salesByCategory.map(c => `
              <tr>
                <td><strong>${c.category}</strong></td>
                <td>${c.units_sold} units</td>
                <td style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: var(--color-gold);">$${c.total_revenue.toFixed(2)}</td>
              </tr>
            `).join('');
          }
        }

        // Render Low Stock Alert Table
        if (lowStockTable) {
          if (data.lowStockProducts.length === 0) {
            lowStockTable.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #10b981;">✓ All inventory stock levels are healthy.</td></tr>`;
          } else {
            lowStockTable.innerHTML = data.lowStockProducts.map(p => `
              <tr>
                <td><strong>${p.name}</strong> (${p.sku})</td>
                <td>${p.category}</td>
                <td><span style="color: #f59e0b; font-weight: 700;">${p.quantity} left</span></td>
                <td><a href="/admin/edit-product.html?id=${p.id}" class="btn btn-outline btn-sm">Restock</a></td>
              </tr>
            `).join('');
          }
        }
      }
    } catch (err) {
      console.error('Error loading sales reporting:', err);
    }
  }

  loadDashboardMetrics();
  loadReportingDetails();
});
