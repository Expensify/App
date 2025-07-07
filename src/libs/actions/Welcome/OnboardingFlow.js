"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnboardingMessages = void 0;
exports.getOnboardingInitialPath = getOnboardingInitialPath;
exports.startOnboardingFlow = startOnboardingFlow;
exports.clearInitialPath = clearInitialPath;
var native_1 = require("@react-navigation/native");
var react_native_onyx_1 = require("react-native-onyx");
var Localize_1 = require("@libs/Localize");
var getAdaptedStateFromPath_1 = require("@libs/Navigation/helpers/getAdaptedStateFromPath");
var linkingConfig_1 = require("@libs/Navigation/linkingConfig");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var onboardingInitialPath = '';
var onboardingLastVisitedPathConnection = react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.ONBOARDING_LAST_VISITED_PATH,
    callback: function (value) {
        if (value === undefined) {
            return;
        }
        onboardingInitialPath = value;
        react_native_onyx_1.default.disconnect(onboardingLastVisitedPathConnection);
    },
});
var onboardingValues;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_ONBOARDING,
    callback: function (value) {
        if (value === undefined) {
            return;
        }
        onboardingValues = value;
    },
});
/**
 * Start a new onboarding flow or continue from the last visited onboarding page.
 */
function startOnboardingFlow(startOnboardingFlowParams) {
    var currentRoute = Navigation_1.navigationRef.getCurrentRoute();
    var adaptedState = (0, getAdaptedStateFromPath_1.default)(getOnboardingInitialPath(startOnboardingFlowParams), linkingConfig_1.linkingConfig.config, false);
    var focusedRoute = (0, native_1.findFocusedRoute)(adaptedState);
    if ((focusedRoute === null || focusedRoute === void 0 ? void 0 : focusedRoute.name) === (currentRoute === null || currentRoute === void 0 ? void 0 : currentRoute.name)) {
        return;
    }
    Navigation_1.navigationRef.resetRoot(__assign(__assign(__assign({}, Navigation_1.navigationRef.getRootState()), adaptedState), { stale: true }));
}
function getOnboardingInitialPath(getOnboardingInitialPathParams) {
    var _a, _b;
    var isUserFromPublicDomain = getOnboardingInitialPathParams.isUserFromPublicDomain, hasAccessiblePolicies = getOnboardingInitialPathParams.hasAccessiblePolicies, onboardingValuesParam = getOnboardingInitialPathParams.onboardingValuesParam;
    var state = (0, native_1.getStateFromPath)(onboardingInitialPath, linkingConfig_1.linkingConfig.config);
    var currentOnboardingValues = onboardingValuesParam !== null && onboardingValuesParam !== void 0 ? onboardingValuesParam : onboardingValues;
    var isVsb = (currentOnboardingValues === null || currentOnboardingValues === void 0 ? void 0 : currentOnboardingValues.signupQualifier) === CONST_1.default.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    var isSmb = (currentOnboardingValues === null || currentOnboardingValues === void 0 ? void 0 : currentOnboardingValues.signupQualifier) === CONST_1.default.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
    var isIndividual = (currentOnboardingValues === null || currentOnboardingValues === void 0 ? void 0 : currentOnboardingValues.signupQualifier) === CONST_1.default.ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL;
    if (isVsb) {
        react_native_onyx_1.default.set(ONYXKEYS_1.default.ONBOARDING_PURPOSE_SELECTED, CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM);
        react_native_onyx_1.default.set(ONYXKEYS_1.default.ONBOARDING_COMPANY_SIZE, CONST_1.default.ONBOARDING_COMPANY_SIZE.MICRO);
    }
    if (isSmb) {
        react_native_onyx_1.default.set(ONYXKEYS_1.default.ONBOARDING_PURPOSE_SELECTED, CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM);
    }
    if (isIndividual) {
        react_native_onyx_1.default.set(ONYXKEYS_1.default.ONBOARDING_CUSTOM_CHOICES, [CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND, CONST_1.default.ONBOARDING_CHOICES.EMPLOYER, CONST_1.default.ONBOARDING_CHOICES.CHAT_SPLIT]);
    }
    if (isUserFromPublicDomain && !(onboardingValuesParam === null || onboardingValuesParam === void 0 ? void 0 : onboardingValuesParam.isMergeAccountStepCompleted)) {
        return "/".concat(ROUTES_1.default.ONBOARDING_WORK_EMAIL.route);
    }
    if (!isUserFromPublicDomain && hasAccessiblePolicies) {
        return "/".concat(ROUTES_1.default.ONBOARDING_PERSONAL_DETAILS.route);
    }
    if (isVsb) {
        return "/".concat(ROUTES_1.default.ONBOARDING_ACCOUNTING.route);
    }
    if (isSmb) {
        return "/".concat(ROUTES_1.default.ONBOARDING_EMPLOYEES.route);
    }
    if (((_b = (_a = state === null || state === void 0 ? void 0 : state.routes) === null || _a === void 0 ? void 0 : _a.at(-1)) === null || _b === void 0 ? void 0 : _b.name) !== NAVIGATORS_1.default.ONBOARDING_MODAL_NAVIGATOR) {
        return "/".concat(ROUTES_1.default.ONBOARDING_ROOT.route);
    }
    return onboardingInitialPath;
}
var getOnboardingMessages = function (locale) {
    var _a, _b, _c, _d, _e, _f;
    var resolvedLocale = locale !== null && locale !== void 0 ? locale : IntlStore_1.default.getCurrentLocale();
    var testDrive = {
        ONBOARDING_TASK_NAME: (0, Localize_1.translate)(resolvedLocale, 'onboarding.testDrive.name', {}),
        EMBEDDED_DEMO_WHITELIST: ['http://', 'https://', 'about:'],
        EMBEDDED_DEMO_IFRAME_TITLE: (0, Localize_1.translate)(resolvedLocale, 'onboarding.testDrive.embeddedDemoIframeTitle'),
        EMPLOYEE_FAKE_RECEIPT: {
            AMOUNT: 2000,
            CURRENCY: 'USD',
            DESCRIPTION: (0, Localize_1.translate)(resolvedLocale, 'onboarding.testDrive.employeeFakeReceipt.description'),
            MERCHANT: "Tommy's Tires",
        },
    };
    var createReportTask = {
        type: 'createReport',
        autoCompleted: false,
        mediaAttributes: {},
        title: (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.createReportTask.title'),
        description: (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.createReportTask.description'),
    };
    var testDriveAdminTask = {
        type: 'viewTour',
        autoCompleted: false,
        mediaAttributes: {},
        title: function (_a) {
            var testDriveURL = _a.testDriveURL;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.testDriveAdminTask.title', { testDriveURL: testDriveURL });
        },
        description: function (_a) {
            var testDriveURL = _a.testDriveURL;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.testDriveAdminTask.description', { testDriveURL: testDriveURL });
        },
    };
    var testDriveEmployeeTask = {
        type: 'viewTour',
        autoCompleted: false,
        mediaAttributes: {},
        title: function (_a) {
            var testDriveURL = _a.testDriveURL;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.testDriveEmployeeTask.title', { testDriveURL: testDriveURL });
        },
        description: function (_a) {
            var testDriveURL = _a.testDriveURL;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.testDriveEmployeeTask.description', { testDriveURL: testDriveURL });
        },
    };
    var createTestDriveAdminWorkspaceTask = {
        type: 'createWorkspace',
        autoCompleted: false,
        mediaAttributes: {},
        title: function (_a) {
            var workspaceConfirmationLink = _a.workspaceConfirmationLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.createTestDriveAdminWorkspaceTask.title', { workspaceConfirmationLink: workspaceConfirmationLink });
        },
        description: (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.createTestDriveAdminWorkspaceTask.description'),
    };
    var createWorkspaceTask = {
        type: 'createWorkspace',
        autoCompleted: true,
        mediaAttributes: {},
        title: function (_a) {
            var workspaceSettingsLink = _a.workspaceSettingsLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.createWorkspaceTask.title', { workspaceSettingsLink: workspaceSettingsLink });
        },
        description: function (_a) {
            var workspaceSettingsLink = _a.workspaceSettingsLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.createWorkspaceTask.description', { workspaceSettingsLink: workspaceSettingsLink });
        },
    };
    var setupCategoriesTask = {
        type: 'setupCategories',
        autoCompleted: false,
        mediaAttributes: (_a = {},
            _a["".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-categories-v2.mp4")] = "data-expensify-thumbnail-url=\"".concat(CONST_1.default.CLOUDFRONT_URL, "/images/walkthrough-categories.png\" data-expensify-width=\"1920\" data-expensify-height=\"1080\""),
            _a),
        title: function (_a) {
            var workspaceCategoriesLink = _a.workspaceCategoriesLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.setupCategoriesTask.title', { workspaceCategoriesLink: workspaceCategoriesLink });
        },
        description: function (_a) {
            var workspaceCategoriesLink = _a.workspaceCategoriesLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.setupCategoriesTask.description', { workspaceCategoriesLink: workspaceCategoriesLink });
        },
    };
    var combinedTrackSubmitExpenseTask = {
        type: 'submitExpense',
        autoCompleted: false,
        mediaAttributes: {},
        title: (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.combinedTrackSubmitExpenseTask.title'),
        description: (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.combinedTrackSubmitExpenseTask.description'),
    };
    var adminSubmitExpenseTask = {
        type: 'submitExpense',
        autoCompleted: false,
        mediaAttributes: {},
        title: (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.adminSubmitExpenseTask.title'),
        description: (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.adminSubmitExpenseTask.description'),
    };
    var trackExpenseTask = {
        type: 'trackExpense',
        autoCompleted: false,
        mediaAttributes: {},
        title: (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.trackExpenseTask.title'),
        description: (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.trackExpenseTask.description'),
    };
    var addAccountingIntegrationTask = {
        type: 'addAccountingIntegration',
        autoCompleted: false,
        mediaAttributes: (_b = {},
            _b["".concat(CONST_1.default.CLOUDFRONT_URL, "/").concat(CONST_1.default.connectionsVideoPaths[CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.netsuite])] = "data-expensify-thumbnail-url=\"".concat(CONST_1.default.CLOUDFRONT_URL, "/images/walkthrough-connect_to_netsuite.png\" data-expensify-width=\"1920\" data-expensify-height=\"1080\""),
            _b["".concat(CONST_1.default.CLOUDFRONT_URL, "/").concat(CONST_1.default.connectionsVideoPaths[CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.quickbooksOnline])] = "data-expensify-thumbnail-url=\"".concat(CONST_1.default.CLOUDFRONT_URL, "/images/walkthrough-connect_to_qbo.png\" data-expensify-width=\"1920\" data-expensify-height=\"1080\""),
            _b["".concat(CONST_1.default.CLOUDFRONT_URL, "/").concat(CONST_1.default.connectionsVideoPaths[CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.xero])] = "data-expensify-thumbnail-url=\"".concat(CONST_1.default.CLOUDFRONT_URL, "/images/walkthrough-connect_to_xero.png\" data-expensify-width=\"1920\" data-expensify-height=\"1080\""),
            _b),
        title: function (_a) {
            var integrationName = _a.integrationName, workspaceAccountingLink = _a.workspaceAccountingLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.addAccountingIntegrationTask.title', { integrationName: integrationName, workspaceAccountingLink: workspaceAccountingLink });
        },
        description: function (_a) {
            var integrationName = _a.integrationName, workspaceAccountingLink = _a.workspaceAccountingLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.addAccountingIntegrationTask.description', { integrationName: integrationName, workspaceAccountingLink: workspaceAccountingLink });
        },
    };
    var connectCorporateCardTask = {
        type: 'connectCorporateCard',
        title: function (_a) {
            var corporateCardLink = _a.corporateCardLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.connectCorporateCardTask.title', { corporateCardLink: corporateCardLink });
        },
        description: function (_a) {
            var corporateCardLink = _a.corporateCardLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.connectCorporateCardTask.description', { corporateCardLink: corporateCardLink });
        },
        autoCompleted: false,
        mediaAttributes: {},
    };
    var inviteTeamTask = {
        type: 'inviteTeam',
        autoCompleted: false,
        mediaAttributes: (_c = {},
            _c["".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-invite_members-v2.mp4")] = "data-expensify-thumbnail-url=\"".concat(CONST_1.default.CLOUDFRONT_URL, "/images/walkthrough-invite_members.png\" data-expensify-width=\"1920\" data-expensify-height=\"1080\""),
            _c),
        title: function (_a) {
            var workspaceMembersLink = _a.workspaceMembersLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.inviteTeamTask.title', { workspaceMembersLink: workspaceMembersLink });
        },
        description: function (_a) {
            var workspaceMembersLink = _a.workspaceMembersLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.inviteTeamTask.description', { workspaceMembersLink: workspaceMembersLink });
        },
    };
    var setupCategoriesAndTags = {
        type: 'setupCategoriesAndTags',
        autoCompleted: false,
        mediaAttributes: {},
        title: function (_a) {
            var workspaceCategoriesLink = _a.workspaceCategoriesLink, workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.setupCategoriesAndTags.title', { workspaceCategoriesLink: workspaceCategoriesLink, workspaceMoreFeaturesLink: workspaceMoreFeaturesLink });
        },
        description: function (_a) {
            var workspaceCategoriesLink = _a.workspaceCategoriesLink, workspaceAccountingLink = _a.workspaceAccountingLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.setupCategoriesAndTags.description', { workspaceCategoriesLink: workspaceCategoriesLink, workspaceAccountingLink: workspaceAccountingLink });
        },
    };
    var setupTagsTask = {
        type: 'setupTags',
        autoCompleted: false,
        title: function (_a) {
            var workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.setupTagsTask.title', { workspaceMoreFeaturesLink: workspaceMoreFeaturesLink });
        },
        description: function (_a) {
            var workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.setupTagsTask.description', { workspaceMoreFeaturesLink: workspaceMoreFeaturesLink });
        },
        mediaAttributes: (_d = {},
            _d["".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-tags-v2.mp4")] = "data-expensify-thumbnail-url=\"".concat(CONST_1.default.CLOUDFRONT_URL, "/images/walkthrough-tags.png\" data-expensify-width=\"1920\" data-expensify-height=\"1080\""),
            _d),
    };
    var startChatTask = {
        type: 'startChat',
        autoCompleted: false,
        mediaAttributes: {},
        title: (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.startChatTask.title'),
        description: (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.startChatTask.description'),
    };
    var splitExpenseTask = {
        type: 'splitExpense',
        autoCompleted: false,
        mediaAttributes: {},
        title: (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.splitExpenseTask.title'),
        description: (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.splitExpenseTask.description'),
    };
    var reviewWorkspaceSettingsTask = {
        type: 'reviewWorkspaceSettings',
        autoCompleted: false,
        mediaAttributes: {},
        title: function (_a) {
            var workspaceSettingsLink = _a.workspaceSettingsLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.reviewWorkspaceSettingsTask.title', { workspaceSettingsLink: workspaceSettingsLink });
        },
        description: function (_a) {
            var workspaceSettingsLink = _a.workspaceSettingsLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.reviewWorkspaceSettingsTask.description', { workspaceSettingsLink: workspaceSettingsLink });
        },
    };
    var inviteAccountantTask = {
        type: 'inviteAccountant',
        autoCompleted: false,
        mediaAttributes: {},
        title: function (_a) {
            var workspaceMembersLink = _a.workspaceMembersLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.inviteAccountantTask.title', { workspaceMembersLink: workspaceMembersLink });
        },
        description: function (_a) {
            var workspaceMembersLink = _a.workspaceMembersLink;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.tasks.inviteAccountantTask.description', { workspaceMembersLink: workspaceMembersLink });
        },
    };
    var onboardingEmployerOrSubmitMessage = {
        message: (0, Localize_1.translate)(resolvedLocale, 'onboarding.messages.onboardingEmployerOrSubmitMessage'),
        tasks: [testDriveEmployeeTask, adminSubmitExpenseTask],
    };
    var combinedTrackSubmitOnboardingEmployerOrSubmitMessage = __assign(__assign({}, onboardingEmployerOrSubmitMessage), { tasks: [testDriveEmployeeTask, combinedTrackSubmitExpenseTask] });
    var onboardingPersonalSpendMessage = {
        message: (0, Localize_1.translate)(resolvedLocale, 'onboarding.messages.onboardingPersonalSpendMessage'),
        tasks: [testDriveEmployeeTask, trackExpenseTask],
    };
    var combinedTrackSubmitOnboardingPersonalSpendMessage = __assign(__assign({}, onboardingPersonalSpendMessage), { tasks: [testDriveEmployeeTask, trackExpenseTask] });
    var onboardingMangeTeamMessage = {
        message: function (_a) {
            var onboardingCompanySize = _a.onboardingCompanySize;
            return (0, Localize_1.translate)(resolvedLocale, 'onboarding.messages.onboardingMangeTeamMessage', { onboardingCompanySize: onboardingCompanySize });
        },
        tasks: [createWorkspaceTask, testDriveAdminTask, addAccountingIntegrationTask, connectCorporateCardTask, inviteTeamTask, setupCategoriesAndTags, setupCategoriesTask, setupTagsTask],
    };
    var onboardingTrackWorkspaceMessage = {
        message: (0, Localize_1.translate)(resolvedLocale, 'onboarding.messages.onboardingTrackWorkspaceMessage'),
        video: {
            url: "".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/guided-setup-manage-team-v2.mp4"),
            thumbnailUrl: "".concat(CONST_1.default.CLOUDFRONT_URL, "/images/guided-setup-manage-team.jpg"),
            duration: 55,
            width: 1280,
            height: 960,
        },
        tasks: [createWorkspaceTask, testDriveAdminTask, createReportTask, setupCategoriesTask, inviteAccountantTask, reviewWorkspaceSettingsTask],
    };
    var onboardingChatSplitMessage = {
        message: (0, Localize_1.translate)(resolvedLocale, 'onboarding.messages.onboardingChatSplitMessage'),
        tasks: [testDriveEmployeeTask, startChatTask, splitExpenseTask],
    };
    var onboardingAdminMessage = {
        message: (0, Localize_1.translate)(resolvedLocale, 'onboarding.messages.onboardingAdminMessage'),
        tasks: [reviewWorkspaceSettingsTask, adminSubmitExpenseTask],
    };
    var onboardingLookingAroundMessage = {
        message: (0, Localize_1.translate)(resolvedLocale, 'onboarding.messages.onboardingLookingAroundMessage'),
        tasks: [],
    };
    var onboardingTestDriveReceiverMessage = {
        message: (0, Localize_1.translate)(resolvedLocale, 'onboarding.messages.onboardingTestDriveReceiverMessage'),
        tasks: [testDriveAdminTask, createTestDriveAdminWorkspaceTask],
    };
    return {
        onboardingMessages: (_e = {},
            _e[CONST_1.default.ONBOARDING_CHOICES.EMPLOYER] = onboardingEmployerOrSubmitMessage,
            _e[CONST_1.default.ONBOARDING_CHOICES.SUBMIT] = onboardingEmployerOrSubmitMessage,
            _e[CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM] = onboardingMangeTeamMessage,
            _e[CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE] = onboardingTrackWorkspaceMessage,
            _e[CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND] = onboardingPersonalSpendMessage,
            _e[CONST_1.default.ONBOARDING_CHOICES.CHAT_SPLIT] = onboardingChatSplitMessage,
            _e[CONST_1.default.ONBOARDING_CHOICES.ADMIN] = onboardingAdminMessage,
            _e[CONST_1.default.ONBOARDING_CHOICES.LOOKING_AROUND] = onboardingLookingAroundMessage,
            _e[CONST_1.default.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER] = onboardingTestDriveReceiverMessage,
            _e),
        createExpenseOnboardingMessages: (_f = {},
            _f[CONST_1.default.CREATE_EXPENSE_ONBOARDING_CHOICES.PERSONAL_SPEND] = combinedTrackSubmitOnboardingPersonalSpendMessage,
            _f[CONST_1.default.CREATE_EXPENSE_ONBOARDING_CHOICES.EMPLOYER] = combinedTrackSubmitOnboardingEmployerOrSubmitMessage,
            _f[CONST_1.default.CREATE_EXPENSE_ONBOARDING_CHOICES.SUBMIT] = combinedTrackSubmitOnboardingEmployerOrSubmitMessage,
            _f),
        testDrive: testDrive,
    };
};
exports.getOnboardingMessages = getOnboardingMessages;
function clearInitialPath() {
    onboardingInitialPath = '';
}
