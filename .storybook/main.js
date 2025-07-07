"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var main = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', '@storybook/addon-webpack5-compiler-babel'],
    staticDirs: ['./public', { from: '../assets/css', to: 'css' }, { from: '../assets/fonts/web', to: 'fonts' }],
    core: {},
    managerHead: function (head) { return "\n        ".concat(head, "\n        ").concat(process.env.ENV === 'staging' ? '<meta name="robots" content="noindex">' : '', "\n    "); },
    framework: {
        name: '@storybook/react-webpack5',
        options: {},
    },
    docs: {},
};
exports.default = main;
