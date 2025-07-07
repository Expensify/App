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
exports.setWorkspaceCompanyCardFeedName = setWorkspaceCompanyCardFeedName;
exports.deleteWorkspaceCompanyCardFeed = deleteWorkspaceCompanyCardFeed;
exports.setWorkspaceCompanyCardTransactionLiability = setWorkspaceCompanyCardTransactionLiability;
exports.openPolicyCompanyCardsPage = openPolicyCompanyCardsPage;
exports.openPolicyCompanyCardsFeed = openPolicyCompanyCardsFeed;
exports.addNewCompanyCardsFeed = addNewCompanyCardsFeed;
exports.assignWorkspaceCompanyCard = assignWorkspaceCompanyCard;
exports.unassignWorkspaceCompanyCard = unassignWorkspaceCompanyCard;
exports.updateWorkspaceCompanyCard = updateWorkspaceCompanyCard;
exports.updateCompanyCardName = updateCompanyCardName;
exports.setCompanyCardExportAccount = setCompanyCardExportAccount;
exports.clearCompanyCardErrorField = clearCompanyCardErrorField;
exports.setAddNewCompanyCardStepAndData = setAddNewCompanyCardStepAndData;
exports.clearAddNewCardFlow = clearAddNewCardFlow;
exports.setAssignCardStepAndData = setAssignCardStepAndData;
exports.clearAssignCardStepAndData = clearAssignCardStepAndData;
exports.openAssignFeedCardPage = openAssignFeedCardPage;
exports.openPolicyAddCardFeedPage = openPolicyAddCardFeedPage;
exports.setTransactionStartDate = setTransactionStartDate;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var CardUtils = require("@libs/CardUtils");
var ErrorUtils = require("@libs/ErrorUtils");
var NetworkStore = require("@libs/Network/NetworkStore");
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
var PolicyUtils = require("@libs/PolicyUtils");
var ReportUtils = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function setAssignCardStepAndData(_a) {
    var data = _a.data, isEditing = _a.isEditing, currentStep = _a.currentStep;
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ASSIGN_CARD, { data: data, isEditing: isEditing, currentStep: currentStep });
}
function setTransactionStartDate(startDate) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ASSIGN_CARD, { startDate: startDate });
}
function clearAssignCardStepAndData() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.ASSIGN_CARD, {});
}
function setAddNewCompanyCardStepAndData(_a) {
    var data = _a.data, isEditing = _a.isEditing, step = _a.step;
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD, { data: data, isEditing: isEditing, currentStep: step });
}
function clearAddNewCardFlow() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD, {
        currentStep: null,
        data: {},
    });
}
function addNewCompanyCardsFeed(policyID, cardFeed, feedDetails, cardFeeds, lastSelectedFeed) {
    var _a, _b;
    var authToken = NetworkStore.getAuthToken();
    var workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);
    if (!authToken || !policyID) {
        return;
    }
    var feedType = CardUtils.getFeedType(cardFeed, cardFeeds);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.LAST_SELECTED_FEED).concat(policyID),
            value: feedType,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER).concat(workspaceAccountID),
            value: {
                isLoading: true,
                settings: {
                    companyCards: (_a = {},
                        _a[feedType] = {
                            errors: null,
                        },
                        _a),
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.LAST_SELECTED_FEED).concat(policyID),
            value: lastSelectedFeed !== null && lastSelectedFeed !== void 0 ? lastSelectedFeed : null,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER).concat(workspaceAccountID),
            value: {
                isLoading: true,
                settings: {
                    companyCards: (_b = {},
                        _b[feedType] = null,
                        _b),
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.LAST_SELECTED_FEED).concat(policyID),
            value: feedType,
        },
    ];
    var finallyData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER).concat(workspaceAccountID),
            value: {
                isLoading: false,
            },
        },
    ];
    var parameters = {
        policyID: policyID,
        authToken: authToken,
        feedType: feedType,
        feedDetails: Object.entries(feedDetails)
            .map(function (_a) {
            var key = _a[0], value = _a[1];
            return "".concat(key, ": ").concat(value);
        })
            .join(', '),
    };
    API.write(types_1.WRITE_COMMANDS.REQUEST_FEED_SETUP, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData, finallyData: finallyData });
}
function setWorkspaceCompanyCardFeedName(policyID, domainOrWorkspaceAccountID, bankName, userDefinedName) {
    var _a;
    var authToken = NetworkStore.getAuthToken();
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER).concat(domainOrWorkspaceAccountID),
                value: {
                    settings: {
                        companyCardNicknames: (_a = {},
                            _a[bankName] = userDefinedName,
                            _a),
                    },
                },
            },
        ],
    };
    var parameters = {
        authToken: authToken,
        policyID: policyID,
        domainAccountID: domainOrWorkspaceAccountID,
        bankName: bankName,
        userDefinedName: userDefinedName,
    };
    API.write(types_1.WRITE_COMMANDS.SET_COMPANY_CARD_FEED_NAME, parameters, onyxData);
}
function setWorkspaceCompanyCardTransactionLiability(domainOrWorkspaceAccountID, policyID, bankName, liabilityType) {
    var _a;
    var authToken = NetworkStore.getAuthToken();
    var feedUpdates = (_a = {},
        _a[bankName] = { liabilityType: liabilityType },
        _a);
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER).concat(domainOrWorkspaceAccountID),
                value: {
                    settings: { companyCards: feedUpdates },
                },
            },
        ],
    };
    var parameters = {
        authToken: authToken,
        policyID: policyID,
        bankName: bankName,
        liabilityType: liabilityType,
    };
    API.write(types_1.WRITE_COMMANDS.SET_COMPANY_CARD_TRANSACTION_LIABILITY, parameters, onyxData);
}
function deleteWorkspaceCompanyCardFeed(policyID, domainOrWorkspaceAccountID, bankName, cardIDs, feedToOpen) {
    var _a, _b, _c, _d;
    var authToken = NetworkStore.getAuthToken();
    var isCustomFeed = CardUtils.isCustomFeed(bankName);
    var optimisticFeedUpdates = (_a = {}, _a[bankName] = { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE }, _a);
    var successFeedUpdates = (_b = {}, _b[bankName] = null, _b);
    var failureFeedUpdates = (_c = {}, _c[bankName] = { pendingAction: null, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') }, _c);
    var optimisticCardUpdates = Object.fromEntries(cardIDs.map(function (cardID) { return [cardID, { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE }]; }));
    var successAndFailureCardUpdates = Object.fromEntries(cardIDs.map(function (cardID) { return [cardID, { pendingAction: null }]; }));
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER).concat(domainOrWorkspaceAccountID),
            value: {
                settings: {
                    companyCards: optimisticFeedUpdates,
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bankName),
            value: optimisticCardUpdates,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.CARD_LIST,
            value: optimisticCardUpdates,
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER).concat(domainOrWorkspaceAccountID),
            value: {
                settings: __assign(__assign({}, (isCustomFeed ? { companyCards: successFeedUpdates } : { oAuthAccountDetails: successFeedUpdates, companyCards: successFeedUpdates })), { companyCardNicknames: (_d = {},
                        _d[bankName] = null,
                        _d) }),
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bankName),
            value: successAndFailureCardUpdates,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.CARD_LIST,
            value: successAndFailureCardUpdates,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER).concat(domainOrWorkspaceAccountID),
            value: {
                settings: {
                    companyCards: failureFeedUpdates,
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bankName),
            value: successAndFailureCardUpdates,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.CARD_LIST,
            value: successAndFailureCardUpdates,
        },
    ];
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.LAST_SELECTED_FEED).concat(policyID),
        value: feedToOpen !== null && feedToOpen !== void 0 ? feedToOpen : null,
    });
    var parameters = {
        authToken: authToken,
        domainAccountID: domainOrWorkspaceAccountID,
        policyID: policyID,
        bankName: bankName,
    };
    API.write(types_1.WRITE_COMMANDS.DELETE_COMPANY_CARD_FEED, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function assignWorkspaceCompanyCard(policyID, data) {
    var _a, _b, _c;
    var _d, _e;
    if (!data) {
        return;
    }
    var _f = data.bankName, bankName = _f === void 0 ? '' : _f, _g = data.email, email = _g === void 0 ? '' : _g, _h = data.encryptedCardNumber, encryptedCardNumber = _h === void 0 ? '' : _h, _j = data.startDate, startDate = _j === void 0 ? '' : _j, _k = data.cardName, cardName = _k === void 0 ? '' : _k;
    var assigneeDetails = PersonalDetailsUtils.getPersonalDetailByEmail(email);
    var optimisticCardAssignedReportAction = ReportUtils.buildOptimisticCardAssignedReportAction((_d = assigneeDetails === null || assigneeDetails === void 0 ? void 0 : assigneeDetails.accountID) !== null && _d !== void 0 ? _d : CONST_1.default.DEFAULT_NUMBER_ID);
    var parameters = {
        policyID: policyID,
        bankName: bankName,
        encryptedCardNumber: encryptedCardNumber,
        cardName: cardName,
        email: email,
        startDate: startDate,
        reportActionID: optimisticCardAssignedReportAction.reportActionID,
    };
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = PolicyUtils.getPolicy(policyID);
    var policyExpenseChat = ReportUtils.getPolicyExpenseChat((_e = policy === null || policy === void 0 ? void 0 : policy.ownerAccountID) !== null && _e !== void 0 ? _e : CONST_1.default.DEFAULT_NUMBER_ID, policyID);
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(policyExpenseChat === null || policyExpenseChat === void 0 ? void 0 : policyExpenseChat.reportID),
                value: (_a = {},
                    _a[optimisticCardAssignedReportAction.reportActionID] = optimisticCardAssignedReportAction,
                    _a),
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.ASSIGN_CARD,
                value: { isAssigning: true },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(policyExpenseChat === null || policyExpenseChat === void 0 ? void 0 : policyExpenseChat.reportID),
                value: (_b = {}, _b[optimisticCardAssignedReportAction.reportActionID] = { pendingAction: null }, _b),
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.ASSIGN_CARD,
                value: { isAssigned: true, isAssigning: false },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(policyExpenseChat === null || policyExpenseChat === void 0 ? void 0 : policyExpenseChat.reportID),
                value: (_c = {},
                    _c[optimisticCardAssignedReportAction.reportActionID] = {
                        pendingAction: null,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                    _c),
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.ASSIGN_CARD,
                value: { isAssigning: false },
            },
        ],
    };
    API.write(types_1.WRITE_COMMANDS.ASSIGN_COMPANY_CARD, parameters, onyxData);
}
function unassignWorkspaceCompanyCard(domainOrWorkspaceAccountID, bankName, card) {
    var _a, _b, _c, _d, _e, _f;
    var authToken = NetworkStore.getAuthToken();
    var cardID = card.cardID;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bankName),
                value: (_a = {},
                    _a[cardID] = {
                        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                    _a),
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.CARD_LIST,
                value: (_b = {},
                    _b[cardID] = {
                        pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                    _b),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bankName),
                value: (_c = {},
                    _c[cardID] = null,
                    _c),
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.CARD_LIST,
                value: (_d = {},
                    _d[cardID] = null,
                    _d),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bankName),
                value: (_e = {},
                    _e[cardID] = {
                        pendingAction: null,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                    _e),
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.CARD_LIST,
                value: (_f = {},
                    _f[cardID] = {
                        pendingAction: null,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                    _f),
            },
        ],
    };
    var parameters = {
        authToken: authToken,
        cardID: Number(cardID),
    };
    API.write(types_1.WRITE_COMMANDS.UNASSIGN_COMPANY_CARD, parameters, onyxData);
}
function updateWorkspaceCompanyCard(domainOrWorkspaceAccountID, cardID, bankName) {
    var _a, _b, _c, _d, _e, _f;
    var authToken = NetworkStore.getAuthToken();
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bankName),
            value: (_a = {},
                _a[cardID] = {
                    isLoadingLastUpdated: true,
                    pendingFields: {
                        lastScrape: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                    errorFields: {
                        lastScrape: null,
                    },
                },
                _a),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.CARD_LIST,
            value: (_b = {},
                _b[cardID] = {
                    isLoadingLastUpdated: true,
                    pendingFields: {
                        lastScrape: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                    errorFields: {
                        lastScrape: null,
                    },
                },
                _b),
        },
    ];
    var finallyData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bankName),
            value: (_c = {},
                _c[cardID] = {
                    isLoadingLastUpdated: false,
                    pendingFields: {
                        lastScrape: null,
                    },
                },
                _c),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.CARD_LIST,
            value: (_d = {},
                _d[cardID] = {
                    isLoadingLastUpdated: false,
                    pendingFields: {
                        lastScrape: null,
                    },
                },
                _d),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bankName),
            value: (_e = {},
                _e[cardID] = {
                    isLoadingLastUpdated: false,
                    pendingFields: {
                        lastScrape: null,
                    },
                    errorFields: {
                        lastScrape: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
                _e),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.CARD_LIST,
            value: (_f = {},
                _f[cardID] = {
                    isLoadingLastUpdated: false,
                    pendingFields: {
                        lastScrape: null,
                    },
                    errorFields: {
                        lastScrape: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
                _f),
        },
    ];
    var parameters = {
        authToken: authToken,
        cardID: Number(cardID),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_COMPANY_CARD, parameters, { optimisticData: optimisticData, finallyData: finallyData, failureData: failureData });
}
function updateCompanyCardName(domainOrWorkspaceAccountID, cardID, newCardTitle, bankName, oldCardTitle) {
    var _a, _b, _c, _d, _e;
    var authToken = NetworkStore.getAuthToken();
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bankName),
            value: (_a = {},
                _a[cardID] = {
                    nameValuePairs: {
                        cardTitle: newCardTitle,
                        pendingFields: {
                            cardTitle: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                        errorFields: {
                            cardTitle: null,
                        },
                    },
                },
                _a),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES,
            value: (_b = {}, _b[cardID] = newCardTitle, _b),
        },
    ];
    var finallyData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bankName),
            value: (_c = {},
                _c[cardID] = {
                    nameValuePairs: {
                        pendingFields: {
                            cardTitle: null,
                        },
                    },
                },
                _c),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bankName),
            value: (_d = {},
                _d[cardID] = {
                    nameValuePairs: {
                        pendingFields: {
                            cardTitle: null,
                        },
                        errorFields: {
                            cardTitle: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                        },
                    },
                },
                _d),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES,
            value: (_e = {}, _e[cardID] = oldCardTitle, _e),
        },
    ];
    var parameters = {
        authToken: authToken,
        cardID: Number(cardID),
        cardName: newCardTitle,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_COMPANY_CARD_NAME, parameters, { optimisticData: optimisticData, finallyData: finallyData, failureData: failureData });
}
function setCompanyCardExportAccount(policyID, domainOrWorkspaceAccountID, cardID, accountKey, newAccount, bank) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var authToken = NetworkStore.getAuthToken();
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bank),
            value: (_a = {},
                _a[cardID] = {
                    nameValuePairs: (_b = {
                            pendingFields: (_c = {},
                                _c[accountKey] = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                _c),
                            errorFields: (_d = {},
                                _d[accountKey] = null,
                                _d)
                        },
                        _b[accountKey] = newAccount,
                        _b),
                },
                _a),
        },
    ];
    var finallyData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bank),
            value: (_e = {},
                _e[cardID] = {
                    nameValuePairs: {
                        pendingFields: (_f = {},
                            _f[accountKey] = null,
                            _f),
                    },
                },
                _e),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bank),
            value: (_g = {},
                _g[cardID] = {
                    nameValuePairs: {
                        pendingFields: (_h = {},
                            _h[accountKey] = newAccount,
                            _h),
                        errorFields: (_j = {},
                            _j[accountKey] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            _j),
                    },
                },
                _g),
        },
    ];
    var parameters = {
        authToken: authToken,
        cardID: Number(cardID),
        exportAccountDetails: JSON.stringify((_k = {}, _k[accountKey] = newAccount, _k["".concat(accountKey, "_policy_id")] = policyID, _k)),
    };
    API.write(types_1.WRITE_COMMANDS.SET_CARD_EXPORT_ACCOUNT, parameters, { optimisticData: optimisticData, finallyData: finallyData, failureData: failureData });
}
function clearCompanyCardErrorField(domainOrWorkspaceAccountID, cardID, bankName, fieldName, isRootLevel) {
    var _a, _b, _c, _d, _e, _f;
    if (isRootLevel) {
        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bankName), (_a = {},
            _a[cardID] = {
                errorFields: (_b = {}, _b[fieldName] = null, _b),
            },
            _a));
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(bankName), (_c = {},
        _c[cardID] = {
            nameValuePairs: {
                errorFields: (_d = {}, _d[fieldName] = null, _d),
            },
        },
        _c));
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.CARD_LIST, (_e = {},
        _e[cardID] = {
            nameValuePairs: {
                errorFields: (_f = {},
                    _f[fieldName] = null,
                    _f),
            },
        },
        _e));
}
function openPolicyCompanyCardsPage(policyID, domainOrWorkspaceAccountID) {
    var authToken = NetworkStore.getAuthToken();
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER).concat(domainOrWorkspaceAccountID),
            value: {
                isLoading: true,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER).concat(domainOrWorkspaceAccountID),
            value: {
                isLoading: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER).concat(domainOrWorkspaceAccountID),
            value: {
                isLoading: false,
            },
        },
    ];
    var params = {
        policyID: policyID,
        authToken: authToken,
    };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_PAGE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function openPolicyCompanyCardsFeed(domainAccountID, policyID, feed) {
    var parameters = {
        domainAccountID: domainAccountID,
        policyID: policyID,
        feed: feed,
    };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_FEED, parameters);
}
function openAssignFeedCardPage(policyID, feed, domainOrWorkspaceAccountID) {
    var parameters = {
        policyID: policyID,
        feed: feed,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER).concat(domainOrWorkspaceAccountID),
            value: {
                isLoading: true,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER).concat(domainOrWorkspaceAccountID),
            value: {
                isLoading: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER).concat(domainOrWorkspaceAccountID),
            value: {
                isLoading: false,
            },
        },
    ];
    API.read(types_1.READ_COMMANDS.OPEN_ASSIGN_FEED_CARD_PAGE, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function openPolicyAddCardFeedPage(policyID) {
    if (!policyID) {
        return;
    }
    var parameters = {
        policyID: policyID,
    };
    API.write(types_1.WRITE_COMMANDS.OPEN_POLICY_ADD_CARD_FEED_PAGE, parameters);
}
