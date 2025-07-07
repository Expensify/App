"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var AvatarWithDisplayName_1 = require("@components/AvatarWithDisplayName");
var Header_1 = require("@components/Header");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PinButton_1 = require("@components/PinButton");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var SearchButton_1 = require("@components/Search/SearchRouter/SearchButton");
var HelpButton_1 = require("@components/SidePanel/HelpComponents/HelpButton");
var ThreeDotsMenu_1 = require("@components/ThreeDotsMenu");
var Tooltip_1 = require("@components/Tooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useThrottledButtonState_1 = require("@hooks/useThrottledButtonState");
var getButtonState_1 = require("@libs/getButtonState");
var Navigation_1 = require("@libs/Navigation/Navigation");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function HeaderWithBackButton(_a) {
    var icon = _a.icon, iconFill = _a.iconFill, iconWidth = _a.iconWidth, iconHeight = _a.iconHeight, iconStyles = _a.iconStyles, _b = _a.onBackButtonPress, onBackButtonPress = _b === void 0 ? function () { return Navigation_1.default.goBack(); } : _b, _c = _a.onCloseButtonPress, onCloseButtonPress = _c === void 0 ? function () { return Navigation_1.default.dismissModal(); } : _c, _d = _a.onDownloadButtonPress, onDownloadButtonPress = _d === void 0 ? function () { } : _d, _e = _a.onThreeDotsButtonPress, onThreeDotsButtonPress = _e === void 0 ? function () { } : _e, report = _a.report, policy = _a.policy, policyAvatar = _a.policyAvatar, _f = _a.shouldShowReportAvatarWithDisplay, shouldShowReportAvatarWithDisplay = _f === void 0 ? false : _f, _g = _a.shouldShowBackButton, shouldShowBackButton = _g === void 0 ? true : _g, _h = _a.shouldShowBorderBottom, shouldShowBorderBottom = _h === void 0 ? false : _h, _j = _a.shouldShowCloseButton, shouldShowCloseButton = _j === void 0 ? false : _j, _k = _a.shouldShowDownloadButton, shouldShowDownloadButton = _k === void 0 ? false : _k, _l = _a.isDownloading, isDownloading = _l === void 0 ? false : _l, _m = _a.shouldShowPinButton, shouldShowPinButton = _m === void 0 ? false : _m, _o = _a.shouldSetModalVisibility, shouldSetModalVisibility = _o === void 0 ? true : _o, _p = _a.shouldShowThreeDotsButton, shouldShowThreeDotsButton = _p === void 0 ? false : _p, _q = _a.shouldDisableThreeDotsButton, shouldDisableThreeDotsButton = _q === void 0 ? false : _q, _r = _a.shouldUseHeadlineHeader, shouldUseHeadlineHeader = _r === void 0 ? false : _r, stepCounter = _a.stepCounter, _s = _a.subtitle, subtitle = _s === void 0 ? '' : _s, _t = _a.title, title = _t === void 0 ? '' : _t, titleColor = _a.titleColor, _u = _a.threeDotsAnchorPosition, threeDotsAnchorPosition = _u === void 0 ? {
        vertical: 0,
        horizontal: 0,
    } : _u, _v = _a.threeDotsAnchorAlignment, threeDotsAnchorAlignment = _v === void 0 ? {
        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
    } : _v, _w = _a.threeDotsMenuItems, threeDotsMenuItems = _w === void 0 ? [] : _w, threeDotsMenuIcon = _a.threeDotsMenuIcon, threeDotsMenuIconFill = _a.threeDotsMenuIconFill, _x = _a.shouldEnableDetailPageNavigation, shouldEnableDetailPageNavigation = _x === void 0 ? false : _x, _y = _a.children, children = _y === void 0 ? null : _y, _z = _a.shouldOverlayDots, shouldOverlayDots = _z === void 0 ? false : _z, _0 = _a.shouldOverlay, shouldOverlay = _0 === void 0 ? false : _0, _1 = _a.shouldNavigateToTopMostReport, shouldNavigateToTopMostReport = _1 === void 0 ? false : _1, _2 = _a.shouldDisplayHelpButton, shouldDisplayHelpButton = _2 === void 0 ? true : _2, _3 = _a.shouldDisplaySearchRouter, shouldDisplaySearchRouter = _3 === void 0 ? false : _3, progressBarPercentage = _a.progressBarPercentage, style = _a.style, _4 = _a.subTitleLink, subTitleLink = _4 === void 0 ? '' : _4, _5 = _a.shouldMinimizeMenuButton, shouldMinimizeMenuButton = _5 === void 0 ? false : _5, _6 = _a.openParentReportInCurrentTab, openParentReportInCurrentTab = _6 === void 0 ? false : _6;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _7 = (0, useThrottledButtonState_1.default)(), isDownloadButtonActive = _7[0], temporarilyDisableDownloadButton = _7[1];
    var translate = (0, useLocalize_1.default)().translate;
    var middleContent = (0, react_1.useMemo)(function () {
        if (progressBarPercentage) {
            return (<>
                    {/* Reserves as much space for the middleContent as possible */}
                    <react_native_1.View style={styles.flexGrow1}/>
                    {/* Uses absolute positioning so that it's always centered instead of being affected by the
                presence or absence of back/close buttons to the left/right of it */}
                    <react_native_1.View style={styles.headerProgressBarContainer}>
                        <react_native_1.View style={styles.headerProgressBar}>
                            <react_native_1.View style={[{ width: "".concat(progressBarPercentage, "%") }, styles.headerProgressBarFill]}/>
                        </react_native_1.View>
                    </react_native_1.View>
                </>);
        }
        if (shouldShowReportAvatarWithDisplay) {
            return (<AvatarWithDisplayName_1.default report={report} policy={policy} shouldEnableDetailPageNavigation={shouldEnableDetailPageNavigation} openParentReportInCurrentTab={openParentReportInCurrentTab}/>);
        }
        return (<Header_1.default title={title} subtitle={stepCounter ? translate('stepCounter', stepCounter) : subtitle} textStyles={[titleColor ? StyleUtils.getTextColorStyle(titleColor) : {}, shouldUseHeadlineHeader && styles.textHeadlineH2]} subTitleLink={subTitleLink} numberOfTitleLines={1}/>);
    }, [
        StyleUtils,
        subTitleLink,
        shouldUseHeadlineHeader,
        policy,
        progressBarPercentage,
        report,
        shouldEnableDetailPageNavigation,
        shouldShowReportAvatarWithDisplay,
        stepCounter,
        styles.flexGrow1,
        styles.headerProgressBar,
        styles.headerProgressBarContainer,
        styles.headerProgressBarFill,
        styles.textHeadlineH2,
        subtitle,
        title,
        titleColor,
        translate,
        openParentReportInCurrentTab,
    ]);
    var ThreeDotMenuButton = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e;
        if (shouldShowThreeDotsButton) {
            return threeDotsMenuItems.length === 1 && shouldMinimizeMenuButton ? (<Tooltip_1.default text={(_a = threeDotsMenuItems.at(0)) === null || _a === void 0 ? void 0 : _a.text}>
                    <PressableWithoutFeedback_1.default onPress={(_b = threeDotsMenuItems.at(0)) === null || _b === void 0 ? void 0 : _b.onSelected} style={[styles.touchableButtonImage]} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={(_d = (_c = threeDotsMenuItems.at(0)) === null || _c === void 0 ? void 0 : _c.text) !== null && _d !== void 0 ? _d : ''}>
                        <Icon_1.default src={(_e = threeDotsMenuItems.at(0)) === null || _e === void 0 ? void 0 : _e.icon} fill={theme.icon}/>
                    </PressableWithoutFeedback_1.default>
                </Tooltip_1.default>) : (<ThreeDotsMenu_1.default icon={threeDotsMenuIcon} iconFill={threeDotsMenuIconFill} disabled={shouldDisableThreeDotsButton} menuItems={threeDotsMenuItems} onIconPress={onThreeDotsButtonPress} anchorPosition={threeDotsAnchorPosition} shouldOverlay={shouldOverlayDots} anchorAlignment={threeDotsAnchorAlignment} shouldSetModalVisibility={shouldSetModalVisibility}/>);
        }
        return null;
    }, [
        onThreeDotsButtonPress,
        shouldDisableThreeDotsButton,
        shouldOverlayDots,
        shouldSetModalVisibility,
        shouldShowThreeDotsButton,
        styles.touchableButtonImage,
        theme.icon,
        threeDotsAnchorAlignment,
        threeDotsAnchorPosition,
        threeDotsMenuIcon,
        threeDotsMenuIconFill,
        threeDotsMenuItems,
        shouldMinimizeMenuButton,
    ]);
    return (<react_native_1.View 
    // Hover on some part of close icons will not work on Electron if dragArea is true
    // https://github.com/Expensify/App/issues/29598
    dataSet={{ dragArea: false }} style={[
            styles.headerBar,
            shouldUseHeadlineHeader && styles.headerBarHeight,
            shouldShowBorderBottom && styles.borderBottom,
            // progressBarPercentage can be 0 which would
            // be falsy, hence using !== undefined explicitly
            progressBarPercentage !== undefined && styles.pl0,
            shouldShowBackButton && [styles.pl2],
            shouldOverlay && react_native_1.StyleSheet.absoluteFillObject,
            style,
        ]}>
            <react_native_1.View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden, styles.mr3]}>
                {shouldShowBackButton && (<Tooltip_1.default text={translate('common.back')}>
                        <PressableWithoutFeedback_1.default onPress={function () {
                if (react_native_1.Keyboard.isVisible()) {
                    react_native_1.Keyboard.dismiss();
                }
                var topmostReportId = Navigation_1.default.getTopmostReportId();
                if (shouldNavigateToTopMostReport && topmostReportId) {
                    Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(topmostReportId));
                }
                else {
                    onBackButtonPress();
                }
            }} style={[styles.touchableButtonImage]} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('common.back')} id={CONST_1.default.BACK_BUTTON_NATIVE_ID}>
                            <Icon_1.default src={Expensicons.BackArrow} fill={iconFill !== null && iconFill !== void 0 ? iconFill : theme.icon}/>
                        </PressableWithoutFeedback_1.default>
                    </Tooltip_1.default>)}
                {!!icon && (<Icon_1.default src={icon} width={iconWidth !== null && iconWidth !== void 0 ? iconWidth : variables_1.default.iconHeader} height={iconHeight !== null && iconHeight !== void 0 ? iconHeight : variables_1.default.iconHeader} additionalStyles={[styles.mr2, iconStyles]} fill={iconFill}/>)}
                {!!policyAvatar && (<Avatar_1.default containerStyles={[StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(CONST_1.default.AVATAR_SIZE.DEFAULT)), styles.mr3]} source={policyAvatar === null || policyAvatar === void 0 ? void 0 : policyAvatar.source} name={policyAvatar === null || policyAvatar === void 0 ? void 0 : policyAvatar.name} avatarID={policyAvatar === null || policyAvatar === void 0 ? void 0 : policyAvatar.id} type={policyAvatar === null || policyAvatar === void 0 ? void 0 : policyAvatar.type}/>)}
                {middleContent}
                <react_native_1.View style={[styles.reportOptions, styles.flexRow, styles.alignItemsCenter]}>
                    <react_native_1.View style={[styles.pr2, styles.flexRow, styles.alignItemsCenter]}>
                        {children}
                        {shouldShowDownloadButton &&
            (!isDownloading ? (<Tooltip_1.default text={translate('common.download')}>
                                    <PressableWithoutFeedback_1.default onPress={function (event) {
                    var _a;
                    // Blur the pressable in case this button triggers a Growl notification
                    // We do not want to overlap Growl with the Tooltip (#15271)
                    (_a = event === null || event === void 0 ? void 0 : event.currentTarget) === null || _a === void 0 ? void 0 : _a.blur();
                    if (!isDownloadButtonActive) {
                        return;
                    }
                    onDownloadButtonPress();
                    temporarilyDisableDownloadButton();
                }} style={[styles.touchableButtonImage]} role="button" accessibilityLabel={translate('common.download')}>
                                        <Icon_1.default src={Expensicons.Download} fill={iconFill !== null && iconFill !== void 0 ? iconFill : StyleUtils.getIconFillColor((0, getButtonState_1.default)(false, false, !isDownloadButtonActive))}/>
                                    </PressableWithoutFeedback_1.default>
                                </Tooltip_1.default>) : (<react_native_1.ActivityIndicator style={[styles.touchableButtonImage]} size="small" color={theme.spinner}/>))}
                        {shouldShowPinButton && !!report && <PinButton_1.default report={report}/>}
                    </react_native_1.View>
                    {ThreeDotMenuButton}
                    {shouldShowCloseButton && (<Tooltip_1.default text={translate('common.close')}>
                            <PressableWithoutFeedback_1.default onPress={onCloseButtonPress} style={[styles.touchableButtonImage]} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('common.close')}>
                                <Icon_1.default src={Expensicons.Close} fill={iconFill !== null && iconFill !== void 0 ? iconFill : theme.icon}/>
                            </PressableWithoutFeedback_1.default>
                        </Tooltip_1.default>)}
                </react_native_1.View>
                {shouldDisplayHelpButton && <HelpButton_1.default />}
                {shouldDisplaySearchRouter && <SearchButton_1.default />}
            </react_native_1.View>
        </react_native_1.View>);
}
HeaderWithBackButton.displayName = 'HeaderWithBackButton';
exports.default = HeaderWithBackButton;
