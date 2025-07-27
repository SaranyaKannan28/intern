// Global variables
let salaryRecords = [];
let filteredRecords = [];

// API Base URL - adjust this based on your backend server
const API_BASE_URL = 'http://localhost:3000';

// DOM Elements
const addSalaryBtn = document.getElementById('addSalaryBtn');
const addSalaryModal = document.getElementById('addSalaryModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const salaryForm = document.getElementById('salaryForm');
const salaryRecordsBody = document.getElementById('salaryRecordsBody');
const loadingSpinner = document.getElementById('loadingSpinner');

// Filter elements
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const paymentTypeFilter = document.getElementById('paymentTypeFilter');
const searchInput = document.getElementById('searchInput');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Initialize the application
async function initializeApp() {
    await loadSalaryRecords();
    setDefaultDates();
}

// Setup event listeners
function setupEventListeners() {
    // Modal controls
    addSalaryBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalHandler);
    cancelBtn.addEventListener('click', closeModalHandler);
    
    // Form submission
    salaryForm.addEventListener('submit', handleFormSubmit);
    
    // Filter controls
    applyFiltersBtn.addEventListener('click', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addSalaryModal) {
            closeModalHandler();
        }
    });
}

// Set default dates (current month)
function setDefaultDates() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    startDateInput.value = formatDateForInput(firstDay);
    endDateInput.value = formatDateForInput(lastDay);
}

// Format date for input field
function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

// Show loading spinner
function showLoading() {
    loadingSpinner.style.display = 'flex';
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Load salary records from backend
async function loadSalaryRecords() {
    try {
        showLoading();
        
        // Build query parameters
        const params = new URLSearchParams();
        if (startDateInput.value) params.append('startDate', startDateInput.value);
        if (endDateInput.value) params.append('endDate', endDateInput.value);
        
        const response = await fetch(`${API_BASE_URL}/api/salaries?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        salaryRecords = await response.json();
        filteredRecords = [...salaryRecords];
        
        updateTable();
        updateStatistics();
        
    } catch (error) {
        console.error('Error loading salary records:', error);
        showNotification('Error loading salary records. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Update the salary records table
function updateTable() {
    salaryRecordsBody.innerHTML = '';
    
    if (filteredRecords.length === 0) {
        salaryRecordsBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem; color: #64748b;">
                    No salary records found
                </td>
            </tr>
        `;
        return;
    }
    
    filteredRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.type || record.salaryType || 'N/A'}</td>
            <td>₹${parseFloat(record.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>${record.paidTo || 'N/A'}</td>
            <td>${formatDate(record.paidOn)}</td>
            <td>${formatPaymentMethod(record.paidThrough)}</td>
            <td>${formatDate(record.startDate)}</td>
            <td>${formatDate(record.endDate)}</td>
            <td>${record.remarks || '-'}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editRecord(${record.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteRecord(${record.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        salaryRecordsBody.appendChild(row);
    });
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Format payment method for display
function formatPaymentMethod(method) {
    if (!method) return 'N/A';
    return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Update statistics
function updateStatistics() {
    const totalAmount = filteredRecords.reduce((sum, record) => sum + parseFloat(record.amount || 0), 0);
    const recordCount = filteredRecords.length;
    const averageAmount = recordCount > 0 ? totalAmount / recordCount : 0;
    
    // Calculate monthly total (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyTotal = filteredRecords
        .filter(record => {
            const recordDate = new Date(record.paidOn);
            return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
        })
        .reduce((sum, record) => sum + parseFloat(record.amount || 0), 0);
    
    // Update DOM elements
    document.getElementById('totalSalary').textContent = `₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById('totalRecords').textContent = `${recordCount} total records`;
    document.getElementById('recordCount').textContent = recordCount;
    document.getElementById('averageAmount').textContent = `₹${averageAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById('monthlyTotal').textContent = `₹${monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

// Open modal
function openModal() {
    addSalaryModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModalHandler() {
    addSalaryModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    salaryForm.reset();
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        showLoading();
        
        const formData = new FormData(salaryForm);
        const salaryData = {
            type: formData.get('type'),
            amount: parseFloat(formData.get('amount')),
            paidTo: formData.get('paidTo'),
            paidOn: formData.get('paidOn'),
            paidThrough: formData.get('paidThrough'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            remarks: formData.get('remarks') || null
        };
        
        const response = await fetch(`${API_BASE_URL}/api/salaries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(salaryData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newRecord = await response.json();
        
        showNotification('Salary record added successfully!', 'success');
        closeModalHandler();
        await loadSalaryRecords();
        
    } catch (error) {
        console.error('Error adding salary record:', error);
        showNotification('Error adding salary record. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Apply filters
async function applyFilters() {
    await loadSalaryRecords();
    
    // Apply additional client-side filters
    let filtered = [...salaryRecords];
    
    // Filter by payment type
    if (paymentTypeFilter.value) {
        filtered = filtered.filter(record => 
            (record.type || record.salaryType || '').toLowerCase() === paymentTypeFilter.value.toLowerCase()
        );
    }
    
    // Filter by search term
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(record => 
            (record.paidTo || '').toLowerCase().includes(searchTerm) ||
            (record.remarks || '').toLowerCase().includes(searchTerm) ||
            (record.type || record.salaryType || '').toLowerCase().includes(searchTerm)
        );
    }
    
    filteredRecords = filtered;
    updateTable();
    updateStatistics();
}

// Clear filters
function clearFilters() {
    startDateInput.value = '';
    endDateInput.value = '';
    paymentTypeFilter.value = '';
    searchInput.value = '';
    
    setDefaultDates();
    loadSalaryRecords();
}

// Handle search input
function handleSearch() {
    applyFilters();
}

// Delete record
async function deleteRecord(id) {
    if (!confirm('Are you sure you want to delete this salary record?')) {
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/api/salaries/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        showNotification('Salary record deleted successfully!', 'success');
        await loadSalaryRecords();
        
    } catch (error) {
        console.error('Error deleting salary record:', error);
        showNotification('Error deleting salary record. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Edit record (placeholder - you can implement this)
function editRecord(id) {
    showNotification('Edit functionality coming soon!', 'info');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
    
    // Close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
        removeNotification(notification);
    });
}

// Remove notification
function removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export to Excel (placeholder)
document.getElementById('downloadExcelBtn').addEventListener('click', function() {
    showNotification('Excel export functionality coming soon!', 'info');
});

// Make functions globally available
window.deleteRecord = deleteRecord;
window.editRecord = editRecord;