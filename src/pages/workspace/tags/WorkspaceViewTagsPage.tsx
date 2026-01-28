import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {InteractionManager, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchBar from '@components/SearchBar';
import TableListItem from '@components/SelectionList/ListItem/TableListItem';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import ListItemRightCaretWithLabel from '@components/SelectionListWithModal/ListItemRightCaretWithLabel';
import Switch from '@components/Switch';
import useConfirmModal from '@hooks/useConfirmModal';
import useFilteredSelection from '@hooks/useFilteredSelection';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import usePolicyData from '@hooks/usePolicyData';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {
    clearPolicyTagErrors,
    clearPolicyTagListErrorField,
    clearPolicyTagListErrors,
    deletePolicyTags,
    openPolicyTagsPage,
    setPolicyTagsRequired,
    setWorkspaceTagEnabled,
} from '@libs/actions/Policy/Tag';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isDisablingOrDeletingLastEnabledTag, isMakingLastRequiredTagListOptional} from '@libs/OptionsListUtils';
import {getCleanedTagName, getTagListName, hasDependentTags as hasDependentTagsPolicyUtils, isMultiLevelTags as isMultiLevelTagsPolicyUtils} from '@libs/PolicyUtils';
import StringUtils from '@libs/StringUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PolicyTag} from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type {TagListItem} from './types';

type WorkspaceViewTagsProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAG_LIST_VIEW>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_TAGS.SETTINGS_TAG_LIST_VIEW>;

function WorkspaceViewTagsPage({route}: WorkspaceViewTagsProps) {
    const {policyID, backTo, orderWeight} = route.params;

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for the small screen selection mode
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Close', 'Checkmark', 'Trashcan']);
    const {translate, localeCompare} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const dropdownButtonRef = useRef<View>(null);
    const isFocused = useIsFocused();
    const policyData = usePolicyData(policyID);
    const {policy, tags: policyTags} = policyData;
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const currentTagListName = useMemo(() => getTagListName(policyTags, orderWeight), [policyTags, orderWeight]);
    const hasDependentTags = useMemo(() => hasDependentTagsPolicyUtils(policy, policyTags), [policy, policyTags]);
    const isMultiLevelTags = isMultiLevelTagsPolicyUtils(policyTags);
    const currentPolicyTag = policyTags?.[currentTagListName];
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_TAGS.SETTINGS_TAG_LIST_VIEW;
    const fetchTags = useCallback(() => {
        openPolicyTagsPage(policyID);
    }, [policyID]);

    const filterFunction = useCallback((tag: PolicyTag | undefined) => !!tag && tag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, []);

    const [selectedTags, setSelectedTags] = useFilteredSelection(currentPolicyTag?.tags, filterFunction);

    const {isOffline} = useNetwork({onReconnect: fetchTags});
    const canSelectMultiple = useMemo(() => {
        if (hasDependentTags) {
            return false;
        }
        return isSmallScreenWidth ? isMobileSelectionModeEnabled : true;
    }, [hasDependentTags, isSmallScreenWidth, isMobileSelectionModeEnabled]);

    useEffect(() => {
        if (isFocused) {
            return;
        }

        return () => {
            turnOffMobileSelectionMode();
        };
    }, [isFocused]);

    useSearchBackPress({
        onClearSelection: () => {
            setSelectedTags([]);
        },
        onNavigationCallBack: () => Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID) : undefined),
    });

    const updateWorkspaceTagEnabled = useCallback(
        (value: boolean, tagName: string) => {
            setWorkspaceTagEnabled(policyData, {[tagName]: {name: tagName, enabled: value}}, orderWeight);
        },
        [policyData, orderWeight],
    );

    const tagList = useMemo<TagListItem[]>(
        () =>
            Object.values(currentPolicyTag?.tags ?? {}).map((tag) => ({
                value: tag.name,
                text: hasDependentTags ? tag.name : getCleanedTagName(tag.name),
                keyForList: hasDependentTags ? `${tag.name}-${tag.rules?.parentTagsFilter ?? ''}` : tag.name,
                isSelected: selectedTags.includes(tag.name) && canSelectMultiple,
                pendingAction: tag.pendingAction,
                rules: tag.rules,
                errors: tag.errors ?? undefined,
                enabled: tag.enabled,
                isDisabled: tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                rightElement: hasDependentTags ? (
                    <ListItemRightCaretWithLabel />
                ) : (
                    <Switch
                        isOn={tag.enabled}
                        disabled={tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                        accessibilityLabel={translate('workspace.tags.enableTag')}
                        onToggle={(newValue: boolean) => {
                            if (isDisablingOrDeletingLastEnabledTag(currentPolicyTag, [tag])) {
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
                        showLockIcon={isDisablingOrDeletingLastEnabledTag(currentPolicyTag, [tag])}
                    />
                ),
            })),
        [currentPolicyTag, hasDependentTags, selectedTags, canSelectMultiple, translate, updateWorkspaceTagEnabled, showConfirmModal],
    );

    const filterTag = useCallback((tag: TagListItem, searchInput: string) => {
        const tagText = StringUtils.normalize(tag.text?.toLowerCase() ?? '');
        const tagValue = StringUtils.normalize(tag.text?.toLowerCase() ?? '');
        const normalizedSearchInput = StringUtils.normalize(searchInput.toLowerCase() ?? '');
        return tagText.includes(normalizedSearchInput) || tagValue.includes(normalizedSearchInput);
    }, []);
    const sortTags = useCallback((tags: TagListItem[]) => tags.sort((tagA, tagB) => localeCompare(tagA.value, tagB.value)), [localeCompare]);
    const [inputValue, setInputValue, filteredTagList] = useSearchResults(tagList, filterTag, sortTags);

    const tagListKeyedByName = useMemo(
        () =>
            filteredTagList.reduce<Record<string, TagListItem>>((acc, tag) => {
                acc[tag.value] = tag;
                return acc;
            }, {}),
        [filteredTagList],
    );

    if (!currentPolicyTag) {
        return <NotFoundPage />;
    }

    const toggleTag = (tag: TagListItem) => {
        setSelectedTags((prev) => {
            if (prev.includes(tag.value)) {
                return prev.filter((selectedTag) => selectedTag !== tag.value);
            }
            return [...prev, tag.value];
        });
    };

    const toggleAllTags = () => {
        const availableTags = filteredTagList.filter((tag) => tag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        const anySelected = availableTags.some((tag) => selectedTags.includes(tag.value));

        setSelectedTags(anySelected ? [] : availableTags.map((tag) => tag.value));
    };

    const getCustomListHeader = () => {
        if (filteredTagList.length === 0) {
            return null;
        }
        return (
            <CustomListHeader
                canSelectMultiple={canSelectMultiple}
                leftHeaderText={translate('common.name')}
                rightHeaderText={hasDependentTags ? undefined : translate('common.enabled')}
                shouldShowRightCaret
            />
        );
    };

    const navigateToTagSettings = (tag: TagListItem) => {
        Navigation.navigate(
            isQuickSettingsFlow
                ? ROUTES.SETTINGS_TAG_SETTINGS.getRoute(policyID, orderWeight, tag.value, backTo)
                : ROUTES.WORKSPACE_TAG_SETTINGS.getRoute(policyID, orderWeight, tag.value, tag?.rules?.parentTagsFilter ?? undefined),
        );
    };

    const isLoading = !isOffline && policyTags === undefined;

    const listHeaderContent =
        tagList.length > CONST.SEARCH_ITEM_LIMIT ? (
            <SearchBar
                inputValue={inputValue}
                onChangeText={setInputValue}
                label={translate('workspace.tags.findTag')}
                shouldShowEmptyState={filteredTagList.length === 0 && !isLoading}
            />
        ) : undefined;

    const getHeaderButtons = () => {
        if ((!isSmallScreenWidth && selectedTags.length === 0) || (isSmallScreenWidth && !isMobileSelectionModeEnabled)) {
            return null;
        }

        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];
        const isThereAnyAccountingConnection = Object.keys(policy?.connections ?? {}).length !== 0;

        if (!isThereAnyAccountingConnection && !isMultiLevelTags && selectedTags.length > 0) {
            options.push({
                icon: icons.Trashcan,
                text: translate(selectedTags.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: async () => {
                    const {action} = await showConfirmModal({
                        title: translate(selectedTags.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags'),
                        prompt: translate(selectedTags.length === 1 ? 'workspace.tags.deleteTagConfirmation' : 'workspace.tags.deleteTagsConfirmation'),
                        confirmText: translate('common.delete'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });
                    if (action === ModalActions.CONFIRM) {
                        deletePolicyTags(policyData, selectedTags);
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        InteractionManager.runAfterInteractions(() => {
                            setSelectedTags([]);
                        });
                    }
                },
            });
        }

        let enabledTagCount = 0;
        const tagsToDisable: Record<string, {name: string; enabled: boolean}> = {};
        let disabledTagCount = 0;
        const tagsToEnable: Record<string, {name: string; enabled: boolean}> = {};
        for (const tagName of selectedTags) {
            if (tagListKeyedByName[tagName]?.enabled) {
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

        if (enabledTagCount > 0) {
            const selectedTagsObject = selectedTags.map((key) => currentPolicyTag?.tags[key]);
            options.push({
                icon: icons.Close,
                text: translate(enabledTagCount === 1 ? 'workspace.tags.disableTag' : 'workspace.tags.disableTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
                onSelected: () => {
                    if (isDisablingOrDeletingLastEnabledTag(currentPolicyTag, selectedTagsObject)) {
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
                    setWorkspaceTagEnabled(policyData, tagsToDisable, orderWeight);
                },
            });
        }

        if (disabledTagCount > 0) {
            options.push({
                icon: icons.Checkmark,
                text: translate(disabledTagCount === 1 ? 'workspace.tags.enableTag' : 'workspace.tags.enableTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                onSelected: () => {
                    setSelectedTags([]);
                    setWorkspaceTagEnabled(policyData, tagsToEnable, orderWeight);
                },
            });
        }

        return (
            <ButtonWithDropdownMenu
                buttonRef={dropdownButtonRef}
                onPress={() => null}
                shouldAlwaysShowDropdownMenu
                isSplitButton={false}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                customText={translate('workspace.common.selected', {count: selectedTags.length})}
                options={options}
                style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                isDisabled={!selectedTags.length}
            />
        );
    };

    if (!!currentPolicyTag?.required && !Object.values(currentPolicyTag?.tags ?? {}).some((tag) => tag.enabled)) {
        setPolicyTagsRequired(policyData, false, orderWeight);
    }

    const navigateToEditTag = () => {
        Navigation.navigate(
            isQuickSettingsFlow
                ? ROUTES.SETTINGS_TAGS_EDIT.getRoute(route.params.policyID, currentPolicyTag?.orderWeight ?? 0, backTo)
                : ROUTES.WORKSPACE_EDIT_TAGS.getRoute(route.params.policyID, currentPolicyTag?.orderWeight ?? 0, Navigation.getActiveRoute()),
        );
    };

    const selectionModeHeader = isMobileSelectionModeEnabled && isSmallScreenWidth;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="WorkspaceViewTagsPage"
            >
                <HeaderWithBackButton
                    title={selectionModeHeader ? translate('common.selectMultiple') : currentTagListName}
                    onBackButtonPress={() => {
                        if (isMobileSelectionModeEnabled) {
                            setSelectedTags([]);
                            turnOffMobileSelectionMode();
                            return;
                        }
                        Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID) : undefined);
                    }}
                >
                    {!shouldUseNarrowLayout && getHeaderButtons()}
                </HeaderWithBackButton>
                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                {!hasDependentTags && (
                    <View style={[styles.pv4, styles.ph5]}>
                        <ToggleSettingOptionRow
                            title={translate('common.required')}
                            switchAccessibilityLabel={translate('common.required')}
                            isActive={!!currentPolicyTag?.required}
                            onToggle={(on) => {
                                if (!isMultiLevelTags) {
                                    showConfirmModal({
                                        title: translate('workspace.tags.cannotMakeTagListRequired.title'),
                                        prompt: translate('workspace.tags.cannotMakeTagListRequired.description'),
                                        confirmText: translate('common.buttonConfirm'),
                                        shouldShowCancelButton: false,
                                    });
                                    return;
                                }
                                if (isMakingLastRequiredTagListOptional(policy, policyTags, [currentPolicyTag])) {
                                    showConfirmModal({
                                        title: translate('workspace.tags.cannotMakeAllTagsOptional.title'),
                                        prompt: translate('workspace.tags.cannotMakeAllTagsOptional.description'),
                                        confirmText: translate('common.buttonConfirm'),
                                        shouldShowCancelButton: false,
                                    });
                                    return;
                                }
                                setPolicyTagsRequired(policyData, on, orderWeight);
                            }}
                            pendingAction={currentPolicyTag.pendingFields?.required}
                            errors={currentPolicyTag?.errorFields?.required ?? undefined}
                            onCloseError={() => clearPolicyTagListErrorField({policyID, tagListIndex: orderWeight, errorField: 'required', policyTags})}
                            disabled={!currentPolicyTag?.required && !Object.values(currentPolicyTag?.tags ?? {}).some((tag) => tag.enabled)}
                            showLockIcon={!isMultiLevelTags || isMakingLastRequiredTagListOptional(policy, policyTags, [currentPolicyTag])}
                        />
                    </View>
                )}
                <OfflineWithFeedback
                    errors={currentPolicyTag.errors}
                    onClose={() => clearPolicyTagListErrors({policyID, tagListIndex: currentPolicyTag.orderWeight, policyTags})}
                    pendingAction={currentPolicyTag.pendingAction}
                    errorRowStyles={styles.mh5}
                >
                    <MenuItemWithTopDescription
                        title={getCleanedTagName(currentPolicyTag.name)}
                        description={translate(`workspace.tags.customTagName`)}
                        onPress={navigateToEditTag}
                        shouldShowRightIcon
                    />
                </OfflineWithFeedback>
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                    />
                )}
                {tagList.length > 0 && !isLoading && (
                    <SelectionListWithModal
                        data={filteredTagList}
                        ListItem={TableListItem}
                        selectedItems={selectedTags}
                        customListHeader={getCustomListHeader()}
                        onSelectAll={filteredTagList.length > 0 ? toggleAllTags : undefined}
                        onDismissError={(item) => clearPolicyTagErrors({policyID, tagName: item.value, tagListIndex: orderWeight, policyTags})}
                        style={{listHeaderWrapperStyle: [styles.ph9, styles.pv3, styles.pb5]}}
                        shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                        onTurnOnSelectionMode={(item) => item && toggleTag(item)}
                        turnOnSelectionModeOnLongPress={!hasDependentTags}
                        shouldUseDefaultRightHandSideCheckmark={false}
                        customListHeaderContent={listHeaderContent}
                        canSelectMultiple={canSelectMultiple}
                        onSelectRow={navigateToTagSettings}
                        showListEmptyContent={false}
                        onCheckboxPress={toggleTag}
                        shouldHeaderBeInsideList
                        shouldShowRightCaret
                        showScrollIndicator
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceViewTagsPage;
