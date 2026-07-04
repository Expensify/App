import ActivityIndicator from '@components/ActivityIndicator';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import type {WorkspaceTagTableRowData} from '@components/Tables/WorkspaceTagsTable';
import WorkspaceViewTagsTable from '@components/Tables/WorkspaceViewTagsTable';

import useConfirmModal from '@hooks/useConfirmModal';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useFilteredSelection from '@hooks/useFilteredSelection';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import usePolicyData from '@hooks/usePolicyData';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
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
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isDisablingOrDeletingLastEnabledTag, isMakingLastRequiredTagListOptional} from '@libs/OptionsListUtils';
import {
    getCleanedTagName,
    getCountOfEnabledTagsOfList,
    getTagListName,
    hasDependentTags as hasDependentTagsPolicyUtils,
    isMultiLevelTags as isMultiLevelTagsPolicyUtils,
} from '@libs/PolicyUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import type {SettingsNavigatorParamList} from '@navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PolicyTag} from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';

type WorkspaceViewTagsProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAG_LIST_VIEW>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_LIST_VIEW>;

function WorkspaceViewTagsPage({route}: WorkspaceViewTagsProps) {
    const {policyID, orderWeight: orderWeightParam} = route.params;
    const orderWeight = Number(orderWeightParam);

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for the small screen selection mode
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Close', 'Checkmark', 'Trashcan']);
    const {translate} = useLocalize();
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
    const {canWrite: canWriteTags, showReadOnlyModal, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.TAGS);
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_LIST_VIEW;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.SETTINGS_TAG_LIST_VIEW.path);
    const fetchTags = useCallback(() => {
        openPolicyTagsPage(policyID);
    }, [policyID]);

    const filterFunction = useCallback((tag: PolicyTag | undefined) => !!tag && tag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, []);

    const [selectedTags, setSelectedTags] = useFilteredSelection(currentPolicyTag?.tags, filterFunction);

    const {isOffline} = useNetwork({onReconnect: fetchTags});

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
        onNavigationCallBack: () => Navigation.goBack(isQuickSettingsFlow ? backPath : undefined),
    });

    const updateWorkspaceTagEnabled = useCallback(
        (value: boolean, tagName: string) => {
            if (!canWriteTags) {
                showReadOnlyModal();
                return;
            }

            setWorkspaceTagEnabled(policyData, {[tagName]: {name: tagName, enabled: value}}, orderWeight);
        },
        [canWriteTags, policyData, orderWeight, showReadOnlyModal],
    );

    const navigateToTagSettings = useCallback(
        (tag: PolicyTag) => {
            if (!canWriteTags) {
                return;
            }

            const parentTagsFilter = tag?.rules?.parentTagsFilter;
            const workspaceTagSettingsSuffix = parentTagsFilter
                ? `${DYNAMIC_ROUTES.WORKSPACE_TAG_SETTINGS.getRoute(orderWeight, tag.name)}?parentTagsFilter=${encodeURIComponent(parentTagsFilter)}`
                : DYNAMIC_ROUTES.WORKSPACE_TAG_SETTINGS.getRoute(orderWeight, tag.name);

            Navigation.navigate(
                isQuickSettingsFlow ? createDynamicRoute(DYNAMIC_ROUTES.SETTINGS_TAG_SETTINGS.getRoute(orderWeight, tag.name)) : createDynamicRoute(workspaceTagSettingsSuffix),
            );
        },
        [canWriteTags, isQuickSettingsFlow, orderWeight],
    );

    const tagRows = useMemo<WorkspaceTagTableRowData[]>(() => {
        const enabledTagsCount = getCountOfEnabledTagsOfList(currentPolicyTag?.tags);

        return Object.values(currentPolicyTag?.tags ?? {}).reduce<WorkspaceTagTableRowData[]>((acc, tag) => {
            const isDisabled = tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            if (!isOffline && isDisabled) {
                return acc;
            }

            const isDisablingLastEnabledTag = isDisablingOrDeletingLastEnabledTag(currentPolicyTag, [tag], enabledTagsCount);

            acc.push({
                keyForList: hasDependentTags ? `${tag.name}-${tag.rules?.parentTagsFilter ?? ''}` : tag.name,
                value: tag.name,
                name: hasDependentTags ? tag.name : getCleanedTagName(tag.name),
                enabled: tag.enabled,
                disabled: isDisabled,
                errors: tag.errors ?? undefined,
                pendingAction: tag.pendingAction,
                isLocked: !canWriteTags || isDisablingLastEnabledTag,
                showEnabledSwitch: !hasDependentTags,
                showRequiredSwitch: false,
                action: () => navigateToTagSettings(tag),
                onToggleEnabled: (enabled: boolean) => {
                    if (isDisablingLastEnabledTag) {
                        showConfirmModal({
                            title: translate('workspace.tags.cannotDeleteOrDisableAllTags.title'),
                            prompt: translate('workspace.tags.cannotDeleteOrDisableAllTags.description'),
                            confirmText: translate('common.buttonConfirm'),
                            shouldShowCancelButton: false,
                        });
                        return;
                    }
                    updateWorkspaceTagEnabled(enabled, tag.name);
                },
                onClose: () =>
                    clearPolicyTagErrors({
                        policyID,
                        tagName: tag.name,
                        tagListIndex: orderWeight,
                        policyTags,
                    }),
            });

            return acc;
        }, []);
    }, [canWriteTags, currentPolicyTag, hasDependentTags, isOffline, navigateToTagSettings, orderWeight, policyID, policyTags, showConfirmModal, translate, updateWorkspaceTagEnabled]);

    const tagListKeyedByName = useMemo(
        () =>
            tagRows.reduce<Record<string, WorkspaceTagTableRowData>>((acc, tag) => {
                acc[tag.value] = tag;
                return acc;
            }, {}),
        [tagRows],
    );

    if (!currentPolicyTag) {
        return <NotFoundPage />;
    }

    const isLoading = !isOffline && policyTags === undefined;
    const reasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'WorkspaceViewTagsPage',
        isOffline,
        isPolicyTagsUndefined: policyTags === undefined,
    };

    const getHeaderButtons = () => {
        if (!canWriteTags || (!isSmallScreenWidth && selectedTags.length === 0) || (isSmallScreenWidth && !isMobileSelectionModeEnabled)) {
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
                        setSelectedTags([]);
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
                customText={translate('workspace.common.selected', {
                    count: selectedTags.length,
                })}
                options={options}
                style={[shouldDisplayButtonsInSeparateLine && styles.flexGrow1, shouldDisplayButtonsInSeparateLine && styles.mb3]}
                isDisabled={!selectedTags.length}
            />
        );
    };

    if (canWriteTags && !!currentPolicyTag?.required && !Object.values(currentPolicyTag?.tags ?? {}).some((tag) => tag.enabled)) {
        setPolicyTagsRequired(policyData, false, orderWeight);
    }

    const navigateToEditTag = () => {
        if (!canWriteTags) {
            return;
        }

        Navigation.navigate(
            isQuickSettingsFlow
                ? createDynamicRoute(DYNAMIC_ROUTES.SETTINGS_TAGS_EDIT.getRoute(currentPolicyTag?.orderWeight ?? 0))
                : createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EDIT_TAGS.getRoute(currentPolicyTag?.orderWeight ?? 0)),
        );
    };

    const selectionModeHeader = isMobileSelectionModeEnabled && isSmallScreenWidth;

    const headerButtons = getHeaderButtons();

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.TAGS}
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
                        Navigation.goBack(isQuickSettingsFlow ? backPath : undefined);
                    }}
                >
                    {!shouldDisplayButtonsInSeparateLine && headerButtons}
                </HeaderWithBackButton>
                {shouldDisplayButtonsInSeparateLine && !!headerButtons && <View style={[styles.pl5, styles.pr5]}>{headerButtons}</View>}
                {!hasDependentTags && (
                    <View style={[styles.pv4, styles.ph5]}>
                        <ToggleSettingOptionRow
                            title={translate('common.required')}
                            switchAccessibilityLabel={translate('common.required')}
                            isActive={!!currentPolicyTag?.required}
                            onToggle={(on) => {
                                if (!canWriteTags) {
                                    showReadOnlyModal();
                                    return;
                                }

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
                            onCloseError={() =>
                                clearPolicyTagListErrorField({
                                    policyID,
                                    tagListIndex: orderWeight,
                                    errorField: 'required',
                                    policyTags,
                                })
                            }
                            disabled={!canWriteTags || (!currentPolicyTag?.required && !Object.values(currentPolicyTag?.tags ?? {}).some((tag) => tag.enabled))}
                            disabledAction={withReadOnlyFallback()}
                            showLockIcon={!canWriteTags || !isMultiLevelTags || isMakingLastRequiredTagListOptional(policy, policyTags, [currentPolicyTag])}
                        />
                    </View>
                )}
                <OfflineWithFeedback
                    errors={currentPolicyTag.errors}
                    onClose={() =>
                        clearPolicyTagListErrors({
                            policyID,
                            tagListIndex: currentPolicyTag.orderWeight,
                            policyTags,
                        })
                    }
                    pendingAction={currentPolicyTag.pendingAction}
                    errorRowStyles={styles.mh5}
                >
                    <MenuItemWithTopDescription
                        title={getCleanedTagName(currentPolicyTag.name)}
                        description={translate(`workspace.tags.customTagName`)}
                        onPress={navigateToEditTag}
                        shouldShowRightIcon={canWriteTags}
                        interactive={canWriteTags}
                    />
                </OfflineWithFeedback>
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        reasonAttributes={reasonAttributes}
                    />
                )}
                {tagRows.length > 0 && !isLoading && (
                    <WorkspaceViewTagsTable
                        tags={tagRows}
                        hasDependentTags={hasDependentTags}
                        selectionEnabled={canWriteTags && !hasDependentTags}
                        selectedKeys={selectedTags}
                        onRowSelectionChange={setSelectedTags}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceViewTagsPage;
