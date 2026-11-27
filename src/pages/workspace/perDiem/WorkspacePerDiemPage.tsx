import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import HeaderCentralPane from '@components/Header/composed/HeaderCentralPane';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import type {TableEmptyStateProps} from '@components/Table/TableEmptyStates/TableEmptyState';
import WorkspacePerDiemTable from '@components/Tables/WorkspacePerDiemTable';

import useAlertModals from '@hooks/useAlertModals';
import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilteredSelection from '@hooks/useFilteredSelection';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {canMemberWrite, getPerDiemCustomUnit} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {close} from '@userActions/Modal';
import {deleteWorkspacePerDiemRates, downloadPerDiemCSV, openPolicyPerDiemPage} from '@userActions/Policy/PerDiem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import type {SubRateData} from './usePerDiemRows';

import usePerDiemRows from './usePerDiemRows';

type WorkspacePerDiemPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.PER_DIEM>;

function WorkspacePerDiemPage({route}: WorkspacePerDiemPageProps) {
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {pageGutter} = useLayoutSpacing();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const {showDownloadErrorModal} = useAlertModals();
    const policyID = route.params.policyID;
    const backTo = route.params?.backTo;
    const policy = usePolicy(policyID);
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const canWritePerDiem = canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.PER_DIEM);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.perDiem');
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Gear', 'Table', 'Download', 'Trashcan']);

    const customUnit = getPerDiemCustomUnit(policy);

    const fetchPerDiem = () => {
        openPolicyPerDiemPage(policyID);
    };

    const {isOffline} = useNetwork({onReconnect: fetchPerDiem});

    useFocusEffect(
        useCallback(() => {
            fetchPerDiem();
        }, [fetchPerDiem]),
    );

    const {allSubRates, selectableSubRatesByKey, perDiemRows} = usePerDiemRows({customUnit, isOffline, canWritePerDiem, policyID});

    const filterSelectableSubRate = (subRate?: SubRateData) => !!subRate;

    const [selectedSubRateKeys, setSelectedSubRateKeys] = useFilteredSelection(selectableSubRatesByKey, filterSelectableSubRate);

    const clearTableSelection = () => {
        setSelectedSubRateKeys((prev) => (prev.length > 0 ? [] : prev));
    };

    useCleanupSelectedOptions(clearTableSelection);

    const openSettings = () => {
        Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_SETTINGS.getRoute(policyID));
    };

    const showOfflineModal = () => {
        close(() => {
            showConfirmModal({
                title: translate('common.youAppearToBeOffline'),
                prompt: translate('common.thisFeatureRequiresInternet'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
        });
    };

    const handleDeletePerDiemRates = () => {
        const subRatesToDelete = selectedSubRateKeys.map((rowKey) => selectableSubRatesByKey[rowKey]).filter((subRate): subRate is SubRateData => !!subRate);
        deleteWorkspacePerDiemRates(policyID, customUnit, subRatesToDelete);
        setSelectedSubRateKeys([]);
        turnOffMobileSelectionMode();
    };

    const hasVisibleSubRates = allSubRates.some((subRate) => subRate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);

    const menuItems = [];
    if (canWritePerDiem && policy?.areCategoriesEnabled && hasEnabledOptions(policyCategories ?? {})) {
        menuItems.push({
            icon: expensifyIcons.Gear,
            text: translate('common.settings'),
            onSelected: openSettings,
            value: CONST.POLICY.SECONDARY_ACTIONS.SETTINGS,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.PER_DIEM.MORE_MENU_SETTINGS,
        });
    }
    if (canWritePerDiem) {
        menuItems.push({
            icon: expensifyIcons.Table,
            text: translate('spreadsheet.importSpreadsheet'),
            onSelected: () => {
                if (isOffline) {
                    showOfflineModal();
                    return;
                }
                Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_IMPORT.getRoute(policyID));
            },
            value: CONST.POLICY.SECONDARY_ACTIONS.IMPORT_SPREADSHEET,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.PER_DIEM.MORE_MENU_IMPORT_SPREADSHEET,
        });
    }
    // Admins can download the CSV before adding rates, to use it as an import template
    if (hasVisibleSubRates || canWritePerDiem) {
        menuItems.push({
            icon: expensifyIcons.Download,
            text: translate('spreadsheet.downloadCSV'),
            onSelected: () => {
                if (isOffline) {
                    showOfflineModal();
                    return;
                }
                close(() => downloadPerDiemCSV(policyID, showDownloadErrorModal, translate));
            },
            value: CONST.POLICY.SECONDARY_ACTIONS.DOWNLOAD_CSV,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.PER_DIEM.MORE_MENU_DOWNLOAD_CSV,
        });
    }
    const secondaryActions = menuItems;

    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const bulkActionOptions: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [
        {
            icon: expensifyIcons.Trashcan,
            text: translate('workspace.perDiem.deleteRates', {count: selectedSubRateKeys.length}),
            value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.PER_DIEM.BULK_ACTIONS_DELETE,
            shouldSkipFocusRestore: true,
            onSelected: async () => {
                const {action} = await showConfirmModal({
                    title: translate('workspace.perDiem.deletePerDiemRate'),
                    prompt: translate('workspace.perDiem.areYouSureDelete', {count: selectedSubRateKeys.length}),
                    confirmText: translate('common.delete'),
                    cancelText: translate('common.cancel'),
                    buttonVariant: CONST.BUTTON_VARIANT.DANGER,
                });
                if (action === ModalActions.CONFIRM) {
                    handleDeletePerDiemRates();
                }
            },
        },
    ];

    const getHeaderButtons = () => {
        // The wide layout offers these actions in the floating bar over the table instead, so its header keeps the
        // page's own buttons no matter what is selected.
        if (canWritePerDiem && shouldUseNarrowLayout && isMobileSelectionModeEnabled) {
            return (
                <ButtonWithDropdownMenu
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    size={CONST.BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {count: selectedSubRateKeys.length})}
                    options={bulkActionOptions}
                    isSplitButton={false}
                    style={shouldDisplayButtonsInSeparateLine && [styles.flexGrow1, styles.mb3]}
                    isDisabled={!selectedSubRateKeys.length}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.PER_DIEM.BULK_ACTIONS_DROPDOWN}
                />
            );
        }

        if (secondaryActions.length === 0) {
            return null;
        }

        return (
            <View style={[styles.flexRow, styles.gap2, shouldDisplayButtonsInSeparateLine && styles.mb3]}>
                <ButtonWithDropdownMenu
                    onPress={() => {}}
                    shouldAlwaysShowDropdownMenu
                    customText={translate('common.more')}
                    options={secondaryActions}
                    isSplitButton={false}
                    wrapperStyle={isInLandscapeMode ? undefined : styles.flexGrow1}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.PER_DIEM.MORE_DROPDOWN}
                />
            </View>
        );
    };

    useEffect(() => {
        if (isMobileSelectionModeEnabled) {
            return;
        }

        setSelectedSubRateKeys([]);
    }, [setSelectedSubRateKeys, isMobileSelectionModeEnabled]);

    useSearchBackPress({
        onClearSelection: clearTableSelection,
        onNavigationCallBack: () => Navigation.goBack(backTo),
    });

    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;
    const headerButtons = getHeaderButtons();

    const subtitleContent = (
        <View style={[styles.flexRow, styles.renderHTML, styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            <RenderHTML html={translate('workspace.perDiem.subtitle')} />
        </View>
    );

    const emptyState: TableEmptyStateProps = {
        title: translate('workspace.perDiem.emptyList.title'),
        subtitle: translate('workspace.perDiem.emptyList.subtitle'),
        buttons: canWritePerDiem
            ? [
                  {
                      buttonText: translate('spreadsheet.importSpreadsheet'),
                      sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.PER_DIEM.EMPTY_STATE_IMPORT_SPREADSHEET,
                      buttonAction: () => {
                          if (isOffline) {
                              showOfflineModal();
                              return;
                          }
                          Navigation.navigate(ROUTES.WORKSPACE_PER_DIEM_IMPORT.getRoute(policyID));
                      },
                      buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
                  },
              ]
            : [],
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.PER_DIEM}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                style={[styles.defaultModalContainer]}
                testID="WorkspacePerDiemPage"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderCentralPane
                    title={translate(selectionModeHeader ? 'common.selectMultiple' : 'common.perDiem')}
                    isHeadline={!selectionModeHeader}
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
                    {!shouldDisplayButtonsInSeparateLine && headerButtons}
                </HeaderCentralPane>
                {!!headerButtons && shouldDisplayButtonsInSeparateLine && <View style={pageGutter}>{headerButtons}</View>}
                {!hasVisibleSubRates && subtitleContent}
                <WorkspacePerDiemTable
                    perDiemData={perDiemRows}
                    selectionEnabled={canWritePerDiem}
                    selectedKeys={selectedSubRateKeys}
                    onRowSelectionChange={setSelectedSubRateKeys}
                    headerComponent={hasVisibleSubRates ? subtitleContent : undefined}
                    emptyState={emptyState}
                    bulkActionOptions={canWritePerDiem ? bulkActionOptions : undefined}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspacePerDiemPage;
