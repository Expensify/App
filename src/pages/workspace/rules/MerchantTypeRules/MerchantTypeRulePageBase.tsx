import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
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
import useThemeStyles from '@hooks/useThemeStyles';
import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import {clearDraftMerchantTypeRule, setDraftMerchantTypeRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {getDefaultMccGroupCategory, getMerchantTypeRuleFormFromMccGroup, isDefaultMccGroupID, saveMerchantTypeRule} from '@libs/MerchantTypeRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getMccGroupDisplayName} from '@libs/PolicyRulesUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {MerchantTypeRuleForm} from '@src/types/form/MerchantTypeRuleForm';
import INPUT_IDS from '@src/types/form/MerchantTypeRuleForm';

type MerchantTypeRulePageBaseProps = {
    policyID: string;
    groupID: string;
    testID: string;
};

function getValidationError(form: MerchantTypeRuleForm | null | undefined, translate: ReturnType<typeof useLocalize>['translate']): string {
    if (!form?.[INPUT_IDS.CATEGORY]) {
        return translate('workspace.rules.merchantTypeRule.confirmErrorCategory');
    }

    return '';
}

function MerchantTypeRulePageBase({policyID, groupID, testID}: MerchantTypeRulePageBaseProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Folder', 'Lock']);
    const policyData = usePolicyData(policyID);
    const {policy} = policyData;
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_TYPE_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [shouldShowError, setShouldShowError] = useState(false);
    const initializedDraftForGroupIDRef = useRef<string | null>(null);

    const mccGroup = policy?.mccGroup;
    const currentCategory = mccGroup?.[groupID]?.category ?? getDefaultMccGroupCategory(groupID);
    const merchantTypeDisplayName = getMccGroupDisplayName(groupID);
    const categoryDisplayName = form?.[INPUT_IDS.CATEGORY] ? getDecodedCategoryName(form[INPUT_IDS.CATEGORY]) : undefined;

    useEffect(() => () => clearDraftMerchantTypeRule(), []);

    useEffect(() => {
        if (!isDefaultMccGroupID(groupID)) {
            return;
        }

        if (initializedDraftForGroupIDRef.current === groupID) {
            return;
        }

        initializedDraftForGroupIDRef.current = groupID;
        setDraftMerchantTypeRule(getMerchantTypeRuleFormFromMccGroup(groupID, currentCategory));
    }, [currentCategory, groupID]);

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

    const errorMessage = getValidationError(form, translate);

    const handleSave = () => {
        if (!form) {
            return;
        }

        if (form[INPUT_IDS.CATEGORY] === currentCategory) {
            Navigation.goBack();
            return;
        }

        saveMerchantTypeRule(policyID, form, mccGroup);
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

    if (!isDefaultMccGroupID(groupID)) {
        return <NotFoundPage />;
    }

    if (!!policy && !canWriteRules) {
        return <NotFoundPage />;
    }

    const footer = canWriteRules ? (
        <FormAlertWithSubmitButton
            buttonText={translate('workspace.rules.merchantTypeRule.saveRule')}
            containerStyles={[styles.m4, styles.mb5, styles.mh5]}
            isAlertVisible={shouldShowError && !!errorMessage}
            message={errorMessage}
            onSubmit={handleSubmit}
            enabledWhenOffline
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_TYPE_RULE_SAVE}
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
                <HeaderWithBackButton title={translate('workspace.rules.merchantRules.expenseDefaultsTitle')} />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <View style={[styles.ph5, styles.pv3, styles.gap6]}>
                        <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.rules.merchantRules.expenseDefaultsSubtitle')}</Text>
                        <Text style={[styles.textLabel, styles.textSupporting, styles.lh16]}>{translate('workspace.rules.merchantRules.ifAnyExpenseMatches')}</Text>
                    </View>
                    <MenuItemWithTopDescription
                        description={translate('workspace.rules.merchantTypeRule.merchantType')}
                        title={merchantTypeDisplayName}
                        shouldShowRightIcon
                        iconRight={icons.Lock}
                        interactive={false}
                    />
                    <View style={[styles.sectionDividerLine, styles.mh5, styles.mv3]} />
                    <Text style={[styles.textLabel, styles.textSupporting, styles.lh16, styles.ph5, styles.pv3]}>
                        {translate('workspace.rules.merchantRules.thenApplyFollowingDefaults')}
                    </Text>
                    <MenuItemWithTopDescription
                        description={translate('common.category')}
                        title={categoryDisplayName}
                        errorText={canWriteRules && shouldShowError && !form?.[INPUT_IDS.CATEGORY] ? translate('common.error.fieldRequired') : ''}
                        onPress={canWriteRules ? () => Navigation.navigate(ROUTES.RULES_MERCHANT_TYPE_CATEGORY.getRoute(policyID, groupID)) : undefined}
                        shouldShowRightIcon={canWriteRules}
                        interactive={canWriteRules}
                        icon={icons.Folder}
                        iconWidth={variables.iconSizeNormal}
                        iconHeight={variables.iconSizeNormal}
                        shouldIconUseAutoWidthStyle
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_TYPE_RULE_CATEGORY}
                    />
                </ScrollView>
                {footer}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default MerchantTypeRulePageBase;
