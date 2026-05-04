import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceCategoryFlagAmountsOverForm';
import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';

type DynamicExpenseLimitTypeSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_EXPENSE_LIMIT_TYPE_SELECTOR>;

function DynamicExpenseLimitTypeSelectorPage({
    route: {
        params: {policyID, categoryName},
    },
}: DynamicExpenseLimitTypeSelectorPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.EXPENSE_LIMIT_TYPE_SELECTOR.path);
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FLAG_AMOUNTS_OVER_FORM_DRAFT);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const currentExpenseLimitType = formDraft?.expenseLimitType ?? policyCategories?.[categoryName]?.expenseLimitType ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE;

    const expenseLimitTypes = Object.values(CONST.POLICY.EXPENSE_LIMIT_TYPES).map((value) => ({
        value,
        text: translate(`workspace.rules.categoryRules.expenseLimitTypes.${value}`),
        alternateText: translate(`workspace.rules.categoryRules.expenseLimitTypes.${value}Subtitle`),
        keyForList: value,
        isSelected: currentExpenseLimitType === value,
    }));

    const onSelectRow = (item: {value: PolicyCategoryExpenseLimitType}) => {
        setDraftValues(ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FLAG_AMOUNTS_OVER_FORM, {
            [INPUT_IDS.EXPENSE_LIMIT_TYPE]: item.value,
        });
        Navigation.goBack(backPath);
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                style={styles.pb0}
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="DynamicExpenseLimitTypeSelectorPage"
            >
                <HeaderWithBackButton
                    title={translate('common.type')}
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
                <SelectionList
                    data={expenseLimitTypes}
                    ListItem={RadioListItem}
                    onSelectRow={onSelectRow}
                    shouldSingleExecuteRowSelect
                    style={{containerStyle: [styles.pt3]}}
                    initiallyFocusedItemKey={currentExpenseLimitType}
                    alternateNumberOfSupportedLines={3}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicExpenseLimitTypeSelectorPage;
