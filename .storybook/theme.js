"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var create_1 = require("@storybook/theming/create");
// eslint-disable-next-line @dword-design/import-alias/prefer-alias
var colors_1 = require("../src/styles/theme/colors");
var theme = (0, create_1.create)({
    brandTitle: 'New Expensify UI Docs',
    brandImage: 'logomark.svg',
    fontBase: 'Expensify Neue',
    fontCode: 'monospace',
    base: 'dark',
    appBg: colors_1.default.productDark200,
    colorPrimary: colors_1.default.productDark400,
    colorSecondary: colors_1.default.green,
    appContentBg: colors_1.default.productDark100,
    appPreviewBg: colors_1.default.productDark100,
    textColor: colors_1.default.productDark900,
    barTextColor: colors_1.default.productDark900,
    barSelectedColor: colors_1.default.green,
    barBg: colors_1.default.productDark100,
    appBorderColor: colors_1.default.productDark400,
    inputBg: colors_1.default.productDark200,
    inputBorder: colors_1.default.productDark400,
    appBorderRadius: 8,
    inputBorderRadius: 8,
});
exports.default = theme;
