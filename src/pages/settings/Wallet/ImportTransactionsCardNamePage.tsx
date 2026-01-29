import React, {useCallback} from 'react';
import {Keyboard, View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
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
            shouldEnableMaxHeight
            shouldEnablePickerAvoiding={false}
            testID="ImportTransactionsCardNamePage"
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.importTransactions.cardDisplayName')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.IMPORT_TRANSACTIONS_FORM}
                submitButtonText={translate('common.save')}
                style={[styles.flexGrow1, styles.ph5]}
                validate={validate}
                onSubmit={submit}
                enabledWhenOffline
                shouldHideFixErrorsAlert
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        role={CONST.ROLE.PRESENTATION}
                        inputID={INPUT_IDS.CARD_DISPLAY_NAME}
                        label={translate('workspace.companyCards.importTransactions.cardDisplayName')}
                        accessibilityLabel={translate('workspace.companyCards.importTransactions.cardDisplayName')}
                        defaultValue={importedSpreadsheet?.importTransactionSettings?.cardDisplayName}
                        autoFocus
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

ImportTransactionsCardNamePage.displayName = 'ImportTransactionsCardNamePage';

export default ImportTransactionsCardNamePage;
