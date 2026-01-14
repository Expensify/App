import React from 'react';
import {View} from 'react-native';
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
import {updateBulkEditDraftTransaction} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import {isValidInputLength} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SearchEditMultipleMerchantForm';

function SearchEditMultipleMerchantPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {canBeMissing: true});

    const currentMerchant = draftTransaction?.merchant ?? '';

    const validate = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_MERCHANT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_MERCHANT_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_MERCHANT_FORM> = {};
        const {isValid, byteLength} = isValidInputLength(value.merchant ?? '', CONST.MERCHANT_NAME_MAX_BYTES);

        if (!isValid) {
            errors.merchant = translate('common.error.characterLimitExceedCounter', byteLength, CONST.MERCHANT_NAME_MAX_BYTES);
        }

        return errors;
    };

    const saveMerchant = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_MERCHANT_FORM>) => {
        const newMerchant = value.merchant?.trim() ?? '';
        updateBulkEditDraftTransaction({
            merchant: newMerchant,
        });
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={SearchEditMultipleMerchantPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.merchant')}
                onBackButtonPress={Navigation.goBack}
            />
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_MERCHANT_FORM}
                onSubmit={saveMerchant}
                validate={validate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.MERCHANT}
                        name={INPUT_IDS.MERCHANT}
                        defaultValue={currentMerchant}
                        label={translate('common.merchant')}
                        accessibilityLabel={translate('common.merchant')}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
                        shouldSubmitForm
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

SearchEditMultipleMerchantPage.displayName = 'SearchEditMultipleMerchantPage';

export default SearchEditMultipleMerchantPage;
