import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isValidInputLength} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import MERCHANT_RULE_INPUT_IDS from '@src/types/form/MerchantRuleForm';

import React from 'react';
import {View} from 'react-native';

import useMerchantRuleRoute from './useMerchantRuleRoute';

type AddMerchantToMatchPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_MERCHANT_TO_MATCH
>;

/**
 * The byte length of a merchant to match that is too long to store, or undefined when it is storable.
 *
 * A rule no longer has to match on a merchant, so an empty value clears that condition rather than being an
 * error. The editor still refuses to save a rule once nothing is left to match on.
 */
function getMerchantToMatchLengthError(value: string): number | undefined {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return undefined;
    }

    const {isValid, byteLength} = isValidInputLength(trimmedValue, CONST.MERCHANT_NAME_MAX_BYTES);

    return isValid ? undefined : byteLength;
}

function AddMerchantToMatchPage({route}: AddMerchantToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {isEditing, backToRoute, getRuleRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_MERCHANT_TO_MATCH_FROM_EXPENSE.path, policyID, ruleID);
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);
    const {inputCallbackRef} = useAutoFocusInput();

    const currentValue = form?.merchantToMatch ?? '';
    const matchType = form?.matchType ?? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS;

    const getMatchTypeLabel = () => {
        if (matchType === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO) {
            return translate('workspace.rules.merchantRules.matchTypeExact');
        }
        return translate('workspace.rules.merchantRules.matchTypeContains');
    };

    const goBack = () => {
        Navigation.goBack(backToRoute);
    };

    const onSave = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM>) => {
        updateDraftMerchantRule(values);
        goBack();
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM> = {};
        const fieldID = MERCHANT_RULE_INPUT_IDS.MERCHANT_TO_MATCH;
        const fieldValue = values[fieldID] ?? '';

        if (typeof fieldValue !== 'string') {
            return errors;
        }

        const byteLength = getMerchantToMatchLengthError(fieldValue);

        if (byteLength !== undefined) {
            errors[fieldID] = translate('common.error.characterLimitExceedCounter', byteLength, CONST.MERCHANT_NAME_MAX_BYTES);
        }

        return errors;
    };

    return (
        <ScreenWrapper
            testID="AddMerchantToMatchPage"
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButtonAndTitle
                title={translate('common.merchant')}
                onBackButtonPress={goBack}
            />
            <FormProvider
                style={[styles.flex1]}
                formID={ONYXKEYS.FORMS.MERCHANT_RULE_FORM}
                validate={validate}
                onSubmit={onSave}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
                submitButtonStyles={[styles.ph5]}
                shouldUseStrictHtmlTagValidation
            >
                <View style={styles.mb5}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={MERCHANT_RULE_INPUT_IDS.MERCHANT_TO_MATCH}
                        name={MERCHANT_RULE_INPUT_IDS.MERCHANT_TO_MATCH}
                        defaultValue={currentValue}
                        label={translate('common.merchant')}
                        accessibilityLabel={translate('common.merchant')}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
                        containerStyles={[styles.ph5]}
                    />
                </View>
                <MenuItemField
                    name={translate('workspace.rules.merchantRules.matchType')}
                    onPress={() =>
                        Navigation.navigate(
                            getRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_MATCH_TYPE_FROM_EXPENSE.path, ROUTES.RULES_MERCHANT_MATCH_TYPE.getRoute(policyID, isEditing ? ruleID : undefined)),
                        )
                    }
                    value={getMatchTypeLabel()}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

AddMerchantToMatchPage.displayName = 'AddMerchantToMatchPage';

export default AddMerchantToMatchPage;
export {getMerchantToMatchLengthError};
