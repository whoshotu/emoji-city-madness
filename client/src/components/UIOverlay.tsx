import React from 'react';
import { socket } from '../socket';

const EMOJIS = ['😀', '😂', '😎', '😭', '😡', '👍', '👎', '❤️', '🏃', '🤝', '❓', '🛑'];

const UIOverlay: React.FC = () => {
    const [showSettings, setShowSettings] = React.useState(false);
    const [highContrast, setHighContrast] = React.useState(false);
    const [volume, setVolume] = React.useState(50);

    const sendEmoji = (emoji: string) => {
        socket.emit('chat', emoji);
    };

    const toggleContrast = () => {
        const next = !highContrast;
        setHighContrast(next);
        document.body.classList.toggle('high-contrast', next);
    };

    return (
        <div className={`ui-layer ui-layer-container ${highContrast ? 'hc-mode' : ''}`}>

            {/* Top Bar */}
            <div className="ui-top-bar">
                <button onClick={() => setShowSettings(!showSettings)} className="settings-btn">⚙️</button>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className={`settings-modal ${highContrast ? 'hc-modal' : ''}`}>
                    <h2>Settings</h2>

                    <div className="settings-group">
                        <label htmlFor="volume-slider">Master Volume: {volume}%</label>
                        <input
                            type="range"
                            id="volume-slider"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="volume-slider"
                            aria-label="Master Volume"
                        />
                    </div>

                    <div className="settings-group">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={highContrast} onChange={toggleContrast} />
                            High Contrast Mode
                        </label>
                    </div>

                    <button onClick={() => setShowSettings(false)} className="close-btn">Close</button>
                </div>
            )}

            {/* Bottom Bar (Emoji) */}
            <div className="ui-bottom-bar">
                <div className="emoji-container">
                    {EMOJIS.map(e => (
                        <button
                            key={e}
                            onClick={() => sendEmoji(e)}
                            className="emoji-btn"
                        >
                            {e}
                        </button>
                    ))}
                </div>
                <div className="controls-hint">
                    Arrows/ASWD to move • Tap emojis to chat
                </div>
            </div>
        </div>
    );
};

export default UIOverlay;
