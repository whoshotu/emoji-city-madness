import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';

const App: React.FC = () => {
    const [inGame, setInGame] = useState(false);

    return (
        <div className="app-container">
            {!inGame ? (
                <div style={{ textAlign: 'center', marginTop: '20vh' }}>
                    <h1>Emoji City MMO</h1>
                    <button
                        style={{ fontSize: '2rem', padding: '1rem 2rem', cursor: 'cursor' }}
                        onClick={() => setInGame(true)}
                    >
                        Enter City 🏙️
                    </button>
                </div>
            ) : (
                <>
                    <GameCanvas />
                    <UIOverlay />
                </>
            )}
        </div>
    );
};

export default App;
