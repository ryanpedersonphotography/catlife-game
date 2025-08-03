class WelcomeScreen {
    constructor(game) {
        this.game = game;
    }

    show(isNewDay = false) {
        const overlay = document.createElement('div');
        overlay.className = 'welcome-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;

        const content = document.createElement('div');
        content.className = 'welcome-content';
        content.style.cssText = `
            background: #2b2b2b;
            border: 2px solid #4a90e2;
            border-radius: 10px;
            padding: 30px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            color: #fff;
            font-family: 'Courier New', monospace;
            box-shadow: 0 4px 20px rgba(74, 144, 226, 0.3);
        `;

        if (isNewDay) {
            content.innerHTML = this.getDailyStatusHTML();
        } else {
            content.innerHTML = this.getWelcomeHTML();
        }

        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // Add continue button
        const continueBtn = document.createElement('button');
        continueBtn.textContent = isNewDay ? 'Start New Day' : 'Start Game';
        continueBtn.style.cssText = `
            display: block;
            margin: 20px auto 0;
            padding: 10px 30px;
            background: #4a90e2;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            transition: background 0.3s;
        `;
        continueBtn.onmouseover = () => continueBtn.style.background = '#357abd';
        continueBtn.onmouseout = () => continueBtn.style.background = '#4a90e2';
        continueBtn.onclick = () => {
            overlay.remove();
            if (isNewDay) {
                this.game.displayMessage(`\n🌅 Day ${this.game.gameState.day} begins!`);
                this.game.displayMessage("Good morning! Time to take care of your special needs cats.");
                this.game.displayMessage("The cats have scattered to different rooms.");
            }
        };
        
        content.appendChild(continueBtn);
    }

    getWelcomeHTML() {
        const modeText = this.game.gameMode === 'challenge' ? 'Challenge Mode' : 'Endless Mode';
        const difficultyText = this.game.difficulty.charAt(0).toUpperCase() + this.game.difficulty.slice(1);
        
        return `
            <h1 style="text-align: center; color: #4a90e2; margin-bottom: 20px;">🐱 Welcome to Cat Life! 🐱</h1>
            
            <div style="margin-bottom: 20px;">
                <h2 style="color: #66cc66;">📋 Your Mission:</h2>
                <p>You're caring for 6 special needs cats with unique personalities and challenges. 
                Your goal is to keep them all happy, healthy, and safe through each day!</p>
            </div>

            <div style="margin-bottom: 20px;">
                <h2 style="color: #66cc66;">🎮 Game Settings:</h2>
                <p><strong>Player:</strong> ${this.game.playerName}</p>
                <p><strong>Mode:</strong> ${modeText}</p>
                <p><strong>Difficulty:</strong> ${difficultyText}</p>
            </div>

            <div style="margin-bottom: 20px;">
                <h2 style="color: #66cc66;">🐈 Meet Your Cats:</h2>
                ${this.getCatIntroductions()}
            </div>

            <div style="margin-bottom: 20px;">
                <h2 style="color: #66cc66;">⏰ Daily Schedule:</h2>
                <ul style="margin-left: 20px;">
                    <li><strong>Morning (7 AM - 12 PM):</strong> Feed all cats, clean messes</li>
                    <li><strong>Afternoon (12 PM - 5 PM):</strong> Play time, manage needs</li>
                    <li><strong>Evening (5 PM - 10 PM):</strong> Prepare for bedtime</li>
                    <li><strong>Night (10 PM):</strong> All happy cats should be asleep!</li>
                </ul>
            </div>

            <div style="background: #333; padding: 15px; border-radius: 5px; margin-bottom: 10px;">
                <h3 style="color: #ff6666;">⚠️ Important Tips:</h3>
                <ul style="margin-left: 20px;">
                    <li>Cats outside at night will refuse to come in!</li>
                    <li>Only happy cats (50+ happiness) can be put to sleep</li>
                    <li>Watch your energy - rest when needed!</li>
                    <li>Cats in the same room might fight</li>
                </ul>
            </div>
        `;
    }

    getDailyStatusHTML() {
        const aliveCats = Object.values(this.game.cats).filter(cat => !cat.missing);
        
        return `
            <h1 style="text-align: center; color: #4a90e2; margin-bottom: 20px;">🌅 Day ${this.game.gameState.day} - Morning Status 🌅</h1>
            
            <div style="margin-bottom: 20px;">
                <h2 style="color: #66cc66;">📊 Your Stats:</h2>
                <p><strong>Score:</strong> ${this.game.gameState.score}</p>
                <p><strong>Energy:</strong> ${this.game.gameState.energy}/${this.game.gameState.maxEnergy}</p>
            </div>

            <div style="margin-bottom: 20px;">
                <h2 style="color: #66cc66;">🐈 Cat Status Report:</h2>
                <div style="display: grid; gap: 10px;">
                    ${this.getCatStatusCards()}
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <h2 style="color: #66cc66;">🎯 Today's Goals:</h2>
                <ul style="margin-left: 20px;">
                    <li>Feed all ${aliveCats.length} cats</li>
                    <li>Keep the house clean</li>
                    <li>Play with unhappy cats</li>
                    <li>Get all happy cats to sleep by 10 PM</li>
                </ul>
            </div>

            <div style="background: #333; padding: 15px; border-radius: 5px;">
                <h3 style="color: #ffcc00;">💡 Morning Reminder:</h3>
                <p>All cats are hungry after the night! Start by feeding them to boost their happiness.</p>
            </div>
        `;
    }

    getCatIntroductions() {
        const catDescriptions = {
            boots: "😺 <strong>Boots:</strong> A confident wanderer who loves the outdoors but gets stressed at bedtime.",
            mochi: "😸 <strong>Mochi:</strong> Sweet but sneaky - will steal food if left alone!",
            oscar: "😹 <strong>Oscar:</strong> Grumpy and unpredictable, prone to mood swings and conflicts.",
            pip: "😻 <strong>Pip:</strong> Young and energetic, needs lots of playtime to stay happy.",
            mittens: "😼 <strong>Mittens:</strong> A messy eater who tracks litter everywhere. High maintenance!",
            scampi: "😿 <strong>Scampi:</strong> Anxious and sensitive, prone to accidents when stressed."
        };

        let html = '<div style="display: grid; gap: 8px;">';
        for (const [catId, desc] of Object.entries(catDescriptions)) {
            const cat = this.game.cats[catId];
            if (cat && !cat.missing) {
                html += `<div style="padding: 8px; background: #333; border-radius: 5px;">${desc}</div>`;
            }
        }
        html += '</div>';
        return html;
    }

    getCatStatusCards() {
        let html = '';
        
        for (const [catId, cat] of Object.entries(this.game.cats)) {
            if (!cat.missing) {
                const moodEmoji = cat.happy >= 70 ? '😊' : cat.happy >= 40 ? '😐' : '😿';
                const hungerEmoji = cat.hunger > 70 ? '🍽️!' : cat.hunger > 30 ? '🍽️' : '✓';
                const locationEmoji = cat.room === 'outside' ? '🌳' : '🏠';
                
                html += `
                    <div style="background: #333; padding: 10px; border-radius: 5px; border: 1px solid #555;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong>${cat.name}</strong>
                            <span>${moodEmoji} ${cat.happy}%</span>
                        </div>
                        <div style="font-size: 0.9em; margin-top: 5px; color: #ccc;">
                            ${locationEmoji} ${cat.room.charAt(0).toUpperCase() + cat.room.slice(1)} | 
                            Hunger: ${hungerEmoji} ${cat.hunger}% | 
                            Health: ${cat.health}%
                        </div>
                    </div>
                `;
            }
        }
        
        return html;
    }
}