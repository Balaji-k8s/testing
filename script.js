// Ticket Tracking System JavaScript

class TicketTracker {
    constructor() {
        this.tickets = this.loadTickets();
        this.currentFilter = {
            status: '',
            priority: '',
            assignee: '',
            sortBy: 'created'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.updateAssigneeFilter();
        this.setupFileUpload();
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Ticket Form
        document.getElementById('ticketForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTicket();
        });

        // Dashboard Filters
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilter.status = e.target.value;
            this.updateDashboard();
        });

        document.getElementById('priorityFilter').addEventListener('change', (e) => {
            this.currentFilter.priority = e.target.value;
            this.updateDashboard();
        });

        document.getElementById('assigneeFilter').addEventListener('change', (e) => {
            this.currentFilter.assignee = e.target.value;
            this.updateDashboard();
        });

        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.currentFilter.sortBy = e.target.value;
            this.updateDashboard();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Reports
        document.getElementById('generateReport').addEventListener('click', () => {
            this.generateReport();
        });

        document.getElementById('exportReport').addEventListener('click', () => {
            this.exportReport();
        });

        // Modal
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('updateTicket').addEventListener('click', () => {
            this.updateTicketModal();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('ticketModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    // Navigation
    switchSection(sectionName) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        // Update dashboard when switching to it
        if (sectionName === 'dashboard') {
            this.updateDashboard();
        }
    }

    // Ticket Creation
    createTicket() {
        const formData = new FormData(document.getElementById('ticketForm'));
        const files = document.getElementById('fileUpload').files;
        
        const ticket = {
            id: this.generateId(),
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            assignee: formData.get('assignee'),
            category: formData.get('category') || 'other',
            status: 'open',
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            files: this.handleFileUpload(files),
            comments: []
        };

        this.tickets.push(ticket);
        this.saveTickets();
        this.updateDashboard();
        this.updateAssigneeFilter();
        
        // Reset form
        document.getElementById('ticketForm').reset();
        
        // Show success message
        this.showMessage('Ticket created successfully!', 'success');
        
        // Switch to dashboard
        this.switchSection('dashboard');
    }

    // File Upload Handling
    setupFileUpload() {
        const fileInput = document.getElementById('fileUpload');
        const fileArea = document.createElement('div');
        fileArea.className = 'file-upload-area';
        fileArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Drag and drop files here or click to browse</p>
            <small>Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF</small>
        `;

        fileInput.parentNode.insertBefore(fileArea, fileInput);
        fileInput.style.display = 'none';

        fileArea.addEventListener('click', () => fileInput.click());
        fileArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileArea.classList.add('dragover');
        });
        fileArea.addEventListener('dragleave', () => {
            fileArea.classList.remove('dragover');
        });
        fileArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileArea.classList.remove('dragover');
            fileInput.files = e.dataTransfer.files;
            this.updateFileDisplay();
        });

        fileInput.addEventListener('change', () => {
            this.updateFileDisplay();
        });
    }

    updateFileDisplay() {
        const files = document.getElementById('fileUpload').files;
        const fileArea = document.querySelector('.file-upload-area');
        
        if (files.length > 0) {
            let fileList = '<div class="uploaded-files">';
            Array.from(files).forEach(file => {
                fileList += `
                    <div class="file-item">
                        <i class="fas fa-file"></i>
                        <span>${file.name}</span>
                        <small>(${this.formatFileSize(file.size)})</small>
                    </div>
                `;
            });
            fileList += '</div>';
            fileArea.innerHTML = fileList;
        } else {
            fileArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag and drop files here or click to browse</p>
                <small>Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF</small>
            `;
        }
    }

    handleFileUpload(files) {
        const fileData = [];
        Array.from(files).forEach(file => {
            fileData.push({
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            });
        });
        return fileData;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Dashboard Management
    updateDashboard() {
        const filteredTickets = this.getFilteredTickets();
        this.displayTickets(filteredTickets);
        this.updateStats();
    }

    getFilteredTickets() {
        let filtered = [...this.tickets];

        // Apply filters
        if (this.currentFilter.status) {
            filtered = filtered.filter(ticket => ticket.status === this.currentFilter.status);
        }
        if (this.currentFilter.priority) {
            filtered = filtered.filter(ticket => ticket.priority === this.currentFilter.priority);
        }
        if (this.currentFilter.assignee) {
            filtered = filtered.filter(ticket => ticket.assignee === this.currentFilter.assignee);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.currentFilter.sortBy) {
                case 'created':
                    return new Date(b.created) - new Date(a.created);
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'status':
                    return a.status.localeCompare(b.status);
                case 'assignee':
                    return a.assignee.localeCompare(b.assignee);
                default:
                    return 0;
            }
        });

        return filtered;
    }

    displayTickets(tickets) {
        const ticketsList = document.getElementById('ticketsList');
        
        if (tickets.length === 0) {
            ticketsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-ticket-alt"></i>
                    <h3>No tickets found</h3>
                    <p>Try adjusting your filters or create a new ticket.</p>
                </div>
            `;
            return;
        }

        ticketsList.innerHTML = tickets.map(ticket => `
            <div class="ticket-item" onclick="ticketTracker.openTicketModal('${ticket.id}')">
                <div class="ticket-info">
                    <div class="ticket-title">${ticket.title}</div>
                    <div class="ticket-meta">
                        <span class="ticket-status ${ticket.status}">${ticket.status.replace('-', ' ')}</span>
                        <span class="ticket-priority ${ticket.priority}">${ticket.priority}</span>
                        <span><i class="fas fa-user"></i> ${ticket.assignee}</span>
                        <span><i class="fas fa-calendar"></i> ${this.formatDate(ticket.created)}</span>
                        ${ticket.category ? `<span><i class="fas fa-tag"></i> ${ticket.category}</span>` : ''}
                        ${ticket.files.length > 0 ? `<span><i class="fas fa-paperclip"></i> ${ticket.files.length} file(s)</span>` : ''}
                    </div>
                </div>
                <div class="ticket-actions">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const stats = {
            open: this.tickets.filter(t => t.status === 'open').length,
            inProgress: this.tickets.filter(t => t.status === 'in-progress').length,
            resolved: this.tickets.filter(t => t.status === 'resolved').length,
            closed: this.tickets.filter(t => t.status === 'closed').length
        };

        document.getElementById('openTickets').textContent = stats.open;
        document.getElementById('inProgressTickets').textContent = stats.inProgress;
        document.getElementById('resolvedTickets').textContent = stats.resolved;
        document.getElementById('closedTickets').textContent = stats.closed;
    }

    updateAssigneeFilter() {
        const assigneeFilter = document.getElementById('assigneeFilter');
        const assignees = [...new Set(this.tickets.map(ticket => ticket.assignee))].sort();
        
        assigneeFilter.innerHTML = '<option value="">All Assignees</option>' +
            assignees.map(assignee => `<option value="${assignee}">${assignee}</option>`).join('');
    }

    clearFilters() {
        this.currentFilter = {
            status: '',
            priority: '',
            assignee: '',
            sortBy: 'created'
        };
        
        document.getElementById('statusFilter').value = '';
        document.getElementById('priorityFilter').value = '';
        document.getElementById('assigneeFilter').value = '';
        document.getElementById('sortBy').value = 'created';
        
        this.updateDashboard();
    }

    // Modal Management
    openTicketModal(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        document.getElementById('modalTitle').textContent = ticket.title;
        document.getElementById('modalContent').innerHTML = this.generateTicketDetails(ticket);
        document.getElementById('ticketModal').style.display = 'block';
        
        // Store current ticket ID for updates
        document.getElementById('updateTicket').dataset.ticketId = ticketId;
    }

    generateTicketDetails(ticket) {
        return `
            <div class="ticket-details">
                <div class="detail-section">
                    <h4>Description</h4>
                    <p>${ticket.description}</p>
                </div>
                
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Status:</label>
                        <select id="modalStatus" class="form-control">
                            <option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Open</option>
                            <option value="in-progress" ${ticket.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                            <option value="closed" ${ticket.status === 'closed' ? 'selected' : ''}>Closed</option>
                        </select>
                    </div>
                    
                    <div class="detail-item">
                        <label>Priority:</label>
                        <select id="modalPriority" class="form-control">
                            <option value="low" ${ticket.priority === 'low' ? 'selected' : ''}>Low</option>
                            <option value="medium" ${ticket.priority === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="high" ${ticket.priority === 'high' ? 'selected' : ''}>High</option>
                        </select>
                    </div>
                    
                    <div class="detail-item">
                        <label>Assignee:</label>
                        <input type="text" id="modalAssignee" class="form-control" value="${ticket.assignee}">
                    </div>
                    
                    <div class="detail-item">
                        <label>Category:</label>
                        <select id="modalCategory" class="form-control">
                            <option value="bug" ${ticket.category === 'bug' ? 'selected' : ''}>Bug</option>
                            <option value="feature" ${ticket.category === 'feature' ? 'selected' : ''}>Feature Request</option>
                            <option value="support" ${ticket.category === 'support' ? 'selected' : ''}>Support</option>
                            <option value="maintenance" ${ticket.category === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                            <option value="other" ${ticket.category === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Timeline</h4>
                    <div class="timeline">
                        <div class="timeline-item">
                            <i class="fas fa-plus-circle"></i>
                            <div>
                                <strong>Created</strong>
                                <span>${this.formatDate(ticket.created)}</span>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <i class="fas fa-edit"></i>
                            <div>
                                <strong>Last Updated</strong>
                                <span>${this.formatDate(ticket.updated)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${ticket.files.length > 0 ? `
                    <div class="detail-section">
                        <h4>Attached Files</h4>
                        <div class="file-list">
                            ${ticket.files.map(file => `
                                <div class="file-item">
                                    <i class="fas fa-file"></i>
                                    <span>${file.name}</span>
                                    <small>(${this.formatFileSize(file.size)})</small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="detail-section">
                    <h4>Add Comment</h4>
                    <textarea id="newComment" class="form-control" rows="3" placeholder="Add a comment..."></textarea>
                    <button type="button" class="btn btn-primary" onclick="ticketTracker.addComment('${ticket.id}')">
                        <i class="fas fa-comment"></i> Add Comment
                    </button>
                </div>
                
                ${ticket.comments.length > 0 ? `
                    <div class="detail-section">
                        <h4>Comments</h4>
                        <div class="comments-list">
                            ${ticket.comments.map(comment => `
                                <div class="comment-item">
                                    <div class="comment-header">
                                        <strong>${comment.author}</strong>
                                        <span>${this.formatDate(comment.timestamp)}</span>
                                    </div>
                                    <div class="comment-content">${comment.content}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    updateTicketModal() {
        const ticketId = document.getElementById('updateTicket').dataset.ticketId;
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        // Update ticket data
        ticket.status = document.getElementById('modalStatus').value;
        ticket.priority = document.getElementById('modalPriority').value;
        ticket.assignee = document.getElementById('modalAssignee').value;
        ticket.category = document.getElementById('modalCategory').value;
        ticket.updated = new Date().toISOString();

        this.saveTickets();
        this.updateDashboard();
        this.updateAssigneeFilter();
        this.closeModal();
        
        this.showMessage('Ticket updated successfully!', 'success');
    }

    addComment(ticketId) {
        const commentText = document.getElementById('newComment').value.trim();
        if (!commentText) return;

        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        const comment = {
            id: this.generateId(),
            content: commentText,
            author: 'Current User', // In a real app, this would be the logged-in user
            timestamp: new Date().toISOString()
        };

        ticket.comments.push(comment);
        ticket.updated = new Date().toISOString();
        
        this.saveTickets();
        
        // Refresh modal content
        document.getElementById('modalContent').innerHTML = this.generateTicketDetails(ticket);
        document.getElementById('newComment').value = '';
        
        this.showMessage('Comment added successfully!', 'success');
    }

    closeModal() {
        document.getElementById('ticketModal').style.display = 'none';
    }

    // Reports Generation
    generateReport() {
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = '<div class="loading"></div> Generating report...';

        setTimeout(() => {
            const report = this.calculateKPIs();
            reportContent.innerHTML = this.generateReportHTML(report);
        }, 1000);
    }

    calculateKPIs() {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const recentTickets = this.tickets.filter(ticket => 
            new Date(ticket.created) >= thirtyDaysAgo
        );

        const resolvedTickets = this.tickets.filter(ticket => 
            ticket.status === 'resolved' || ticket.status === 'closed'
        );

        // Calculate resolution times
        const resolutionTimes = resolvedTickets.map(ticket => {
            const created = new Date(ticket.created);
            const updated = new Date(ticket.updated);
            return Math.ceil((updated - created) / (1000 * 60 * 60 * 24)); // days
        });

        const avgResolutionTime = resolutionTimes.length > 0 
            ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length)
            : 0;

        // Priority distribution
        const priorityStats = {
            high: this.tickets.filter(t => t.priority === 'high').length,
            medium: this.tickets.filter(t => t.priority === 'medium').length,
            low: this.tickets.filter(t => t.priority === 'low').length
        };

        // Category distribution
        const categoryStats = this.tickets.reduce((acc, ticket) => {
            acc[ticket.category] = (acc[ticket.category] || 0) + 1;
            return acc;
        }, {});

        // Assignee workload
        const assigneeWorkload = this.tickets.reduce((acc, ticket) => {
            if (!acc[ticket.assignee]) {
                acc[ticket.assignee] = { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };
            }
            acc[ticket.assignee].total++;
            acc[ticket.assignee][ticket.status]++;
            return acc;
        }, {});

        return {
            totalTickets: this.tickets.length,
            recentTickets: recentTickets.length,
            avgResolutionTime,
            priorityStats,
            categoryStats,
            assigneeWorkload,
            resolutionTimes
        };
    }

    generateReportHTML(report) {
        return `
            <div class="report-summary">
                <h3>KPI Summary</h3>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-value">${report.totalTickets}</div>
                        <div class="metric-label">Total Tickets</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.recentTickets}</div>
                        <div class="metric-label">Last 30 Days</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${report.avgResolutionTime}</div>
                        <div class="metric-label">Avg Resolution (days)</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${Object.keys(report.assigneeWorkload).length}</div>
                        <div class="metric-label">Active Assignees</div>
                    </div>
                </div>
            </div>

            <div class="report-chart">
                <h3>Priority Distribution</h3>
                <div class="chart-container">
                    <div class="priority-bars">
                        <div class="priority-bar">
                            <div class="priority-label">High</div>
                            <div class="priority-bar-bg">
                                <div class="priority-bar-fill high" style="width: ${(report.priorityStats.high / report.totalTickets) * 100}%"></div>
                            </div>
                            <div class="priority-value">${report.priorityStats.high}</div>
                        </div>
                        <div class="priority-bar">
                            <div class="priority-label">Medium</div>
                            <div class="priority-bar-bg">
                                <div class="priority-bar-fill medium" style="width: ${(report.priorityStats.medium / report.totalTickets) * 100}%"></div>
                            </div>
                            <div class="priority-value">${report.priorityStats.medium}</div>
                        </div>
                        <div class="priority-bar">
                            <div class="priority-label">Low</div>
                            <div class="priority-bar-bg">
                                <div class="priority-bar-fill low" style="width: ${(report.priorityStats.low / report.totalTickets) * 100}%"></div>
                            </div>
                            <div class="priority-value">${report.priorityStats.low}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="report-chart">
                <h3>Category Distribution</h3>
                <div class="chart-container">
                    <div class="category-list">
                        ${Object.entries(report.categoryStats).map(([category, count]) => `
                            <div class="category-item">
                                <span class="category-name">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                                <span class="category-count">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="report-chart">
                <h3>Assignee Workload</h3>
                <div class="chart-container">
                    <div class="assignee-table">
                        <div class="table-header">
                            <div>Assignee</div>
                            <div>Total</div>
                            <div>Open</div>
                            <div>In Progress</div>
                            <div>Resolved</div>
                            <div>Closed</div>
                        </div>
                        ${Object.entries(report.assigneeWorkload).map(([assignee, stats]) => `
                            <div class="table-row">
                                <div class="assignee-name">${assignee}</div>
                                <div>${stats.total}</div>
                                <div>${stats.open}</div>
                                <div>${stats.inProgress}</div>
                                <div>${stats.resolved}</div>
                                <div>${stats.closed}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    exportReport() {
        const report = this.calculateKPIs();
        const csvContent = this.generateCSV(report);
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showMessage('Report exported successfully!', 'success');
    }

    generateCSV(report) {
        let csv = 'Ticket Tracking Report\n\n';
        csv += 'Metric,Value\n';
        csv += `Total Tickets,${report.totalTickets}\n`;
        csv += `Recent Tickets (30 days),${report.recentTickets}\n`;
        csv += `Average Resolution Time (days),${report.avgResolutionTime}\n\n`;
        
        csv += 'Priority Distribution\n';
        csv += 'Priority,Count\n';
        csv += `High,${report.priorityStats.high}\n`;
        csv += `Medium,${report.priorityStats.medium}\n`;
        csv += `Low,${report.priorityStats.low}\n\n`;
        
        csv += 'Category Distribution\n';
        csv += 'Category,Count\n';
        Object.entries(report.categoryStats).forEach(([category, count]) => {
            csv += `${category},${count}\n`;
        });
        
        return csv;
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Local Storage
    saveTickets() {
        localStorage.setItem('ticketTracker', JSON.stringify(this.tickets));
    }

    loadTickets() {
        const saved = localStorage.getItem('ticketTracker');
        return saved ? JSON.parse(saved) : [];
    }
}

// Additional CSS for report elements
const additionalStyles = `
    .ticket-details {
        max-height: 60vh;
        overflow-y: auto;
    }
    
    .detail-section {
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .detail-section:last-child {
        border-bottom: none;
    }
    
    .detail-section h4 {
        color: #2d3748;
        margin-bottom: 15px;
        font-size: 1.1rem;
    }
    
    .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .detail-item label {
        font-weight: 600;
        color: #4a5568;
        font-size: 0.9rem;
    }
    
    .form-control {
        padding: 8px 12px;
        border: 2px solid #e2e8f0;
        border-radius: 6px;
        font-size: 14px;
    }
    
    .form-control:focus {
        outline: none;
        border-color: #667eea;
    }
    
    .timeline {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .timeline-item {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .timeline-item i {
        color: #667eea;
        font-size: 1.2rem;
    }
    
    .timeline-item div {
        display: flex;
        flex-direction: column;
    }
    
    .timeline-item strong {
        color: #2d3748;
        font-size: 0.9rem;
    }
    
    .timeline-item span {
        color: #718096;
        font-size: 0.8rem;
    }
    
    .file-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .comments-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .comment-item {
        background: #f7fafc;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #667eea;
    }
    
    .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }
    
    .comment-header strong {
        color: #2d3748;
        font-size: 0.9rem;
    }
    
    .comment-header span {
        color: #718096;
        font-size: 0.8rem;
    }
    
    .comment-content {
        color: #4a5568;
        line-height: 1.5;
    }
    
    .priority-bars {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .priority-bar {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .priority-label {
        min-width: 60px;
        font-weight: 600;
        color: #4a5568;
    }
    
    .priority-bar-bg {
        flex: 1;
        height: 20px;
        background: #e2e8f0;
        border-radius: 10px;
        overflow: hidden;
    }
    
    .priority-bar-fill {
        height: 100%;
        border-radius: 10px;
        transition: width 0.3s ease;
    }
    
    .priority-bar-fill.high { background: #fed7d7; }
    .priority-bar-fill.medium { background: #feebc8; }
    .priority-bar-fill.low { background: #c6f6d5; }
    
    .priority-value {
        min-width: 30px;
        text-align: right;
        font-weight: 600;
        color: #2d3748;
    }
    
    .category-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .category-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        background: #f7fafc;
        border-radius: 6px;
    }
    
    .category-name {
        font-weight: 600;
        color: #2d3748;
        text-transform: capitalize;
    }
    
    .category-count {
        background: #667eea;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .assignee-table {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .table-header {
        display: grid;
        grid-template-columns: 1fr repeat(5, 60px);
        gap: 15px;
        padding: 10px 15px;
        background: #f7fafc;
        border-radius: 6px;
        font-weight: 600;
        color: #2d3748;
        font-size: 0.9rem;
    }
    
    .table-row {
        display: grid;
        grid-template-columns: 1fr repeat(5, 60px);
        gap: 15px;
        padding: 10px 15px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        align-items: center;
    }
    
    .assignee-name {
        font-weight: 600;
        color: #2d3748;
    }
    
    .table-row div {
        text-align: center;
        font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
        .detail-grid {
            grid-template-columns: 1fr;
        }
        
        .table-header,
        .table-row {
            grid-template-columns: 1fr;
            gap: 5px;
        }
        
        .table-header div,
        .table-row div {
            text-align: left;
        }
        
        .priority-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 5px;
        }
        
        .priority-label {
            min-width: auto;
        }
    }
`;

// Add additional styles to the page
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the application
let ticketTracker;
document.addEventListener('DOMContentLoaded', () => {
    ticketTracker = new TicketTracker();
});
