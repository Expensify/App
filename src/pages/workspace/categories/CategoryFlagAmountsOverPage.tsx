import type {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Category from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceCategoryFlagAmountsOverForm';
import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';
import ExpenseLimitTypeSelector from './ExpenseLimitTypeSelector/ExpenseLimitTypeSelector';

type EditCategoryPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_FLAG_AMOUNTS_OVER>;

function CategoryFlagAmountsOverPage({
    route: {
        params: {policyID, categoryName},
    },
}: EditCategoryPageProps) {
    const policy = usePolicy(policyID);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [expenseLimitType, setExpenseLimitType] = useState<PolicyCategoryExpenseLimitType>(policyCategories?.[categoryName]?.expenseLimitType ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE);

    const {inputCallbackRef} = useAutoFocusInput();

    const policyCategoryMaxExpenseAmount = policyCategories?.[categoryName]?.maxExpenseAmount;

    const defaultValue =
        policyCategoryMaxExpenseAmount === CONST.DISABLED_MAX_EXPENSE_VALUE || !policyCategoryMaxExpenseAmount
            ? ''
            : CurrencyUtils.convertToFrontendAmountAsString(policyCategoryMaxExpenseAmount, policy?.outputCurrency);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={CategoryFlagAmountsOverPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.categoryRules.flagAmountsOver')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName))}
                />
                <FormProvider
                    style={[styles.flexGrow1]}
                    formID={ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FLAG_AMOUNTS_OVER_FORM}
                    onSubmit={({maxExpenseAmount}) => {
                        Category.setPolicyCategoryMaxAmount(policyID, categoryName, maxExpenseAmount, expenseLimitType);
                        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)));
                    }}
                    submitButtonText={translate('workspace.editor.save')}
                    enabledWhenOffline
                    submitButtonStyles={styles.ph5}
                >
                    <View style={[styles.mb4, styles.pt3, styles.ph5]}>
                        <Text style={styles.pb5}>{translate('workspace.rules.categoryRules.flagAmountsOverDescription', {categoryName})}</Text>
                        <InputWrapper
                            label={translate('iou.amount')}
                            InputComponent={AmountForm}
                            inputID={INPUT_IDS.MAX_EXPENSE_AMOUNT}
                            currency={CurrencyUtils.getCurrencySymbol(policy?.outputCurrency ?? CONST.CURRENCY.USD)}
                            defaultValue={defaultValue}
                            isCurrencyPressable={false}
                            ref={inputCallbackRef}
                            displayAsTextInput
                        />
                        <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('workspace.rules.categoryRules.flagAmountsOverSubtitle')}</Text>
                    </View>
                    <ExpenseLimitTypeSelector
                        label={translate('common.type')}
                        defaultValue={expenseLimitType}
                        wrapperStyle={[styles.ph5, styles.mt3]}
                        setNewExpenseLimitType={setExpenseLimitType}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CategoryFlagAmountsOverPage.displayName = 'CategoryFlagAmountsOverPage';

export default CategoryFlagAmountsOverPage;
