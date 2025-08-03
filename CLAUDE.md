# CatLife: Special Needs Cat Caretaker Game

## Project Overview
CatLife is a browser-based simulation game where players care for 9 special needs cats, each with unique personalities, traits, and care requirements. The game emphasizes empathy, resource management, and strategic planning to keep all cats healthy and happy.

**Live URL**: https://catlife-special-needs-game.netlify.app  
**Repository**: https://github.com/ryanpedersonphotography/catlife-game

## Game Mechanics

### Core Gameplay Loop
1. **Daily Cycle**: Morning → Afternoon → Evening → Night → Sleep
2. **Energy System**: Player has limited energy (100-150 depending on difficulty) for actions
3. **Scoring**: Actions affect score; Challenge mode ends at -50, Endless mode continues forever
4. **Time Progression**: Automatic time advancement with action-based progression

### Key Systems

#### 1. Cat Management
- **9 Unique Cats** with individual traits:
  - Gusty: Steals other cats' food
  - Snicker: Poops everywhere
  - Rudy: Aggressive, fights with others
  - Scampi: Pees everywhere
  - Stinky Lee: Mysterious and aloof
  - Jonah: Gentle soul, gets along with everyone
  - Tink: Needs extra attention, loves bathroom (lower starting health)
  - Lucy: Independent and feisty
  - Giselle: Graceful and elegant

#### 2. Health System (1-100)
- Visual health bars in cast panel
- Color-coded health states (green→red)
- Health affected by:
  - **Positive**: Feeding (+3), Playing (+2), Clean environment, Happiness
  - **Negative**: Fights (-2), Accidents (-3), Hunger, Unhappiness
- Periodic health updates based on care quality
- Special needs cats have different health requirements

#### 3. Room System
- **4 Rooms**: Kitchen, Living Room, Bedroom, Bathroom
- **Outside Area**: Cats can go outside (front door functionality)
- **Visual Door System**: Realistic doors between rooms
- **Pathfinding**: Cats use BFS algorithm to navigate through doors
- **Room Conflicts**: Certain cats can't be in same room together

#### 4. Food System
- **Central Food Bowl** in kitchen (replaces individual feeding)
- Bowl capacity: 10 units
- Visual states: Empty (🥣), Half-full (🍜), Full (🍲)
- Cats autonomously go to kitchen when hungry
- Hunger increases over time

#### 5. Bathroom System
- **Litter Boxes**: 2 boxes in bathroom, 5 uses each
- **Visual States**: Clean (🟦), Getting dirty (🟫), Needs cleaning (🟪)
- **Fill Indicators**: Shows usage with poop emojis (💩)
- **Autonomous Use**: Cats go when messLevel > 70
- **Accidents**: Occur when no clean boxes available

#### 6. Mess System
- **Click to Clean**: Poop (💩) and pee (💦) messes
- **Energy Cost**: 4 energy per mess
- **Random Accidents**: Based on cat traits
- **Room Limit**: Max 3 messes per room

#### 7. Movement System
- **Continuous Movement**: 60fps animation using requestAnimationFrame
- **Speed**: 0.03-0.08 pixels per frame
- **Collision Detection**: Cats avoid each other
- **Autonomous Behaviors**:
  - Seek food when hungry
  - Find litter box when needed
  - Random wandering with rest periods
  - Micro-movements and idle animations

#### 8. Conflict System
- **Cat Incompatibilities**:
  - Gusty ↔ Snicker
  - Rudy ↔ Scampi, Stinky Lee, Lucy
- **Visual Indicators**: Red room borders, fighting animations
- **Collision Fights**: Only trigger on actual contact
- **Health Impact**: Fights reduce health and happiness

#### 9. Save/Load System
- **Endless Mode Only**: Save button appears in header
- **Complete State Preservation**: All cat states, room states, scores
- **Continue Button**: Shows on start screen with save info
- **LocalStorage Based**: Saves to 'catlife-save' key

## Technical Architecture

### Files Structure
```
catlife-game/
├── index.html      # Game UI structure
├── game.js         # Core game logic (~4000 lines)
├── style.css       # Visual styling and animations
└── package.json    # NPM configuration
```

### Key Classes/Objects

#### CatLifeGame Class
Main game controller with methods:
- `constructor(playerName, difficulty, gameMode)`
- `startGame()` - Initialize all systems
- `updateCatHealth(catId, change, reason)` - Health management
- `feedCat(catId)` - Feeding via food bowl
- `playWithCat(catId)` - Interaction system
- `cleanLitterBox(index)` - Bathroom maintenance
- `saveGame()` / `loadGame()` - Persistence
- `findPath(fromRoom, toRoom)` - BFS pathfinding
- `checkCatCollision()` - Collision detection
- `startMicroMovements()` - Animation system

#### Data Structures
```javascript
// Cat object structure
{
  name: "Gusty",
  fed: false,
  asleep: false,
  happy: 50,
  health: 75,
  hunger: 80,
  messLevel: 0,
  room: "kitchen",
  emoji: "🐱",
  conflicts: ["snicker"],
  trait: "always eats other cats' food"
}

// Room structure
{
  name: "Kitchen",
  cats: [],
  messes: [],
  foodBowl: {
    maxFood: 10,
    currentFood: 0,
    position: { x: 250, y: 150 }
  }
}
```

### Animation & Visual Effects
- **CSS Animations**: Walking, fighting, sleeping, floating effects
- **SVG Rendering**: House layout, doors, room boundaries
- **Dynamic Styling**: Health bars, fill indicators, status colors
- **Responsive Design**: Adapts to screen sizes

## Development Tips

### Common Tasks

1. **Add New Cat Behavior**:
   - Modify cat object in constructor
   - Add behavior logic in `triggerRandomEvent()`
   - Update relevant systems (movement, health, etc.)

2. **Modify Room Layout**:
   - Update room dimensions in `renderRooms()`
   - Adjust door positions in `this.doorPositions`
   - Update pathfinding connections

3. **Add New Game Mechanic**:
   - Create system in game class
   - Add visual elements in `renderRoomContents()`
   - Integrate with time progression/events
   - Update save/load functionality

4. **Adjust Difficulty**:
   - Modify `difficultySettings` object
   - Adjust energy costs, accident chances
   - Tune health change rates

### Performance Considerations
- Uses requestAnimationFrame for smooth 60fps
- Efficient collision detection with distance calculations
- Batched DOM updates in render cycles
- Minimal object creation in animation loops

### Testing Checklist
- [ ] All cats spawn inside rooms
- [ ] No cats start in conflict positions
- [ ] Food bowl refills properly
- [ ] Litter boxes show correct fill states
- [ ] Save/load preserves all states
- [ ] Health updates reflect care quality
- [ ] Pathfinding works between all rooms
- [ ] Collisions prevent overlapping

## Future Enhancement Ideas
1. **Medicine System**: Special medication schedules for cats
2. **Toy System**: Interactive toys for enrichment
3. **Weather Effects**: Affect cat moods and behaviors
4. **Veterinary Visits**: Health emergencies and checkups
5. **Adoption Events**: New cats arrive, others find homes
6. **Seasonal Changes**: Different challenges each season
7. **Achievements**: Unlock rewards for good care
8. **Multi-day Challenges**: Weekly goals and events

## Deployment
- **Platform**: Netlify
- **Auto-deploy**: Pushes to master branch trigger deployment
- **Build**: Static files, no build process needed
- **Domain**: https://catlife-special-needs-game.netlify.app

## Known Issues & Quirks
1. Cats occasionally cluster near doors when pathfinding
2. Fight animations may overlap with movement
3. Very rare: Cat might get stuck between rooms (refresh fixes)
4. Mobile touch controls need optimization

## Debug Commands
Access via browser console:
```javascript
gameInstance.cats.gusty.health = 100  // Set health
gameInstance.gameState.energy = 150   // Set energy
gameInstance.updateAllCatHealth()     // Force health update
gameInstance.renderRooms()            // Force re-render
```

## Code Improvement Recommendations

### Architecture Improvements
1. **Modular Structure**: Split the monolithic 4000+ line game.js into modules:
   - `GameEngine.js` - Core game logic
   - `CatManager.js` - Cat AI and behaviors
   - `UIManager.js` - DOM manipulation
   - `AudioManager.js` - Sound effects
   - `SaveManager.js` - Save/load functionality

2. **Modern JavaScript**: 
   - Use ES6 modules, classes, async/await
   - Replace var with const/let
   - Use optional chaining and nullish coalescing
   - Implement proper state management pattern

3. **Performance Optimizations**:
   - Cache DOM queries instead of repeated getElementById
   - Implement object pooling for animations
   - Use Web Workers for pathfinding calculations
   - Add spatial partitioning for collision detection

### Recommended Libraries

#### Essential (High Impact, Easy Integration)
1. **Howler.js** (2KB) - Professional audio management
   - Ambient sounds: purring, meowing
   - Action feedback: eating, playing sounds
   - Spatial audio based on room location

2. **GSAP** (Free) - Smooth animations
   - Replace CSS transitions with butter-smooth movement
   - Add particle effects for feeding/playing
   - Implement easing functions for natural motion

3. **Hammer.js** (2KB) - Touch gesture support
   - Swipe to move cats between rooms
   - Pinch to zoom on mobile
   - Long press for cat details

#### Nice to Have
1. **Chart.js** - Statistics visualization
   - Track cat health over time
   - Show daily care performance
   - Visualize happiness trends

2. **LocalForage** - Better storage than localStorage
   - Larger save files
   - Better performance
   - Offline support

3. **Lottie** - Complex animations
   - Professional loading screens
   - Victory animations
   - Cat emotion indicators

### Quick Wins (1-2 days implementation)
1. **Progressive Web App**:
   ```json
   // Add manifest.json for mobile installation
   {
     "name": "CatLife: Special Needs Cat Caretaker",
     "short_name": "CatLife",
     "start_url": "/",
     "display": "standalone",
     "theme_color": "#4CAF50"
   }
   ```

2. **Basic Audio System**:
   ```javascript
   // Simple sound effects with Howler.js
   const sounds = {
     meow: new Howl({ src: ['sounds/meow.mp3'] }),
     purr: new Howl({ src: ['sounds/purr.mp3'], loop: true }),
     eating: new Howl({ src: ['sounds/eating.mp3'] })
   };
   ```

3. **Particle Effects**:
   ```javascript
   // Hearts when petting, sparkles when feeding
   function createParticles(type, x, y) {
     // Simple DOM-based particle system
   }
   ```

### Medium-term Improvements (1 week)
1. **Refactor into modules** using ES6 import/export
2. **Add comprehensive audio** with mood-based variations
3. **Implement touch controls** for mobile
4. **Create statistics dashboard** with Chart.js
5. **Add achievement system** with localStorage

### Long-term Vision (2+ weeks)
1. **Framework Migration**: Consider React + Zustand for state management
2. **Canvas Rendering**: Replace DOM with Canvas/WebGL for performance
3. **Advanced AI**: Machine learning for cat personalities
4. **Multiplayer**: WebRTC for cooperative care
5. **3D Graphics**: Three.js for immersive environment

### New Feature Ideas
1. **Day/Night Cycle**: Visual changes, different behaviors
2. **Weather System**: Affects mood, cats seek shelter
3. **Veterinary Care**: Health emergencies, medicine schedules
4. **Room Decoration**: Customize with furniture and toys
5. **Cat Relationships**: Cats form friendships over time
6. **Photography Mode**: Take pictures of cute moments
7. **Seasonal Events**: Holidays affect gameplay
8. **Cat Adoption**: New cats arrive, emotional storylines

### Implementation Priority
1. **High Priority**: Audio system, mobile support, code modularization
2. **Medium Priority**: Animations, statistics, achievements
3. **Low Priority**: Advanced graphics, multiplayer, AR features

Remember: The game is about empathy and care. Every cat deserves love, even the difficult ones! 🐱💕