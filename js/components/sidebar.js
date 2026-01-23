// Sidebar Navigation Component
const Sidebar = {
    init() {
        this.bindEvents();
    },
    
    bindEvents() {
        // Mobile toggle
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => this.toggle());
        }
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            const menuToggle = document.getElementById('menuToggle');
            
            if (window.innerWidth <= 768 && 
                sidebar && 
                !sidebar.contains(e.target) && 
                e.target !== menuToggle &&
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Backup button
        const backupBtn = document.getElementById('backupBtn');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.showBackupMenu());
        }
    },
    
    toggle() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    },
    
    close() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    },
    
    toggleTheme() {
        const currentTheme = Storage.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        Storage.setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Update button text
        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
    },
    
    setActive(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`.nav-item[href="#${page}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    },
    
    showBackupMenu() {
        const backups = DataStore.getCloudinaryBackups();
        
        const html = `
            <div class="modal-overlay" id="backupModal">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2>☁️ Cloudinary Backup</h2>
                        <button class="close-btn" onclick="document.getElementById('backupModal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div style="margin-bottom: 20px;">
                            <button class="btn btn-primary" onclick="App.manualBackup()" style="width: 100%;">
                                💾 Backup Now
                            </button>
                            <p style="margin-top: 10px; font-size: 0.9em; color: var(--text-secondary);">
                                ✨ Auto-save: Tự động backup sau mỗi thay đổi (10s debounce) + backup định kỳ mỗi 2 phút
                            </p>
                        </div>
                        
                        <h3>Recent Backups</h3>
                        ${backups.length === 0 ? `
                            <p style="color: var(--text-secondary); text-align: center; padding: 20px;">
                                No backups yet
                            </p>
                        ` : `
                            <div class="backup-list">
                                ${backups.reverse().map(backup => `
                                    <div class="backup-item" style="padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 10px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <div>
                                                <div style="font-weight: 500;">
                                                    ${new Date(backup.timestamp).toLocaleString()}
                                                </div>
                                                <div style="font-size: 0.85em; color: var(--text-secondary);">
                                                    ${(backup.size / 1024).toFixed(2)} KB
                                                </div>
                                            </div>
                                            <div>
                                                <button class="btn btn-sm" onclick="App.restoreBackup('${backup.url}')" style="margin-right: 5px;">
                                                    ↩️ Restore
                                                </button>
                                                <button class="btn btn-sm" onclick="window.open('${backup.url}', '_blank')" title="Download">
                                                    📥
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                        
                        <div style="margin-top: 20px; padding: 15px; background: var(--bg-secondary); border-radius: 6px;">
                            <strong>ℹ️ GitHub Pages Auto-Save:</strong>
                            <ul style="margin: 10px 0 0 20px; font-size: 0.9em;">
                                <li>✅ Mọi thay đổi tự động lưu vào localStorage (ngay lập tức)</li>
                                <li>☁️ Auto-backup lên Cloudinary sau 10 giây không có thay đổi</li>
                                <li>⏰ Backup định kỳ mỗi 2 phút (safety net)</li>
                                <li>💾 Backup khi đóng trình duyệt</li>
                                <li>↩️ Click "Restore" để khôi phục từ bản backup</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('backupModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', html);
        
        // Close on overlay click
        document.getElementById('backupModal').addEventListener('click', (e) => {
            if (e.target.id === 'backupModal') {
                e.target.remove();
            }
        });
