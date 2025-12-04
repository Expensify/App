import {Str} from 'expensify-common';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, Keyboard} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import ErrorMessageRow from '@components/ErrorMessageRow';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {Star, Trashcan} from '@components/Icon/Expensicons';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import ValidateCodeActionForm from '@components/ValidateCodeActionForm';
import type {ValidateCodeFormHandle} from '@components/ValidateCodeActionModal/ValidateCodeForm/BaseValidateCodeForm';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {
    clearContactMethod,
    clearContactMethodErrors,
    clearUnvalidatedNewContactMethodAction,
    deleteContactMethod,
    requestContactMethodValidateCode,
    resetContactMethodValidateCodeSentState,
    setContactMethodAsDefault,
    validateSecondaryLogin,
} from '@libs/actions/User';
import {isMobileSafari} from '@libs/Browser';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getEarliestErrorField, getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {close} from '@userActions/Modal';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Login} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import KeyboardUtils from '@src/utils/keyboard';
import getDecodedContactMethodFromUriParam from './utils';

type ContactMethodDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_DETAILS>;

function ContactMethodDetailsPage({route}: ContactMethodDetailsPageProps) {
    const [loginList, loginListResult] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [session, sessionResult] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [myDomainSecurityGroups, myDomainSecurityGroupsResult] = useOnyx(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {canBeMissing: true});
    const [securityGroups, securityGroupsResult] = useOnyx(ONYXKEYS.COLLECTION.SECURITY_GROUP, {canBeMissing: true});
    const [isLoadingReportData = true, isLoadingReportDataResult] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {canBeMissing: true});
    const [isValidateCodeFormVisible, setIsValidateCodeFormVisible] = useState(true);
    const {isActingAsDelegate, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const isLoadingOnyxValues = isLoadingOnyxValue(loginListResult, sessionResult, myDomainSecurityGroupsResult, securityGroupsResult, isLoadingReportDataResult);
    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);

    const {formatPhoneNumber, translate} = useLocalize();
    const themeStyles = useThemeStyles();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const validateCodeFormRef = useRef<ValidateCodeFormHandle>(null);
    const backTo = route.params.backTo;

    /**
     * Gets the current contact method from the route params
     */
    const contactMethod: string = useMemo(() => getDecodedContactMethodFromUriParam(route.params.contactMethod), [route.params.contactMethod]);

    const loginDataRef = useRef<Login | undefined>(undefined);
    const loginData = useMemo(() => {
        // eslint-disable-next-line react-compiler/react-compiler
        loginDataRef.current = loginList?.[contactMethod];
        return loginList?.[contactMethod];
    }, [loginList, contactMethod]);

    const isDefaultContactMethod = useMemo(() => session?.email === loginData?.partnerUserID, [session?.email, loginData?.partnerUserID]);
    const validateLoginError = getEarliestErrorField(loginData, 'validateLogin');
    const prevPendingDeletedLogin = usePrevious(loginData?.pendingFields?.deletedLogin);

    /**
     * Attempt to set this contact method as user's "Default contact method"
     */
    const setAsDefault = useCallback(() => {
        setContactMethodAsDefault(contactMethod, formatPhoneNumber, backTo);
    }, [contactMethod, backTo, formatPhoneNumber]);

    /**
     * Checks if the user is allowed to change their default contact method. This should only be allowed if:
     * 1. The viewed contact method is not already their default contact method
     * 2. The viewed contact method is validated
     * 3. If the user is on a private domain, their security group must allow primary login switching
     */
    const canChangeDefaultContactMethod = useMemo(() => {
        // Cannot set this contact method as default if:
        // 1. This contact method is already their default
        // 2. This contact method is not validated
        if (isDefaultContactMethod || !loginData?.validatedDate) {
            return false;
        }

        const domainName = Str.extractEmailDomain(session?.email ?? '');
        const primaryDomainSecurityGroupID = myDomainSecurityGroups?.[domainName];

        // If there's no security group associated with the user for the primary domain,
        // default to allowing the user to change their default contact method.
        if (!primaryDomainSecurityGroupID) {
            return true;
        }

        // Allow user to change their default contact method if they don't have a security group OR if their security group
        // does NOT restrict primary login switching.
        return !securityGroups?.[`${ONYXKEYS.COLLECTION.SECURITY_GROUP}${primaryDomainSecurityGroupID}`]?.enableRestrictedPrimaryLogin;
    }, [isDefaultContactMethod, loginData?.validatedDate, session?.email, myDomainSecurityGroups, securityGroups]);

    /**
     * Toggle delete confirm modal visibility
     */
    const toggleDeleteModal = useCallback((isOpen: boolean) => {
        if (canUseTouchScreen() && isOpen) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                setIsDeleteModalOpen(isOpen);
            });
            Keyboard.dismiss();
        } else {
            setIsDeleteModalOpen(isOpen);
        }
    }, []);

    /**
     * Delete the contact method and hide the modal
     */
    const confirmDeleteAndHideModal = useCallback(() => {
        toggleDeleteModal(false);
        deleteContactMethod(contactMethod, loginList ?? {}, backTo);
    }, [contactMethod, loginList, toggleDeleteModal, backTo]);

    const prevValidatedDate = usePrevious(loginData?.validatedDate);
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (prevValidatedDate || !loginData?.validatedDate) {
            return;
        }

        // Navigate to methods page on successful magic code verification
        // validatedDate property is responsible to decide the status of the magic code verification
        Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.getRoute(backTo));
    }, [prevValidatedDate, loginData?.validatedDate, isDefaultContactMethod, backTo]);

    useEffect(() => {
        setIsValidateCodeFormVisible(!loginData?.validatedDate);
    }, [loginData?.validatedDate, loginData?.errorFields?.addedLogin]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!loginData?.partnerUserID || loginData?.validatedDate || prevPendingDeletedLogin) {
            return;
        }
        resetContactMethodValidateCodeSentState(contactMethod);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- The prevPendingDeletedLogin is a ref, so no need to add it to dependencies.
    }, [contactMethod, loginData?.partnerUserID, loginData?.validatedDate]);

    const getThreeDotsMenuItems = useCallback(() => {
        const menuItems = [];
        if (isValidateCodeFormVisible && !isDefaultContactMethod) {
            menuItems.push({
                icon: Trashcan,
                text: translate('common.remove'),
                onSelected: () => close(() => toggleDeleteModal(true)),
            });
        }
        return menuItems;
    }, [isValidateCodeFormVisible, translate, toggleDeleteModal, isDefaultContactMethod]);

    if (isLoadingOnyxValues || (isLoadingReportData && isEmptyObject(loginList))) {
        return <FullscreenLoadingIndicator />;
    }

    if (!contactMethod || !loginData) {
        return (
            <ScreenWrapper testID={ContactMethodDetailsPage.displayName}>
                <FullPageNotFoundView
                    shouldShow
                    linkTranslationKey="contacts.goBackContactMethods"
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.getRoute(backTo))}
                    onLinkPress={() => Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.getRoute(backTo))}
                />
            </ScreenWrapper>
        );
    }

    // Replacing spaces with "hard spaces" to prevent breaking the number
    const formattedContactMethod = Str.isSMSLogin(contactMethod) ? formatPhoneNumber(contactMethod) : contactMethod;
    const hasMagicCodeBeenSent = !!loginData.validateCodeSent;
    const isFailedAddContactMethod = !!loginData.errorFields?.addedLogin;
    const isFailedRemovedContactMethod = !!loginData.errorFields?.deletedLogin;
    const shouldSkipInitialValidation = route.params?.shouldSkipInitialValidation === 'true';

    const getDeleteConfirmationModal = () => (
        <ConfirmModal
            title={translate('contacts.removeContactMethod')}
            onConfirm={confirmDeleteAndHideModal}
            onCancel={() => toggleDeleteModal(false)}
            onModalHide={() => {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.runAfterInteractions(() => {
                    validateCodeFormRef.current?.focusLastSelected?.();
                });
            }}
            prompt={translate('contacts.removeAreYouSure')}
            confirmText={translate('common.yesContinue')}
            cancelText={translate('common.cancel')}
            isVisible={isDeleteModalOpen && !isDefaultContactMethod}
            danger
        />
    );

    const getMenuItems = () => (
        <>
            {canChangeDefaultContactMethod ? (
                <OfflineWithFeedback
                    errors={getLatestErrorField(loginData, 'defaultLogin')}
                    errorRowStyles={[themeStyles.ml8, themeStyles.mr5]}
                    onClose={() => clearContactMethodErrors(contactMethod, 'defaultLogin')}
                >
                    <MenuItem
                        title={translate('contacts.setAsDefault')}
                        icon={Star}
                        onPress={isAccountLocked ? showLockedAccountModal : setAsDefault}
                    />
                </OfflineWithFeedback>
            ) : null}
            {isDefaultContactMethod ? (
                <OfflineWithFeedback
                    pendingAction={loginData.pendingFields?.defaultLogin}
                    errors={getLatestErrorField(loginData, isFailedRemovedContactMethod ? 'deletedLogin' : 'defaultLogin')}
                    errorRowStyles={[themeStyles.ml8, themeStyles.mr5]}
                    onClose={() => clearContactMethodErrors(contactMethod, isFailedRemovedContactMethod ? 'deletedLogin' : 'defaultLogin')}
                >
                    <Text style={[themeStyles.ph5, themeStyles.mv3]}>{translate('contacts.yourDefaultContactMethod')}</Text>
                </OfflineWithFeedback>
            ) : (
                <OfflineWithFeedback
                    pendingAction={loginData.pendingFields?.deletedLogin}
                    errors={getLatestErrorField(loginData, 'deletedLogin')}
                    errorRowStyles={[themeStyles.mt6, themeStyles.ph5]}
                    onClose={() => clearContactMethodErrors(contactMethod, 'deletedLogin')}
                >
                    <MenuItem
                        title={translate('common.remove')}
                        icon={Trashcan}
                        onPress={() => {
                            if (isActingAsDelegate) {
                                showDelegateNoAccessModal();
                                return;
                            }
                            toggleDeleteModal(true);
                        }}
                    />
                </OfflineWithFeedback>
            )}
        </>
    );

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            onEntryTransitionEnd={() => {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.runAfterInteractions(() => {
                    validateCodeFormRef.current?.focus?.();
                });
            }}
            testID={ContactMethodDetailsPage.displayName}
            focusTrapSettings={{
                focusTrapOptions: isMobileSafari()
                    ? undefined
                    : {
                          // We need to check this because focusing the input form interferes with the transition animation:
                          // https://github.com/Expensify/App/issues/53884#issuecomment-2594568960
                          checkCanFocusTrap: (trapContainers: Array<HTMLElement | SVGElement>) => {
                              return new Promise((resolve) => {
                                  const interval = setInterval(() => {
                                      const trapContainer = trapContainers.at(0);
                                      if (!trapContainer || getComputedStyle(trapContainer).visibility !== 'hidden') {
                                          resolve();
                                          clearInterval(interval);
                                      }
                                  }, 5);
                              });
                          },
                      },
            }}
        >
            <HeaderWithBackButton
                title={formattedContactMethod}
                threeDotsMenuItems={getThreeDotsMenuItems()}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.getRoute(backTo))}
                shouldShowThreeDotsButton={getThreeDotsMenuItems().length > 0}
                shouldOverlayDots
                onThreeDotsButtonPress={() => {
                    // Hide the keyboard when the user clicks the three-dot menu.
                    // Use blurActiveElement() for mWeb and KeyboardUtils.dismiss() for native apps.
                    blurActiveElement();
                    KeyboardUtils.dismiss();
                }}
            />
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={themeStyles.flexGrow1}
                style={[themeStyles.w100, themeStyles.h100, themeStyles.flex1]}
            >
                {isFailedAddContactMethod && (
                    <ErrorMessageRow
                        errors={getLatestErrorField(loginData, 'addedLogin')}
                        errorRowStyles={[themeStyles.mh5, themeStyles.mv3]}
                        onClose={() => {
                            clearContactMethod(contactMethod);
                            clearUnvalidatedNewContactMethodAction();
                            Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.getRoute(backTo));
                        }}
                        canDismissError
                    />
                )}
                {isValidateCodeFormVisible && !!loginData && !loginData.validatedDate && (
                    <ValidateCodeActionForm
                        hasMagicCodeBeenSent={hasMagicCodeBeenSent}
                        handleSubmitForm={(validateCode) => validateSecondaryLogin(loginList, contactMethod, validateCode, formatPhoneNumber)}
                        validateError={!isEmptyObject(validateLoginError) ? validateLoginError : getLatestErrorField(loginData, 'validateCodeSent')}
                        clearError={() => {
                            // When removing unverified contact methods, the ValidateCodeActionForm unmounts and triggers clearError.
                            // This causes loginData to become an object, which makes sendValidateCode trigger, so we add this check to prevent clearing the error.
                            if (!loginDataRef.current?.partnerUserID) {
                                return;
                            }
                            clearContactMethodErrors(contactMethod, !isEmptyObject(validateLoginError) ? 'validateLogin' : 'validateCodeSent');
                        }}
                        sendValidateCode={() => {
                            if (!loginData.partnerUserID) {
                                return;
                            }
                            requestContactMethodValidateCode(contactMethod);
                        }}
                        descriptionPrimary={translate('contacts.enterMagicCode', {contactMethod: formattedContactMethod})}
                        ref={validateCodeFormRef}
                        shouldSkipInitialValidation={shouldSkipInitialValidation}
                    />
                )}

                {!isValidateCodeFormVisible && !!loginData.validatedDate && getMenuItems()}
                {getDeleteConfirmationModal()}
            </ScrollView>
        </ScreenWrapper>
    );
}

ContactMethodDetailsPage.displayName = 'ContactMethodDetailsPage';

export default ContactMethodDetailsPage;
