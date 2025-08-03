class CatLifeGame {
    constructor(playerName, difficulty) {
        this.playerName = playerName || 'Cat Lover';
        this.difficulty = difficulty || 'normal';
        
        // Difficulty settings
        const difficultySettings = {
            easy: {
                startEnergy: 150,
                maxEnergy: 150,
                energyCostMultiplier: 0.7,
                accidentChance: 0.5,
                wanderChance: 0.1
            },
            normal: {
                startEnergy: 100,
                maxEnergy: 100,
                energyCostMultiplier: 1,
                accidentChance: 0.7,
                wanderChance: 0.15
            },
            hard: {
                startEnergy: 75,
                maxEnergy: 75,
                energyCostMultiplier: 1.3,
                accidentChance: 0.9,
                wanderChance: 0.25
            }
        };
        
        this.settings = difficultySettings[this.difficulty];
        this.rooms = {
            kitchen: {
                name: "Kitchen",
                cats: [],
                messes: []
            },
            livingroom: {
                name: "Living Room",
                cats: [],
                messes: []
            },
            bedroom: {
                name: "Bedroom",
                cats: [],
                messes: []
            },
            bathroom: {
                name: "Bathroom",
                cats: [],
                messes: []
            }
        };
        
        // Separate tracking for cats outside and waiting by door
        this.outside = {
            cats: [],
            catsWaitingToGoOut: [],
            catsWaitingToComeIn: []
        };
        
        this.doorOpen = false;
        
        this.cats = {
            gusty: {
                name: "Gusty",
                fed: false,
                happy: 50,
                trait: "always eats other cats' food",
                hunger: 80,
                room: "kitchen",
                emoji: "🐱",
                conflicts: ["snicker"] // Gusty steals Snicker's food
            },
            snicker: {
                name: "Snicker",
                fed: false,
                happy: 50,
                trait: "poops everywhere",
                hunger: 70,
                room: "livingroom",
                emoji: "😸",
                messLevel: 0,
                conflicts: ["gusty"] // Gets food stolen by Gusty
            },
            rudy: {
                name: "Rudy",
                fed: false,
                happy: 50,
                trait: "fights with other cats",
                hunger: 75,
                room: "bedroom",
                emoji: "😾",
                aggression: 80,
                conflicts: ["scampi", "stinkylee", "lucy"] // Fights with these cats
            },
            scampi: {
                name: "Scampi",
                fed: false,
                happy: 50,
                trait: "pees everywhere",
                hunger: 70,
                room: "kitchen",
                emoji: "😹",
                messLevel: 0,
                conflicts: ["rudy"] // Gets bullied by Rudy
            },
            stinkylee: {
                name: "Stinky Lee",
                fed: false,
                happy: 50,
                trait: "mysterious and aloof",
                hunger: 60,
                room: "bedroom",
                emoji: "😼",
                conflicts: ["rudy"] // Doesn't like Rudy's aggression
            },
            jonah: {
                name: "Jonah",
                fed: false,
                happy: 50,
                trait: "gentle soul",
                hunger: 65,
                room: "livingroom",
                emoji: "😺",
                conflicts: [] // Gets along with everyone
            },
            tink: {
                name: "Tink",
                fed: false,
                happy: 50,
                trait: "needs extra attention, loves bathroom",
                hunger: 85,
                room: "bathroom",
                emoji: "🐈",
                needsExtra: true,
                favoriteRoom: "bathroom",
                conflicts: []
            },
            lucy: {
                name: "Lucy",
                fed: false,
                happy: 50,
                trait: "independent and feisty",
                hunger: 70,
                room: "bedroom",
                emoji: "🐈‍⬛",
                conflicts: ["rudy"] // Doesn't get along with Rudy
            },
            giselle: {
                name: "Giselle",
                fed: false,
                happy: 50,
                trait: "graceful and elegant",
                hunger: 60,
                room: "livingroom",
                emoji: "😻",
                conflicts: []
            }
        };
        
        this.gameState = {
            day: 1,
            time: "Morning",
            score: 0,
            energy: this.settings.startEnergy,
            maxEnergy: this.settings.maxEnergy,
            selectedCat: null,
            events: [],
            isGameOver: false
        };
        
        this.timeSequence = ["Morning", "Afternoon", "Evening", "Night"];
        this.currentTimeIndex = 0;
        
        // Time of day tracking
        this.timeOfDay = {
            "Morning": { start: 6, end: 12, current: 6 },
            "Afternoon": { start: 12, end: 17, current: 12 },
            "Evening": { start: 17, end: 21, current: 17 },
            "Night": { start: 21, end: 24, current: 21 }
        };
        
        // Auto time progression settings
        this.autoProgress = true;
        this.timeProgressInterval = null;
        this.timeProgressRate = 60000; // 60 seconds per time period by default
        
        // Action-based time progression
        this.actionsPerTimePeriod = 15; // Actions needed to advance time
        this.currentActions = 0;
        
        this.init();
    }
    
    init() {
        // Initialize cats in their rooms
        Object.entries(this.cats).forEach(([catId, cat]) => {
            this.rooms[cat.room].cats.push(catId);
        });
        
        this.updateDisplay();
        this.renderRooms();
        this.displayMessage("Good morning! It's time to feed your special needs cats.");
        this.displayMessage("Click on a cat to interact with them, or use text commands.");
        this.checkConflicts();
        
        const input = document.getElementById('player-input');
        const submitBtn = document.getElementById('submit-btn');
        
        submitBtn.addEventListener('click', () => this.handleInput());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleInput();
        });
        
        // Popup event listeners
        const closePopupBtn = document.getElementById('close-popup');
        closePopupBtn.addEventListener('click', () => this.closePopup());
        
        const popupOverlay = document.getElementById('cat-popup');
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                this.closePopup();
            }
        });
        
        // Start automatic time progression
        this.startTimeProgression();
        
        // Start clock ticker
        this.startClockTicker();
    }
    
    startTimeProgression() {
        if (this.autoProgress && !this.gameState.isGameOver) {
            this.timeProgressInterval = setInterval(() => {
                if (!this.gameState.isGameOver && this.gameState.time !== "Night") {
                    // Show warning before auto-advancing
                    this.displayMessage("⏰ Time is passing... (advancing soon)");
                    
                    // Auto advance after a short delay
                    setTimeout(() => {
                        if (!this.gameState.isGameOver) {
                            this.advanceTime();
                        }
                    }, 5000); // 5 second warning
                }
            }, this.timeProgressRate);
        }
    }
    
    startClockTicker() {
        // Update clock every 10 seconds for smooth progression
        this.clockInterval = setInterval(() => {
            if (!this.gameState.isGameOver && this.autoProgress) {
                // Simulate time passing
                this.currentActions += 0.5; // Small increment for time passage
                if (this.currentActions > this.actionsPerTimePeriod) {
                    this.currentActions = this.actionsPerTimePeriod;
                }
                this.updateDisplay();
            }
        }, 10000); // Every 10 seconds
    }
    
    stopTimeProgression() {
        if (this.timeProgressInterval) {
            clearInterval(this.timeProgressInterval);
            this.timeProgressInterval = null;
        }
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.clockInterval = null;
        }
    }
    
    progressTimeWithAction() {
        this.currentActions++;
        
        // Update display immediately
        this.updateDisplay();
        
        // Show progress at milestones
        const remaining = this.actionsPerTimePeriod - this.currentActions;
        if (remaining > 0 && remaining % 5 === 0) {
            this.displayMessage(`⏳ ${remaining} actions until ${this.timeSequence[this.currentTimeIndex + 1] || 'bedtime'}...`);
        }
        
        // Check if enough actions to advance time
        if (this.currentActions >= this.actionsPerTimePeriod) {
            this.currentActions = 0;
            if (this.gameState.time !== "Night") {
                this.displayMessage("⏰ Time advances due to your activities...");
                setTimeout(() => {
                    this.advanceTime();
                }, 1000);
            }
        }
    }
    
    renderRooms() {
        const container = document.getElementById('rooms-container');
        container.innerHTML = '';
        
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '1200');
        svg.setAttribute('height', '700');
        svg.setAttribute('viewBox', '0 0 1200 700');
        svg.setAttribute('style', 'display: block; width: 100%; height: 100%; background-color: #001a00;');
        
        
        // Add defs for patterns and styles
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Grid pattern
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', 'grid');
        pattern.setAttribute('width', '20');
        pattern.setAttribute('height', '20');
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', '0');
        line1.setAttribute('y1', '0');
        line1.setAttribute('x2', '0');
        line1.setAttribute('y2', '20');
        line1.setAttribute('stroke', '#00ff00');
        line1.setAttribute('stroke-opacity', '0.2');
        
        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', '0');
        line2.setAttribute('y1', '0');
        line2.setAttribute('x2', '20');
        line2.setAttribute('y2', '0');
        line2.setAttribute('stroke', '#00ff00');
        line2.setAttribute('stroke-opacity', '0.2');
        
        pattern.appendChild(line1);
        pattern.appendChild(line2);
        defs.appendChild(pattern);
        svg.appendChild(defs);
        
        // Background
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('width', '1200');
        bg.setAttribute('height', '700');
        bg.setAttribute('fill', 'url(#grid)');
        svg.appendChild(bg);
        
        // Room definitions with SVG paths - with proper spacing
        const roomDefs = {
            kitchen: { x: 50, y: 50, width: 350, height: 250 },
            livingroom: { x: 420, y: 50, width: 480, height: 350 },
            bedroom: { x: 50, y: 320, width: 350, height: 250 },
            bathroom: { x: 420, y: 420, width: 480, height: 150 }
        };
        
        // Draw rooms
        Object.entries(roomDefs).forEach(([roomId, coords]) => {
            const room = this.rooms[roomId];
            const hasConflict = this.checkRoomConflicts(roomId);
            
            // Room rectangle
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', coords.x);
            rect.setAttribute('y', coords.y);
            rect.setAttribute('width', coords.width);
            rect.setAttribute('height', coords.height);
            rect.setAttribute('fill', hasConflict ? 'rgba(255,0,0,0.1)' : 'transparent');
            rect.setAttribute('stroke', hasConflict ? '#ff0000' : '#00ff00');
            rect.setAttribute('stroke-width', '2');
            rect.setAttribute('id', `room-${roomId}-rect`);
            svg.appendChild(rect);
            
            // Room label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', coords.x + 10);
            text.setAttribute('y', coords.y + 20);
            text.setAttribute('fill', '#00ff00');
            text.setAttribute('font-size', '14');
            text.setAttribute('font-family', 'Courier New, monospace');
            text.setAttribute('opacity', '0.8');
            text.textContent = room.name.toUpperCase();
            svg.appendChild(text);
        });
        
        // Draw doorways
        this.drawDoorways(svg);
        
        // Draw front door in living room
        if (!this.doorOpen) {
            const door = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            door.setAttribute('x1', '650');
            door.setAttribute('y1', '50');
            door.setAttribute('x2', '750');
            door.setAttribute('y2', '50');
            door.setAttribute('stroke', '#00ff00');
            door.setAttribute('stroke-width', '8');
            door.setAttribute('class', 'svg-door');
            door.style.cursor = 'pointer';
            door.style.pointerEvents = 'all';
            door.addEventListener('click', () => this.toggleDoor());
            svg.appendChild(door);
            
            const doorLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            doorLabel.setAttribute('x', '700');
            doorLabel.setAttribute('y', '45');
            doorLabel.setAttribute('text-anchor', 'middle');
            doorLabel.setAttribute('fill', '#00ff00');
            doorLabel.setAttribute('font-size', '10');
            doorLabel.textContent = 'DOOR';
            svg.appendChild(doorLabel);
        } else {
            const doorOpen = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            doorOpen.setAttribute('x', '650');
            doorOpen.setAttribute('y', '40');
            doorOpen.setAttribute('width', '100');
            doorOpen.setAttribute('height', '20');
            doorOpen.setAttribute('fill', 'rgba(255,0,0,0.2)');
            doorOpen.setAttribute('stroke', '#ff0000');
            doorOpen.style.cursor = 'pointer';
            doorOpen.style.pointerEvents = 'all';
            doorOpen.addEventListener('click', () => this.toggleDoor());
            svg.appendChild(doorOpen);
            
            const doorLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            doorLabel.setAttribute('x', '700');
            doorLabel.setAttribute('y', '55');
            doorLabel.setAttribute('text-anchor', 'middle');
            doorLabel.setAttribute('fill', '#ff0000');
            doorLabel.setAttribute('font-size', '10');
            doorLabel.textContent = 'OPEN';
            svg.appendChild(doorLabel);
        }
        
        container.appendChild(svg);
        
        // Create room containers for cats and messes as overlay
        const overlayContainer = document.createElement('div');
        overlayContainer.style.position = 'absolute';
        overlayContainer.style.top = '0';
        overlayContainer.style.left = '0';
        overlayContainer.style.width = '100%';
        overlayContainer.style.height = '100%';
        overlayContainer.style.zIndex = '10';
        
        Object.entries(roomDefs).forEach(([roomId, coords]) => {
            const roomContainer = document.createElement('div');
            roomContainer.className = 'room-container';
            roomContainer.id = `room-${roomId}`;
            roomContainer.style.position = 'absolute';
            roomContainer.style.left = coords.x + 'px';
            roomContainer.style.top = coords.y + 'px';
            roomContainer.style.width = coords.width + 'px';
            roomContainer.style.height = coords.height + 'px';
            
            this.renderRoomContents(roomId, roomContainer);
            overlayContainer.appendChild(roomContainer);
        });
        
        container.appendChild(overlayContainer);
        
        // Create outside area
        const outsideArea = document.createElement('div');
        outsideArea.className = 'outside-area';
        outsideArea.style.position = 'absolute';
        outsideArea.style.bottom = '0';
        outsideArea.style.left = '0';
        outsideArea.style.width = '100%';
        outsideArea.style.height = '150px';
        outsideArea.style.zIndex = '5';
        
        // Add outside label
        const outsideLabel = document.createElement('div');
        outsideLabel.className = 'label-outside';
        outsideLabel.textContent = 'OUTSIDE';
        outsideArea.appendChild(outsideLabel);
        
        // Create container for cats outside
        const outsideCatsContainer = document.createElement('div');
        outsideCatsContainer.className = 'outside-cats-container';
        outsideCatsContainer.style.position = 'absolute';
        outsideCatsContainer.style.bottom = '20px';
        outsideCatsContainer.style.left = '50%';
        outsideCatsContainer.style.transform = 'translateX(-50%)';
        outsideCatsContainer.style.display = 'flex';
        outsideCatsContainer.style.gap = '20px';
        
        // Render cats that are outside
        this.outside.cats.forEach(catId => {
            const cat = this.cats[catId];
            const catDiv = this.createCatElement(catId, cat);
            catDiv.classList.add('cat-outside');
            outsideCatsContainer.appendChild(catDiv);
        });
        
        outsideArea.appendChild(outsideCatsContainer);
        overlayContainer.appendChild(outsideArea);
    }
    
    drawDoorways(svg) {
        // Kitchen to Living Room doorway
        const door1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        door1.setAttribute('x1', '400');
        door1.setAttribute('y1', '150');
        door1.setAttribute('x2', '420');
        door1.setAttribute('y2', '150');
        door1.setAttribute('stroke', '#00ff00');
        door1.setAttribute('stroke-width', '2');
        door1.setAttribute('stroke-dasharray', '5,5');
        svg.appendChild(door1);
        
        // Kitchen to Bedroom doorway
        const door2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        door2.setAttribute('x1', '200');
        door2.setAttribute('y1', '300');
        door2.setAttribute('x2', '200');
        door2.setAttribute('y2', '320');
        door2.setAttribute('stroke', '#00ff00');
        door2.setAttribute('stroke-width', '2');
        door2.setAttribute('stroke-dasharray', '5,5');
        svg.appendChild(door2);
        
        // Living Room to Bathroom doorway
        const door3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        door3.setAttribute('x1', '660');
        door3.setAttribute('y1', '400');
        door3.setAttribute('x2', '660');
        door3.setAttribute('y2', '420');
        door3.setAttribute('stroke', '#00ff00');
        door3.setAttribute('stroke-width', '2');
        door3.setAttribute('stroke-dasharray', '5,5');
        svg.appendChild(door3);
    }
    
    renderRoomContents(roomId, container) {
        const room = this.rooms[roomId];
        
        // Create cats container
        const catsContainer = document.createElement('div');
        catsContainer.className = 'cats-in-room';
        catsContainer.style.pointerEvents = 'all';
        
        room.cats.forEach(catId => {
            const cat = this.cats[catId];
            if (cat.missing) return;
            
            const catDiv = this.createCatElement(catId, cat);
            
            if (this.checkRoomConflicts(roomId) && this.isCatInConflict(catId, roomId)) {
                catDiv.classList.add('fighting');
            }
            
            catsContainer.appendChild(catDiv);
        });
        
        container.appendChild(catsContainer);
        
        // Show messes
        const messContainer = document.createElement('div');
        messContainer.className = 'mess-container';
        
        room.messes.forEach((mess, index) => {
            const messDiv = document.createElement('div');
            messDiv.className = 'mess-visual';
            messDiv.id = `mess-${roomId}-${index}`;
            
            if (mess.includes('poop')) {
                messDiv.innerHTML = '💩';
                messDiv.classList.add('poop');
            } else if (mess.includes('pee')) {
                messDiv.innerHTML = '💦';
                messDiv.classList.add('pee');
            }
            
            messDiv.title = 'Click to clean!';
            messDiv.addEventListener('click', () => this.cleanMess(roomId, index));
            messContainer.appendChild(messDiv);
        });
        
        container.appendChild(messContainer);
    }
    
    createCatElement(catId, cat) {
        const catDiv = document.createElement('div');
        catDiv.className = 'cat-icon';
        catDiv.id = `cat-${catId}`;
        catDiv.style.pointerEvents = 'all';
        catDiv.style.cursor = 'pointer';
        
        if (this.gameState.selectedCat === catId) {
            catDiv.classList.add('selected');
        }
        
        if (cat.happy < 30) {
            catDiv.classList.add('unhappy');
        }
        
        catDiv.innerHTML = `
            <div class="cat-emoji">${cat.emoji}</div>
            <div class="cat-name">${cat.name}</div>
            <div class="cat-mood">${this.getCatMood(cat)}</div>
        `;
        
        catDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectCat(catId);
        });
        return catDiv;
    }
    
    toggleDoor() {
        this.doorOpen = !this.doorOpen;
        this.displayMessage(this.doorOpen ? "You opened the front door." : "You closed the front door.");
        this.renderRooms();
    }
    
    checkRoomConflicts(roomId) {
        const catsInRoom = this.rooms[roomId].cats;
        for (let i = 0; i < catsInRoom.length; i++) {
            for (let j = i + 1; j < catsInRoom.length; j++) {
                const cat1 = this.cats[catsInRoom[i]];
                const cat2 = this.cats[catsInRoom[j]];
                if (cat1.conflicts.includes(catsInRoom[j]) || cat2.conflicts.includes(catsInRoom[i])) {
                    return true;
                }
            }
        }
        return false;
    }
    
    isCatInConflict(catId, roomId) {
        const cat = this.cats[catId];
        const otherCats = this.rooms[roomId].cats.filter(id => id !== catId);
        return otherCats.some(otherId => 
            cat.conflicts.includes(otherId) || this.cats[otherId].conflicts.includes(catId)
        );
    }
    
    checkConflicts() {
        let conflictMessages = [];
        Object.entries(this.rooms).forEach(([roomId, room]) => {
            if (this.checkRoomConflicts(roomId)) {
                const conflictingCats = [];
                room.cats.forEach(catId => {
                    if (this.isCatInConflict(catId, roomId)) {
                        conflictingCats.push(this.cats[catId].name);
                    }
                });
                if (conflictingCats.length > 0) {
                    conflictMessages.push(`⚠️ Conflict in ${room.name}: ${conflictingCats.join(' and ')} don't get along!`);
                    // Reduce happiness for cats in conflict
                    room.cats.forEach(catId => {
                        if (this.isCatInConflict(catId, roomId)) {
                            this.cats[catId].happy -= 5;
                            if (this.cats[catId].aggression) {
                                this.cats[catId].aggression += 10;
                            }
                        }
                    });
                    this.gameState.score -= 2;
                }
            }
        });
        
        conflictMessages.forEach(msg => this.displayMessage(msg));
    }
    
    selectCat(catId) {
        this.gameState.selectedCat = catId;
        this.renderRooms();
        this.showCatPopup(catId);
    }
    
    showCatPopup(catId) {
        const cat = this.cats[catId];
        const popup = document.getElementById('cat-popup');
        
        // Update popup content
        document.getElementById('popup-cat-name').textContent = cat.name;
        document.getElementById('popup-cat-emoji').textContent = cat.emoji;
        document.getElementById('popup-cat-mood').textContent = `Mood: ${this.getCatMood(cat)}`;
        document.getElementById('popup-cat-location').textContent = `Location: ${cat.room === 'outside' ? 'Outside' : this.rooms[cat.room].name}`;
        document.getElementById('popup-cat-trait').textContent = `Trait: ${cat.trait}`;
        
        // Show popup
        popup.classList.add('active');
        
        // Generate action buttons
        this.generatePopupActions(catId);
    }
    
    closePopup() {
        const popup = document.getElementById('cat-popup');
        popup.classList.remove('active');
        this.gameState.selectedCat = null;
        this.renderRooms();
    }
    
    generatePopupActions(catId) {
        const cat = this.cats[catId];
        const actionsDiv = document.getElementById('popup-action-buttons');
        actionsDiv.innerHTML = '';
        
        // Feed button
        const feedBtn = document.createElement('button');
        feedBtn.className = 'action-btn';
        feedBtn.textContent = cat.fed ? '✅ Already Fed' : '🍽️ Feed';
        feedBtn.disabled = cat.fed && this.gameState.time === "Morning";
        feedBtn.addEventListener('click', () => {
            this.feedCat(catId);
            this.closePopup();
        });
        actionsDiv.appendChild(feedBtn);
        
        // Play button
        const playBtn = document.createElement('button');
        playBtn.className = 'action-btn';
        playBtn.textContent = '🎾 Play';
        playBtn.addEventListener('click', () => {
            this.playWithCat(catId);
            this.closePopup();
        });
        actionsDiv.appendChild(playBtn);
        
        // Move buttons - exclude outside from normal moves
        Object.entries(this.rooms).forEach(([roomId, room]) => {
            if (cat.room !== roomId && roomId !== 'outside') {
                const moveBtn = document.createElement('button');
                moveBtn.className = 'action-btn';
                moveBtn.textContent = `📦 Move to ${room.name}`;
                moveBtn.addEventListener('click', () => {
                    this.moveCat(catId, roomId);
                    this.closePopup();
                });
                actionsDiv.appendChild(moveBtn);
            }
        });
        
        // Handle outside/inside actions
        if (cat.room === 'outside') {
            // Cat is outside
            const letInBtn = document.createElement('button');
            letInBtn.className = 'action-btn';
            letInBtn.textContent = '🏠 Let In';
            letInBtn.addEventListener('click', () => {
                this.letCatIn(catId);
                this.closePopup();
            });
            actionsDiv.appendChild(letInBtn);
            
            // Warning if it's evening
            if (this.gameState.time === 'Evening') {
                const warningDiv = document.createElement('div');
                warningDiv.style.color = '#ff6666';
                warningDiv.style.marginTop = '10px';
                warningDiv.style.fontSize = '0.9em';
                warningDiv.textContent = '⚠️ It\'s getting dark! Bring them in soon!';
                actionsDiv.appendChild(warningDiv);
            }
        } else {
            // Cat is inside
            const putOutBtn = document.createElement('button');
            putOutBtn.className = 'action-btn';
            putOutBtn.textContent = '🌳 Put Outside';
            // Disable letting cats out in the evening
            if (this.gameState.time === 'Evening' || this.gameState.time === 'Night') {
                putOutBtn.disabled = true;
                putOutBtn.textContent = '🌙 Too Late to Go Out';
            }
            putOutBtn.addEventListener('click', () => {
                this.putCatOutside(catId);
                this.closePopup();
            });
            actionsDiv.appendChild(putOutBtn);
        }
    }
    
    getHappyBar(happiness) {
        const hearts = Math.ceil(happiness / 20);
        return '❤️'.repeat(hearts) + '🖤'.repeat(5 - hearts);
    }
    
    getHungerBar(hunger) {
        const bones = Math.ceil(hunger / 20);
        return '🍖'.repeat(bones);
    }
    
    getCatMood(cat) {
        if (cat.happy > 70) return '😊 Happy';
        if (cat.happy > 30) return '😐 OK';
        return '😿 Sad';
    }
    
    moveCat(catId, newRoomId) {
        // Check energy first
        if (this.gameState.energy < 3) {
            this.displayMessage("You're too tired to move cats around...");
            return;
        }
        const cat = this.cats[catId];
        const oldRoom = cat.room;
        
        // Remove from old room
        this.rooms[oldRoom].cats = this.rooms[oldRoom].cats.filter(id => id !== catId);
        
        // Add to new room
        cat.room = newRoomId;
        this.rooms[newRoomId].cats.push(catId);
        
        this.displayMessage(`You moved ${cat.name} to the ${this.rooms[newRoomId].name}.`);
        this.useEnergy(3, 'moving cat');
        this.gameState.score += 2;
        
        // Progress time with action
        this.progressTimeWithAction();
        
        this.renderRooms();
        this.checkConflicts();
    }
    
    putCatOutside(catId) {
        if (this.gameState.energy < 3) {
            this.displayMessage("You're too tired to let cats out...");
            return;
        }
        
        const cat = this.cats[catId];
        const oldRoom = cat.room;
        
        // Remove from old room
        this.rooms[oldRoom].cats = this.rooms[oldRoom].cats.filter(id => id !== catId);
        
        // Add to outside
        this.outside.cats.push(catId);
        cat.room = 'outside';
        
        this.displayMessage(`You put ${cat.name} outside to explore.`);
        this.useEnergy(3, 'putting cat outside');
        
        // Risk of cat not coming back
        if (Math.random() < this.settings.wanderChance) {
            cat.wontComeBack = true;
            this.displayMessage(`⚠️ ${cat.name} seems very interested in something far away...`);
        }
        
        // Progress time with action
        this.progressTimeWithAction();
        
        this.renderRooms();
    }
    
    letCatIn(catId) {
        if (this.gameState.energy < 3) {
            this.displayMessage("You're too tired to let cats in...");
            return;
        }
        
        const cat = this.cats[catId];
        
        // Check if cat won't come back
        if (cat.wontComeBack) {
            this.displayMessage(`😿 ${cat.name} doesn't come when called! They've wandered off!`);
            this.outside.cats = this.outside.cats.filter(id => id !== catId);
            this.outside.catsWaitingToComeIn = this.outside.catsWaitingToComeIn.filter(id => id !== catId);
            cat.room = 'missing';
            cat.missing = true;
            this.gameState.score -= 20;
            this.useEnergy(3, 'trying to call cat');
            this.renderRooms();
            return;
        }
        
        // Remove from outside
        this.outside.cats = this.outside.cats.filter(id => id !== catId);
        this.outside.catsWaitingToComeIn = this.outside.catsWaitingToComeIn.filter(id => id !== catId);
        
        // Add to living room (where the door is)
        cat.room = 'livingroom';
        this.rooms.livingroom.cats.push(catId);
        cat.wontComeBack = false;
        
        this.displayMessage(`${cat.name} comes inside happily.`);
        this.useEnergy(3, 'letting cat in');
        this.gameState.score += 3;
        
        // Progress time with action
        this.progressTimeWithAction();
        
        this.renderRooms();
        this.checkConflicts();
    }
    
    searchForCat(catId) {
        const cat = this.cats[catId];
        const searchCost = 15; // Much higher energy cost for searching at night
        
        this.displayMessage(`🔦 You grab a flashlight and go outside to search for ${cat.name}...`);
        
        // Check if you have enough energy
        if (this.gameState.energy >= searchCost) {
            this.useEnergy(searchCost, 'searching at night');
            
            // Higher chance of finding the cat when actively searching
            if (cat.wontComeBack && Math.random() < 0.3) {
                // Still might not find them
                this.displayMessage(`😿 You searched everywhere but couldn't find ${cat.name}!`);
                this.outside.cats = this.outside.cats.filter(id => id !== catId);
                this.outside.catsWaitingToComeIn = this.outside.catsWaitingToComeIn.filter(id => id !== catId);
                cat.room = 'missing';
                cat.missing = true;
                this.gameState.score -= 25;
            } else {
                // Found the cat!
                this.displayMessage(`😅 You found ${cat.name} hiding under a bush!`);
                this.outside.cats = this.outside.cats.filter(id => id !== catId);
                this.outside.catsWaitingToComeIn = this.outside.catsWaitingToComeIn.filter(id => id !== catId);
                cat.room = 'bedroom'; // Put them in bedroom for the night
                this.rooms.bedroom.cats.push(catId);
                cat.wontComeBack = false;
                this.gameState.score += 5;
            }
        } else {
            // Not enough energy to search
            this.displayMessage(`💀 You're too exhausted to search properly...`);
            this.displayMessage(`😿 ${cat.name} is lost for the night!`);
            this.outside.cats = this.outside.cats.filter(id => id !== catId);
            this.outside.catsWaitingToComeIn = this.outside.catsWaitingToComeIn.filter(id => id !== catId);
            cat.room = 'missing';
            cat.missing = true;
            this.gameState.score -= 30;
        }
    }
    
    handleInput() {
        const input = document.getElementById('player-input');
        const command = input.value.toLowerCase().trim();
        input.value = '';
        
        if (this.gameState.isGameOver) {
            this.displayMessage("The game is over. Refresh to play again!");
            return;
        }
        
        this.displayMessage(`> ${command}`, 'player');
        
        const parts = command.split(' ');
        const action = parts[0];
        
        switch(action) {
            case 'feed':
                if (parts[1]) this.feedCat(parts[1]);
                else this.displayMessage("Which cat would you like to feed?");
                break;
            case 'clean':
                this.cleanArea(parts.slice(1).join(' '));
                break;
            case 'play':
                if (parts[1]) this.playWithCat(parts[1]);
                else this.displayMessage("Which cat would you like to play with?");
                break;
            case 'move':
                if (parts[1] && parts[3]) {
                    const catName = parts[1];
                    const roomName = parts[3];
                    const catId = Object.keys(this.cats).find(id => 
                        this.cats[id].name.toLowerCase() === catName
                    );
                    const roomId = Object.keys(this.rooms).find(id => 
                        this.rooms[id].name.toLowerCase() === roomName.toLowerCase()
                    );
                    if (catId && roomId) {
                        this.moveCat(catId, roomId);
                    } else {
                        this.displayMessage("Invalid cat or room name.");
                    }
                } else {
                    this.displayMessage("Usage: move [cat] to [room]");
                }
                break;
            case 'help':
                this.showHelp();
                break;
            case 'skip':
                this.advanceTime();
                break;
            case 'pause':
                this.stopTimeProgression();
                this.autoProgress = false;
                this.displayMessage("⏸️ Time progression paused. Type 'play' to resume.");
                break;
            case 'play':
                this.autoProgress = true;
                this.startTimeProgression();
                this.startClockTicker();
                this.displayMessage("▶️ Time progression resumed.");
                break;
            case 'speed':
                if (parts[1] === 'fast') {
                    this.timeProgressRate = 30000; // 30 seconds
                    this.displayMessage("⏩ Time now progresses faster (30 seconds per period).");
                } else if (parts[1] === 'normal') {
                    this.timeProgressRate = 60000; // 60 seconds
                    this.displayMessage("▶️ Time progression set to normal (60 seconds per period).");
                } else if (parts[1] === 'slow') {
                    this.timeProgressRate = 120000; // 120 seconds
                    this.displayMessage("⏪ Time now progresses slower (2 minutes per period).");
                } else {
                    this.displayMessage("Usage: speed [fast/normal/slow]");
                }
                if (this.autoProgress) {
                    this.stopTimeProgression();
                    this.startTimeProgression();
                }
                break;
            default:
                this.displayMessage("I don't understand that command. Type 'help' for options.");
        }
        
        if (Math.random() < 0.5 && this.gameState.time !== "Night") {
            this.triggerRandomEvent();
        }
    }
    
    feedCat(catId) {
        // Check energy first
        if (this.gameState.energy < 5) {
            this.displayMessage("You're too tired to feed the cats...");
            return;
        }
        // Handle both cat ID and cat name
        if (!this.cats[catId]) {
            catId = Object.keys(this.cats).find(id => 
                this.cats[id].name.toLowerCase() === catId.toLowerCase()
            );
        }
        
        if (!catId) {
            this.displayMessage("I don't know a cat by that name.");
            return;
        }
        
        const cat = this.cats[catId];
        
        if (cat.fed && this.gameState.time === "Morning") {
            this.displayMessage(`${cat.name} has already been fed this morning.`);
            return;
        }
        
        cat.fed = true;
        cat.hunger = Math.max(0, cat.hunger - 50);
        cat.happy += 10;
        this.gameState.score += 5;
        
        this.displayMessage(`You fed ${cat.name}. They purr contentedly.`);
        this.useEnergy(5, 'feeding');
        
        // Progress time with action
        this.progressTimeWithAction();
        
        // Gusty steals food if in the same room as another fed cat
        if (catId === 'gusty' && Math.random() < 0.7) {
            const room = this.rooms[cat.room];
            const otherCats = room.cats.filter(id => id !== 'gusty' && this.cats[id].fed);
            if (otherCats.length > 0) {
                const victim = this.cats[otherCats[0]];
                this.displayMessage(`Oh no! Gusty is eating ${victim.name}'s food too!`);
                victim.hunger += 20;
                victim.happy -= 10;
                this.gameState.score -= 2;
            }
        }
        
        this.checkAllCatsFed();
        this.renderRooms();
    }
    
    cleanMess(roomId, messIndex) {
        // Check energy first
        if (this.gameState.energy < 4) {
            this.displayMessage("You're too tired to clean up messes...");
            return;
        }
        const room = this.rooms[roomId];
        if (room.messes[messIndex]) {
            const mess = room.messes[messIndex];
            room.messes.splice(messIndex, 1);
            
            this.gameState.score += 3;
            this.displayMessage(`You cleaned up the ${mess} in the ${room.name}!`);
            this.useEnergy(4, 'cleaning');
            
            // Progress time with action
            this.progressTimeWithAction();
            
            // Make cats happier when messes are cleaned
            room.cats.forEach(catId => {
                this.cats[catId].happy += 3;
            });
            
            this.renderRooms();
        }
    }
    
    cleanArea(area) {
        let cleaned = 0;
        Object.entries(this.rooms).forEach(([roomId, room]) => {
            if (room.messes.length > 0 && (area === 'all' || room.name.toLowerCase().includes(area))) {
                cleaned += room.messes.length;
                room.messes = [];
            }
        });
        
        if (cleaned > 0) {
            this.gameState.score += cleaned * 3;
            this.displayMessage(`You cleaned up ${cleaned} mess${cleaned > 1 ? 'es' : ''}. Much better!`);
            
            Object.values(this.cats).forEach(cat => {
                cat.happy += 5;
                if (cat.messLevel) cat.messLevel = 0;
            });
        } else {
            this.displayMessage("Everything looks clean right now!");
        }
        
        this.renderRooms();
    }
    
    playWithCat(catId) {
        // Check energy first
        if (this.gameState.energy < 8) {
            this.displayMessage("You're too tired to play with the cats...");
            return;
        }
        // Handle both cat ID and cat name
        if (!this.cats[catId]) {
            catId = Object.keys(this.cats).find(id => 
                this.cats[id].name.toLowerCase() === catId.toLowerCase()
            );
        }
        
        if (!catId) {
            this.displayMessage("I don't know a cat by that name.");
            return;
        }
        
        const cat = this.cats[catId];
        cat.happy = Math.min(100, cat.happy + 20);
        if (cat.aggression) cat.aggression = Math.max(0, cat.aggression - 15);
        this.gameState.score += 3;
        
        this.displayMessage(`You play with ${cat.name}. They seem much happier!`);
        this.useEnergy(8, 'playing');
        
        // Progress time with action
        this.progressTimeWithAction();
        
        this.renderRooms();
    }
    
    triggerRandomEvent() {
        const events = [
            () => {
                if (Math.random() < this.settings.accidentChance && this.rooms[this.cats.snicker.room].messes.length < 3) {
                    const room = this.rooms[this.cats.snicker.room];
                    room.messes.push("💩 poop");
                    this.displayMessage(`💩 Oh no! Snicker has pooped in the ${room.name}!`);
                    this.cats.snicker.messLevel = (this.cats.snicker.messLevel || 0) + 1;
                    this.gameState.score -= 2;
                }
            },
            () => {
                if (Math.random() < this.settings.accidentChance && this.rooms[this.cats.scampi.room].messes.length < 3) {
                    const room = this.rooms[this.cats.scampi.room];
                    room.messes.push("💦 pee");
                    this.displayMessage(`💦 Uh oh! Scampi has peed in the ${room.name}!`);
                    this.cats.scampi.messLevel = (this.cats.scampi.messLevel || 0) + 1;
                    this.gameState.score -= 2;
                }
            },
            () => {
                const hungryCat = this.getRandomCat();
                if (hungryCat && hungryCat.hunger > 50) {
                    this.displayMessage(`🍽️ ${hungryCat.name} is meowing loudly for food!`);
                    hungryCat.hunger += 10;
                    hungryCat.happy -= 5;
                }
            },
            () => {
                this.displayMessage("☀️ A sunbeam appears! All cats are slightly happier.");
                Object.values(this.cats).forEach(cat => cat.happy += 5);
                this.gameState.score += 2;
            },
            () => {
                // Tink needs extra attention
                if (this.cats.tink && !this.cats.tink.missing) {
                    if (this.cats.tink.room !== 'bathroom') {
                        this.displayMessage("😿 Tink is crying! They want to be in the bathroom!");
                        this.cats.tink.happy -= 15;
                    } else if (Math.random() < 0.5) {
                        this.displayMessage("🐈 Tink is meowing for extra attention!");
                        this.cats.tink.happy -= 10;
                    }
                }
            },
            () => {
                // Random cat meows to go outside
                const insideCats = [];
                Object.entries(this.rooms).forEach(([roomId, room]) => {
                    room.cats.forEach(catId => {
                        insideCats.push(catId);
                    });
                });
                
                if (insideCats.length > 0 && Math.random() < 0.3) {
                    const catId = insideCats[Math.floor(Math.random() * insideCats.length)];
                    const cat = this.cats[catId];
                    this.displayMessage(`🚪 ${cat.name} is meowing at the door - they want to go outside!`);
                    cat.happy -= 5;
                }
            },
            () => {
                // Random outside cat wants to come in
                const outsideCats = this.outside.cats.filter(catId => !this.cats[catId].wontComeBack);
                
                if (outsideCats.length > 0 && Math.random() < 0.4) {
                    const catId = outsideCats[Math.floor(Math.random() * outsideCats.length)];
                    const cat = this.cats[catId];
                    this.displayMessage(`🚪 ${cat.name} is scratching at the door to come inside!`);
                }
            }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        event();
        this.renderRooms();
    }
    
    advanceTime() {
        this.currentTimeIndex++;
        
        if (this.currentTimeIndex >= this.timeSequence.length) {
            this.endDay();
            return;
        }
        
        this.gameState.time = this.timeSequence[this.currentTimeIndex];
        this.displayMessage(`\n⏰ Time advances to ${this.gameState.time}.`);
        
        // Reset action counter for new time period
        this.currentActions = 0;
        
        // Regenerate some energy with rest
        const energyGain = 15;
        this.gameState.energy = Math.min(this.gameState.maxEnergy, this.gameState.energy + energyGain);
        this.displayMessage(`💚 You rest a bit and gain ${energyGain} energy.`);
        
        Object.values(this.cats).forEach(cat => {
            cat.hunger += 15;
            if (cat.hunger > 80) cat.happy -= 10;
            if (cat.aggression) cat.aggression += 10;
        });
        
        if (this.gameState.time === "Evening") {
            this.displayMessage("The cats are getting sleepy. One more feeding before bed!");
            Object.values(this.cats).forEach(cat => cat.fed = false);
            
            // Check for cats outside
            const catsOutside = this.outside.cats.filter(catId => !this.cats[catId].missing);
            if (catsOutside.length > 0) {
                this.displayMessage(`⚠️ WARNING: ${catsOutside.length} cat(s) are still outside! It's getting dark!`);
                catsOutside.forEach(catId => {
                    this.displayMessage(`🌙 ${this.cats[catId].name} is still outside!`);
                });
            }
        }
        
        if (this.gameState.time === "Night") {
            this.displayMessage("🌙 The cats are settling down for the night...");
            
            // Force search for any cats still outside
            const catsOutside = this.outside.cats.filter(catId => !this.cats[catId].missing);
            if (catsOutside.length > 0) {
                this.displayMessage(`😱 Oh no! ${catsOutside.length} cat(s) are still outside at bedtime!`);
                this.displayMessage("You must go search for them!");
                
                catsOutside.forEach(catId => {
                    this.searchForCat(catId);
                });
            }
            
            this.endDay();
        }
        
        this.updateDisplay();
        this.renderRooms();
        this.checkConflicts();
    }
    
    endDay() {
        let dayScore = 0;
        let summary = "\n📊 End of Day Summary:\n";
        
        Object.values(this.cats).forEach(cat => {
            if (cat.happy > 70) {
                dayScore += 10;
                summary += `✅ ${cat.name} had a great day!\n`;
            } else if (cat.happy < 30) {
                dayScore -= 5;
                summary += `❌ ${cat.name} had a rough day.\n`;
            } else {
                dayScore += 5;
                summary += `➖ ${cat.name} had an okay day.\n`;
            }
        });
        
        let totalMesses = 0;
        Object.values(this.rooms).forEach(room => {
            totalMesses += room.messes.length;
        });
        
        if (totalMesses > 0) {
            dayScore -= totalMesses * 5;
            summary += `\n🧹 ${totalMesses} messes left uncleaned.\n`;
        }
        
        this.gameState.score += dayScore;
        summary += `\n🏆 Day Score: ${dayScore}`;
        summary += `\n🎯 Total Score: ${this.gameState.score}`;
        
        this.displayMessage(summary);
        this.displayMessage("\n🎮 Thanks for playing! Refresh to play again.");
        this.gameState.isGameOver = true;
        
        // Stop time progression when game ends
        this.stopTimeProgression();
        
        this.updateDisplay();
    }
    
    checkAllCatsFed() {
        const allFed = Object.values(this.cats).every(cat => cat.fed);
        if (allFed && this.gameState.time === "Morning") {
            this.displayMessage("\n✨ All cats have been fed! Great job!");
            this.gameState.score += 10;
            setTimeout(() => this.advanceTime(), 2000);
        }
    }
    
    getRandomCat() {
        const catIds = Object.keys(this.cats);
        return this.cats[catIds[Math.floor(Math.random() * catIds.length)]];
    }
    
    showHelp() {
        const helpText = `
Available Commands:
- Click on a cat to see actions
- feed [cat name] - Feed a specific cat (5 energy)
- clean [room/all] - Clean up messes (4 energy)
- play [cat name] - Play with a cat (8 energy)
- move [cat] to [room] - Move a cat to another room (3 energy)
- skip - Skip to next time period
- pause - Pause automatic time progression
- play - Resume automatic time progression
- speed [fast/normal/slow] - Adjust time speed
- help - Show this help message

Time System:
- Clock shows actual time of day (6 AM - 12 AM)
- Time advances with actions and automatically
- Morning: 6 AM - 12 PM
- Afternoon: 12 PM - 5 PM  
- Evening: 5 PM - 9 PM
- Night: 9 PM - 12 AM
- Use 'pause' to stop time progression

Energy System:
- Start with 100 energy each day
- Actions cost energy (letting out/in: 2, searching at night: 15!)
- Gain 15 energy when time advances
- Game over if energy reaches 0!

Outdoor System:
- Send cats to door when they want out (2 energy)
- Click door to open/close it (1 energy)
- Call outside cats to door (3 energy)
- Cats waiting at door will go through when opened
- Cats can wander off when outside (15% chance)
- Evening warning if cats are outside
- Can't let cats out after Evening
- At Night, you MUST search for cats still outside (15 energy each!)

Cat Conflicts:
- Gusty & Snicker don't get along (food issues)
- Rudy fights with Scampi & Stinky Lee
- Keep conflicting cats in different rooms!
        `;
        this.displayMessage(helpText);
    }
    
    displayMessage(message, type = 'game') {
        const gameText = document.getElementById('game-text');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        gameText.appendChild(messageDiv);
        gameText.scrollTop = gameText.scrollHeight;
    }
    
    updateDisplay() {
        document.getElementById('day').textContent = `Day: ${this.gameState.day}`;
        document.getElementById('time').textContent = `Time: ${this.gameState.time}`;
        document.getElementById('score').textContent = `Score: ${this.gameState.score}`;
        
        // Update energy bar
        const energyBar = document.getElementById('energy-bar');
        const energyPercent = (this.gameState.energy / this.gameState.maxEnergy) * 100;
        const energyBlocks = Math.ceil(energyPercent / 10);
        
        let energyDisplay = '';
        for (let i = 0; i < 10; i++) {
            if (i < energyBlocks) {
                energyDisplay += energyPercent > 30 ? '🟩' : energyPercent > 10 ? '🟨' : '🟥';
            } else {
                energyDisplay += '⬜';
            }
        }
        
        energyBar.textContent = energyDisplay;
        
        // Update clock display
        const clockDisplay = document.getElementById('clock-display');
        const currentPeriod = this.gameState.time;
        const timeData = this.timeOfDay[currentPeriod];
        
        // Calculate current hour based on progress
        const periodDuration = timeData.end - timeData.start;
        const progressInPeriod = this.currentActions / this.actionsPerTimePeriod;
        const hoursProgressed = Math.floor(periodDuration * progressInPeriod);
        const currentHour = timeData.start + hoursProgressed;
        const minutes = Math.floor((progressInPeriod * periodDuration - hoursProgressed) * 60);
        
        // Format time
        const displayHour = currentHour > 12 ? currentHour - 12 : (currentHour === 0 ? 12 : currentHour);
        const amPm = currentHour >= 12 ? 'PM' : 'AM';
        const formattedMinutes = minutes.toString().padStart(2, '0');
        
        clockDisplay.textContent = `🕐 ${displayHour}:${formattedMinutes} ${amPm}`;
        
        // Check for energy depletion
        if (this.gameState.energy <= 0 && !this.gameState.isGameOver) {
            this.energyDepleted();
        }
    }
    
    energyDepleted() {
        this.displayMessage("\n💀 You've run out of energy! You collapse from exhaustion...");
        this.displayMessage("The cats will have to fend for themselves today.");
        this.displayMessage("\n🎮 Game Over! Your final score: " + this.gameState.score);
        this.gameState.isGameOver = true;
        
        // Stop time progression when game ends
        this.stopTimeProgression();
    }
    
    useEnergy(amount, action) {
        const actualCost = Math.ceil(amount * this.settings.energyCostMultiplier);
        this.gameState.energy -= actualCost;
        if (this.gameState.energy < 0) this.gameState.energy = 0;
        
        if (actualCost > 0) {
            this.displayMessage(`[-${actualCost} energy]`, 'energy');
        }
        
        this.updateDisplay();
    }
}

// High Score Management
class HighScoreManager {
    constructor() {
        this.highScores = this.loadHighScores();
    }
    
    loadHighScores() {
        const stored = localStorage.getItem('catlife-highscores');
        return stored ? JSON.parse(stored) : [];
    }
    
    saveHighScores() {
        localStorage.setItem('catlife-highscores', JSON.stringify(this.highScores));
    }
    
    addScore(name, score, difficulty) {
        this.highScores.push({
            name: name,
            score: score,
            difficulty: difficulty,
            date: new Date().toLocaleDateString()
        });
        
        // Sort by score descending
        this.highScores.sort((a, b) => b.score - a.score);
        
        // Keep only top 10
        this.highScores = this.highScores.slice(0, 10);
        
        this.saveHighScores();
    }
    
    displayHighScores() {
        const container = document.getElementById('high-scores-list');
        container.innerHTML = '';
        
        if (this.highScores.length === 0) {
            container.innerHTML = '<div style="color: #888; text-align: center;">No high scores yet!</div>';
            return;
        }
        
        this.highScores.forEach((score, index) => {
            const entry = document.createElement('div');
            entry.className = 'high-score-entry';
            entry.innerHTML = `
                <span>${index + 1}. ${score.name} (${score.difficulty})</span>
                <span>${score.score}</span>
            `;
            container.appendChild(entry);
        });
    }
}

// Start Screen Handler
document.addEventListener('DOMContentLoaded', () => {
    const highScoreManager = new HighScoreManager();
    highScoreManager.displayHighScores();
    
    let selectedDifficulty = 'normal';
    let gameInstance = null;
    
    // Difficulty button handlers
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDifficulty = btn.dataset.difficulty;
        });
    });
    
    // Start game button
    document.getElementById('start-game-btn').addEventListener('click', () => {
        const playerName = document.getElementById('player-name').value.trim() || 'Cat Lover';
        
        // Hide start screen
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        
        // Create new game instance
        gameInstance = new CatLifeGame(playerName, selectedDifficulty);
        
        // Override endDay to save high score
        const originalEndDay = gameInstance.endDay.bind(gameInstance);
        gameInstance.endDay = function() {
            originalEndDay();
            highScoreManager.addScore(playerName, this.gameState.score, selectedDifficulty);
        };
    });
    
    // Allow Enter key to start game
    document.getElementById('player-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('start-game-btn').click();
        }
    });
});