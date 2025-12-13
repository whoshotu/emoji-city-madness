# Emoji City MMO – Full Game Spec

You are an expert AAA game developer, full-stack engineer, UX/UI designer, accessibility specialist, and DevOps engineer.

Your task is to design, implement, test, and deploy a production-ready multiplayer browser game as specified below.

You must:

Plan internally using your own artifacts, but do not output long explanations.

Automatically:

Initialize the project.

Install dependencies.

Set up the repository structure.

Initialize git and connect to a new GitHub repo.

Configure build and deploy pipelines.

Ask the user questions only when:

You need API keys, secrets, or provider logins.

You encounter a blocking error you cannot resolve autonomously.

When finished, respond only with:

The public production URL of the game.

The GitHub repository URL.

The user will give you a very short chat command such as:
“Read docs/game-spec.md and implement everything in this file. Do all planning, coding, testing, and deployment yourself. Only reply at the end with live URL and repo URL.”

All specifications below are mandatory.

Game concept
Create a multiplayer online game called Emoji City MMO (you may adjust the subtitle/tagline, but keep the core name) that blends:

“Brain-rot” chaotic humor and short, high-dopamine loops.

Roblox-style shared worlds, avatars, and social expression.

GTA-style open-world layout, missions, and vehicles, but cartoonish, non-graphic, and age-friendly.

Constraints:

Allow only mild cartoon violence:

Slapstick hits, knockbacks, silly crashes, comic explosions.

No blood, gore, realistic injuries, or graphic content.

No text chat and no voice chat:

All communication is emoji-based only.

Platforms and performance
Targets:

Mobile web (touch-first, responsive).

Desktop web (keyboard + mouse).

Architecture:

Web-first, but structured so it can be wrapped into a native-like app later (e.g., Capacitor/React Native or equivalent).

Performance:

Aim for smooth gameplay on mid-range mobile devices.

Reasonable bandwidth usage for multiplayer networking.

Fast initial load and responsive UI.

Graceful degradation on slow or unstable networks, with clear “connection lost/reconnecting” states.

Core gameplay features

1. Shared multiplayer world
Create a shared city-like world with multiple zones, for example:

City Center (plaza, main hub).

Park (green area, casual activities).

Beach (water, chill area, light mini-games).

Arcade or Fun Zone (access to mini-games).

Requirements:

Realtime multiplayer so players can:

Move around and see other players.

Interact through emoji.

Join shared activities or mini-games.

Backend suitable for production:

Example: Node.js + WebSockets or a managed realtime backend with presence and rooms.

Handle basic world state:

Player positions.

Zone/room membership.

Session joins/leaves.

1. Emoji-only interaction
Communication constraints:

No custom text input.

No voice chat.

All player communication is via emojis and predefined emoji sequences.

Emoji system:

Emoji bubbles appearing above avatars.

Emoji-based emote animations (e.g., dancing, crying, celebrating).

Predefined emoji “phrases” or macros representing common intents:

“Follow me”

“Let’s play”

“Nice!”

“Trade?”

“Help”
All expressed with emojis only.

UI:

Mobile-friendly emoji selection:

Radial menu or bottom dock of emojis.

Quick-access favorites or recent emojis.

Simple cooldowns or rate limiting to avoid spam.

1. Avatars, pets, and cosmetics
Avatar system:

Each player has a stylized avatar.

Customizable elements:

Base body/character style(s).

Outfits and costumes (casual, meme, themed).

Accessories (hats, glasses, masks, backpacks, etc.).

Pets:

Pets that follow the player in the world.

Pet gear:

Collars, hats, capes, backpacks, etc.

Store and inventory:

Virtual currency only (e.g., “Coins”), earned through gameplay.

No real-money payments; structure the system so real-payments could be added later, but do not implement them now.

Store categories:

Outfits

Costumes

Accessories

Pets

Pet Gear

Features:

Browsable store with item cards, previews, and filters.

Item preview on the avatar before purchase.

Purchasing with virtual currency.

Inventory interface where players equip/unequip items.

Clear distinction between available catalog items and owned items.

Data model:

Users.

Avatars and equipped items.

Pets and pet gear.

Store catalog.

Transactions and balances for virtual currency.

1. Mini-games and core loop
Core loop:

Enter world → play quick activities → earn coins and cosmetics → customize avatar/pets → repeat.

Mini-games:

Implement at least three mini-games or activities.

Each should be short (about 1–3 minutes).

Example concepts:

Emoji Race:

Run through an obstacle course.

Emoji-based boosts or actions.

Emoji Tag:

One or more players are “it” and tag others using an emoji action.

Emoji Reaction Game:

Players quickly choose correct emojis in response to on-screen prompts.

Rewards:

Award coins for participation and performance.

Chance of item drops (cosmetics, pet gear).

Scaling rewards to encourage repeated play.

Progression:

Player profile with:

Username (non-chat, just an identifier).

Level or clout/reputation meter.

Badges/achievements for milestones.

Quests:

Daily and/or weekly quests, for example:

“Play 3 mini-games.”

“Win 1 race.”

“Equip a new outfit.”

Reward coins and possibly special cosmetics.

Standard industry features
Implement common modern game/service features expected from a live product.

Analytics and events (stubbed)
Create an internal analytics/event logging interface.

Log key events, such as:

Session start/end.

Mini-game start/finish.

Store opens.

Purchases.

Do not integrate any real third-party service by default:

Implement a provider-agnostic interface so real analytics can be plugged in later.

Error handling and observability
Backend:

Structured logging of errors.

Clear error messages for debugging.

Frontend:

User-friendly error states:

Connection lost / reconnecting.

Server unavailable.

Action failed (with retry options where appropriate).

Settings menu
Provide a standard settings menu with:

Audio:

Master volume.

Music and sound effects volume.

Mute toggles.

Graphics:

At least low / medium / high presets affecting:

Visual effects.

Particles.

Optional extra details.

Controls:

Sensitivity controls for movement.

Mobile vs desktop input mappings.

Optional invert axis if relevant.

Security and integrity
Validate all important actions server-side:

Currency changes.

Inventory changes.

Matchmaking and mini-game participation.

Do not trust client inputs for authoritative game state.

Basic protection against obvious abuse (e.g., rate limiting important endpoints).

Accounts and sessions
Support guest mode with simple username selection.

Architecture should be ready to add OAuth/social login later, but not implemented now.

Persist user data and progression across sessions.

Accessibility requirements
Implement standard web and game accessibility practices where feasible.

Visual:

Provide at least one high-contrast UI theme or toggle.

Use colorblind-friendly palettes or add a toggle to adjust problematic color combinations.

Do not use color alone for critical information:

Add icons, shapes, or patterns.

Audio:

All important information also appears visually (icons, animations, UI states).

Full control over:

Music volume.

SFX volume.

Mute options.

Input and navigation:

Ensure all major UI flows are navigable via keyboard where practical:

Menu navigation.

Confirm/cancel actions.

Settings and store screens.

Large tap/click targets for primary actions and emoji menus on mobile.

Configurable movement/control sensitivity.

UI semantics:

Use appropriate semantic HTML elements where possible.

Label interactive elements for assistive technologies where feasible.

Visible focus indicators for interactive elements.

Comfort settings:

Provide a reduced motion option:

Limit camera shake.

Reduce or simplify intense animations.

Avoid rapid flashing or strobing visuals that could trigger discomfort or health issues.

Accessibility & Settings menu:

Provide a dedicated menu or section where players can:

Adjust accessibility options.

Adjust audio, graphics, and control options.

Persist settings per user where possible.

Tech stack and architecture
Use a mainstream, production-ready web stack.

Frontend:

Use a modern framework such as React or Next.js.

Component-based architecture.

Responsive layout for mobile and desktop.

Use a utility CSS framework or component library for consistent styling.

Backend:

Implement with Node.js.

Provide:

REST or GraphQL API for:

Auth/session management (guest).

Profiles and progression.

Store/catalog.

Inventory and currency.

Realtime layer (e.g., WebSockets) for:

World state sync.

Player presence.

Mini-game rooms and events.

Separate concerns:

Session/auth.

World/zone state.

Mini-games.

Inventory/store.

Analytics/event logging.

Data:

Define and implement schemas for:

Users and sessions.

Profiles and progression.

Avatars and equipped items.

Pets and pet gear.

Store catalog and transactions.

Inventory and currency balances.

Mini-game rooms, matches, and results.

DevOps:

Provide build scripts for production.

Environment-based configuration (development vs production).

Use environment variables for any secrets and endpoints.

Deployment
Deployment targets:

Use a free-tier friendly deployment environment such as:

Google Cloud Run.

Vercel.

Or a similar platform able to host both frontend and backend components.

Tasks:

Initialize git locally.

Create a new GitHub repository and push the project.

Configure build and deploy pipelines:

Frontend production build.

Backend deployment (container or equivalent).

Set necessary environment variables in the deployment environment.

Make sure the game is accessible via a single public URL.

Verification:

Confirm that:

The game loads and runs on mobile web and desktop web.

Multiplayer works with at least two clients interacting in the world.

Emoji communication works as described.

Store, inventory, and mini-games function end to end.

Settings and accessibility features work.

Final output contract
Once everything is implemented, tested, and deployed:

Respond to the user with only:

The live production URL of the game.

The GitHub repository URL.

Do not include explanations, code snippets, logs, or step-by-step descriptions in that final response.
