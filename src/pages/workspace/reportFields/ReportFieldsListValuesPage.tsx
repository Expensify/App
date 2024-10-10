import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import ListItemRightCaretWithLabel from '@components/SelectionList/ListItemRightCaretWithLabel';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import * as ReportField from '@libs/actions/Policy/ReportField';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type ValueListItem = ListItem & {
    /** The value */
    value: string;

    /** Whether the value is enabled */
    enabled: boolean;

    /** The value order weight in the list */
    orderWeight?: number;
};

type ReportFieldsListValuesPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_LIST_VALUES>;

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
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);
    const {selectionMode} = useMobileSelectionMode();

    const [selectedValues, setSelectedValues] = useState<Record<string, boolean>>({});
    const [deleteValuesConfirmModalVisible, setDeleteValuesConfirmModalVisible] = useState(false);
    const hasAccountingConnections = PolicyUtils.hasAccountingConnections(policy);

    const canSelectMultiple = !hasAccountingConnections && (isSmallScreenWidth ? selectionMode?.isEnabled : true);

    const [listValues, disabledListValues] = useMemo(() => {
        let reportFieldValues: string[];
        let reportFieldDisabledValues: boolean[];

        if (reportFieldID) {
            const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);

            reportFieldValues = Object.values(policy?.fieldList?.[reportFieldKey]?.values ?? {});
            reportFieldDisabledValues = Object.values(policy?.fieldList?.[reportFieldKey]?.disabledOptions ?? {});
        } else {
            reportFieldValues = formDraft?.listValues ?? [];
            reportFieldDisabledValues = formDraft?.disabledListValues ?? [];
        }

        return [reportFieldValues, reportFieldDisabledValues];
    }, [formDraft?.disabledListValues, formDraft?.listValues, policy?.fieldList, reportFieldID]);

    const listValuesSections = useMemo(() => {
        const data = listValues
            .map<ValueListItem>((value, index) => ({
                value,
                index,
                text: value,
                keyForList: value,
                isSelected: selectedValues[value] && canSelectMultiple,
                enabled: !disabledListValues.at(index) ?? true,
                rightElement: (
                    <ListItemRightCaretWithLabel
                        shouldShowCaret={false}
                        labelText={disabledListValues.at(index) ? translate('workspace.common.disabled') : translate('workspace.common.enabled')}
                    />
                ),
            }))
            .sort((a, b) => localeCompare(a.value, b.value));
        return [{data, isDisabled: false}];
    }, [canSelectMultiple, disabledListValues, listValues, selectedValues, translate]);

    const shouldShowEmptyState = Object.values(listValues ?? {}).length <= 0;
    const selectedValuesArray = Object.keys(selectedValues).filter((key) => selectedValues[key]);

    const toggleValue = (valueItem: ValueListItem) => {
        setSelectedValues((prev) => ({
            ...prev,
            [valueItem.value]: !prev[valueItem.value],
        }));
    };

    const toggleAllValues = () => {
        const areAllSelected = listValues.length === selectedValuesArray.length;

        setSelectedValues(areAllSelected ? {} : Object.fromEntries(listValues.map((value) => [value, true])));
    };

    const handleDeleteValues = () => {
        setSelectedValues({});

        const valuesToDelete = selectedValuesArray.reduce<number[]>((acc, valueName) => {
            const index = listValues?.indexOf(valueName);

            if (index !== -1) {
                acc.push(index);
            }

            return acc;
        }, []);

        if (reportFieldID) {
            ReportField.removeReportFieldListValue(policyID, reportFieldID, valuesToDelete);
        } else {
            ReportField.deleteReportFieldsListValue(valuesToDelete);
        }

        setDeleteValuesConfirmModalVisible(false);
    };

    const openListValuePage = (valueItem: ValueListItem) => {
        if (valueItem.index === undefined || hasAccountingConnections) {
            return;
        }

        Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS_VALUE_SETTINGS.getRoute(policyID, valueItem.index, reportFieldID));

        setSelectedValues({});
    };

    const getCustomListHeader = () => {
        const header = (
            <View
                style={[
                    styles.flex1,
                    styles.flexRow,
                    styles.justifyContentBetween,
                    // Required padding accounting for the checkbox and the right arrow in multi-select mode
                    canSelectMultiple && styles.pl3,
                ]}
            >
                <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
                <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
            </View>
        );
        if (canSelectMultiple) {
            return header;
        }
        return <View style={[styles.flexRow, styles.ph9, styles.pv3, styles.pb5]}>{header}</View>;
    };

    const getHeaderButtons = () => {
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];
        if (isSmallScreenWidth ? selectionMode?.isEnabled : selectedValuesArray.length > 0) {
            if (selectedValuesArray.length > 0) {
                options.push({
                    icon: Expensicons.Trashcan,
                    text: translate(selectedValuesArray.length === 1 ? 'workspace.reportFields.deleteValue' : 'workspace.reportFields.deleteValues'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                    onSelected: () => setDeleteValuesConfirmModalVisible(true),
                });
            }
            const enabledValues = selectedValuesArray.filter((valueName) => {
                const index = listValues?.indexOf(valueName);
                return !disabledListValues?.at(index);
            });

            if (enabledValues.length > 0) {
                const valuesToDisable = selectedValuesArray.reduce<number[]>((acc, valueName) => {
                    const index = listValues?.indexOf(valueName);
                    if (!disabledListValues?.at(index) && index !== -1) {
                        acc.push(index);
                    }

                    return acc;
                }, []);

                options.push({
                    icon: Expensicons.DocumentSlash,
                    text: translate(enabledValues.length === 1 ? 'workspace.reportFields.disableValue' : 'workspace.reportFields.disableValues'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
                    onSelected: () => {
                        setSelectedValues({});

                        if (reportFieldID) {
                            ReportField.updateReportFieldListValueEnabled(policyID, reportFieldID, valuesToDisable, false);
                            return;
                        }

                        ReportField.setReportFieldsListValueEnabled(valuesToDisable, false);
                    },
                });
            }

            const disabledValues = selectedValuesArray.filter((valueName) => {
                const index = listValues?.indexOf(valueName);
                return disabledListValues?.at(index);
            });

            if (disabledValues.length > 0) {
                const valuesToEnable = selectedValuesArray.reduce<number[]>((acc, valueName) => {
                    const index = listValues?.indexOf(valueName);
                    if (disabledListValues?.at(index) && index !== -1) {
                        acc.push(index);
                    }

                    return acc;
                }, []);

                options.push({
                    icon: Expensicons.Document,
                    text: translate(disabledValues.length === 1 ? 'workspace.reportFields.enableValue' : 'workspace.reportFields.enableValues'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                    onSelected: () => {
                        setSelectedValues({});

                        if (reportFieldID) {
                            ReportField.updateReportFieldListValueEnabled(policyID, reportFieldID, valuesToEnable, true);
                            return;
                        }

                        ReportField.setReportFieldsListValueEnabled(valuesToEnable, true);
                    },
                });
            }

            return (
                <ButtonWithDropdownMenu
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    pressOnEnter
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {count: selectedValuesArray.length})}
                    options={options}
                    isSplitButton={false}
                    style={[isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && styles.mb3]}
                    isDisabled={!selectedValuesArray.length}
                />
            );
        }

        return (
            <Button
                style={[isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && styles.mb3]}
                success
                icon={Expensicons.Plus}
                text={translate('workspace.reportFields.addValue')}
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS_ADD_VALUE.getRoute(policyID, reportFieldID))}
            />
        );
    };

    const selectionModeHeader = selectionMode?.isEnabled && isSmallScreenWidth;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={styles.defaultModalContainer}
                testID={ReportFieldsListValuesPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate(selectionModeHeader ? 'common.selectMultiple' : 'workspace.reportFields.listValues')}
                    onBackButtonPress={() => {
                        if (selectionMode?.isEnabled) {
                            setSelectedValues({});
                            turnOffMobileSelectionMode();
                            return;
                        }
                        Navigation.goBack();
                    }}
                >
                    {!isSmallScreenWidth && !hasAccountingConnections && getHeaderButtons()}
                </HeaderWithBackButton>
                {isSmallScreenWidth && <View style={[styles.pl5, styles.pr5]}>{!hasAccountingConnections && getHeaderButtons()}</View>}
                <View style={[styles.ph5, styles.pv4]}>
                    <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.reportFields.listInputSubtitle')}</Text>
                </View>
                {shouldShowEmptyState && (
                    <EmptyStateComponent
                        title={translate('workspace.reportFields.emptyReportFieldsValues.title')}
                        subtitle={translate('workspace.reportFields.emptyReportFieldsValues.subtitle')}
                        SkeletonComponent={TableListItemSkeleton}
                        headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
                        headerMedia={Illustrations.FolderWithPapers}
                        headerStyles={styles.emptyFolderDarkBG}
                        headerContentStyles={styles.emptyStateFolderWithPaperIconSize}
                    />
                )}
                {!shouldShowEmptyState && (
                    <SelectionListWithModal
                        canSelectMultiple={canSelectMultiple}
                        turnOnSelectionModeOnLongPress={!hasAccountingConnections}
                        onTurnOnSelectionMode={(item) => item && toggleValue(item)}
                        sections={listValuesSections}
                        onCheckboxPress={toggleValue}
                        onSelectRow={openListValuePage}
                        onSelectAll={toggleAllValues}
                        ListItem={TableListItem}
                        customListHeader={getCustomListHeader()}
                        shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        showScrollIndicator={false}
                    />
                )}
                <ConfirmModal
                    isVisible={deleteValuesConfirmModalVisible}
                    onConfirm={handleDeleteValues}
                    onCancel={() => setDeleteValuesConfirmModalVisible(false)}
                    title={translate(selectedValuesArray.length === 1 ? 'workspace.reportFields.deleteValue' : 'workspace.reportFields.deleteValues')}
                    prompt={translate(selectedValuesArray.length === 1 ? 'workspace.reportFields.deleteValuePrompt' : 'workspace.reportFields.deleteValuesPrompt')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ReportFieldsListValuesPage.displayName = 'ReportFieldsListValuesPage';

export default withPolicyAndFullscreenLoading(ReportFieldsListValuesPage);
