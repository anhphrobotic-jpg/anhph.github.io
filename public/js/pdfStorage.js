// PDF Storage using IndexedDB for large files
const PDFStorage = {
    dbName: 'ResearchWorkspacePDFs',
    dbVersion: 1,
    storeName: 'pdfs',
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'paperId' });
                }
            };
        });
    },
    
    async savePDF(paperId, pdfData, fileName) {
        try {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                
                const request = store.put({
                    paperId: paperId,
                    pdfData: pdfData,
                    fileName: fileName,
                    savedAt: Date.now()
                });
                
                request.onsuccess = () => {
                    console.log('PDF saved to IndexedDB for paper:', paperId);
                    resolve(true);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error saving PDF:', error);
            return false;
        }
    },
    
    async getPDF(paperId) {
        try {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(paperId);
                
                request.onsuccess = () => {
                    resolve(request.result);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting PDF:', error);
            return null;
        }
    },
    
    async deletePDF(paperId) {
        try {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(paperId);
                
                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error deleting PDF:', error);
            return false;
        }
    }
};
