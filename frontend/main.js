import './style.css';
import { setupCounter } from './counter.js';

let salaryRecords = [];

document.addEventListener("DOMContentLoaded", () => {
  loadRecords();

  const form = document.getElementById("salaryForm");
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData(form);
    const newRecord = {
      paymentType: formData.get("paymentType"),
      amount: parseFloat(formData.get("amount")),
      paymentTo: formData.get("paymentTo"),
      spentDate: formData.get("spentDate"),
      paymentThrough: formData.get("paymentThrough")
    };

    // Send to backend
    await fetch('/api/salaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    });

    form.reset();
    loadRecords(); // Refresh the dashboard
  });
});

async function loadRecords() {
  const res = await fetch('/api/salaries');
  salaryRecords = await res.json();
  updateTable();
  updateStats();
}

function updateTable() {
  const tableBody = document.querySelector("#recordTable tbody");
  tableBody.innerHTML = "";

  salaryRecords.forEach((record) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.paymentType}</td>
      <td>${record.amount}</td>
      <td>${record.paymentTo}</td>
      <td>${record.spentDate}</td>
      <td>${record.paymentThrough}</td>
      <td><button onclick="deleteRecord(${record.id})">Delete</button></td>
    `;
    tableBody.appendChild(row);
  });
}

window.deleteRecord = async function (id) {
  await fetch(`/api/salaries/${id}`, { method: 'DELETE' });
  loadRecords();
};

function updateStats() {
  const totalAmount = salaryRecords.reduce((sum, record) => sum + record.amount, 0);
  const highest = Math.max(...salaryRecords.map(r => r.amount));
  const lowest = Math.min(...salaryRecords.map(r => r.amount));

  document.getElementById("totalAmount").textContent = totalAmount.toFixed(2);
  document.getElementById("highestAmount").textContent = highest.toFixed(2);
  document.getElementById("lowestAmount").textContent = lowest.toFixed(2);
}
