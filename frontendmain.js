import { initializeComponents, createPost, formatDate } from './frontendcomponents.js';
import { API_URL, handleError } from './utils.js';

class App {
    constructor() {
        this.state = {
            user: null,
            posts: [],
            isLoading: false,
            currentPage: 'feed'
        };
        
        this.init();
    }

    async init() {
        try {
            // Initialize components
            initializeComponents();
            
            // Check authentication
            await this.checkAuth();
            
            // Load initial posts
            await this.loadPosts();
            
            // Set up event listeners
            this.setupEventListeners();
        } catch (error) {
            handleError(error);
        }
    }

    async checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch(`${API_URL}/auth/verify`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.ok) {
                    this.state.user = await response.json();
                    this.updateUI();
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                handleError(error);
            }
        }
    }

    async loadPosts() {
        try {
            this.state.isLoading = true;
            this.updateUI();

            const response = await fetch(`${API_URL}/posts`);
            const posts = await response.json();

            this.state.posts = posts;
            this.state.isLoading = false;
            this.updateUI();
        } catch (error) {
            handleError(error);
            this.state.isLoading = false;
            this.updateUI();
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('[data-nav]').forEach(button => {
            button.addEventListener('click', (e) => {
                const page = e.target.dataset.nav;
                this.navigate(page);
            });
        });

        // Upload form
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleUpload(new FormData(uploadForm));
            });
        }

        // Infinite scroll
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    async handleUpload(formData) {
        try {
            const response = await fetch(`${API_URL}/posts/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                const post = await response.json();
                this.state.posts.unshift(post);
                this.updateUI();
            }
        } catch (error) {
            handleError(error);
        }
    }

    handleScroll() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            this.loadMorePosts();
        }
    }

    async loadMorePosts() {
        if (this.state.isLoading) return;
        
        const lastPost = this.state.posts[this.state.posts.length - 1];
        if (!lastPost) return;

        try {
            this.state.isLoading = true;
            this.updateUI();

            const response = await fetch(`${API_URL}/posts?before=${lastPost.id}`);
            const newPosts = await response.json();

            this.state.posts = [...this.state.posts, ...newPosts];
            this.state.isLoading = false;
            this.updateUI();
        } catch (error) {
            handleError(error);
            this.state.isLoading = false;
            this.updateUI();
        }
    }

    navigate(page) {
        this.state.currentPage = page;
        this.updateUI();
    }

    updateUI() {
        // Update navigation
        document.querySelectorAll('[data-nav]').forEach(button => {
            button.classList.toggle('active', button.dataset.nav === this.state.currentPage);
        });

        // Update main content
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = this.renderPage();

        // Update loading state
        document.getElementById('loader').style.display = this.state.isLoading ? 'block' : 'none';

        // Update auth state
        document.body.classList.toggle('authenticated', !!this.state.user);
    }

    renderPage() {
        switch (this.state.currentPage) {
            case 'feed':
                return this.renderFeed();
            case 'profile':
                return this.renderProfile();
            case 'explore':
                return this.renderExplore();
            case 'messages':
                return this.renderMessages();
            default:
                return this.renderFeed();
        }
    }

    renderFeed() {
        return `
            <div class="feed">
                ${this.state.posts.map(post => createPost(post)).join('')}
            </div>
        `;
    }

    renderProfile() {
        if (!this.state.user) return '<div class="text-center">Please log in</div>';
        
        return `
            <div class="profile">
                <div class="profile-header">
                    <img src="${this.state.user.avatar || '/assets/placeholder.jpg'}" alt="Profile" class="profile-avatar">
                    <h2>${this.state.user.username}</h2>
                    <p>${this.state.user.bio || 'No bio yet'}</p>
                </div>
                <div class="profile-posts">
                    ${this.state.posts
                        .filter(post => post.userId === this.state.user.id)
                        .map(post => createPost(post)).join('')}
                </div>
            </div>
        `;
    }
}

// Initialize app
const app = new App();