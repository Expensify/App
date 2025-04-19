'use strict';
exports.__esModule = true;
exports.openExternalLinkWithToken =
    exports.buildTravelDotURL =
    exports.openTravelDotLink =
    exports.getInternalExpensifyPath =
    exports.getInternalNewExpensifyPath =
    exports.openLink =
    exports.openExternalLink =
    exports.openOldDotLink =
    exports.buildOldDotURL =
        void 0;
var react_native_onyx_1 = require('react-native-onyx');
var API = require('@libs/API');
var types_1 = require('@libs/API/types');
var asyncOpenURL_1 = require('@libs/asyncOpenURL');
var Environment = require('@libs/Environment/Environment');
var Navigation_1 = require('@libs/Navigation/Navigation');
var Url = require('@libs/Url');
var CONFIG_1 = require('@src/CONFIG');
var CONST_1 = require('@src/CONST');
var ONYXKEYS_1 = require('@src/ONYXKEYS');
var ROUTES_1 = require('@src/ROUTES');
var Session_1 = require('./Session');
var isNetworkOffline = false;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].NETWORK,
    callback: function (value) {
        var _a;
        return (isNetworkOffline = (_a = value === null || value === void 0 ? void 0 : value.isOffline) !== null && _a !== void 0 ? _a : false);
    },
});
var currentUserEmail = '';
var currentUserAccountID = CONST_1['default'].DEFAULT_NUMBER_ID;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].SESSION,
    callback: function (value) {
        var _a, _b;
        currentUserEmail = (_a = value === null || value === void 0 ? void 0 : value.email) !== null && _a !== void 0 ? _a : '';
        currentUserAccountID = (_b = value === null || value === void 0 ? void 0 : value.accountID) !== null && _b !== void 0 ? _b : CONST_1['default'].DEFAULT_NUMBER_ID;
    },
});
function buildOldDotURL(url, shortLivedAuthToken) {
    var hashIndex = url.lastIndexOf('#');
    var hasHashParams = hashIndex !== -1;
    var hasURLParams = url.indexOf('?') !== -1;
    var originURL = url;
    var hashParams = '';
    if (hasHashParams) {
        originURL = url.substring(0, hashIndex);
        hashParams = url.substring(hashIndex);
    }
    var authTokenParam = shortLivedAuthToken ? 'authToken=' + shortLivedAuthToken : '';
    var emailParam = 'email=' + encodeURIComponent(currentUserEmail);
    var paramsArray = [authTokenParam, emailParam];
    var params = paramsArray.filter(Boolean).join('&');
    return Environment.getOldDotEnvironmentURL().then(function (environmentURL) {
        var oldDotDomain = Url.addTrailingForwardSlash(environmentURL);
        // If the URL contains # or ?, we can assume they don't need to have the `?` token to start listing url parameters.
        return '' + oldDotDomain + originURL + (hasURLParams ? '&' : '?') + params + hashParams;
    });
}
exports.buildOldDotURL = buildOldDotURL;
/**
 * @param shouldSkipCustomSafariLogic When true, we will use `Linking.openURL` even if the browser is Safari.
 */
function openExternalLink(url, shouldSkipCustomSafariLogic, shouldOpenInSameTab) {
    if (shouldSkipCustomSafariLogic === void 0) {
        shouldSkipCustomSafariLogic = false;
    }
    if (shouldOpenInSameTab === void 0) {
        shouldOpenInSameTab = false;
    }
    asyncOpenURL_1['default'](Promise.resolve(), url, shouldSkipCustomSafariLogic, shouldOpenInSameTab);
}
exports.openExternalLink = openExternalLink;
function openOldDotLink(url, shouldOpenInSameTab) {
    if (shouldOpenInSameTab === void 0) {
        shouldOpenInSameTab = false;
    }
    if (isNetworkOffline) {
        buildOldDotURL(url).then(function (oldDotURL) {
            return openExternalLink(oldDotURL, undefined, shouldOpenInSameTab);
        });
        return;
    }
    // If shortLivedAuthToken is not accessible, fallback to opening the link without the token.
    asyncOpenURL_1['default'](
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.OPEN_OLD_DOT_LINK, {}, {})
            .then(function (response) {
                return response ? buildOldDotURL(url, response.shortLivedAuthToken) : buildOldDotURL(url);
            })
            ['catch'](function () {
                return buildOldDotURL(url);
            }),
        function (oldDotURL) {
            return oldDotURL;
        },
        undefined,
        shouldOpenInSameTab,
    );
}
exports.openOldDotLink = openOldDotLink;
function buildTravelDotURL(spotnanaToken, isTestAccount, postLoginPath) {
    var environmentURL = isTestAccount ? CONST_1['default'].STAGING_TRAVEL_DOT_URL : CONST_1['default'].TRAVEL_DOT_URL;
    var tmcID = isTestAccount ? CONST_1['default'].STAGING_SPOTNANA_TMC_ID : CONST_1['default'].SPOTNANA_TMC_ID;
    var authCode = 'authCode=' + spotnanaToken;
    var tmcIDParam = 'tmcId=' + tmcID;
    var redirectURL = postLoginPath ? 'redirectUrl=' + Url.addLeadingForwardSlash(postLoginPath) : '';
    var paramsArray = [authCode, tmcIDParam, redirectURL];
    var params = paramsArray.filter(Boolean).join('&');
    var travelDotDomain = Url.addTrailingForwardSlash(environmentURL);
    return travelDotDomain + 'auth/code?' + params;
}
exports.buildTravelDotURL = buildTravelDotURL;
/**
 * @param postLoginPath When provided, we will redirect the user to this path post login on travelDot. eg: 'trips/:tripID'
 */
function openTravelDotLink(policyID, postLoginPath) {
    if (policyID === null || policyID === undefined) {
        return;
    }
    var parameters = {
        policyID: policyID,
    };
    return new Promise(function (resolve, reject) {
        var error = new Error('Failed to generate spotnana token.');
        asyncOpenURL_1['default'](
            // eslint-disable-next-line rulesdir/no-api-side-effects-method
            API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.GENERATE_SPOTNANA_TOKEN, parameters, {})
                .then(function (response) {
                    var _a;
                    if (!(response === null || response === void 0 ? void 0 : response.spotnanaToken)) {
                        reject(error);
                        throw error;
                    }
                    var travelURL = buildTravelDotURL(response.spotnanaToken, (_a = response.isTestAccount) !== null && _a !== void 0 ? _a : false, postLoginPath);
                    resolve(undefined);
                    return travelURL;
                })
                ['catch'](function () {
                    reject(error);
                    throw error;
                }),
            function (travelDotURL) {
                return travelDotURL !== null && travelDotURL !== void 0 ? travelDotURL : '';
            },
        );
    });
}
exports.openTravelDotLink = openTravelDotLink;
function getInternalNewExpensifyPath(href) {
    if (!href) {
        return '';
    }
    var attrPath = Url.getPathFromURL(href);
    return (Url.hasSameExpensifyOrigin(href, CONST_1['default'].NEW_EXPENSIFY_URL) ||
        Url.hasSameExpensifyOrigin(href, CONST_1['default'].STAGING_NEW_EXPENSIFY_URL) ||
        href.startsWith(CONST_1['default'].DEV_NEW_EXPENSIFY_URL)) &&
        !CONST_1['default'].PATHS_TO_TREAT_AS_EXTERNAL.find(function (path) {
            return attrPath.startsWith(path);
        })
        ? attrPath
        : '';
}
exports.getInternalNewExpensifyPath = getInternalNewExpensifyPath;
function getInternalExpensifyPath(href) {
    if (!href) {
        return '';
    }
    var attrPath = Url.getPathFromURL(href);
    var hasExpensifyOrigin =
        Url.hasSameExpensifyOrigin(href, CONFIG_1['default'].EXPENSIFY.EXPENSIFY_URL) || Url.hasSameExpensifyOrigin(href, CONFIG_1['default'].EXPENSIFY.STAGING_API_ROOT);
    if (!hasExpensifyOrigin || attrPath.startsWith(CONFIG_1['default'].EXPENSIFY.CONCIERGE_URL_PATHNAME) || attrPath.startsWith(CONFIG_1['default'].EXPENSIFY.DEVPORTAL_URL_PATHNAME)) {
        return '';
    }
    return attrPath;
}
exports.getInternalExpensifyPath = getInternalExpensifyPath;
function openLink(href, environmentURL, isAttachment) {
    if (isAttachment === void 0) {
        isAttachment = false;
    }
    var hasSameOrigin = Url.hasSameExpensifyOrigin(href, environmentURL);
    var hasExpensifyOrigin =
        Url.hasSameExpensifyOrigin(href, CONFIG_1['default'].EXPENSIFY.EXPENSIFY_URL) || Url.hasSameExpensifyOrigin(href, CONFIG_1['default'].EXPENSIFY.STAGING_API_ROOT);
    var internalNewExpensifyPath = getInternalNewExpensifyPath(href);
    var internalExpensifyPath = getInternalExpensifyPath(href);
    // There can be messages from Concierge with links to specific NewDot reports. Those URLs look like this:
    // https://www.expensify.com.dev/newdotreport?reportID=3429600449838908 and they have a target="_blank" attribute. This is so that when a user is on OldDot,
    // clicking on the link will open the chat in NewDot. However, when a user is in NewDot and clicks on the concierge link, the link needs to be handled differently.
    // Normally, the link would be sent to Link.openOldDotLink() and opened in a new tab, and that's jarring to the user. Since the intention is to link to a specific NewDot chat,
    // the reportID is extracted from the URL and then opened as an internal link, taking the user straight to the chat in the same tab.
    if (hasExpensifyOrigin && href.indexOf('newdotreport?reportID=') > -1) {
        var reportID = href.split('newdotreport?reportID=').pop();
        var reportRoute = ROUTES_1['default'].REPORT_WITH_ID.getRoute(reportID);
        Navigation_1['default'].navigate(reportRoute);
        return;
    }
    // If we are handling a New Expensify link then we will assume this should be opened by the app internally. This ensures that the links are opened internally via react-navigation
    // instead of in a new tab or with a page refresh (which is the default behavior of an anchor tag)
    if (internalNewExpensifyPath && hasSameOrigin) {
        if (Session_1.isAnonymousUser() && !Session_1.canAnonymousUserAccessRoute(internalNewExpensifyPath)) {
            Session_1.signOutAndRedirectToSignIn();
            return;
        }
        Navigation_1['default'].navigate(internalNewExpensifyPath);
        return;
    }
    // If we are handling an old dot Expensify link we need to open it with openOldDotLink() so we can navigate to it with the user already logged in.
    // As attachments also use expensify.com we don't want it working the same as links.
    var isPublicOldDotURL = Object.values(CONST_1['default'].OLD_DOT_PUBLIC_URLS).includes(href);
    if (internalExpensifyPath && !isAttachment && !isPublicOldDotURL) {
        openOldDotLink(internalExpensifyPath);
        return;
    }
    openExternalLink(href);
}
exports.openLink = openLink;
function buildURLWithAuthToken(url, shortLivedAuthToken) {
    var authTokenParam = shortLivedAuthToken ? 'shortLivedAuthToken=' + shortLivedAuthToken : '';
    var emailParam = 'email=' + encodeURIComponent(currentUserEmail);
    var exitTo = 'exitTo=' + encodeURIComponent(url);
    var accountID = 'accountID=' + currentUserAccountID;
    var referrer = 'referrer=desktop';
    var paramsArray = [accountID, emailParam, authTokenParam, exitTo, referrer];
    var params = paramsArray.filter(Boolean).join('&');
    return CONFIG_1['default'].EXPENSIFY.NEW_EXPENSIFY_URL + 'transition?' + params;
}
/**
 * @param shouldSkipCustomSafariLogic When true, we will use `Linking.openURL` even if the browser is Safari.
 */
function openExternalLinkWithToken(url, shouldSkipCustomSafariLogic) {
    if (shouldSkipCustomSafariLogic === void 0) {
        shouldSkipCustomSafariLogic = false;
    }
    asyncOpenURL_1['default'](
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.OPEN_OLD_DOT_LINK, {}, {})
            .then(function (response) {
                return response ? buildURLWithAuthToken(url, response.shortLivedAuthToken) : buildURLWithAuthToken(url);
            })
            ['catch'](function () {
                return buildURLWithAuthToken(url);
            }),
        function (link) {
            return link;
        },
        shouldSkipCustomSafariLogic,
    );
}
exports.openExternalLinkWithToken = openExternalLinkWithToken;
