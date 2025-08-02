class CatLifeGame {
    constructor() {
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
            }
        };
        
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
                conflicts: ["scampi", "stinkylee"] // Fights with these cats
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
            }
        };
        
        this.gameState = {
            day: 1,
            time: "Morning",
            score: 0,
            selectedCat: null,
            events: [],
            isGameOver: false
        };
        
        this.timeSequence = ["Morning", "Afternoon", "Evening", "Night"];
        this.currentTimeIndex = 0;
        
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
    }
    
    renderRooms() {
        const container = document.getElementById('rooms-container');
        container.innerHTML = '';
        
        Object.entries(this.rooms).forEach(([roomId, room]) => {
            const roomDiv = document.createElement('div');
            roomDiv.className = 'room';
            roomDiv.id = `room-${roomId}`;
            
            // Check for conflicts in this room
            const hasConflict = this.checkRoomConflicts(roomId);
            if (hasConflict) {
                roomDiv.classList.add('has-conflict');
            }
            
            const header = document.createElement('div');
            header.className = 'room-header';
            header.textContent = room.name;
            roomDiv.appendChild(header);
            
            const catsContainer = document.createElement('div');
            catsContainer.className = 'cats-in-room';
            
            room.cats.forEach(catId => {
                const cat = this.cats[catId];
                const catDiv = document.createElement('div');
                catDiv.className = 'cat-icon';
                catDiv.id = `cat-${catId}`;
                
                if (this.gameState.selectedCat === catId) {
                    catDiv.classList.add('selected');
                }
                
                if (cat.happy < 30) {
                    catDiv.classList.add('unhappy');
                }
                
                if (hasConflict && this.isCatInConflict(catId, roomId)) {
                    catDiv.classList.add('fighting');
                }
                
                catDiv.innerHTML = `
                    <div class="cat-emoji">${cat.emoji}</div>
                    <div class="cat-name">${cat.name}</div>
                    <div class="cat-mood">${this.getCatMood(cat)}</div>
                `;
                
                catDiv.addEventListener('click', () => this.selectCat(catId));
                catsContainer.appendChild(catDiv);
            });
            
            // Show messes in room
            if (room.messes.length > 0) {
                const messDiv = document.createElement('div');
                messDiv.className = 'room-mess';
                messDiv.textContent = `⚠️ ${room.messes.join(', ')}`;
                messDiv.style.color = '#ff6666';
                messDiv.style.marginTop = '10px';
                messDiv.style.textAlign = 'center';
                roomDiv.appendChild(messDiv);
            }
            
            roomDiv.appendChild(catsContainer);
            container.appendChild(roomDiv);
        });
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
        this.showCatActions(catId);
    }
    
    showCatActions(catId) {
        const cat = this.cats[catId];
        const selectedCatSpan = document.getElementById('selected-cat');
        selectedCatSpan.textContent = cat.name;
        
        const actionsDiv = document.getElementById('action-buttons');
        actionsDiv.innerHTML = '';
        
        // Feed button
        const feedBtn = document.createElement('button');
        feedBtn.className = 'action-btn';
        feedBtn.textContent = cat.fed ? '✅ Already Fed' : '🍽️ Feed';
        feedBtn.disabled = cat.fed && this.gameState.time === "Morning";
        feedBtn.addEventListener('click', () => {
            this.feedCat(catId);
            this.showCatActions(catId);
        });
        actionsDiv.appendChild(feedBtn);
        
        // Play button
        const playBtn = document.createElement('button');
        playBtn.className = 'action-btn';
        playBtn.textContent = '🎾 Play';
        playBtn.addEventListener('click', () => {
            this.playWithCat(catId);
            this.showCatActions(catId);
        });
        actionsDiv.appendChild(playBtn);
        
        // Move buttons
        Object.entries(this.rooms).forEach(([roomId, room]) => {
            if (cat.room !== roomId) {
                const moveBtn = document.createElement('button');
                moveBtn.className = 'action-btn';
                moveBtn.textContent = `📦 Move to ${room.name}`;
                moveBtn.addEventListener('click', () => {
                    this.moveCat(catId, roomId);
                    this.showCatActions(catId);
                });
                actionsDiv.appendChild(moveBtn);
            }
        });
        
        // Cat info
        const infoDiv = document.createElement('div');
        infoDiv.style.marginTop = '20px';
        infoDiv.style.color = '#888';
        infoDiv.innerHTML = `
            <p>Trait: ${cat.trait}</p>
            <p>Happiness: ${this.getHappyBar(cat.happy)}</p>
            <p>Hunger: ${this.getHungerBar(cat.hunger)}</p>
            ${cat.conflicts.length > 0 ? `<p>⚠️ Doesn't get along with: ${cat.conflicts.map(c => this.cats[c].name).join(', ')}</p>` : ''}
        `;
        actionsDiv.appendChild(infoDiv);
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
        const cat = this.cats[catId];
        const oldRoom = cat.room;
        
        // Remove from old room
        this.rooms[oldRoom].cats = this.rooms[oldRoom].cats.filter(id => id !== catId);
        
        // Add to new room
        cat.room = newRoomId;
        this.rooms[newRoomId].cats.push(catId);
        
        this.displayMessage(`You moved ${cat.name} to the ${this.rooms[newRoomId].name}.`);
        this.gameState.score += 2;
        
        this.renderRooms();
        this.checkConflicts();
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
            default:
                this.displayMessage("I don't understand that command. Type 'help' for options.");
        }
        
        if (Math.random() < 0.3 && this.gameState.time !== "Night") {
            this.triggerRandomEvent();
        }
    }
    
    feedCat(catId) {
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
    
    cleanArea(area) {
        let cleaned = 0;
        Object.values(this.rooms).forEach(room => {
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
        this.renderRooms();
    }
    
    triggerRandomEvent() {
        const events = [
            () => {
                if (Math.random() < 0.5) {
                    const room = this.rooms[this.cats.snicker.room];
                    room.messes.push("💩 poop");
                    this.displayMessage(`💩 Oh no! Snicker has pooped in the ${room.name}!`);
                    this.cats.snicker.messLevel = (this.cats.snicker.messLevel || 0) + 1;
                    this.gameState.score -= 2;
                }
            },
            () => {
                if (Math.random() < 0.5) {
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
        
        Object.values(this.cats).forEach(cat => {
            cat.hunger += 15;
            if (cat.hunger > 80) cat.happy -= 10;
            if (cat.aggression) cat.aggression += 10;
        });
        
        if (this.gameState.time === "Evening") {
            this.displayMessage("The cats are getting sleepy. One more feeding before bed!");
            Object.values(this.cats).forEach(cat => cat.fed = false);
        }
        
        if (this.gameState.time === "Night") {
            this.displayMessage("🌙 The cats are settling down for the night...");
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
- feed [cat name] - Feed a specific cat
- clean [room/all] - Clean up messes
- play [cat name] - Play with a cat
- move [cat] to [room] - Move a cat to another room
- skip - Skip to next time period
- help - Show this help message

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
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CatLifeGame();
});