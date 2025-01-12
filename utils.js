// Utils file for common functions and constants
export const API_URL = process.env.API_URL || 'http://localhost:5000/api';

export function handleError(error) {
    console.error('Error:', error);
    const message = error.response?.data?.message || error.message || 'An error occurred';
    showToast(message, 'error');
}

export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} fade-in`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

export function validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported');
    }

    if (file.size > maxSize) {
        throw new Error('File size too large (max 50MB)');
    }

    return true;
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function createMediaElement(type, url) {
    switch(type) {
        case 'image':
            return `<img src="${url}" alt="Post content" class="media-content">`;
        case 'video':
            return `
                <video class="media-content" controls>
                    <source src="${url}" type="video/mp4">
                    Your browser does not support video playback.
                </video>`;
        case 'audio':
            return `
                <audio class="media-content" controls>
                    <source src="${url}" type="audio/mpeg">
                    Your browser does not support audio playback.
                </audio>`;
        default:
            return '';
    }
}