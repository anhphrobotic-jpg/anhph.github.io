// PDF Viewer Component with Annotation Support
const PDFViewer = {
    pdfDoc: null,
    currentPage: 1,
    pageCount: 0,
    scale: 1.2,
    paperId: null,
    annotations: [],
    
    async load(paperId) {
        this.paperId = paperId;
        const paper = DataStore.getPaper(paperId);
        if (!paper || !paper.pdfPath) {
            console.error('Paper or PDF path not found');
            return;
        }
        
        const container = document.getElementById('pdfViewerContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="pdf-toolbar">
                <button class="btn btn-sm" onclick="PDFViewer.previousPage()">← Previous</button>
                <span id="pageInfo">Page 1 of ...</span>
                <button class="btn btn-sm" onclick="PDFViewer.nextPage()">Next →</button>
                <button class="btn btn-sm" onclick="PDFViewer.zoomOut()">-</button>
                <span id="zoomInfo">120%</span>
                <button class="btn btn-sm" onclick="PDFViewer.zoomIn()">+</button>
            </div>
            <div class="pdf-annotations-toolbar">
                <button class="btn btn-sm" onclick="PDFViewer.setAnnotationMode('highlight')">🖍️ Highlight</button>
                <button class="btn btn-sm" onclick="PDFViewer.setAnnotationMode('note')">📝 Note</button>
                <button class="btn btn-sm" onclick="PDFViewer.saveAnnotations()">💾 Save</button>
            </div>
            <div class="pdf-canvas-wrapper">
                <canvas id="pdfCanvas"></canvas>
                <canvas id="annotationCanvas" style="position: absolute; top: 0; left: 0; pointer-events: auto;"></canvas>
            </div>
        `;
        
        // Load annotations from storage
        this.annotations = Storage.getAnnotations(paperId);
        
        try {
            const loadingTask = pdfjsLib.getDocument(paper.pdfPath);
            this.pdfDoc = await loadingTask.promise;
            this.pageCount = this.pdfDoc.numPages;
            this.currentPage = 1;
            await this.renderPage();
            this.initAnnotationCanvas();
        } catch (error) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Cannot load PDF</h3>
                    <p>Make sure ${paper.pdfPath} exists</p>
                    <p class="text-sm text-secondary">Error: ${error.message}</p>
                </div>
            `;
        }
    },
    
    async renderPage() {
        if (!this.pdfDoc) return;
        
        const page = await this.pdfDoc.getPage(this.currentPage);
        const viewport = page.getViewport({ scale: this.scale });
        
        const canvas = document.getElementById('pdfCanvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Also resize annotation canvas
        const annotationCanvas = document.getElementById('annotationCanvas');
        if (annotationCanvas) {
            annotationCanvas.height = viewport.height;
            annotationCanvas.width = viewport.width;
        }
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Update UI
        document.getElementById('pageInfo').textContent = `Page ${this.currentPage} of ${this.pageCount}`;
        document.getElementById('zoomInfo').textContent = `${Math.round(this.scale * 100)}%`;
        
        this.redrawAnnotations();
    },
    
    previousPage() {
        if (this.currentPage <= 1) return;
        this.currentPage--;
        this.renderPage();
    },
    
    nextPage() {
        if (this.currentPage >= this.pageCount) return;
        this.currentPage++;
        this.renderPage();
    },
    
    zoomIn() {
        this.scale = Math.min(this.scale + 0.2, 3.0);
        this.renderPage();
    },
    
    zoomOut() {
        this.scale = Math.max(this.scale - 0.2, 0.5);
        this.renderPage();
    },
    
    // Annotation functionality
    annotationMode: null,
    isDrawing: false,
    startX: 0,
    startY: 0,
    
    initAnnotationCanvas() {
        const canvas = document.getElementById('annotationCanvas');
        if (!canvas) return;
        
        canvas.addEventListener('mousedown', (e) => this.startAnnotation(e));
        canvas.addEventListener('mousemove', (e) => this.drawAnnotation(e));
        canvas.addEventListener('mouseup', (e) => this.endAnnotation(e));
    },
    
    setAnnotationMode(mode) {
        this.annotationMode = mode;
        const canvas = document.getElementById('annotationCanvas');
        if (canvas) {
            canvas.style.cursor = mode === 'highlight' ? 'crosshair' : 'text';
        }
    },
    
    startAnnotation(e) {
        if (!this.annotationMode) return;
        
        const rect = e.target.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        this.isDrawing = true;
    },
    
    drawAnnotation(e) {
        if (!this.isDrawing || this.annotationMode !== 'highlight') return;
        
        const canvas = document.getElementById('annotationCanvas');
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Draw temporary highlight
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(x, y);
        ctx.stroke();
    },
    
    endAnnotation(e) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        
        const rect = e.target.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;
        
        if (this.annotationMode === 'highlight') {
            this.annotations.push({
                type: 'highlight',
                page: this.currentPage,
                x1: this.startX,
                y1: this.startY,
                x2: endX,
                y2: endY,
                color: 'rgba(255, 255, 0, 0.5)'
            });
        } else if (this.annotationMode === 'note') {
            const note = prompt('Enter your note:');
            if (note) {
                this.annotations.push({
                    type: 'note',
                    page: this.currentPage,
                    x: this.startX,
                    y: this.startY,
                    text: note
                });
            }
        }
        
        this.redrawAnnotations();
    },
    
    redrawAnnotations() {
        const canvas = document.getElementById('annotationCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw annotations for current page
        this.annotations
            .filter(a => a.page === this.currentPage)
            .forEach(annotation => {
                if (annotation.type === 'highlight') {
                    ctx.strokeStyle = annotation.color;
                    ctx.lineWidth = 20;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(annotation.x1, annotation.y1);
                    ctx.lineTo(annotation.x2, annotation.y2);
                    ctx.stroke();
                } else if (annotation.type === 'note') {
                    // Draw note marker
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(annotation.x, annotation.y, 10, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = '#000';
                    ctx.font = '12px Arial';
                    ctx.fillText('📝', annotation.x - 6, annotation.y + 4);
                }
            });
    },
    
    saveAnnotations() {
        if (this.paperId) {
            Storage.setAnnotations(this.paperId, this.annotations);
            alert('Annotations saved successfully!');
        }
    },
    
    openFullscreen(paperId) {
        alert('Fullscreen PDF viewer coming soon!');
    }
};
