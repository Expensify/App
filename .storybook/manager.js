"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var manager_api_1 = require("@storybook/manager-api");
var theme_1 = require("./theme");
manager_api_1.addons.setConfig({
    theme: theme_1.default,
});
