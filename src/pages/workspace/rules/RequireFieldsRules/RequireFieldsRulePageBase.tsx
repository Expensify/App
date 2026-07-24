import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import FieldRequirementSettingRow from '@components/RequireFieldsRules/FieldRequirementSettingRow';
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
    getActiveFieldRequirementsDirection,
    getEffectiveRequireFieldsRuleForm,
    getRequireFieldsDisplayedSetting,
    getRequireFieldsFieldClearKeys,
    getRequireFieldsFieldSettingUpdate,
    getRequireFieldsFormFromCategory,
    getRequireFieldsRuleKey,
    getRequireFieldsRuleValidationError,
    hasRequireFieldsRuleChanges,
    saveRequireFieldsRule,
} from '@libs/RequireFieldsRulesUtils';
import type {FieldRequirementsDirection} from '@libs/RequireFieldsRulesUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {getRequireFieldsRuleCategoryRoute} from '@src/ROUTES';
import type {RequireFieldsRuleForm, RequireFieldsRuleSettingFieldKey} from '@src/types/form/RequireFieldsRuleForm';
import INPUT_IDS from '@src/types/form/RequireFieldsRuleForm';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type RequireFieldsRulePageBaseProps = {
    policyID: string;
    categoryName?: string;
    testID: string;
};

function RequireFieldsRulePageBase({policyID, categoryName, testID}: RequireFieldsRulePageBaseProps) {
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
    const [touchedFields, setTouchedFields] = useState<Set<RequireFieldsRuleSettingFieldKey>>(() => new Set());
    // Edit-only: fields the user deselected that still have an active category override to remove on save.
    const [clearedFields, setClearedFields] = useState<Set<RequireFieldsRuleSettingFieldKey>>(() => new Set());
    // Fields the user toggled directly — category reassignment marks touchedFields for save/display
    // without meaning the user caused coupling, so tooltips key off this set instead.
    const [couplingInteractionFields, setCouplingInteractionFields] = useState<Set<RequireFieldsRuleSettingFieldKey>>(() => new Set());
    const initializedDraftForRuleKeyRef = useRef<string | null>(null);

    const category = categoryName ? policyCategories?.[categoryName] : undefined;
    const selectedCategoryName = form?.[INPUT_IDS.CATEGORY];
    const selectedCategory = selectedCategoryName ? policyCategories?.[selectedCategoryName] : undefined;
    const effectiveForm = form && selectedCategory ? getEffectiveRequireFieldsRuleForm(selectedCategory, form) : form;
    const categoryDisplayName = selectedCategoryName ? getDecodedCategoryName(selectedCategoryName) : undefined;
    const activeRuleKey = isEditing && categoryName ? getRequireFieldsRuleKey(categoryName) : ROUTES.NEW;
    const [selectionStateForRuleKey, setSelectionStateForRuleKey] = useState(activeRuleKey);
    const [selectionCategoryName, setSelectionCategoryName] = useState(selectedCategoryName);

    if (selectionStateForRuleKey !== activeRuleKey) {
        setSelectionStateForRuleKey(activeRuleKey);
        setTouchedFields(new Set());
        setClearedFields(new Set());
        setCouplingInteractionFields(new Set());
        setSelectionCategoryName(selectedCategoryName);
    } else if (selectionCategoryName !== selectedCategoryName) {
        const previousCategoryName = selectionCategoryName;
        const didChangeSelectedCategory = previousCategoryName !== undefined && selectedCategoryName !== undefined;
        setSelectionCategoryName(selectedCategoryName);

        if (didChangeSelectedCategory) {
            const previousCategory = previousCategoryName ? policyCategories?.[previousCategoryName] : undefined;
            const previousEffectiveForm = form && previousCategory ? getEffectiveRequireFieldsRuleForm(previousCategory, form) : form;
            const preservedSettings: Partial<RequireFieldsRuleForm> = {};
            const nextTouchedFields = new Set<RequireFieldsRuleSettingFieldKey>();

            // Preserve whatever is currently shown (edit often displays category overrides
            // without those fields being in touchedFields yet).
            for (const fieldKey of [INPUT_IDS.DESCRIPTION_SETTING, INPUT_IDS.ATTENDEES_SETTING, INPUT_IDS.RECEIPT_SETTING, INPUT_IDS.ITEMIZED_RECEIPT_SETTING] as const) {
                const displayedSetting = getRequireFieldsDisplayedSetting({
                    fieldKey,
                    category: previousCategory,
                    effectiveForm: previousEffectiveForm,
                    rawForm: form,
                    originalCategoryName: isEditing ? categoryName : undefined,
                    touchedFields,
                    clearedFields,
                    isEditing,
                });

                if (displayedSetting === undefined) {
                    continue;
                }

                preservedSettings[fieldKey] = displayedSetting;
                nextTouchedFields.add(fieldKey);
            }

            setClearedFields(new Set());
            setTouchedFields(nextTouchedFields);
            // Preserved fields are not a user-caused coupling — drop any educational tooltip source.
            setCouplingInteractionFields(new Set());

            // Replace the draft with only preserved settings so unset fields stay unset.
            if (selectedCategoryName) {
                setDraftRequireFieldsRule({
                    [INPUT_IDS.CATEGORY]: selectedCategoryName,
                    ...preservedSettings,
                });
            }
        }
    }

    // Remount after a category change loses local touched state — rebuild it from the draft.
    if (isEditing && categoryName && selectedCategoryName && selectedCategoryName !== categoryName && form) {
        const draftSettingKeys = ([INPUT_IDS.DESCRIPTION_SETTING, INPUT_IDS.ATTENDEES_SETTING, INPUT_IDS.RECEIPT_SETTING, INPUT_IDS.ITEMIZED_RECEIPT_SETTING] as const).filter(
            (fieldKey) => form[fieldKey] !== undefined,
        );
        if (draftSettingKeys.some((fieldKey) => !touchedFields.has(fieldKey))) {
            setTouchedFields(new Set([...touchedFields, ...draftSettingKeys]));
        }
    }

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

        const ruleKey = getRequireFieldsRuleKey(categoryName);

        if (initializedDraftForRuleKeyRef.current === ruleKey) {
            return;
        }

        // User already reassigned the draft to another category — don't overwrite it.
        if (form?.[INPUT_IDS.CATEGORY] && form[INPUT_IDS.CATEGORY] !== categoryName) {
            initializedDraftForRuleKeyRef.current = ruleKey;
            return;
        }

        // Always reseed from the category so a leftover new-rule draft cannot leave a stale Require/Don't require.
        initializedDraftForRuleKeyRef.current = ruleKey;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Seed local selection state when opening an edit rule.
        setTouchedFields(new Set());
        setClearedFields(new Set());
        setCouplingInteractionFields(new Set());
        setDraftRequireFieldsRule({
            [INPUT_IDS.CATEGORY]: categoryName,
            ...getRequireFieldsFormFromCategory(category),
        });
    }, [category, categoryName, form, isEditing]);

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

    const fieldSettings: Array<{
        key: RequireFieldsRuleSettingFieldKey;
        label: string;
        isVisible: boolean;
    }> = [
        {
            key: INPUT_IDS.DESCRIPTION_SETTING,
            label: translate('common.description'),
            isVisible: true,
        },
        {
            key: INPUT_IDS.RECEIPT_SETTING,
            label: translate('common.receipt'),
            isVisible: true,
        },
        {
            key: INPUT_IDS.ITEMIZED_RECEIPT_SETTING,
            label: translate('workspace.rules.requireFieldsRule.itemizedReceipt'),
            isVisible: true,
        },
        {
            key: INPUT_IDS.ATTENDEES_SETTING,
            label: translate('iou.attendees'),
            isVisible: isAttendeeFieldApplicable,
        },
    ];

    // Prefer the selected category, but fall back to the route category so edit validation
    // still sees areCommentsRequired / receipt overrides if the draft category is briefly missing.
    const categoryForRule = selectedCategory ?? category;

    const errorMessage = getRequireFieldsRuleValidationError(form, categoryForRule, translate, isEditing, touchedFields, clearedFields);

    const getFieldDisplaySetting = (fieldKey: RequireFieldsRuleSettingFieldKey): FieldRequirementsDirection | undefined =>
        getRequireFieldsDisplayedSetting({
            fieldKey,
            category: categoryForRule,
            effectiveForm: form && categoryForRule ? getEffectiveRequireFieldsRuleForm(categoryForRule, form) : effectiveForm,
            rawForm: form,
            originalCategoryName: isEditing ? categoryName : undefined,
            touchedFields,
            clearedFields,
            isEditing,
        });

    const handleSelectFieldSetting = (fieldKey: RequireFieldsRuleSettingFieldKey, setting: FieldRequirementsDirection | undefined) => {
        if (setting === undefined) {
            const keysToClear = getRequireFieldsFieldClearKeys(fieldKey, getFieldDisplaySetting(fieldKey));

            setTouchedFields((previousTouchedFields) => {
                const nextTouchedFields = new Set(previousTouchedFields);
                for (const keyToClear of keysToClear) {
                    nextTouchedFields.delete(keyToClear);
                }
                return nextTouchedFields;
            });
            setCouplingInteractionFields((previousCouplingInteractionFields) => {
                const nextCouplingInteractionFields = new Set(previousCouplingInteractionFields);
                for (const keyToClear of keysToClear) {
                    nextCouplingInteractionFields.delete(keyToClear);
                }
                return nextCouplingInteractionFields;
            });

            if (isEditing) {
                setClearedFields((previousClearedFields) => {
                    const nextClearedFields = new Set(previousClearedFields);
                    for (const keyToClear of keysToClear) {
                        // Only track clears against overrides on the category currently selected in the draft.
                        if (getActiveFieldRequirementsDirection(selectedCategory, keyToClear) !== undefined) {
                            nextClearedFields.add(keyToClear);
                        } else {
                            nextClearedFields.delete(keyToClear);
                        }
                    }
                    return nextClearedFields;
                });
            }

            // Drop deselected values from the draft (needed after category reassignment where
            // display reads explicit draft keys instead of touched state alone).
            if (form) {
                const nextDraft: Partial<RequireFieldsRuleForm> = {
                    [INPUT_IDS.CATEGORY]: form[INPUT_IDS.CATEGORY],
                };
                for (const settingFieldKey of [INPUT_IDS.DESCRIPTION_SETTING, INPUT_IDS.ATTENDEES_SETTING, INPUT_IDS.RECEIPT_SETTING, INPUT_IDS.ITEMIZED_RECEIPT_SETTING] as const) {
                    if (keysToClear.includes(settingFieldKey) || form[settingFieldKey] === undefined) {
                        continue;
                    }
                    nextDraft[settingFieldKey] = form[settingFieldKey];
                }
                setDraftRequireFieldsRule(nextDraft);
            }

            setShouldShowError(false);
            return;
        }

        const {formUpdate, touchedFieldKeys} = getRequireFieldsFieldSettingUpdate(fieldKey, setting);

        setClearedFields((previousClearedFields) => {
            const nextClearedFields = new Set(previousClearedFields);
            for (const touchedFieldKey of touchedFieldKeys) {
                nextClearedFields.delete(touchedFieldKey);
            }
            return nextClearedFields;
        });
        setTouchedFields((previousTouchedFields) => {
            const nextTouchedFields = new Set(previousTouchedFields);
            for (const touchedFieldKey of touchedFieldKeys) {
                nextTouchedFields.add(touchedFieldKey);
            }
            return nextTouchedFields;
        });
        setCouplingInteractionFields((previousCouplingInteractionFields) => {
            const nextCouplingInteractionFields = new Set(previousCouplingInteractionFields);
            for (const touchedFieldKey of touchedFieldKeys) {
                nextCouplingInteractionFields.add(touchedFieldKey);
            }
            return nextCouplingInteractionFields;
        });
        updateDraftRequireFieldsRule(formUpdate);
        setShouldShowError(false);
    };

    const handleSave = () => {
        if (!form) {
            return;
        }

        const formToSave = getEffectiveRequireFieldsRuleForm(selectedCategory, form);
        const savedCategory = formToSave[INPUT_IDS.CATEGORY];
        const originalCategoryName = categoryName;
        const didChangeCategory = isEditing && !!originalCategoryName && !!savedCategory && savedCategory !== originalCategoryName;

        if (isEditing && !didChangeCategory && !hasRequireFieldsRuleChanges(selectedCategory ?? category, formToSave, touchedFields, clearedFields)) {
            clearDraftRequireFieldsRule();
            Navigation.goBack();
            return;
        }

        if (didChangeCategory && originalCategoryName) {
            deleteRequireFieldsRule(policyData, getRequireFieldsRuleKey(originalCategoryName));
            // Old category is fully removed; clearedFields belonged to that rule, not the new category.
            saveRequireFieldsRule(policyData, formToSave, touchedFields);
        } else {
            saveRequireFieldsRule(policyData, formToSave, touchedFields, clearedFields);
        }

        clearDraftRequireFieldsRule();

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
            shouldShowLoadingImmediatelyOnPress={false}
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
                        onPress={canWriteRules ? () => Navigation.navigate(getRequireFieldsRuleCategoryRoute(policyID, isEditing ? categoryName : undefined)) : undefined}
                        shouldShowRightIcon={canWriteRules}
                        interactive={canWriteRules}
                        icon={icons.Folder}
                        iconWidth={variables.iconSizeNormal}
                        iconHeight={variables.iconSizeNormal}
                        shouldIconUseAutoWidthStyle
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.REQUIRE_FIELDS_RULE_CATEGORY}
                    />
                    <View style={[styles.sectionDividerLine, styles.mh5, styles.mv3]} />
                    <View style={[styles.ph5, styles.pv3]}>
                        <Text style={[styles.textLabel, styles.textSupporting, styles.lh16]}>{translate('workspace.rules.requireFieldsRule.doTheFollowing')}</Text>
                    </View>
                    {fieldSettings
                        .filter((field) => field.isVisible)
                        .map((field) => (
                            <FieldRequirementSettingRow
                                key={field.key}
                                fieldKey={field.key}
                                label={field.label}
                                setting={getFieldDisplaySetting(field.key)}
                                effectiveForm={effectiveForm}
                                category={selectedCategory}
                                touchedFields={touchedFields}
                                clearedFields={clearedFields}
                                couplingInteractionFields={couplingInteractionFields}
                                isEditing={isEditing}
                                canWriteRules={canWriteRules}
                                onSelectSetting={handleSelectFieldSetting}
                            />
                        ))}
                </ScrollView>
                {footer}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RequireFieldsRulePageBase;
