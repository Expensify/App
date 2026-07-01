import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyData from '@hooks/usePolicyData';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import Tab from '@libs/actions/Tab';
import {clearDraftRequireFieldsRule, setDraftRequireFieldsRule, updateDraftRequireFieldsRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import {
    getEffectiveRequireFieldsRuleForm,
    getRequireFieldsFormFromCategory,
    getRequireFieldsRuleDescription,
    hasCustomNonZeroReceiptThreshold,
    isNeverReceiptRequired,
    saveRequireFieldsRule,
} from '@libs/RequireFieldsRulesUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {getRequireFieldsRuleCategoryRoute} from '@src/ROUTES';
import type {RequireFieldsRuleForm, RequireFieldsRuleToggleFieldKey} from '@src/types/form/RequireFieldsRuleForm';
import INPUT_IDS from '@src/types/form/RequireFieldsRuleForm';
import type {Policy, PolicyCategory} from '@src/types/onyx';

type RequireFieldsRulePageBaseProps = {
    policyID: string;
    categoryName?: string;
    testID: string;
};

function getValidationError(
    form: RequireFieldsRuleForm | null | undefined,
    category: PolicyCategory | undefined,
    policy: Policy | undefined,
    translate: ReturnType<typeof useLocalize>['translate'],
): string {
    if (!form?.[INPUT_IDS.CATEGORY]) {
        return translate('workspace.rules.requireFieldsRule.confirmErrorCategory');
    }

    const effectiveForm = getEffectiveRequireFieldsRuleForm(category, form);
    const isAttendeeFieldApplicable = isAttendeeTrackingEnabled(policy);
    const hasDescription = !!effectiveForm[INPUT_IDS.REQUIRE_DESCRIPTION];
    const hasAttendees = isAttendeeFieldApplicable && !!effectiveForm[INPUT_IDS.REQUIRE_ATTENDEES];
    const hasReceipt = !!effectiveForm[INPUT_IDS.REQUIRE_RECEIPT];
    const hasItemizedReceipt = !!effectiveForm[INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT];
    const hasNeverReceipt = isNeverReceiptRequired(category?.maxAmountNoReceipt);
    const hasNeverItemizedReceipt = isNeverReceiptRequired(category?.maxAmountNoItemizedReceipt);
    const hasCustomReceipt = hasCustomNonZeroReceiptThreshold(category?.maxAmountNoReceipt);
    const hasCustomItemizedReceipt = hasCustomNonZeroReceiptThreshold(category?.maxAmountNoItemizedReceipt);

    if (!hasDescription && !hasAttendees && !hasReceipt && !hasItemizedReceipt && !hasNeverReceipt && !hasNeverItemizedReceipt && !hasCustomReceipt && !hasCustomItemizedReceipt) {
        return translate('workspace.rules.requireFieldsRule.confirmErrorField');
    }

    return '';
}

function RequireFieldsRulePageBase({policyID, categoryName, testID}: RequireFieldsRulePageBaseProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const policyData = usePolicyData(policyID);
    const {policy} = policyData;
    const {convertToDisplayString} = useCurrencyListActions();
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const isAttendeeFieldApplicable = isAttendeeTrackingEnabled(policy);
    const icons = useMemoizedLazyExpensifyIcons(['Folder']);
    const isEditing = !!categoryName;
    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const [form] = useOnyx(ONYXKEYS.FORMS.REQUIRE_FIELDS_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [shouldShowError, setShouldShowError] = useState(false);
    const initializedDraftForRuleKeyRef = useRef<string | null>(null);

    const category = categoryName ? policyCategories?.[categoryName] : undefined;
    const selectedCategoryName = form?.[INPUT_IDS.CATEGORY];
    const selectedCategory = selectedCategoryName ? policyCategories?.[selectedCategoryName] : undefined;
    const effectiveForm = form && selectedCategory ? getEffectiveRequireFieldsRuleForm(selectedCategory, form) : form;
    const categoryDisplayName = selectedCategoryName ? getDecodedCategoryName(selectedCategoryName) : undefined;

    useEffect(() => () => clearDraftRequireFieldsRule(), []);

    useEffect(() => {
        if (!isEditing) {
            if (initializedDraftForRuleKeyRef.current !== ROUTES.NEW) {
                initializedDraftForRuleKeyRef.current = ROUTES.NEW;
                setDraftRequireFieldsRule({});
            }
            return;
        }

        if (!category || !categoryName) {
            return;
        }

        if (initializedDraftForRuleKeyRef.current === categoryName) {
            return;
        }

        initializedDraftForRuleKeyRef.current = categoryName;
        setDraftRequireFieldsRule({
            [INPUT_IDS.CATEGORY]: categoryName,
            ...getRequireFieldsFormFromCategory(category),
        });
    }, [category, categoryName, isEditing]);

    const fetchPolicyData = useCallback(() => {
        if (!policy?.areCategoriesEnabled || policyCategories) {
            return;
        }
        openPolicyCategoriesPage(policyID);
    }, [policyID, policy?.areCategoriesEnabled, policyCategories]);

    useNetwork({onReconnect: fetchPolicyData});

    useFocusEffect(
        useCallback(() => {
            fetchPolicyData();
        }, [fetchPolicyData]),
    );

    const fieldToggles: Array<{key: RequireFieldsRuleToggleFieldKey; label: string; isVisible: boolean}> = [
        {key: INPUT_IDS.REQUIRE_DESCRIPTION, label: translate('common.description'), isVisible: true},
        {key: INPUT_IDS.REQUIRE_RECEIPT, label: translate('common.receipt'), isVisible: true},
        {key: INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT, label: translate('workspace.rules.requireFieldsRule.itemizedReceipt'), isVisible: true},
        {key: INPUT_IDS.REQUIRE_ATTENDEES, label: translate('iou.attendees'), isVisible: isAttendeeFieldApplicable},
    ];

    const errorMessage = getValidationError(form, selectedCategory, policy, translate);

    const handleToggleField = (fieldKey: RequireFieldsRuleToggleFieldKey, value: boolean) => {
        updateDraftRequireFieldsRule({[fieldKey]: value});
    };

    const handleSave = () => {
        if (!form) {
            return;
        }

        saveRequireFieldsRule(policyData, form);

        if (!isEditing && isRulesRevampEnabled) {
            Tab.setSelectedTab(CONST.TAB.RULES_TAB_TYPE, CONST.TAB.RULES.REQUIRE_FIELDS);
            Navigation.goBack(ROUTES.WORKSPACE_RULES.getRoute(policyID));
            return;
        }

        Navigation.goBack();
    };

    const handleSubmit = () => {
        if (!canWriteRules) {
            return;
        }

        if (errorMessage) {
            setShouldShowError(true);
            return;
        }

        handleSave();
    };

    const renderReceiptField = (fieldKey: typeof INPUT_IDS.REQUIRE_RECEIPT | typeof INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT, label: string) => {
        const categoryAmount = fieldKey === INPUT_IDS.REQUIRE_RECEIPT ? selectedCategory?.maxAmountNoReceipt : selectedCategory?.maxAmountNoItemizedReceipt;
        const ruleType = fieldKey === INPUT_IDS.REQUIRE_RECEIPT ? CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_RECEIPTS_OVER : CONST.REQUIRE_FIELDS_RULE_TYPES.REQUIRE_ITEMIZED_RECEIPTS_OVER;

        if (hasCustomNonZeroReceiptThreshold(categoryAmount)) {
            return (
                <MenuItemWithTopDescription
                    key={fieldKey}
                    description={label}
                    title={getRequireFieldsRuleDescription(translate, ruleType, categoryAmount ?? undefined, convertToDisplayString, policyCurrency)}
                    interactive={false}
                />
            );
        }

        const isChecked = !!effectiveForm?.[fieldKey];
        const toggleField = () => handleToggleField(fieldKey, !isChecked);

        return (
            <MenuItem
                key={fieldKey}
                title={label}
                onPress={toggleField}
                disabled={!canWriteRules}
                interactive={canWriteRules}
                shouldShowRightComponent
                rightComponent={
                    <View style={[styles.pointerEventsAuto, StyleUtils.getMenuItemIconStyle(true), styles.alignItemsEnd]}>
                        <Checkbox
                            isChecked={isChecked}
                            onPress={toggleField}
                            accessibilityLabel={label}
                            accessible={false}
                            disabled={!canWriteRules}
                        />
                    </View>
                }
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.REQUIRE_FIELDS_RULE_FIELD_TOGGLE}
            />
        );
    };

    if (isEditing && categoryName && !category) {
        return <NotFoundPage />;
    }

    if (!isEditing && !!policy && !canWriteRules) {
        return <NotFoundPage />;
    }

    const footer = canWriteRules ? (
        <FormAlertWithSubmitButton
            buttonText={translate('workspace.rules.requireFieldsRule.saveRule')}
            containerStyles={[styles.m4, styles.mb5, styles.mh5]}
            isAlertVisible={shouldShowError && !!errorMessage}
            message={errorMessage}
            onSubmit={handleSubmit}
            enabledWhenOffline
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.REQUIRE_FIELDS_RULE_SAVE}
        />
    ) : null;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            shouldBeBlocked={!isRulesRevampEnabled}
        >
            <ScreenWrapper
                testID={testID}
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton title={translate('workspace.rules.requireFieldsRule.title')} />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <View style={[styles.ph5, styles.pv3, styles.gap6]}>
                        <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.rules.requireFieldsRule.subtitle')}</Text>
                        <Text style={[styles.textLabel, styles.textSupporting, styles.lh16]}>{translate('workspace.rules.merchantRules.ifAnyExpenseMatches')}</Text>
                    </View>
                    <MenuItemWithTopDescription
                        description={translate('common.category')}
                        title={categoryDisplayName}
                        errorText={canWriteRules && shouldShowError && !form?.[INPUT_IDS.CATEGORY] ? translate('common.error.fieldRequired') : ''}
                        onPress={canWriteRules ? () => Navigation.navigate(getRequireFieldsRuleCategoryRoute(policyID, categoryName)) : undefined}
                        shouldShowRightIcon={canWriteRules}
                        interactive={canWriteRules}
                        icon={icons.Folder}
                        iconWidth={variables.iconSizeNormal}
                        iconHeight={variables.iconSizeNormal}
                        shouldIconUseAutoWidthStyle
                        disabled={isEditing}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.REQUIRE_FIELDS_RULE_CATEGORY}
                    />
                    <View style={[styles.sectionDividerLine, styles.mh5, styles.mv3]} />
                    <Text style={[styles.textLabel, styles.textSupporting, styles.lh16, styles.ph5, styles.pv3]}>{translate('workspace.rules.requireFieldsRule.thenWarnMember')}</Text>
                    {fieldToggles
                        .filter((field) => field.isVisible)
                        .map((field) => {
                            if (field.key === INPUT_IDS.REQUIRE_RECEIPT || field.key === INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT) {
                                return renderReceiptField(field.key, field.label);
                            }

                            const isChecked = !!effectiveForm?.[field.key];
                            const toggleField = () => handleToggleField(field.key, !isChecked);

                            return (
                                <MenuItem
                                    key={field.key}
                                    title={field.label}
                                    onPress={toggleField}
                                    disabled={!canWriteRules}
                                    interactive={canWriteRules}
                                    shouldShowRightComponent
                                    rightComponent={
                                        <View style={[styles.pointerEventsAuto, StyleUtils.getMenuItemIconStyle(true), styles.alignItemsEnd]}>
                                            <Checkbox
                                                isChecked={isChecked}
                                                onPress={toggleField}
                                                accessibilityLabel={field.label}
                                                accessible={false}
                                                disabled={!canWriteRules}
                                            />
                                        </View>
                                    }
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.REQUIRE_FIELDS_RULE_FIELD_TOGGLE}
                                />
                            );
                        })}
                </ScrollView>
                {footer}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RequireFieldsRulePageBase;
