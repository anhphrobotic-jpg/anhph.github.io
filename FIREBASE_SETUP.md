# Firebase Storage Setup Guide

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" hoặc "Create a project"
3. Đặt tên project (vd: `research-workspace`)
4. Có thể disable Google Analytics nếu không cần
5. Click "Create project"

## Bước 2: Enable Firebase Storage

1. Trong Firebase Console, vào sidebar chọn **Storage**
2. Click "Get Started"
3. Chọn location gần bạn nhất (vd: `asia-southeast1` cho Việt Nam)
4. Giữ nguyên Security Rules mặc định (sẽ cấu hình sau)
5. Click "Done"

## Bước 3: Cấu hình Security Rules

Vào tab **Rules** trong Storage, thay bằng rules này để cho phép upload:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /papers/{paperId}/{fileName} {
      // Allow read for all
      allow read: if true;
      
      // Allow write if file is PDF and less than 50MB
      allow write: if request.resource.contentType == 'application/pdf'
                   && request.resource.size < 50 * 1024 * 1024;
    }
  }
}
```

## Bước 4: Lấy Firebase Config

1. Trong Firebase Console, click biểu tượng ⚙️ (Settings) > Project settings
2. Scroll xuống phần "Your apps"
3. Click biểu tượng `</>` (Web)
4. Đặt nickname cho app (vd: "Research Workspace Web")
5. Click "Register app"
6. Copy đoạn config có dạng:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

## Bước 5: Cấu hình trong Project

### 5.1. Sửa file `js/firebaseConfig.js`

Thay thế các giá trị `YOUR_XXX` bằng config từ Firebase Console:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

### 5.2. Enable Firebase trong `index.html`

Bỏ comment các dòng Firebase SDK:

```html
<!-- Từ: -->
<!-- 
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>
<script src="js/firebaseConfig.js"></script>
-->

<!-- Thành: -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>
<script src="js/firebaseConfig.js"></script>
```

### 5.3. Sửa `js/views/papers.js` để dùng Firebase

Thay thế function `addPaper()`:

```javascript
async addPaper() {
    const title = document.getElementById('paperTitle').value.trim();
    const authors = document.getElementById('paperAuthors').value.trim();
    
    if (!title || !authors) {
        alert('Please enter title and authors');
        return;
    }
    
    const pdfFile = document.getElementById('paperPdfFile').files[0];
    let pdfUrl = null;
    let pdfPath = null;
    let hasPDF = false;
    
    // Show loading state
    const addButton = document.querySelector('#addPaperModal .btn-primary');
    const originalText = addButton.textContent;
    addButton.textContent = 'Uploading...';
    addButton.disabled = true;
    
    if (pdfFile) {
        // Check file type
        if (pdfFile.type !== 'application/pdf') {
            alert('Please select a PDF file');
            addButton.textContent = originalText;
            addButton.disabled = false;
            return;
        }
        
        // Check file size (max 50MB)
        if (pdfFile.size > 50 * 1024 * 1024) {
            alert('PDF file is too large. Maximum size is 50MB');
            addButton.textContent = originalText;
            addButton.disabled = false;
            return;
        }
        
        try {
            // Create temporary paper ID
            const tempPaperId = 'paper_' + Date.now();
            
            // Check if Firebase is available
            if (typeof FirebaseStorage !== 'undefined' && await FirebaseStorage.init()) {
                // Upload to Firebase Storage with progress
                const result = await FirebaseStorage.uploadPDF(
                    tempPaperId, 
                    pdfFile,
                    (progress) => {
                        addButton.textContent = `Uploading ${Math.round(progress)}%...`;
                    }
                );
                
                pdfUrl = result.url;
                pdfPath = result.path;
                hasPDF = true;
                
                UI.showToast('PDF uploaded to Firebase!', 'success');
            } else {
                // Fallback to IndexedDB
                const arrayBuffer = await this.readFileAsArrayBuffer(pdfFile);
                await PDFStorage.savePDF(tempPaperId, arrayBuffer, pdfFile.name);
                pdfPath = tempPaperId;
                hasPDF = true;
                UI.showToast('PDF saved locally (Firebase not configured)', 'warning');
            }
        } catch (error) {
            console.error('Error uploading PDF:', error);
            UI.showToast('Failed to upload PDF: ' + error.message, 'error');
            addButton.textContent = originalText;
            addButton.disabled = false;
            return;
        }
    }
    
    const paperData = {
        title: title,
        authors: authors,
        journal: document.getElementById('paperJournal').value.trim() || 'N/A',
        year: parseInt(document.getElementById('paperYear').value) || new Date().getFullYear(),
        status: document.getElementById('paperStatus').value,
        importance: document.getElementById('paperImportance').value,
        projectId: document.getElementById('paperProject').value || 'general',
        notes: document.getElementById('paperNotes').value.trim(),
        pdfUrl: pdfUrl,      // Firebase download URL
        pdfPath: pdfPath,    // Firebase path or IndexedDB key
        hasPDF: hasPDF,
        keyTakeaways: []
    };
    
    const paper = DataStore.createPaper(paperData);
    
    // Update PDF path with actual paper ID for Firebase
    if (hasPDF && pdfUrl) {
        DataStore.updatePaper(paper.id, { 
            pdfUrl: pdfUrl,
            pdfPath: pdfPath.replace(/paper_\d+/, paper.id)
        });
    }
    // Update IndexedDB with actual paper ID
    else if (hasPDF && pdfPath) {
        const pdfRecord = await PDFStorage.getPDF(pdfPath);
        if (pdfRecord) {
            await PDFStorage.deletePDF(pdfPath);
            await PDFStorage.savePDF(paper.id, pdfRecord.pdfData, pdfRecord.fileName);
            DataStore.updatePaper(paper.id, { pdfPath: paper.id });
        }
    }
    
    this.closeModal('addPaperModal');
    
    UI.showToast('Paper added successfully!', 'success');
    App.navigate('papers');
},
```

### 5.4. Sửa `js/components/pdfViewer.js` để load từ Firebase

Thay thế function `openFullscreen()`:

```javascript
async openFullscreen(paperId) {
    const paper = DataStore.getPaper(paperId);
    if (!paper || !paper.hasPDF) {
        UI.showToast('PDF not available', 'error');
        return;
    }
    
    try {
        // If paper has Firebase URL, open it directly
        if (paper.pdfUrl) {
            window.open(paper.pdfUrl, '_blank');
            return;
        }
        
        // Otherwise, try IndexedDB fallback
        const pdfRecord = await PDFStorage.getPDF(paper.pdfPath || paperId);
        
        if (!pdfRecord || !pdfRecord.pdfData) {
            UI.showToast('PDF data not found', 'error');
            return;
        }
        
        // Create blob from ArrayBuffer
        const blob = new Blob([pdfRecord.pdfData], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        
        // Open PDF in new tab
        const pdfWindow = window.open(blobUrl, '_blank');
        
        // Clean up blob URL after window loads
        if (pdfWindow) {
            pdfWindow.onload = () => {
                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            };
        }
    } catch (error) {
        console.error('Error opening PDF:', error);
        UI.showToast('Failed to open PDF: ' + error.message, 'error');
    }
}
```

## Bước 6: Test

1. Refresh trang web
2. Vào Papers & References
3. Click "Add Paper"
4. Upload một file PDF
5. Kiểm tra trong Firebase Console > Storage > Files sẽ thấy file được upload

## Chi phí Free Tier

- **Storage**: 5 GB
- **Download**: 1 GB/day
- **Upload**: 20,000 files/day
- **Operations**: 50,000 reads/day, 20,000 writes/day

Đủ dùng cho research workspace cá nhân!

## Lưu ý

- Các file PDF cũ trong IndexedDB vẫn hoạt động (fallback)
- Firebase URL public (ai có link đều xem được)
- Có thể thêm Authentication sau để bảo mật hơn
