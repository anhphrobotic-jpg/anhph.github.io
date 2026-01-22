// PDF Viewer Component with Annotation Support
const PDFViewer = {
    pdfDoc: null,
    currentPage: 1,
    pageCount: 0,
    scale: 1.2,
    paperId: null,
    annotations: [],
    
    async load(paperId) {
        console.log('=== PDFViewer.load START ===');
        console.log('paperId:', paperId);
        
        this.paperId = paperId;
        const paper = DataStore.getPaper(paperId);
        console.log('Found paper:', paper);
        console.log('Paper has pdfPath:', paper?.pdfPath);
        console.log('Paper has pdfData:', paper?.pdfData ? 'Yes (length: ' + paper.pdfData.length + ')' : 'No');
        
        if (!paper || (!paper.pdfPath && !paper.hasPDF)) {
            console.error('Paper or PDF not found');
            const container = document.getElementById('pdfViewerContainer');
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>PDF Not Available</h3>
                        <p>No PDF file has been uploaded for this paper yet.</p>
                        <p class="text-sm text-secondary">You can edit the paper to upload a PDF file.</p>
                    </div>
                `;
            }
            return;
        }
        
        const container = document.getElementById('pdfViewerContainer');
        console.log('Container found:', !!container);
        if (!container) {
            console.error('pdfViewerContainer not found!');
            return;
        }
        
        container.innerHTML = `
            <div class="pdf-toolbar">
                <button class="btn btn-sm" id="pdfPrevPage">← Previous</button>
                <span id="pageInfo">Page 1 of ...</span>
                <button class="btn btn-sm" id="pdfNextPage">Next →</button>
                <button class="btn btn-sm" id="pdfZoomOut">-</button>
                <span id="zoomInfo">120%</span>
                <button class="btn btn-sm" id="pdfZoomIn">+</button>
            </div>
            <div class="pdf-annotations-toolbar">
                <button class="btn btn-sm" id="pdfHighlight">🖍️ Highlight</button>
                <button class="btn btn-sm" id="pdfNote">📝 Note</button>
                <button class="btn btn-sm" id="pdfSave">💾 Save</button>
            </div>
            <div class="pdf-canvas-wrapper">
                <canvas id="pdfCanvas"></canvas>
                <canvas id="annotationCanvas" style="position: absolute; top: 0; left: 0; pointer-events: auto;"></canvas>
            </div>
        `;
        
        // Load annotations from storage - ensure it's an array
        this.annotations = Storage.getAnnotations(paperId) || [];
        
        console.log('About to load PDF...');
        console.log('pdfPath available:', !!paper.pdfPath);
        console.log('hasPDF flag:', !!paper.hasPDF);
        console.log('pdfjsLib available:', typeof pdfjsLib !== 'undefined');
        
        // Check if paper has PDF in IndexedDB
        let pdfSource = paper.pdfPath;
        if (paper.hasPDF) {
            console.log('Loading PDF from IndexedDB...');
            const pdfRecord = await PDFStorage.getPDF(paperId);
            if (pdfRecord && pdfRecord.pdfData) {
                pdfSource = pdfRecord.pdfData;
                console.log('PDF loaded from IndexedDB, length:', pdfSource.length);
            }
        }
        
        try {
            // Check if PDF.js is loaded
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js library not loaded. Please check internet connection.');
            }
            
            console.log('Loading PDF from source, length:', pdfSource?.length);
            
            const loadingTask = pdfjsLib.getDocument(pdfSource);
            this.pdfDoc = await loadingTask.promise;
            this.pageCount = this.pdfDoc.numPages;
            this.currentPage = 1;
            
            console.log('PDF loaded successfully, pages:', this.pageCount);
            
            await this.renderPage();
            this.initAnnotationCanvas();
            
            // Setup button event listeners after PDF is loaded
            this.setupButtonListeners();
        } catch (error) {
            console.error('Error loading PDF:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Cannot load PDF</h3>
                    <p>Unable to load PDF file</p>
                    <p class="text-sm text-secondary">Error: ${error.message}</p>
                </div>
            `;
        }
    },
    
    setupButtonListeners() {
        console.log('Setting up PDF viewer button listeners...');
        const prevBtn = document.getElementById('pdfPrevPage');
        const nextBtn = document.getElementById('pdfNextPage');
        const zoomInBtn = document.getElementById('pdfZoomIn');
        const zoomOutBtn = document.getElementById('pdfZoomOut');
        const highlightBtn = document.getElementById('pdfHighlight');
        const noteBtn = document.getElementById('pdfNote');
        const saveBtn = document.getElementById('pdfSave');
        
        console.log('Found buttons:', { prevBtn: !!prevBtn, nextBtn: !!nextBtn, zoomInBtn: !!zoomInBtn, zoomOutBtn: !!zoomOutBtn });
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                console.log('Previous page clicked');
                this.previousPage();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                console.log('Next page clicked');
                this.nextPage();
            });
        }
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                console.log('Zoom in clicked');
                this.zoomIn();
            });
        }
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                console.log('Zoom out clicked');
                this.zoomOut();
            });
        }
        if (highlightBtn) highlightBtn.addEventListener('click', () => this.setAnnotationMode('highlight'));
        if (noteBtn) noteBtn.addEventListener('click', () => this.setAnnotationMode('note'));
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveAnnotations());
        
        console.log('PDF viewer buttons initialized successfully');
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
        const paper = DataStore.getPaper(paperId);
        if (!paper || !paper.pdfPath) {
            UI.showToast('PDF not available', 'error');
            return;
        }
        
        // Open PDF in browser's native PDF viewer
        window.open(paper.pdfPath, '_blank');
    }
};
