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
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var Expensicons_1 = require("@components/Icon/Expensicons");
var MultipleAvatars_1 = require("@components/MultipleAvatars");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var SubscriptAvatar_1 = require("@components/SubscriptAvatar");
var Text_1 = require("@components/Text");
var Tooltip_1 = require("@components/Tooltip");
var UserDetailsTooltip_1 = require("@components/UserDetailsTooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ControlSelection_1 = require("@libs/ControlSelection");
var DateUtils_1 = require("@libs/DateUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var ReportActionItemDate_1 = require("./ReportActionItemDate");
var ReportActionItemFragment_1 = require("./ReportActionItemFragment");
var showUserDetails = function (accountID) {
    Navigation_1.default.navigate(ROUTES_1.default.PROFILE.getRoute(accountID, Navigation_1.default.getActiveRoute()));
};
var showWorkspaceDetails = function (reportID) {
    if (!reportID) {
        return;
    }
    Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(reportID, Navigation_1.default.getReportRHPActiveRoute()));
};
function ReportActionItemSingle(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    var action = _a.action, children = _a.children, wrapperStyle = _a.wrapperStyle, _u = _a.showHeader, showHeader = _u === void 0 ? true : _u, _v = _a.shouldShowSubscriptAvatar, shouldShowSubscriptAvatar = _v === void 0 ? false : _v, _w = _a.hasBeenFlagged, hasBeenFlagged = _w === void 0 ? false : _w, report = _a.report, iouReport = _a.iouReport, _x = _a.isHovered, isHovered = _x === void 0 ? false : _x, _y = _a.isActive, isActive = _y === void 0 ? false : _y, policies = _a.policies;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
    })[0];
    var innerPolicies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, {
        canBeMissing: true,
    })[0];
    var activePolicies = policies !== null && policies !== void 0 ? policies : innerPolicies;
    var policy = (0, usePolicy_1.default)(report === null || report === void 0 ? void 0 : report.policyID);
    var delegatePersonalDetails = (action === null || action === void 0 ? void 0 : action.delegateAccountID) ? personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[action === null || action === void 0 ? void 0 : action.delegateAccountID] : undefined;
    var ownerAccountID = (_b = iouReport === null || iouReport === void 0 ? void 0 : iouReport.ownerAccountID) !== null && _b !== void 0 ? _b : action === null || action === void 0 ? void 0 : action.childOwnerAccountID;
    var isReportPreviewAction = (action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;
    var actorAccountID = (0, ReportUtils_1.getReportActionActorAccountID)(action, iouReport, report, delegatePersonalDetails);
    var invoiceReceiverPolicy = (report === null || report === void 0 ? void 0 : report.invoiceReceiver) && 'policyID' in report.invoiceReceiver ? activePolicies === null || activePolicies === void 0 ? void 0 : activePolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report.invoiceReceiver.policyID)] : undefined;
    var displayName = (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: actorAccountID, personalDetailsData: personalDetails });
    var _z = (_c = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[actorAccountID !== null && actorAccountID !== void 0 ? actorAccountID : CONST_1.default.DEFAULT_NUMBER_ID]) !== null && _c !== void 0 ? _c : {}, avatar = _z.avatar, login = _z.login, pendingFields = _z.pendingFields, status = _z.status, fallbackIcon = _z.fallbackIcon;
    var accountOwnerDetails = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(login !== null && login !== void 0 ? login : '');
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var actorHint = (login || (displayName !== null && displayName !== void 0 ? displayName : '')).replace(CONST_1.default.REGEX.MERGED_ACCOUNT_PREFIX, '');
    var isTripRoom = (0, ReportUtils_1.isTripRoom)(report);
    var displayAllActors = isReportPreviewAction && !isTripRoom && !(0, ReportUtils_1.isPolicyExpenseChat)(report);
    var isInvoiceReport = (0, ReportUtils_1.isInvoiceReport)(iouReport !== null && iouReport !== void 0 ? iouReport : null);
    var isWorkspaceActor = isInvoiceReport || ((0, ReportUtils_1.isPolicyExpenseChat)(report) && (!actorAccountID || displayAllActors));
    var avatarSource = avatar;
    var avatarId = actorAccountID;
    if (isWorkspaceActor) {
        displayName = (0, ReportUtils_1.getPolicyName)({ report: report, policy: policy });
        actorHint = displayName;
        avatarSource = (0, ReportUtils_1.getWorkspaceIcon)(report, policy).source;
        avatarId = report === null || report === void 0 ? void 0 : report.policyID;
    }
    else if (delegatePersonalDetails) {
        displayName = (_d = delegatePersonalDetails === null || delegatePersonalDetails === void 0 ? void 0 : delegatePersonalDetails.displayName) !== null && _d !== void 0 ? _d : '';
        avatarSource = delegatePersonalDetails === null || delegatePersonalDetails === void 0 ? void 0 : delegatePersonalDetails.avatar;
        avatarId = delegatePersonalDetails === null || delegatePersonalDetails === void 0 ? void 0 : delegatePersonalDetails.accountID;
    }
    else if (isReportPreviewAction && isTripRoom) {
        displayName = (_e = report === null || report === void 0 ? void 0 : report.reportName) !== null && _e !== void 0 ? _e : '';
        avatarSource = (_f = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[ownerAccountID !== null && ownerAccountID !== void 0 ? ownerAccountID : CONST_1.default.DEFAULT_NUMBER_ID]) === null || _f === void 0 ? void 0 : _f.avatar;
        avatarId = ownerAccountID;
    }
    // If this is a report preview, display names and avatars of both people involved
    var secondaryAvatar;
    var primaryDisplayName = displayName;
    if (displayAllActors) {
        if ((0, ReportUtils_1.isInvoiceRoom)(report) && !(0, ReportUtils_1.isIndividualInvoiceRoom)(report)) {
            var secondaryPolicyAvatar = (_g = invoiceReceiverPolicy === null || invoiceReceiverPolicy === void 0 ? void 0 : invoiceReceiverPolicy.avatarURL) !== null && _g !== void 0 ? _g : (0, ReportUtils_1.getDefaultWorkspaceAvatar)(invoiceReceiverPolicy === null || invoiceReceiverPolicy === void 0 ? void 0 : invoiceReceiverPolicy.name);
            secondaryAvatar = {
                source: secondaryPolicyAvatar,
                type: CONST_1.default.ICON_TYPE_WORKSPACE,
                name: invoiceReceiverPolicy === null || invoiceReceiverPolicy === void 0 ? void 0 : invoiceReceiverPolicy.name,
                id: invoiceReceiverPolicy === null || invoiceReceiverPolicy === void 0 ? void 0 : invoiceReceiverPolicy.id,
            };
        }
        else {
            // The ownerAccountID and actorAccountID can be the same if a user submits an expense back from the IOU's original creator, in that case we need to use managerID to avoid displaying the same user twice
            var secondaryAccountId = ownerAccountID === actorAccountID || isInvoiceReport ? actorAccountID : ownerAccountID;
            var secondaryUserAvatar = (_j = (_h = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[secondaryAccountId !== null && secondaryAccountId !== void 0 ? secondaryAccountId : -1]) === null || _h === void 0 ? void 0 : _h.avatar) !== null && _j !== void 0 ? _j : Expensicons_1.FallbackAvatar;
            var secondaryDisplayName = (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: secondaryAccountId });
            secondaryAvatar = {
                source: secondaryUserAvatar,
                type: CONST_1.default.ICON_TYPE_AVATAR,
                name: secondaryDisplayName !== null && secondaryDisplayName !== void 0 ? secondaryDisplayName : '',
                id: secondaryAccountId,
            };
        }
    }
    else if (!isWorkspaceActor) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        var avatarIconIndex = (report === null || report === void 0 ? void 0 : report.isOwnPolicyExpenseChat) || (0, ReportUtils_1.isPolicyExpenseChat)(report) ? 0 : 1;
        var reportIcons = (0, ReportUtils_1.getIcons)(report, personalDetails, undefined, undefined, undefined, policy);
        secondaryAvatar = (_k = reportIcons.at(avatarIconIndex)) !== null && _k !== void 0 ? _k : { name: '', source: '', type: CONST_1.default.ICON_TYPE_AVATAR };
    }
    else if ((0, ReportUtils_1.isInvoiceReport)(iouReport)) {
        var secondaryAccountId = (_l = iouReport === null || iouReport === void 0 ? void 0 : iouReport.managerID) !== null && _l !== void 0 ? _l : CONST_1.default.DEFAULT_NUMBER_ID;
        var secondaryUserAvatar = (_o = (_m = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[secondaryAccountId !== null && secondaryAccountId !== void 0 ? secondaryAccountId : -1]) === null || _m === void 0 ? void 0 : _m.avatar) !== null && _o !== void 0 ? _o : Expensicons_1.FallbackAvatar;
        var secondaryDisplayName = (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: secondaryAccountId });
        secondaryAvatar = {
            source: secondaryUserAvatar,
            type: CONST_1.default.ICON_TYPE_AVATAR,
            name: secondaryDisplayName,
            id: secondaryAccountId,
        };
    }
    else {
        secondaryAvatar = { name: '', source: '', type: 'avatar' };
    }
    var icon = {
        source: avatarSource !== null && avatarSource !== void 0 ? avatarSource : Expensicons_1.FallbackAvatar,
        type: isWorkspaceActor ? CONST_1.default.ICON_TYPE_WORKSPACE : CONST_1.default.ICON_TYPE_AVATAR,
        name: primaryDisplayName !== null && primaryDisplayName !== void 0 ? primaryDisplayName : '',
        id: avatarId,
    };
    var showMultipleUserAvatarPattern = displayAllActors && !shouldShowSubscriptAvatar;
    var headingText = showMultipleUserAvatarPattern ? "".concat(icon.name, " & ").concat(secondaryAvatar.name) : displayName;
    // Since the display name for a report action message is delivered with the report history as an array of fragments
    // we'll need to take the displayName from personal details and have it be in the same format for now. Eventually,
    // we should stop referring to the report history items entirely for this information.
    var personArray = headingText
        ? [
            {
                type: 'TEXT',
                text: headingText,
            },
        ]
        : action === null || action === void 0 ? void 0 : action.person;
    var reportID = report === null || report === void 0 ? void 0 : report.reportID;
    var iouReportID = iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID;
    var showActorDetails = (0, react_1.useCallback)(function () {
        if (isWorkspaceActor) {
            showWorkspaceDetails(reportID);
        }
        else {
            // Show participants page IOU report preview
            if (iouReportID && displayAllActors) {
                Navigation_1.default.navigate(ROUTES_1.default.REPORT_PARTICIPANTS.getRoute(iouReportID, Navigation_1.default.getReportRHPActiveRoute()));
                return;
            }
            showUserDetails(Number(icon.id));
        }
    }, [isWorkspaceActor, reportID, iouReportID, displayAllActors, icon.id]);
    var shouldDisableDetailPage = (0, react_1.useMemo)(function () {
        return CONST_1.default.RESTRICTED_ACCOUNT_IDS.includes(actorAccountID !== null && actorAccountID !== void 0 ? actorAccountID : CONST_1.default.DEFAULT_NUMBER_ID) ||
            (!isWorkspaceActor && (0, ReportUtils_1.isOptimisticPersonalDetail)((action === null || action === void 0 ? void 0 : action.delegateAccountID) ? Number(action.delegateAccountID) : (actorAccountID !== null && actorAccountID !== void 0 ? actorAccountID : CONST_1.default.DEFAULT_NUMBER_ID)));
    }, [action, isWorkspaceActor, actorAccountID]);
    var getBackgroundColor = function () {
        if (isActive) {
            return theme.messageHighlightBG;
        }
        if (isHovered) {
            return theme.hoverComponentBG;
        }
        return theme.sidebar;
    };
    var getAvatar = function () {
        var _a;
        if (shouldShowSubscriptAvatar) {
            return (<SubscriptAvatar_1.default mainAvatar={icon} secondaryAvatar={secondaryAvatar} noMargin backgroundColor={getBackgroundColor()}/>);
        }
        if (displayAllActors) {
            return (<MultipleAvatars_1.default icons={[icon, secondaryAvatar]} isInReportAction shouldShowTooltip secondAvatarStyle={[StyleUtils.getBackgroundAndBorderStyle(theme.appBG), isHovered ? StyleUtils.getBackgroundAndBorderStyle(theme.hoverComponentBG) : undefined]}/>);
        }
        return (<UserDetailsTooltip_1.default accountID={Number(delegatePersonalDetails && !isWorkspaceActor ? actorAccountID : ((_a = icon.id) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID))} delegateAccountID={action === null || action === void 0 ? void 0 : action.delegateAccountID} icon={icon}>
                <react_native_1.View>
                    <Avatar_1.default containerStyles={[styles.actionAvatar]} source={icon.source} type={icon.type} name={icon.name} avatarID={icon.id} fallbackIcon={fallbackIcon}/>
                </react_native_1.View>
            </UserDetailsTooltip_1.default>);
    };
    var hasEmojiStatus = !displayAllActors && (status === null || status === void 0 ? void 0 : status.emojiCode);
    var formattedDate = DateUtils_1.default.getStatusUntilDate((_p = status === null || status === void 0 ? void 0 : status.clearAfter) !== null && _p !== void 0 ? _p : '');
    var statusText = (_q = status === null || status === void 0 ? void 0 : status.text) !== null && _q !== void 0 ? _q : '';
    var statusTooltipText = formattedDate ? "".concat(statusText ? "".concat(statusText, " ") : '', "(").concat(formattedDate, ")") : statusText;
    return (<react_native_1.View style={[styles.chatItem, wrapperStyle]}>
            <PressableWithoutFeedback_1.default style={[styles.alignSelfStart, styles.mr3]} onPressIn={ControlSelection_1.default.block} onPressOut={ControlSelection_1.default.unblock} onPress={showActorDetails} disabled={shouldDisableDetailPage} accessibilityLabel={actorHint} role={CONST_1.default.ROLE.BUTTON}>
                <OfflineWithFeedback_1.default pendingAction={(_r = pendingFields === null || pendingFields === void 0 ? void 0 : pendingFields.avatar) !== null && _r !== void 0 ? _r : undefined}>{getAvatar()}</OfflineWithFeedback_1.default>
            </PressableWithoutFeedback_1.default>
            <react_native_1.View style={[styles.chatItemRight]}>
                {showHeader ? (<react_native_1.View style={[styles.chatItemMessageHeader]}>
                        <PressableWithoutFeedback_1.default style={[styles.flexShrink1, styles.mr1]} onPressIn={ControlSelection_1.default.block} onPressOut={ControlSelection_1.default.unblock} onPress={showActorDetails} disabled={shouldDisableDetailPage} accessibilityLabel={actorHint} role={CONST_1.default.ROLE.BUTTON}>
                            {personArray === null || personArray === void 0 ? void 0 : personArray.map(function (fragment, index) {
                var _a, _b, _c, _d, _e;
                return (<ReportActionItemFragment_1.default 
                // eslint-disable-next-line react/no-array-index-key
                key={"person-".concat(action === null || action === void 0 ? void 0 : action.reportActionID, "-").concat(index)} accountID={Number(delegatePersonalDetails && !isWorkspaceActor ? actorAccountID : ((_a = icon.id) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID))} fragment={__assign(__assign({}, fragment), { type: (_b = fragment.type) !== null && _b !== void 0 ? _b : '', text: (_c = fragment.text) !== null && _c !== void 0 ? _c : '' })} delegateAccountID={action === null || action === void 0 ? void 0 : action.delegateAccountID} isSingleLine actorIcon={icon} moderationDecision={(_e = (_d = (0, ReportActionsUtils_1.getReportActionMessage)(action)) === null || _d === void 0 ? void 0 : _d.moderationDecision) === null || _e === void 0 ? void 0 : _e.decision} shouldShowTooltip={!showMultipleUserAvatarPattern}/>);
            })}
                        </PressableWithoutFeedback_1.default>
                        {!!hasEmojiStatus && (<Tooltip_1.default text={statusTooltipText}>
                                <Text_1.default style={styles.userReportStatusEmoji} numberOfLines={1}>{"".concat(status === null || status === void 0 ? void 0 : status.emojiCode)}</Text_1.default>
                            </Tooltip_1.default>)}
                        <ReportActionItemDate_1.default created={(_s = action === null || action === void 0 ? void 0 : action.created) !== null && _s !== void 0 ? _s : ''}/>
                    </react_native_1.View>) : null}
                {!!(action === null || action === void 0 ? void 0 : action.delegateAccountID) && (<Text_1.default style={[styles.chatDelegateMessage]}>{translate('delegate.onBehalfOfMessage', { delegator: (_t = accountOwnerDetails === null || accountOwnerDetails === void 0 ? void 0 : accountOwnerDetails.displayName) !== null && _t !== void 0 ? _t : '' })}</Text_1.default>)}
                <react_native_1.View style={hasBeenFlagged ? styles.blockquote : {}}>{children}</react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
ReportActionItemSingle.displayName = 'ReportActionItemSingle';
exports.default = ReportActionItemSingle;
