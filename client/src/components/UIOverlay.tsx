import React from 'react';
import { socket } from '../socket';

const EMOJIS = ['😀', '😂', '😎', '😭', '😡', '👍', '👎', '❤️', '🏃', '🤝', '❓', '🛑'];

const UIOverlay: React.FC = () => {
    const sendEmoji = (emoji: string) => {
        socket.emit('chat', emoji);
    };

    return (
        <div className="ui-layer" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px' }}>
            <div style={{ pointerEvents: 'auto', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '20px', display: 'flex', gap: '10px', overflowX: 'auto', maxWidth: '100%' }}>
                {EMOJIS.map(e => (
                    <button
                        key={e}
                        onClick={() => sendEmoji(e)}
                        style={{ fontSize: '2rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                        {e}
                    </button>
                ))}
            </div>
            <div style={{ color: '#fff', textAlign: 'center', marginTop: '10px', textShadow: '0 0 5px #000' }}>
                Arrows to move / Tap onscreen buttons/emojis
            </div>
        </div>
    );
};

export default UIOverlay;
