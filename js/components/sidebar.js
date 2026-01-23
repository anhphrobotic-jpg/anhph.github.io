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
    }
};