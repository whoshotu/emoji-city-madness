import { useEffect, useRef } from 'react';
import { createGame } from './game/config';
import './index.css';

function App() {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!gameRef.current) {
            gameRef.current = createGame();
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <div className="App">
            <div id="game-container" />
        </div>
    );
}

export default App;
