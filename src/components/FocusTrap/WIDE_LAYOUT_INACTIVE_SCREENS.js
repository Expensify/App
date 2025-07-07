"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SCREENS_1 = require("@src/SCREENS");
/**
 * Screens displayed in the NavigationTab and CentralPane displayed side by side that should not have active
 * focus trap when rendered on a wide screen to allow navigation between them using the keyboard
 */
var WIDE_LAYOUT_INACTIVE_SCREENS = [
    SCREENS_1.default.HOME,
    SCREENS_1.default.SETTINGS.ROOT,
    SCREENS_1.default.REPORT,
    SCREENS_1.default.SETTINGS.PROFILE.ROOT,
    SCREENS_1.default.SETTINGS.PREFERENCES.ROOT,
    SCREENS_1.default.SETTINGS.SECURITY,
    SCREENS_1.default.SETTINGS.WALLET.ROOT,
    SCREENS_1.default.SETTINGS.ABOUT,
    SCREENS_1.default.WORKSPACES_LIST,
    SCREENS_1.default.SETTINGS.SUBSCRIPTION.ROOT,
    SCREENS_1.default.WORKSPACE.ACCOUNTING.ROOT,
    SCREENS_1.default.WORKSPACE.INITIAL,
    SCREENS_1.default.WORKSPACE.PROFILE,
    SCREENS_1.default.WORKSPACE.WORKFLOWS,
    SCREENS_1.default.WORKSPACE.INVOICES,
    SCREENS_1.default.WORKSPACE.MEMBERS,
    SCREENS_1.default.WORKSPACE.CATEGORIES,
    SCREENS_1.default.WORKSPACE.MORE_FEATURES,
    SCREENS_1.default.WORKSPACE.TAGS,
    SCREENS_1.default.WORKSPACE.TAXES,
    SCREENS_1.default.WORKSPACE.REPORT_FIELDS,
    SCREENS_1.default.WORKSPACE.EXPENSIFY_CARD,
    SCREENS_1.default.WORKSPACE.COMPANY_CARDS,
    SCREENS_1.default.WORKSPACE.DISTANCE_RATES,
    SCREENS_1.default.SEARCH.ROOT,
    SCREENS_1.default.SETTINGS.TROUBLESHOOT,
    SCREENS_1.default.SETTINGS.SAVE_THE_WORLD,
    SCREENS_1.default.WORKSPACE.RULES,
    SCREENS_1.default.WORKSPACE.PER_DIEM,
];
exports.default = WIDE_LAYOUT_INACTIVE_SCREENS;
