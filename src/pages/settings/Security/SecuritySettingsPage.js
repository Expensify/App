"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debounce_1 = require("lodash/debounce");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var DelegateNoAccessModalProvider_1 = require("@components/DelegateNoAccessModalProvider");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var LockedAccountModalProvider_1 = require("@components/LockedAccountModalProvider");
var LottieAnimations_1 = require("@components/LottieAnimations");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemList_1 = require("@components/MenuItemList");
var OnyxProvider_1 = require("@components/OnyxProvider");
var PopoverMenu_1 = require("@components/PopoverMenu");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWaitForNavigation_1 = require("@hooks/useWaitForNavigation");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var Delegate_1 = require("@libs/actions/Delegate");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var getClickedTargetLocation_1 = require("@libs/getClickedTargetLocation");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var Modal_1 = require("@userActions/Modal");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function SecuritySettingsPage() {
    var _a, _b, _c, _d, _e, _f;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var waitForNavigate = (0, useWaitForNavigation_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var isUserValidated = account === null || account === void 0 ? void 0 : account.validated;
    var delegateButtonRef = (0, react_1.useRef)(null);
    var _g = (0, react_1.useState)(false), shouldShowDelegatePopoverMenu = _g[0], setShouldShowDelegatePopoverMenu = _g[1];
    var _h = (0, react_1.useState)(false), shouldShowRemoveDelegateModal = _h[0], setShouldShowRemoveDelegateModal = _h[1];
    var _j = (0, react_1.useState)(), selectedDelegate = _j[0], setSelectedDelegate = _j[1];
    var _k = (0, react_1.useState)(), selectedEmail = _k[0], setSelectedEmail = _k[1];
    var errorFields = (_b = (_a = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _a === void 0 ? void 0 : _a.errorFields) !== null && _b !== void 0 ? _b : {};
    var _l = (0, react_1.useState)({
        horizontal: 0,
        vertical: 0,
    }), anchorPosition = _l[0], setAnchorPosition = _l[1];
    var _m = (0, react_1.useContext)(LockedAccountModalProvider_1.LockedAccountContext), isAccountLocked = _m.isAccountLocked, showLockedAccountModal = _m.showLockedAccountModal;
    var _o = (0, react_1.useContext)(DelegateNoAccessModalProvider_1.DelegateNoAccessContext), isActingAsDelegate = _o.isActingAsDelegate, showDelegateNoAccessModal = _o.showDelegateNoAccessModal;
    var delegates = (_d = (_c = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _c === void 0 ? void 0 : _c.delegates) !== null && _d !== void 0 ? _d : [];
    var delegators = (_f = (_e = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _e === void 0 ? void 0 : _e.delegators) !== null && _f !== void 0 ? _f : [];
    var hasDelegates = delegates.length > 0;
    var hasDelegators = delegators.length > 0;
    var setMenuPosition = (0, react_1.useCallback)(function () {
        if (!delegateButtonRef.current) {
            return;
        }
        var position = (0, getClickedTargetLocation_1.default)(delegateButtonRef.current);
        setAnchorPosition({
            horizontal: position.right - position.left,
            vertical: position.y + position.height,
        });
    }, [delegateButtonRef]);
    var showPopoverMenu = function (nativeEvent, delegate) {
        delegateButtonRef.current = nativeEvent === null || nativeEvent === void 0 ? void 0 : nativeEvent.currentTarget;
        setMenuPosition();
        setShouldShowDelegatePopoverMenu(true);
        setSelectedDelegate(delegate);
        setSelectedEmail(delegate.email);
    };
    (0, react_1.useLayoutEffect)(function () {
        var popoverPositionListener = react_native_1.Dimensions.addEventListener('change', function () {
            (0, debounce_1.default)(setMenuPosition, CONST_1.default.TIMING.RESIZE_DEBOUNCE_TIME)();
        });
        return function () {
            if (!popoverPositionListener) {
                return;
            }
            popoverPositionListener.remove();
        };
    }, [setMenuPosition]);
    var securityMenuItems = (0, react_1.useMemo)(function () {
        var baseMenuItems = [
            {
                translationKey: 'twoFactorAuth.headerTitle',
                icon: Expensicons.Shield,
                action: function () {
                    if (isActingAsDelegate) {
                        showDelegateNoAccessModal();
                        return;
                    }
                    if (isAccountLocked) {
                        showLockedAccountModal();
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_2FA_ROOT.getRoute());
                },
            },
        ];
        if (isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MERGE_ACCOUNTS)) {
            baseMenuItems.push({
                translationKey: 'mergeAccountsPage.mergeAccount',
                icon: Expensicons.ArrowCollapse,
                action: function () {
                    if (isActingAsDelegate) {
                        showDelegateNoAccessModal();
                        return;
                    }
                    if (isAccountLocked) {
                        showLockedAccountModal();
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_MERGE_ACCOUNTS.route);
                },
            });
        }
        if (isAccountLocked) {
            baseMenuItems.push({
                translationKey: 'lockAccountPage.unlockAccount',
                icon: Expensicons.UserLock,
                action: waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_UNLOCK_ACCOUNT); }),
            });
        }
        else {
            baseMenuItems.push({
                translationKey: 'lockAccountPage.reportSuspiciousActivity',
                icon: Expensicons.UserLock,
                action: waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_LOCK_ACCOUNT); }),
            });
        }
        baseMenuItems.push({
            translationKey: 'closeAccountPage.closeAccount',
            icon: Expensicons.ClosedSign,
            action: function () {
                if (isActingAsDelegate) {
                    showDelegateNoAccessModal();
                    return;
                }
                if (isAccountLocked) {
                    showLockedAccountModal();
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_CLOSE);
            },
        });
        return baseMenuItems.map(function (item) { return ({
            key: item.translationKey,
            title: translate(item.translationKey),
            icon: item.icon,
            onPress: item.action,
            shouldShowRightIcon: true,
            link: '',
            wrapperStyle: [styles.sectionMenuItemTopDescription],
        }); });
    }, [translate, waitForNavigate, styles, isActingAsDelegate, showDelegateNoAccessModal, isBetaEnabled, isAccountLocked, showLockedAccountModal]);
    var delegateMenuItems = (0, react_1.useMemo)(function () {
        return delegates
            .filter(function (d) { return !d.optimisticAccountID; })
            .map(function (_a) {
            var _b, _c, _d, _e;
            var email = _a.email, role = _a.role, pendingAction = _a.pendingAction, pendingFields = _a.pendingFields;
            var personalDetail = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(email);
            var addDelegateErrors = (_b = errorFields === null || errorFields === void 0 ? void 0 : errorFields.addDelegate) === null || _b === void 0 ? void 0 : _b[email];
            var error = (0, ErrorUtils_1.getLatestError)(addDelegateErrors);
            var onPress = function (e) {
                if ((0, EmptyObject_1.isEmptyObject)(pendingAction)) {
                    showPopoverMenu(e, { email: email, role: role });
                    return;
                }
                if (!role) {
                    Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_DELEGATE_ROLE.getRoute(email));
                    return;
                }
                if ((pendingFields === null || pendingFields === void 0 ? void 0 : pendingFields.role) && !(pendingFields === null || pendingFields === void 0 ? void 0 : pendingFields.email)) {
                    Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_UPDATE_DELEGATE_ROLE.getRoute(email, role));
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_DELEGATE_CONFIRM.getRoute(email, role, true));
            };
            var formattedEmail = (0, LocalePhoneNumber_1.formatPhoneNumber)(email);
            return {
                title: (_c = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.displayName) !== null && _c !== void 0 ? _c : formattedEmail,
                description: (personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.displayName) ? formattedEmail : '',
                badgeText: translate('delegate.role', { role: role }),
                avatarID: (_d = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) !== null && _d !== void 0 ? _d : CONST_1.default.DEFAULT_NUMBER_ID,
                icon: (_e = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.avatar) !== null && _e !== void 0 ? _e : Expensicons_1.FallbackAvatar,
                iconType: CONST_1.default.ICON_TYPE_AVATAR,
                numberOfLinesDescription: 1,
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                iconRight: Expensicons.ThreeDots,
                shouldShowRightIcon: true,
                pendingAction: pendingAction,
                shouldForceOpacity: !!pendingAction,
                onPendingActionDismiss: function () { return (0, Delegate_1.clearDelegateErrorsByField)(email, 'addDelegate'); },
                error: error,
                onPress: onPress,
                success: selectedEmail === email,
            };
        });
    }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    [delegates, translate, styles, personalDetails, errorFields, windowWidth, selectedEmail]);
    var delegatorMenuItems = (0, react_1.useMemo)(function () {
        return delegators.map(function (_a) {
            var _b, _c, _d;
            var email = _a.email, role = _a.role;
            var personalDetail = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(email);
            var formattedEmail = (0, LocalePhoneNumber_1.formatPhoneNumber)(email);
            return {
                title: (_b = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.displayName) !== null && _b !== void 0 ? _b : formattedEmail,
                description: (personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.displayName) ? formattedEmail : '',
                badgeText: translate('delegate.role', { role: role }),
                avatarID: (_c = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID,
                icon: (_d = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.avatar) !== null && _d !== void 0 ? _d : Expensicons_1.FallbackAvatar,
                iconType: CONST_1.default.ICON_TYPE_AVATAR,
                numberOfLinesDescription: 1,
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                interactive: false,
            };
        });
    }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    [delegators, styles, translate, personalDetails]);
    var delegatePopoverMenuItems = [
        {
            text: translate('delegate.changeAccessLevel'),
            icon: Expensicons.Pencil,
            onPress: function () {
                var _a, _b;
                if (isActingAsDelegate) {
                    (0, Modal_1.close)(function () { return showDelegateNoAccessModal(); });
                    return;
                }
                if (isAccountLocked) {
                    (0, Modal_1.close)(function () { return showLockedAccountModal(); });
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_UPDATE_DELEGATE_ROLE.getRoute((_a = selectedDelegate === null || selectedDelegate === void 0 ? void 0 : selectedDelegate.email) !== null && _a !== void 0 ? _a : '', (_b = selectedDelegate === null || selectedDelegate === void 0 ? void 0 : selectedDelegate.role) !== null && _b !== void 0 ? _b : ''));
                setShouldShowDelegatePopoverMenu(false);
                setSelectedDelegate(undefined);
                setSelectedEmail(undefined);
            },
        },
        {
            text: translate('delegate.removeCopilot'),
            icon: Expensicons.Trashcan,
            onPress: function () {
                if (isActingAsDelegate) {
                    (0, Modal_1.close)(function () { return showDelegateNoAccessModal(); });
                    return;
                }
                if (isAccountLocked) {
                    (0, Modal_1.close)(function () { return showLockedAccountModal(); });
                    return;
                }
                (0, Modal_1.close)(function () {
                    setShouldShowDelegatePopoverMenu(false);
                    setShouldShowRemoveDelegateModal(true);
                    setSelectedEmail(undefined);
                });
            },
        },
    ];
    (0, react_1.useEffect)(function () {
        (0, Delegate_1.openSecuritySettingsPage)();
    }, []);
    return (<ScreenWrapper_1.default testID={SecuritySettingsPage.displayName} includeSafeAreaPaddingBottom={false} shouldEnablePickerAvoiding={false} shouldShowOfflineIndicatorInWideScreen>
            {function (_a) {
            var safeAreaPaddingBottomStyle = _a.safeAreaPaddingBottomStyle;
            return (<>
                    <HeaderWithBackButton_1.default title={translate('initialSettingsPage.security')} shouldShowBackButton={shouldUseNarrowLayout} onBackButtonPress={Navigation_1.default.popToSidebar} icon={Illustrations.LockClosed} shouldUseHeadlineHeader shouldDisplaySearchRouter/>
                    <ScrollView_1.default contentContainerStyle={styles.pt3}>
                        <react_native_1.View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                            <Section_1.default title={translate('securityPage.title')} subtitle={translate('securityPage.subtitle')} isCentralPane subtitleMuted illustration={LottieAnimations_1.default.Safe} titleStyles={styles.accountSettingsSectionTitle} childrenStyles={styles.pt5}>
                                <MenuItemList_1.default menuItems={securityMenuItems} shouldUseSingleExecution/>
                            </Section_1.default>
                            <react_native_1.View style={safeAreaPaddingBottomStyle}>
                                <Section_1.default title={translate('delegate.copilotDelegatedAccess')} renderSubtitle={function () { return (<Text_1.default style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mt2]}>
                                            <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('delegate.copilotDelegatedAccessDescription')} </Text_1.default>
                                            <TextLink_1.default style={[styles.link]} href={CONST_1.default.COPILOT_HELP_URL}>
                                                {translate('common.learnMore')}
                                            </TextLink_1.default>
                                        </Text_1.default>); }} isCentralPane subtitleMuted titleStyles={styles.accountSettingsSectionTitle} childrenStyles={styles.pt5}>
                                    {hasDelegates && (<>
                                            <Text_1.default style={[styles.textLabelSupporting, styles.pv1]}>{translate('delegate.membersCanAccessYourAccount')}</Text_1.default>
                                            <MenuItemList_1.default menuItems={delegateMenuItems}/>
                                        </>)}
                                    {!isActingAsDelegate && (<MenuItem_1.default title={translate('delegate.addCopilot')} icon={Expensicons.UserPlus} onPress={function () {
                        if (!isUserValidated) {
                            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(Navigation_1.default.getActiveRoute(), ROUTES_1.default.SETTINGS_ADD_DELEGATE));
                            return;
                        }
                        if (isAccountLocked) {
                            showLockedAccountModal();
                            return;
                        }
                        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_ADD_DELEGATE);
                    }} shouldShowRightIcon wrapperStyle={[styles.sectionMenuItemTopDescription, hasDelegators && styles.mb6]}/>)}
                                    {hasDelegators && (<>
                                            <Text_1.default style={[styles.textLabelSupporting, styles.pv1]}>{translate('delegate.youCanAccessTheseAccounts')}</Text_1.default>
                                            <MenuItemList_1.default menuItems={delegatorMenuItems}/>
                                        </>)}
                                </Section_1.default>
                            </react_native_1.View>
                            <PopoverMenu_1.default isVisible={shouldShowDelegatePopoverMenu} anchorRef={delegateButtonRef} anchorPosition={{
                    horizontal: anchorPosition.horizontal,
                    vertical: anchorPosition.vertical,
                }} anchorAlignment={{
                    horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }} menuItems={delegatePopoverMenuItems} onClose={function () {
                    setShouldShowDelegatePopoverMenu(false);
                    setSelectedEmail(undefined);
                }}/>
                            <ConfirmModal_1.default isVisible={shouldShowRemoveDelegateModal} title={translate('delegate.removeCopilot')} prompt={translate('delegate.removeCopilotConfirmation')} danger onConfirm={function () {
                    var _a;
                    (0, Delegate_1.removeDelegate)((_a = selectedDelegate === null || selectedDelegate === void 0 ? void 0 : selectedDelegate.email) !== null && _a !== void 0 ? _a : '');
                    setShouldShowRemoveDelegateModal(false);
                    setSelectedDelegate(undefined);
                }} onCancel={function () {
                    setShouldShowRemoveDelegateModal(false);
                    setSelectedDelegate(undefined);
                }} confirmText={translate('delegate.removeCopilot')} cancelText={translate('common.cancel')} shouldShowCancelButton/>
                        </react_native_1.View>
                    </ScrollView_1.default>
                </>);
        }}
        </ScreenWrapper_1.default>);
}
SecuritySettingsPage.displayName = 'SettingSecurityPage';
exports.default = SecuritySettingsPage;
