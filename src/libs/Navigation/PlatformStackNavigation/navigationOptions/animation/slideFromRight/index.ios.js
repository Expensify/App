"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("..");
// default transition is causing weird keyboard appearance: - https://github.com/Expensify/App/issues/37257
// so we are using `simple_push` which is similar to default and not causing keyboard transition issues
var transition = { animation: __1.InternalPlatformAnimations.SIMPLE_PUSH };
exports.default = transition;
