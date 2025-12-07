"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const socket_1 = require("../socket");
const EMOJIS = ['😀', '😂', '😎', '😭', '😡', '👍', '👎', '❤️', '🏃', '🤝', '❓', '🛑'];
const UIOverlay = () => {
    const [showSettings, setShowSettings] = react_1.default.useState(false);
    const [highContrast, setHighContrast] = react_1.default.useState(false);
    const [volume, setVolume] = react_1.default.useState(50);
    const sendEmoji = (emoji) => {
        socket_1.socket.emit('chat', emoji);
    };
    const toggleContrast = () => {
        const next = !highContrast;
        setHighContrast(next);
        document.body.classList.toggle('high-contrast', next);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: `ui-layer ${highContrast ? 'hc-mode' : ''}`, style: { display: 'flex', flexDirection: 'column', height: '100%', pointerEvents: 'none' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { pointerEvents: 'auto', display: 'flex', justifyContent: 'flex-end', padding: '10px' }, children: (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowSettings(!showSettings), style: { fontSize: '1.5rem', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '50px', height: '50px', cursor: 'cursor' }, children: "\u2699\uFE0F" }) }), showSettings && ((0, jsx_runtime_1.jsxs)("div", { style: { pointerEvents: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: highContrast ? '#000' : '#fff', color: highContrast ? '#fff' : '#000', padding: '20px', borderRadius: '10px', boxShadow: '0 0 20px rgba(0,0,0,0.5)', minWidth: '300px' }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "Settings" }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '15px' }, children: [(0, jsx_runtime_1.jsxs)("label", { children: ["Master Volume: ", volume, "%"] }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: "0", max: "100", value: volume, onChange: (e) => setVolume(Number(e.target.value)), style: { width: '100%' } })] }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '15px' }, children: (0, jsx_runtime_1.jsxs)("label", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: highContrast, onChange: toggleContrast }), "High Contrast Mode"] }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowSettings(false), style: { padding: '10px 20px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }, children: "Close" })] })), (0, jsx_runtime_1.jsxs)("div", { style: { pointerEvents: 'auto', marginTop: 'auto', padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }, children: EMOJIS.map(e => ((0, jsx_runtime_1.jsx)("button", { onClick: () => sendEmoji(e), style: { fontSize: '2rem', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '50%', minWidth: '60px', minHeight: '60px', cursor: 'pointer', transition: 'transform 0.1s' }, className: "emoji-btn", children: e }, e))) }), (0, jsx_runtime_1.jsx)("div", { style: { color: '#fff', textAlign: 'center', marginTop: '5px', fontSize: '0.8rem', textShadow: '0 1px 2px #000' }, children: "Arrows/ASWD to move \u2022 Tap emojis to chat" })] })] }));
};
exports.default = UIOverlay;
