"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const socket_1 = require("../socket");
const EMOJIS = ['😀', '😂', '😎', '😭', '😡', '👍', '👎', '❤️', '🏃', '🤝', '❓', '🛑'];
const UIOverlay = () => {
    const sendEmoji = (emoji) => {
        socket_1.socket.emit('chat', emoji);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "ui-layer", style: { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { pointerEvents: 'auto', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '20px', display: 'flex', gap: '10px', overflowX: 'auto', maxWidth: '100%' }, children: EMOJIS.map(e => ((0, jsx_runtime_1.jsx)("button", { onClick: () => sendEmoji(e), style: { fontSize: '2rem', background: 'transparent', border: 'none', cursor: 'pointer' }, children: e }, e))) }), (0, jsx_runtime_1.jsx)("div", { style: { color: '#fff', textAlign: 'center', marginTop: '10px', textShadow: '0 0 5px #000' }, children: "Arrows to move / Tap onscreen buttons/emojis" })] }));
};
exports.default = UIOverlay;
