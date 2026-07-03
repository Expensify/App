import Checkbox from '@components/Checkbox';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import FieldRequirementsDirectionToggle from '@components/RequireFieldsRules/FieldRequirementsDirectionToggle';
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
import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import {getEffectiveRequireFieldsRuleForm, getRequireFieldsFormFromCategory, inferFieldRequirementsDirection, saveRequireFieldsRule} from '@libs/RequireFieldsRulesUtils';
import type {FieldRequirementsDirection} from '@libs/RequireFieldsRulesUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {getRequireFieldsRuleCategoryRoute} from '@src/ROUTES';
import type {RequireFieldsRuleForm, RequireFieldsRuleToggleFieldKey} from '@src/types/form/RequireFieldsRuleForm';
import INPUT_IDS from '@src/types/form/RequireFieldsRuleForm';
import type {Policy, PolicyCategory} from '@src/types/onyx';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type RequireFieldsRulePageBaseProps = {
    policyID: string;
    categoryName?: string;
    direction?: FieldRequirementsDirection;
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
    const direction = effectiveForm[INPUT_IDS.DIRECTION];
    const isAttendeeFieldApplicable = isAttendeeTrackingEnabled(policy);

    if (direction === CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE) {
        const hasReceipt = !!effectiveForm[INPUT_IDS.REQUIRE_RECEIPT];
        const hasItemizedReceipt = !!effectiveForm[INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT];

        if (!hasReceipt && !hasItemizedReceipt) {
            return translate('workspace.rules.requireFieldsRule.confirmErrorDoNotRequireField');
        }

        return '';
    }

    const hasDescription = !!effectiveForm[INPUT_IDS.REQUIRE_DESCRIPTION];
    const hasAttendees = isAttendeeFieldApplicable && !!effectiveForm[INPUT_IDS.REQUIRE_ATTENDEES];
    const hasReceipt = !!effectiveForm[INPUT_IDS.REQUIRE_RECEIPT];
    const hasItemizedReceipt = !!effectiveForm[INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT];

    if (!hasDescription && !hasAttendees && !hasReceipt && !hasItemizedReceipt) {
        return translate('workspace.rules.requireFieldsRule.confirmErrorField');
    }

    return '';
}

function RequireFieldsRulePageBase({policyID, categoryName, direction: routeDirection, testID}: RequireFieldsRulePageBaseProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const policyData = usePolicyData(policyID);
    const {policy} = policyData;
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const isAttendeeFieldApplicable = isAttendeeTrackingEnabled(policy);
    const icons = useMemoizedLazyExpensifyIcons(['Folder']);
    const isEditing = !!categoryName;

    const [form] = useOnyx(ONYXKEYS.FORMS.REQUIRE_FIELDS_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [shouldShowError, setShouldShowError] = useState(false);
    const initializedDraftForRuleKeyRef = useRef<string | null>(null);

    const category = categoryName ? policyCategories?.[categoryName] : undefined;
    const selectedCategoryName = form?.[INPUT_IDS.CATEGORY];
    const selectedCategory = selectedCategoryName ? policyCategories?.[selectedCategoryName] : undefined;
    const effectiveForm = form && selectedCategory ? getEffectiveRequireFieldsRuleForm(selectedCategory, form) : form;
    const categoryDisplayName = selectedCategoryName ? getDecodedCategoryName(selectedCategoryName) : undefined;
    const direction = effectiveForm?.[INPUT_IDS.DIRECTION] ?? CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE;
    const isWaiveDirection = direction === CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE;
    const formCategory = form?.[INPUT_IDS.CATEGORY];
    const formDirection = form?.[INPUT_IDS.DIRECTION];

    useEffect(() => () => clearDraftRequireFieldsRule(), []);

    useEffect(() => {
        if (!isEditing) {
            if (initializedDraftForRuleKeyRef.current !== ROUTES.NEW) {
                initializedDraftForRuleKeyRef.current = ROUTES.NEW;
                setDraftRequireFieldsRule({
                    [INPUT_IDS.DIRECTION]: CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE,
                });
            }
            return;
        }

        if (!category || !categoryName) {
            return;
        }

        const editDirection = routeDirection ?? (formCategory === categoryName && formDirection ? formDirection : undefined) ?? inferFieldRequirementsDirection(category);
        const ruleKey = `${editDirection}${CONST.FIELD_REQUIREMENTS_RULE_KEY_SEPARATOR}${categoryName}`;

        if (initializedDraftForRuleKeyRef.current === ruleKey) {
            return;
        }

        if (formCategory === categoryName && formDirection === editDirection) {
            initializedDraftForRuleKeyRef.current = ruleKey;
            return;
        }

        initializedDraftForRuleKeyRef.current = ruleKey;
        setDraftRequireFieldsRule({
            [INPUT_IDS.CATEGORY]: categoryName,
            ...getRequireFieldsFormFromCategory(category, editDirection),
        });
    }, [category, categoryName, routeDirection, formCategory, formDirection, isEditing]);

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

    const fieldToggles: Array<{
        key: RequireFieldsRuleToggleFieldKey;
        label: string;
        isVisible: boolean;
    }> = [
        {
            key: INPUT_IDS.REQUIRE_DESCRIPTION,
            label: translate('common.description'),
            isVisible: !isWaiveDirection,
        },
        {
            key: INPUT_IDS.REQUIRE_RECEIPT,
            label: translate('common.receipt'),
            isVisible: true,
        },
        {
            key: INPUT_IDS.REQUIRE_ITEMIZED_RECEIPT,
            label: translate('workspace.rules.requireFieldsRule.itemizedReceipt'),
            isVisible: true,
        },
        {
            key: INPUT_IDS.REQUIRE_ATTENDEES,
            label: translate('iou.attendees'),
            isVisible: !isWaiveDirection && isAttendeeFieldApplicable,
        },
    ];

    const errorMessage = getValidationError(form, selectedCategory, policy, translate);

    const handleToggleField = (fieldKey: RequireFieldsRuleToggleFieldKey, value: boolean) => {
        updateDraftRequireFieldsRule({[fieldKey]: value});
    };

    const handleDirectionChange = (newDirection: typeof direction) => {
        updateDraftRequireFieldsRule({
            [INPUT_IDS.DIRECTION]: newDirection,
            ...getRequireFieldsFormFromCategory(selectedCategory, newDirection),
        });
        setShouldShowError(false);
    };

    const handleSave = () => {
        if (!form) {
            return;
        }

        const formToSave = getEffectiveRequireFieldsRuleForm(selectedCategory, form);
        saveRequireFieldsRule(policyData, formToSave);

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
                    <View style={[styles.ph5, styles.pv3, styles.gap3]}>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.flexWrap, styles.gap3]}>
                            <FieldRequirementsDirectionToggle
                                direction={direction}
                                disabled={!canWriteRules}
                                onSelect={handleDirectionChange}
                            />
                            <Text style={[styles.textLabel, styles.textSupporting, styles.lh16]}>{translate('workspace.rules.requireFieldsRule.theFollowing')}</Text>
                        </View>
                    </View>
                    {fieldToggles
                        .filter((field) => field.isVisible)
                        .map((field) => {
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
