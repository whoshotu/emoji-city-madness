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
        <div className={`ui-layer ${highContrast ? 'hc-mode' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100%', pointerEvents: 'none' }}>

            {/* Top Bar */}
            <div style={{ pointerEvents: 'auto', display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
                <button onClick={() => setShowSettings(!showSettings)} style={{ fontSize: '1.5rem', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '50px', height: '50px', cursor: 'cursor' }}>⚙️</button>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div style={{ pointerEvents: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: highContrast ? '#000' : '#fff', color: highContrast ? '#fff' : '#000', padding: '20px', borderRadius: '10px', boxShadow: '0 0 20px rgba(0,0,0,0.5)', minWidth: '300px' }}>
                    <h2>Settings</h2>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Master Volume: {volume}%</label>
                        <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} style={{ width: '100%' }} />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" checked={highContrast} onChange={toggleContrast} />
                            High Contrast Mode
                        </label>
                    </div>

                    <button onClick={() => setShowSettings(false)} style={{ padding: '10px 20px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Close</button>
                </div>
            )}

            {/* Bottom Bar (Emoji) */}
            <div style={{ pointerEvents: 'auto', marginTop: 'auto', padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {EMOJIS.map(e => (
                        <button
                            key={e}
                            onClick={() => sendEmoji(e)}
                            style={{ fontSize: '2rem', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '50%', minWidth: '60px', minHeight: '60px', cursor: 'pointer', transition: 'transform 0.1s' }}
                            className="emoji-btn"
                        >
                            {e}
                        </button>
                    ))}
                </div>
                <div style={{ color: '#fff', textAlign: 'center', marginTop: '5px', fontSize: '0.8rem', textShadow: '0 1px 2px #000' }}>
                    Arrows/ASWD to move • Tap emojis to chat
                </div>
            </div>
        </div>
    );
};

export default UIOverlay;
