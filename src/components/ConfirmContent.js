"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var Button_1 = require("./Button");
var Header_1 = require("./Header");
var Icon_1 = require("./Icon");
var Expensicons_1 = require("./Icon/Expensicons");
var ImageSVG_1 = require("./ImageSVG");
var Pressable_1 = require("./Pressable");
var Text_1 = require("./Text");
var Tooltip_1 = require("./Tooltip");
function ConfirmContent(_a) {
    var title = _a.title, onConfirm = _a.onConfirm, _b = _a.onCancel, onCancel = _b === void 0 ? function () { } : _b, _c = _a.confirmText, confirmText = _c === void 0 ? '' : _c, _d = _a.cancelText, cancelText = _d === void 0 ? '' : _d, _e = _a.prompt, prompt = _e === void 0 ? '' : _e, _f = _a.success, success = _f === void 0 ? true : _f, _g = _a.danger, danger = _g === void 0 ? false : _g, _h = _a.shouldDisableConfirmButtonWhenOffline, shouldDisableConfirmButtonWhenOffline = _h === void 0 ? false : _h, _j = _a.shouldShowCancelButton, shouldShowCancelButton = _j === void 0 ? false : _j, iconSource = _a.iconSource, iconFill = _a.iconFill, _k = _a.shouldCenterContent, shouldCenterContent = _k === void 0 ? false : _k, _l = _a.shouldStackButtons, shouldStackButtons = _l === void 0 ? true : _l, titleStyles = _a.titleStyles, promptStyles = _a.promptStyles, contentStyles = _a.contentStyles, iconAdditionalStyles = _a.iconAdditionalStyles, _m = _a.iconWidth, iconWidth = _m === void 0 ? variables_1.default.appModalAppIconSize : _m, _o = _a.iconHeight, iconHeight = _o === void 0 ? variables_1.default.appModalAppIconSize : _o, _p = _a.shouldCenterIcon, shouldCenterIcon = _p === void 0 ? false : _p, _q = _a.shouldShowDismissIcon, shouldShowDismissIcon = _q === void 0 ? false : _q, image = _a.image, imageStyles = _a.imageStyles, titleContainerStyles = _a.titleContainerStyles, _r = _a.shouldReverseStackedButtons, shouldReverseStackedButtons = _r === void 0 ? false : _r, isVisible = _a.isVisible, isConfirmLoading = _a.isConfirmLoading;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isCentered = shouldCenterContent;
    return (<>
            {!!image && (<react_native_1.View style={imageStyles}>
                    <ImageSVG_1.default contentFit="contain" src={image} height={CONST_1.default.CONFIRM_CONTENT_SVG_SIZE.HEIGHT} width={CONST_1.default.CONFIRM_CONTENT_SVG_SIZE.WIDTH} style={styles.alignSelfCenter}/>
                </react_native_1.View>)}

            <react_native_1.View style={[styles.m5, contentStyles]}>
                {shouldShowDismissIcon && (<react_native_1.View style={styles.alignItemsEnd}>
                        <Tooltip_1.default text={translate('common.close')}>
                            <Pressable_1.PressableWithoutFeedback onPress={onCancel} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('common.close')}>
                                <Icon_1.default fill={theme.icon} src={Expensicons_1.Close}/>
                            </Pressable_1.PressableWithoutFeedback>
                        </Tooltip_1.default>
                    </react_native_1.View>)}
                <react_native_1.View style={isCentered ? [styles.alignItemsCenter, styles.mb6] : []}>
                    {!!iconSource && (<react_native_1.View style={[shouldCenterIcon ? styles.justifyContentCenter : null, styles.flexRow, styles.mb3]}>
                            <Icon_1.default src={iconSource} fill={iconFill === false ? undefined : (iconFill !== null && iconFill !== void 0 ? iconFill : theme.icon)} width={iconWidth} height={iconHeight} additionalStyles={iconAdditionalStyles}/>
                        </react_native_1.View>)}
                    <react_native_1.View style={[styles.flexRow, isCentered ? {} : styles.mb4, titleContainerStyles]}>
                        <Header_1.default title={title} textStyles={titleStyles}/>
                    </react_native_1.View>
                    {typeof prompt === 'string' ? <Text_1.default style={[promptStyles, isCentered ? styles.textAlignCenter : {}]}>{prompt}</Text_1.default> : prompt}
                </react_native_1.View>

                {shouldStackButtons ? (<>
                        {shouldShowCancelButton && shouldReverseStackedButtons && (<Button_1.default style={[styles.mt4, styles.noSelect]} onPress={onCancel} large text={cancelText || translate('common.no')}/>)}
                        <Button_1.default success={success} danger={danger} style={shouldReverseStackedButtons ? styles.mt3 : styles.mt4} onPress={onConfirm} pressOnEnter isPressOnEnterActive={isVisible} large text={confirmText || translate('common.yes')} accessibilityLabel={confirmText || translate('common.yes')} isDisabled={isOffline && shouldDisableConfirmButtonWhenOffline} isLoading={isConfirmLoading}/>
                        {shouldShowCancelButton && !shouldReverseStackedButtons && (<Button_1.default style={[styles.mt3, styles.noSelect]} onPress={onCancel} large text={cancelText || translate('common.no')}/>)}
                    </>) : (<react_native_1.View style={[styles.flexRow, styles.gap4]}>
                        {shouldShowCancelButton && (<Button_1.default style={[styles.noSelect, styles.flex1]} onPress={onCancel} text={cancelText || translate('common.no')}/>)}
                        <Button_1.default success={success} danger={danger} style={[styles.flex1]} onPress={onConfirm} pressOnEnter isPressOnEnterActive={isVisible} text={confirmText || translate('common.yes')} isDisabled={isOffline && shouldDisableConfirmButtonWhenOffline} isLoading={isConfirmLoading}/>
                    </react_native_1.View>)}
            </react_native_1.View>
        </>);
}
ConfirmContent.displayName = 'ConfirmContent';
exports.default = ConfirmContent;
