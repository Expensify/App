import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
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
import {getRequireFieldsFormFromCategory, saveRequireFieldsRule} from '@libs/RequireFieldsRulesUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {RequireFieldsRuleForm} from '@src/types/form/RequireFieldsRuleForm';

type RequireFieldsRulePageBaseProps = {
    policyID: string;
    categoryName?: string;
    testID: string;
};

type FieldToggleKey = Exclude<keyof RequireFieldsRuleForm, 'category'>;

function getValidationError(form: RequireFieldsRuleForm | null | undefined, translate: ReturnType<typeof useLocalize>['translate']): string {
    if (!form?.category) {
        return translate('workspace.rules.requireFieldsRule.confirmErrorCategory');
    }

    if (!form.requireDescription && !form.requireReceipt && !form.requireItemizedReceipt && !form.requireAttendees) {
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
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const icons = useMemoizedLazyExpensifyIcons(['Folder']);
    const isEditing = !!categoryName;
    const ruleKey = categoryName ?? ROUTES.NEW;

    const [form] = useOnyx(ONYXKEYS.FORMS.REQUIRE_FIELDS_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [shouldShowError, setShouldShowError] = useState(false);
    const initializedDraftForRuleKeyRef = useRef<string | null>(null);

    const category = categoryName ? policyCategories?.[categoryName] : undefined;
    const categoryDisplayName = form?.category ? getDecodedCategoryName(form.category) : undefined;

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
            category: categoryName,
            ...getRequireFieldsFormFromCategory(category),
        });
    }, [category, categoryName, isEditing]);

    const fetchPolicyData = useCallback(() => {
        if (!policy?.areCategoriesEnabled || policyCategories) {
            return;
        }
        openPolicyCategoriesPage(policyID);
    }, [policy?.areCategoriesEnabled, policyCategories, policyID]);

    useNetwork({onReconnect: fetchPolicyData});

    useEffect(() => {
        fetchPolicyData();
    }, [fetchPolicyData]);

    const fieldToggles: Array<{key: FieldToggleKey; label: string; isVisible: boolean}> = useMemo(
        () => [
            {key: 'requireDescription', label: translate('common.description'), isVisible: true},
            {key: 'requireReceipt', label: translate('common.receipt'), isVisible: true},
            {key: 'requireItemizedReceipt', label: translate('workspace.rules.requireFieldsRule.itemizedReceipt'), isVisible: true},
            {key: 'requireAttendees', label: translate('iou.attendees'), isVisible: true},
        ],
        [translate],
    );

    const errorMessage = getValidationError(form, translate);

    const handleToggleField = (fieldKey: FieldToggleKey, value: boolean) => {
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
                        errorText={canWriteRules && shouldShowError && !form?.category ? translate('common.error.fieldRequired') : ''}
                        onPress={canWriteRules ? () => Navigation.navigate(ROUTES.RULES_REQUIRE_FIELDS_RULE_CATEGORY.getRoute(policyID, ruleKey)) : undefined}
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
                            const isChecked = !!form?.[field.key];
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
