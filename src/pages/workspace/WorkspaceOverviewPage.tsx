import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import AttachmentPicker from '@components/AttachmentPicker';
import Avatar from '@components/Avatar';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import PDFThumbnail from '@components/PDFThumbnail';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultFundID from '@hooks/useDefaultFundID';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldBlockCurrencyChange from '@hooks/useShouldBlockCurrencyChange';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {close} from '@libs/actions/Modal';
import {clearInviteDraft, clearWorkspaceOwnerChangeFlow, requestWorkspaceOwnerChange} from '@libs/actions/Policy/Member';
import {
    clearAvatarErrors,
    clearPolicyErrorField,
    deletePolicyRulesDocument,
    deleteWorkspaceAvatar,
    leaveWorkspace,
    openPolicyProfilePage,
    setIsComingFromGlobalReimbursementsFlow,
    updatePolicyRulesDocument,
    updateWorkspaceAvatar,
} from '@libs/actions/Policy/Policy';
import {getCardSettings} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {canEditWorkspaceSettings, getRulesDocumentSourceURL, getUserFriendlyWorkspaceType, goBackFromInvalidPolicy, isPendingDeletePolicy, isPolicyOwner} from '@libs/PolicyUtils';
import {formatAddressToString} from '@libs/ReportActionsUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import shouldRenderTransferOwnerButton from '@libs/shouldRenderTransferOwnerButton';
import StringUtils from '@libs/StringUtils';
import {getLeaveWorkspaceConfirmationPrompt} from '@libs/WorkspacesSettingsUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {canDowngradeSelector} from '@src/selectors/Account';
import {createOwnedPaidPoliciesCountsSelector} from '@src/selectors/Policy';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import DeleteWorkspaceFlow from './deleteWorkspace/DeleteWorkspaceFlow';
import type {WithPolicyProps} from './withPolicy';
import withPolicy from './withPolicy';
import WorkspacePageWithSections from './WorkspacePageWithSections';

type WorkspaceOverviewPageProps = WithPolicyProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.PROFILE>;

const rulesDocumentThumbnailStyle = {maxWidth: variables.rulesDocumentThumbnailMaxWidth, height: variables.rulesDocumentThumbnailHeight};
const rulesDocumentMenuPositionStyle = {top: variables.spacing2, right: variables.spacing2};

function WorkspaceOverviewPage({policyDraft, policy: policyProp, route}: WorkspaceOverviewPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {getCurrencySymbol} = useCurrencyListActions();
    const illustrationIcons = useMemoizedLazyIllustrations(['Building']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Exit', 'FallbackWorkspaceAvatar', 'ImageCropSquareMask', 'QrCode', 'Transfer', 'Trashcan', 'Upload', 'UserPlus']);

    const backTo = route.params.backTo;
    const routePolicyID = route.params.policyID;
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [isComingFromGlobalReimbursementsFlow] = useOnyx(ONYXKEYS.IS_COMING_FROM_GLOBAL_REIMBURSEMENTS_FLOW);
    const {showConfirmModal} = useConfirmModal();
    const [isDeleteWorkspaceFlowVisible, setIsDeleteWorkspaceFlowVisible] = useState(false);

    // Primitive-valued subscriptions configuring the Delete menu item (popover behavior and the loading spinner)
    // before a deletion starts. The deletion itself is handled by DeleteWorkspaceFlow, mounted on demand below.
    const [canDowngrade] = useOnyx(ONYXKEYS.ACCOUNT, {selector: canDowngradeSelector});
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [isLoadingBill] = useOnyx(ONYXKEYS.IS_LOADING_BILL_WHEN_DOWNGRADE);
    const [ownedPaidPoliciesCounts] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createOwnedPaidPoliciesCountsSelector(currentUserPersonalDetails.accountID)}, [
        currentUserPersonalDetails.accountID,
    ]);
    const shouldCalculateBillNewDot = !!canDowngrade && ownedPaidPoliciesCounts?.total === 1;
    const wouldBlockDeletion = (amountOwed ?? 0) > 0 && ownedPaidPoliciesCounts?.active === 1;

    // When we create a new workspace, the policy prop will be empty on the first render. Therefore, we have to use policyDraft until policy has been set in Onyx.
    const policy = policyDraft?.id ? policyDraft : policyProp;
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.profile');
    const policyID = policy?.id;
    const policyDraftID = policyDraft?.id;
    const defaultFundID = useDefaultFundID(policyID);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const settings = getCardSettings(cardSettings);
    const isBankAccountVerified = !!settings?.paymentBankAccountID;
    const shouldBlockCurrencyChange = useShouldBlockCurrencyChange(policyID);

    const isPolicyAdmin = canEditWorkspaceSettings(policy);
    const outputCurrency = policy?.outputCurrency ?? '';
    const currencySymbol = getCurrencySymbol(outputCurrency) ?? '';
    const formattedCurrency = !isEmptyObject(policy) ? `${outputCurrency} - ${currencySymbol}` : '';

    const formattedAddress = !isEmptyObject(policy) && !isEmptyObject(policy.address) ? formatAddressToString(policy.address) : '';

    const onPressCurrency = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policyID));
    };
    const onPressAddress = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_OVERVIEW_ADDRESS.path));
    };
    const onPressName = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_NAME.getRoute(policyID));
    };
    const onPressDescription = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_DESCRIPTION.getRoute(policyID));
    };
    const onPressClientID = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_CLIENT_ID.getRoute(policyID));
    };
    const onPressShare = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_SHARE.getRoute(policyID));
    };
    const onPressPlanType = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_OVERVIEW_PLAN.path));
    };
    const policyName = policy?.name ?? '';
    const policyDescription = policy?.description ?? translate('workspace.common.defaultDescription');
    const policyCurrency = policy?.outputCurrency ?? '';
    const readOnly = !canEditWorkspaceSettings(policy);
    const currencyReadOnly = readOnly || isBankAccountVerified;
    const isOwner = isPolicyOwner(policy, currentUserPersonalDetails.accountID);
    const shouldShowAddress = !readOnly || !!formattedAddress;
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const [pendingRulesDocumentFile, setPendingRulesDocumentFile] = useState<FileObject | undefined>();
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const rulesDocumentSourceURL = useMemo(
        () => getRulesDocumentSourceURL(policy?.rulesDocumentURL, policyID, session?.encryptedAuthToken ?? ''),
        [policy?.rulesDocumentURL, policyID, session?.encryptedAuthToken],
    );

    const hasRulesDocument = !!policy?.rulesDocumentURL;
    const hasCustomRulesText = !StringUtils.isEmptyString(policy?.customRules ?? '');

    const handleRulesDocumentPicked = useCallback(
        (files: FileObject[]) => {
            const file = files.at(0);
            if (!policyID || !file) {
                return;
            }
            setPendingRulesDocumentFile(file);
        },
        [policyID],
    );

    const rulesDocumentURL = policy?.rulesDocumentURL;

    const getRulesDocumentMenuItems = useCallback(
        (openPicker: (options: {onPicked: (files: FileObject[]) => void}) => void): PopoverMenuItem[] => [
            {
                text: translate('common.replace'),
                icon: expensifyIcons.Upload,
                shouldCallAfterModalHide: true,
                onSelected: () => {
                    openPicker({
                        onPicked: handleRulesDocumentPicked,
                    });
                },
            },
            {
                text: translate('common.remove'),
                icon: expensifyIcons.Trashcan,
                onSelected: () => {
                    if (!policyID || !rulesDocumentURL) {
                        return;
                    }
                    deletePolicyRulesDocument(policyID, rulesDocumentURL);
                },
            },
        ],
        [translate, expensifyIcons, handleRulesDocumentPicked, policyID, rulesDocumentURL],
    );
    const shouldShowExpensePolicySection = isPolicyAdmin || hasRulesDocument || hasCustomRulesText;
    const shouldShowRulesDocumentSubSection = isPolicyAdmin || hasRulesDocument;

    const personalDetails = usePersonalDetails();

    const isFocused = useIsFocused();
    const isPendingDelete = isPendingDeletePolicy(policy);
    const prevIsPendingDelete = usePrevious(isPendingDelete);

    const mentionReportContextValue = useMemo(() => ({policyID, currentReportID: undefined, exactlyMatch: true}), [policyID]);

    const fetchPolicyData = useCallback(() => {
        if (policyDraftID || !isFocused) {
            return;
        }
        openPolicyProfilePage(routePolicyID);
    }, [policyDraftID, isFocused, routePolicyID]);

    useNetwork({onReconnect: fetchPolicyData});

    // We have the same focus effect in the WorkspaceInitialPage, this way we can get the policy data in narrow
    // as well as in the wide layout when looking at policy settings.
    useFocusEffect(
        useCallback(() => {
            fetchPolicyData();
        }, [fetchPolicyData]),
    );

    const DefaultAvatar = useCallback(
        () => (
            <Avatar
                containerStyles={styles.avatarXxxxxLarge}
                imageStyles={[styles.avatarXxxxxLarge, styles.alignSelfCenter]}
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing cannot be used if left side can be empty string
                source={policy?.avatarURL || getDefaultWorkspaceAvatar(policyName)}
                fallbackIcon={expensifyIcons.FallbackWorkspaceAvatar}
                size={CONST.AVATAR_SIZE.XXXXX_LARGE}
                name={policyName}
                avatarID={policyID}
                type={CONST.ICON_TYPE_WORKSPACE}
            />
        ),
        [expensifyIcons.FallbackWorkspaceAvatar, policy?.avatarURL, policyID, policyName, styles.alignSelfCenter, styles.avatarXxxxxLarge],
    );

    const dropdownMenuRef = useRef<{setIsMenuVisible: (visible: boolean) => void} | null>(null);

    const handleLeaveWorkspace = () => {
        if (!policy) {
            return;
        }

        leaveWorkspace(currentUserPersonalDetails.accountID, currentUserPersonalDetails.email ?? '', policy);
        goBackFromInvalidPolicy();
    };

    useEffect(() => {
        if (isLoadingBill) {
            return;
        }
        dropdownMenuRef.current?.setIsMenuVisible(false);
    }, [isLoadingBill]);

    const handleBackButtonPress = () => {
        if (isComingFromGlobalReimbursementsFlow) {
            setIsComingFromGlobalReimbursementsFlow(false);
            Navigation.goBack();
            return;
        }

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        Navigation.goBack();
    };

    const startChangeOwnershipFlow = () => {
        clearWorkspaceOwnerChangeFlow(policyID);
        requestWorkspaceOwnerChange(policy, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');
        Navigation.navigate(
            ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(
                policyID,
                currentUserPersonalDetails.accountID,
                'amountOwed' as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>,
                Navigation.getActiveRoute(),
            ),
        );
    };

    const handleLeave = () => {
        const userEmail = session?.email ?? '';
        const ownerDisplayName = personalDetails?.[policy?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID]?.displayName ?? '';
        const prompt = getLeaveWorkspaceConfirmationPrompt(policy, userEmail, ownerDisplayName, translate);
        const isReimburser = policy?.achAccount?.reimburser === userEmail;

        if (isReimburser) {
            showConfirmModal({
                title: translate('common.leaveWorkspace'),
                prompt,
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
                success: true,
            });
            return;
        }

        showConfirmModal({
            title: translate('common.leaveWorkspace'),
            prompt,
            confirmText: translate('common.leave'),
            cancelText: translate('common.cancel'),
            danger: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }

            handleLeaveWorkspace();
        });
    };

    const handleInvitePress = () => {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        clearInviteDraft(route.params.policyID);
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_INVITE.path));
    };

    const canLeave = !isOwner;
    const secondaryActions: Array<DropdownOption<string>> = [];

    if (readOnly) {
        if (canLeave) {
            secondaryActions.push({
                value: 'leave',
                text: translate('common.leave'),
                icon: expensifyIcons.Exit,
                onSelected: () => close(handleLeave),
            });
        }
    } else {
        secondaryActions.push({
            value: 'share',
            text: translate('common.share'),
            icon: expensifyIcons.QrCode,
            onSelected: isAccountLocked ? showLockedAccountModal : onPressShare,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.SHARE,
        });
        if (isOwner) {
            secondaryActions.push({
                value: 'delete',
                text: translate('common.delete'),
                icon: expensifyIcons.Trashcan,
                onSelected: () => {
                    if (isLoadingBill) {
                        return;
                    }

                    // All the pre-deletion checks and the confirmation modal are handled by DeleteWorkspaceFlow, which mounts when this is set.
                    setIsDeleteWorkspaceFlowVisible(true);
                },
                disabled: isLoadingBill,
                shouldShowLoadingSpinnerIcon: isLoadingBill,
                shouldCloseModalOnSelect: !shouldCalculateBillNewDot || wouldBlockDeletion,
            });
        }
        const isCurrentUserAdmin = policy?.employeeList?.[currentUserPersonalDetails?.login ?? '']?.role === CONST.POLICY.ROLE.ADMIN;
        const isCurrentUserOwner = policy?.owner === currentUserPersonalDetails?.login;
        if (isCurrentUserAdmin && !isCurrentUserOwner && shouldRenderTransferOwnerButton(fundList)) {
            secondaryActions.push({
                value: 'transferOwner',
                text: translate('workspace.people.transferOwner'),
                icon: expensifyIcons.Transfer,
                onSelected: startChangeOwnershipFlow,
            });
        }
        if (canLeave) {
            secondaryActions.push({
                value: 'leave',
                text: translate('common.leave'),
                icon: expensifyIcons.Exit,
                onSelected: () => close(handleLeave),
            });
        }
    }

    const dropdownMenu = secondaryActions.length > 0 && (
        <ButtonWithDropdownMenu
            ref={dropdownMenuRef}
            success={false}
            onPress={() => {}}
            shouldAlwaysShowDropdownMenu
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.MORE_DROPDOWN}
            customText={translate('common.more')}
            options={secondaryActions}
            isSplitButton={false}
            wrapperStyle={isPolicyAdmin ? styles.flexGrow0 : styles.flexGrow1}
        />
    );

    const headerButtons = readOnly ? (
        dropdownMenu || null
    ) : (
        <View style={[styles.flexRow, styles.gap2]}>
            {isPolicyAdmin && (
                <Button
                    success
                    text={translate('common.invite')}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.INVITE_BUTTON}
                    icon={expensifyIcons.UserPlus}
                    onPress={handleInvitePress}
                    medium
                    innerStyles={[shouldDisplayButtonsInSeparateLine && styles.alignItemsCenter]}
                    style={[shouldDisplayButtonsInSeparateLine && styles.flexGrow1, shouldDisplayButtonsInSeparateLine && styles.mb3]}
                />
            )}
            {dropdownMenu}
        </View>
    );

    const modals = (
        <>
            {isDeleteWorkspaceFlowVisible && !!policyID && (
                <DeleteWorkspaceFlow
                    key={policyID}
                    policyID={policyID}
                    onDismiss={() => setIsDeleteWorkspaceFlowVisible(false)}
                    onDeleteComplete={goBackFromInvalidPolicy}
                />
            )}
            {!!pendingRulesDocumentFile && (
                <PDFThumbnail
                    style={styles.invisiblePDF}
                    previewSourceURL={pendingRulesDocumentFile.uri ?? ''}
                    onLoadSuccess={() => {
                        if (policyID) {
                            updatePolicyRulesDocument(policyID, pendingRulesDocumentFile as File, policy?.rulesDocumentURL);
                        }
                        setPendingRulesDocumentFile(undefined);
                    }}
                    onPassword={() => {
                        setPendingRulesDocumentFile(undefined);
                        showConfirmModal({
                            title: translate('attachmentPicker.attachmentError'),
                            prompt: translate('attachmentPicker.protectedPDFNotSupported'),
                            confirmText: translate('common.close'),
                            shouldShowCancelButton: false,
                        });
                    }}
                    onLoadError={() => {
                        setPendingRulesDocumentFile(undefined);
                        showConfirmModal({
                            title: translate('attachmentPicker.attachmentError'),
                            prompt: translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'),
                            confirmText: translate('common.close'),
                            shouldShowCancelButton: false,
                        });
                    }}
                />
            )}
        </>
    );
    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.common.profile')}
            route={route}
            // When we create a new workspaces, the policy prop will not be set on the first render. Therefore, we have to delay rendering until it has been set in Onyx.
            shouldShowLoading={policy === undefined}
            shouldUseScrollView
            shouldShowOfflineIndicatorInWideScreen
            shouldShowNonAdmin
            policyFeature={CONST.POLICY.POLICY_FEATURE.OVERVIEW}
            icon={illustrationIcons.Building}
            shouldShowNotFoundPage={policy === undefined}
            onBackButtonPress={handleBackButtonPress}
            addBottomSafeAreaPadding
            headerContent={!shouldDisplayButtonsInSeparateLine && headerButtons}
            modals={modals}
        >
            <View style={[styles.flex1, styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                {shouldDisplayButtonsInSeparateLine && <View style={[styles.pl5, styles.pr5, styles.pb5]}>{headerButtons}</View>}
                <Section
                    isCentralPane
                    title=""
                >
                    <AvatarWithImagePicker
                        onViewPhotoPress={() => {
                            if (!policyID) {
                                return;
                            }
                            Navigation.navigate(ROUTES.WORKSPACE_AVATAR.getRoute(policyID));
                        }}
                        source={policy?.avatarURL ?? ''}
                        avatarID={policyID}
                        size={CONST.AVATAR_SIZE.XXXXX_LARGE}
                        name={policyName}
                        avatarStyle={styles.avatarXxxxxLarge}
                        enablePreview
                        DefaultAvatar={DefaultAvatar}
                        type={CONST.ICON_TYPE_WORKSPACE}
                        fallbackIcon={expensifyIcons.FallbackWorkspaceAvatar}
                        style={[(policy?.errorFields?.avatarURL ?? shouldUseNarrowLayout) ? styles.mb1 : styles.mb3, styles.alignItemsStart, styles.sectionMenuItemTopDescription]}
                        editIconStyle={styles.smallEditIconWorkspace}
                        isUsingDefaultAvatar={!policy?.avatarURL}
                        onImageSelected={(file) => {
                            if (!policyID) {
                                return;
                            }
                            updateWorkspaceAvatar(policyID, policy.avatarURL, file as File);
                        }}
                        onImageRemoved={() => {
                            if (!policyID || !policy.avatarURL) {
                                return;
                            }
                            deleteWorkspaceAvatar(policyID, policy.avatarURL, policy.originalFileName);
                        }}
                        editorMaskImage={expensifyIcons.ImageCropSquareMask}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.AVATAR}
                        pendingAction={policy?.pendingFields?.avatarURL}
                        errors={policy?.errorFields?.avatarURL}
                        onErrorClose={() => {
                            if (!policyID) {
                                return;
                            }
                            clearAvatarErrors(policyID);
                        }}
                        disabled={readOnly}
                        disabledStyle={styles.cursorDefault}
                        errorRowStyles={styles.mt3}
                    />
                    <OfflineWithFeedback pendingAction={policy?.pendingFields?.name}>
                        <MenuItemWithTopDescription
                            title={policyName}
                            titleStyle={styles.workspaceTitleStyle}
                            description={translate('workspace.common.workspaceName')}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.NAME}
                            shouldShowRightIcon={!readOnly}
                            interactive={!readOnly}
                            wrapperStyle={[styles.sectionMenuItemTopDescription, shouldUseNarrowLayout ? styles.mt3 : {}]}
                            onPress={onPressName}
                            shouldBreakWord
                            numberOfLinesTitle={0}
                            titleAccessibilityRole={CONST.ROLE.HEADER}
                        />
                    </OfflineWithFeedback>
                    {(!StringUtils.isEmptyString(policy?.description ?? '') || !readOnly || (prevIsPendingDelete && !isPendingDelete)) && (
                        <OfflineWithFeedback
                            pendingAction={policy?.pendingFields?.description}
                            errors={getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.DESCRIPTION)}
                            onClose={() => {
                                if (!policyID) {
                                    return;
                                }
                                clearPolicyErrorField(policyID, CONST.POLICY.COLLECTION_KEYS.DESCRIPTION);
                            }}
                        >
                            <MentionReportContext.Provider value={mentionReportContextValue}>
                                <MenuItemWithTopDescription
                                    title={policyDescription}
                                    description={translate('workspace.editor.descriptionInputLabel')}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.DESCRIPTION}
                                    shouldShowRightIcon={!readOnly}
                                    interactive={!readOnly}
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                    onPress={onPressDescription}
                                    shouldRenderAsHTML
                                />
                            </MentionReportContext.Provider>
                        </OfflineWithFeedback>
                    )}
                    {!!account?.isApprovedAccountant && (
                        <OfflineWithFeedback
                            pendingAction={policy?.pendingFields?.clientID}
                            errors={getLatestErrorField(policy ?? {}, 'clientID')}
                            onClose={() => {
                                if (!policy?.id) {
                                    return;
                                }
                                clearPolicyErrorField(policy.id, 'clientID');
                            }}
                        >
                            <MenuItemWithTopDescription
                                title={policy?.clientID}
                                description={translate('workspace.common.clientID')}
                                shouldShowRightIcon={!readOnly}
                                interactive={!readOnly}
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                                onPress={onPressClientID}
                            />
                        </OfflineWithFeedback>
                    )}
                    <OfflineWithFeedback
                        pendingAction={policy?.pendingFields?.outputCurrency}
                        errors={getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.GENERAL_SETTINGS)}
                        onClose={() => {
                            if (!policyID) {
                                return;
                            }
                            clearPolicyErrorField(policyID, CONST.POLICY.COLLECTION_KEYS.GENERAL_SETTINGS);
                        }}
                        errorRowStyles={[styles.mt2]}
                    >
                        <View>
                            <MenuItemWithTopDescription
                                title={formattedCurrency}
                                description={translate('workspace.editor.currencyInputLabel')}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.CURRENCY}
                                shouldShowRightIcon={shouldBlockCurrencyChange ? false : !currencyReadOnly}
                                interactive={shouldBlockCurrencyChange ? false : !currencyReadOnly}
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                                onPress={onPressCurrency}
                                hintText={
                                    shouldBlockCurrencyChange || isBankAccountVerified
                                        ? translate('workspace.editor.currencyInputDisabledText', policyCurrency)
                                        : translate('workspace.editor.currencyInputHelpText')
                                }
                            />
                        </View>
                    </OfflineWithFeedback>
                    {shouldShowAddress && (
                        <OfflineWithFeedback pendingAction={policy?.pendingFields?.address}>
                            <View>
                                <MenuItemWithTopDescription
                                    title={formattedAddress}
                                    description={translate('common.companyAddress')}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.ADDRESS}
                                    shouldShowRightIcon={!readOnly}
                                    interactive={!readOnly}
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                    onPress={onPressAddress}
                                    copyValue={readOnly ? formattedAddress : undefined}
                                    copyable={readOnly && !!formattedAddress}
                                />
                            </View>
                        </OfflineWithFeedback>
                    )}

                    {!readOnly && !!policy?.type && (
                        <OfflineWithFeedback pendingAction={policy?.pendingFields?.type}>
                            <View>
                                <MenuItemWithTopDescription
                                    title={getUserFriendlyWorkspaceType(policy.type, translate)}
                                    description={translate('workspace.common.planType')}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.PLAN_TYPE}
                                    shouldShowRightIcon
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                    onPress={onPressPlanType}
                                />
                            </View>
                        </OfflineWithFeedback>
                    )}
                </Section>
                {shouldShowExpensePolicySection ? (
                    <Section
                        isCentralPane
                        title={translate('workspace.rules.customRules.title')}
                        titleStyles={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, styles.mb0]}
                        subtitle={translate('workspace.rules.customRules.cardSubtitle')}
                        subtitleStyles={[shouldShowRulesDocumentSubSection ? styles.mb6 : styles.mb2]}
                        subtitleTextStyles={[styles.textNormal, styles.colorMuted, styles.mr5]}
                        containerStyles={shouldUseNarrowLayout ? styles.p5 : styles.p8}
                    >
                        {shouldShowRulesDocumentSubSection && (
                            <OfflineWithFeedback
                                pendingAction={policy?.pendingFields?.rulesDocumentURL}
                                errors={getLatestErrorField(policy ?? {}, 'rulesDocumentURL')}
                                onClose={() => {
                                    if (!policyID) {
                                        return;
                                    }
                                    clearPolicyErrorField(policyID, 'rulesDocumentURL');
                                }}
                            >
                                <Text style={[styles.mutedTextLabel, styles.mb2]}>{translate('workspace.rules.customRules.policyDocument')}</Text>
                                <AttachmentPicker
                                    acceptedFileTypes={['pdf']}
                                    shouldSkipAttachmentTypeModal
                                >
                                    {({openPicker}) => {
                                        if (policy?.rulesDocumentURL) {
                                            return (
                                                <View style={[styles.w100, rulesDocumentThumbnailStyle]}>
                                                    <PressableWithoutFeedback
                                                        onPress={() => {
                                                            if (!policyID) {
                                                                return;
                                                            }
                                                            Navigation.navigate(ROUTES.WORKSPACE_DOCUMENT.getRoute(policyID));
                                                        }}
                                                        role={CONST.ROLE.BUTTON}
                                                        accessibilityLabel={translate('workspace.rules.customRules.policyDocument')}
                                                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.RULES_DOCUMENT}
                                                        style={[
                                                            styles.border,
                                                            styles.borderRadiusComponentLarge,
                                                            styles.overflowHidden,
                                                            styles.flex1,
                                                            styles.alignItemsCenter,
                                                            styles.justifyContentCenter,
                                                        ]}
                                                    >
                                                        <PDFThumbnail
                                                            previewSourceURL={rulesDocumentSourceURL}
                                                            style={[styles.flex1, styles.w100]}
                                                        />
                                                    </PressableWithoutFeedback>
                                                    {isPolicyAdmin && (
                                                        <View style={[styles.pAbsolute, rulesDocumentMenuPositionStyle]}>
                                                            <ThreeDotsMenu
                                                                menuItems={getRulesDocumentMenuItems(openPicker)}
                                                                shouldSelfPosition
                                                                iconStyles={[styles.receiptActionButton]}
                                                            />
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        }

                                        if (!isPolicyAdmin) {
                                            return null;
                                        }

                                        return (
                                            <View style={[styles.flexRow]}>
                                                <Button
                                                    medium
                                                    text={translate('common.chooseFile')}
                                                    onPress={() => {
                                                        openPicker({
                                                            onPicked: handleRulesDocumentPicked,
                                                        });
                                                    }}
                                                />
                                            </View>
                                        );
                                    }}
                                </AttachmentPicker>
                            </OfflineWithFeedback>
                        )}

                        {(isPolicyAdmin || hasCustomRulesText) && (
                            <OfflineWithFeedback pendingAction={policy?.pendingFields?.customRules}>
                                <MenuItemWithTopDescription
                                    title={policy?.customRules ?? ''}
                                    description={translate('workspace.rules.customRules.policyText')}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.CUSTOM_RULES}
                                    shouldShowRightIcon={!readOnly}
                                    interactive={!readOnly}
                                    wrapperStyle={[styles.sectionMenuItemTopDescription, shouldShowRulesDocumentSubSection && styles.mt4]}
                                    onPress={() => Navigation.navigate(ROUTES.RULES_CUSTOM.getRoute(route.params.policyID))}
                                    shouldRenderAsHTML
                                />
                            </OfflineWithFeedback>
                        )}
                    </Section>
                ) : null}
            </View>
        </WorkspacePageWithSections>
    );
}

export default withPolicy(WorkspaceOverviewPage);
