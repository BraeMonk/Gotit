export function initializeComponents() {
    // Initialize all custom components
    initializeMediaUpload();
    initializeMediaPlayers();
    initializeModals();
}

function initializeMediaUpload() {
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            handleFiles(files);
        });
    }
}

function initializeMediaPlayers() {
    // Custom controls for video and audio players
    document.querySelectorAll('.media-player').forEach(player => {
        const type = player.dataset.type;
        if (type === 'video' || type === 'audio') {
            setupMediaControls(player);
        }
    });
}

function initializeModals() {
    document.querySelectorAll('[data-modal-trigger]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.dataset.modalTrigger;
            showModal(modalId);
        });
    });
}

export function createPost(post) {
    return `
        <article class="card post fade-in">
            <header class="post-header">
                <img src="${post.user.avatar || '/assets/placeholder.jpg'}" alt="${post.user.username}" class="avatar">
                <div class="post-meta">
                    <h3>${post.user.username}</h3>
                    <time>${formatDate(post.createdAt)}</time>
                </div>
            </header>
            
            <div class="media-container">
                ${renderMedia(post)}
            </div>
            
            <div class="post-content">
                <p>${post.caption}</p>
                
                <div class="post-actions">
                    <button class="action-button" onclick="handleLike('${post.id}')">
                        ❤️</antArtifact>