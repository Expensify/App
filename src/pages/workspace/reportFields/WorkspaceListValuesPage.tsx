import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
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
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ValueListItem = ListItem & {
    value: string;
    enabled: boolean;
    orderWeight?: number;
};

type WorkspaceListValuesPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_LIST_VALUES>;

function WorkspaceListValuesPage({
    route: {
        params: {policyID},
    },
}: WorkspaceListValuesPageProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);

    const [selectedValues, setSelectedValues] = useState<Record<string, boolean>>({});

    const valueList = useMemo(
        () =>
            Object.values(formDraft?.listValues ?? {}).map((value, index) => ({
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
            })),
        [formDraft?.disabledListValues, formDraft?.listValues, selectedValues, translate],
    );

    const shouldShowEmptyState = Object.values(formDraft?.listValues ?? {}).length <= 0;

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

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.pr9]}>
            <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
        </View>
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={WorkspaceListValuesPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('common.listValues')}
                    onBackButtonPress={Navigation.goBack}
                >
                    <View style={[styles.w100, styles.flexRow, styles.gap2, isSmallScreenWidth && styles.mb3]}>
                        <Button
                            style={[isSmallScreenWidth && styles.flex1]}
                            medium
                            success
                            icon={Expensicons.Plus}
                            text={translate('common.addValue')}
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELD_ADD_VALUE.getRoute(policyID))}
                        />
                    </View>
                </HeaderWithBackButton>
                <View style={[styles.ph5, styles.pb4]}>
                    <Text style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText])}>{translate('workspace.reportFields.listInputSubtitle')}</Text>
                </View>
                {shouldShowEmptyState && (
                    <WorkspaceEmptyStateSection
                        containerStyle={styles.bgTransparent}
                        title="You haven't created any list values"
                        icon={Illustrations.EmptyStateExpenses}
                        subtitle="Add a custom values that appears on reports."
                    />
                )}
                {!shouldShowEmptyState && (
                    <SelectionList
                        canSelectMultiple
                        sections={[{data: valueList, isDisabled: false}]}
                        onCheckboxPress={toggleValue}
                        onSelectRow={(item) => item.index !== undefined && Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELD_VALUE_SETTINGS.getRoute(policyID, item.index))}
                        shouldDebounceRowSelect={false}
                        onSelectAll={toggleAllValues}
                        ListItem={TableListItem}
                        customListHeader={getCustomListHeader()}
                        shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        showScrollIndicator={false}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceListValuesPage.displayName = 'WorkspaceListValuesPage';

export default WorkspaceListValuesPage;
