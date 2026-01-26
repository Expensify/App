import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import DecisionModal from '@components/DecisionModal';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImportedFromAccountingSoftware from '@components/ImportedFromAccountingSoftware';
import LottieAnimations from '@components/LottieAnimations';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SearchBar from '@components/SearchBar';
import TableListItem from '@components/SelectionList/ListItem/TableListItem';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import ListItemRightCaretWithLabel from '@components/SelectionListWithModal/ListItemRightCaretWithLabel';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicyData from '@hooks/usePolicyData';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useSearchResults from '@hooks/useSearchResults';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
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
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {isDisablingOrDeletingLastEnabledTag, isMakingLastRequiredTagListOptional} from '@libs/OptionsListUtils';
import {
    getCleanedTagName,
    getConnectedIntegration,
    getCurrentConnectionName,
    getTagLists,
    hasAccountingConnections as hasAccountingConnectionsPolicyUtils,
    hasDependentTags as hasDependentTagsPolicyUtils,
    isControlPolicy,
    isMultiLevelTags as isMultiLevelTagsPolicyUtils,
    shouldShowSyncError,
} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {close} from '@userActions/Modal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type {PolicyTag, PolicyTagList, TagListItem} from './types';

type WorkspaceTagsPageProps =
    | PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS>
    | PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_ROOT>;

function WorkspaceTagsPage({route}: WorkspaceTagsPageProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, localeCompare} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [isDownloadFailureModalVisible, setIsDownloadFailureModalVisible] = useState(false);
    const {backTo, policyID} = route.params;
    const policyData = usePolicyData(policyID);
    const {policy, tags: policyTags} = policyData;
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const {environmentURL} = useEnvironment();
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`, {canBeMissing: true});
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress);
    const connectedIntegration = getConnectedIntegration(policy) ?? connectionSyncProgress?.connectionName;
    const isConnectionVerified = connectedIntegration && !isConnectionUnverified(policy, connectedIntegration);
    const currentConnectionName = getCurrentConnectionName(policy);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Gear', 'Table', 'Download', 'Plus', 'Trashcan', 'Close', 'Trashcan', 'Checkmark']);

    const [policyTagLists, isMultiLevelTags, hasDependentTags] = useMemo(
        () => [getTagLists(policyTags), isMultiLevelTagsPolicyUtils(policyTags), hasDependentTagsPolicyUtils(policy, policyTags)],
        [policy, policyTags],
    );

    const canSelectMultiple = !hasDependentTags && (shouldUseNarrowLayout ? isMobileSelectionModeEnabled : true);
    const isControlPolicyWithWideLayout = !shouldUseNarrowLayout && isControlPolicy(policy);
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

    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const isTagSelected = useCallback((tag: TagListItem) => selectedTags.includes(tag.value), [selectedTags]);

    const {isOffline} = useNetwork({onReconnect: fetchTags});

    useEffect(() => {
        fetchTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedTags.length === 0 || !canSelectMultiple) {
            return;
        }

        setSelectedTags((prevSelectedTags) => {
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
    const cleanupSelectedOption = useCallback(() => setSelectedTags([]), []);
    useCleanupSelectedOptions(cleanupSelectedOption);

    useSearchBackPress({
        onClearSelection: () => {
            setSelectedTags([]);
        },
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
            setWorkspaceTagEnabled(policyData, {[tagName]: {name: tagName, enabled: value}}, 0);
        },
        [policyData],
    );

    const updateWorkspaceRequiresTag = useCallback(
        (value: boolean, orderWeight: number) => {
            setPolicyTagsRequired(policyData, value, orderWeight);
        },
        [policyData],
    );
    const glCodeContainerStyle = useMemo(() => [styles.flex1], [styles.flex1]);
    const glCodeTextStyle = useMemo(() => [styles.alignSelfStart], [styles.alignSelfStart]);
    const switchContainerStyle = useMemo(() => [StyleUtils.getMinimumWidth(variables.w72)], [StyleUtils]);

    const tagList = useMemo<TagListItem[]>(() => {
        if (isMultiLevelTags) {
            return policyTagLists.map((policyTagList) => {
                const areTagsEnabled = !!Object.values(policyTagList?.tags ?? {}).some((tag) => tag.enabled);
                const isSwitchDisabled = !policyTagList.required && !areTagsEnabled;
                const isSwitchEnabled = policyTagList.required && areTagsEnabled;

                if (policyTagList.required && !areTagsEnabled) {
                    updateWorkspaceRequiresTag(false, policyTagList.orderWeight);
                }
                return {
                    value: policyTagList.name,
                    orderWeight: policyTagList.orderWeight,
                    text: getCleanedTagName(policyTagList.name),
                    alternateText: !hasDependentTags ? translate('workspace.tags.tagCount', {count: Object.keys(policyTagList?.tags ?? {}).length}) : '',
                    keyForList: getCleanedTagName(policyTagList.name),
                    pendingAction: getPendingAction(policyTagList),
                    enabled: true,
                    required: policyTagList.required,
                    isDisabledCheckbox: isSwitchDisabled,
                    rightElement: hasDependentTags ? (
                        <ListItemRightCaretWithLabel labelText={translate('workspace.tags.tagCount', {count: Object.keys(policyTagList?.tags ?? {}).length})} />
                    ) : (
                        <Switch
                            isOn={isSwitchEnabled}
                            accessibilityLabel={translate('workspace.tags.requiresTag')}
                            onToggle={(newValue: boolean) => {
                                if (isMakingLastRequiredTagListOptional(policy, policyTags, [policyTagList])) {
                                    showConfirmModal({
                                        title: translate('workspace.tags.cannotMakeAllTagsOptional.title'),
                                        prompt: translate('workspace.tags.cannotMakeAllTagsOptional.description'),
                                        confirmText: translate('common.buttonConfirm'),
                                        shouldShowCancelButton: false,
                                    });
                                    return;
                                }

                                updateWorkspaceRequiresTag(newValue, policyTagList.orderWeight);
                            }}
                            disabled={isSwitchDisabled}
                            showLockIcon={isMakingLastRequiredTagListOptional(policy, policyTags, [policyTagList])}
                        />
                    ),
                };
            });
        }

        return Object.values(policyTagLists?.at(0)?.tags ?? {}).map((tag) => ({
            value: tag.name,
            text: getCleanedTagName(tag.name),
            keyForList: tag.name,
            pendingAction: tag.pendingAction,
            errors: tag.errors ?? undefined,
            enabled: tag.enabled,
            isDisabled: tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            rightElement: isControlPolicyWithWideLayout ? (
                <>
                    <View style={glCodeContainerStyle}>
                        <Text
                            numberOfLines={1}
                            style={glCodeTextStyle}
                        >
                            {tag['GL Code']}
                        </Text>
                    </View>
                    <View style={switchContainerStyle}>
                        <Switch
                            isOn={tag.enabled}
                            disabled={tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                            accessibilityLabel={translate('workspace.tags.enableTag')}
                            onToggle={(newValue: boolean) => {
                                if (isDisablingOrDeletingLastEnabledTag(policyTagLists.at(0), [tag])) {
                                    showConfirmModal({
                                        title: translate('workspace.tags.cannotDeleteOrDisableAllTags.title'),
                                        prompt: translate('workspace.tags.cannotDeleteOrDisableAllTags.description'),
                                        confirmText: translate('common.buttonConfirm'),
                                        shouldShowCancelButton: false,
                                    });
                                    return;
                                }
                                updateWorkspaceTagEnabled(newValue, tag.name);
                            }}
                            showLockIcon={isDisablingOrDeletingLastEnabledTag(policyTagLists.at(0), [tag])}
                        />
                    </View>
                </>
            ) : (
                <Switch
                    isOn={tag.enabled}
                    disabled={tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                    accessibilityLabel={translate('workspace.tags.enableTag')}
                    onToggle={(newValue: boolean) => {
                        if (isDisablingOrDeletingLastEnabledTag(policyTagLists.at(0), [tag])) {
                            showConfirmModal({
                                title: translate('workspace.tags.cannotDeleteOrDisableAllTags.title'),
                                prompt: translate('workspace.tags.cannotDeleteOrDisableAllTags.description'),
                                confirmText: translate('common.buttonConfirm'),
                                shouldShowCancelButton: false,
                            });
                            return;
                        }
                        updateWorkspaceTagEnabled(newValue, tag.name);
                    }}
                    showLockIcon={isDisablingOrDeletingLastEnabledTag(policyTagLists.at(0), [tag])}
                />
            ),
        }));
    }, [
        isMultiLevelTags,
        policyTagLists,
        hasDependentTags,
        translate,
        policy,
        policyTags,
        updateWorkspaceRequiresTag,
        updateWorkspaceTagEnabled,
        isControlPolicyWithWideLayout,
        glCodeContainerStyle,
        glCodeTextStyle,
        switchContainerStyle,
        showConfirmModal,
    ]);

    const filterTag = useCallback((tag: TagListItem, searchInput: string) => {
        const results = tokenizedSearch([tag], searchInput, (option) => [option.text ?? '', option.value ?? '']);
        return results.length > 0;
    }, []);
    const sortTags = useCallback(
        (tags: TagListItem[]) => {
            // For multi-level tags, preserve the policy order (by orderWeight) instead of sorting alphabetically
            if (hasDependentTags || isMultiLevelTags) {
                return tags.sort((a, b) => (a.orderWeight ?? 0) - (b.orderWeight ?? 0));
            }
            // For other cases, sort alphabetically by name
            return tags.sort((a, b) => localeCompare(a.value, b.value));
        },
        [hasDependentTags, isMultiLevelTags, localeCompare],
    );
    const [inputValue, setInputValue, filteredTagList] = useSearchResults(tagList, filterTag, sortTags);

    const filteredTagListKeyedByName = useMemo(
        () =>
            filteredTagList.reduce<Record<string, TagListItem>>((acc, tag) => {
                acc[tag.value] = tag;
                return acc;
            }, {}),
        [filteredTagList],
    );

    const toggleTag = (tag: TagListItem) => {
        setSelectedTags((prev) => {
            if (prev.includes(tag.value)) {
                return prev.filter((item) => item !== tag.value);
            }
            return [...prev, tag.value];
        });
    };

    const toggleAllTags = () => {
        const availableTags = filteredTagList.filter((tag) => tag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !tag.isDisabledCheckbox);
        setSelectedTags(selectedTags.length > 0 ? [] : availableTags.map((item) => item.value));
    };

    const getCustomListHeader = () => {
        if (hasDependentTags) {
            return (
                <CustomListHeader
                    canSelectMultiple={false}
                    leftHeaderText={translate('common.name')}
                    rightHeaderText={translate('common.count')}
                    shouldShowRightCaret
                />
            );
        }

        // Show GL Code column only on wide screens for control policies
        if (isControlPolicyWithWideLayout && !isMultiLevelTags) {
            return (
                <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3]}>
                    <View style={[styles.flex1, StyleUtils.getPaddingRight(variables.w52 + variables.w12)]}>
                        <Text style={[styles.textMicroSupporting, styles.alignSelfStart]}>{translate('common.name')}</Text>
                    </View>
                    <View style={[styles.flex1, styles.pr16]}>
                        <Text style={[styles.textMicroSupporting, styles.alignSelfStart]}>{translate('workspace.tags.glCode')}</Text>
                    </View>
                    <View style={[StyleUtils.getMinimumWidth(variables.w72), styles.mr5]}>
                        <Text style={[styles.textMicroSupporting, styles.alignSelfStart]}>{translate('common.enabled')}</Text>
                    </View>
                </View>
            );
        }

        return (
            <CustomListHeader
                canSelectMultiple={canSelectMultiple}
                leftHeaderText={translate('common.name')}
                rightHeaderText={translate(isMultiLevelTags ? 'common.required' : 'common.enabled')}
                shouldShowRightCaret
            />
        );
    };

    const navigateToTagsSettings = useCallback(() => {
        Navigation.navigate(isQuickSettingsFlow ? ROUTES.SETTINGS_TAGS_SETTINGS.getRoute(policyID, backTo) : ROUTES.WORKSPACE_TAGS_SETTINGS.getRoute(policyID));
    }, [isQuickSettingsFlow, policyID, backTo]);

    const navigateToCreateTagPage = () => {
        Navigation.navigate(isQuickSettingsFlow ? ROUTES.SETTINGS_TAG_CREATE.getRoute(policyID, backTo) : ROUTES.WORKSPACE_TAG_CREATE.getRoute(policyID));
    };

    const navigateToTagSettings = (tag: TagListItem) => {
        if (isSmallScreenWidth && isMobileSelectionModeEnabled) {
            toggleTag(tag);
            return;
        }
        if (tag.orderWeight !== undefined) {
            Navigation.navigate(
                isQuickSettingsFlow ? ROUTES.SETTINGS_TAG_LIST_VIEW.getRoute(policyID, tag.orderWeight, backTo) : ROUTES.WORKSPACE_TAG_LIST_VIEW.getRoute(policyID, tag.orderWeight),
            );
        } else {
            Navigation.navigate(isQuickSettingsFlow ? ROUTES.SETTINGS_TAG_SETTINGS.getRoute(policyID, 0, tag.value, backTo) : ROUTES.WORKSPACE_TAG_SETTINGS.getRoute(policyID, 0, tag.value));
        }
    };

    const deleteTags = useCallback(() => {
        deletePolicyTags(policyData, selectedTags);

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            setSelectedTags([]);
            if (isMobileSelectionModeEnabled && selectedTags.length === Object.keys(policyTagLists.at(0)?.tags ?? {}).length) {
                turnOffMobileSelectionMode();
            }
        });
    }, [policyData, selectedTags, isMobileSelectionModeEnabled, policyTagLists, setSelectedTags]);

    const isLoading = !isOffline && policyTags === undefined;
    const hasVisibleTags = tagList.some((tag) => tag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);

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
        menuItems.push({
            icon: expensifyIcons.Gear,
            text: translate('common.settings'),
            onSelected: navigateToTagsSettings,
            value: CONST.POLICY.SECONDARY_ACTIONS.SETTINGS,
        });

        if (!hasAccountingConnections) {
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
    ]);

    const getHeaderButtons = () => {
        const selectedTagsObject = selectedTags.map((key) => policyTagLists.at(0)?.tags?.[key]);
        const selectedTagLists = selectedTags.map((selectedTag) => policyTagLists.find((policyTagList) => policyTagList.name === selectedTag));

        if (shouldUseNarrowLayout ? !isMobileSelectionModeEnabled : selectedTags.length === 0) {
            const hasPrimaryActions = !hasAccountingConnections && !isMultiLevelTags && hasVisibleTags;
            return (
                <View style={[styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
                    {hasPrimaryActions && (
                        <Button
                            success
                            onPress={navigateToCreateTagPage}
                            icon={expensifyIcons.Plus}
                            text={translate('workspace.tags.addTag')}
                            style={[shouldUseNarrowLayout && styles.flex1]}
                        />
                    )}
                    <ButtonWithDropdownMenu
                        success={false}
                        onPress={() => {}}
                        shouldAlwaysShowDropdownMenu
                        customText={translate('common.more')}
                        options={secondaryActions}
                        isSplitButton={false}
                        wrapperStyle={hasPrimaryActions ? styles.flexGrow0 : styles.flexGrow1}
                    />
                </View>
            );
        }

        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];

        if (!hasAccountingConnections && !isMultiLevelTags) {
            options.push({
                icon: expensifyIcons.Trashcan,
                text: translate(selectedTags.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags'),
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
                        title: translate(selectedTags.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags'),
                        prompt: translate(selectedTags.length === 1 ? 'workspace.tags.deleteTagConfirmation' : 'workspace.tags.deleteTagsConfirmation'),
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
        for (const tagName of selectedTags) {
            if (filteredTagListKeyedByName[tagName]?.enabled) {
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
                    setSelectedTags([]);

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
                    setSelectedTags([]);
                    setWorkspaceTagEnabled(policyData, tagsToEnable, 0);
                },
            });
        }

        let requiredTagCount = 0;
        const tagListIndexesToMarkRequired: number[] = [];

        let optionalTagCount = 0;
        const tagListIndexesToMarkOptional: number[] = [];

        for (const tagName of selectedTags) {
            if (filteredTagListKeyedByName[tagName]?.required) {
                requiredTagCount++;
                tagListIndexesToMarkOptional.push(filteredTagListKeyedByName[tagName]?.orderWeight ?? 0);
            } else {
                optionalTagCount++;
                tagListIndexesToMarkRequired.push(filteredTagListKeyedByName[tagName]?.orderWeight ?? 0);
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
                    setSelectedTags([]);
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
                    setSelectedTags([]);
                    setWorkspaceTagRequired(policyData, tagListIndexesToMarkRequired, true);
                },
            });
        }

        return (
            <ButtonWithDropdownMenu
                onPress={() => null}
                shouldAlwaysShowDropdownMenu
                isSplitButton={false}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                customText={translate('workspace.common.selected', {count: selectedTags.length})}
                options={options}
                style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                isDisabled={!selectedTags.length}
                testID="WorkspaceTagsPage-header-dropdown-menu-button"
            />
        );
    };

    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;

    const headerContent = (
        <>
            <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : undefined]}>
                {!hasSyncError && isConnectionVerified && currentConnectionName ? (
                    <ImportedFromAccountingSoftware
                        policyID={policyID}
                        currentConnectionName={currentConnectionName}
                        connectedIntegration={connectedIntegration}
                        translatedText={translate('workspace.tags.importedFromAccountingSoftware')}
                    />
                ) : (
                    <Text style={[styles.textNormal, styles.colorMuted]}>
                        {translate('workspace.tags.subtitle')}
                        {hasDependentTags && (
                            <View style={[styles.renderHTML]}>
                                <RenderHTML
                                    html={translate(
                                        'workspace.tags.dependentMultiLevelTagsSubtitle',
                                        isQuickSettingsFlow
                                            ? `${environmentURL}/${ROUTES.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo))}`
                                            : `${environmentURL}/${ROUTES.WORKSPACE_TAGS_IMPORT_OPTIONS.getRoute(policyID)}`,
                                    )}
                                />
                            </View>
                        )}
                    </Text>
                )}
            </View>
            {tagList.length > CONST.SEARCH_ITEM_LIMIT && (
                <SearchBar
                    label={translate('workspace.tags.findTag')}
                    inputValue={inputValue}
                    onChangeText={setInputValue}
                    shouldShowEmptyState={hasVisibleTags && !isLoading && !filteredTagList.length}
                />
            )}
        </>
    );

    const subtitleText = useMemo(() => {
        const emptyTagsSubtitle = hasAccountingConnections
            ? translate('workspace.tags.emptyTags.subtitleWithAccounting', `${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}`)
            : translate('workspace.tags.emptyTags.subtitleHTML');
        return (
            <View style={[styles.renderHTML]}>
                <RenderHTML html={emptyTagsSubtitle} />
            </View>
        );
    }, [hasAccountingConnections, translate, environmentURL, policyID, styles.renderHTML]);

    return (
        <>
            <AccessOrNotFoundWrapper
                policyID={policyID}
                accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
            >
                <ScreenWrapper
                    enableEdgeToEdgeBottomSafeAreaPadding
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
                        onBackButtonPress={() => {
                            if (isMobileSelectionModeEnabled) {
                                setSelectedTags([]);
                                turnOffMobileSelectionMode();
                                return;
                            }

                            if (backTo) {
                                Navigation.goBack(backTo);
                                return;
                            }

                            Navigation.popToSidebar();
                        }}
                    >
                        {!shouldUseNarrowLayout && getHeaderButtons()}
                    </HeaderWithBackButton>
                    {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                    {(!hasVisibleTags || isLoading) && headerContent}
                    {isLoading && (
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            style={[styles.flex1]}
                        />
                    )}
                    {hasVisibleTags && !isLoading && (
                        <SelectionListWithModal
                            data={filteredTagList}
                            ListItem={TableListItem}
                            selectedItems={selectedTags}
                            onSelectRow={navigateToTagSettings}
                            canSelectMultiple={canSelectMultiple}
                            onSelectAll={filteredTagList.length > 0 ? toggleAllTags : undefined}
                            customListHeader={filteredTagList.length > 0 ? getCustomListHeader() : undefined}
                            onDismissError={(item) => !hasDependentTags && clearPolicyTagErrors({policyID, tagName: item.value, tagListIndex: 0, policyTags})}
                            style={{listHeaderWrapperStyle: [styles.ph9, styles.pv3, styles.pb5]}}
                            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                            onTurnOnSelectionMode={(item) => item && toggleTag(item)}
                            turnOnSelectionModeOnLongPress={!hasDependentTags}
                            shouldSingleExecuteRowSelect={!canSelectMultiple}
                            shouldUseDefaultRightHandSideCheckmark={false}
                            customListHeaderContent={headerContent}
                            showListEmptyContent={false}
                            showScrollIndicator={false}
                            onCheckboxPress={toggleTag}
                            isSelected={isTagSelected}
                            shouldHeaderBeInsideList
                            shouldShowRightCaret
                        />
                    )}
                    {!hasVisibleTags && !isLoading && (
                        <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                            <EmptyStateComponent
                                SkeletonComponent={TableListItemSkeleton}
                                headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                                headerMedia={LottieAnimations.GenericEmptyState}
                                title={translate('workspace.tags.emptyTags.title')}
                                subtitleText={subtitleText}
                                headerStyles={[styles.emptyStateCardIllustrationContainer, styles.emptyFolderBG]}
                                lottieWebViewStyles={styles.emptyStateFolderWebStyles}
                                headerContentStyles={styles.emptyStateFolderWebStyles}
                                buttons={
                                    !hasAccountingConnections
                                        ? [
                                              {
                                                  success: true,
                                                  buttonAction: navigateToCreateTagPage,
                                                  icon: expensifyIcons.Plus,
                                                  buttonText: translate('workspace.tags.addTag'),
                                              },
                                              {
                                                  icon: expensifyIcons.Table,
                                                  buttonText: translate('common.import'),
                                                  buttonAction: navigateToImportSpreadsheet,
                                              },
                                          ]
                                        : undefined
                                }
                            />
                        </ScrollView>
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
