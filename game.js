class CatLifeGame {
    constructor() {
        this.cats = {
            gusty: {
                name: "Gusty",
                fed: false,
                happy: 50,
                trait: "always eats other cats' food",
                hunger: 80
            },
            snicker: {
                name: "Snicker",
                fed: false,
                happy: 50,
                trait: "poops everywhere",
                hunger: 70,
                messLevel: 0
            },
            rudy: {
                name: "Rudy",
                fed: false,
                happy: 50,
                trait: "fights with other cats",
                hunger: 75,
                aggression: 80
            },
            scampi: {
                name: "Scampi",
                fed: false,
                happy: 50,
                trait: "pees everywhere",
                hunger: 70,
                messLevel: 0
            },
            stinkylee: {
                name: "Stinky Lee",
                fed: false,
                happy: 50,
                trait: "mysterious and aloof",
                hunger: 60
            },
            jonah: {
                name: "Jonah",
                fed: false,
                happy: 50,
                trait: "gentle soul",
                hunger: 65
            }
        };
        
        this.gameState = {
            day: 1,
            time: "Morning",
            score: 0,
            messyAreas: [],
            events: [],
            isGameOver: false
        };
        
        this.timeSequence = ["Morning", "Afternoon", "Evening", "Night"];
        this.currentTimeIndex = 0;
        
        this.init();
    }
    
    init() {
        this.updateDisplay();
        this.displayMessage("Good morning! It's time to feed your special needs cats.");
        this.displayMessage("Each cat has unique needs. Type 'help' to see available commands.");
        this.updateCatStatus();
        
        const input = document.getElementById('player-input');
        const submitBtn = document.getElementById('submit-btn');
        
        submitBtn.addEventListener('click', () => this.handleInput());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleInput();
        });
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
                this.feedCat(parts[1]);
                break;
            case 'clean':
                this.cleanArea(parts.slice(1).join(' '));
                break;
            case 'play':
                this.playWithCat(parts[1]);
                break;
            case 'separate':
                this.separateCats(parts[1], parts[2]);
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
    
    feedCat(catName) {
        if (!catName) {
            this.displayMessage("Which cat would you like to feed?");
            return;
        }
        
        const cat = this.cats[catName];
        if (!cat) {
            this.displayMessage("I don't know a cat by that name.");
            return;
        }
        
        if (cat.fed && this.gameState.time === "Morning") {
            this.displayMessage(`${cat.name} has already been fed this morning.`);
            return;
        }
        
        cat.fed = true;
        cat.hunger = Math.max(0, cat.hunger - 50);
        cat.happy += 10;
        this.gameState.score += 5;
        
        this.displayMessage(`You fed ${cat.name}. They purr contentedly.`);
        
        if (catName === 'gusty' && Math.random() < 0.7) {
            const victimCat = this.getRandomCat(['gusty']);
            if (victimCat && victimCat.fed) {
                this.displayMessage(`Oh no! Gusty is eating ${victimCat.name}'s food too!`);
                victimCat.hunger += 20;
                victimCat.happy -= 10;
                this.gameState.score -= 2;
            }
        }
        
        this.checkAllCatsFed();
        this.updateCatStatus();
    }
    
    cleanArea(area) {
        if (this.gameState.messyAreas.length === 0) {
            this.displayMessage("Everything looks clean right now!");
            return;
        }
        
        const cleaned = this.gameState.messyAreas.filter(mess => 
            mess.toLowerCase().includes(area.toLowerCase()) || area === 'all'
        );
        
        if (cleaned.length > 0) {
            this.gameState.messyAreas = this.gameState.messyAreas.filter(mess => 
                !cleaned.includes(mess)
            );
            this.gameState.score += cleaned.length * 3;
            this.displayMessage(`You cleaned up the ${cleaned.join(', ')}. Much better!`);
            
            Object.values(this.cats).forEach(cat => {
                cat.happy += 5;
                if (cat.messLevel) cat.messLevel = 0;
            });
        } else {
            this.displayMessage("I don't see any mess in that area.");
        }
        
        this.updateCatStatus();
    }
    
    playWithCat(catName) {
        const cat = this.cats[catName];
        if (!cat) {
            this.displayMessage("I don't know a cat by that name.");
            return;
        }
        
        cat.happy = Math.min(100, cat.happy + 20);
        if (cat.aggression) cat.aggression = Math.max(0, cat.aggression - 15);
        this.gameState.score += 3;
        
        this.displayMessage(`You play with ${cat.name}. They seem much happier!`);
        this.updateCatStatus();
    }
    
    separateCats(cat1Name, cat2Name) {
        const cat1 = this.cats[cat1Name];
        const cat2 = this.cats[cat2Name];
        
        if (!cat1 || !cat2) {
            this.displayMessage("Please specify two valid cat names to separate.");
            return;
        }
        
        if (cat1.aggression > 50 || cat2.aggression > 50) {
            this.displayMessage(`You separate ${cat1.name} and ${cat2.name}. Peace is restored!`);
            cat1.aggression = Math.max(0, (cat1.aggression || 0) - 30);
            cat2.aggression = Math.max(0, (cat2.aggression || 0) - 30);
            this.gameState.score += 5;
        } else {
            this.displayMessage(`${cat1.name} and ${cat2.name} weren't fighting.`);
        }
        
        this.updateCatStatus();
    }
    
    triggerRandomEvent() {
        const events = [
            () => {
                if (Math.random() < 0.5) {
                    this.displayMessage("💩 Oh no! Snicker has pooped on the floor!");
                    this.gameState.messyAreas.push("floor (poop)");
                    this.cats.snicker.messLevel = (this.cats.snicker.messLevel || 0) + 1;
                    this.gameState.score -= 2;
                }
            },
            () => {
                if (Math.random() < 0.5) {
                    this.displayMessage("💦 Uh oh! Scampi has peed on the couch!");
                    this.gameState.messyAreas.push("couch (pee)");
                    this.cats.scampi.messLevel = (this.cats.scampi.messLevel || 0) + 1;
                    this.gameState.score -= 2;
                }
            },
            () => {
                if (this.cats.rudy.aggression > 60) {
                    const victim = this.getRandomCat(['rudy']);
                    if (victim) {
                        this.displayMessage(`⚔️ Rudy is fighting with ${victim.name}!`);
                        victim.happy -= 15;
                        this.cats.rudy.happy -= 10;
                        this.gameState.score -= 3;
                    }
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
        this.updateCatStatus();
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
        this.updateCatStatus();
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
        
        if (this.gameState.messyAreas.length > 0) {
            dayScore -= this.gameState.messyAreas.length * 5;
            summary += `\n🧹 ${this.gameState.messyAreas.length} messes left uncleaned.\n`;
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
    
    getRandomCat(exclude = []) {
        const catNames = Object.keys(this.cats).filter(name => !exclude.includes(name));
        if (catNames.length === 0) return null;
        return this.cats[catNames[Math.floor(Math.random() * catNames.length)]];
    }
    
    showHelp() {
        const helpText = `
Available Commands:
- feed [cat name] - Feed a specific cat (gusty, snicker, rudy, scampi, stinkylee, jonah)
- clean [area/all] - Clean up messes
- play [cat name] - Play with a cat to increase happiness
- separate [cat1] [cat2] - Separate fighting cats
- skip - Skip to next time period
- help - Show this help message

Remember each cat's special needs:
- Gusty: Steals other cats' food
- Snicker: Makes messes (💩)
- Rudy: Gets aggressive with other cats
- Scampi: Makes messes (💦)
- Stinky Lee: Mysterious but low maintenance
- Jonah: Gentle and easy-going
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
    
    updateCatStatus() {
        const statusDiv = document.getElementById('cat-status');
        statusDiv.innerHTML = '<h3>Cat Status:</h3>';
        
        Object.values(this.cats).forEach(cat => {
            const statusItem = document.createElement('div');
            statusItem.className = 'cat-status-item';
            
            const happyEmoji = cat.happy > 70 ? '😊' : cat.happy > 30 ? '😐' : '😿';
            const fedStatus = cat.fed ? '✅' : '❌';
            const hungerBar = '🍖'.repeat(Math.ceil(cat.hunger / 20));
            
            statusItem.innerHTML = `
                <strong>${cat.name}</strong> ${happyEmoji}
                Fed: ${fedStatus} | Hunger: ${hungerBar}
                <small>${cat.trait}</small>
            `;
            
            statusDiv.appendChild(statusItem);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CatLifeGame();
});