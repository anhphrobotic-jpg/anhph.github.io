// ===================================
// UI Module - UI Helpers & Components
// ===================================

const UI = {
    // ===================================
    // Theme Management
    // ===================================

    initTheme() {
        const savedTheme = Storage.getTheme();
        this.setTheme(savedTheme);
        this.updateThemeIcon(savedTheme);
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.setTheme(newTheme);
        Storage.saveTheme(newTheme);
        this.updateThemeIcon(newTheme);
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    },

    updateThemeIcon(theme) {
        const icons = document.querySelectorAll('.theme-icon');
        icons.forEach(icon => {
            icon.textContent = theme === 'light' ? '🌙' : '☀️';
        });
    },

    // ===================================
    // Modal Management
    // ===================================

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    },

    // ===================================
    // Toast Notifications
    // ===================================

    showToast(message, type = 'success', duration = 3000) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        // Remove existing classes
        toast.className = 'toast';
        
        // Add type class
        if (type) {
            toast.classList.add(type);
        }

        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },

    // ===================================
    // Date Formatting
    // ===================================

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    },

    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // ===================================
    // Markdown Parser (Simple)
    // ===================================

    parseMarkdown(text) {
        if (!text) return '';

        let html = text;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Code inline
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');

        // Code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Unordered lists
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Line breaks
        html = html.replace(/\n/g, '<br>');

        return html;
    },

    // ===================================
    // Confirmation Dialog
    // ===================================

    confirm(message, callback) {
        if (window.confirm(message)) {
            callback();
        }
    },

    // ===================================
    // Debounce Function
    // ===================================

    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // ===================================
    // Form Helpers
    // ===================================

    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    },

    getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    },

    // ===================================
    // Empty State Management
    // ===================================

    showEmptyState(containerId, emptyStateId) {
        const container = document.getElementById(containerId);
        const emptyState = document.getElementById(emptyStateId);

        if (container) {
            container.style.display = 'none';
        }
        if (emptyState) {
            emptyState.style.display = 'block';
        }
    },

    hideEmptyState(containerId, emptyStateId) {
        const container = document.getElementById(containerId);
        const emptyState = document.getElementById(emptyStateId);

        if (container) {
            container.style.display = '';
        }
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    },

    // ===================================
    // Export / Import Helpers
    // ===================================

    downloadJSON(data, filename) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    triggerFileInput(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            input.click();
        }
    },

    readJSONFile(file, callback) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                callback(content);
            } catch (error) {
                this.showToast('Error reading file: ' + error.message, 'error');
            }
        };

        reader.onerror = () => {
            this.showToast('Failed to read file', 'error');
        };

        reader.readAsText(file);
    },

    // ===================================
    // Animation Helpers
    // ===================================

    fadeIn(element, duration = 200) {
        element.style.opacity = 0;
        element.style.display = 'block';

        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            element.style.opacity = Math.min(progress / duration, 1);

            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    },

    fadeOut(element, duration = 200, callback) {
        element.style.opacity = 1;

        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            element.style.opacity = 1 - Math.min(progress / duration, 1);

            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                if (callback) callback();
            }
        };

        requestAnimationFrame(animate);
    },

    // ===================================
    // Clipboard
    // ===================================

    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    this.showToast('Copied to clipboard!', 'success');
                })
                .catch((err) => {
                    console.error('Failed to copy:', err);
                    this.fallbackCopyToClipboard(text);
                });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    },

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            this.showToast('Copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy:', err);
            this.showToast('Failed to copy', 'error');
        }

        document.body.removeChild(textArea);
    },

    // ===================================
    // Loading State
    // ===================================

    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('loading');
            element.disabled = true;
        }
    },

    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('loading');
            element.disabled = false;
        }
    },

    // ===================================
    // Keyboard Shortcuts
    // ===================================

    shortcuts: {},

    registerShortcut(key, callback) {
        this.shortcuts[key] = callback;
    },

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + key combinations
            if (e.ctrlKey || e.metaKey) {
                const key = e.key.toLowerCase();
                const shortcutKey = `ctrl+${key}`;
                
                if (this.shortcuts[shortcutKey]) {
                    e.preventDefault();
                    this.shortcuts[shortcutKey]();
                }
            }

            // Escape key
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
};

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    UI.initTheme();
    UI.initKeyboardShortcuts();

    // Setup theme toggle buttons
    const themeToggles = document.querySelectorAll('#themeToggle');
    themeToggles.forEach(btn => {
        btn.addEventListener('click', () => UI.toggleTheme());
    });

    // Close modals on backdrop click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            UI.closeAllModals();
        }
    });
});
