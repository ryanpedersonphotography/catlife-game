class SettingsManager {
    constructor() {
        this.colorSchemes = {
            dark: {
                name: 'Dark Mode',
                background: '#1a1a1a',
                foreground: '#2b2b2b',
                text: '#ffffff',
                accent: '#4a90e2',
                secondary: '#66cc66',
                warning: '#ff6666'
            },
            light: {
                name: 'Light Mode',
                background: '#f0f0f0',
                foreground: '#ffffff',
                text: '#333333',
                accent: '#2e78d2',
                secondary: '#4caf50',
                warning: '#f44336'
            },
            pastel: {
                name: 'Pastel',
                background: '#fce4ec',
                foreground: '#ffebee',
                text: '#880e4f',
                accent: '#f06292',
                secondary: '#81c784',
                warning: '#ffb74d'
            },
            ocean: {
                name: 'Ocean',
                background: '#0d2635',
                foreground: '#1a3a4a',
                text: '#b3e5fc',
                accent: '#00acc1',
                secondary: '#26c6da',
                warning: '#ffa726'
            },
            forest: {
                name: 'Forest',
                background: '#1b4332',
                foreground: '#2d6a4f',
                text: '#d8f3dc',
                accent: '#74c69d',
                secondary: '#95d5b2',
                warning: '#ffd60a'
            },
            sunset: {
                name: 'Sunset',
                background: '#3d1e2e',
                foreground: '#5a2e46',
                text: '#ffe5d9',
                accent: '#ff6b6b',
                secondary: '#ffd93d',
                warning: '#ff8cc8'
            }
        };
        
        this.currentScheme = localStorage.getItem('catlife-color-scheme') || 'dark';
        this.settingsOpen = false;
    }
    
    init() {
        this.applyColorScheme(this.currentScheme);
        this.addSettingsButton();
        this.createSettingsCSS();
    }
    
    createSettingsCSS() {
        const style = document.createElement('style');
        style.innerHTML = `
            .settings-button {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 40px;
                height: 40px;
                background: var(--accent-color);
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                z-index: 1000;
                transition: transform 0.3s;
            }
            
            .settings-button:hover {
                transform: rotate(90deg);
            }
            
            .settings-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            
            .settings-overlay.active {
                display: flex;
            }
            
            .settings-modal {
                background: var(--foreground-color);
                border: 2px solid var(--accent-color);
                border-radius: 10px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                color: var(--text-color);
            }
            
            .settings-header {
                text-align: center;
                margin-bottom: 20px;
            }
            
            .settings-header h2 {
                color: var(--accent-color);
                margin: 0;
            }
            
            .color-schemes {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }
            
            .color-scheme-option {
                border: 2px solid transparent;
                border-radius: 8px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.3s;
                background: var(--background-color);
            }
            
            .color-scheme-option:hover {
                border-color: var(--accent-color);
                transform: translateY(-2px);
            }
            
            .color-scheme-option.active {
                border-color: var(--secondary-color);
                box-shadow: 0 0 10px var(--secondary-color);
            }
            
            .color-preview {
                display: flex;
                height: 40px;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .color-swatch {
                flex: 1;
            }
            
            .scheme-name {
                text-align: center;
                font-weight: bold;
                font-size: 14px;
            }
            
            .close-settings {
                display: block;
                margin: 20px auto 0;
                padding: 10px 30px;
                background: var(--accent-color);
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            }
            
            .close-settings:hover {
                background: var(--secondary-color);
            }
        `;
        document.head.appendChild(style);
    }
    
    addSettingsButton() {
        const button = document.createElement('button');
        button.className = 'settings-button';
        button.innerHTML = '⚙️';
        button.title = 'Settings';
        button.addEventListener('click', () => this.openSettings());
        document.body.appendChild(button);
    }
    
    openSettings() {
        if (this.settingsOpen) return;
        this.settingsOpen = true;
        
        const overlay = document.createElement('div');
        overlay.className = 'settings-overlay active';
        
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        
        modal.innerHTML = `
            <div class="settings-header">
                <h2>⚙️ Game Settings</h2>
            </div>
            <div class="settings-body">
                <h3>🎨 Color Scheme</h3>
                <div class="color-schemes">
                    ${Object.entries(this.colorSchemes).map(([key, scheme]) => `
                        <div class="color-scheme-option ${key === this.currentScheme ? 'active' : ''}" data-scheme="${key}">
                            <div class="color-preview">
                                <div class="color-swatch" style="background: ${scheme.background}"></div>
                                <div class="color-swatch" style="background: ${scheme.foreground}"></div>
                                <div class="color-swatch" style="background: ${scheme.accent}"></div>
                                <div class="color-swatch" style="background: ${scheme.secondary}"></div>
                            </div>
                            <div class="scheme-name">${scheme.name}</div>
                        </div>
                    `).join('')}
                </div>
                <button class="close-settings">Close</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Add event listeners
        modal.querySelectorAll('.color-scheme-option').forEach(option => {
            option.addEventListener('click', () => {
                const scheme = option.dataset.scheme;
                this.applyColorScheme(scheme);
                
                // Update active state
                modal.querySelectorAll('.color-scheme-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            });
        });
        
        modal.querySelector('.close-settings').addEventListener('click', () => this.closeSettings(overlay));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeSettings(overlay);
        });
    }
    
    closeSettings(overlay) {
        overlay.remove();
        this.settingsOpen = false;
    }
    
    applyColorScheme(schemeName) {
        const scheme = this.colorSchemes[schemeName];
        if (!scheme) return;
        
        this.currentScheme = schemeName;
        localStorage.setItem('catlife-color-scheme', schemeName);
        
        // Set CSS variables
        const root = document.documentElement;
        root.style.setProperty('--background-color', scheme.background);
        root.style.setProperty('--foreground-color', scheme.foreground);
        root.style.setProperty('--text-color', scheme.text);
        root.style.setProperty('--accent-color', scheme.accent);
        root.style.setProperty('--secondary-color', scheme.secondary);
        root.style.setProperty('--warning-color', scheme.warning);
        
        // Apply to body and main elements
        document.body.style.backgroundColor = scheme.background;
        document.body.style.color = scheme.text;
        
        // Update game-specific elements
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.backgroundColor = scheme.background;
        }
        
        const header = document.querySelector('header');
        if (header) {
            header.style.backgroundColor = scheme.foreground;
            header.style.borderBottomColor = scheme.accent;
        }
        
        const gameText = document.querySelector('.game-text');
        if (gameText) {
            gameText.style.backgroundColor = scheme.foreground;
            gameText.style.borderColor = scheme.accent;
        }
        
        const actionPanel = document.querySelector('.action-panel');
        if (actionPanel) {
            actionPanel.style.backgroundColor = scheme.foreground;
            actionPanel.style.borderColor = scheme.accent;
        }
        
        // Update buttons
        document.querySelectorAll('button').forEach(button => {
            if (button.classList.contains('action-btn')) {
                button.style.backgroundColor = scheme.accent;
                button.style.color = '#ffffff';
            }
        });
        
        // Update room styles
        document.querySelectorAll('.room').forEach(room => {
            room.style.borderColor = scheme.accent;
        });
    }
}

// Initialize settings manager when the page loads
if (typeof window !== 'undefined') {
    window.settingsManager = new SettingsManager();
}