"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const GameCanvas_1 = __importDefault(require("./components/GameCanvas"));
const UIOverlay_1 = __importDefault(require("./components/UIOverlay"));
const App = () => {
    const [inGame, setInGame] = (0, react_1.useState)(false);
    return ((0, jsx_runtime_1.jsx)("div", { className: "app-container", children: !inGame ? ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center', marginTop: '20vh' }, children: [(0, jsx_runtime_1.jsx)("h1", { children: "Emoji City MMO" }), (0, jsx_runtime_1.jsx)("button", { style: { fontSize: '2rem', padding: '1rem 2rem', cursor: 'cursor' }, onClick: () => setInGame(true), children: "Enter City \uD83C\uDFD9\uFE0F" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(GameCanvas_1.default, {}), (0, jsx_runtime_1.jsx)(UIOverlay_1.default, {})] })) }));
};
exports.default = App;
