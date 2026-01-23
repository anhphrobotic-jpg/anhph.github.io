// Cloudinary Configuration
const CloudinaryConfig = {
    cloudName: 'dutk4od1w',
    uploadPreset: 'axmwdrjg',
    apiKey: '623583484799276'
};

// Cloudinary Storage Helper
const CloudinaryStorage = {
    async uploadPDF(paperId, file, onProgress = null) {
        console.log('Uploading to Cloudinary:', file.name);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CloudinaryConfig.uploadPreset);
        formData.append('resource_type', 'auto');
        
        try {
            const xhr = new XMLHttpRequest();
            const url = `https://api.cloudinary.com/v1_1/${CloudinaryConfig.cloudName}/auto/upload`;
            
            return new Promise((resolve, reject) => {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const progress = (e.loaded / e.total) * 100;
                        console.log('Upload progress:', progress + '%');
                        if (onProgress) {
                            onProgress(progress);
                        }
                    }
                });
                
                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        console.log('Cloudinary upload success:', response);
                        
                        const viewUrl = response.secure_url;
                        console.log('View URL:', viewUrl);
                        
                        resolve({
                            url: viewUrl,
                            publicId: response.public_id,
                            path: response.folder,
                            name: file.name,
                            size: file.size,
                            cloudinaryData: response
                        });
                    } else {
                        reject(new Error('Upload failed: ' + xhr.statusText));
                    }
                });
                
                xhr.addEventListener('error', () => {
                    reject(new Error('Network error during upload'));
                });
                
                xhr.addEventListener('abort', () => {
                    reject(new Error('Upload cancelled'));
                });
                
                xhr.open('POST', url);
                xhr.send(formData);
            });
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    },
    
    async deletePDF(publicId) {
        console.warn('Delete from Cloudinary requires server-side API. Public ID:', publicId);
        return false;
    },
    
    getViewerUrl(cloudinaryUrl) {
        return cloudinaryUrl;
    }
};
