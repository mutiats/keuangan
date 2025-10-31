const form = document.getElementById("transactionForm");
const table = document.getElementById("transactionTable");
const incomeDisplay = document.getElementById("income");
const expenseDisplay = document.getElementById("expense");
const balanceDisplay = document.getElementById("balance");
const monthFilter = document.getElementById("filterMonth");
const typeFilter = document.getElementById("filterType");
const ctx = document.getElementById("financeChart");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart;

// Tambah pilihan bulan di filter
function initMonths() {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  months.forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = i + 1;
    opt.textContent = m;
    monthFilter.appendChild(opt);
  });
}
initMonths();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const date = document.getElementById("date").value;
  const type = document.getElementById("type").value;
  const amount = parseInt(document.getElementById("amount").value);

  if (!date || !type || !amount) return;

  transactions.push({ date, type, amount });
  saveData();
  form.reset();
  renderTable();
});

// Render tabel + summary
function renderTable() {
  table.innerHTML = "";
  let income = 0;
  let expense = 0;

  const monthVal = monthFilter.value;
  const typeVal = typeFilter.value;

  const filtered = transactions.filter(t => {
    const month = new Date(t.date).getMonth() + 1;
    return (!monthVal || month == monthVal) && (!typeVal || t.type == typeVal);
  });

  filtered.forEach((t, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>Rp ${t.amount.toLocaleString()}</td>
      <td>
        <button class="action-btn" onclick="editTransaction(${index})">Edit</button>
        <button class="action-btn" onclick="deleteTransaction(${index})">Hapus</button>
      </td>
    `;
    table.appendChild(row);

    if (t.type === "Pemasukan") income += t.amount;
    else expense += t.amount;
  });

  const balance = income - expense;
  incomeDisplay.textContent = `Rp ${income.toLocaleString()}`;
  expenseDisplay.textContent = `Rp ${expense.toLocaleString()}`;
  balanceDisplay.textContent = `Rp ${balance.toLocaleString()}`;

  updateChart(income, expense);
}

function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function deleteTransaction(index) {
  if (confirm("Hapus transaksi ini?")) {
    transactions.splice(index, 1);
    saveData();
    renderTable();
  }
}

function editTransaction(index) {
  const t = transactions[index];
  document.getElementById("date").value = t.date;
  document.getElementById("type").value = t.type;
  document.getElementById("amount").value = t.amount;
  transactions.splice(index, 1);
  saveData();
  renderTable();
}

// Grafik interaktif
function updateChart(income, expense) {
  const data = {
    labels: ["Pemasukan", "Pengeluaran"],
    datasets: [{
      data: [income, expense],
      backgroundColor: ["#800000", "#d46a6a"]
    }]
  };

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data,
    options: {
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

monthFilter.addEventListener("change", renderTable);
typeFilter.addEventListener("change", renderTable);

renderTable();
