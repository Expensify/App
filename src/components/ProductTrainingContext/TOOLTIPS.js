"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var Welcome_1 = require("@libs/actions/Welcome");
var CONST_1 = require("@src/CONST");
var _b = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES, CONCIERGE_LHN_GBR = _b.CONCIERGE_LHN_GBR, RENAME_SAVED_SEARCH = _b.RENAME_SAVED_SEARCH, BOTTOM_NAV_INBOX_TOOLTIP = _b.BOTTOM_NAV_INBOX_TOOLTIP, LHN_WORKSPACE_CHAT_TOOLTIP = _b.LHN_WORKSPACE_CHAT_TOOLTIP, GLOBAL_CREATE_TOOLTIP = _b.GLOBAL_CREATE_TOOLTIP, SCAN_TEST_TOOLTIP = _b.SCAN_TEST_TOOLTIP, SCAN_TEST_TOOLTIP_MANAGER = _b.SCAN_TEST_TOOLTIP_MANAGER, SCAN_TEST_CONFIRMATION = _b.SCAN_TEST_CONFIRMATION, OUTSTANDING_FILTER = _b.OUTSTANDING_FILTER, GBR_RBR_CHAT = _b.GBR_RBR_CHAT, ACCOUNT_SWITCHER = _b.ACCOUNT_SWITCHER, EXPENSE_REPORTS_FILTER = _b.EXPENSE_REPORTS_FILTER, SCAN_TEST_DRIVE_CONFIRMATION = _b.SCAN_TEST_DRIVE_CONFIRMATION, MULTI_SCAN_EDUCATIONAL_MODAL = _b.MULTI_SCAN_EDUCATIONAL_MODAL;
var TOOLTIPS = (_a = {},
    _a[CONCIERGE_LHN_GBR] = {
        content: [
            { text: 'productTrainingTooltip.conciergeLHNGBR.part1', isBold: false },
            { text: 'productTrainingTooltip.conciergeLHNGBR.part2', isBold: true },
        ],
        onHideTooltip: function (isDismissedUsingCloseButton) {
            if (isDismissedUsingCloseButton === void 0) { isDismissedUsingCloseButton = false; }
            return (0, Welcome_1.dismissProductTraining)(CONCIERGE_LHN_GBR, isDismissedUsingCloseButton);
        },
        name: CONCIERGE_LHN_GBR,
        priority: 1300,
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        shouldShow: function () { return false; },
    },
    _a[RENAME_SAVED_SEARCH] = {
        content: [
            { text: 'productTrainingTooltip.saveSearchTooltip.part1', isBold: true },
            { text: 'productTrainingTooltip.saveSearchTooltip.part2', isBold: false },
        ],
        onHideTooltip: function (isDismissedUsingCloseButton) {
            if (isDismissedUsingCloseButton === void 0) { isDismissedUsingCloseButton = false; }
            return (0, Welcome_1.dismissProductTraining)(RENAME_SAVED_SEARCH, isDismissedUsingCloseButton);
        },
        name: RENAME_SAVED_SEARCH,
        priority: 1250,
        shouldShow: function (_a) {
            var shouldUseNarrowLayout = _a.shouldUseNarrowLayout;
            return !shouldUseNarrowLayout;
        },
    },
    _a[GLOBAL_CREATE_TOOLTIP] = {
        content: [
            { text: 'productTrainingTooltip.globalCreateTooltip.part1', isBold: true },
            { text: 'productTrainingTooltip.globalCreateTooltip.part2', isBold: false },
            { text: 'productTrainingTooltip.globalCreateTooltip.part3', isBold: false },
            { text: 'productTrainingTooltip.globalCreateTooltip.part4', isBold: false },
        ],
        onHideTooltip: function (isDismissedUsingCloseButton) {
            if (isDismissedUsingCloseButton === void 0) { isDismissedUsingCloseButton = false; }
            return (0, Welcome_1.dismissProductTraining)(GLOBAL_CREATE_TOOLTIP, isDismissedUsingCloseButton);
        },
        name: GLOBAL_CREATE_TOOLTIP,
        priority: 1950,
        shouldShow: function (_a) {
            var isUserPolicyEmployee = _a.isUserPolicyEmployee;
            return isUserPolicyEmployee;
        },
    },
    _a[BOTTOM_NAV_INBOX_TOOLTIP] = {
        content: [
            { text: 'productTrainingTooltip.bottomNavInboxTooltip.part1', isBold: false },
            { text: 'productTrainingTooltip.bottomNavInboxTooltip.part2', isBold: true },
            { text: 'productTrainingTooltip.bottomNavInboxTooltip.part3', isBold: false },
            { text: 'productTrainingTooltip.bottomNavInboxTooltip.part4', isBold: true },
        ],
        onHideTooltip: function (isDismissedUsingCloseButton) {
            if (isDismissedUsingCloseButton === void 0) { isDismissedUsingCloseButton = false; }
            return (0, Welcome_1.dismissProductTraining)(BOTTOM_NAV_INBOX_TOOLTIP, isDismissedUsingCloseButton);
        },
        name: BOTTOM_NAV_INBOX_TOOLTIP,
        priority: 1700,
        shouldShow: function (_a) {
            var hasBeenAddedToNudgeMigration = _a.hasBeenAddedToNudgeMigration;
            return hasBeenAddedToNudgeMigration;
        },
    },
    _a[LHN_WORKSPACE_CHAT_TOOLTIP] = {
        content: [
            { text: 'productTrainingTooltip.workspaceChatTooltip.part1', isBold: false },
            { text: 'productTrainingTooltip.workspaceChatTooltip.part2', isBold: true },
        ],
        onHideTooltip: function (isDismissedUsingCloseButton) {
            if (isDismissedUsingCloseButton === void 0) { isDismissedUsingCloseButton = false; }
            return (0, Welcome_1.dismissProductTraining)(LHN_WORKSPACE_CHAT_TOOLTIP, isDismissedUsingCloseButton);
        },
        name: LHN_WORKSPACE_CHAT_TOOLTIP,
        priority: 1800,
        shouldShow: function (_a) {
            var isUserPolicyEmployee = _a.isUserPolicyEmployee;
            return isUserPolicyEmployee;
        },
    },
    _a[GBR_RBR_CHAT] = {
        content: [
            { text: 'productTrainingTooltip.GBRRBRChat.part1', isBold: false },
            { text: 'productTrainingTooltip.GBRRBRChat.part2', isBold: true },
            { text: 'productTrainingTooltip.GBRRBRChat.part3', isBold: false },
            { text: 'productTrainingTooltip.GBRRBRChat.part4', isBold: true },
        ],
        onHideTooltip: function () { return (0, Welcome_1.dismissProductTraining)(GBR_RBR_CHAT); },
        name: GBR_RBR_CHAT,
        priority: 1900,
        shouldShow: function () { return true; },
    },
    _a[ACCOUNT_SWITCHER] = {
        content: [
            { text: 'productTrainingTooltip.accountSwitcher.part1', isBold: false },
            { text: 'productTrainingTooltip.accountSwitcher.part2', isBold: true },
            { text: 'productTrainingTooltip.accountSwitcher.part3', isBold: false },
        ],
        onHideTooltip: function () { return (0, Welcome_1.dismissProductTraining)(ACCOUNT_SWITCHER); },
        name: ACCOUNT_SWITCHER,
        priority: 1600,
        shouldShow: function () { return true; },
    },
    _a[EXPENSE_REPORTS_FILTER] = {
        content: [
            { text: 'productTrainingTooltip.expenseReportsFilter.part1', isBold: false },
            { text: 'productTrainingTooltip.expenseReportsFilter.part2', isBold: true },
            { text: 'productTrainingTooltip.expenseReportsFilter.part3', isBold: false },
        ],
        onHideTooltip: function () { return (0, Welcome_1.dismissProductTraining)(EXPENSE_REPORTS_FILTER); },
        name: EXPENSE_REPORTS_FILTER,
        priority: 2000,
        shouldShow: function (_a) {
            var shouldUseNarrowLayout = _a.shouldUseNarrowLayout, isUserPolicyAdmin = _a.isUserPolicyAdmin, hasBeenAddedToNudgeMigration = _a.hasBeenAddedToNudgeMigration;
            return !shouldUseNarrowLayout && isUserPolicyAdmin && hasBeenAddedToNudgeMigration;
        },
    },
    _a[SCAN_TEST_TOOLTIP] = {
        content: [
            { text: 'productTrainingTooltip.scanTestTooltip.part1', isBold: true },
            { text: 'productTrainingTooltip.scanTestTooltip.part2', isBold: false },
        ],
        onHideTooltip: function () { return (0, Welcome_1.dismissProductTraining)(SCAN_TEST_TOOLTIP); },
        name: SCAN_TEST_TOOLTIP,
        priority: 900,
        shouldShow: function (_a) {
            var isUserInPaidPolicy = _a.isUserInPaidPolicy, hasBeenAddedToNudgeMigration = _a.hasBeenAddedToNudgeMigration;
            return !isUserInPaidPolicy && !hasBeenAddedToNudgeMigration;
        },
        shouldRenderActionButtons: true,
    },
    _a[SCAN_TEST_TOOLTIP_MANAGER] = {
        content: [
            { text: 'productTrainingTooltip.scanTestTooltip.part3', isBold: false },
            { text: 'productTrainingTooltip.scanTestTooltip.part4', isBold: true },
            { text: 'productTrainingTooltip.scanTestTooltip.part5', isBold: false },
        ],
        onHideTooltip: function (isDismissedUsingCloseButton) {
            if (isDismissedUsingCloseButton === void 0) { isDismissedUsingCloseButton = false; }
            return (0, Welcome_1.dismissProductTraining)(SCAN_TEST_TOOLTIP_MANAGER, isDismissedUsingCloseButton);
        },
        name: SCAN_TEST_TOOLTIP_MANAGER,
        priority: 1000,
        shouldShow: function (_a) {
            var hasBeenAddedToNudgeMigration = _a.hasBeenAddedToNudgeMigration;
            return !hasBeenAddedToNudgeMigration;
        },
    },
    _a[SCAN_TEST_CONFIRMATION] = {
        content: [
            { text: 'productTrainingTooltip.scanTestTooltip.part6', isBold: false },
            { text: 'productTrainingTooltip.scanTestTooltip.part7', isBold: true },
            { text: 'productTrainingTooltip.scanTestTooltip.part8', isBold: false },
        ],
        onHideTooltip: function (isDismissedUsingCloseButton) {
            if (isDismissedUsingCloseButton === void 0) { isDismissedUsingCloseButton = false; }
            return (0, Welcome_1.dismissProductTraining)(SCAN_TEST_CONFIRMATION, isDismissedUsingCloseButton);
        },
        name: SCAN_TEST_CONFIRMATION,
        priority: 1100,
        shouldShow: function (_a) {
            var hasBeenAddedToNudgeMigration = _a.hasBeenAddedToNudgeMigration;
            return !hasBeenAddedToNudgeMigration;
        },
    },
    _a[OUTSTANDING_FILTER] = {
        content: [
            { text: 'productTrainingTooltip.outstandingFilter.part1', isBold: false },
            { text: 'productTrainingTooltip.outstandingFilter.part2', isBold: true },
        ],
        onHideTooltip: function () { return (0, Welcome_1.dismissProductTraining)(OUTSTANDING_FILTER); },
        name: OUTSTANDING_FILTER,
        priority: 1925,
        shouldShow: function (_a) {
            var isUserPolicyAdmin = _a.isUserPolicyAdmin;
            return isUserPolicyAdmin;
        },
    },
    _a[SCAN_TEST_DRIVE_CONFIRMATION] = {
        content: [
            { text: 'productTrainingTooltip.scanTestDriveTooltip.part1', isBold: false },
            { text: 'productTrainingTooltip.scanTestDriveTooltip.part2', isBold: true },
        ],
        onHideTooltip: function (isDismissedUsingCloseButton) {
            if (isDismissedUsingCloseButton === void 0) { isDismissedUsingCloseButton = false; }
            return (0, Welcome_1.dismissProductTraining)(SCAN_TEST_DRIVE_CONFIRMATION, isDismissedUsingCloseButton);
        },
        name: SCAN_TEST_DRIVE_CONFIRMATION,
        priority: 1200,
        shouldShow: function () { return true; },
    },
    _a);
exports.default = TOOLTIPS;
