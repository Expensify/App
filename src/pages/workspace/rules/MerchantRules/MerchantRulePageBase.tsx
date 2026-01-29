import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {deletePolicyCodingRule, setPolicyCodingRule} from '@libs/actions/Policy/Rules';
import {clearDraftMerchantRule, setDraftMerchantRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getCleanedTagName, getTagNamesFromTagsLists} from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {MerchantRuleForm} from '@src/types/form';

type MerchantRulePageBaseProps = {
    policyID: string;
    ruleID?: string;
    titleKey: TranslationPaths;
    testID: string;
};

type SectionItemType = {
    descriptionTranslationKey: 'common.merchant' | 'common.category' | 'common.tag' | 'common.tax' | 'common.description' | 'common.reimbursable' | 'common.billable';
    required?: boolean;
    title?: string;
    onPress: () => void;
};

type SectionType = {
    titleTranslationKey: 'workspace.rules.merchantRules.expensesWith' | 'workspace.rules.merchantRules.applyUpdates';
    items: Array<SectionItemType | undefined>;
};

const getBooleanTitle = (value: boolean | undefined, translate: LocalizedTranslate): string => {
    if (value === undefined) {
        return '';
    }
    return translate(value ? 'common.yes' : 'common.no');
};

const getErrorMessage = (translate: LocalizedTranslate, form?: MerchantRuleForm) => {
    const matchingCriteriaFields = new Set<string>([CONST.MERCHANT_RULES.FIELDS.MERCHANT_TO_MATCH, CONST.MERCHANT_RULES.FIELDS.MATCH_TYPE]);
    const hasAtLeastOneUpdate = Object.entries(form ?? {}).some(([key, value]) => {
        if (matchingCriteriaFields.has(key)) {
            return false;
        }
        if (typeof value === 'boolean') {
            return true;
        }
        return value !== undefined && value !== '';
    });
    if (form?.merchantToMatch && hasAtLeastOneUpdate) {
        return '';
    }
    if (hasAtLeastOneUpdate) {
        return translate('workspace.rules.merchantRules.confirmErrorMerchant');
    }
    if (form?.merchantToMatch) {
        return translate('workspace.rules.merchantRules.confirmErrorUpdate');
    }
    return translate('workspace.rules.merchantRules.confirmError');
};

function MerchantRulePageBase({policyID, ruleID, titleKey, testID}: MerchantRulePageBaseProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const [isDeleting, setIsDeleting] = useState(false);
    const isEditing = !!ruleID;

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const [shouldShowError, setShouldShowError] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    // Get the existing rule from the policy (for edit mode)
    const existingRule = ruleID ? policy?.rules?.codingRules?.[ruleID] : undefined;

    // Initialize the form with existing rule data (for edit mode)
    useEffect(() => {
        if (!isEditing || !existingRule) {
            return;
        }
        // Convert the operator to matchType for the form
        // 'matches' = exact match, 'eq' = contains match
        const matchType = existingRule.filters?.operator === CONST.POLICY.RULE_CONDITIONS.MATCHES ? CONST.MERCHANT_RULES.MATCH_TYPE.EXACT : CONST.MERCHANT_RULES.MATCH_TYPE.CONTAINS;
        setDraftMerchantRule({
            merchantToMatch: existingRule.filters?.right,
            matchType,
            merchant: existingRule.merchant,
            category: existingRule.category,
            tag: existingRule.tag,
            tax: existingRule.tax?.field_id_TAX?.externalID,
            comment: existingRule.comment,
            reimbursable: existingRule.reimbursable,
            billable: existingRule.billable,
        });
    }, [isEditing, existingRule]);

    // Clear the form on unmount
    useEffect(() => () => clearDraftMerchantRule(), []);

    const hasCategories = () => {
        if (!policy?.areCategoriesEnabled) {
            return false;
        }
        return Object.keys(policyCategories ?? {}).length > 0;
    };

    const hasTags = () => {
        if (!policy?.areTagsEnabled) {
            return false;
        }
        const tagNames = getTagNamesFromTagsLists(policyTags ?? {});
        return tagNames.length > 0;
    };

    const hasTaxes = () => {
        if (!policy?.tax?.trackingEnabled) {
            return false;
        }
        return Object.keys(policy?.taxRates?.taxes ?? {}).length > 0;
    };

    const isBillableEnabled = policy?.disabledFields?.defaultBillable !== true;

    const categoryDisplayName = form?.category ? getDecodedCategoryName(form.category) : undefined;
    const tagDisplayName = form?.tag ? getCleanedTagName(form.tag) : undefined;
    const taxDisplayName = () => {
        if (!form?.tax || !policy?.taxRates?.taxes) {
            return undefined;
        }
        const tax = policy.taxRates.taxes[form.tax];
        return tax ? `${tax.name} (${tax.value})` : undefined;
    };

    const errorMessage = getErrorMessage(translate, form);

    const handleSubmit = () => {
        if (errorMessage) {
            setShouldShowError(true);
            return;
        }
        if (!form) {
            return;
        }

        setPolicyCodingRule(policyID, form, policy, ruleID, false);
        Navigation.goBack();
    };

    const handleDelete = () => {
        if (!ruleID || !policy) {
            return;
        }
        setIsDeleting(true);
        deletePolicyCodingRule(policy, ruleID);

        setIsDeleteModalVisible(false);
        Navigation.goBack();
    };

    const sections: SectionType[] = [
        {
            titleTranslationKey: 'workspace.rules.merchantRules.expensesWith',
            items: [
                {
                    descriptionTranslationKey: 'common.merchant',
                    required: true,
                    title: form?.merchantToMatch,
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_MERCHANT_TO_MATCH.getRoute(policyID, ruleID)),
                },
            ],
        },
        {
            titleTranslationKey: 'workspace.rules.merchantRules.applyUpdates',
            items: [
                {
                    descriptionTranslationKey: 'common.merchant',
                    title: form?.merchant,
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_MERCHANT.getRoute(policyID, ruleID)),
                },
                hasCategories()
                    ? {
                          descriptionTranslationKey: 'common.category',
                          title: categoryDisplayName,
                          onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_CATEGORY.getRoute(policyID, ruleID)),
                      }
                    : undefined,
                hasTags()
                    ? {
                          descriptionTranslationKey: 'common.tag',
                          title: tagDisplayName,
                          onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_TAG.getRoute(policyID, ruleID)),
                      }
                    : undefined,
                hasTaxes()
                    ? {
                          descriptionTranslationKey: 'common.tax',
                          title: taxDisplayName(),
                          onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_TAX.getRoute(policyID, ruleID)),
                      }
                    : undefined,
                {
                    descriptionTranslationKey: 'common.description',
                    title: form?.comment,
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_DESCRIPTION.getRoute(policyID, ruleID)),
                },
                {
                    descriptionTranslationKey: 'common.reimbursable',
                    title: getBooleanTitle(form?.reimbursable, translate),
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_REIMBURSABLE.getRoute(policyID, ruleID)),
                },
                isBillableEnabled
                    ? {
                          descriptionTranslationKey: 'common.billable',
                          title: getBooleanTitle(form?.billable, translate),
                          onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_BILLABLE.getRoute(policyID, ruleID)),
                      }
                    : undefined,
            ],
        },
    ];

    if (ruleID && !existingRule && !isDeleting) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                testID={testID}
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton title={translate(titleKey)} />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    {sections.map((section) => (
                        <View key={section.titleTranslationKey}>
                            <Text style={[styles.textHeadlineH2, styles.reportHorizontalRule, styles.mt4, styles.mb2]}>{translate(section.titleTranslationKey)}</Text>
                            {section.items
                                .filter((item): item is SectionItemType => !!item)
                                .map((item) => (
                                    <MenuItemWithTopDescription
                                        key={item.descriptionTranslationKey}
                                        description={translate(item.descriptionTranslationKey)}
                                        errorText={shouldShowError && item.required && !item.title ? translate('common.error.fieldRequired') : ''}
                                        onPress={item.onPress}
                                        rightLabel={item.required ? translate('common.required') : undefined}
                                        shouldShowRightIcon
                                        title={item.title}
                                        titleStyle={styles.flex1}
                                    />
                                ))}
                        </View>
                    ))}
                </ScrollView>
                <FormAlertWithSubmitButton
                    buttonText={translate('workspace.rules.merchantRules.saveRule')}
                    containerStyles={[styles.m4, styles.mb5]}
                    isAlertVisible={shouldShowError && !!errorMessage}
                    message={errorMessage}
                    onSubmit={handleSubmit}
                    enabledWhenOffline
                    shouldRenderFooterAboveSubmit
                    footerContent={
                        isEditing ? (
                            <Button
                                text={translate('workspace.rules.merchantRules.deleteRule')}
                                onPress={() => setIsDeleteModalVisible(true)}
                                style={[styles.mb4]}
                                large
                            />
                        ) : null
                    }
                />
                {isEditing && (
                    <ConfirmModal
                        title={translate('workspace.rules.merchantRules.deleteRule')}
                        isVisible={isDeleteModalVisible}
                        onConfirm={handleDelete}
                        onCancel={() => setIsDeleteModalVisible(false)}
                        prompt={translate('workspace.rules.merchantRules.deleteRuleConfirmation')}
                        confirmText={translate('common.delete')}
                        cancelText={translate('common.cancel')}
                        danger
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

MerchantRulePageBase.displayName = 'MerchantRulePageBase';

export default MerchantRulePageBase;
