import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import type {ReportFieldListValueRowData} from '@components/Tables/WorkspaceReportFieldListValuesTable';
import WorkspaceReportFieldListValuesTable from '@components/Tables/WorkspaceReportFieldListValuesTable';
import Text from '@components/Text';

import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import useFilteredSelection from '@hooks/useFilteredSelection';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useOnyx from '@hooks/useOnyx';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {
    deleteReportFieldsListValue,
    removeReportFieldListValue,
    setReportFieldsListValueEnabled,
    updateReportFieldListValueEnabled as updateReportFieldListValueEnabledReportField,
} from '@libs/actions/Policy/ReportField';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasAccountingConnections as hasAccountingConnectionsPolicyUtils} from '@libs/PolicyUtils';
import {getReportFieldKey} from '@libs/ReportUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';

type ReportFieldsListValuesPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_LIST_VALUES>;

function ReportFieldsListValuesPage({
    policy,
    route: {
        params: {policyID, reportFieldID},
    },
}: ReportFieldsListValuesPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here to use the mobile selection mode on small screens only
    // See https://github.com/Expensify/App/issues/48724 for more details
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const {showConfirmModal} = useConfirmModal();
    const {canWrite: canWriteReportFields, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.REPORT_FIELDS);

    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);

    const [listValues, disabledListValues] = useMemo(() => {
        let reportFieldValues: string[];
        let reportFieldDisabledValues: boolean[];

        if (reportFieldID) {
            const reportFieldKey = getReportFieldKey(reportFieldID);

            reportFieldValues = Object.values(policy?.fieldList?.[reportFieldKey]?.values ?? {});
            reportFieldDisabledValues = Object.values(policy?.fieldList?.[reportFieldKey]?.disabledOptions ?? {});
        } else {
            reportFieldValues = formDraft?.listValues ?? [];
            reportFieldDisabledValues = formDraft?.disabledListValues ?? [];
        }

        return [reportFieldValues, reportFieldDisabledValues];
    }, [formDraft?.disabledListValues, formDraft?.listValues, policy?.fieldList, reportFieldID]);

    const updateReportFieldListValueEnabled = useCallback(
        (value: boolean, valueIndex: number) => {
            if (reportFieldID) {
                updateReportFieldListValueEnabledReportField({
                    policy,
                    reportFieldID,
                    valueIndexes: [Number(valueIndex)],
                    enabled: value,
                });
                return;
            }

            setReportFieldsListValueEnabled({
                valueIndexes: [valueIndex],
                enabled: value,
                disabledListValues,
            });
        },
        [disabledListValues, policy, reportFieldID],
    );

    const openListValuePage = useCallback(
        (valueIndex: number) => {
            Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS_VALUE_SETTINGS.getRoute(policyID, valueIndex, reportFieldID));
        },
        [policyID, reportFieldID],
    );

    const listValueRows = useMemo<ReportFieldListValueRowData[]>(
        () =>
            listValues.map((value, index) => ({
                keyForList: value,
                value,
                name: value,
                index,
                enabled: !disabledListValues.at(index),
                isLocked: !canWriteReportFields,
                isSwitchDisabled: !canWriteReportFields,
                action: () => openListValuePage(index),
                onToggleEnabled: (enabled: boolean) => updateReportFieldListValueEnabled(enabled, index),
                onDisabledSwitchPress: withReadOnlyFallback(),
            })),
        [canWriteReportFields, disabledListValues, listValues, openListValuePage, updateReportFieldListValueEnabled, withReadOnlyFallback],
    );

    const listValueRowsKeyed = useMemo(
        () =>
            listValueRows.reduce<Record<string, ReportFieldListValueRowData>>((acc, row) => {
                acc[row.keyForList] = row;
                return acc;
            }, {}),
        [listValueRows],
    );

    const filterListValueRow = useCallback((row?: ReportFieldListValueRowData) => !!row, []);

    const [selectedKeys, setSelectedKeys] = useFilteredSelection(listValueRowsKeyed, filterListValueRow);

    const clearTableSelection = useCallback(() => {
        setSelectedKeys((prevSelectedKeys) => (prevSelectedKeys.length > 0 ? [] : prevSelectedKeys));
    }, [setSelectedKeys]);

    useCleanupSelectedOptions(clearTableSelection);

    useSearchBackPress({
        onClearSelection: clearTableSelection,
        onNavigationCallBack: () => Navigation.goBack(),
    });

    const icons = useMemoizedLazyExpensifyIcons(['Checkmark', 'Close', 'Plus', 'Trashcan']);

    const handleDeleteValues = useCallback(() => {
        const valuesToDelete = selectedKeys.map((value) => listValues.indexOf(value)).filter((index) => index !== -1);

        if (reportFieldID) {
            removeReportFieldListValue({
                policy,
                reportFieldID,
                valueIndexes: valuesToDelete,
            });
        } else {
            deleteReportFieldsListValue({
                valueIndexes: valuesToDelete,
                listValues,
                disabledListValues,
            });
        }

        clearTableSelection();
    }, [clearTableSelection, disabledListValues, listValues, policy, reportFieldID, selectedKeys]);

    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const getHeaderButtons = () => {
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];
        if (canWriteReportFields && (isSmallScreenWidth ? isMobileSelectionModeEnabled : selectedKeys.length > 0)) {
            if (selectedKeys.length > 0 && !hasAccountingConnections) {
                options.push({
                    icon: icons.Trashcan,
                    text: translate(selectedKeys.length === 1 ? 'workspace.reportFields.deleteValue' : 'workspace.reportFields.deleteValues'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                    onSelected: () => {
                        showConfirmModal({
                            danger: true,
                            title: translate(selectedKeys.length === 1 ? 'workspace.reportFields.deleteValue' : 'workspace.reportFields.deleteValues'),
                            prompt: translate(selectedKeys.length === 1 ? 'workspace.reportFields.deleteValuePrompt' : 'workspace.reportFields.deleteValuesPrompt'),
                            confirmText: translate('common.delete'),
                            cancelText: translate('common.cancel'),
                        }).then((result) => {
                            if (result.action !== ModalActions.CONFIRM) {
                                return;
                            }

                            handleDeleteValues();
                        });
                    },
                });
            }
            const enabledValues = selectedKeys.filter((value) => {
                const index = listValues.indexOf(value);
                return index !== -1 && !disabledListValues?.at(index);
            });

            if (enabledValues.length > 0) {
                const valuesToDisable = selectedKeys.reduce<number[]>((acc, value) => {
                    const index = listValues.indexOf(value);
                    if (index !== -1 && !disabledListValues?.at(index)) {
                        acc.push(index);
                    }

                    return acc;
                }, []);

                options.push({
                    icon: icons.Close,
                    text: translate(enabledValues.length === 1 ? 'workspace.reportFields.disableValue' : 'workspace.reportFields.disableValues'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
                    onSelected: () => {
                        clearTableSelection();

                        if (reportFieldID) {
                            updateReportFieldListValueEnabledReportField({
                                policy,
                                reportFieldID,
                                valueIndexes: valuesToDisable,
                                enabled: false,
                            });
                            return;
                        }

                        setReportFieldsListValueEnabled({
                            valueIndexes: valuesToDisable,
                            enabled: false,
                            disabledListValues,
                        });
                    },
                });
            }

            const disabledValues = selectedKeys.filter((value) => {
                const index = listValues.indexOf(value);
                return index !== -1 && disabledListValues?.at(index);
            });

            if (disabledValues.length > 0) {
                const valuesToEnable = selectedKeys.reduce<number[]>((acc, value) => {
                    const index = listValues.indexOf(value);
                    if (index !== -1 && disabledListValues?.at(index)) {
                        acc.push(index);
                    }

                    return acc;
                }, []);

                options.push({
                    icon: icons.Checkmark,
                    text: translate(disabledValues.length === 1 ? 'workspace.reportFields.enableValue' : 'workspace.reportFields.enableValues'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                    onSelected: () => {
                        clearTableSelection();

                        if (reportFieldID) {
                            updateReportFieldListValueEnabledReportField({
                                policy,
                                reportFieldID,
                                valueIndexes: valuesToEnable,
                                enabled: true,
                            });
                            return;
                        }

                        setReportFieldsListValueEnabled({
                            valueIndexes: valuesToEnable,
                            enabled: true,
                            disabledListValues,
                        });
                    },
                });
            }

            return (
                <ButtonWithDropdownMenu
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    size={CONST.BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {count: selectedKeys.length})}
                    options={options}
                    isSplitButton={false}
                    style={[shouldDisplayButtonsInSeparateLine && styles.flexGrow1, shouldDisplayButtonsInSeparateLine && styles.mb3]}
                    isDisabled={!selectedKeys.length}
                />
            );
        }

        if (canWriteReportFields && !hasAccountingConnections) {
            return (
                <Button
                    style={[shouldDisplayButtonsInSeparateLine && styles.flexGrow1, shouldDisplayButtonsInSeparateLine && styles.mb3]}
                    success
                    icon={icons.Plus}
                    text={translate('workspace.reportFields.addValue')}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS_ADD_VALUE.getRoute(policyID, reportFieldID))}
                />
            );
        }
    };

    const selectionModeHeader = isMobileSelectionModeEnabled && isSmallScreenWidth;

    const headerButtons = getHeaderButtons();

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.REPORT_FIELDS}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID="ReportFieldsListValuesPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate(selectionModeHeader ? 'common.selectMultiple' : 'workspace.reportFields.listValues')}
                    onBackButtonPress={() => {
                        if (isMobileSelectionModeEnabled) {
                            clearTableSelection();
                            turnOffMobileSelectionMode();
                            return;
                        }
                        Navigation.goBack();
                    }}
                >
                    {!shouldDisplayButtonsInSeparateLine && headerButtons}
                </HeaderWithBackButton>
                {shouldDisplayButtonsInSeparateLine && <View style={[styles.pl5, styles.pr5]}>{headerButtons}</View>}
                <View style={[styles.ph5, styles.pb5, styles.pt3]}>
                    <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.reportFields.listInputSubtitle')}</Text>
                </View>
                <WorkspaceReportFieldListValuesTable
                    listValues={listValueRows}
                    selectionEnabled={canWriteReportFields}
                    selectedKeys={selectedKeys}
                    onRowSelectionChange={setSelectedKeys}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(ReportFieldsListValuesPage);
