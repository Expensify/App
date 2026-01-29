import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
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
import {isRequiredFulfilled, isValidInputLength} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddMerchantToMatchPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT_TO_MATCH>;

function AddMerchantToMatchPage({route}: AddMerchantToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isEditing = ruleID !== ROUTES.NEW;

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true});
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
        const backRoute = isEditing ? ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);
        Navigation.goBack(backRoute);
    };

    const onSave = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM>) => {
        updateDraftMerchantRule(values);
        goBack();
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM> = {};
        const fieldID = CONST.MERCHANT_RULES.FIELDS.MERCHANT_TO_MATCH;
        const fieldValue = values[fieldID] ?? '';

        if (typeof fieldValue !== 'string') {
            return errors;
        }

        const trimmedValue = fieldValue.trim();

        if (!isRequiredFulfilled(fieldValue)) {
            errors[fieldID] = translate('common.error.fieldRequired');
        } else {
            const {isValid, byteLength} = isValidInputLength(trimmedValue, CONST.MERCHANT_NAME_MAX_BYTES);

            if (!isValid) {
                errors[fieldID] = translate('common.error.characterLimitExceedCounter', byteLength, CONST.MERCHANT_NAME_MAX_BYTES);
            }
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
            <HeaderWithBackButton
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
            >
                <View style={styles.mb5}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={CONST.MERCHANT_RULES.FIELDS.MERCHANT_TO_MATCH}
                        name={CONST.MERCHANT_RULES.FIELDS.MERCHANT_TO_MATCH}
                        defaultValue={currentValue}
                        label={translate('common.merchant')}
                        accessibilityLabel={translate('common.merchant')}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
                        containerStyles={[styles.ph5]}
                    />
                </View>
                <MenuItemWithTopDescription
                    description={translate('workspace.rules.merchantRules.matchType')}
                    title={getMatchTypeLabel()}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.RULES_MERCHANT_MATCH_TYPE.getRoute(policyID, isEditing ? ruleID : undefined))}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

AddMerchantToMatchPage.displayName = 'AddMerchantToMatchPage';

export default AddMerchantToMatchPage;
