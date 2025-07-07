"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_render_html_1 = require("react-native-render-html");
var AnchorForAttachmentsOnly_1 = require("@components/AnchorForAttachmentsOnly");
var AnchorForCommentsOnly_1 = require("@components/AnchorForCommentsOnly");
var HTMLEngineUtils = require("@components/HTMLEngineProvider/htmlEngineUtils");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var Text_1 = require("@components/Text");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useOnyx_1 = require("@hooks/useOnyx");
var useParentReport_1 = require("@hooks/useParentReport");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Link_1 = require("@libs/actions/Link");
var Session_1 = require("@libs/actions/Session");
var Task_1 = require("@libs/actions/Task");
var Welcome_1 = require("@libs/actions/Welcome");
var onboardingSelectors_1 = require("@libs/onboardingSelectors");
var TourUtils_1 = require("@libs/TourUtils");
var tryResolveUrlFromApiRoot_1 = require("@libs/tryResolveUrlFromApiRoot");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function AnchorRenderer(_a) {
    var _b, _c, _d, _e, _f;
    var tnode = _a.tnode, style = _a.style, key = _a.key;
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var _g = (0, react_1.useContext)(ShowContextMenuContext_1.ShowContextMenuContext), report = _g.report, action = _g.action;
    var introSelected = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_INTRO_SELECTED, { canBeMissing: true })[0];
    var viewTourTaskReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(introSelected === null || introSelected === void 0 ? void 0 : introSelected.viewTour), { canBeMissing: true })[0];
    var _h = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ONBOARDING, {
        selector: onboardingSelectors_1.hasSeenTourSelector,
        canBeMissing: true,
    })[0], hasSeenTour = _h === void 0 ? false : _h;
    var parentReport = (0, useParentReport_1.default)(report === null || report === void 0 ? void 0 : report.reportID);
    var isParentReportArchived = (0, useReportIsArchived_1.default)(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID);
    var canModifyViewTourTask = (0, Task_1.canModifyTask)(viewTourTaskReport, currentUserPersonalDetails.accountID, isParentReportArchived);
    var canActionViewTourTask = (0, Task_1.canActionTask)(viewTourTaskReport, currentUserPersonalDetails.accountID, parentReport, isParentReportArchived);
    var styles = (0, useThemeStyles_1.default)();
    var htmlAttribs = tnode.attributes;
    var _j = (0, useEnvironment_1.default)(), environment = _j.environment, environmentURL = _j.environmentURL;
    // An auth token is needed to download Expensify chat attachments
    var isAttachment = !!htmlAttribs[CONST_1.default.ATTACHMENT_SOURCE_ATTRIBUTE];
    var tNodeChild = (_c = (_b = tnode === null || tnode === void 0 ? void 0 : tnode.domNode) === null || _b === void 0 ? void 0 : _b.children) === null || _c === void 0 ? void 0 : _c.at(0);
    var displayName = tNodeChild && 'data' in tNodeChild && typeof tNodeChild.data === 'string' ? tNodeChild.data : '';
    var attrHref = htmlAttribs.href || htmlAttribs[CONST_1.default.ATTACHMENT_SOURCE_ATTRIBUTE] || '';
    var parentStyle = (_f = (_e = (_d = tnode.parent) === null || _d === void 0 ? void 0 : _d.styles) === null || _e === void 0 ? void 0 : _e.nativeTextRet) !== null && _f !== void 0 ? _f : {};
    var internalNewExpensifyPath = (0, Link_1.getInternalNewExpensifyPath)(attrHref);
    var internalExpensifyPath = (0, Link_1.getInternalExpensifyPath)(attrHref);
    var isVideo = attrHref && expensify_common_1.Str.isVideo(attrHref);
    var linkHasImage = tnode.tagName === 'a' && tnode.children.some(function (child) { return child.tagName === 'img'; });
    var isDeleted = HTMLEngineUtils.isDeletedNode(tnode);
    var isChildOfTaskTitle = HTMLEngineUtils.isChildOfTaskTitle(tnode);
    var textDecorationLineStyle = isDeleted ? styles.underlineLineThrough : {};
    var isInConciergeTaskView = (action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.CREATED && (report === null || report === void 0 ? void 0 : report.type) === CONST_1.default.REPORT.TYPE.TASK && report.ownerAccountID === CONST_1.default.ACCOUNT_ID.CONCIERGE;
    var isTourTask = attrHref === (0, TourUtils_1.getNavatticURL)(environment, introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice) && ((action === null || action === void 0 ? void 0 : action.actorAccountID) === CONST_1.default.ACCOUNT_ID.CONCIERGE || isInConciergeTaskView);
    var onLinkPress = (0, react_1.useMemo)(function () {
        if (internalNewExpensifyPath || internalExpensifyPath) {
            return function () { return (0, Link_1.openLink)(attrHref, environmentURL, isAttachment); };
        }
        if (isTourTask && !hasSeenTour) {
            return function () {
                (0, Link_1.openExternalLink)(attrHref);
                (0, Welcome_1.setSelfTourViewed)((0, Session_1.isAnonymousUser)());
                if (viewTourTaskReport && canModifyViewTourTask && canActionViewTourTask) {
                    (0, Task_1.completeTask)(viewTourTaskReport);
                }
            };
        }
        return undefined;
    }, [internalNewExpensifyPath, internalExpensifyPath, attrHref, environmentURL, isAttachment, isTourTask, hasSeenTour, viewTourTaskReport, canModifyViewTourTask, canActionViewTourTask]);
    if (!HTMLEngineUtils.isChildOfComment(tnode) && !isChildOfTaskTitle) {
        // This is not a comment from a chat, the AnchorForCommentsOnly uses a Pressable to create a context menu on right click.
        // We don't have this behaviour in other links in NewDot
        // TODO: We should use TextLink, but I'm leaving it as Text for now because TextLink breaks the alignment in Android.
        // Define link style based on context
        var linkStyle = styles.link;
        // Special handling for links in RBR to maintain consistent font size
        if (HTMLEngineUtils.isChildOfRBR(tnode)) {
            linkStyle = [
                styles.link,
                {
                    fontSize: HTMLEngineUtils.getFontSizeOfRBRChild(tnode),
                    textDecorationLine: 'underline',
                },
            ];
        }
        return (<Text_1.default style={linkStyle} onPress={function () { return (0, Link_1.openLink)(attrHref, environmentURL, isAttachment); }} suppressHighlighting>
                <react_native_render_html_1.TNodeChildrenRenderer tnode={tnode}/>
            </Text_1.default>);
    }
    if (isAttachment && !isVideo) {
        return (<AnchorForAttachmentsOnly_1.default source={(0, tryResolveUrlFromApiRoot_1.default)(attrHref)} displayName={displayName} isDeleted={isDeleted}/>);
    }
    return (<AnchorForCommentsOnly_1.default href={attrHref} 
    // Unless otherwise specified open all links in
    // a new window. On Desktop this means that we will
    // skip the default Save As... download prompt
    // and defer to whatever browser the user has.
    // eslint-disable-next-line react/jsx-props-no-multi-spaces
    target={htmlAttribs.target || '_blank'} rel={htmlAttribs.rel || 'noopener noreferrer'} style={[style, parentStyle, styles.textDecorationLineNone, isChildOfTaskTitle && styles.taskTitleMenuItem, styles.dInlineFlex]} key={key} 
    // Only pass the press handler for internal links. For public links or whitelisted internal links fallback to default link handling
    onPress={onLinkPress} linkHasImage={linkHasImage}>
            <react_native_render_html_1.TNodeChildrenRenderer tnode={tnode} renderChild={function (props) {
            if (props.childTnode.tagName === 'br') {
                return <Text_1.default key={props.key}>{'\n'}</Text_1.default>;
            }
            if (props.childTnode.type === 'text' && props.childTnode.tagName !== 'code') {
                return (<Text_1.default key={props.key} style={[
                        props.childTnode.getNativeStyles(),
                        parentStyle,
                        textDecorationLineStyle,
                        styles.textUnderlinePositionUnder,
                        styles.textDecorationSkipInkNone,
                        styles.dInlineFlex,
                    ]}>
                                {props.childTnode.data}
                            </Text_1.default>);
            }
            return props.childElement;
        }}/>
        </AnchorForCommentsOnly_1.default>);
}
AnchorRenderer.displayName = 'AnchorRenderer';
exports.default = AnchorRenderer;
