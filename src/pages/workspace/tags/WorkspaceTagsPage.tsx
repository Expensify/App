import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import DecisionModal from '@components/DecisionModal';
import EmployeesSeeTagsAsText from '@components/EmployeesSeeTagsAsText';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImportedFromAccountingSoftware from '@components/ImportedFromAccountingSoftware';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import type {WorkspaceTagTableRowData} from '@components/Tables/WorkspaceTagsTable';
import WorkspaceTagsTable from '@components/Tables/WorkspaceTagsTable';
import Text from '@components/Text';

import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import useEnvironment from '@hooks/useEnvironment';
import useGenericEmptyStateIllustration from '@hooks/useGenericEmptyStateIllustration';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyData from '@hooks/usePolicyData';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {isConnectionInProgress, isConnectionUnverified} from '@libs/actions/connections';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {
    clearPolicyTagErrors,
    deletePolicyTags,
    downloadMultiLevelTagsCSV,
    downloadTagsCSV,
    openPolicyTagsPage,
    setPolicyTagsRequired,
    setWorkspaceTagEnabled,
    setWorkspaceTagRequired,
} from '@libs/actions/Policy/Tag';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {isDisablingOrDeletingLastEnabledTag, isMakingLastRequiredTagListOptional} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {
    arePolicyRulesEnabled,
    getCleanedTagName,
    getConnectedIntegration,
    getCountOfEnabledTagsOfList,
    getCurrentConnectionName,
    getTagApproverRule,
    getTagLists,
    hasAccountingConnections as hasAccountingConnectionsPolicyUtils,
    hasDependentTags as hasDependentTagsPolicyUtils,
    hasIndependentTags as hasIndependentTagsPolicyUtils,
    isControlPolicy,
    isMultiLevelTags as isMultiLevelTagsPolicyUtils,
    shouldShowSyncError,
} from '@libs/PolicyUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {close} from '@userActions/Modal';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';

import type {PolicyTag, PolicyTagList} from './types';

type WorkspaceTagsPageProps =
    | PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS>
    | PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_ROOT>;

function WorkspaceTagsPage({route}: WorkspaceTagsPageProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [isDownloadFailureModalVisible, setIsDownloadFailureModalVisible] = useState(false);
    const {backTo, policyID} = route.params;
    const policyData = usePolicyData(policyID);
    const {policy, tags: policyTags} = policyData;
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.tags');
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const {environmentURL} = useEnvironment();
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`);
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const syncingAccountingIntegration = CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES.find((connectionName) => connectionName === connectionSyncProgress?.connectionName);
    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress, CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES);
    const connectedIntegration = getConnectedIntegration(policy) ?? syncingAccountingIntegration;
    const isConnectionVerified = connectedIntegration && !isConnectionUnverified(policy, connectedIntegration);
    const currentConnectionName = getCurrentConnectionName(policy);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Gear', 'Table', 'Download', 'Plus', 'Trashcan', 'Close', 'Trashcan', 'Checkmark']);
    const genericIllustration = useGenericEmptyStateIllustration();

    const [policyTagLists, isMultiLevelTags, hasDependentTags, hasIndependentTags] = useMemo(
        () => [getTagLists(policyTags), isMultiLevelTagsPolicyUtils(policyTags), hasDependentTagsPolicyUtils(policy, policyTags), hasIndependentTagsPolicyUtils(policy, policyTags)],
        [policy, policyTags],
    );

    const {canWrite: canWriteTags, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.TAGS);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const shouldShowTagsSettings = canWriteTags && !(isRulesRevampEnabled && isMultiLevelTags);
    const canSelectMultiple = canWriteTags && !hasDependentTags && (shouldUseNarrowLayout ? isMobileSelectionModeEnabled : true);
    const isControlPolicyWithWideLayout = !shouldUseNarrowLayout && isControlPolicy(policy);
    const tagApproverEmails = useMemo(() => {
        const approverEmails: Record<string, string> = {};

        if (isMultiLevelTags) {
            return approverEmails;
        }

        for (const tag of Object.values(policyTagLists?.at(0)?.tags ?? {})) {
            const approverEmail = getTagApproverRule(policy, tag.name)?.approver;

            if (approverEmail) {
                approverEmails[tag.name] = approverEmail;
            }
        }

        return approverEmails;
    }, [isMultiLevelTags, policy, policyTagLists]);

    const shouldShowApproverColumn = isControlPolicyWithWideLayout && !isMultiLevelTags && arePolicyRulesEnabled(policy, policyCategories) && Object.keys(tagApproverEmails).length > 0;
    const fetchTags = useCallback(() => {
        openPolicyTagsPage(policyID);
    }, [policyID]);
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_ROOT;
    const illustrations = useMemoizedLazyIllustrations(['Tag']);

    const tagsList = useMemo(() => {
        if (isMultiLevelTags) {
            return policyTagLists.reduce<Record<string, PolicyTagList>>((acc, policyTagList) => {
                acc[policyTagList.name] = policyTagList;
                return acc;
            }, {});
        }
        return policyTagLists?.at(0)?.tags;
    }, [isMultiLevelTags, policyTagLists]);

    const [selectedTagKeys, setSelectedTagKeys] = useState<string[]>([]);

    const {isOffline} = useNetwork({onReconnect: fetchTags});

    useEffect(() => {
        fetchTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedTagKeys.length === 0 || !canSelectMultiple) {
            return;
        }

        setSelectedTagKeys((prevSelectedTags) => {
            const newSelectedTags = [];

            for (const tagName of prevSelectedTags) {
                if (isMultiLevelTags) {
                    const tagListExists = tagsList?.[tagName];
                    if (!tagListExists) {
                        const renamedTagList = Object.entries(tagsList ?? {}).find(([, tagList]) => {
                            const typedTagList = tagList as {previousTagName?: string};
                            return typedTagList.previousTagName === tagName;
                        });
                        if (renamedTagList) {
                            newSelectedTags.push(renamedTagList[0]);
                            continue;
                        }
                    }

                    if (tagListExists && tagListExists.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                        newSelectedTags.push(tagName);
                    }
                } else {
                    const tagExists = tagsList?.[tagName];
                    if (!tagExists) {
                        const renamedTag = Object.entries(tagsList ?? {}).find(([, tag]) => {
                            const typedTag = tag as {previousTagName?: string};
                            return typedTag.previousTagName === tagName;
                        });
                        if (renamedTag) {
                            newSelectedTags.push(renamedTag[0]);
                            continue;
                        }
                    }

                    if (tagExists && tagExists.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                        newSelectedTags.push(tagName);
                    }
                }
            }

            return newSelectedTags;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tagsList]);

    const clearTableSelection = useCallback(() => {
        setSelectedTagKeys((prevSelectedTagKeys) => (prevSelectedTagKeys.length > 0 ? [] : prevSelectedTagKeys));
    }, []);

    useCleanupSelectedOptions(clearTableSelection);

    useSearchBackPress({
        onClearSelection: clearTableSelection,
        onNavigationCallBack: () => Navigation.goBack(backTo),
    });

    const getPendingAction = (policyTagList: PolicyTagList): PendingAction | undefined => {
        if (!policyTagList) {
            return undefined;
        }
        return ((policyTagList.pendingAction as PendingAction) ?? Object.values(policyTagList.tags).some((tag: PolicyTag) => tag.pendingAction))
            ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE
            : undefined;
    };

    const updateWorkspaceTagEnabled = useCallback(
        (value: boolean, tagName: string) => {
            if (!canWriteTags) {
                showReadOnlyModal();
                return;
            }

            setWorkspaceTagEnabled(policyData, {[tagName]: {name: tagName, enabled: value}}, 0);
        },
        [canWriteTags, policyData, showReadOnlyModal],
    );

    const updateWorkspaceRequiresTag = useCallback(
        (value: boolean, orderWeight: number) => {
            if (!canWriteTags) {
                showReadOnlyModal();
                return;
            }

            setPolicyTagsRequired(policyData, value, orderWeight);
        },
        [canWriteTags, policyData, showReadOnlyModal],
    );
    const shouldShowGLCodeColumn = isControlPolicyWithWideLayout && !isMultiLevelTags && Object.values(policyTagLists?.at(0)?.tags ?? {}).some((tag) => !!tag['GL Code']);

    const showAllTagsDisabledWarning = useCallback(() => {
        showConfirmModal({
            title: translate('workspace.tags.cannotDeleteOrDisableAllTags.title'),
            prompt: translate('workspace.tags.cannotDeleteOrDisableAllTags.description'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    }, [showConfirmModal, translate]);

    const showAllTagsOptionalWarning = useCallback(() => {
        showConfirmModal({
            title: translate('workspace.tags.cannotMakeAllTagsOptional.title'),
            prompt: translate('workspace.tags.cannotMakeAllTagsOptional.description'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    }, [showConfirmModal, translate]);

    const handleTagEnabledToggle = useCallback(
        (enabled: boolean, tag: PolicyTag) => {
            if (!canWriteTags) {
                showReadOnlyModal();
                return;
            }

            if (isDisablingOrDeletingLastEnabledTag(policyTagLists.at(0), [tag])) {
                showAllTagsDisabledWarning();
                return;
            }

            updateWorkspaceTagEnabled(enabled, tag.name);
        },
        [canWriteTags, policyTagLists, showAllTagsDisabledWarning, showReadOnlyModal, updateWorkspaceTagEnabled],
    );

    const handleTagListRequiredToggle = useCallback(
        (required: boolean, policyTagList: PolicyTagList) => {
            if (!canWriteTags) {
                showReadOnlyModal();
                return;
            }

            if (!required && isMakingLastRequiredTagListOptional(policy, policyTags, [policyTagList])) {
                showAllTagsOptionalWarning();
                return;
            }

            updateWorkspaceRequiresTag(required, policyTagList.orderWeight);
        },
        [canWriteTags, policy, policyTags, showAllTagsOptionalWarning, showReadOnlyModal, updateWorkspaceRequiresTag],
    );

    const navigateToTagSettings = useCallback(
        (tagValue: string, orderWeight?: number) => {
            if (orderWeight !== undefined) {
                Navigation.navigate(
                    isQuickSettingsFlow ? createDynamicRoute(DYNAMIC_ROUTES.SETTINGS_TAG_LIST_VIEW.getRoute(orderWeight)) : ROUTES.WORKSPACE_TAG_LIST_VIEW.getRoute(policyID, orderWeight),
                );
            } else {
                Navigation.navigate(
                    isQuickSettingsFlow
                        ? createDynamicRoute(DYNAMIC_ROUTES.SETTINGS_TAG_SETTINGS.getRoute(0, tagValue))
                        : createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_TAG_SETTINGS.getRoute(0, tagValue)),
                );
            }
        },
        [isQuickSettingsFlow, policyID],
    );

    useEffect(() => {
        if (!canWriteTags || !isMultiLevelTags || hasDependentTags) {
            return;
        }

        for (const policyTagList of policyTagLists) {
            const areTagsEnabled = !!Object.values(policyTagList?.tags ?? {}).some((tag) => tag.enabled);
            if (policyTagList.required && !areTagsEnabled) {
                updateWorkspaceRequiresTag(false, policyTagList.orderWeight);
            }
        }
    }, [canWriteTags, hasDependentTags, isMultiLevelTags, policyTagLists, updateWorkspaceRequiresTag]);

    const tagRows = useMemo<WorkspaceTagTableRowData[]>(() => {
        if (isMultiLevelTags) {
            return policyTagLists.reduce<WorkspaceTagTableRowData[]>((acc, policyTagList) => {
                const isDisabled = policyTagList.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

                if (!isOffline && isDisabled) {
                    return acc;
                }

                const areTagsEnabled = !!Object.values(policyTagList?.tags ?? {}).some((tag) => tag.enabled);
                const isSwitchDisabled = !policyTagList.required && !areTagsEnabled;
                const isSwitchEnabled = policyTagList.required && areTagsEnabled;
                const tagCount = Object.keys(policyTagList?.tags ?? {}).length;

                acc.push({
                    keyForList: policyTagList.name,
                    value: policyTagList.name,
                    name: getCleanedTagName(policyTagList.name),
                    orderWeight: policyTagList.orderWeight,
                    enabled: true,
                    required: isSwitchEnabled,
                    tagCount,
                    disabled: isDisabled,
                    isSelectionDisabled: isSwitchDisabled,
                    isSwitchDisabled,
                    pendingAction: getPendingAction(policyTagList),
                    isLocked: !canWriteTags || isMakingLastRequiredTagListOptional(policy, policyTags, [policyTagList]),
                    showEnabledSwitch: false,
                    showRequiredSwitch: !hasDependentTags,
                    action: () => navigateToTagSettings(policyTagList.name, policyTagList.orderWeight),
                    onToggleRequired: (required: boolean) => handleTagListRequiredToggle(required, policyTagList),
                    onClose: () => {},
                });

                return acc;
            }, []);
        }

        const firstTagList = policyTagLists.at(0);
        const enabledTagsCount = getCountOfEnabledTagsOfList(firstTagList?.tags);
        const isLastEnabledTagLocked = !!firstTagList?.required && enabledTagsCount === 1;

        return Object.values(firstTagList?.tags ?? {}).reduce<WorkspaceTagTableRowData[]>((acc, tag) => {
            const isDisabled = tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            if (!isOffline && isDisabled) {
                return acc;
            }

            const approverEmail = shouldShowApproverColumn ? tagApproverEmails[tag.name] : undefined;
            const approverPersonalDetail = getPersonalDetailByEmail(approverEmail);
            const {avatar: approverAvatar, displayName = approverEmail, accountID: approverAccountID} = approverPersonalDetail ?? {};
            const approverDisplayName = displayName ? formatPhoneNumber(displayName) : '';
            const isLastEnabledTagAndEnabled = isLastEnabledTagLocked && tag.enabled;

            acc.push({
                keyForList: tag.name,
                value: tag.name,
                name: getCleanedTagName(tag.name),
                enabled: tag.enabled,
                glCode: tag['GL Code'],
                approverAvatar,
                approverAccountID,
                approverDisplayName,
                disabled: isDisabled,
                errors: tag.errors ?? undefined,
                pendingAction: tag.pendingAction,
                isLocked: !canWriteTags || isLastEnabledTagAndEnabled,
                showEnabledSwitch: true,
                showRequiredSwitch: false,
                action: () => navigateToTagSettings(tag.name),
                onToggleEnabled: (enabled: boolean) => handleTagEnabledToggle(enabled, tag),
                onClose: () => clearPolicyTagErrors({policyID, tagName: tag.name, tagListIndex: 0, policyTags}),
            });

            return acc;
        }, []);
    }, [
        canWriteTags,
        handleTagEnabledToggle,
        handleTagListRequiredToggle,
        hasDependentTags,
        isMultiLevelTags,
        isOffline,
        navigateToTagSettings,
        policy,
        policyID,
        policyTagLists,
        policyTags,
        shouldShowApproverColumn,
        tagApproverEmails,
    ]);

    const tagRowsKeyedByName = useMemo(
        () =>
            tagRows.reduce<Record<string, WorkspaceTagTableRowData>>((acc, tag) => {
                acc[tag.value] = tag;
                return acc;
            }, {}),
        [tagRows],
    );

    const navigateToTagsSettings = useCallback(() => {
        Navigation.navigate(isQuickSettingsFlow ? ROUTES.SETTINGS_TAGS_SETTINGS.getRoute(policyID, backTo) : createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_TAGS_SETTINGS.path));
    }, [isQuickSettingsFlow, policyID, backTo]);

    const navigateToCreateTagPage = () => {
        Navigation.navigate(isQuickSettingsFlow ? createDynamicRoute(DYNAMIC_ROUTES.SETTINGS_TAG_CREATE.path) : createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_TAG_CREATE.path));
    };

    const deleteTags = () => {
        deletePolicyTags(policyData, selectedTagKeys);

        clearTableSelection();
        if (isMobileSelectionModeEnabled && selectedTagKeys.length === Object.keys(policyTagLists.at(0)?.tags ?? {}).length) {
            turnOffMobileSelectionMode();
        }
    };

    const isLoading = !isOffline && policyTags === undefined;
    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'WorkspaceTagsPage', isOffline, isPolicyTagsUndefined: policyTags === undefined};
    const hasVisibleTags = tagRows.some((tag) => tag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);

    const navigateToImportSpreadsheet = useCallback(() => {
        if (isOffline) {
            showConfirmModal({
                title: translate('common.youAppearToBeOffline'),
                prompt: translate('common.thisFeatureRequiresInternet'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
                shouldHandleNavigationBack: true,
            });
            return;
        }
        Navigation.navigate(
            isQuickSettingsFlow
                ? ROUTES.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo))
                : ROUTES.WORKSPACE_TAGS_IMPORT_OPTIONS.getRoute(policyID),
        );
    }, [backTo, isOffline, isQuickSettingsFlow, policyID, showConfirmModal, translate]);

    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const secondaryActions = useMemo(() => {
        const menuItems = [];
        if (shouldShowTagsSettings) {
            menuItems.push({
                icon: expensifyIcons.Gear,
                text: translate('common.settings'),
                onSelected: navigateToTagsSettings,
                value: CONST.POLICY.SECONDARY_ACTIONS.SETTINGS,
            });
        }

        if (canWriteTags && !hasAccountingConnections) {
            menuItems.push({
                icon: expensifyIcons.Table,
                text: translate('spreadsheet.importSpreadsheet'),
                onSelected: navigateToImportSpreadsheet,
                value: CONST.POLICY.SECONDARY_ACTIONS.IMPORT_SPREADSHEET,
            });
        }

        if (hasVisibleTags) {
            menuItems.push({
                icon: expensifyIcons.Download,
                text: translate('spreadsheet.downloadCSV'),
                onSelected: () => {
                    if (isOffline) {
                        showConfirmModal({
                            title: translate('common.youAppearToBeOffline'),
                            prompt: translate('common.thisFeatureRequiresInternet'),
                            confirmText: translate('common.buttonConfirm'),
                            shouldShowCancelButton: false,
                            shouldHandleNavigationBack: true,
                        });
                        return;
                    }
                    close(() => {
                        if (isMultiLevelTags) {
                            downloadMultiLevelTagsCSV(
                                policyID,
                                () => {
                                    setIsDownloadFailureModalVisible(true);
                                },
                                hasDependentTags,
                                translate,
                            );
                        } else {
                            downloadTagsCSV(
                                policyID,
                                () => {
                                    setIsDownloadFailureModalVisible(true);
                                },
                                translate,
                            );
                        }
                    });
                },
                value: CONST.POLICY.SECONDARY_ACTIONS.DOWNLOAD_CSV,
            });
        }

        return menuItems;
    }, [
        translate,
        shouldShowTagsSettings,
        navigateToTagsSettings,
        hasAccountingConnections,
        hasVisibleTags,
        navigateToImportSpreadsheet,
        isOffline,
        isMultiLevelTags,
        policyID,
        hasDependentTags,
        expensifyIcons,
        showConfirmModal,
        canWriteTags,
    ]);

    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const getHeaderButtons = () => {
        if (!canWriteTags && secondaryActions.length === 0) {
            return null;
        }

        const selectedTagsObject = selectedTagKeys.map((key) => policyTagLists.at(0)?.tags?.[key]);
        const selectedTagLists = selectedTagKeys.map((selectedTag) => policyTagLists.find((policyTagList) => policyTagList.name === selectedTag));

        if (!canWriteTags || (shouldUseNarrowLayout ? !isMobileSelectionModeEnabled : selectedTagKeys.length === 0)) {
            const hasPrimaryActions = canWriteTags && !hasAccountingConnections && !isMultiLevelTags && hasVisibleTags;
            return (
                <View style={[styles.flexRow, styles.gap2, shouldDisplayButtonsInSeparateLine && styles.mb3]}>
                    {hasPrimaryActions && (
                        <Button
                            success
                            onPress={navigateToCreateTagPage}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TAGS.ADD_BUTTON}
                            icon={expensifyIcons.Plus}
                            text={translate('workspace.tags.addTag')}
                            style={[shouldDisplayButtonsInSeparateLine && styles.flex1]}
                        />
                    )}
                    {secondaryActions.length > 0 && (
                        <ButtonWithDropdownMenu
                            variant={undefined}
                            onPress={() => {}}
                            shouldAlwaysShowDropdownMenu
                            customText={translate('common.more')}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TAGS.MORE_DROPDOWN}
                            options={secondaryActions}
                            isSplitButton={false}
                            wrapperStyle={isInLandscapeMode || hasPrimaryActions ? styles.flexGrow0 : styles.flexGrow1}
                        />
                    )}
                </View>
            );
        }

        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];

        if (!hasAccountingConnections && !isMultiLevelTags) {
            options.push({
                icon: expensifyIcons.Trashcan,
                text: translate(selectedTagKeys.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: async () => {
                    if (isDisablingOrDeletingLastEnabledTag(policyTagLists.at(0), selectedTagsObject)) {
                        showConfirmModal({
                            title: translate('workspace.tags.cannotDeleteOrDisableAllTags.title'),
                            prompt: translate('workspace.tags.cannotDeleteOrDisableAllTags.description'),
                            confirmText: translate('common.buttonConfirm'),
                            shouldShowCancelButton: false,
                        });
                        return;
                    }

                    const {action} = await showConfirmModal({
                        title: translate(selectedTagKeys.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags'),
                        prompt: translate(selectedTagKeys.length === 1 ? 'workspace.tags.deleteTagConfirmation' : 'workspace.tags.deleteTagsConfirmation'),
                        confirmText: translate('common.delete'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });
                    if (action === ModalActions.CONFIRM) {
                        deleteTags();
                    }
                },
            });
        }

        let enabledTagCount = 0;
        const tagsToDisable: Record<string, {name: string; enabled: boolean}> = {};
        let disabledTagCount = 0;
        const tagsToEnable: Record<string, {name: string; enabled: boolean}> = {};
        for (const tagName of selectedTagKeys) {
            if (tagRowsKeyedByName[tagName]?.enabled) {
                enabledTagCount++;
                tagsToDisable[tagName] = {
                    name: tagName,
                    enabled: false,
                };
            } else {
                disabledTagCount++;
                tagsToEnable[tagName] = {
                    name: tagName,
                    enabled: true,
                };
            }
        }

        if (enabledTagCount > 0 && !isMultiLevelTags) {
            options.push({
                icon: expensifyIcons.Close,
                text: translate(enabledTagCount === 1 ? 'workspace.tags.disableTag' : 'workspace.tags.disableTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
                onSelected: () => {
                    if (isDisablingOrDeletingLastEnabledTag(policyTagLists.at(0), selectedTagsObject)) {
                        showConfirmModal({
                            title: translate('workspace.tags.cannotDeleteOrDisableAllTags.title'),
                            prompt: translate('workspace.tags.cannotDeleteOrDisableAllTags.description'),
                            confirmText: translate('common.buttonConfirm'),
                            shouldShowCancelButton: false,
                        });
                        return;
                    }
                    clearTableSelection();

                    // Disable the selected tags
                    setWorkspaceTagEnabled(policyData, tagsToDisable, 0);
                },
            });
        }

        if (disabledTagCount > 0 && !isMultiLevelTags) {
            options.push({
                icon: expensifyIcons.Checkmark,
                text: translate(disabledTagCount === 1 ? 'workspace.tags.enableTag' : 'workspace.tags.enableTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                onSelected: () => {
                    clearTableSelection();
                    setWorkspaceTagEnabled(policyData, tagsToEnable, 0);
                },
            });
        }

        let requiredTagCount = 0;
        const tagListIndexesToMarkRequired: number[] = [];

        let optionalTagCount = 0;
        const tagListIndexesToMarkOptional: number[] = [];

        for (const tagName of selectedTagKeys) {
            if (tagRowsKeyedByName[tagName]?.required) {
                requiredTagCount++;
                tagListIndexesToMarkOptional.push(tagRowsKeyedByName[tagName]?.orderWeight ?? 0);
            } else {
                optionalTagCount++;
                tagListIndexesToMarkRequired.push(tagRowsKeyedByName[tagName]?.orderWeight ?? 0);
            }
        }

        if (requiredTagCount > 0 && !hasDependentTags && isMultiLevelTags) {
            options.push({
                icon: expensifyIcons.Close,
                text: translate('workspace.tags.notRequireTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.REQUIRE,
                onSelected: () => {
                    if (isMakingLastRequiredTagListOptional(policy, policyTags, selectedTagLists)) {
                        showConfirmModal({
                            title: translate('workspace.tags.cannotMakeAllTagsOptional.title'),
                            prompt: translate('workspace.tags.cannotMakeAllTagsOptional.description'),
                            confirmText: translate('common.buttonConfirm'),
                            shouldShowCancelButton: false,
                        });
                        return;
                    }
                    clearTableSelection();
                    setWorkspaceTagRequired(policyData, tagListIndexesToMarkOptional, false);
                },
            });
        }

        if (optionalTagCount > 0 && !hasDependentTags && isMultiLevelTags) {
            options.push({
                icon: expensifyIcons.Checkmark,
                text: translate(requiredTagCount === 1 ? 'workspace.tags.requireTag' : 'workspace.tags.requireTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.NOT_REQUIRED,
                onSelected: () => {
                    clearTableSelection();
                    setWorkspaceTagRequired(policyData, tagListIndexesToMarkRequired, true);
                },
            });
        }

        return (
            <ButtonWithDropdownMenu
                variant="success"
                onPress={() => null}
                shouldAlwaysShowDropdownMenu
                isSplitButton={false}
                size={CONST.BUTTON_SIZE.MEDIUM}
                customText={translate('workspace.common.selected', {count: selectedTagKeys.length})}
                options={options}
                style={[shouldDisplayButtonsInSeparateLine && styles.flexGrow1, shouldDisplayButtonsInSeparateLine && styles.mb3]}
                isDisabled={!selectedTagKeys.length}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TAGS.BULK_ACTIONS_DROPDOWN}
                testID="WorkspaceTagsPage-header-dropdown-menu-button"
            />
        );
    };

    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;

    const getHeaderSubtitle = () => {
        if (!hasSyncError && isConnectionVerified && currentConnectionName) {
            return (
                <ImportedFromAccountingSoftware
                    policyID={policyID}
                    currentConnectionName={currentConnectionName}
                    connectedIntegration={connectedIntegration}
                    translatedText={translate('workspace.tags.importedFromAccountingSoftware')}
                    customTagName={policyTagLists.at(0)?.name ?? ''}
                    shouldShow={!hasDependentTags && !hasIndependentTags}
                />
            );
        }

        if (!hasDependentTags && !hasIndependentTags && !!policyTagLists.at(0)?.name) {
            return (
                <Text style={[styles.textNormal, styles.colorMuted]}>
                    <EmployeesSeeTagsAsText customTagName={policyTagLists.at(0)?.name ?? ''} />
                </Text>
            );
        }

        const importSpreadsheetURL = isQuickSettingsFlow
            ? `${environmentURL}/${ROUTES.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo))}`
            : `${environmentURL}/${ROUTES.WORKSPACE_TAGS_IMPORT_OPTIONS.getRoute(policyID)}`;
        let subtitleHTML = `<muted-text>${translate('workspace.tags.subtitle')}</muted-text>`;
        if (hasDependentTags) {
            subtitleHTML = translate('workspace.tags.subtitleWithDependentTags', importSpreadsheetURL, canWriteTags);
        }

        return (
            <View style={[styles.flexRow, styles.renderHTML]}>
                <RenderHTML html={subtitleHTML} />
            </View>
        );
    };

    const headerContent = <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout && styles.workspaceSectionMobile]}>{getHeaderSubtitle()}</View>;

    const subtitleText = useMemo(() => {
        const emptyTagsSubtitle = hasAccountingConnections
            ? translate('workspace.tags.emptyTags.subtitleWithAccounting', `${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}`, canWriteTags)
            : translate('workspace.tags.emptyTags.subtitleHTML');
        return (
            <View style={[styles.renderHTML, styles.textAlignCenter, styles.alignItemsCenter]}>
                <RenderHTML html={emptyTagsSubtitle} />
            </View>
        );
    }, [hasAccountingConnections, translate, environmentURL, policyID, canWriteTags, styles.renderHTML, styles.textAlignCenter, styles.alignItemsCenter]);

    const emptyStateContent = (
        <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
            <GenericEmptyStateComponent
                {...genericIllustration}
                title={translate('workspace.tags.emptyTags.title')}
                subtitleText={subtitleText}
                headerStyles={styles.emptyStateCardIllustrationContainer}
                buttons={
                    canWriteTags && !hasAccountingConnections
                        ? [
                              {
                                  icon: expensifyIcons.Table,
                                  buttonText: translate('common.import'),
                                  buttonAction: navigateToImportSpreadsheet,
                              },
                              {
                                  success: true,
                                  buttonAction: navigateToCreateTagPage,
                                  icon: expensifyIcons.Plus,
                                  buttonText: translate('workspace.tags.addTag'),
                              },
                          ]
                        : undefined
                }
            />
        </ScrollView>
    );

    return (
        <>
            <AccessOrNotFoundWrapper
                policyID={policyID}
                accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
                policyFeature={CONST.POLICY.POLICY_FEATURE.TAGS}
            >
                <ScreenWrapper
                    enableEdgeToEdgeBottomSafeAreaPadding
                    shouldEnableMaxHeight
                    style={[styles.defaultModalContainer]}
                    testID="WorkspaceTagsPage"
                    shouldShowOfflineIndicatorInWideScreen
                    offlineIndicatorStyle={styles.mtAuto}
                >
                    <HeaderWithBackButton
                        icon={!selectionModeHeader ? illustrations.Tag : undefined}
                        shouldUseHeadlineHeader={!selectionModeHeader}
                        title={translate(selectionModeHeader ? 'common.selectMultiple' : 'workspace.common.tags')}
                        shouldShowBackButton={shouldUseNarrowLayout}
                        shouldDisplayHelpButton
                        onBackButtonPress={() => {
                            if (isMobileSelectionModeEnabled) {
                                clearTableSelection();
                                turnOffMobileSelectionMode();
                                return;
                            }

                            if (backTo) {
                                Navigation.goBack(backTo);
                                return;
                            }

                            Navigation.goBack();
                        }}
                    >
                        {!shouldDisplayButtonsInSeparateLine && getHeaderButtons()}
                    </HeaderWithBackButton>
                    {shouldDisplayButtonsInSeparateLine && !!getHeaderButtons() && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                    {(!hasVisibleTags || isLoading) && headerContent}
                    {isLoading && (
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            style={[styles.flex1]}
                            reasonAttributes={reasonAttributes}
                        />
                    )}
                    {!isLoading && (
                        <>
                            {hasVisibleTags && headerContent}

                            <WorkspaceTagsTable
                                tags={tagRows}
                                selectionEnabled={canWriteTags && !hasDependentTags}
                                selectedKeys={selectedTagKeys}
                                isMultiLevelTags={isMultiLevelTags}
                                hasDependentTags={hasDependentTags}
                                shouldShowGLCodeColumn={shouldShowGLCodeColumn}
                                shouldShowApproverColumn={shouldShowApproverColumn}
                                onRowSelectionChange={setSelectedTagKeys}
                                EmptyStateComponent={emptyStateContent}
                            />
                        </>
                    )}
                </ScreenWrapper>
            </AccessOrNotFoundWrapper>
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setIsDownloadFailureModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isDownloadFailureModalVisible}
                onClose={() => setIsDownloadFailureModalVisible(false)}
            />
        </>
    );
}

export default WorkspaceTagsPage;
