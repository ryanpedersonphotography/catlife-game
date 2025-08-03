class CatLifeGame {
    constructor(playerName, difficulty, gameMode) {
        this.playerName = playerName || 'Cat Lover';
        this.difficulty = difficulty || 'normal';
        this.gameMode = gameMode || 'challenge';
        
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
                messes: [],
                foodBowl: {
                    maxFood: 10,
                    currentFood: 0,
                    position: { x: 250, y: 150 }
                }
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
                messes: [],
                litterBoxes: [
                    {
                        id: 'box1',
                        position: { x: 50, y: 50 },
                        cleanliness: 100, // 100 = clean, 0 = needs cleaning
                        maxCapacity: 5,   // Uses before needing cleaning
                        currentUses: 0
                    },
                    {
                        id: 'box2',
                        position: { x: 350, y: 50 },
                        cleanliness: 100,
                        maxCapacity: 5,
                        currentUses: 0
                    }
                ]
            }
        };
        
        // Define room connections (which rooms connect to which)
        this.roomConnections = {
            kitchen: ['livingroom'],
            livingroom: ['kitchen', 'bedroom', 'bathroom'], // Removed 'outside' - cats can't go out on their own
            bedroom: ['livingroom'],
            bathroom: ['livingroom']
        };
        
        // Define door positions for pathfinding
        this.doorPositions = {
            'kitchen-livingroom': { kitchen: { x: 350, y: 150 }, livingroom: { x: 420, y: 150 } },
            'livingroom-bedroom': { livingroom: { x: 420, y: 320 }, bedroom: { x: 420, y: 320 } },
            'livingroom-bathroom': { livingroom: { x: 660, y: 420 }, bathroom: { x: 660, y: 420 } },
            'livingroom-outside': { livingroom: { x: 700, y: 50 }, outside: { x: 700, y: 0 } }
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
                asleep: false,
                happy: 50,
                trait: "always eats other cats' food",
                hunger: 80,
                room: "kitchen",
                emoji: "🐱",
                messLevel: 0,
                health: 75,
                conflicts: ["snicker"] // Gusty steals Snicker's food
            },
            snicker: {
                name: "Snicker",
                fed: false,
                asleep: false,
                happy: 50,
                trait: "poops everywhere",
                hunger: 70,
                room: "livingroom",
                emoji: "😸",
                messLevel: 0,
                health: 75,
                conflicts: ["gusty"] // Gets food stolen by Gusty
            },
            rudy: {
                name: "Rudy",
                fed: false,
                asleep: false,
                happy: 50,
                trait: "fights with other cats",
                hunger: 75,
                room: "bedroom",
                emoji: "😾",
                messLevel: 0,
                health: 75,
                aggression: 80,
                conflicts: ["scampi", "stinkylee", "lucy"] // Fights with these cats
            },
            scampi: {
                name: "Scampi",
                fed: false,
                asleep: false,
                happy: 50,
                trait: "pees everywhere",
                hunger: 70,
                room: "kitchen",
                emoji: "😹",
                messLevel: 0,
                health: 75,
                conflicts: ["rudy"] // Gets bullied by Rudy
            },
            stinkylee: {
                name: "Stinky Lee",
                fed: false,
                asleep: false,
                happy: 50,
                trait: "mysterious and aloof",
                hunger: 60,
                room: "bedroom",
                emoji: "😼",
                messLevel: 0,
                health: 75,
                conflicts: ["rudy"] // Doesn't like Rudy's aggression
            },
            jonah: {
                name: "Jonah",
                fed: false,
                asleep: false,
                happy: 50,
                trait: "gentle soul",
                hunger: 65,
                room: "livingroom",
                emoji: "😺",
                messLevel: 0,
                health: 75,
                conflicts: [] // Gets along with everyone
            },
            tink: {
                name: "Tink",
                fed: false,
                asleep: false,
                happy: 50,
                trait: "needs extra attention, loves bathroom",
                hunger: 85,
                room: "bathroom",
                emoji: "🐈",
                messLevel: 0,
                health: 65, // Lower health - needs extra care
                needsExtra: true,
                favoriteRoom: "bathroom",
                conflicts: []
            },
            lucy: {
                name: "Lucy",
                fed: false,
                asleep: false,
                happy: 50,
                trait: "independent and feisty",
                hunger: 70,
                room: "bedroom",
                emoji: "🐈‍⬛",
                messLevel: 0,
                health: 75,
                conflicts: ["rudy"] // Doesn't get along with Rudy
            },
            giselle: {
                name: "Giselle",
                fed: false,
                asleep: false,
                happy: 50,
                trait: "graceful and elegant",
                hunger: 60,
                room: "livingroom",
                emoji: "😻",
                messLevel: 0,
                health: 75,
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
        
        // Daily statistics tracking
        this.dailyStats = {
            catsFed: 0,
            messesCleaned: 0,
            playSessions: 0,
            energyUsed: 0,
            conflictsOccurred: 0,
            dayStartScore: 0,
            sleepScore: 0,
            bonusScore: 0
        };
        
        this.timeSequence = ["Morning", "Afternoon", "Evening", "Night"];
        this.currentTimeIndex = 0;
        
        // Time of day tracking
        this.timeOfDay = {
            "Morning": { start: 6, end: 12, current: 6 },
            "Afternoon": { start: 12, end: 18, current: 12 },
            "Evening": { start: 18, end: 22, current: 18 },
            "Night": { start: 22, end: 24, current: 22 }
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
        // Initialize cat movement states first
        this.catMovementStates = {};
        
        // Clear all room cats arrays first
        Object.values(this.rooms).forEach(room => {
            room.cats = [];
        });
        
        // Get available indoor rooms (exclude outside)
        const indoorRooms = ['kitchen', 'livingroom', 'bedroom', 'bathroom'];
        
        // Randomize initial cat locations - all cats start inside
        // Try to avoid conflicts when placing cats
        const catsToPlace = Object.entries(this.cats);
        
        while (catsToPlace.length > 0) {
            const [catId, cat] = catsToPlace.shift();
            
            // Try to find a room without conflicts
            let bestRoom = null;
            let leastConflicts = Infinity;
            
            // Shuffle rooms for variety
            const shuffledRooms = [...indoorRooms].sort(() => Math.random() - 0.5);
            
            for (const roomId of shuffledRooms) {
                let conflictCount = 0;
                
                // Check for conflicts with cats already in this room
                for (const otherCatId of this.rooms[roomId].cats) {
                    const otherCat = this.cats[otherCatId];
                    if ((cat.conflicts && cat.conflicts.includes(otherCatId)) ||
                        (otherCat.conflicts && otherCat.conflicts.includes(catId))) {
                        conflictCount++;
                    }
                }
                
                if (conflictCount < leastConflicts) {
                    leastConflicts = conflictCount;
                    bestRoom = roomId;
                    
                    // If we found a room with no conflicts, use it immediately
                    if (conflictCount === 0) break;
                }
            }
            
            // Place cat in the best room found
            if (!bestRoom) bestRoom = indoorRooms[0]; // Fallback
            
            cat.room = bestRoom;
            this.rooms[bestRoom].cats.push(catId);
            
            // Initialize movement state for this cat
            const positions = this.getCatPositions(bestRoom);
            const catIndex = this.rooms[bestRoom].cats.indexOf(catId);
            const position = positions[catIndex] || positions[0];
            
            this.catMovementStates[catId] = {
                targetX: position.x,
                targetY: position.y,
                currentX: position.x,
                currentY: position.y,
                speed: 0.03 + Math.random() * 0.05, // Much slower: 0.03-0.08 pixels per frame
                restTimer: 0,
                isResting: false
            };
        }
        
        this.updateDisplay();
        this.renderRooms();
        this.updateCastPanel();
        this.displayMessage("Good morning! It's time to feed your special needs cats.");
        this.displayMessage("Click on a cat to interact with them, or use text commands.");
        this.displayMessage("The cats are scattered throughout the house.");
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
        
        // Start cat movement
        this.startCatMovement();
        
        // Start micro movements within rooms
        this.startMicroMovements();
        
        // Start random events (messes, etc)
        this.startRandomEvents();
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
                
                // Increase cat mess levels over time
                Object.values(this.cats).forEach(cat => {
                    if (!cat.missing && cat.room !== 'outside' && !cat.asleep) {
                        cat.messLevel = Math.min(100, (cat.messLevel || 0) + 5);
                        
                        // If very high, cat might head to bathroom
                        if (cat.messLevel > 85 && cat.room !== 'bathroom') {
                            if (Math.random() < 0.3) { // 30% chance
                                this.displayMessage(`🚽 ${cat.name} is looking for a litter box!`);
                            }
                        }
                    }
                });
                
                // Update health periodically (every 30 seconds)
                if (this.healthUpdateCounter === undefined) {
                    this.healthUpdateCounter = 0;
                }
                this.healthUpdateCounter++;
                
                if (this.healthUpdateCounter >= 3) { // 3 * 10 seconds = 30 seconds
                    this.updateAllCatHealth();
                    this.healthUpdateCounter = 0;
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
    
    startCatMovement() {
        // Cats check if they need to go to kitchen when hungry
        this.catMovementInterval = setInterval(() => {
            if (!this.gameState.isGameOver && this.gameState.time !== "Night") {
                this.checkHungryCats();
            }
        }, 10000 + Math.random() * 5000); // 10-15 seconds randomly
    }
    
    stopCatMovement() {
        if (this.catMovementInterval) {
            clearInterval(this.catMovementInterval);
            this.catMovementInterval = null;
        }
    }
    
    startRandomEvents() {
        // Random events every 20-40 seconds
        this.randomEventInterval = setInterval(() => {
            if (!this.gameState.isGameOver && this.gameState.time !== "Night") {
                if (Math.random() < 0.7) { // 70% chance
                    this.triggerRandomEvent();
                }
            }
        }, 20000 + Math.random() * 20000);
    }
    
    stopRandomEvents() {
        if (this.randomEventInterval) {
            clearInterval(this.randomEventInterval);
            this.randomEventInterval = null;
        }
    }
    
    checkHungryCats() {
        const foodBowl = this.rooms.kitchen.foodBowl;
        
        // Check for cats that need bathroom
        Object.entries(this.cats).forEach(([catId, cat]) => {
            if (cat.messLevel > 85 && !cat.missing && 
                cat.room !== 'bathroom' && cat.room !== 'outside' && !cat.asleep) {
                
                // Check for clean litter boxes
                const cleanBoxes = this.rooms.bathroom.litterBoxes.filter(box => box.cleanliness > 20);
                if (cleanBoxes.length === 0) {
                    // No clean boxes, might have accident
                    if (Math.random() < 0.1) { // 10% chance per check
                        this.triggerAccident(catId);
                    }
                    return;
                }
                
                // Try to go to bathroom
                const path = this.findPath(cat.room, 'bathroom');
                if (!path || path.length < 2) return;
                
                const nextRoom = path[1];
                const hasConflict = this.checkForConflictsInPath(catId, nextRoom, 'bathroom');
                
                if (!hasConflict && Math.random() < 0.5) { // 50% chance to move
                    this.displayMessage(`🚽 ${cat.name} is heading to the bathroom!`);
                    this.animateCatMovementThroughDoor(catId, cat.room, nextRoom);
                }
            }
        });
        
        // Original hungry cat logic
        if (foodBowl.currentFood === 0) return; // No food available
        
        // Find hungry cats not in kitchen
        Object.entries(this.cats).forEach(([catId, cat]) => {
            if (cat.hunger > 70 && !cat.fed && !cat.missing && 
                cat.room !== 'kitchen' && cat.room !== 'outside' && !cat.asleep) {
                
                // Check if there's a path to kitchen without conflicts
                const path = this.findPath(cat.room, 'kitchen');
                if (!path || path.length < 2) return;
                
                const nextRoom = path[1];
                
                const hasConflict = this.checkForConflictsInPath(catId, nextRoom, 'kitchen');
                
                // Move if no conflicts and very hungry
                if (!hasConflict && cat.hunger > 85) {
                    this.displayMessage(`😾 ${cat.name} is very hungry and heading to the kitchen!`);
                    this.animateCatMovementThroughDoor(catId, cat.room, nextRoom);
                }
            }
        });
    }
    
    checkForConflictsInPath(catId, nextRoom, destinationRoom) {
        const cat = this.cats[catId];
        let hasConflict = false;
        
        // Check conflicts in next room
        for (let otherCatId of this.rooms[nextRoom].cats) {
            const otherCat = this.cats[otherCatId];
            if ((cat.conflicts && cat.conflicts.includes(otherCatId)) || 
                (otherCat.conflicts && otherCat.conflicts.includes(catId))) {
                hasConflict = true;
                break;
            }
        }
        
        // Check conflicts in destination room
        if (!hasConflict && destinationRoom !== nextRoom) {
            for (let otherCatId of this.rooms[destinationRoom].cats) {
                const otherCat = this.cats[otherCatId];
                if ((cat.conflicts && cat.conflicts.includes(otherCatId)) || 
                    (otherCat.conflicts && otherCat.conflicts.includes(catId))) {
                    hasConflict = true;
                    break;
                }
            }
        }
        
        return hasConflict;
    }
    
    triggerAccident(catId) {
        const cat = this.cats[catId];
        const room = this.rooms[cat.room];
        
        if (room.messes.length >= 3) return; // Room too messy already
        
        // Determine type based on cat
        const messType = (cat.name === 'Scampi' || Math.random() < 0.5) ? 'pee' : 'poop';
        
        room.messes.push({ type: messType });
        cat.messLevel = 0;
        cat.happy -= 20;
        
        // Accidents hurt health
        this.updateCatHealth(catId, -3, "had an accident");
        
        if (messType === 'poop') {
            this.displayMessage(`💩 Oh no! ${cat.name} couldn't find a clean litter box and had an accident in the ${room.name}!`);
        } else {
            this.displayMessage(`💦 Uh oh! ${cat.name} couldn't hold it and peed in the ${room.name}!`);
        }
        
        this.gameState.score -= 5;
        this.renderRooms();
    }
    
    startMicroMovements() {
        // Initialize cat movement states only if not already initialized
        if (!this.catMovementStates) {
            this.catMovementStates = {};
            
            Object.keys(this.cats).forEach(catId => {
                this.catMovementStates[catId] = {
                    targetX: null,
                    targetY: null,
                    currentX: 0,
                    currentY: 0,
                    speed: 0.03 + Math.random() * 0.05, // Much slower: 0.03-0.08 pixels per frame // Much slower speed (0.1-0.25 pixels per frame)
                    restTimer: 0,
                    isResting: false
                };
            });
        }
        
        // Start continuous movement loop
        this.continuousMovementLoop();
    }
    
    stopMicroMovements() {
        if (this.microMovementFrame) {
            cancelAnimationFrame(this.microMovementFrame);
            this.microMovementFrame = null;
        }
    }
    
    checkCatCollision(catId1, x1, y1, catId2) {
        if (catId1 === catId2) return false;
        
        const cat2Element = document.getElementById(`cat-${catId2}`);
        if (!cat2Element) return false;
        
        const state2 = this.catMovementStates[catId2];
        if (!state2) return false;
        
        // Get cat2 position
        const x2 = state2.currentX;
        const y2 = state2.currentY;
        
        // Check distance (cat size is about 60px)
        const distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
        return distance < 50; // Collision if closer than 50px
    }
    
    getCatsInSameRoom(catId, roomId) {
        return Object.entries(this.cats)
            .filter(([id, cat]) => id !== catId && cat.room === roomId && !cat.missing)
            .map(([id]) => id);
    }
    
    startCatFight(catId1, catId2) {
        const cat1 = this.cats[catId1];
        const cat2 = this.cats[catId2];
        
        // Check if they're already fighting
        if (this.currentFight) return;
        
        this.currentFight = { cat1: catId1, cat2: catId2, timer: 60 }; // 1 second fight
        
        this.displayMessage(`😾 ${cat1.name} and ${cat2.name} are fighting!`);
        
        // Reduce happiness for both cats
        cat1.happy -= 15;
        cat2.happy -= 15;
        this.gameState.score -= 5;
        
        // Fights hurt health
        this.updateCatHealth(catId1, -2, "got in a fight");
        this.updateCatHealth(catId2, -2, "got in a fight");
        
        // Visual fight effect
        const cat1Element = document.getElementById(`cat-${catId1}`);
        const cat2Element = document.getElementById(`cat-${catId2}`);
        
        if (cat1Element) cat1Element.classList.add('fighting');
        if (cat2Element) cat2Element.classList.add('fighting');
        
        // Add fight cloud effect
        this.createFightCloud(catId1, catId2);
    }
    
    createFightCloud(catId1, catId2) {
        const state1 = this.catMovementStates[catId1];
        const state2 = this.catMovementStates[catId2];
        
        if (!state1 || !state2) return;
        
        const cloudX = (state1.currentX + state2.currentX) / 2;
        const cloudY = (state1.currentY + state2.currentY) / 2;
        
        const cloud = document.createElement('div');
        cloud.className = 'fight-cloud';
        cloud.innerHTML = '💥';
        cloud.style.position = 'absolute';
        cloud.style.left = cloudX + 'px';
        cloud.style.top = cloudY + 'px';
        cloud.style.fontSize = '40px';
        cloud.style.zIndex = '100';
        cloud.style.pointerEvents = 'none';
        
        const cat1Element = document.getElementById(`cat-${catId1}`);
        if (cat1Element && cat1Element.parentElement) {
            cat1Element.parentElement.appendChild(cloud);
        }
        
        // Remove cloud after fight
        setTimeout(() => cloud.remove(), 1000);
    }
    
    continuousMovementLoop() {
        if (this.gameState.isGameOver) return;
        
        // Handle ongoing fights
        if (this.currentFight) {
            this.currentFight.timer--;
            if (this.currentFight.timer <= 0) {
                // End fight
                const cat1Element = document.getElementById(`cat-${this.currentFight.cat1}`);
                const cat2Element = document.getElementById(`cat-${this.currentFight.cat2}`);
                
                if (cat1Element) cat1Element.classList.remove('fighting');
                if (cat2Element) cat2Element.classList.remove('fighting');
                
                // Push cats apart
                const state1 = this.catMovementStates[this.currentFight.cat1];
                const state2 = this.catMovementStates[this.currentFight.cat2];
                
                if (state1 && state2) {
                    // Move cats in opposite directions
                    state1.targetX = state1.currentX - 50;
                    state1.targetY = state1.currentY - 30;
                    state2.targetX = state2.currentX + 50;
                    state2.targetY = state2.currentY + 30;
                    
                    this.displayMessage(`The fight ended. Both cats storm off angrily!`);
                }
                
                this.currentFight = null;
            }
        }
        
        Object.entries(this.cats).forEach(([catId, cat]) => {
            // Skip cats that shouldn't move
            if (cat.missing || cat.room === 'outside') return;
            
            const catElement = document.getElementById(`cat-${catId}`);
            if (!catElement) return;
            
            const roomContainer = catElement.parentElement?.parentElement;
            if (!roomContainer) return;
            
            const state = this.catMovementStates[catId];
            if (!state) return;
            
            // Get room boundaries
            const roomWidth = parseInt(roomContainer.style.width) || 300;
            const roomHeight = parseInt(roomContainer.style.height) || 200;
            
            // Handle sleeping cats
            if (cat.asleep) {
                state.isResting = true;
                state.restTimer = 1000; // Sleep for a long time
                return;
            }
            
            // Handle resting
            if (state.isResting) {
                state.restTimer--;
                if (state.restTimer <= 0) {
                    state.isResting = false;
                    state.targetX = null; // Pick new target
                }
                return;
            }
            
            // Handle movement delay for desynchronization
            if (state.movementDelay && state.movementDelay > 0) {
                state.movementDelay--;
                return;
            }
            
            // Pick new target if needed
            if (state.targetX === null || state.targetY === null || 
                (Math.abs(state.currentX - state.targetX) < 5 && 
                 Math.abs(state.currentY - state.targetY) < 5)) {
                
                // Check if we reached the food bowl
                if (state.goingToEat && cat.room === 'kitchen') {
                    const foodBowl = this.rooms.kitchen.foodBowl;
                    if (foodBowl.currentFood > 0 && !cat.fed) {
                        // Eat from bowl
                        foodBowl.currentFood--;
                        cat.fed = true;
                        cat.hunger = 0;
                        cat.happy += 20;
                        this.dailyStats.catsFed++;
                        
                        this.displayMessage(`😊 ${cat.name} is eating from the food bowl!`);
                        this.updateScore(5);
                        
                        // Check if bowl is empty
                        if (foodBowl.currentFood === 0) {
                            this.displayMessage("🥣 The food bowl is now empty!");
                        }
                        
                        // Re-render to update bowl appearance
                        this.renderRooms();
                    }
                    state.goingToEat = false;
                }
                
                // Check if we reached the litter box
                if (state.goingToBathroom && cat.room === 'bathroom' && state.targetBox) {
                    const box = state.targetBox;
                    
                    // Use the litter box
                    box.currentUses++;
                    box.cleanliness = Math.max(0, box.cleanliness - 20);
                    cat.messLevel = 0;
                    cat.happy += 10;
                    
                    this.displayMessage(`🚽 ${cat.name} used the litter box.`);
                    
                    // Check if box is getting full
                    if (box.currentUses >= box.maxCapacity) {
                        this.displayMessage("🚨💩 The litter box is FULL and needs cleaning NOW! 🚨");
                        box.cleanliness = 0;
                        // Alert for all full boxes
                        const allBoxesFull = this.rooms.bathroom.litterBoxes.every(b => b.currentUses >= b.maxCapacity);
                        if (allBoxesFull) {
                            this.displayMessage("⚠️ ALL LITTER BOXES ARE FULL! Cats will have accidents!");
                        }
                    } else if (box.currentUses === box.maxCapacity - 1) {
                        this.displayMessage("⚠️ This litter box is almost full!");
                    }
                    
                    // Re-render to update box appearance
                    this.renderRooms();
                    
                    state.goingToBathroom = false;
                    state.targetBox = null;
                }
                
                // Reached target or need new one
                if (Math.random() < 0.5) { // 50% chance to rest
                    state.isResting = true;
                    state.restTimer = 200 + Math.random() * 400; // Rest for 200-600 frames (3-10 seconds)
                    
                    // Randomize when cats move to avoid synchronized movement
                    state.movementDelay = Math.random() * 120; // 0-2 second delay
                    
                    // Sometimes cats decide to take a short nap
                    if (Math.random() < 0.1 && cat.happy > 50) {
                        cat.asleep = true;
                        catElement.classList.add('sleeping');
                        setTimeout(() => {
                            cat.asleep = false;
                            catElement.classList.remove('sleeping');
                            this.displayMessage(`😸 ${cat.name} woke up from their nap!`);
                        }, 10000 + Math.random() * 10000); // 10-20 second naps
                    }
                } else {
                    // Check if cat is hungry and in kitchen
                    if (cat.room === 'kitchen' && cat.hunger > 50 && !cat.fed) {
                        const foodBowl = this.rooms.kitchen.foodBowl;
                        if (foodBowl.currentFood > 0) {
                            // Move towards food bowl
                            state.targetX = foodBowl.position.x;
                            state.targetY = foodBowl.position.y;
                            state.goingToEat = true;
                        } else {
                            // Pick random target if no food
                            const margin = 40;
                            state.targetX = margin + Math.random() * (roomWidth - margin * 2);
                            state.targetY = margin + Math.random() * (roomHeight - margin * 2);
                        }
                    } 
                    // Check if cat needs bathroom and is in bathroom
                    else if (cat.room === 'bathroom' && cat.messLevel && cat.messLevel > 70) {
                        const litterBoxes = this.rooms.bathroom.litterBoxes;
                        // Find cleanest available litter box
                        let cleanestBox = null;
                        let highestCleanliness = 0;
                        
                        litterBoxes.forEach(box => {
                            // Only consider boxes that aren't full
                            if (box.currentUses < box.maxCapacity && box.cleanliness > highestCleanliness) {
                                highestCleanliness = box.cleanliness;
                                cleanestBox = box;
                            }
                        });
                        
                        if (cleanestBox && cleanestBox.cleanliness > 20) {
                            // Move towards litter box
                            state.targetX = cleanestBox.position.x + 20;
                            state.targetY = cleanestBox.position.y + 20;
                            state.goingToBathroom = true;
                            state.targetBox = cleanestBox;
                        } else {
                            // All boxes too dirty or full
                            const margin = 40;
                            state.targetX = margin + Math.random() * (roomWidth - margin * 2);
                            state.targetY = margin + Math.random() * (roomHeight - margin * 2);
                            
                            // High chance of accident if no usable litter box
                            if (Math.random() < 0.3 && cat.messLevel > 85) {
                                this.catAccident(catId);
                            }
                        }
                    } else {
                        // Pick new target within room bounds with better margins
                        const margin = 40; // Keep cats well within room boundaries
                        state.targetX = margin + Math.random() * (roomWidth - margin * 2);
                        state.targetY = margin + Math.random() * (roomHeight - margin * 2);
                    }
                    
                    // Make sure target is within bounds
                    state.targetX = Math.max(40, Math.min(state.targetX, roomWidth - 40));
                    state.targetY = Math.max(40, Math.min(state.targetY, roomHeight - 40));
                }
            }
            
            // Move towards target
            if (!state.isResting && state.targetX !== null && state.targetY !== null && !this.currentFight) {
                const dx = state.targetX - state.currentX;
                const dy = state.targetY - state.currentY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    // Normalize and apply speed
                    const moveX = (dx / distance) * state.speed;
                    const moveY = (dy / distance) * state.speed;
                    
                    // Calculate new position
                    const newX = state.currentX + moveX;
                    const newY = state.currentY + moveY;
                    
                    // Check for collisions with other cats in the same room
                    const catsInRoom = this.getCatsInSameRoom(catId, cat.room);
                    let collision = false;
                    let collidingCatId = null;
                    
                    for (const otherCatId of catsInRoom) {
                        if (this.checkCatCollision(catId, newX, newY, otherCatId)) {
                            collision = true;
                            collidingCatId = otherCatId;
                            break;
                        }
                    }
                    
                    if (collision && collidingCatId) {
                        // Check if these cats are enemies
                        const otherCat = this.cats[collidingCatId];
                        if ((cat.conflicts && cat.conflicts.includes(collidingCatId)) || 
                            (otherCat.conflicts && otherCat.conflicts.includes(catId))) {
                            // Start a fight only on actual collision!
                            this.startCatFight(catId, collidingCatId);
                        } else {
                            // Just avoid - pick a new target
                            state.targetX = state.currentX + (Math.random() - 0.5) * 100;
                            state.targetY = state.currentY + (Math.random() - 0.5) * 100;
                        }
                    } else {
                        // No collision, proceed with movement
                        state.currentX = newX;
                        state.currentY = newY;
                        
                        // Ensure cats stay within room bounds with margin
                        const margin = 20;
                        state.currentX = Math.max(margin, Math.min(state.currentX, roomWidth - 60 - margin));
                        state.currentY = Math.max(margin, Math.min(state.currentY, roomHeight - 60 - margin));
                        
                        // Apply position
                        catElement.style.left = state.currentX + 'px';
                        catElement.style.top = state.currentY + 'px';
                        
                        // Face direction of movement
                        const svg = catElement.querySelector('svg');
                        if (svg) {
                            if (moveX > 0) {
                                svg.style.transform = 'scaleX(1)';
                            } else if (moveX < 0) {
                                svg.style.transform = 'scaleX(-1)';
                            }
                        }
                    }
                }
            }
        });
        
        // Continue loop
        this.microMovementFrame = requestAnimationFrame(() => this.continuousMovementLoop());
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
        
        // Update cast panel after rendering rooms
        setTimeout(() => this.updateCastPanel(), 0);
        
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
            rect.setAttribute('fill', hasConflict ? 'rgba(255,100,0,0.05)' : 'transparent');
            rect.setAttribute('stroke', hasConflict ? '#ff8800' : '#00ff00');
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
            roomContainer.dataset.roomId = roomId; // Add data attribute for animation
            roomContainer.style.position = 'absolute';
            roomContainer.style.left = coords.x + 'px';
            roomContainer.style.top = coords.y + 'px';
            roomContainer.style.width = coords.width + 'px';
            roomContainer.style.height = coords.height + 'px';
            roomContainer.style.pointerEvents = 'all'; // Make room containers receive clicks
            
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
        // Kitchen to Living Room door
        this.drawDoor(svg, 395, 140, 30, 20, 'horizontal', '#D2691E');
        
        // Living Room to Bedroom door (vertical)
        this.drawDoor(svg, 190, 295, 20, 30, 'vertical', '#D2691E');
        
        // Living Room to Bathroom door (vertical)
        this.drawDoor(svg, 650, 395, 20, 30, 'vertical', '#D2691E');
        
        // Front door (Living Room to Outside) - special red door
        this.drawDoor(svg, 690, 40, 20, 50, 'vertical', '#8B0000', true);
    }
    
    drawDoor(svg, x, y, width, height, orientation, doorColor = '#D2691E', isFrontDoor = false) {
        const doorGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Door frame
        const frame = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        frame.setAttribute('x', x);
        frame.setAttribute('y', y);
        frame.setAttribute('width', width);
        frame.setAttribute('height', height);
        frame.setAttribute('fill', '#8B4513');
        frame.setAttribute('stroke', '#654321');
        frame.setAttribute('stroke-width', '2');
        doorGroup.appendChild(frame);
        
        // Door panel
        const door = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        door.setAttribute('x', x + 2);
        door.setAttribute('y', y + 2);
        door.setAttribute('width', width - 4);
        door.setAttribute('height', height - 4);
        door.setAttribute('fill', doorColor);
        door.setAttribute('stroke', '#654321');
        door.setAttribute('stroke-width', '1');
        doorGroup.appendChild(door);
        
        // Door knob
        const knob = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        if (orientation === 'horizontal') {
            knob.setAttribute('cx', x + width - 5);
            knob.setAttribute('cy', y + height / 2);
        } else {
            knob.setAttribute('cx', x + width / 2);
            knob.setAttribute('cy', y + height - 10);
        }
        knob.setAttribute('r', '2');
        knob.setAttribute('fill', '#FFD700');
        doorGroup.appendChild(knob);
        
        // Add window to front door
        if (isFrontDoor) {
            const window = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            window.setAttribute('x', x + 6);
            window.setAttribute('y', y + 10);
            window.setAttribute('width', 8);
            window.setAttribute('height', 8);
            window.setAttribute('fill', '#87CEEB');
            window.setAttribute('stroke', '#654321');
            window.setAttribute('stroke-width', '0.5');
            doorGroup.appendChild(window);
            
            // Add door mat
            const mat = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            mat.setAttribute('x', x - 5);
            mat.setAttribute('y', y + height);
            mat.setAttribute('width', width + 10);
            mat.setAttribute('height', 10);
            mat.setAttribute('fill', '#8B4513');
            mat.setAttribute('stroke', '#654321');
            mat.setAttribute('stroke-width', '1');
            mat.setAttribute('opacity', '0.5');
            doorGroup.appendChild(mat);
            
            // Add "Welcome" text on mat
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x + width / 2);
            text.setAttribute('y', y + height + 7);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '6');
            text.setAttribute('fill', '#FFF');
            text.setAttribute('font-family', 'Arial');
            text.textContent = 'MEOW';
            doorGroup.appendChild(text);
        }
        
        svg.appendChild(doorGroup);
    }
    
    renderRoomContents(roomId, container) {
        const room = this.rooms[roomId];
        
        // Render litter boxes if this is the bathroom
        if (roomId === 'bathroom' && room.litterBoxes) {
            room.litterBoxes.forEach((box, index) => {
                const boxDiv = document.createElement('div');
                boxDiv.className = 'litter-box';
                boxDiv.style.position = 'absolute';
                boxDiv.style.left = box.position.x + 'px';
                boxDiv.style.top = box.position.y + 'px';
                boxDiv.style.cursor = 'pointer';
                boxDiv.style.fontSize = '35px';
                boxDiv.style.userSelect = 'none';
                boxDiv.style.zIndex = '18';
                boxDiv.style.pointerEvents = 'all';
                
                // Create a container for the litter box with fill indicator
                boxDiv.style.position = 'relative';
                boxDiv.style.display = 'inline-block';
                
                // Show different box based on cleanliness and fullness
                const fillLevel = (box.currentUses / box.maxCapacity) * 100;
                
                if (box.cleanliness > 80) {
                    boxDiv.innerHTML = '🟦'; // Clean box
                    boxDiv.title = `Clean litter box (${box.currentUses}/${box.maxCapacity} uses)`;
                } else if (box.cleanliness > 40) {
                    boxDiv.innerHTML = '🟫'; // Getting dirty
                    boxDiv.title = `Litter box getting dirty (${box.currentUses}/${box.maxCapacity} uses)`;
                } else {
                    boxDiv.innerHTML = '🟪'; // Needs cleaning
                    boxDiv.title = `Dirty litter box - click to clean! (${box.currentUses}/${box.maxCapacity} uses)`;
                    // Add stink lines for dirty box
                    const stinkDiv = document.createElement('div');
                    stinkDiv.style.position = 'absolute';
                    stinkDiv.style.left = '-5px';
                    stinkDiv.style.top = '-10px';
                    stinkDiv.style.fontSize = '20px';
                    stinkDiv.style.animation = 'float 2s ease-in-out infinite';
                    stinkDiv.innerHTML = '💨';
                    boxDiv.appendChild(stinkDiv);
                }
                
                // Add visual fill indicator
                const fillIndicator = document.createElement('div');
                fillIndicator.style.position = 'absolute';
                fillIndicator.style.bottom = '0';
                fillIndicator.style.left = '0';
                fillIndicator.style.width = '100%';
                fillIndicator.style.height = `${fillLevel}%`;
                fillIndicator.style.backgroundColor = 'rgba(139, 69, 19, 0.6)';
                fillIndicator.style.borderRadius = '0 0 5px 5px';
                fillIndicator.style.pointerEvents = 'none';
                fillIndicator.style.transition = 'height 0.3s ease';
                boxDiv.appendChild(fillIndicator);
                
                // Add poop emojis based on usage
                if (box.currentUses > 0) {
                    const poopContainer = document.createElement('div');
                    poopContainer.style.position = 'absolute';
                    poopContainer.style.bottom = '5px';
                    poopContainer.style.left = '50%';
                    poopContainer.style.transform = 'translateX(-50%)';
                    poopContainer.style.fontSize = '12px';
                    poopContainer.style.pointerEvents = 'none';
                    
                    // Show appropriate number of poops
                    const poopCount = Math.min(box.currentUses, 3);
                    poopContainer.textContent = '💩'.repeat(poopCount);
                    
                    boxDiv.appendChild(poopContainer);
                }
                
                // Add fill level text
                const fillText = document.createElement('div');
                fillText.style.position = 'absolute';
                fillText.style.top = '-20px';
                fillText.style.left = '50%';
                fillText.style.transform = 'translateX(-50%)';
                fillText.style.fontSize = '12px';
                fillText.style.fontWeight = 'bold';
                fillText.style.color = box.currentUses >= box.maxCapacity ? '#ff0000' : '#000';
                fillText.textContent = `${box.currentUses}/${box.maxCapacity}`;
                boxDiv.appendChild(fillText);
                
                // Add "FULL!" indicator if at capacity
                if (box.currentUses >= box.maxCapacity) {
                    const fullIndicator = document.createElement('div');
                    fullIndicator.style.position = 'absolute';
                    fullIndicator.style.top = '-35px';
                    fullIndicator.style.left = '50%';
                    fullIndicator.style.transform = 'translateX(-50%)';
                    fullIndicator.style.fontSize = '14px';
                    fullIndicator.style.fontWeight = 'bold';
                    fullIndicator.style.color = '#ff0000';
                    fullIndicator.style.animation = 'pulse 1s infinite';
                    fullIndicator.textContent = 'FULL!';
                    boxDiv.appendChild(fullIndicator);
                }
                
                // Add click handler to clean box
                boxDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.cleanLitterBox(index);
                });
                
                container.appendChild(boxDiv);
            });
        }
        
        // Render food bowl if this is the kitchen
        if (roomId === 'kitchen' && room.foodBowl) {
            const bowlDiv = document.createElement('div');
            bowlDiv.className = 'food-bowl';
            bowlDiv.style.position = 'absolute';
            bowlDiv.style.left = room.foodBowl.position.x + 'px';
            bowlDiv.style.top = room.foodBowl.position.y + 'px';
            bowlDiv.style.cursor = 'pointer';
            bowlDiv.style.fontSize = '40px';
            bowlDiv.style.userSelect = 'none';
            bowlDiv.style.zIndex = '20'; // Higher than cats
            bowlDiv.style.pointerEvents = 'all';
            
            // Show different bowl based on food level
            if (room.foodBowl.currentFood === 0) {
                bowlDiv.innerHTML = '🥣'; // Empty bowl
                bowlDiv.title = 'Empty food bowl - click to fill';
            } else if (room.foodBowl.currentFood < room.foodBowl.maxFood / 2) {
                bowlDiv.innerHTML = '🍜'; // Half full
                bowlDiv.title = `Food bowl (${room.foodBowl.currentFood}/${room.foodBowl.maxFood})`;
            } else {
                bowlDiv.innerHTML = '🍲'; // Full bowl
                bowlDiv.title = `Food bowl (${room.foodBowl.currentFood}/${room.foodBowl.maxFood})`;
            }
            
            // Add click handler to fill bowl
            bowlDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                this.fillFoodBowl();
            });
            
            container.appendChild(bowlDiv);
        }
        
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
            
            // Position cats absolutely within room
            catDiv.style.position = 'absolute';
            
            // Initialize position if not set
            if (this.catMovementStates && this.catMovementStates[catId]) {
                const state = this.catMovementStates[catId];
                if (state.currentX === 0 && state.currentY === 0) {
                    // Random initial position
                    state.currentX = Math.random() * 200;
                    state.currentY = Math.random() * 100;
                }
                catDiv.style.left = state.currentX + 'px';
                catDiv.style.top = state.currentY + 'px';
            }
            
            catsContainer.appendChild(catDiv);
        });
        
        container.appendChild(catsContainer);
        
        // Show messes
        room.messes.forEach((mess, index) => {
            const messDiv = document.createElement('div');
            messDiv.className = 'mess-visual';
            messDiv.id = `mess-${roomId}-${index}`;
            messDiv.style.position = 'absolute';
            messDiv.style.cursor = 'pointer';
            messDiv.style.fontSize = '30px';
            messDiv.style.zIndex = '15';
            messDiv.style.pointerEvents = 'all';
            messDiv.style.userSelect = 'none';
            
            // Get room dimensions for random placement
            const roomWidth = parseInt(container.style.width);
            const roomHeight = parseInt(container.style.height);
            
            // Place mess at stored position or random if new
            if (mess.position) {
                messDiv.style.left = mess.position.x + 'px';
                messDiv.style.top = mess.position.y + 'px';
            } else {
                // Random position within room bounds
                const x = 30 + Math.random() * (roomWidth - 60);
                const y = 30 + Math.random() * (roomHeight - 60);
                messDiv.style.left = x + 'px';
                messDiv.style.top = y + 'px';
                // Store position for consistency
                mess.position = { x, y };
            }
            
            if (mess.type === 'poop' || mess.includes('poop')) {
                messDiv.innerHTML = '💩';
                messDiv.classList.add('poop');
                messDiv.title = 'Poop - Click to clean!';
            } else if (mess.type === 'pee' || mess.includes('pee')) {
                messDiv.innerHTML = '💦';
                messDiv.classList.add('pee');
                messDiv.title = 'Pee - Click to clean!';
            }
            
            messDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                this.cleanMess(roomId, index);
            });
            
            container.appendChild(messDiv);
        });
    }
    
    createCatElement(catId, cat) {
        const catDiv = document.createElement('div');
        catDiv.className = 'cat-icon';
        catDiv.id = `cat-${catId}`;
        catDiv.dataset.catId = catId; // Add data attribute for highlight functionality
        catDiv.style.pointerEvents = 'all';
        catDiv.style.cursor = 'pointer';
        
        if (this.gameState.selectedCat === catId) {
            catDiv.classList.add('selected');
        }
        
        // Add mood-based classes for animations
        if (cat.asleep) {
            catDiv.classList.add('sleeping');
        } else if (cat.happy > 70) {
            catDiv.classList.add('happy-cat');
        } else if (cat.happy < 30) {
            catDiv.classList.add('unhappy');
        }
        
        // Create SVG cat
        const catSVG = this.createCatSVG(cat, 50);
        catSVG.classList.add('cat-svg');
        catDiv.appendChild(catSVG);
        
        // Add tooltip with cat name
        catDiv.title = `${cat.name} - ${this.getCatMood(cat)}`;
        
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
                    conflictMessages.push(`⚠️ Tension in ${room.name}: ${conflictingCats.join(' and ')} don't get along!`);
                    // Only slight unhappiness from being in same room - fights happen on collision
                    room.cats.forEach(catId => {
                        if (this.isCatInConflict(catId, roomId)) {
                            this.cats[catId].happy -= 1; // Much reduced
                        }
                    });
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
        // Replace emoji with SVG
        const svgContainer = document.getElementById('popup-cat-svg');
        svgContainer.innerHTML = '';
        const largeSVG = this.createCatSVG(cat, 100);
        svgContainer.appendChild(largeSVG);
        document.getElementById('popup-cat-mood').textContent = `Mood: ${this.getCatMood(cat)}`;
        document.getElementById('popup-cat-location').textContent = `Location: ${cat.room === 'outside' ? 'Outside' : this.rooms[cat.room].name}`;
        document.getElementById('popup-cat-trait').textContent = `Trait: ${cat.trait}`;
        
        // Add health info
        const healthText = `Health: ${cat.health || 75}%`;
        const healthElement = document.getElementById('popup-cat-health');
        if (healthElement) {
            healthElement.textContent = healthText;
            healthElement.style.color = this.getHealthColor(cat.health || 75);
        } else {
            // Create health element if it doesn't exist
            const detailsDiv = document.querySelector('.cat-details');
            if (detailsDiv) {
                const healthP = document.createElement('p');
                healthP.id = 'popup-cat-health';
                healthP.textContent = healthText;
                healthP.style.color = this.getHealthColor(cat.health || 75);
                healthP.style.fontWeight = 'bold';
                detailsDiv.appendChild(healthP);
            }
        }
        
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
        
        // Food info instead of feed button
        const foodInfo = document.createElement('div');
        foodInfo.className = 'action-info';
        foodInfo.style.padding = '10px';
        foodInfo.style.textAlign = 'center';
        
        if (cat.fed) {
            foodInfo.innerHTML = '✅ Already Fed Today';
        } else if (cat.hunger > 70) {
            foodInfo.innerHTML = '🍽️ Very Hungry!<br><small>Fill the food bowl in the kitchen</small>';
        } else if (cat.hunger > 40) {
            foodInfo.innerHTML = '🍽️ Getting Hungry<br><small>Will need food soon</small>';
        } else {
            foodInfo.innerHTML = '😊 Not Hungry Yet';
        }
        actionsDiv.appendChild(foodInfo);
        
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
        
        // Sleep button (only in Evening)
        if (this.gameState.time === 'Evening') {
            const sleepBtn = document.createElement('button');
            sleepBtn.className = 'action-btn';
            
            if (cat.asleep) {
                sleepBtn.textContent = '😴 Already Asleep';
                sleepBtn.disabled = true;
            } else if (cat.happy < 50) {
                sleepBtn.textContent = '🛏️ Too Unhappy to Sleep';
                sleepBtn.disabled = true;
            } else {
                sleepBtn.textContent = '🛏️ Put to Sleep';
            }
            
            sleepBtn.addEventListener('click', () => {
                this.putCatToSleep(catId);
                this.closePopup();
            });
            actionsDiv.appendChild(sleepBtn);
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
        if (cat.asleep) return '😴 Sleeping';
        if (cat.happy > 70) return '😊 Happy';
        if (cat.happy > 30) return '😐 OK';
        return '😿 Sad';
    }
    
    createCatSVG(cat, size = 50) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.style.overflow = 'visible';
        
        // Get the cat color and style
        const catColor = this.getCatColor(cat);
        const strokeColor = '#00ff00';
        const strokeWidth = '1.5';
        
        // Create main group
        const catGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        catGroup.setAttribute('transform', 'translate(50, 50)');
        
        // Shadow
        const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        shadow.setAttribute('cx', '0');
        shadow.setAttribute('cy', '35');
        shadow.setAttribute('rx', '25');
        shadow.setAttribute('ry', '5');
        shadow.setAttribute('fill', 'rgba(0, 0, 0, 0.2)');
        catGroup.appendChild(shadow);
        
        // Body (sitting position)
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        body.setAttribute('d', 'M -15 5 Q -20 25, -15 30 L 15 30 Q 20 25, 15 5 Q 12 -5, 0 -5 Q -12 -5, -15 5 Z');
        body.setAttribute('fill', catColor);
        body.setAttribute('stroke', strokeColor);
        body.setAttribute('stroke-width', strokeWidth);
        catGroup.appendChild(body);
        
        // Front legs
        const frontLegL = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        frontLegL.setAttribute('cx', '-8');
        frontLegL.setAttribute('cy', '25');
        frontLegL.setAttribute('rx', '5');
        frontLegL.setAttribute('ry', '10');
        frontLegL.setAttribute('fill', catColor);
        frontLegL.setAttribute('stroke', strokeColor);
        frontLegL.setAttribute('stroke-width', strokeWidth);
        catGroup.appendChild(frontLegL);
        
        const frontLegR = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        frontLegR.setAttribute('cx', '8');
        frontLegR.setAttribute('cy', '25');
        frontLegR.setAttribute('rx', '5');
        frontLegR.setAttribute('ry', '10');
        frontLegR.setAttribute('fill', catColor);
        frontLegR.setAttribute('stroke', strokeColor);
        frontLegR.setAttribute('stroke-width', strokeWidth);
        catGroup.appendChild(frontLegR);
        
        // Head
        const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        head.setAttribute('cx', '0');
        head.setAttribute('cy', '-10');
        head.setAttribute('r', '18');
        head.setAttribute('fill', catColor);
        head.setAttribute('stroke', strokeColor);
        head.setAttribute('stroke-width', strokeWidth);
        catGroup.appendChild(head);
        
        // Ears
        const earL = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        earL.setAttribute('d', 'M -15 -20 L -20 -35 L -8 -25 Z');
        earL.setAttribute('fill', catColor);
        earL.setAttribute('stroke', strokeColor);
        earL.setAttribute('stroke-width', strokeWidth);
        catGroup.appendChild(earL);
        
        // Inner ear L
        const innerEarL = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        innerEarL.setAttribute('d', 'M -14 -24 L -16 -30 L -11 -26 Z');
        innerEarL.setAttribute('fill', 'rgba(255, 182, 193, 0.5)');
        catGroup.appendChild(innerEarL);
        
        const earR = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        earR.setAttribute('d', 'M 15 -20 L 20 -35 L 8 -25 Z');
        earR.setAttribute('fill', catColor);
        earR.setAttribute('stroke', strokeColor);
        earR.setAttribute('stroke-width', strokeWidth);
        catGroup.appendChild(earR);
        
        // Inner ear R
        const innerEarR = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        innerEarR.setAttribute('d', 'M 14 -24 L 16 -30 L 11 -26 Z');
        innerEarR.setAttribute('fill', 'rgba(255, 182, 193, 0.5)');
        catGroup.appendChild(innerEarR);
        
        // Eyes
        if (cat.asleep) {
            // Closed eyes
            const eyeL = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            eyeL.setAttribute('d', 'M -10 -10 Q -7 -8, -4 -10');
            eyeL.setAttribute('stroke', strokeColor);
            eyeL.setAttribute('stroke-width', strokeWidth);
            eyeL.setAttribute('fill', 'none');
            catGroup.appendChild(eyeL);
            
            const eyeR = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            eyeR.setAttribute('d', 'M 4 -10 Q 7 -8, 10 -10');
            eyeR.setAttribute('stroke', strokeColor);
            eyeR.setAttribute('stroke-width', strokeWidth);
            eyeR.setAttribute('fill', 'none');
            catGroup.appendChild(eyeR);
        } else {
            // Open eyes
            const eyeL = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            eyeL.setAttribute('cx', '-7');
            eyeL.setAttribute('cy', '-10');
            eyeL.setAttribute('rx', '4');
            eyeL.setAttribute('ry', '6');
            eyeL.setAttribute('fill', '#00ff00');
            catGroup.appendChild(eyeL);
            
            const eyeR = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            eyeR.setAttribute('cx', '7');
            eyeR.setAttribute('cy', '-10');
            eyeR.setAttribute('rx', '4');
            eyeR.setAttribute('ry', '6');
            eyeR.setAttribute('fill', '#00ff00');
            catGroup.appendChild(eyeR);
            
            // Pupils
            const pupilL = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            pupilL.setAttribute('cx', '-7');
            pupilL.setAttribute('cy', '-10');
            pupilL.setAttribute('rx', '2');
            pupilL.setAttribute('ry', '3');
            pupilL.setAttribute('fill', '#000');
            catGroup.appendChild(pupilL);
            
            const pupilR = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            pupilR.setAttribute('cx', '7');
            pupilR.setAttribute('cy', '-10');
            pupilR.setAttribute('rx', '2');
            pupilR.setAttribute('ry', '3');
            pupilR.setAttribute('fill', '#000');
            catGroup.appendChild(pupilR);
        }
        
        // Nose
        const nose = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        nose.setAttribute('d', 'M 0 -2 L -2 0 L 0 1 L 2 0 Z');
        nose.setAttribute('fill', '#ff69b4');
        catGroup.appendChild(nose);
        
        // Mouth
        const mouth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        if (cat.happy > 50) {
            mouth.setAttribute('d', 'M 0 1 Q -4 3, -6 2 M 0 1 Q 4 3, 6 2');
        } else {
            mouth.setAttribute('d', 'M 0 1 Q -4 2, -6 3 M 0 1 Q 4 2, 6 3');
        }
        mouth.setAttribute('stroke', strokeColor);
        mouth.setAttribute('stroke-width', '1');
        mouth.setAttribute('fill', 'none');
        catGroup.appendChild(mouth);
        
        // Whiskers
        const whiskerPositions = [
            { x1: -18, y1: -5, x2: -28, y2: -7 },
            { x1: -18, y1: -2, x2: -28, y2: -2 },
            { x1: 18, y1: -5, x2: 28, y2: -7 },
            { x1: 18, y1: -2, x2: 28, y2: -2 }
        ];
        
        whiskerPositions.forEach(pos => {
            const whisker = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            whisker.setAttribute('x1', pos.x1);
            whisker.setAttribute('y1', pos.y1);
            whisker.setAttribute('x2', pos.x2);
            whisker.setAttribute('y2', pos.y2);
            whisker.setAttribute('stroke', strokeColor);
            whisker.setAttribute('stroke-width', '0.5');
            whisker.setAttribute('opacity', '0.7');
            catGroup.appendChild(whisker);
        });
        
        // Paws
        const pawL = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        pawL.setAttribute('cx', '-8');
        pawL.setAttribute('cy', '32');
        pawL.setAttribute('rx', '4');
        pawL.setAttribute('ry', '2');
        pawL.setAttribute('fill', catColor);
        catGroup.appendChild(pawL);
        
        const pawR = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        pawR.setAttribute('cx', '8');
        pawR.setAttribute('cy', '32');
        pawR.setAttribute('rx', '4');
        pawR.setAttribute('ry', '2');
        pawR.setAttribute('fill', catColor);
        catGroup.appendChild(pawR);
        
        // Tail
        const tail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        if (cat.happy > 70) {
            // Happy tail up
            tail.setAttribute('d', 'M 12 15 Q 25 10, 30 -5 Q 32 -15, 28 -20');
        } else if (cat.happy > 30) {
            // Neutral tail
            tail.setAttribute('d', 'M 12 15 Q 25 20, 35 15');
        } else {
            // Sad tail down
            tail.setAttribute('d', 'M 12 15 Q 20 25, 25 30');
        }
        tail.setAttribute('stroke', catColor);
        tail.setAttribute('stroke-width', '8');
        tail.setAttribute('fill', 'none');
        tail.setAttribute('stroke-linecap', 'round');
        catGroup.appendChild(tail);
        
        // Add some stripes/patterns for certain colors
        if (cat.personality === 'Playful' || cat.personality === 'Mischievous') {
            for (let i = 0; i < 3; i++) {
                const stripe = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                stripe.setAttribute('d', `M -10 ${-5 + i * 8} Q 0 ${-7 + i * 8}, 10 ${-5 + i * 8}`);
                stripe.setAttribute('stroke', 'rgba(0, 0, 0, 0.2)');
                stripe.setAttribute('stroke-width', '3');
                stripe.setAttribute('fill', 'none');
                catGroup.appendChild(stripe);
            }
        }
        
        // Special features
        if (cat.specialNeeds?.includes('blind')) {
            // Sunglasses for blind cats
            const glasses = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            // Glasses frame
            const frame = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            frame.setAttribute('d', 'M -12 -10 Q -7 -12, -2 -10 M 2 -10 Q 7 -12, 12 -10');
            frame.setAttribute('stroke', '#333');
            frame.setAttribute('stroke-width', '2');
            frame.setAttribute('fill', 'none');
            glasses.appendChild(frame);
            
            // Lenses
            const lensL = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            lensL.setAttribute('cx', '-7');
            lensL.setAttribute('cy', '-10');
            lensL.setAttribute('rx', '5');
            lensL.setAttribute('ry', '6');
            lensL.setAttribute('fill', '#333');
            lensL.setAttribute('opacity', '0.8');
            glasses.appendChild(lensL);
            
            const lensR = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            lensR.setAttribute('cx', '7');
            lensR.setAttribute('cy', '-10');
            lensR.setAttribute('rx', '5');
            lensR.setAttribute('ry', '6');
            lensR.setAttribute('fill', '#333');
            lensR.setAttribute('opacity', '0.8');
            glasses.appendChild(lensR);
            
            catGroup.appendChild(glasses);
        }
        
        if (cat.specialNeeds?.includes('deaf')) {
            // Hearing aid indicator
            const aid = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            aid.setAttribute('cx', '-15');
            aid.setAttribute('cy', '-25');
            aid.setAttribute('r', '2');
            aid.setAttribute('fill', '#ffff00');
            aid.setAttribute('stroke', '#ff0000');
            aid.setAttribute('stroke-width', '0.5');
            catGroup.appendChild(aid);
        }
        
        if (cat.asleep) {
            // Z's for sleeping
            const z1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            z1.setAttribute('x', '20');
            z1.setAttribute('y', '-20');
            z1.setAttribute('font-size', '12');
            z1.setAttribute('fill', '#00ff00');
            z1.setAttribute('font-family', 'monospace');
            z1.textContent = 'Z';
            catGroup.appendChild(z1);
            
            const z2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            z2.setAttribute('x', '25');
            z2.setAttribute('y', '-30');
            z2.setAttribute('font-size', '8');
            z2.setAttribute('fill', '#00ff00');
            z2.setAttribute('font-family', 'monospace');
            z2.textContent = 'z';
            catGroup.appendChild(z2);
        }
        
        svg.appendChild(catGroup);
        return svg;
    }
    
    getCatStatusEmoji(cat) {
        if (cat.asleep) return '😴'; // Sleeping
        if (cat.missing) return '❓'; // Missing
        if (cat.room === 'outside') return '🌳'; // Outside
        if (cat.happy > 70) return '😊'; // Happy
        if (cat.happy > 30) return '😐'; // Neutral
        return '😿'; // Sad
    }
    
    highlightCat(catId, shouldScroll = true) {
        const cat = this.cats[catId];
        
        // Remove any existing highlights
        document.querySelectorAll('.cat-icon.highlighted').forEach(icon => {
            icon.classList.remove('highlighted');
        });
        
        // Find and highlight the cat if they're visible
        if (!cat.missing) {
            // Find the cat's icon in the room or outside
            const catIcon = document.querySelector(`[data-cat-id="${catId}"]`);
            if (catIcon) {
                catIcon.classList.add('highlighted');
                // Scroll the cat into view if needed
                if (shouldScroll) {
                    catIcon.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                // Remove highlight after 3 seconds
                setTimeout(() => {
                    catIcon.classList.remove('highlighted');
                }, 3000);
                
                if (cat.room === 'outside') {
                    this.displayMessage(`🎯 Tracking ${cat.name} - Outside!`);
                } else {
                    this.displayMessage(`🎯 Tracking ${cat.name} in the ${this.rooms[cat.room].name}.`);
                }
            }
        } else {
            this.displayMessage(`❓ ${cat.name} is missing!`);
        }
    }
    
    updateCastPanel() {
        const castList = document.getElementById('cast-list');
        if (!castList) return; // Safety check
        
        castList.innerHTML = '';
        
        Object.entries(this.cats).forEach(([catId, cat]) => {
            const castMember = document.createElement('div');
            castMember.className = 'cast-member';
            
            // Color indicator
            const colorDot = document.createElement('div');
            colorDot.className = 'cast-member-color';
            colorDot.style.backgroundColor = this.getCatColor(cat);
            
            // Info container
            const info = document.createElement('div');
            info.className = 'cast-member-info';
            
            // Name
            const name = document.createElement('span');
            name.className = 'cast-member-name';
            name.textContent = cat.name;
            
            // Status emoji
            const status = document.createElement('span');
            status.className = 'cast-member-status';
            status.textContent = this.getCatStatusEmoji(cat);
            status.title = this.getCatMood(cat);
            
            info.appendChild(name);
            info.appendChild(status);
            
            // Health bar
            const healthContainer = document.createElement('div');
            healthContainer.className = 'cast-member-health';
            healthContainer.style.width = '100%';
            healthContainer.style.marginTop = '2px';
            
            const healthBar = document.createElement('div');
            healthBar.className = 'health-bar';
            healthBar.style.width = '100%';
            healthBar.style.height = '6px';
            healthBar.style.backgroundColor = '#333';
            healthBar.style.borderRadius = '3px';
            healthBar.style.overflow = 'hidden';
            healthBar.style.position = 'relative';
            
            const healthFill = document.createElement('div');
            healthFill.className = 'health-fill';
            healthFill.style.width = `${cat.health || 75}%`;
            healthFill.style.height = '100%';
            healthFill.style.backgroundColor = this.getHealthColor(cat.health || 75);
            healthFill.style.transition = 'width 0.3s ease';
            
            const healthText = document.createElement('span');
            healthText.className = 'health-text';
            healthText.style.fontSize = '10px';
            healthText.style.marginLeft = '5px';
            healthText.textContent = `${cat.health || 75}%`;
            healthText.style.color = this.getHealthColor(cat.health || 75);
            
            healthBar.appendChild(healthFill);
            healthContainer.appendChild(healthBar);
            healthContainer.appendChild(healthText);
            
            info.appendChild(healthContainer);
            
            // Action buttons container
            const actions = document.createElement('div');
            actions.className = 'cast-member-actions';
            
            // Track button
            const trackBtn = document.createElement('button');
            trackBtn.className = 'cast-action-btn';
            trackBtn.textContent = '🎯';
            trackBtn.title = 'Track this cat';
            trackBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.highlightCat(catId, false); // false = don't scroll
            });
            
            // Details button
            const detailsBtn = document.createElement('button');
            detailsBtn.className = 'cast-action-btn';
            detailsBtn.textContent = '📋';
            detailsBtn.title = 'View details';
            detailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectCat(catId);
            });
            
            actions.appendChild(trackBtn);
            actions.appendChild(detailsBtn);
            
            castMember.appendChild(colorDot);
            castMember.appendChild(info);
            castMember.appendChild(actions);
            
            castList.appendChild(castMember);
        });
    }
    
    getCatColor(cat) {
        // Unique color for each cat
        const catColors = {
            'Gusty': '#FF8C00',        // Dark orange
            'Snicker': '#2F4F4F',      // Dark slate gray
            'Rudy': '#B22222',         // Fire brick
            'Scampi': '#FFB6C1',       // Light pink
            'Stinky Lee': '#483D8B',   // Dark slate blue
            'Jonah': '#8B4513',        // Saddle brown
            'Tink': '#DDA0DD',         // Plum
            'Lucy': '#DAA520',         // Goldenrod
            'Giselle': '#D2691E'       // Chocolate
        };
        
        return catColors[cat.name] || '#696969'; // Default gray
    }
    
    getHealthColor(health) {
        if (health >= 80) return '#00ff00';  // Green - Excellent
        if (health >= 60) return '#90EE90';  // Light green - Good
        if (health >= 40) return '#FFD700';  // Gold - Fair
        if (health >= 20) return '#FF8C00';  // Dark orange - Poor
        return '#ff0000';                     // Red - Critical
    }
    
    putCatToSleep(catId) {
        const cat = this.cats[catId];
        
        if (cat.happy < 50) {
            this.displayMessage(`${cat.name} is too unhappy to sleep!`);
            return;
        }
        
        if (this.gameState.energy < 5) {
            this.displayMessage("You're too tired to put cats to bed...");
            return;
        }
        
        cat.asleep = true;
        this.displayMessage(`💤 You gently put ${cat.name} to sleep in the ${this.rooms[cat.room].name}.`);
        this.useEnergy(5, 'putting cat to sleep');
        this.updateScore(5);
        
        // Check if all cats are asleep
        const awakeCats = Object.values(this.cats).filter(c => !c.asleep && !c.missing);
        if (awakeCats.length === 0) {
            this.displayMessage("✨ All cats are peacefully asleep! Great job!");
            this.updateScore(20);
        }
        
        this.renderRooms();
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
        this.updateScore(2);
        
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
            this.updateScore(-20);
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
        this.updateScore(3);
        
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
                this.updateScore(-25);
            } else {
                // Found the cat!
                this.displayMessage(`😅 You found ${cat.name} hiding under a bush!`);
                this.outside.cats = this.outside.cats.filter(id => id !== catId);
                this.outside.catsWaitingToComeIn = this.outside.catsWaitingToComeIn.filter(id => id !== catId);
                cat.room = 'bedroom'; // Put them in bedroom for the night
                this.rooms.bedroom.cats.push(catId);
                cat.wontComeBack = false;
                this.updateScore(5);
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
            case 'fill':
                this.fillFoodBowl();
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
                this.stopCatMovement();
                this.stopMicroMovements();
                this.autoProgress = false;
                this.displayMessage("⏸️ Time progression paused. Type 'play' to resume.");
                break;
            case 'play':
                this.autoProgress = true;
                this.startTimeProgression();
                this.startClockTicker();
                this.startCatMovement();
                this.startMicroMovements();
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
    
    fillFoodBowl() {
        // Check energy first
        if (this.gameState.energy < 5) {
            this.displayMessage("You're too tired to fill the food bowl...");
            return;
        }
        
        const foodBowl = this.rooms.kitchen.foodBowl;
        if (foodBowl.currentFood >= foodBowl.maxFood) {
            this.displayMessage("The food bowl is already full!");
            return;
        }
        
        // Fill the bowl
        const foodAdded = foodBowl.maxFood - foodBowl.currentFood;
        foodBowl.currentFood = foodBowl.maxFood;
        
        this.displayMessage(`🍲 You filled the food bowl with ${foodAdded} servings of cat food.`);
        this.useEnergy(5, 'filling food bowl');
        this.updateScore(5);
        
        // Notify hungry cats
        const hungryCats = Object.entries(this.cats).filter(([id, cat]) => 
            cat.hunger > 60 && !cat.missing && cat.room !== 'outside'
        );
        
        if (hungryCats.length > 0) {
            this.displayMessage(`🐱 ${hungryCats.length} hungry cat(s) notice the fresh food!`);
        }
        
        // Progress time with action
        this.progressTimeWithAction();
        
        this.renderRooms();
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
        this.updateScore(5);
        this.dailyStats.catsFed++;
        
        // Feeding improves health
        this.updateCatHealth(catId, 3, "fed");
        
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
            const messType = mess.type || (mess.includes && mess.includes('poop') ? 'poop' : 'pee');
            room.messes.splice(messIndex, 1);
            
            this.updateScore(3);
            if (messType === 'poop') {
                this.displayMessage(`💩 You cleaned up the poop in the ${room.name}!`);
            } else {
                this.displayMessage(`💦 You cleaned up the pee in the ${room.name}!`);
            }
            this.useEnergy(4, 'cleaning');
            this.dailyStats.messesCleaned++;
            
            // Progress time with action
            this.progressTimeWithAction();
            
            // Make cats happier when messes are cleaned
            room.cats.forEach(catId => {
                this.cats[catId].happy += 3;
            });
            
            this.renderRooms();
        }
    }
    
    cleanLitterBox(boxIndex) {
        // Check energy first
        if (this.gameState.energy < 6) {
            this.displayMessage("You're too tired to clean the litter box...");
            return;
        }
        
        const box = this.rooms.bathroom.litterBoxes[boxIndex];
        if (!box) return;
        
        if (box.cleanliness > 80) {
            this.displayMessage("This litter box is already clean!");
            return;
        }
        
        // Clean the box
        const wasVeryDirty = box.cleanliness <= 40;
        box.cleanliness = 100;
        box.currentUses = 0;
        
        this.displayMessage(`🧹 You cleaned the litter box!`);
        this.useEnergy(6, 'cleaning litter box');
        this.updateScore(wasVeryDirty ? 10 : 5);
        this.dailyStats.messesCleaned++;
        
        // Make all cats happier when litter boxes are clean
        Object.values(this.cats).forEach(cat => {
            cat.happy += wasVeryDirty ? 10 : 5;
        });
        
        // Progress time with action
        this.progressTimeWithAction();
        
        this.renderRooms();
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
            this.updateScore(cleaned * 3);
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
        this.updateScore(3);
        
        // Playing improves health
        this.updateCatHealth(catId, 2, "played with");
        
        this.displayMessage(`You play with ${cat.name}. They seem much happier!`);
        this.useEnergy(8, 'playing');
        this.dailyStats.playSessions++;
        
        // Progress time with action
        this.progressTimeWithAction();
        
        this.renderRooms();
    }
    
    triggerRandomEvent() {
        const events = [
            () => {
                if (Math.random() < this.settings.accidentChance && this.rooms[this.cats.snicker.room].messes.length < 3) {
                    const room = this.rooms[this.cats.snicker.room];
                    room.messes.push({ type: 'poop' });
                    this.displayMessage(`💩 Oh no! Snicker has pooped in the ${room.name}!`);
                    this.cats.snicker.messLevel = (this.cats.snicker.messLevel || 0) + 1;
                    this.gameState.score -= 2;
                }
            },
            () => {
                if (Math.random() < this.settings.accidentChance && this.rooms[this.cats.scampi.room].messes.length < 3) {
                    const room = this.rooms[this.cats.scampi.room];
                    room.messes.push({ type: 'pee' });
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
                this.updateScore(2);
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
    
    getCatPositions(roomId) {
        // Define possible positions for cats in each room
        const positions = {
            kitchen: [
                { x: 50, y: 50 },
                { x: 150, y: 50 },
                { x: 250, y: 50 },
                { x: 50, y: 120 },
                { x: 150, y: 120 },
                { x: 250, y: 120 }
            ],
            livingroom: [
                { x: 100, y: 80 },
                { x: 250, y: 80 },
                { x: 400, y: 80 },
                { x: 100, y: 180 },
                { x: 250, y: 180 },
                { x: 400, y: 180 }
            ],
            bedroom: [
                { x: 50, y: 60 },
                { x: 150, y: 60 },
                { x: 250, y: 60 },
                { x: 50, y: 150 },
                { x: 150, y: 150 },
                { x: 250, y: 150 }
            ],
            bathroom: [
                { x: 100, y: 40 },
                { x: 250, y: 40 },
                { x: 100, y: 100 },
                { x: 250, y: 100 }
            ]
        };
        
        return positions[roomId] || [{ x: 50, y: 50 }];
    }
    
    animateCatMovementThroughDoor(catId, fromRoom, toRoom) {
        const cat = this.cats[catId];
        
        // Get door position
        const doorKey1 = `${fromRoom}-${toRoom}`;
        const doorKey2 = `${toRoom}-${fromRoom}`;
        const doorInfo = this.doorPositions[doorKey1] || this.doorPositions[doorKey2];
        
        if (!doorInfo) {
            // Fallback to instant move if no door defined
            this.moveCatInstantly(catId, fromRoom, toRoom);
            return;
        }
        
        // Show movement message
        this.displayMessage(`🐾 ${cat.name} is walking to the ${this.rooms[toRoom].name}...`);
        
        // Create a temporary moving cat element
        const movingCat = this.createMovingCat(catId, cat);
        if (!movingCat) {
            this.moveCatInstantly(catId, fromRoom, toRoom);
            return;
        }
        
        // Get current cat position
        const catElement = document.getElementById(`cat-${catId}`);
        const startPos = catElement ? {
            x: parseInt(catElement.style.left) + parseInt(catElement.parentElement?.parentElement?.style.left || 0),
            y: parseInt(catElement.style.top) + parseInt(catElement.parentElement?.parentElement?.style.top || 0)
        } : this.getRoomCenter(fromRoom);
        
        // Get door positions
        const doorFrom = doorInfo[fromRoom] || doorInfo[Object.keys(doorInfo)[0]];
        const doorTo = doorInfo[toRoom] || doorInfo[Object.keys(doorInfo)[1]];
        
        // Position the moving cat at start
        movingCat.style.position = 'absolute';
        movingCat.style.left = startPos.x + 'px';
        movingCat.style.top = startPos.y + 'px';
        movingCat.style.zIndex = '100';
        movingCat.classList.add('moving-cat');
        
        // Add to rooms container
        const container = document.getElementById('rooms-container');
        container.appendChild(movingCat);
        
        // Hide the original cat
        if (catElement) {
            catElement.style.visibility = 'hidden';
        }
        
        // Animate to door, then to destination
        // First, move to the door in current room
        this.animateElement(movingCat, startPos, doorFrom, 1500, () => {
            // Then move through door to other side
            movingCat.style.left = doorTo.x + 'px';
            movingCat.style.top = doorTo.y + 'px';
            
            // Finally move to a random position in the new room
            const endPos = this.getRandomRoomPosition(toRoom);
            
            setTimeout(() => {
                this.animateElement(movingCat, doorTo, endPos, 1000, () => {
                    // Remove from old room
                    this.rooms[fromRoom].cats = this.rooms[fromRoom].cats.filter(id => id !== catId);
                    
                    // Add to new room
                    cat.room = toRoom;
                    this.rooms[toRoom].cats.push(catId);
                    
                    // Update movement state for continuous movement
                    if (this.catMovementStates && this.catMovementStates[catId]) {
                        const state = this.catMovementStates[catId];
                        state.currentX = endPos.x - parseInt(document.querySelector(`#room-${toRoom}`).style.left);
                        state.currentY = endPos.y - parseInt(document.querySelector(`#room-${toRoom}`).style.top);
                    }
                    
                    // Remove the moving cat
                    movingCat.remove();
                    
                    // Update display
                    this.renderRooms();
                    this.checkConflicts();
                    
                    this.displayMessage(`🐾 ${cat.name} arrived at the ${this.rooms[toRoom].name}.`);
                });
            }, 100); // Small pause at door
        });
    }
    
    getRandomRoomPosition(roomId) {
        const roomDefs = {
            kitchen: { x: 450, y: 80, width: 350, height: 200 },
            livingroom: { x: 420, y: 80, width: 480, height: 300 },
            bedroom: { x: 50, y: 320, width: 350, height: 250 },
            bathroom: { x: 420, y: 420, width: 480, height: 150 }
        };
        
        const room = roomDefs[roomId];
        if (!room) return { x: 400, y: 300 };
        
        return {
            x: room.x + 30 + Math.random() * (room.width - 100),
            y: room.y + 30 + Math.random() * (room.height - 100)
        };
    }
    
    animateCatMovement(catId, fromRoom, toRoom) {
        const cat = this.cats[catId];
        
        // Show movement message
        this.displayMessage(`🐾 ${cat.name} is walking to the ${this.rooms[toRoom].name}...`);
        
        // Create a temporary moving cat element
        const movingCat = this.createMovingCat(catId, cat);
        if (!movingCat) {
            this.moveCatInstantly(catId, fromRoom, toRoom);
            return;
        }
        
        // Get start and end positions
        const startPos = this.getRoomCenter(fromRoom);
        const endPos = this.getRoomCenter(toRoom);
        
        // Position the moving cat at start
        movingCat.style.position = 'absolute';
        movingCat.style.left = startPos.x + 'px';
        movingCat.style.top = startPos.y + 'px';
        movingCat.style.zIndex = '100';
        movingCat.classList.add('moving-cat');
        
        // Add to rooms container
        const container = document.getElementById('rooms-container');
        container.appendChild(movingCat);
        
        // Hide the original cat
        const originalCat = document.getElementById(`cat-${catId}`);
        if (originalCat) {
            originalCat.style.visibility = 'hidden';
        }
        
        // Animate the movement
        this.animateElement(movingCat, startPos, endPos, 2000, () => {
            // Remove from old room
            this.rooms[fromRoom].cats = this.rooms[fromRoom].cats.filter(id => id !== catId);
            
            // Add to new room
            cat.room = toRoom;
            this.rooms[toRoom].cats.push(catId);
            
            // Remove the moving cat
            movingCat.remove();
            
            // Update display
            this.renderRooms();
            this.checkConflicts();
            
            this.displayMessage(`🐾 ${cat.name} arrived at the ${this.rooms[toRoom].name}.`);
        });
    }
    
    createMovingCat(catId, cat) {
        const catDiv = document.createElement('div');
        catDiv.className = 'cat-icon moving';
        catDiv.id = `moving-cat-${catId}`;
        
        const catSVG = this.createCatSVG(cat, 50);
        catSVG.classList.add('cat-svg');
        catDiv.appendChild(catSVG);
        
        return catDiv;
    }
    
    getRoomCenter(roomId) {
        const roomDefs = {
            kitchen: { x: 225, y: 150 },      // Center of kitchen
            livingroom: { x: 700, y: 200 },   // Center of living room
            bedroom: { x: 225, y: 445 },      // Center of bedroom
            bathroom: { x: 660, y: 495 }      // Center of bathroom
        };
        
        // Add some randomness to make paths varied
        const base = roomDefs[roomId] || { x: 400, y: 300 };
        return {
            x: base.x + (Math.random() - 0.5) * 50,
            y: base.y + (Math.random() - 0.5) * 30
        };
    }
    
    animateElement(element, startPos, endPos, duration, callback) {
        const startTime = Date.now();
        const deltaX = endPos.x - startPos.x;
        const deltaY = endPos.y - startPos.y;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use easeInOut for smooth movement
            const easeProgress = progress < 0.5 
                ? 2 * progress * progress 
                : -1 + (4 - 2 * progress) * progress;
            
            const currentX = startPos.x + deltaX * easeProgress;
            const currentY = startPos.y + deltaY * easeProgress;
            
            element.style.left = currentX + 'px';
            element.style.top = currentY + 'px';
            
            // Face the direction of movement
            if (deltaX > 0) {
                element.querySelector('svg').style.transform = 'scaleX(1)';
            } else {
                element.querySelector('svg').style.transform = 'scaleX(-1)';
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    moveCatInstantly(catId, fromRoom, toRoom) {
        const cat = this.cats[catId];
        
        // Remove from old room
        this.rooms[fromRoom].cats = this.rooms[fromRoom].cats.filter(id => id !== catId);
        
        // Add to new room
        cat.room = toRoom;
        this.rooms[toRoom].cats.push(catId);
        
        // Show movement message
        this.displayMessage(`🐾 ${cat.name} wandered to the ${this.rooms[toRoom].name}.`);
        
        // Update display
        this.renderRooms();
        this.checkConflicts();
    }
    
    findPath(fromRoom, toRoom) {
        if (fromRoom === toRoom) return [];
        
        // BFS to find shortest path
        const queue = [[fromRoom]];
        const visited = new Set([fromRoom]);
        
        while (queue.length > 0) {
            const path = queue.shift();
            const currentRoom = path[path.length - 1];
            
            const connections = this.roomConnections[currentRoom] || [];
            for (const nextRoom of connections) {
                if (nextRoom === toRoom) {
                    return [...path, nextRoom];
                }
                
                if (!visited.has(nextRoom) && nextRoom !== 'outside') {
                    visited.add(nextRoom);
                    queue.push([...path, nextRoom]);
                }
            }
        }
        
        return null; // No path found
    }
    
    // Make cats move around autonomously
    moveCatsRandomly() {
        Object.entries(this.cats).forEach(([catId, cat]) => {
            // Skip cats that shouldn't move
            if (cat.missing || cat.asleep || cat.room === 'outside') return;
            
            // Cats move based on their mood and energy
            let moveChance = 0.2; // 20% base chance
            
            // Unhappy cats move more
            if (cat.happy < 30) moveChance += 0.2;
            
            // Hungry cats might move to kitchen
            if (cat.hunger > 70) moveChance += 0.1;
            
            // Random chance to move
            if (Math.random() < moveChance) {
                // Get list of available rooms (not outside)
                const availableRooms = Object.keys(this.rooms).filter(roomId => 
                    roomId !== 'outside' && roomId !== cat.room
                );
                
                // If hungry, prefer kitchen
                let targetRoom;
                if (cat.hunger > 70 && Math.random() < 0.7) {
                    targetRoom = 'kitchen';
                } else {
                    // Pick random room
                    targetRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
                }
                
                // Find path to target room
                const path = this.findPath(cat.room, targetRoom);
                if (!path || path.length < 2) return;
                
                // Check if there's a conflict in the next room
                const nextRoom = path[1];
                const nextRoomCats = this.rooms[nextRoom].cats;
                let hasConflict = false;
                
                for (let otherCatId of nextRoomCats) {
                    const otherCat = this.cats[otherCatId];
                    if ((cat.conflicts && cat.conflicts.includes(otherCatId)) || 
                        (otherCat.conflicts && otherCat.conflicts.includes(catId))) {
                        hasConflict = true;
                        break;
                    }
                }
                
                // Only move if no conflict
                if (!hasConflict && nextRoom !== cat.room) {
                    // Animate the cat movement to the next room in path
                    this.animateCatMovementThroughDoor(catId, cat.room, nextRoom);
                }
            }
        });
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
            this.displayMessage("🌅 Evening arrives! It's bedtime at 10 PM - make sure all happy cats are asleep!");
            this.displayMessage("😴 Only cats with 50+ happiness can be put to sleep.");
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
            this.displayMessage("🌙 It's 10 PM - Bedtime!");
            
            // Stop time progression and show summary
            this.stopTimeProgression();
            this.stopCatMovement();
            this.stopMicroMovements();
            this.autoProgress = false;
            
            // Check for cats not asleep
            const awakeCats = Object.entries(this.cats).filter(([id, cat]) => 
                !cat.asleep && !cat.missing && cat.room !== 'outside'
            );
            
            if (awakeCats.length > 0) {
                this.displayMessage(`😱 ${awakeCats.length} cat(s) are still awake at bedtime!`);
                let penalty = 0;
                
                awakeCats.forEach(([catId, cat]) => {
                    if (cat.happy >= 50) {
                        // Happy cats that could have been put to sleep
                        this.displayMessage(`❌ ${cat.name} was happy enough to sleep but is still awake! (-10 points)`);
                        penalty += 10;
                    } else {
                        // Unhappy cats
                        this.displayMessage(`😿 ${cat.name} is too unhappy to sleep! (-5 points)`);
                        penalty += 5;
                    }
                    cat.happy -= 20; // All cats lose happiness from poor sleep
                });
                
                this.gameState.score -= penalty;
                this.displayMessage(`💔 Total bedtime penalty: -${penalty} points`);
            } else {
                const sleepingCats = Object.values(this.cats).filter(cat => cat.asleep && !cat.missing);
                if (sleepingCats.length === Object.values(this.cats).filter(cat => !cat.missing).length) {
                    this.displayMessage("✨ Perfect! All cats are peacefully asleep! (+10 bonus points)");
                    this.updateScore(10);
                }
            }
            
            // Force search for any cats still outside
            const catsOutside = this.outside.cats.filter(catId => !this.cats[catId].missing);
            if (catsOutside.length > 0) {
                this.displayMessage(`😱 Oh no! ${catsOutside.length} cat(s) are still outside at bedtime!`);
                this.displayMessage("You must go search for them!");
                
                catsOutside.forEach(catId => {
                    this.searchForCat(catId);
                });
            }
            
            // Show bedtime summary instead of ending day
            this.showBedtimeSummary();
        }
        
        this.updateDisplay();
        this.renderRooms();
        this.checkConflicts();
    }
    
    showBedtimeSummary() {
        // Calculate sleep score
        const awakeCats = Object.entries(this.cats).filter(([id, cat]) => 
            !cat.asleep && !cat.missing && cat.room !== 'outside'
        );
        
        let sleepPenalty = 0;
        awakeCats.forEach(([catId, cat]) => {
            if (cat.happy >= 50) {
                sleepPenalty += 10;
            } else {
                sleepPenalty += 5;
            }
        });
        
        const sleepingCats = Object.values(this.cats).filter(cat => cat.asleep && !cat.missing);
        let sleepBonus = 0;
        if (sleepingCats.length === Object.values(this.cats).filter(cat => !cat.missing).length) {
            sleepBonus = 10;
        }
        
        this.dailyStats.sleepScore = sleepBonus - sleepPenalty;
        
        // Calculate happiness average
        const aliveCats = Object.values(this.cats).filter(cat => !cat.missing);
        const avgHappiness = Math.round(
            aliveCats.reduce((sum, cat) => sum + cat.happy, 0) / aliveCats.length
        );
        
        // Update sleep status HTML
        const sleepStatusHTML = this.generateSleepStatusHTML();
        document.getElementById('sleep-status').innerHTML = sleepStatusHTML;
        
        // Update statistics
        document.getElementById('summary-day').textContent = this.gameState.day;
        document.getElementById('cats-fed-stat').textContent = `${this.dailyStats.catsFed}/${aliveCats.length}`;
        document.getElementById('messes-cleaned-stat').textContent = this.dailyStats.messesCleaned;
        document.getElementById('play-sessions-stat').textContent = this.dailyStats.playSessions;
        document.getElementById('energy-used-stat').textContent = Math.round(this.dailyStats.energyUsed);
        document.getElementById('happiness-avg-stat').textContent = `${avgHappiness}%`;
        document.getElementById('conflicts-stat').textContent = this.dailyStats.conflictsOccurred;
        
        // Update score breakdown
        const dayScore = this.gameState.score - this.dailyStats.dayStartScore;
        const baseScore = dayScore - this.dailyStats.sleepScore;
        
        document.getElementById('base-score').textContent = baseScore >= 0 ? `+${baseScore}` : baseScore;
        document.getElementById('sleep-score').textContent = this.dailyStats.sleepScore >= 0 ? `+${this.dailyStats.sleepScore}` : this.dailyStats.sleepScore;
        document.getElementById('bonus-score').textContent = `+${this.dailyStats.bonusScore}`;
        document.getElementById('day-total-score').textContent = dayScore;
        
        // Show the modal
        document.getElementById('bedtime-summary').classList.add('active');
        
        // Add event listener for go to sleep button
        const goToSleepBtn = document.getElementById('go-to-sleep-btn');
        goToSleepBtn.onclick = () => {
            document.getElementById('bedtime-summary').classList.remove('active');
            this.startNewDay();
        };
    }
    
    generateSleepStatusHTML() {
        let html = '<div class="sleep-status-grid">';
        
        Object.entries(this.cats).forEach(([catId, cat]) => {
            if (!cat.missing) {
                let status = '';
                let statusClass = '';
                
                if (cat.asleep) {
                    status = '😴 Sleeping peacefully';
                    statusClass = 'sleeping';
                } else if (cat.room === 'outside') {
                    status = '🌙 Still outside!';
                    statusClass = 'outside';
                } else if (cat.happy >= 50) {
                    status = '😟 Awake (could sleep)';
                    statusClass = 'awake-happy';
                } else {
                    status = '😿 Too unhappy to sleep';
                    statusClass = 'awake-unhappy';
                }
                
                html += `
                    <div class="sleep-status-item ${statusClass}">
                        <span class="cat-name">${cat.name}:</span>
                        <span class="sleep-status">${status}</span>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        return html;
    }
    
    startNewDay() {
        // Reset for new day
        this.gameState.day++;
        this.gameState.time = "Morning";
        this.currentTimeIndex = 0;
        this.currentActions = 0;
        
        // Reset daily stats
        this.dailyStats = {
            catsFed: 0,
            messesCleaned: 0,
            playSessions: 0,
            energyUsed: 0,
            conflictsOccurred: 0,
            dayStartScore: this.gameState.score,
            sleepScore: 0,
            bonusScore: 0
        };
        
        // Clear all cats from rooms
        Object.values(this.rooms).forEach(room => {
            room.cats = [];
            room.messes = [];
        });
        
        // Get available indoor rooms (exclude outside)
        const indoorRooms = ['kitchen', 'livingroom', 'bedroom', 'bathroom'];
        
        // Randomize cat locations - all cats start inside
        // Try to avoid conflicts when placing cats
        const catsToPlace = Object.entries(this.cats);
        
        // First reset all cats
        for (const [catId, cat] of catsToPlace) {
            cat.fed = false;
            cat.asleep = false;
            cat.hunger += 30;
            if (cat.happy > 0) cat.happy = Math.max(10, cat.happy - 10);
        }
        
        // Then place them conflict-aware
        while (catsToPlace.length > 0) {
            const [catId, cat] = catsToPlace.shift();
            
            // Try to find a room without conflicts
            let bestRoom = null;
            let leastConflicts = Infinity;
            
            // Shuffle rooms for variety
            const shuffledRooms = [...indoorRooms].sort(() => Math.random() - 0.5);
            
            for (const roomId of shuffledRooms) {
                let conflictCount = 0;
                
                // Check for conflicts with cats already in this room
                for (const otherCatId of this.rooms[roomId].cats) {
                    const otherCat = this.cats[otherCatId];
                    if ((cat.conflicts && cat.conflicts.includes(otherCatId)) ||
                        (otherCat.conflicts && otherCat.conflicts.includes(catId))) {
                        conflictCount++;
                    }
                }
                
                if (conflictCount < leastConflicts) {
                    leastConflicts = conflictCount;
                    bestRoom = roomId;
                    
                    // If we found a room with no conflicts, use it immediately
                    if (conflictCount === 0) break;
                }
            }
            
            // Place cat in the best room found
            if (!bestRoom) bestRoom = indoorRooms[0]; // Fallback
            
            cat.room = bestRoom;
            this.rooms[bestRoom].cats.push(catId);
            
            // Reset movement state if exists
            if (this.catMovementStates && this.catMovementStates[catId]) {
                const positions = this.getCatPositions(bestRoom);
                const catIndex = this.rooms[bestRoom].cats.indexOf(catId);
                const position = positions[catIndex] || positions[0];
                
                this.catMovementStates[catId].currentX = position.x;
                this.catMovementStates[catId].currentY = position.y;
                this.catMovementStates[catId].targetX = position.x;
                this.catMovementStates[catId].targetY = position.y;
            }
        }
        
        // Restore some energy
        this.gameState.energy = Math.min(this.gameState.maxEnergy, this.gameState.energy + 50);
        
        this.displayMessage(`\n🌅 Day ${this.gameState.day} begins!`);
        this.displayMessage("Good morning! Time to take care of your special needs cats.");
        this.displayMessage("The cats have scattered to different rooms.");
        
        // Resume time progression
        this.autoProgress = true;
        this.startTimeProgression();
        this.startClockTicker();
        
        // Restart movement if needed
        if (!this.microMovementFrame) {
            this.startMicroMovements();
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
        
        this.updateScore(dayScore);
        summary += `\n🏆 Day Score: ${dayScore}`;
        summary += `\n🎯 Total Score: ${this.gameState.score}`;
        
        this.displayMessage(summary);
        this.displayMessage("\n🎮 Thanks for playing! Refresh to play again.");
        this.gameState.isGameOver = true;
        
        // Stop time progression when game ends
        this.stopTimeProgression();
        this.stopCatMovement();
        this.stopMicroMovements();
        this.stopCatMovement();
        
        this.updateDisplay();
    }
    
    checkAllCatsFed() {
        const allFed = Object.values(this.cats).every(cat => cat.fed);
        if (allFed && this.gameState.time === "Morning") {
            this.displayMessage("\n✨ All cats have been fed! Great job!");
            this.updateScore(10);
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
        document.getElementById('score').textContent = `Score: ${this.gameState.score}${this.gameMode === 'challenge' ? ' (Challenge)' : ' (Endless)'}`;
        
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
        this.stopCatMovement();
        this.stopMicroMovements();
    }
    
    useEnergy(amount, action) {
        const actualCost = Math.ceil(amount * this.settings.energyCostMultiplier);
        this.gameState.energy -= actualCost;
        if (this.gameState.energy < 0) this.gameState.energy = 0;
        
        this.dailyStats.energyUsed += actualCost;
        
        if (actualCost > 0) {
            this.displayMessage(`[-${actualCost} energy]`, 'energy');
        }
    }
    
    updateScore(points) {
        this.gameState.score += points;
        document.getElementById('score').textContent = `Score: ${this.gameState.score}`;
        
        // Check for game over in Challenge Mode
        if (this.gameMode === 'challenge' && this.gameState.score <= -50 && !this.gameState.gameOver) {
            this.triggerGameOver();
        }
    }
    
    updateCatHealth(catId, change, reason) {
        const cat = this.cats[catId];
        if (!cat) return;
        
        const oldHealth = cat.health || 75;
        cat.health = Math.max(0, Math.min(100, oldHealth + change));
        
        // Show health change notification
        if (change !== 0) {
            const changeText = change > 0 ? `+${change}` : `${change}`;
            const emoji = change > 0 ? '💚' : '💔';
            this.displayMessage(`${emoji} ${cat.name}'s health ${changeText} (${reason}) - Now ${cat.health}%`);
        }
        
        // Health warnings
        if (cat.health < 20 && oldHealth >= 20) {
            this.displayMessage(`⚠️ CRITICAL: ${cat.name}'s health is dangerously low!`);
        } else if (cat.health < 40 && oldHealth >= 40) {
            this.displayMessage(`⚠️ WARNING: ${cat.name}'s health is getting poor!`);
        }
        
        // Update display
        this.updateCastPanel();
    }
    
    updateAllCatHealth() {
        // Called periodically to adjust health based on current conditions
        Object.entries(this.cats).forEach(([catId, cat]) => {
            let healthChange = 0;
            let reasons = [];
            
            // Hunger affects health
            if (cat.hunger > 80) {
                healthChange -= 2;
                reasons.push("very hungry");
            } else if (cat.hunger < 30) {
                healthChange += 1;
                reasons.push("well fed");
            }
            
            // Happiness affects health
            if (cat.happy > 70) {
                healthChange += 1;
                reasons.push("happy");
            } else if (cat.happy < 30) {
                healthChange -= 2;
                reasons.push("unhappy");
            }
            
            // Mess level affects health
            if (cat.messLevel > 80) {
                healthChange -= 1;
                reasons.push("needs bathroom");
            }
            
            // Clean environment helps
            const room = this.rooms[cat.room];
            if (room && room.messes && room.messes.length === 0) {
                healthChange += 0.5;
                reasons.push("clean environment");
            } else if (room && room.messes && room.messes.length > 2) {
                healthChange -= 1;
                reasons.push("dirty room");
            }
            
            // Special needs cats (like Tink) need extra care
            if (cat.needsExtra && cat.room === cat.favoriteRoom) {
                healthChange += 1;
                reasons.push("in favorite room");
            }
            
            // Apply health change
            if (healthChange !== 0 && reasons.length > 0) {
                this.updateCatHealth(catId, healthChange, reasons.join(", "));
            }
        });
    }
    
    triggerGameOver() {
        this.gameState.gameOver = true;
        this.gameState.paused = true;
        
        // Stop the game loop
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        
        // Stop time progression
        this.stopTimeProgression();
        
        // Show game over screen
        this.showGameOverScreen();
    }
    
    showGameOverScreen() {
        // Create game over modal
        const gameOverHTML = `
            <div id="game-over-modal" class="game-over-overlay active">
                <div class="game-over-modal">
                    <div class="game-over-header">
                        <h2>💔 GAME OVER 💔</h2>
                    </div>
                    <div class="game-over-body">
                        <p class="game-over-message">Your score dropped below -50!</p>
                        <p class="final-stats">You survived <strong>${this.gameState.day}</strong> days.</p>
                        <p class="final-score">Final Score: <strong>${this.gameState.score}</strong></p>
                        
                        <div class="game-over-actions">
                            <button onclick="location.reload()" class="restart-btn">Try Again</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', gameOverHTML);
    }
    
    // Save game functionality
    saveGame() {
        const saveData = {
            playerName: this.playerName,
            difficulty: this.difficulty,
            gameMode: this.gameMode,
            gameState: {
                ...this.gameState,
                currentTime: this.gameState.currentTime
            },
            cats: {},
            rooms: {},
            catMovementStates: this.catMovementStates,
            dailyStats: this.dailyStats,
            dayStartTime: this.dayStartTime,
            timeProgressionStarted: this.timeProgressionStarted,
            saveDate: new Date().toISOString()
        };
        
        // Save cat states
        Object.keys(this.cats).forEach(catId => {
            saveData.cats[catId] = {
                ...this.cats[catId]
            };
        });
        
        // Save room states
        Object.keys(this.rooms).forEach(roomId => {
            const room = this.rooms[roomId];
            saveData.rooms[roomId] = {
                cats: [...room.cats],
                messes: room.messes ? [...room.messes] : [],
                foodBowl: room.foodBowl ? { ...room.foodBowl } : null,
                litterBoxes: room.litterBoxes ? room.litterBoxes.map(box => ({...box})) : null
            };
        });
        
        localStorage.setItem('catlife-save', JSON.stringify(saveData));
        this.displayMessage("🎮 Game saved successfully!", 'success');
    }
    
    // Load game functionality
    loadGame(saveData) {
        // Restore basic game state
        this.playerName = saveData.playerName;
        this.difficulty = saveData.difficulty;
        this.gameMode = saveData.gameMode;
        this.gameState = saveData.gameState;
        this.dailyStats = saveData.dailyStats;
        this.dayStartTime = saveData.dayStartTime;
        this.timeProgressionStarted = saveData.timeProgressionStarted;
        
        // Restore cat states
        Object.keys(saveData.cats).forEach(catId => {
            this.cats[catId] = saveData.cats[catId];
        });
        
        // Restore room states
        Object.keys(saveData.rooms).forEach(roomId => {
            if (this.rooms[roomId]) {
                this.rooms[roomId].cats = saveData.rooms[roomId].cats;
                this.rooms[roomId].messes = saveData.rooms[roomId].messes || [];
                if (saveData.rooms[roomId].foodBowl) {
                    this.rooms[roomId].foodBowl = saveData.rooms[roomId].foodBowl;
                }
                if (saveData.rooms[roomId].litterBoxes) {
                    this.rooms[roomId].litterBoxes = saveData.rooms[roomId].litterBoxes;
                }
            }
        });
        
        // Restore movement states
        if (saveData.catMovementStates) {
            this.catMovementStates = saveData.catMovementStates;
        }
        
        // Update display
        this.updateDisplay();
        this.renderRooms();
        this.updateCastPanel();
        
        // Resume game systems
        this.startGame();
        this.displayMessage("🎮 Game loaded successfully!", 'success');
    }
    
    // Check if save exists
    static hasSavedGame() {
        return localStorage.getItem('catlife-save') !== null;
    }
    
    // Get save info
    static getSaveInfo() {
        const saveData = localStorage.getItem('catlife-save');
        if (!saveData) return null;
        
        try {
            const data = JSON.parse(saveData);
            return {
                playerName: data.playerName,
                day: data.gameState.day,
                score: data.gameState.score,
                gameMode: data.gameMode,
                saveDate: data.saveDate
            };
        } catch (e) {
            return null;
        }
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
    console.log('DOM loaded, setting up start screen...');
    
    const highScoreManager = new HighScoreManager();
    highScoreManager.displayHighScores();
    
    let selectedDifficulty = 'normal';
    let selectedGameMode = 'challenge';
    let gameInstance = null;
    
    // Difficulty button handlers
    const diffBtns = document.querySelectorAll('.diff-btn');
    console.log('Difficulty buttons found:', diffBtns.length);
    
    diffBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Difficulty clicked:', btn.dataset.difficulty);
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDifficulty = btn.dataset.difficulty;
        });
    });
    
    // Game mode button handlers
    const modeBtns = document.querySelectorAll('.mode-btn');
    console.log('Mode buttons found:', modeBtns.length);
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mode clicked:', btn.dataset.mode);
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGameMode = btn.dataset.mode;
        });
    });
    
    // Start game button
    const startBtn = document.getElementById('start-game-btn');
    console.log('Start button found:', startBtn);
    
    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Start button clicked!');
            console.log('Selected difficulty:', selectedDifficulty);
            console.log('Selected game mode:', selectedGameMode);
            
            try {
                const playerName = document.getElementById('player-name').value.trim() || 'Cat Lover';
                console.log('Player name:', playerName);
                
                // Hide start screen
                document.getElementById('start-screen').style.display = 'none';
                document.getElementById('game-container').style.display = 'block';
                
                // Create new game instance
                gameInstance = new CatLifeGame(playerName, selectedDifficulty, selectedGameMode);
                console.log('Game instance created successfully!');
                
                // Show save button for endless mode
                if (selectedGameMode === 'endless') {
                    document.getElementById('save-game-btn').style.display = 'inline-block';
                }
                
                // Set up save button handler
                document.getElementById('save-game-btn').addEventListener('click', () => {
                    if (gameInstance) {
                        gameInstance.saveGame();
                    }
                });
                
                // Override endDay to save high score
                const originalEndDay = gameInstance.endDay.bind(gameInstance);
                gameInstance.endDay = function() {
                    originalEndDay();
                    highScoreManager.addScore(playerName, this.gameState.score, selectedDifficulty);
                };
            } catch (error) {
                console.error('Error starting game:', error);
                alert('Error starting game: ' + error.message);
            }
        });
    } else {
        console.error('Start button not found!');
    }
    
    // Allow Enter key to start game
    document.getElementById('player-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('start-game-btn').click();
        }
    });
    
    // Check for saved game on load
    const continueBtn = document.getElementById('continue-game-btn');
    if (CatLifeGame.hasSavedGame()) {
        const saveInfo = CatLifeGame.getSaveInfo();
        if (saveInfo) {
            continueBtn.style.display = 'block';
            continueBtn.innerHTML = `CONTINUE (${saveInfo.playerName} - Day ${saveInfo.day}, Score: ${saveInfo.score})`;
            
            continueBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Continue game clicked');
                
                const saveData = localStorage.getItem('catlife-save');
                if (saveData) {
                    try {
                        const data = JSON.parse(saveData);
                        
                        // Hide start screen
                        document.getElementById('start-screen').style.display = 'none';
                        document.getElementById('game-container').style.display = 'block';
                        
                        // Create game instance and load save
                        gameInstance = new CatLifeGame(data.playerName, data.difficulty, data.gameMode);
                        gameInstance.loadGame(data);
                        
                        // Show save button for endless mode
                        if (data.gameMode === 'endless') {
                            document.getElementById('save-game-btn').style.display = 'inline-block';
                        }
                        
                        // Set up save button handler
                        document.getElementById('save-game-btn').addEventListener('click', () => {
                            if (gameInstance) {
                                gameInstance.saveGame();
                            }
                        });
                        
                        // Override endDay to save high score
                        const originalEndDay = gameInstance.endDay.bind(gameInstance);
                        gameInstance.endDay = function() {
                            originalEndDay();
                            highScoreManager.addScore(this.playerName, this.gameState.score, this.difficulty);
                        };
                    } catch (error) {
                        console.error('Error loading saved game:', error);
                        alert('Error loading saved game. Starting new game instead.');
                        continueBtn.style.display = 'none';
                    }
                }
            });
        }
    }
});