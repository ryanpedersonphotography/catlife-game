class DragDropManager {
    constructor(game) {
        this.game = game;
        this.draggedCat = null;
        this.draggedElement = null;
        this.ghostElement = null;
        this.dropIndicators = new Map();
    }
    
    init() {
        this.addDragDropStyles();
        this.setupEventListeners();
    }
    
    addDragDropStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            .cat-icon {
                cursor: grab;
                transition: transform 0.2s;
            }
            
            .cat-icon:active {
                cursor: grabbing;
            }
            
            .cat-icon.dragging {
                opacity: 0.5;
                transform: scale(0.9);
            }
            
            .drag-ghost {
                position: fixed;
                pointer-events: none;
                z-index: 9999;
                opacity: 0.8;
                transform: scale(1.1);
                filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
            }
            
            .room.drop-active {
                border: 3px dashed #4a90e2;
                background: rgba(74, 144, 226, 0.1);
            }
            
            .room.drop-hover {
                border: 3px solid #66cc66;
                background: rgba(102, 204, 102, 0.2);
                transform: scale(1.02);
            }
            
            .drop-indicator {
                position: absolute;
                width: 60px;
                height: 60px;
                border: 3px dashed #66cc66;
                border-radius: 50%;
                background: rgba(102, 204, 102, 0.2);
                pointer-events: none;
                opacity: 0;
                transform: scale(0.8);
                transition: all 0.3s;
            }
            
            .drop-indicator.visible {
                opacity: 1;
                transform: scale(1);
            }
            
            .drop-not-allowed {
                cursor: not-allowed;
            }
            
            .drop-not-allowed .drop-indicator {
                border-color: #ff6666;
                background: rgba(255, 102, 102, 0.2);
            }
        `;
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        // Use event delegation for dynamically created cat elements
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Touch support for mobile
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    
    handleMouseDown(e) {
        const catElement = e.target.closest('.cat-icon');
        if (!catElement || !catElement.dataset.catId) return;
        
        this.startDrag(catElement, e.clientX, e.clientY);
    }
    
    handleTouchStart(e) {
        const catElement = e.target.closest('.cat-icon');
        if (!catElement || !catElement.dataset.catId) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        this.startDrag(catElement, touch.clientX, touch.clientY);
    }
    
    startDrag(catElement, clientX, clientY) {
        const catId = catElement.dataset.catId;
        const cat = this.game.cats[catId];
        if (!cat) return;
        
        // Check if Tink can be moved
        if (catId === 'tink' && cat.mustStayInBathroom && this.game.gameState.time === 'Morning') {
            this.game.displayMessage("🚫 Tink needs to stay in the bathroom for her morning routine!");
            return;
        }
        
        this.draggedCat = catId;
        this.draggedElement = catElement;
        
        // Create ghost element
        this.ghostElement = catElement.cloneNode(true);
        this.ghostElement.className = 'drag-ghost';
        this.ghostElement.style.width = catElement.offsetWidth + 'px';
        this.ghostElement.style.height = catElement.offsetHeight + 'px';
        document.body.appendChild(this.ghostElement);
        
        // Position ghost at cursor
        this.updateGhostPosition(clientX, clientY);
        
        // Mark original as dragging
        catElement.classList.add('dragging');
        
        // Highlight valid drop zones
        this.highlightDropZones();
    }
    
    handleMouseMove(e) {
        if (!this.draggedCat) return;
        this.updateDrag(e.clientX, e.clientY);
    }
    
    handleTouchMove(e) {
        if (!this.draggedCat) return;
        e.preventDefault();
        const touch = e.touches[0];
        this.updateDrag(touch.clientX, touch.clientY);
    }
    
    updateDrag(clientX, clientY) {
        this.updateGhostPosition(clientX, clientY);
        
        // Check which room we're hovering over
        const element = document.elementFromPoint(clientX, clientY);
        const roomElement = element?.closest('.room');
        
        // Update hover states
        document.querySelectorAll('.room').forEach(room => {
            room.classList.remove('drop-hover');
        });
        
        if (roomElement) {
            const roomId = this.getRoomIdFromElement(roomElement);
            if (roomId && this.canDropCat(this.draggedCat, roomId)) {
                roomElement.classList.add('drop-hover');
                this.showDropIndicator(roomElement, clientX, clientY);
            }
        }
    }
    
    updateGhostPosition(clientX, clientY) {
        if (!this.ghostElement) return;
        this.ghostElement.style.left = (clientX - 25) + 'px';
        this.ghostElement.style.top = (clientY - 25) + 'px';
    }
    
    handleMouseUp(e) {
        if (!this.draggedCat) return;
        this.endDrag(e.clientX, e.clientY);
    }
    
    handleTouchEnd(e) {
        if (!this.draggedCat) return;
        
        // Get the last touch position
        const touch = e.changedTouches[0];
        this.endDrag(touch.clientX, touch.clientY);
    }
    
    endDrag(clientX, clientY) {
        // Find drop target
        const element = document.elementFromPoint(clientX, clientY);
        const roomElement = element?.closest('.room');
        
        if (roomElement) {
            const roomId = this.getRoomIdFromElement(roomElement);
            if (roomId && this.canDropCat(this.draggedCat, roomId)) {
                // Perform the move
                this.game.moveCat(this.draggedCat, roomId);
            }
        }
        
        // Clean up
        this.cleanup();
    }
    
    cleanup() {
        if (this.ghostElement) {
            this.ghostElement.remove();
            this.ghostElement = null;
        }
        
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }
        
        // Remove all drop zone highlights
        document.querySelectorAll('.room').forEach(room => {
            room.classList.remove('drop-active', 'drop-hover');
        });
        
        // Hide all drop indicators
        this.dropIndicators.forEach(indicator => {
            indicator.classList.remove('visible');
        });
        
        this.draggedCat = null;
        this.draggedElement = null;
    }
    
    highlightDropZones() {
        const cat = this.game.cats[this.draggedCat];
        const currentRoom = cat.room;
        
        document.querySelectorAll('.room').forEach(roomElement => {
            const roomId = this.getRoomIdFromElement(roomElement);
            if (roomId && roomId !== currentRoom && roomId !== 'outside') {
                roomElement.classList.add('drop-active');
                
                // Create drop indicator if needed
                if (!this.dropIndicators.has(roomId)) {
                    const indicator = document.createElement('div');
                    indicator.className = 'drop-indicator';
                    roomElement.appendChild(indicator);
                    this.dropIndicators.set(roomId, indicator);
                }
            }
        });
    }
    
    showDropIndicator(roomElement, clientX, clientY) {
        const roomId = this.getRoomIdFromElement(roomElement);
        const indicator = this.dropIndicators.get(roomId);
        if (!indicator) return;
        
        const rect = roomElement.getBoundingClientRect();
        const x = clientX - rect.left - 30;
        const y = clientY - rect.top - 30;
        
        indicator.style.left = x + 'px';
        indicator.style.top = y + 'px';
        indicator.classList.add('visible');
        
        // Check if drop is allowed
        if (!this.canDropCat(this.draggedCat, roomId)) {
            roomElement.classList.add('drop-not-allowed');
        } else {
            roomElement.classList.remove('drop-not-allowed');
        }
    }
    
    canDropCat(catId, roomId) {
        const cat = this.game.cats[catId];
        if (!cat || cat.room === roomId) return false;
        
        // Check if Tink can be moved
        if (catId === 'tink' && cat.mustStayInBathroom && roomId !== 'bathroom' && this.game.gameState.time === 'Morning') {
            return false;
        }
        
        // Check energy
        if (this.game.gameState.energy < 3) {
            return false;
        }
        
        // Can't drag to outside (use door system)
        if (roomId === 'outside') {
            return false;
        }
        
        return true;
    }
    
    getRoomIdFromElement(roomElement) {
        // Extract room ID from room's position or class
        const rooms = ['kitchen', 'livingroom', 'bedroom', 'bathroom'];
        for (const roomId of rooms) {
            if (roomElement.textContent.toLowerCase().includes(roomId) ||
                roomElement.className.includes(roomId)) {
                return roomId;
            }
        }
        
        // Try to match by position
        const roomContainers = document.querySelectorAll('.room');
        const index = Array.from(roomContainers).indexOf(roomElement);
        if (index >= 0 && index < rooms.length) {
            return rooms[index];
        }
        
        return null;
    }
}

// Export for use in game
if (typeof window !== 'undefined') {
    window.DragDropManager = DragDropManager;
}