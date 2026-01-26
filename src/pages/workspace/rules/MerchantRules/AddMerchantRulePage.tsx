import React, {useEffect, useState} from 'react';
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
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {MerchantRuleForm} from '@src/types/form';

type AddMerchantRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_NEW>;

type SectionType = {
    titleTranslationKey: 'workspace.rules.merchantRules.expensesWith' | 'workspace.rules.merchantRules.applyUpdates';
    items: Array<{
        descriptionTranslationKey: 'common.merchant' | 'common.category' | 'common.tag' | 'common.tax' | 'common.description' | 'common.reimbursable' | 'common.billable';
        required?: boolean;
        title?: string;
        onPress: () => void;
    }>;
};

const getErrorMessage = (translate: LocalizedTranslate, form?: MerchantRuleForm) => {
    const hasAtLeastOneUpdate = Object.entries(form ?? {}).some(
        ([key, value]) => key !== CONST.MERCHANT_RULES.FIELDS.MERCHANT_TO_MATCH && !!value,
    );
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
    const policyID = route.params?.policyID ?? '-1';

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true});
    const [shouldShowError, setShouldShowError] = useState(false);

    useEffect(() => () => clearDraftMerchantRule(), []);

    const errorMessage = getErrorMessage(translate, form);

    const handleSubmit = () => {
        if (errorMessage) {
            setShouldShowError(true);
            return;
        }
        if (!form) {
            return;
        }

        // TODO: Call SetPolicyMerchantRule API when available
        // For now, just navigate back
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
                {
                    descriptionTranslationKey: 'common.category',
                    title: form?.category,
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_CATEGORY.getRoute(policyID)),
                },
                {
                    descriptionTranslationKey: 'common.tag',
                    title: form?.tag,
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_TAG.getRoute(policyID)),
                },
                {
                    descriptionTranslationKey: 'common.tax',
                    title: form?.tax,
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_TAX.getRoute(policyID)),
                },
                {
                    descriptionTranslationKey: 'common.description',
                    title: form?.comment,
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_DESCRIPTION.getRoute(policyID)),
                },
                {
                    descriptionTranslationKey: 'common.reimbursable',
                    title: form?.reimbursable ? translate(form.reimbursable === 'true' ? 'common.yes' : 'common.no') : '',
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_REIMBURSABLE.getRoute(policyID)),
                },
                {
                    descriptionTranslationKey: 'common.billable',
                    title: form?.billable ? translate(form.billable === 'true' ? 'common.yes' : 'common.no') : '',
                    onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_BILLABLE.getRoute(policyID)),
                },
            ],
        },
    ];

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
                            <Text style={[styles.textHeadlineH2, styles.reportHorizontalRule, styles.mt4, styles.mb2]}>
                                {translate(section.titleTranslationKey)}
                            </Text>
                            {section.items.map((item) => (
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
