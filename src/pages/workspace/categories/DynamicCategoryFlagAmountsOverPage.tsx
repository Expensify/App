import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import CategoryFlagLimitsLoadError from '@components/Rule/CategoryFlagLimitsLoadError';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCategoryFlagLimits from '@hooks/useCategoryFlagLimits';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDraftValues} from '@libs/actions/FormActions';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import {getCategoryFlagLimit, hasFlagForReviewRuleForLegacyWrite} from '@libs/FlagForReviewRulesUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {setPolicyCategoryMaxAmount} from '@userActions/Policy/Category';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceCategoryFlagAmountsOverForm';

import React, {useEffect} from 'react';
import {View} from 'react-native';

type DynamicCategoryFlagAmountsOverPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_FLAG_AMOUNTS_OVER>;

function DynamicCategoryFlagAmountsOverPage({
    route: {
        params: {policyID, categoryName},
    },
}: DynamicCategoryFlagAmountsOverPageProps) {
    const policy = usePolicy(policyID);
    const categorySettingsBackPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_FLAG_AMOUNTS_OVER.path);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FLAG_AMOUNTS_OVER_FORM_DRAFT);
    const category = policyCategories?.[categoryName];
    const {categoryFlagLimits, areCategoryFlagLimitsLoading, haveCategoryFlagLimitsLoaded} = useCategoryFlagLimits(policyID, category);

    useEffect(() => {
        return () => {
            clearDraftValues(ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FLAG_AMOUNTS_OVER_FORM);
        };
    }, []);

    const {inputCallbackRef} = useAutoFocusInput();

    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const flagLimit = getCategoryFlagLimit(category, categoryFlagLimits, policyCurrency);
    const expenseLimitType = formDraft?.expenseLimitType ?? flagLimit?.expenseLimitType ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE;
    const hasCurrencyMismatch = !!flagLimit && flagLimit.currency !== policyCurrency;
    const isLimitUnavailable = !flagLimit && (!haveCategoryFlagLimitsLoaded || !category || hasFlagForReviewRuleForLegacyWrite(category, categoryFlagLimits));
    const decodedCategoryName = getDecodedCategoryName(categoryName);
    const currency = flagLimit?.currency ?? policyCurrency;
    const defaultValue = flagLimit ? convertToFrontendAmountAsString(flagLimit.amount, getCurrencyDecimals(currency)) : '';
    if (areCategoryFlagLimitsLoading && !flagLimit) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID="DynamicCategoryFlagAmountsOverPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.categoryRules.flagAmountsOver')}
                    onBackButtonPress={() => Navigation.goBack(categorySettingsBackPath)}
                />
                {isLimitUnavailable ? (
                    <CategoryFlagLimitsLoadError missingCategoriesPolicyID={!policyCategories ? policyID : undefined} />
                ) : (
                    <FormProvider
                        style={[styles.flexGrow1]}
                        formID={ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FLAG_AMOUNTS_OVER_FORM}
                        onSubmit={({maxExpenseAmount}) => {
                            if (hasCurrencyMismatch) {
                                return;
                            }
                            setPolicyCategoryMaxAmount(policyID, categoryName, maxExpenseAmount, expenseLimitType, policyCategories);
                            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(categorySettingsBackPath));
                        }}
                        submitButtonText={translate('workspace.editor.save')}
                        isSubmitDisabled={hasCurrencyMismatch}
                        enabledWhenOffline
                        submitButtonStyles={styles.ph5}
                        shouldHideFixErrorsAlert
                        addBottomSafeAreaPadding
                    >
                        <View style={[styles.mb4, styles.pt3, styles.ph5]}>
                            <Text style={styles.pb5}>{translate('workspace.rules.categoryRules.flagAmountsOverDescription', decodedCategoryName)}</Text>
                            <InputWrapper
                                label={translate('iou.amount')}
                                InputComponent={AmountForm}
                                inputID={INPUT_IDS.MAX_EXPENSE_AMOUNT}
                                currency={currency}
                                defaultValue={defaultValue}
                                isCurrencyPressable={false}
                                disabled={hasCurrencyMismatch}
                                ref={inputCallbackRef}
                                displayAsTextInput
                            />
                            <Text style={[styles.mutedTextLabel, styles.mt2]}>
                                {expenseLimitType === CONST.POLICY.EXPENSE_LIMIT_TYPES.DAILY
                                    ? translate('workspace.rules.categoryRules.expenseLimitTypes.dailySubtitle')
                                    : translate('workspace.rules.categoryRules.flagAmountsOverSubtitle')}
                            </Text>
                        </View>
                        <View style={styles.mt3}>
                            <MenuItemField
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.CATEGORIES.FLAG_AMOUNTS_OVER_TYPE}
                                name={translate('common.type')}
                                value={translate(`workspace.rules.categoryRules.expenseLimitTypes.${expenseLimitType}`)}
                                onPress={hasCurrencyMismatch ? undefined : () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.EXPENSE_LIMIT_TYPE_SELECTOR.path))}
                            />
                        </View>
                    </FormProvider>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicCategoryFlagAmountsOverPage;
