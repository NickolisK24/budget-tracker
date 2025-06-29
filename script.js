// Budget Tracker - Enhanced for Portfolio

// ==== DOM Elements ====
const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const customCategoryInput = document.getElementById('custom-category');
const customCategoryLabel = document.getElementById('custom-category-label');
const transactionList = document.getElementById('transaction-list');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expensesEl = document.getElementById('expenses');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const expenseChartCanvas = document.getElementById('expenseChart');

// ==== Accessibility: Live region for announcements ====
let liveRegion = document.getElementById('live-region');
if (!liveRegion) {
  liveRegion = document.createElement('div');
  liveRegion.id = 'live-region';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.style.position = 'absolute';
  liveRegion.style.left = '-9999px';
  document.body.appendChild(liveRegion);
}

// ==== Toast Notification ====
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#1976d2';
    toast.style.color = '#fff';
    toast.style.padding = '0.8rem 1.5rem';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '1rem';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    toast.style.zIndex = '9999';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 1800);
}

// ==== Data Storage ====
let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

// ==== Chart.js Setup ====
let expenseChart;
function updateExpenseChart() {
  const expenseData = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expenseData[t.category] = (expenseData[t.category] || 0) + t.amount;
    });
  const categories = Object.keys(expenseData);
  const data = Object.values(expenseData);

  if (expenseChart) expenseChart.destroy();
  expenseChart = new Chart(expenseChartCanvas, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        data,
        backgroundColor: [
          '#e57373', '#64b5f6', '#81c784', '#ffd54f', '#ba68c8', '#ffb74d', '#4db6ac', '#f06292'
        ],
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

// ==== Render Transactions ====
function renderTransactions() {
  transactionList.innerHTML = '';
  transactions.forEach((t, idx) => {
    const li = document.createElement('li');
    li.className = t.type;
    li.innerHTML = `
      <span>
        <strong>${t.description}</strong> 
        <small>(${t.category})</small>
      </span>
      <span>
        ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
        <button aria-label="Delete transaction" data-idx="${idx}" title="Delete">&times;</button>
      </span>
    `;
    transactionList.appendChild(li);
  });
}

// ==== Update Summary ====
function updateSummary() {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  balanceEl.textContent = (income - expenses).toFixed(2);
  incomeEl.textContent = income.toFixed(2);
  expensesEl.textContent = expenses.toFixed(2);
}

// ==== Save to LocalStorage ====
function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// ==== Add Transaction ====
form.addEventListener('submit', e => {
  e.preventDefault();
  let category = categoryInput.value;
  if (category === 'Custom') {
    category = customCategoryInput.value.trim() || 'Custom';
  }
  const transaction = {
    description: descriptionInput.value.trim(),
    amount: parseFloat(amountInput.value),
    type: typeInput.value,
    category
  };
  transactions.push(transaction);
  saveTransactions();
  renderTransactions();
  updateSummary();
  updateExpenseChart();
  showToast('Transaction added!');
  liveRegion.textContent = 'Transaction added.';
  form.reset();
  customCategoryInput.style.display = 'none';
  customCategoryLabel.style.display = 'none';
  descriptionInput.focus();
});

// ==== Delete Transaction (with confirmation) ====
transactionList.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    const idx = e.target.getAttribute('data-idx');
    if (confirm('Are you sure you want to delete this transaction?')) {
      transactions.splice(idx, 1);
      saveTransactions();
      renderTransactions();
      updateSummary();
      updateExpenseChart();
      showToast('Transaction deleted!');
      liveRegion.textContent = 'Transaction deleted.';
    }
  }
});

// ==== Custom Category Show/Hide ====
categoryInput.addEventListener('change', () => {
  if (categoryInput.value === 'Custom') {
    customCategoryInput.style.display = '';
    customCategoryLabel.style.display = '';
    customCategoryInput.focus();
  } else {
    customCategoryInput.style.display = 'none';
    customCategoryLabel.style.display = 'none';
  }
});

// ==== Dark Mode Toggle with Persistence ====
function setDarkMode(on) {
  document.body.classList.toggle('dark-mode', on);
  localStorage.setItem('darkMode', on ? '1' : '0');
  darkModeToggle.textContent = on ? '☀️' : '🌙';
  darkModeToggle.setAttribute('aria-label', on ? 'Switch to light mode' : 'Switch to dark mode');
}
darkModeToggle.addEventListener('click', () => {
  setDarkMode(!document.body.classList.contains('dark-mode'));
});
window.addEventListener('DOMContentLoaded', () => {
  setDarkMode(localStorage.getItem('darkMode') === '1');
  renderTransactions();
  updateSummary();
  updateExpenseChart();
}); 
