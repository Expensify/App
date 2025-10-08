import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ImportedFromAccountingSoftware from '@components/ImportedFromAccountingSoftware';
import LottieAnimations from '@components/LottieAnimations';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SearchBar from '@components/SearchBar';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import ListItemRightCaretWithLabel from '@components/SelectionListWithSections/ListItemRightCaretWithLabel';
import TableListItem from '@components/SelectionListWithSections/TableListItem';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {isConnectionInProgress, isConnectionUnverified} from '@libs/actions/connections';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {
    clearPolicyTagErrors,
    deletePolicyTags,
    downloadMultiLevelIndependentTagsCSV,
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
    hasIndependentTags as hasIndependentTagsPolicyUtils,
    isMultiLevelTags as isMultiLevelTagsPolicyUtils,
    shouldShowSyncError,
} from '@libs/PolicyUtils';
import StringUtils from '@libs/StringUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
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
    const {translate, localeCompare} = useLocalize();
    const [isDownloadFailureModalVisible, setIsDownloadFailureModalVisible] = useState(false);
    const [isDeleteTagsConfirmModalVisible, setIsDeleteTagsConfirmModalVisible] = useState(false);
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [isCannotDeleteOrDisableLastTagModalVisible, setIsCannotDeleteOrDisableLastTagModalVisible] = useState(false);
    const [isCannotMakeLastTagOptionalModalVisible, setIsCannotMakeLastTagOptionalModalVisible] = useState(false);
    const policyID = route.params.policyID;
    const backTo = route.params.backTo;
    const policy = usePolicy(policyID);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const {environmentURL} = useEnvironment();
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`, {canBeMissing: true});
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress);
    const connectedIntegration = getConnectedIntegration(policy) ?? connectionSyncProgress?.connectionName;
    const isConnectionVerified = connectedIntegration && !isConnectionUnverified(policy, connectedIntegration);
    const currentConnectionName = getCurrentConnectionName(policy);
    const [policyTagLists, isMultiLevelTags, hasDependentTags, hasIndependentTags] = useMemo(
        () => [getTagLists(policyTags), isMultiLevelTagsPolicyUtils(policyTags), hasDependentTagsPolicyUtils(policy, policyTags), hasIndependentTagsPolicyUtils(policy, policyTags)],
        [policy, policyTags],
    );
    const canSelectMultiple = !hasDependentTags && (shouldUseNarrowLayout ? isMobileSelectionModeEnabled : true);
    const fetchTags = useCallback(() => {
        openPolicyTagsPage(policyID);
    }, [policyID]);
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_ROOT;

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
        // eslint-disable-next-line react-compiler/react-compiler
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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
            setWorkspaceTagEnabled({policyID, tagsToUpdate: {[tagName]: {name: tagName, enabled: value}}, tagListIndex: 0, policyTags});
        },
        [policyID, policyTags],
    );

    const updateWorkspaceRequiresTag = useCallback(
        (value: boolean, orderWeight: number) => {
            setPolicyTagsRequired(policyID, value, orderWeight);
        },
        [policyID],
    );

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
                        <ListItemRightCaretWithLabel
                            labelText={translate('workspace.tags.tagCount', {count: Object.keys(policyTagList?.tags ?? {}).length})}
                            shouldShowCaret
                        />
                    ) : (
                        <Switch
                            isOn={isSwitchEnabled}
                            accessibilityLabel={translate('workspace.tags.requiresTag')}
                            onToggle={(newValue: boolean) => {
                                if (isMakingLastRequiredTagListOptional(policy, policyTags, [policyTagList])) {
                                    setIsCannotMakeLastTagOptionalModalVisible(true);
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
            rightElement: (
                <Switch
                    isOn={tag.enabled}
                    disabled={tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                    accessibilityLabel={translate('workspace.tags.enableTag')}
                    onToggle={(newValue: boolean) => {
                        if (isDisablingOrDeletingLastEnabledTag(policyTagLists.at(0), [tag])) {
                            setIsCannotDeleteOrDisableLastTagModalVisible(true);
                            return;
                        }
                        updateWorkspaceTagEnabled(newValue, tag.name);
                    }}
                    showLockIcon={isDisablingOrDeletingLastEnabledTag(policyTagLists.at(0), [tag])}
                />
            ),
        }));
    }, [isMultiLevelTags, policyTagLists, hasDependentTags, translate, policy, policyTags, updateWorkspaceRequiresTag, updateWorkspaceTagEnabled]);

    const filterTag = useCallback((tag: TagListItem, searchInput: string) => {
        const tagText = StringUtils.normalize(tag.text?.toLowerCase() ?? '');
        const tagValue = StringUtils.normalize(tag.value?.toLowerCase() ?? '');
        const normalizeSearchInput = StringUtils.normalize(searchInput.toLowerCase());
        return tagText.includes(normalizeSearchInput) || tagValue.includes(normalizeSearchInput);
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
                    rightHeaderMinimumWidth={120}
                />
            );
        }

        return (
            <CustomListHeader
                canSelectMultiple={canSelectMultiple}
                leftHeaderText={translate('common.name')}
                rightHeaderText={translate(isMultiLevelTags ? 'common.required' : 'common.enabled')}
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

    const deleteTags = () => {
        deletePolicyTags(policyID, selectedTags, policyTags);
        setIsDeleteTagsConfirmModalVisible(false);

        // eslint-disable-next-line deprecation/deprecation
        InteractionManager.runAfterInteractions(() => {
            setSelectedTags([]);
            if (isMobileSelectionModeEnabled && selectedTags.length === Object.keys(policyTagLists.at(0)?.tags ?? {}).length) {
                turnOffMobileSelectionMode();
            }
        });
    };

    const isLoading = !isOffline && policyTags === undefined;
    const hasVisibleTags = tagList.some((tag) => tag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);

    const navigateToImportSpreadsheet = useCallback(() => {
        if (isOffline) {
            close(() => setIsOfflineModalVisible(true));
            return;
        }
        Navigation.navigate(
            isQuickSettingsFlow
                ? ROUTES.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo))
                : ROUTES.WORKSPACE_TAGS_IMPORT_OPTIONS.getRoute(policyID),
        );
    }, [backTo, isOffline, isQuickSettingsFlow, policyID]);

    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const secondaryActions = useMemo(() => {
        const menuItems = [];
        menuItems.push({
            icon: Expensicons.Gear,
            text: translate('common.settings'),
            onSelected: navigateToTagsSettings,
            value: CONST.POLICY.SECONDARY_ACTIONS.SETTINGS,
        });

        if (!hasAccountingConnections) {
            menuItems.push({
                icon: Expensicons.Table,
                text: translate('spreadsheet.importSpreadsheet'),
                onSelected: navigateToImportSpreadsheet,
                value: CONST.POLICY.SECONDARY_ACTIONS.IMPORT_SPREADSHEET,
            });
        }

        if (hasVisibleTags && !hasDependentTags) {
            menuItems.push({
                icon: Expensicons.Download,
                text: translate('spreadsheet.downloadCSV'),
                onSelected: () => {
                    if (isOffline) {
                        close(() => setIsOfflineModalVisible(true));
                        return;
                    }
                    close(() => {
                        if (hasIndependentTags) {
                            downloadMultiLevelIndependentTagsCSV(policyID, () => {
                                setIsDownloadFailureModalVisible(true);
                            });
                        } else {
                            downloadTagsCSV(policyID, () => {
                                setIsDownloadFailureModalVisible(true);
                            });
                        }
                    });
                },
                value: CONST.POLICY.SECONDARY_ACTIONS.DOWNLOAD_CSV,
            });
        }

        return menuItems;
    }, [translate, navigateToTagsSettings, hasDependentTags, hasVisibleTags, isOffline, policyID, hasIndependentTags, hasAccountingConnections, navigateToImportSpreadsheet]);

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
                            icon={Expensicons.Plus}
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
                icon: Expensicons.Trashcan,
                text: translate(selectedTags.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: () => {
                    if (isDisablingOrDeletingLastEnabledTag(policyTagLists.at(0), selectedTagsObject)) {
                        setIsCannotDeleteOrDisableLastTagModalVisible(true);
                        return;
                    }

                    setIsDeleteTagsConfirmModalVisible(true);
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
                icon: Expensicons.Close,
                text: translate(enabledTagCount === 1 ? 'workspace.tags.disableTag' : 'workspace.tags.disableTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
                onSelected: () => {
                    if (isDisablingOrDeletingLastEnabledTag(policyTagLists.at(0), selectedTagsObject)) {
                        setIsCannotDeleteOrDisableLastTagModalVisible(true);
                        return;
                    }
                    setSelectedTags([]);
                    setWorkspaceTagEnabled({policyID, tagsToUpdate: tagsToDisable, tagListIndex: 0, policyTags});
                },
            });
        }

        if (disabledTagCount > 0 && !isMultiLevelTags) {
            options.push({
                icon: Expensicons.Checkmark,
                text: translate(disabledTagCount === 1 ? 'workspace.tags.enableTag' : 'workspace.tags.enableTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                onSelected: () => {
                    setSelectedTags([]);
                    setWorkspaceTagEnabled({policyID, tagsToUpdate: tagsToEnable, tagListIndex: 0, policyTags});
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
                icon: Expensicons.Close,
                text: translate('workspace.tags.notRequireTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.REQUIRE,
                onSelected: () => {
                    if (isMakingLastRequiredTagListOptional(policy, policyTags, selectedTagLists)) {
                        setIsCannotMakeLastTagOptionalModalVisible(true);
                        return;
                    }
                    setSelectedTags([]);
                    setWorkspaceTagRequired(policyID, tagListIndexesToMarkOptional, false, policyTags);
                },
            });
        }

        if (optionalTagCount > 0 && !hasDependentTags && isMultiLevelTags) {
            options.push({
                icon: Expensicons.Checkmark,
                text: translate(requiredTagCount === 1 ? 'workspace.tags.requireTag' : 'workspace.tags.requireTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.NOT_REQUIRED,
                onSelected: () => {
                    setSelectedTags([]);
                    setWorkspaceTagRequired(policyID, tagListIndexesToMarkRequired, true, policyTags);
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
                testID={`${WorkspaceTagsPage.displayName}-header-dropdown-menu-button`}
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
                                    html={translate('workspace.tags.dependentMultiLevelTagsSubtitle', {
                                        importSpreadsheetLink: isQuickSettingsFlow
                                            ? `${environmentURL}/${ROUTES.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo))}`
                                            : `${environmentURL}/${ROUTES.WORKSPACE_TAGS_IMPORT_OPTIONS.getRoute(policyID)}`,
                                    })}
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
            ? translate('workspace.tags.emptyTags.subtitleWithAccounting', {
                  accountingPageURL: `${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}`,
              })
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
                    testID={WorkspaceTagsPage.displayName}
                    shouldShowOfflineIndicatorInWideScreen
                    offlineIndicatorStyle={styles.mtAuto}
                >
                    <HeaderWithBackButton
                        icon={!selectionModeHeader ? Illustrations.Tag : undefined}
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
                            canSelectMultiple={canSelectMultiple}
                            turnOnSelectionModeOnLongPress={!hasDependentTags}
                            onTurnOnSelectionMode={(item) => item && toggleTag(item)}
                            sections={[{data: filteredTagList, isDisabled: false}]}
                            shouldUseDefaultRightHandSideCheckmark={false}
                            selectedItems={selectedTags}
                            isSelected={isTagSelected}
                            onCheckboxPress={toggleTag}
                            onSelectRow={navigateToTagSettings}
                            shouldSingleExecuteRowSelect={!canSelectMultiple}
                            onSelectAll={filteredTagList.length > 0 ? toggleAllTags : undefined}
                            ListItem={TableListItem}
                            customListHeader={filteredTagList.length > 0 ? getCustomListHeader() : undefined}
                            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                            listHeaderContent={headerContent}
                            shouldShowListEmptyContent={false}
                            listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                            onDismissError={(item) => !hasDependentTags && clearPolicyTagErrors({policyID, tagName: item.value, tagListIndex: 0, policyTags})}
                            showScrollIndicator={false}
                            addBottomSafeAreaPadding
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
                                                  icon: Expensicons.Plus,
                                                  buttonText: translate('workspace.tags.addTag'),
                                              },
                                              {
                                                  icon: Expensicons.Table,
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
            <ConfirmModal
                isVisible={isOfflineModalVisible}
                onConfirm={() => setIsOfflineModalVisible(false)}
                title={translate('common.youAppearToBeOffline')}
                prompt={translate('common.thisFeatureRequiresInternet')}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
                onCancel={() => setIsOfflineModalVisible(false)}
                shouldHandleNavigationBack
            />
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setIsDownloadFailureModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isDownloadFailureModalVisible}
                onClose={() => setIsDownloadFailureModalVisible(false)}
            />
            <ConfirmModal
                isVisible={isDeleteTagsConfirmModalVisible}
                onConfirm={deleteTags}
                onCancel={() => setIsDeleteTagsConfirmModalVisible(false)}
                title={translate(selectedTags.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags')}
                prompt={translate(selectedTags.length === 1 ? 'workspace.tags.deleteTagConfirmation' : 'workspace.tags.deleteTagsConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
            <ConfirmModal
                isVisible={isCannotDeleteOrDisableLastTagModalVisible}
                onConfirm={() => setIsCannotDeleteOrDisableLastTagModalVisible(false)}
                onCancel={() => setIsCannotDeleteOrDisableLastTagModalVisible(false)}
                title={translate('workspace.tags.cannotDeleteOrDisableAllTags.title')}
                prompt={translate('workspace.tags.cannotDeleteOrDisableAllTags.description')}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
            <ConfirmModal
                isVisible={isCannotMakeLastTagOptionalModalVisible}
                onConfirm={() => setIsCannotMakeLastTagOptionalModalVisible(false)}
                onCancel={() => setIsCannotMakeLastTagOptionalModalVisible(false)}
                title={translate('workspace.tags.cannotMakeAllTagsOptional.title')}
                prompt={translate('workspace.tags.cannotMakeAllTagsOptional.description')}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
        </>
    );
}

WorkspaceTagsPage.displayName = 'WorkspaceTagsPage';

export default WorkspaceTagsPage;
