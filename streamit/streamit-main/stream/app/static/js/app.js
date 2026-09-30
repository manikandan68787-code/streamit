// State Management
const state = {
    requests: [],
    tasks: [],
    requestCounter: 1000,
    taskCounter: 1000
};

// DOM Elements
const views = document.querySelectorAll('.view-section');
const navLinks = document.querySelectorAll('.nav-links li');
const pageTitle = document.getElementById('page-title');
const btnOrderNow = document.getElementById('btn-order-now');
const toastContainer = document.getElementById('toast-container');
const approvalsTableBody = document.getElementById('approvals-table-body');
const tasksContainer = document.getElementById('tasks-container');

// Badge Elements
const pendingCountBadge = document.getElementById('pending-count');
const taskCountBadge = document.getElementById('task-count');
const kbOpenCount = document.getElementById('kb-open-count');

// Navigation Logic
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Remove active from all
        navLinks.forEach(l => l.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));
        
        // Add active to clicked
        link.classList.add('active');
        const viewId = link.getAttribute('data-view');
        document.getElementById(`view-${viewId}`).classList.add('active');
        
        // Update Title
        pageTitle.innerText = link.querySelector('span').innerText;
    });
});

// Quantity Logic (Just visual)
const qtyInput = document.getElementById('order-qty');
const btnMinus = document.querySelector('.qty-btn.minus');
const btnPlus = document.querySelector('.qty-btn.plus');

btnMinus.addEventListener('click', () => {
    let val = parseInt(qtyInput.value);
    if(val > 1) qtyInput.value = val - 1;
    updateTotal();
});

btnPlus.addEventListener('click', () => {
    let val = parseInt(qtyInput.value);
    if(val < 5) qtyInput.value = val + 1;
    updateTotal();
});

function updateTotal() {
    const total = 1450 * parseInt(qtyInput.value);
    document.getElementById('order-total').innerText = `$${total.toLocaleString()}.00`;
}

// Order Action
btnOrderNow.addEventListener('click', () => {
    // Generate Request ID
    state.requestCounter++;
    const reqId = `REQ00${state.requestCounter}`;
    const ritmId = `RITM00${state.requestCounter}`;
    
    // Add to state
    const newRequest = {
        reqId: reqId,
        ritmId: ritmId,
        item: 'Lenovo - Carbon x1',
        requestedBy: 'System Admin',
        date: new Date().toLocaleDateString(),
        status: 'Requested'
    };
    
    state.requests.unshift(newRequest);
    
    // UI Updates
    showToast(`Successfully ordered! ${reqId} created.`, 'success');
    updateApprovalsTable();
    updateBadges();
});

// Approvals Logic
function updateApprovalsTable() {
    const pendingReqs = state.requests.filter(r => r.status === 'Requested');
    
    if (pendingReqs.length === 0) {
        approvalsTableBody.innerHTML = `
            <tr class="empty-state">
                <td colspan="6">
                    <div class="empty-content">
                        <i class="fa-regular fa-folder-open" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                        <p>No pending approvals</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    approvalsTableBody.innerHTML = pendingReqs.map(req => `
        <tr>
            <td>
                <strong>${req.reqId}</strong><br>
                <small style="color: var(--text-muted)">${req.ritmId}</small>
            </td>
            <td>${req.item}</td>
            <td>${req.requestedBy}</td>
            <td>${req.date}</td>
            <td><span class="status-badge status-requested">Requested</span></td>
            <td>
                <button class="btn-approve" onclick="approveRequest('${req.ritmId}')"><i class="fa-solid fa-check"></i> Approve</button>
            </td>
        </tr>
    `).join('');
}

// Global function so it can be called from onclick
window.approveRequest = function(ritmId) {
    // Find request
    const reqIndex = state.requests.findIndex(r => r.ritmId === ritmId);
    if(reqIndex > -1) {
        // Update Status
        state.requests[reqIndex].status = 'Approved';
        
        // Show Toast
        showToast(`${ritmId} Approved! Automating Task...`, 'success');
        
        // AUTOMATION FLOW: Trigger task creation
        setTimeout(() => {
            createHardwareTask(state.requests[reqIndex]);
        }, 800); // Small delay to simulate flow execution
        
        // Re-render
        updateApprovalsTable();
        updateBadges();
    }
};

// Automation Flow Action
function createHardwareTask(requestData) {
    state.taskCounter++;
    const taskId = `SCTASK00${state.taskCounter}`;
    
    const newTask = {
        taskId: taskId,
        parentRitM: requestData.ritmId,
        shortDesc: 'Laptop needs to Configured',
        assignmentGroup: 'Hardware',
        priority: '4 - Low'
    };
    
    state.tasks.unshift(newTask);
    
    showToast(`Flow Executed: ${taskId} created for Hardware Team`, 'success');
    updateKanbanBoard();
    updateBadges();
}

// Hardware Team Logic
function updateKanbanBoard() {
    if (state.tasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-kanban">
                <p>No pending tasks</p>
            </div>
        `;
        return;
    }
    
    tasksContainer.innerHTML = state.tasks.map(task => `
        <div class="task-card">
            <div class="task-id">${task.taskId}</div>
            <div class="task-title">${task.shortDesc}</div>
            <div class="task-meta">
                <span><i class="fa-solid fa-link"></i> ${task.parentRitM}</span>
                <span><i class="fa-solid fa-users"></i> ${task.assignmentGroup}</span>
            </div>
        </div>
    `).join('');
}

// UI Helpers
function updateBadges() {
    const pendingCount = state.requests.filter(r => r.status === 'Requested').length;
    const taskCount = state.tasks.length;
    
    pendingCountBadge.innerText = pendingCount;
    pendingCountBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    
    taskCountBadge.innerText = taskCount;
    taskCountBadge.style.display = taskCount > 0 ? 'inline-block' : 'none';
    
    kbOpenCount.innerText = taskCount;
}

function showToast(message, type = 'default') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-info-circle"></i>';
    
    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Initialize Empty States
updateBadges();
