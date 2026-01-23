// Reusable Table Component
const Table = {
    create(data, columns, options = {}) {
        const { sortable = true, filterable = true, onRowClick = null } = options;
        
        let html = `<table class="data-table">`;
        
        // Header
        html += '<thead><tr>';
        columns.forEach(col => {
            const sortClass = sortable ? 'sortable' : '';
            html += `<th class="${sortClass}" data-key="${col.key}">${col.label}</th>`;
        });
        html += '</tr></thead>';
        
        // Body
        html += '<tbody>';
        data.forEach((row, index) => {
            const rowClass = onRowClick ? 'clickable' : '';
            const rowClick = onRowClick ? `onclick="${onRowClick}(${index})"` : '';
            html += `<tr class="${rowClass}" ${rowClick}>`;
            
            columns.forEach(col => {
                const value = this.getCellValue(row, col);
                html += `<td>${value}</td>`;
            });
            
            html += '</tr>';
        });
        html += '</tbody>';
        
        html += '</table>';
        return html;
    },
    
    getCellValue(row, column) {
        let value = row[column.key];
        
        // Apply formatter if provided
        if (column.format) {
            return column.format(value, row);
        }
        
        // Default formatting
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? '✓' : '✗';
        return value;
    },
    
    sort(data, key, order = 'asc') {
        return [...data].sort((a, b) => {
            let aVal = a[key];
            let bVal = b[key];
            
            // Handle dates
            if (aVal instanceof Date || typeof aVal === 'string' && aVal.includes('-')) {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    },
    
    filter(data, filterFn) {
        return data.filter(filterFn);
    }
};
