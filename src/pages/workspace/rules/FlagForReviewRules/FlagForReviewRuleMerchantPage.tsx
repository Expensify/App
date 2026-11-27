/** Edits the merchant condition in a flag rule draft without saving the rule. */
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import Picker from '@components/Picker';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useRulesPrefetch from '@hooks/useRulesPrefetch';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftFlagForReviewRule} from '@libs/actions/User';
import {getFlagForReviewConditions, getFlagForReviewDraftKey, isFlagMerchantMatchType} from '@libs/FlagForReviewRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isValidInputLength} from '@libs/ValidationUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {MATCH_TYPE_OPTIONS} from '@pages/workspace/rules/MerchantRules/matchTypeOptions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/FlagForReviewRuleForm';

import React, {useState} from 'react';

type FlagForReviewRuleMerchantPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_MERCHANT>;

function FlagForReviewRuleMerchantPage({route}: FlagForReviewRuleMerchantPageProps) {
    const {policyID, ruleID} = route.params;
    const isEditing = ruleID !== ROUTES.NEW;
    const policy = usePolicy(policyID);
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const [storedDraft] = useOnyx(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM);
    const draftKey = getFlagForReviewDraftKey(policyID, ruleID);
    const draft = storedDraft?.draftKey === draftKey ? storedDraft : undefined;
    const [rule] = useOnyx(`${ONYXKEYS.COLLECTION.RULE}${ruleID}`);
    const {areRulesLoading} = useRulesPrefetch(isEditing);
    const conditions = rule?.scope === CONST.RULES.SCOPE.POLICY && rule.scopeID === policyID ? getFlagForReviewConditions(rule) : undefined;
    const isDailyLimit = (draft?.expenseLimitType ?? conditions?.limit?.expenseLimitType) === CONST.POLICY.EXPENSE_LIMIT_TYPES.DAILY;
    const [matchType, setMatchType] = useState<string>();
    const selectedMatchType = matchType ?? draft?.matchType ?? conditions?.merchant?.matchType ?? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS;
    const matchTypes = MATCH_TYPE_OPTIONS.matchType.map(({value, translationKey}) => ({value, label: translate(translationKey)}));
    const backToRoute = isEditing ? ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID);

    const saveMerchant = ({merchantToMatch}: FormOnyxValues<typeof ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM>) => {
        if (!canWriteRules || !isFlagMerchantMatchType(selectedMatchType)) {
            return;
        }
        setDraftFlagForReviewRule({...draft, merchantToMatch: merchantToMatch?.trim() ?? '', matchType: selectedMatchType, draftKey});
        Navigation.goBack(backToRoute, {shouldSkipFocusRestore: true});
    };

    if (isEditing && areRulesLoading && !conditions) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            shouldBeBlocked={!canWriteRules || isDailyLimit || (isEditing && (!conditions || (!!rule?.pendingAction && !rule.errors)))}
        >
            <ScreenWrapper
                testID="FlagForReviewRuleMerchantPage"
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('common.merchant')}
                    onBackButtonPress={() => Navigation.goBack(backToRoute)}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM}
                    style={styles.flex1}
                    submitButtonText={translate('common.save')}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_MERCHANT_SAVE}
                    enabledWhenOffline
                    addBottomSafeAreaPadding
                    shouldUseStrictHtmlTagValidation
                    onSubmit={saveMerchant}
                    validate={({merchantToMatch}) => {
                        const {isValid, byteLength} = isValidInputLength(merchantToMatch?.trim() ?? '', CONST.MERCHANT_NAME_MAX_BYTES);
                        return isValid ? {} : {merchantToMatch: translate('common.error.characterLimitExceedCounter', byteLength, CONST.MERCHANT_NAME_MAX_BYTES)};
                    }}
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.MERCHANT}
                        label={translate('common.merchant')}
                        accessibilityLabel={translate('common.merchant')}
                        defaultValue={draft?.merchantToMatch ?? conditions?.merchant?.name ?? ''}
                        containerStyles={[styles.ph5, styles.mb5]}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_FOR_REVIEW_MERCHANT_INPUT}
                        ref={inputCallbackRef}
                    />
                    <Picker
                        label={translate('workspace.rules.merchantRules.matchType')}
                        containerStyles={styles.mh5}
                        value={selectedMatchType}
                        items={matchTypes}
                        onInputChange={setMatchType}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default FlagForReviewRuleMerchantPage;
