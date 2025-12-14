/**
 * Simple Modal Manager for Recipe App
 */
class Modal {
    constructor() {
        this.backdrop = null;
        this.container = null;
        this.isOpen = false;
        this.createModal();
    }
    
    createModal() {
        // Create backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.id = 'modal-backdrop';
        this.backdrop.className = 'hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        this.backdrop.setAttribute('role', 'dialog');
        this.backdrop.setAttribute('aria-modal', 'true');
        
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden';
        
        this.backdrop.appendChild(this.container);
        document.body.appendChild(this.backdrop);
        
        // Event listeners
        this.backdrop.addEventListener('click', (e) => {
            if (e.target === this.backdrop) this.close();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
    }
    
    open({ title, body, confirmText, cancelText, onConfirm, onClose }) {
        // Build footer buttons if confirm/cancel are provided
        let footerHtml = '';
        if (confirmText || cancelText){
            footerHtml = `
                <div class="flex gap-3 justify-end p-4 border-t border-gray-700 bg-gray-700/25">
                    ${cancelText ? `
                        <button
                            id="modal-cancel-btn"
                            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                                ${cancelText}
                            </button>
                    `:''}
                    ${confirmText ? `
                        <button
                            id="modal-confirm-btn"
                            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold"
                        >
                            ${confirmText}
                        </button>
                    ` : ''}
            </div>
        `;
        }

        const html = `
            <div class="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 class="text-xl font-semibold text-teal-400">${title}</h2>
                <button id="modal-close-btn" class="text-gray-400 hover:text-white text-3xl leading-none">
                    ×
                </button>
            </div>
            <div class="p-4 overflow-y-auto max-h-[70vh]">
                ${body}
            </div>
            ${footerHtml}
        `;
        
        this.container.innerHTML = html;
        
        // Close button handler
        document.getElementById('modal-close-btn').addEventListener('click', () => this.close());
        
        // Cancel button handler (if exists)
        const cancelBtn = document.getElementById('modal-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }

        // Confirm button handler (if exists)
        const confirmBtn = document.getElementById('modal-confirm-btn');
        if (confirmBtn && onConfirm) {
            confirmBtn.addEventListener('click', () => {
                onConfirm();
            })
        }
        // Show modal
        this.backdrop.classList.remove('hidden');
        this.isOpen = true;
        this.onCloseCallback = onClose;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        this.backdrop.classList.add('hidden');
        this.isOpen = false;
        document.body.style.overflow = '';
        
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
    }
}

// Singleton
const modal = new Modal();

export default modal;