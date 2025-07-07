"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("..");
// default transition is causing weird keyboard appearance: - https://github.com/Expensify/App/issues/37257
// so we are using `slide_from_left` which is similar to default and not causing keyboard transition issues
var slideFromLeft = { animation: __1.InternalPlatformAnimations.SLIDE_FROM_LEFT };
exports.default = slideFromLeft;
