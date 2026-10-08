import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {addErrorMessage} from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFieldRequiredErrors, isValidInputLength} from '@libs/ValidationUtils';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import {updateBankAccountName} from '@userActions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditBankAccountNicknameForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React from 'react';

type EditBankAccountNicknamePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.EDIT_BANK_ACCOUNT_NICKNAME>;

function EditBankAccountNicknamePage({route}: EditBankAccountNicknamePageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const bankAccount = bankAccountList?.[bankAccountID];

    // Match the name shown on the Wallet row, which falls back to the bank name when the title is a masked account number
    const defaultValue = bankAccount?.title?.includes(CONST.MASKED_PAN_PREFIX) ? bankAccount?.accountData?.additionalData?.bankName : bankAccount?.title;

    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const styles = useThemeStyles();

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_BANK_ACCOUNT_NICKNAME_FORM>) => {
        const newName = values[INPUT_IDS.NICKNAME].trim();
        if (newName !== defaultValue) {
            updateBankAccountName(bankAccountID, newName, bankAccount?.title);
        }
        Navigation.goBack(ROUTES.SETTINGS_WALLET);
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_BANK_ACCOUNT_NICKNAME_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_BANK_ACCOUNT_NICKNAME_FORM> => {
        const errors = getFieldRequiredErrors(values, [INPUT_IDS.NICKNAME], translate);
        if (values.nickname) {
            const {isValid, byteLength} = isValidInputLength(values.nickname, CONST.STANDARD_LENGTH_LIMIT);
            if (!isValid) {
                addErrorMessage(errors, INPUT_IDS.NICKNAME, translate('common.error.characterLimitExceedCounter', byteLength, CONST.STANDARD_LENGTH_LIMIT));
            }
        }
        return errors;
    };

    if (isLoadingOnyxValue(bankAccountListMetadata)) {
        return null;
    }

    // Only open bank accounts can be renamed, matching Expensify Classic
    if (bankAccount?.accountData?.state !== CONST.BANK_ACCOUNT.STATE.OPEN) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID="EditBankAccountNicknamePage"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButtonAndTitle
                title={translate('walletPage.editNickname')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
            />
            <Text style={[styles.mh5, styles.mt3, styles.mb5]}>{translate('walletPage.editNicknameInstruction')}</Text>
            <FormProvider
                formID={ONYXKEYS.FORMS.EDIT_BANK_ACCOUNT_NICKNAME_FORM}
                submitButtonText={translate('common.save')}
                onSubmit={submit}
                style={[styles.flex1, styles.mh5]}
                enabledWhenOffline
                validate={validate}
                shouldHideFixErrorsAlert
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.NICKNAME}
                    label={translate('walletPage.nickname')}
                    aria-label={translate('walletPage.nickname')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={defaultValue}
                    ref={inputCallbackRef}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

EditBankAccountNicknamePage.displayName = 'EditBankAccountNicknamePage';

export default EditBankAccountNicknamePage;
