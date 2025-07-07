"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var ConfirmModal_1 = require("@components/ConfirmModal");
var DelegateNoAccessModalProvider_1 = require("@components/DelegateNoAccessModalProvider");
var ErrorMessageRow_1 = require("@components/ErrorMessageRow");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons_1 = require("@components/Icon/Expensicons");
var LockedAccountModalProvider_1 = require("@components/LockedAccountModalProvider");
var MenuItem_1 = require("@components/MenuItem");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var ValidateCodeActionForm_1 = require("@components/ValidateCodeActionForm");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var blurActiveElement_1 = require("@libs/Accessibility/blurActiveElement");
var User_1 = require("@libs/actions/User");
var Browser_1 = require("@libs/Browser");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PhoneNumber_1 = require("@libs/PhoneNumber");
var Modal_1 = require("@userActions/Modal");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var keyboard_1 = require("@src/utils/keyboard");
function ContactMethodDetailsPage(_a) {
    var _b, _c, _d, _e, _f;
    var route = _a.route;
    var _g = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGIN_LIST, { canBeMissing: true }), loginList = _g[0], loginListResult = _g[1];
    var _h = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true }), session = _h[0], sessionResult = _h[1];
    var _j = (0, useOnyx_1.default)(ONYXKEYS_1.default.MY_DOMAIN_SECURITY_GROUPS, { canBeMissing: true }), myDomainSecurityGroups = _j[0], myDomainSecurityGroupsResult = _j[1];
    var _k = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.SECURITY_GROUP, { canBeMissing: true }), securityGroups = _k[0], securityGroupsResult = _k[1];
    var _l = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_REPORT_DATA, { initialValue: true, canBeMissing: true }), isLoadingReportData = _l[0], isLoadingReportDataResult = _l[1];
    var _m = (0, react_1.useState)(true), isValidateCodeFormVisible = _m[0], setIsValidateCodeFormVisible = _m[1];
    var _o = (0, react_1.useContext)(DelegateNoAccessModalProvider_1.DelegateNoAccessContext), isActingAsDelegate = _o.isActingAsDelegate, showDelegateNoAccessModal = _o.showDelegateNoAccessModal;
    var isLoadingOnyxValues = (0, isLoadingOnyxValue_1.default)(loginListResult, sessionResult, myDomainSecurityGroupsResult, securityGroupsResult, isLoadingReportDataResult);
    var _p = (0, react_1.useContext)(LockedAccountModalProvider_1.LockedAccountContext), isAccountLocked = _p.isAccountLocked, showLockedAccountModal = _p.showLockedAccountModal;
    var _q = (0, useLocalize_1.default)(), formatPhoneNumber = _q.formatPhoneNumber, translate = _q.translate;
    var theme = (0, useTheme_1.default)();
    var themeStyles = (0, useThemeStyles_1.default)();
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var _r = (0, react_1.useState)(false), isDeleteModalOpen = _r[0], setIsDeleteModalOpen = _r[1];
    var validateCodeFormRef = (0, react_1.useRef)(null);
    var backTo = route.params.backTo;
    /**
     * Gets the current contact method from the route params
     */
    var contactMethod = (0, react_1.useMemo)(function () {
        var _a;
        var contactMethodParam = route.params.contactMethod;
        // We find the number of times the url is encoded based on the last % sign and remove them.
        var lastPercentIndex = contactMethodParam.lastIndexOf('%');
        var encodePercents = contactMethodParam.substring(lastPercentIndex).match(new RegExp('25', 'g'));
        var numberEncodePercents = (_a = encodePercents === null || encodePercents === void 0 ? void 0 : encodePercents.length) !== null && _a !== void 0 ? _a : 0;
        var beforeAtSign = contactMethodParam.substring(0, lastPercentIndex).replace(CONST_1.default.REGEX.ENCODE_PERCENT_CHARACTER, function (match) {
            if (numberEncodePercents > 0) {
                numberEncodePercents--;
                return '%';
            }
            return match;
        });
        var afterAtSign = contactMethodParam.substring(lastPercentIndex).replace(CONST_1.default.REGEX.ENCODE_PERCENT_CHARACTER, '%');
        return (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)(decodeURIComponent(beforeAtSign + afterAtSign));
    }, [route.params.contactMethod]);
    var loginData = (0, react_1.useMemo)(function () { return loginList === null || loginList === void 0 ? void 0 : loginList[contactMethod]; }, [loginList, contactMethod]);
    var isDefaultContactMethod = (0, react_1.useMemo)(function () { return (session === null || session === void 0 ? void 0 : session.email) === (loginData === null || loginData === void 0 ? void 0 : loginData.partnerUserID); }, [session === null || session === void 0 ? void 0 : session.email, loginData === null || loginData === void 0 ? void 0 : loginData.partnerUserID]);
    var validateLoginError = (0, ErrorUtils_1.getEarliestErrorField)(loginData, 'validateLogin');
    var prevPendingDeletedLogin = (0, usePrevious_1.default)((_b = loginData === null || loginData === void 0 ? void 0 : loginData.pendingFields) === null || _b === void 0 ? void 0 : _b.deletedLogin);
    /**
     * Attempt to set this contact method as user's "Default contact method"
     */
    var setAsDefault = (0, react_1.useCallback)(function () {
        (0, User_1.setContactMethodAsDefault)(contactMethod, backTo);
    }, [contactMethod, backTo]);
    /**
     * Checks if the user is allowed to change their default contact method. This should only be allowed if:
     * 1. The viewed contact method is not already their default contact method
     * 2. The viewed contact method is validated
     * 3. If the user is on a private domain, their security group must allow primary login switching
     */
    var canChangeDefaultContactMethod = (0, react_1.useMemo)(function () {
        var _a, _b;
        // Cannot set this contact method as default if:
        // 1. This contact method is already their default
        // 2. This contact method is not validated
        if (isDefaultContactMethod || !(loginData === null || loginData === void 0 ? void 0 : loginData.validatedDate)) {
            return false;
        }
        var domainName = expensify_common_1.Str.extractEmailDomain((_a = session === null || session === void 0 ? void 0 : session.email) !== null && _a !== void 0 ? _a : '');
        var primaryDomainSecurityGroupID = myDomainSecurityGroups === null || myDomainSecurityGroups === void 0 ? void 0 : myDomainSecurityGroups[domainName];
        // If there's no security group associated with the user for the primary domain,
        // default to allowing the user to change their default contact method.
        if (!primaryDomainSecurityGroupID) {
            return true;
        }
        // Allow user to change their default contact method if they don't have a security group OR if their security group
        // does NOT restrict primary login switching.
        return !((_b = securityGroups === null || securityGroups === void 0 ? void 0 : securityGroups["".concat(ONYXKEYS_1.default.COLLECTION.SECURITY_GROUP).concat(primaryDomainSecurityGroupID)]) === null || _b === void 0 ? void 0 : _b.hasRestrictedPrimaryLogin);
    }, [isDefaultContactMethod, loginData === null || loginData === void 0 ? void 0 : loginData.validatedDate, session === null || session === void 0 ? void 0 : session.email, myDomainSecurityGroups, securityGroups]);
    /**
     * Toggle delete confirm modal visibility
     */
    var toggleDeleteModal = (0, react_1.useCallback)(function (isOpen) {
        if ((0, DeviceCapabilities_1.canUseTouchScreen)() && isOpen) {
            react_native_1.InteractionManager.runAfterInteractions(function () {
                setIsDeleteModalOpen(isOpen);
            });
            react_native_1.Keyboard.dismiss();
        }
        else {
            setIsDeleteModalOpen(isOpen);
        }
    }, []);
    /**
     * Delete the contact method and hide the modal
     */
    var confirmDeleteAndHideModal = (0, react_1.useCallback)(function () {
        toggleDeleteModal(false);
        (0, User_1.deleteContactMethod)(contactMethod, loginList !== null && loginList !== void 0 ? loginList : {}, backTo);
    }, [contactMethod, loginList, toggleDeleteModal, backTo]);
    var prevValidatedDate = (0, usePrevious_1.default)(loginData === null || loginData === void 0 ? void 0 : loginData.validatedDate);
    (0, react_1.useEffect)(function () {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (prevValidatedDate || !(loginData === null || loginData === void 0 ? void 0 : loginData.validatedDate) || !loginData) {
            return;
        }
        // Navigate to methods page on successful magic code verification
        // validatedDate property is responsible to decide the status of the magic code verification
        Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_CONTACT_METHODS.getRoute(backTo));
    }, [prevValidatedDate, loginData === null || loginData === void 0 ? void 0 : loginData.validatedDate, isDefaultContactMethod, backTo, loginData]);
    (0, react_1.useEffect)(function () {
        setIsValidateCodeFormVisible(!(loginData === null || loginData === void 0 ? void 0 : loginData.validatedDate));
    }, [loginData === null || loginData === void 0 ? void 0 : loginData.validatedDate, (_c = loginData === null || loginData === void 0 ? void 0 : loginData.errorFields) === null || _c === void 0 ? void 0 : _c.addedLogin]);
    (0, react_1.useEffect)(function () {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!loginData || (loginData === null || loginData === void 0 ? void 0 : loginData.validatedDate) || prevPendingDeletedLogin) {
            return;
        }
        (0, User_1.resetContactMethodValidateCodeSentState)(contactMethod);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- The prevPendingDeletedLogin is a ref, so no need to add it to dependencies.
    }, [contactMethod, loginData]);
    var getThreeDotsMenuItems = (0, react_1.useCallback)(function () {
        var menuItems = [];
        if (isValidateCodeFormVisible && !isDefaultContactMethod) {
            menuItems.push({
                icon: Expensicons_1.Trashcan,
                text: translate('common.remove'),
                onSelected: function () { return (0, Modal_1.close)(function () { return toggleDeleteModal(true); }); },
            });
        }
        return menuItems;
    }, [isValidateCodeFormVisible, translate, toggleDeleteModal, isDefaultContactMethod]);
    if (isLoadingOnyxValues || (isLoadingReportData && (0, EmptyObject_1.isEmptyObject)(loginList))) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    if (!contactMethod || !loginData) {
        return (<ScreenWrapper_1.default testID={ContactMethodDetailsPage.displayName}>
                <FullPageNotFoundView_1.default shouldShow linkKey="contacts.goBackContactMethods" onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_CONTACT_METHODS.getRoute(backTo)); }} onLinkPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_CONTACT_METHODS.getRoute(backTo)); }}/>
            </ScreenWrapper_1.default>);
    }
    // Replacing spaces with "hard spaces" to prevent breaking the number
    var formattedContactMethod = expensify_common_1.Str.isSMSLogin(contactMethod) ? formatPhoneNumber(contactMethod) : contactMethod;
    var hasMagicCodeBeenSent = !!loginData.validateCodeSent;
    var isFailedAddContactMethod = !!((_d = loginData.errorFields) === null || _d === void 0 ? void 0 : _d.addedLogin);
    var isFailedRemovedContactMethod = !!((_e = loginData.errorFields) === null || _e === void 0 ? void 0 : _e.deletedLogin);
    var shouldSkipInitialValidation = ((_f = route.params) === null || _f === void 0 ? void 0 : _f.shouldSkipInitialValidation) === 'true';
    var getDeleteConfirmationModal = function () { return (<ConfirmModal_1.default title={translate('contacts.removeContactMethod')} onConfirm={confirmDeleteAndHideModal} onCancel={function () { return toggleDeleteModal(false); }} onModalHide={function () {
            react_native_1.InteractionManager.runAfterInteractions(function () {
                var _a, _b;
                (_b = (_a = validateCodeFormRef.current) === null || _a === void 0 ? void 0 : _a.focusLastSelected) === null || _b === void 0 ? void 0 : _b.call(_a);
            });
        }} prompt={translate('contacts.removeAreYouSure')} confirmText={translate('common.yesContinue')} cancelText={translate('common.cancel')} isVisible={isDeleteModalOpen && !isDefaultContactMethod} danger/>); };
    var getMenuItems = function () {
        var _a, _b;
        return (<>
            {canChangeDefaultContactMethod ? (<OfflineWithFeedback_1.default errors={(0, ErrorUtils_1.getLatestErrorField)(loginData, 'defaultLogin')} errorRowStyles={[themeStyles.ml8, themeStyles.mr5]} onClose={function () { return (0, User_1.clearContactMethodErrors)(contactMethod, 'defaultLogin'); }}>
                    <MenuItem_1.default title={translate('contacts.setAsDefault')} icon={Expensicons_1.Star} onPress={isAccountLocked ? showLockedAccountModal : setAsDefault}/>
                </OfflineWithFeedback_1.default>) : null}
            {isDefaultContactMethod ? (<OfflineWithFeedback_1.default pendingAction={(_a = loginData.pendingFields) === null || _a === void 0 ? void 0 : _a.defaultLogin} errors={(0, ErrorUtils_1.getLatestErrorField)(loginData, isFailedRemovedContactMethod ? 'deletedLogin' : 'defaultLogin')} errorRowStyles={[themeStyles.ml8, themeStyles.mr5]} onClose={function () { return (0, User_1.clearContactMethodErrors)(contactMethod, isFailedRemovedContactMethod ? 'deletedLogin' : 'defaultLogin'); }}>
                    <Text_1.default style={[themeStyles.ph5, themeStyles.mv3]}>{translate('contacts.yourDefaultContactMethod')}</Text_1.default>
                </OfflineWithFeedback_1.default>) : (<OfflineWithFeedback_1.default pendingAction={(_b = loginData.pendingFields) === null || _b === void 0 ? void 0 : _b.deletedLogin} errors={(0, ErrorUtils_1.getLatestErrorField)(loginData, 'deletedLogin')} errorRowStyles={[themeStyles.mt6, themeStyles.ph5]} onClose={function () { return (0, User_1.clearContactMethodErrors)(contactMethod, 'deletedLogin'); }}>
                    <MenuItem_1.default title={translate('common.remove')} icon={Expensicons_1.Trashcan} iconFill={theme.danger} onPress={function () {
                    if (isActingAsDelegate) {
                        showDelegateNoAccessModal();
                        return;
                    }
                    if (isAccountLocked) {
                        showLockedAccountModal();
                        return;
                    }
                    toggleDeleteModal(true);
                }}/>
                </OfflineWithFeedback_1.default>)}
        </>);
    };
    return (<ScreenWrapper_1.default shouldEnableMaxHeight onEntryTransitionEnd={function () {
            react_native_1.InteractionManager.runAfterInteractions(function () {
                var _a, _b;
                (_b = (_a = validateCodeFormRef.current) === null || _a === void 0 ? void 0 : _a.focus) === null || _b === void 0 ? void 0 : _b.call(_a);
            });
        }} testID={ContactMethodDetailsPage.displayName} focusTrapSettings={{
            focusTrapOptions: (0, Browser_1.isMobileSafari)()
                ? undefined
                : {
                    // We need to check this because focusing the input form interferes with the transition animation:
                    // https://github.com/Expensify/App/issues/53884#issuecomment-2594568960
                    checkCanFocusTrap: function (trapContainers) {
                        return new Promise(function (resolve) {
                            var interval = setInterval(function () {
                                var trapContainer = trapContainers.at(0);
                                if (!trapContainer || getComputedStyle(trapContainer).visibility !== 'hidden') {
                                    resolve();
                                    clearInterval(interval);
                                }
                            }, 5);
                        });
                    },
                },
        }}>
            <HeaderWithBackButton_1.default title={formattedContactMethod} threeDotsMenuItems={getThreeDotsMenuItems()} shouldShowThreeDotsButton={getThreeDotsMenuItems().length > 0} shouldOverlayDots threeDotsAnchorPosition={themeStyles.threeDotsPopoverOffset(windowWidth)} onThreeDotsButtonPress={function () {
            // Hide the keyboard when the user clicks the three-dot menu.
            // Use blurActiveElement() for mWeb and KeyboardUtils.dismiss() for native apps.
            (0, blurActiveElement_1.default)();
            keyboard_1.default.dismiss();
        }}/>
            <ScrollView_1.default keyboardShouldPersistTaps="handled" contentContainerStyle={themeStyles.flexGrow1} style={[themeStyles.w100, themeStyles.h100, themeStyles.flex1]}>
                {isFailedAddContactMethod && (<ErrorMessageRow_1.default errors={(0, ErrorUtils_1.getLatestErrorField)(loginData, 'addedLogin')} errorRowStyles={[themeStyles.mh5, themeStyles.mv3]} onClose={function () {
                (0, User_1.clearContactMethod)(contactMethod);
                (0, User_1.clearUnvalidatedNewContactMethodAction)();
                Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_CONTACT_METHODS.getRoute(backTo));
            }} canDismissError/>)}
                {isValidateCodeFormVisible && !!loginData && !loginData.validatedDate && (<ValidateCodeActionForm_1.default hasMagicCodeBeenSent={hasMagicCodeBeenSent} handleSubmitForm={function (validateCode) { return (0, User_1.validateSecondaryLogin)(loginList, contactMethod, validateCode); }} validateError={!(0, EmptyObject_1.isEmptyObject)(validateLoginError) ? validateLoginError : (0, ErrorUtils_1.getLatestErrorField)(loginData, 'validateCodeSent')} clearError={function () { return (0, User_1.clearContactMethodErrors)(contactMethod, !(0, EmptyObject_1.isEmptyObject)(validateLoginError) ? 'validateLogin' : 'validateCodeSent'); }} sendValidateCode={function () { return (0, User_1.requestContactMethodValidateCode)(contactMethod); }} descriptionPrimary={translate('contacts.enterMagicCode', { contactMethod: formattedContactMethod })} forwardedRef={validateCodeFormRef} shouldSkipInitialValidation={shouldSkipInitialValidation}/>)}

                {!isValidateCodeFormVisible && !!loginData.validatedDate && getMenuItems()}
                {getDeleteConfirmationModal()}
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
ContactMethodDetailsPage.displayName = 'ContactMethodDetailsPage';
exports.default = ContactMethodDetailsPage;
