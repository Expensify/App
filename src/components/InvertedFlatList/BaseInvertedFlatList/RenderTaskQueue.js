"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RENDER_DELAY = 500;
var RenderTaskQueue = /** @class */ (function () {
    function RenderTaskQueue() {
        this.renderInfos = [];
        this.isRendering = false;
        this.handler = function () { };
        this.timeout = null;
    }
    RenderTaskQueue.prototype.add = function (info) {
        this.renderInfos.push(info);
        if (!this.isRendering) {
            this.render();
        }
    };
    RenderTaskQueue.prototype.setHandler = function (handler) {
        this.handler = handler;
    };
    RenderTaskQueue.prototype.cancel = function () {
        if (this.timeout == null) {
            return;
        }
        clearTimeout(this.timeout);
    };
    RenderTaskQueue.prototype.render = function () {
        var _this = this;
        var info = this.renderInfos.shift();
        if (!info) {
            this.isRendering = false;
            return;
        }
        this.isRendering = true;
        this.handler(info);
        this.timeout = setTimeout(function () {
            _this.render();
        }, RENDER_DELAY);
    };
    return RenderTaskQueue;
}());
exports.default = RenderTaskQueue;
