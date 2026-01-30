import React, {useCallback} from 'react';
import {Keyboard} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setImportTransactionCardName} from '@libs/actions/ImportSpreadsheet';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ImportTransactionsForm';

function ImportTransactionsCardNamePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const [importedSpreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET, {canBeMissing: true});

    const submit = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.IMPORT_TRANSACTIONS_FORM>) => {
        setImportTransactionCardName(values.cardDisplayName.trim());
        Keyboard.dismiss();
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack());
    }, []);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.IMPORT_TRANSACTIONS_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.IMPORT_TRANSACTIONS_FORM> = {};
            const name = values.cardDisplayName.trim();

            if ([...name].length > CONST.TITLE_CHARACTER_LIMIT) {
                addErrorMessage(errors, 'cardDisplayName', translate('common.error.characterLimitExceedCounter', [...name].length, CONST.TITLE_CHARACTER_LIMIT));
            }

            return errors;
        },
        [translate],
    );

    return (
        <ScreenWrapper
            testID="ImportTransactionsCardNamePage"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.importTransactions.cardDisplayName')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.IMPORT_TRANSACTIONS_FORM}
                submitButtonText={translate('common.save')}
                onSubmit={submit}
                style={[styles.flex1, styles.mh5]}
                enabledWhenOffline
                validate={validate}
                shouldHideFixErrorsAlert
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.CARD_DISPLAY_NAME}
                    label={translate('workspace.companyCards.importTransactions.cardDisplayName')}
                    aria-label={translate('workspace.companyCards.importTransactions.cardDisplayName')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={importedSpreadsheet?.importTransactionSettings?.cardDisplayName}
                    ref={inputCallbackRef}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

export default ImportTransactionsCardNamePage;
