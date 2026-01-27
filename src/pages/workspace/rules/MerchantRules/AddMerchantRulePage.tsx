import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
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
import {setPolicyMerchantRule} from '@libs/actions/Policy/Rules';
import {clearDraftMerchantRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getCleanedTagName} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {MerchantRuleForm} from '@src/types/form';

type AddMerchantRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_NEW>;

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

const getBooleanTitle = (value: string | undefined, translate: LocalizedTranslate): string => {
    if (!value) {
        return '';
    }
    return translate(value === 'true' ? 'common.yes' : 'common.no');
};

const getErrorMessage = (translate: LocalizedTranslate, form?: MerchantRuleForm) => {
    const merchantToMatchField = CONST.MERCHANT_RULES.FIELDS.MERCHANT_TO_MATCH;
    const hasAtLeastOneUpdate = Object.entries(form ?? {}).some(([key, value]) => key !== merchantToMatchField && !!value);
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

function AddMerchantRulePage({route}: AddMerchantRulePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true});
    const [shouldShowError, setShouldShowError] = useState(false);

    useEffect(() => () => clearDraftMerchantRule(), []);

    const areCategoriesEnabled = !!policy?.areCategoriesEnabled;
    const areTagsEnabled = !!policy?.areTagsEnabled;
    const isTaxTrackingEnabled = !!policy?.tax?.trackingEnabled;
    const isBillableEnabled = policy?.disabledFields?.defaultBillable !== true;

    // Get display names for category, tag, and tax
    const categoryDisplayName = form?.category ? getDecodedCategoryName(form.category) : undefined;
    const tagDisplayName = form?.tag ? getCleanedTagName(form.tag) : undefined;
    const taxDisplayName = useMemo(() => {
        if (!form?.tax || !policy?.taxRates?.taxes) {
            return undefined;
        }
        const tax = policy.taxRates.taxes[form.tax];
        return tax ? `${tax.name} (${tax.value})` : undefined;
    }, [form?.tax, policy?.taxRates?.taxes]);

    const errorMessage = getErrorMessage(translate, form);

    const handleSubmit = () => {
        if (errorMessage) {
            setShouldShowError(true);
            return;
        }
        if (!form) {
            return;
        }

        setPolicyMerchantRule(policyID, form);
        Navigation.goBack();
    };

    const sections: SectionType[] = useMemo(
        () => [
            {
                titleTranslationKey: 'workspace.rules.merchantRules.expensesWith',
                items: [
                    {
                        descriptionTranslationKey: 'common.merchant',
                        required: true,
                        title: form?.merchantToMatch,
                        onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_MERCHANT_TO_MATCH.getRoute(policyID)),
                    },
                ],
            },
            {
                titleTranslationKey: 'workspace.rules.merchantRules.applyUpdates',
                items: [
                    {
                        descriptionTranslationKey: 'common.merchant',
                        title: form?.merchant,
                        onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_MERCHANT.getRoute(policyID)),
                    },
                    areCategoriesEnabled
                        ? {
                              descriptionTranslationKey: 'common.category',
                              title: categoryDisplayName,
                              onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_CATEGORY.getRoute(policyID)),
                          }
                        : undefined,
                    areTagsEnabled
                        ? {
                              descriptionTranslationKey: 'common.tag',
                              title: tagDisplayName,
                              onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_TAG.getRoute(policyID)),
                          }
                        : undefined,
                    isTaxTrackingEnabled
                        ? {
                              descriptionTranslationKey: 'common.tax',
                              title: taxDisplayName,
                              onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_TAX.getRoute(policyID)),
                          }
                        : undefined,
                    {
                        descriptionTranslationKey: 'common.description',
                        title: form?.comment,
                        onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_DESCRIPTION.getRoute(policyID)),
                    },
                    {
                        descriptionTranslationKey: 'common.reimbursable',
                        title: getBooleanTitle(form?.reimbursable, translate),
                        onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_REIMBURSABLE.getRoute(policyID)),
                    },
                    isBillableEnabled
                        ? {
                              descriptionTranslationKey: 'common.billable',
                              title: getBooleanTitle(form?.billable, translate),
                              onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_BILLABLE.getRoute(policyID)),
                          }
                        : undefined,
                ],
            },
        ],
        [
            areCategoriesEnabled,
            areTagsEnabled,
            isTaxTrackingEnabled,
            isBillableEnabled,
            form?.merchantToMatch,
            form?.merchant,
            categoryDisplayName,
            tagDisplayName,
            taxDisplayName,
            form?.comment,
            form?.reimbursable,
            form?.billable,
            policyID,
            translate,
        ],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                testID="AddMerchantRulePage"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton title={translate('workspace.rules.merchantRules.addRuleTitle')} />
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
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

AddMerchantRulePage.displayName = 'AddMerchantRulePage';

export default AddMerchantRulePage;
