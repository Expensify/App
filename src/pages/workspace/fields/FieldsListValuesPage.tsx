import React, {useCallback, useMemo, useState} from 'react';
import type {ValueOf} from 'type-fest';
import {InteractionManager, View} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SearchBar from '@components/SearchBar';
import TableListItem from '@components/SelectionList/ListItem/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import Switch from '@components/Switch';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {
    deleteReportFieldsListValue,
    removeReportFieldListValue,
    setReportFieldsListValueEnabled,
    updateReportFieldListValueEnabled as updateReportFieldListValueEnabledReportField,
} from '@libs/actions/Policy/ReportField';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import {hasAccountingConnections as hasAccountingConnectionsPolicyUtils} from '@libs/PolicyUtils';
import {getReportFieldKey} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type {OnyxEntry} from 'react-native-onyx';

type ValueListItem = ListItem & {
    /** The value */
    value: string;

    /** Whether the value is enabled */
    enabled: boolean;

    /** The value order weight in the list */
    orderWeight?: number;
};

type FieldsListValuesPageProps = {
    policy: OnyxEntry<Policy>;
    policyID: string;
    reportFieldID?: string;
    isInvoicePage: boolean;
    featureName: ValueOf<typeof CONST.POLICY.MORE_FEATURES>;
    getValueSettingsRoute: (isInvoiceRoute: boolean, policyID: string, valueIndex: number, reportFieldID?: string) => string;
    getAddValueRoute: (isInvoiceRoute: boolean, policyID: string, reportFieldID?: string) => string;
    testID: string;
};

function FieldsListValuesPage({
    policy,
    policyID,
    reportFieldID,
    isInvoicePage,
    featureName,
    getValueSettingsRoute,
    getAddValueRoute,
    testID,
}: FieldsListValuesPageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here to use the mobile selection mode on small screens only
    // See https://github.com/Expensify/App/issues/48724 for more details
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {canBeMissing: true});
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const illustrations = useMemoizedLazyIllustrations(['FolderWithPapers']);

    const [selectedValues, setSelectedValues] = useState<Record<string, boolean>>({});
    const [deleteValuesConfirmModalVisible, setDeleteValuesConfirmModalVisible] = useState(false);
    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const reportField = reportFieldID ? policy?.fieldList?.[getReportFieldKey(reportFieldID)] : undefined;
    const shouldUseInvoiceRoutes = isInvoicePage || reportField?.target === CONST.REPORT_FIELD_TARGETS.INVOICE;

    const canSelectMultiple = isSmallScreenWidth ? isMobileSelectionModeEnabled : true;

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
                updateReportFieldListValueEnabledReportField({policy, reportFieldID, valueIndexes: [Number(valueIndex)], enabled: value});
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

    useSearchBackPress({
        onClearSelection: () => {
            setSelectedValues({});
        },
        onNavigationCallBack: () => Navigation.goBack(),
    });

    const data = useMemo(
        () =>
            listValues.map<ValueListItem>((value, index) => ({
                value,
                index,
                text: value,
                keyForList: value,
                isSelected: selectedValues[value] && canSelectMultiple,
                enabled: !disabledListValues.at(index),
                rightElement: (
                    <Switch
                        isOn={!disabledListValues.at(index)}
                        accessibilityLabel={translate('workspace.distanceRates.trackTax')}
                        onToggle={(newValue: boolean) => updateReportFieldListValueEnabled(newValue, index)}
                    />
                ),
            })),
        [canSelectMultiple, disabledListValues, listValues, selectedValues, translate, updateReportFieldListValueEnabled],
    );

    const filterListValue = useCallback((item: ValueListItem, searchInput: string) => {
        const itemText = StringUtils.normalize(item.text?.toLowerCase() ?? '');
        const normalizedSearchInput = StringUtils.normalize(searchInput.toLowerCase());
        return itemText.includes(normalizedSearchInput);
    }, []);
    const sortListValues = useCallback((values: ValueListItem[]) => values.sort((a, b) => localeCompare(a.value, b.value)), [localeCompare]);
    const [inputValue, setInputValue, filteredListValues] = useSearchResults(data, filterListValue, sortListValues);

    const filteredListValuesArray = filteredListValues.map((item) => item.value);

    const shouldShowEmptyState = Object.values(listValues ?? {}).length <= 0;
    const selectedValuesArray = Object.keys(selectedValues).filter((key) => selectedValues[key] && listValues.includes(key));

    const toggleValue = (valueItem: ValueListItem) => {
        setSelectedValues((prev) => ({
            ...prev,
            [valueItem.value]: !prev[valueItem.value],
        }));
    };

    const toggleAllValues = () => {
        setSelectedValues(selectedValuesArray.length > 0 ? {} : Object.fromEntries(filteredListValuesArray.map((value) => [value, true])));
    };

    const handleDeleteValues = () => {
        const valuesToDelete = selectedValuesArray.reduce<number[]>((acc, valueName) => {
            const index = listValues?.indexOf(valueName) ?? -1;

            if (index !== -1) {
                acc.push(index);
            }

            return acc;
        }, []);

        if (reportFieldID) {
            removeReportFieldListValue({policy, reportFieldID, valueIndexes: valuesToDelete});
        } else {
            deleteReportFieldsListValue({
                valueIndexes: valuesToDelete,
                listValues,
                disabledListValues,
            });
        }

        setDeleteValuesConfirmModalVisible(false);

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            setSelectedValues({});
        });
    };

    const openListValuePage = (valueItem: ValueListItem) => {
        if (valueItem.index === undefined) {
            return;
        }

        Navigation.navigate(getValueSettingsRoute(shouldUseInvoiceRoutes, policyID, valueItem.index, reportFieldID));
    };

    const getCustomListHeader = () => {
        if (filteredListValues.length === 0) {
            return null;
        }
        return (
            <CustomListHeader
                canSelectMultiple={canSelectMultiple}
                leftHeaderText={translate('common.name')}
                rightHeaderText={translate('common.enabled')}
                shouldShowRightCaret
            />
        );
    };

    const getHeaderButtons = () => {
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];
        if (isSmallScreenWidth ? isMobileSelectionModeEnabled : selectedValuesArray.length > 0) {
            if (selectedValuesArray.length > 0 && !hasAccountingConnections) {
                options.push({
                    icon: Expensicons.Trashcan,
                    text: translate(selectedValuesArray.length === 1 ? 'workspace.reportFields.deleteValue' : 'workspace.reportFields.deleteValues'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                    onSelected: () => setDeleteValuesConfirmModalVisible(true),
                });
            }
            const enabledValues = selectedValuesArray.filter((valueName) => {
                const index = listValues?.indexOf(valueName) ?? -1;
                return !disabledListValues?.at(index);
            });

            if (enabledValues.length > 0) {
                const valuesToDisable = selectedValuesArray.reduce<number[]>((acc, valueName) => {
                    const index = listValues?.indexOf(valueName) ?? -1;
                    if (!disabledListValues?.at(index) && index !== -1) {
                        acc.push(index);
                    }

                    return acc;
                }, []);

                options.push({
                    icon: Expensicons.Close,
                    text: translate(enabledValues.length === 1 ? 'workspace.reportFields.disableValue' : 'workspace.reportFields.disableValues'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
                    onSelected: () => {
                        setSelectedValues({});

                        if (reportFieldID) {
                            updateReportFieldListValueEnabledReportField({policy, reportFieldID, valueIndexes: valuesToDisable, enabled: false});
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

            const disabledValues = selectedValuesArray.filter((valueName) => {
                const index = listValues?.indexOf(valueName) ?? -1;
                return disabledListValues?.at(index);
            });

            if (disabledValues.length > 0) {
                const valuesToEnable = selectedValuesArray.reduce<number[]>((acc, valueName) => {
                    const index = listValues?.indexOf(valueName) ?? -1;
                    if (disabledListValues?.at(index) && index !== -1) {
                        acc.push(index);
                    }

                    return acc;
                }, []);

                options.push({
                    icon: Expensicons.Checkmark,
                    text: translate(disabledValues.length === 1 ? 'workspace.reportFields.enableValue' : 'workspace.reportFields.enableValues'),
                    value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                    onSelected: () => {
                        setSelectedValues({});

                        if (reportFieldID) {
                            updateReportFieldListValueEnabledReportField({policy, reportFieldID, valueIndexes: valuesToEnable, enabled: true});
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
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {count: selectedValuesArray.length})}
                    options={options}
                    isSplitButton={false}
                    style={[isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && styles.mb3]}
                    isDisabled={!selectedValuesArray.length}
                />
            );
        }

        if (!hasAccountingConnections) {
            return (
                <Button
                    style={[isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && styles.mb3]}
                    success
                    icon={Expensicons.Plus}
                    text={translate('workspace.reportFields.addValue')}
                    onPress={() => Navigation.navigate(getAddValueRoute(shouldUseInvoiceRoutes, policyID, reportFieldID))}
                />
            );
        }
    };

    const selectionModeHeader = isMobileSelectionModeEnabled && isSmallScreenWidth;

    const headerContent = (
        <>
            <View style={[styles.ph5, styles.pv4]}>
                <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.reportFields.listInputSubtitle')}</Text>
            </View>
            {data.length > CONST.SEARCH_ITEM_LIMIT && (
                <SearchBar
                    label={translate('workspace.reportFields.findReportField')}
                    inputValue={inputValue}
                    onChangeText={setInputValue}
                    shouldShowEmptyState={!shouldShowEmptyState && filteredListValues.length === 0}
                />
            )}
        </>
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={featureName}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID={testID}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate(selectionModeHeader ? 'common.selectMultiple' : 'workspace.reportFields.listValues')}
                    onBackButtonPress={() => {
                        if (isMobileSelectionModeEnabled) {
                            setSelectedValues({});
                            turnOffMobileSelectionMode();
                            return;
                        }
                        Navigation.goBack();
                    }}
                >
                    {!isSmallScreenWidth && getHeaderButtons()}
                </HeaderWithBackButton>
                {isSmallScreenWidth && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                {shouldShowEmptyState && (
                    <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                        {headerContent}
                        <EmptyStateComponent
                            title={translate('workspace.reportFields.emptyReportFieldsValues.title')}
                            subtitle={translate('workspace.reportFields.emptyReportFieldsValues.subtitle')}
                            SkeletonComponent={TableListItemSkeleton}
                            headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
                            headerMedia={illustrations.FolderWithPapers}
                            headerStyles={styles.emptyFolderDarkBG}
                            headerContentStyles={styles.emptyStateFolderWithPaperIconSize}
                        />
                    </ScrollView>
                )}
                {!shouldShowEmptyState && (
                    <SelectionListWithModal
                        data={filteredListValues}
                        ListItem={TableListItem}
                        onSelectRow={openListValuePage}
                        selectedItems={selectedValuesArray}
                        onSelectAll={filteredListValues.length > 0 ? toggleAllValues : undefined}
                        onTurnOnSelectionMode={(item) => item && toggleValue(item)}
                        style={{listHeaderWrapperStyle: [styles.ph9, styles.pv3, styles.pb5]}}
                        shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                        shouldUseDefaultRightHandSideCheckmark={false}
                        customListHeader={getCustomListHeader()}
                        customListHeaderContent={headerContent}
                        canSelectMultiple={canSelectMultiple}
                        onCheckboxPress={toggleValue}
                        showListEmptyContent={false}
                        showScrollIndicator={false}
                        turnOnSelectionModeOnLongPress
                        shouldHeaderBeInsideList
                        shouldShowRightCaret
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

export default FieldsListValuesPage;
