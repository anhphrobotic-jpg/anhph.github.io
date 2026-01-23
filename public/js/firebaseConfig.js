// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDylMSF_4S47ge8Ti5lyaAl4RbiTLlRmhw",
    authDomain: "research-5b37d.firebaseapp.com",
    projectId: "research-5b37d",
    storageBucket: "research-5b37d.appspot.com",
    messagingSenderId: "564152955082",
    appId: "1:564152955082:web:215d8c4a781ffe16fe8433",
    measurementId: "G-B2LDNV2DH4"
};

// Initialize Firebase
let firebaseApp = null;
let storage = null;
let storageRef = null;

async function initFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK not loaded');
            return false;
        }
        
        if (!firebaseApp) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            storage = firebase.storage();
            storageRef = storage.ref();
            console.log('Firebase initialized successfully');
        }
        return true;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return false;
    }
}

// Firebase Storage Helper Functions
const FirebaseStorage = {
    initialized: false,
    
    async init() {
        if (!this.initialized) {
            this.initialized = await initFirebase();
        }
        return this.initialized;
    },
    
    async uploadPDF(paperId, file, onProgress = null) {
        if (!await this.init()) {
            throw new Error('Firebase not initialized');
        }
        
        console.log('Starting upload for paper:', paperId);
        console.log('File name:', file.name, 'Size:', file.size);
        
        const fileName = `papers/${paperId}/${file.name}`;
        console.log('Upload path:', fileName);
        
        const fileRef = storageRef.child(fileName);
        
        const uploadTask = fileRef.put(file, {
            contentType: 'application/pdf'
        });
        
        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    // Progress monitoring
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload progress:', progress + '%', 
                               'Bytes:', snapshot.bytesTransferred, '/', snapshot.totalBytes);
                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                (error) => {
                    // Error handling
                    console.error('Upload error:', error);
                    console.error('Error code:', error.code);
                    console.error('Error message:', error.message);
                    reject(error);
                },
                async () => {
                    // Success - get download URL
                    try {
                        console.log('Upload complete! Getting download URL...');
                        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        console.log('Download URL:', downloadURL);
                        resolve({
                            url: downloadURL,
                            path: fileName,
                            name: file.name,
                            size: file.size
                        });
                    } catch (error) {
                        console.error('Error getting download URL:', error);
                        reject(error);
                    }
                }
            );
        });
    },
    
    async deletePDF(filePath) {
        if (!await this.init()) {
            throw new Error('Firebase not initialized');
        }
        
        try {
            const fileRef = storageRef.child(filePath);
            await fileRef.delete();
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    },
    
    async getPDFUrl(filePath) {
        if (!await this.init()) {
            throw new Error('Firebase not initialized');
        }
        
        try {
            const fileRef = storageRef.child(filePath);
            const url = await fileRef.getDownloadURL();
            return url;
        } catch (error) {
            console.error('Error getting download URL:', error);
            return null;
        }
    }
};
