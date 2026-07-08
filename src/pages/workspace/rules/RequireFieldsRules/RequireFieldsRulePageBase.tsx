import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import FieldRequirementsDirectionToggle from '@components/RequireFieldsRules/FieldRequirementsDirectionToggle';
import FieldRequirementsToggleMenuItem from '@components/RequireFieldsRules/FieldRequirementsToggleMenuItem';
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
import useThemeStyles from '@hooks/useThemeStyles';

import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import Tab from '@libs/actions/Tab';
import {clearDraftRequireFieldsRule, setDraftRequireFieldsRule, updateDraftRequireFieldsRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import {
    deleteRequireFieldsRule,
    getEffectiveRequireFieldsRuleForm,
    getRequireFieldsFieldToggleUpdate,
    getRequireFieldsFormFromCategory,
    getRequireFieldsRuleKey,
    getRequireFieldsRuleValidationError,
    inferFieldRequirementsDirection,
    saveRequireFieldsRule,
} from '@libs/RequireFieldsRulesUtils';
import type {FieldRequirementsDirection} from '@libs/RequireFieldsRulesUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {getRequireFieldsRuleCategoryRoute} from '@src/ROUTES';
import type {RequireFieldsRuleToggleFieldKey} from '@src/types/form/RequireFieldsRuleForm';
import INPUT_IDS from '@src/types/form/RequireFieldsRuleForm';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type RequireFieldsRulePageBaseProps = {
    policyID: string;
    categoryName?: string;
    direction?: FieldRequirementsDirection;
    testID: string;
};

function RequireFieldsRulePageBase({policyID, categoryName, direction: routeDirection, testID}: RequireFieldsRulePageBaseProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
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
        const ruleKey = getRequireFieldsRuleKey(editDirection, categoryName);

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

    const errorMessage = getRequireFieldsRuleValidationError(form, selectedCategory, translate, isAttendeeFieldApplicable);

    const handleToggleField = (fieldKey: RequireFieldsRuleToggleFieldKey, value: boolean) => {
        updateDraftRequireFieldsRule(getRequireFieldsFieldToggleUpdate(direction, fieldKey, value));
    };

    const handleDirectionChange = (newDirection: FieldRequirementsDirection) => {
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
        const editDirection = routeDirection ?? formToSave[INPUT_IDS.DIRECTION];

        if (isEditing && categoryName && editDirection && formToSave[INPUT_IDS.CATEGORY] && formToSave[INPUT_IDS.CATEGORY] !== categoryName) {
            deleteRequireFieldsRule(policyData, getRequireFieldsRuleKey(editDirection, categoryName));
        }

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

    const activeCategoryName = selectedCategoryName ?? categoryName;
    const activeDirection = routeDirection ?? direction;

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
                        onPress={
                            canWriteRules
                                ? () => Navigation.navigate(getRequireFieldsRuleCategoryRoute(policyID, isEditing ? activeCategoryName : undefined, isEditing ? activeDirection : undefined))
                                : undefined
                        }
                        shouldShowRightIcon={canWriteRules}
                        interactive={canWriteRules}
                        icon={icons.Folder}
                        iconWidth={variables.iconSizeNormal}
                        iconHeight={variables.iconSizeNormal}
                        shouldIconUseAutoWidthStyle
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
                        .map((field) => (
                            <FieldRequirementsToggleMenuItem
                                key={field.key}
                                fieldKey={field.key}
                                label={field.label}
                                direction={direction}
                                effectiveForm={effectiveForm}
                                canWriteRules={canWriteRules}
                                onToggle={handleToggleField}
                            />
                        ))}
                </ScrollView>
                {footer}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RequireFieldsRulePageBase;
