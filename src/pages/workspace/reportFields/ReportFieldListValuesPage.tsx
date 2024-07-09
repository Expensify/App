import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import ListItemRightCaretWithLabel from '@components/SelectionList/ListItemRightCaretWithLabel';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ReportField from '@libs/actions/Policy/ReportField';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
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

type ReportFieldListValuesPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_LIST_VALUES>;

function ReportFieldListValuesPage({
    route: {
        params: {policyID},
    },
}: ReportFieldListValuesPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);

    const [selectedValues, setSelectedValues] = useState<Record<string, boolean>>({});
    const [deleteValuesConfirmModalVisible, setDeleteValuesConfirmModalVisible] = useState(false);

    const listValuesSections = useMemo(() => {
        const data = Object.values(formDraft?.listValues ?? {}).map((value, index) => ({
            value,
            index,
            text: value,
            keyForList: value,
            isSelected: selectedValues[value],
            enabled: formDraft?.disabledListValues?.[index] ?? true,
            rightElement: (
                <ListItemRightCaretWithLabel
                    shouldShowCaret={false}
                    labelText={formDraft?.disabledListValues?.[index] ? translate('workspace.common.disabled') : translate('workspace.common.enabled')}
                />
            ),
        }));

        return [{data, isDisabled: false}];
    }, [formDraft?.disabledListValues, formDraft?.listValues, selectedValues, translate]);

    const shouldShowEmptyState = Object.values(formDraft?.listValues ?? {}).length <= 0;
    const selectedValuesArray = Object.keys(selectedValues).filter((key) => selectedValues[key]);

    const toggleValue = (valueItem: ValueListItem) => {
        setSelectedValues((prev) => ({
            ...prev,
            [valueItem.value]: !prev[valueItem.value],
        }));
    };

    const toggleAllValues = () => {
        const listValues = formDraft?.listValues ?? [];
        const isAllSelected = listValues.length === Object.keys(selectedValues).length;

        setSelectedValues(isAllSelected ? {} : Object.fromEntries(listValues.map((value) => [value, true])));
    };

    const handleDeleteValues = () => {
        setSelectedValues({});

        const valuesToDelete = selectedValuesArray.reduce<number[]>((acc, valueName) => {
            const index = formDraft?.listValues?.indexOf(valueName) ?? -1;

            if (index !== -1) {
                acc.push(index);
            }

            return acc;
        }, []);

        ReportField.deleteReportFieldsListValue(valuesToDelete);
        setDeleteValuesConfirmModalVisible(false);
    };

    const openListValuePage = (valueItem: ValueListItem) => {
        if (valueItem.index === undefined) {
            return;
        }

        Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELD_VALUE_SETTINGS.getRoute(policyID, valueItem.index));

        setSelectedValues({});
    };

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3]}>
            <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
        </View>
    );

    const getHeaderButtons = () => {
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];

        if (selectedValuesArray.length > 0) {
            options.push({
                icon: Expensicons.Trashcan,
                text: translate(selectedValuesArray.length === 1 ? 'workspace.reportFields.deleteValue' : 'workspace.reportFields.deleteValues'),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: () => setDeleteValuesConfirmModalVisible(true),
            });

            const enabledValues = selectedValuesArray.filter((valueName) => {
                const index = formDraft?.listValues?.indexOf(valueName) ?? -1;
                return !formDraft?.disabledListValues?.[index];
            });

            if (enabledValues.length > 0) {
                const valuesToDisable = selectedValuesArray.reduce<number[]>((acc, valueName) => {
                    const index = formDraft?.listValues?.indexOf(valueName) ?? -1;
                    if (!formDraft?.disabledListValues?.[index] && index !== -1) {
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
                        ReportField.setReportFieldsListValueEnabled(valuesToDisable, false);
                    },
                });
            }

            const disabledValues = selectedValuesArray.filter((valueName) => {
                const index = formDraft?.listValues?.indexOf(valueName) ?? -1;
                return formDraft?.disabledListValues?.[index];
            });

            if (disabledValues.length > 0) {
                const valuesToEnable = selectedValuesArray.reduce<number[]>((acc, valueName) => {
                    const index = formDraft?.listValues?.indexOf(valueName) ?? -1;
                    if (formDraft?.disabledListValues?.[index] && index !== -1) {
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
                    customText={translate('workspace.common.selected', {selectedNumber: selectedValuesArray.length})}
                    options={options}
                    isSplitButton={false}
                    style={[isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && styles.mb3]}
                />
            );
        }

        return (
            <Button
                style={[isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && styles.mb3]}
                medium
                success
                icon={Expensicons.Plus}
                text={translate('workspace.reportFields.addValue')}
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELD_ADD_VALUE.getRoute(policyID))}
            />
        );
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={styles.defaultModalContainer}
                testID={ReportFieldListValuesPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.reportFields.listValues')}
                    onBackButtonPress={Navigation.goBack}
                >
                    {!isSmallScreenWidth && getHeaderButtons()}
                </HeaderWithBackButton>
                {isSmallScreenWidth && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                <View style={[styles.ph5, styles.pv4]}>
                    <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.reportFields.listInputSubtitle')}</Text>
                </View>
                {shouldShowEmptyState && (
                    <WorkspaceEmptyStateSection
                        containerStyle={[styles.bgTransparent, styles.mtAuto, styles.mbAuto]}
                        title={translate('workspace.reportFields.emptyReportFieldsValues.title')}
                        icon={Illustrations.EmptyStateExpenses}
                        subtitle={translate('workspace.reportFields.emptyReportFieldsValues.subtitle')}
                    />
                )}
                {!shouldShowEmptyState && (
                    <SelectionList
                        canSelectMultiple
                        sections={listValuesSections}
                        onCheckboxPress={toggleValue}
                        onSelectRow={openListValuePage}
                        shouldDebounceRowSelect={false}
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

ReportFieldListValuesPage.displayName = 'ReportFieldListValuesPage';

export default ReportFieldListValuesPage;
