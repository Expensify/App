"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("..");
// `slide_from_right` is resolved to `default` transition on iOS, but this transition causes issues on iOS
var slideFromLeft = { animation: __1.InternalPlatformAnimations.IOS_FROM_LEFT };
exports.default = slideFromLeft;
