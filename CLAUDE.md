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

Remember: The game is about empathy and care. Every cat deserves love, even the difficult ones! 🐱💕