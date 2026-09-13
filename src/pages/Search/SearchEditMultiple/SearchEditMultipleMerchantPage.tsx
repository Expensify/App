import AutoGrowHeightInputContainer from '@components/AutoGrowHeightInputContainer';
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

import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';
import Navigation from '@libs/Navigation/Navigation';
import StringUtils from '@libs/StringUtils';
import {isInvalidMerchantValue, isValidInputLength} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SearchEditMultipleMerchantForm';

import React from 'react';

function SearchEditMultipleMerchantPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput(true);
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`);

    const currentMerchant = draftTransaction?.merchant ?? '';

    const validate = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_MERCHANT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_MERCHANT_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_MERCHANT_FORM> = {};
        const {isValid, byteLength} = isValidInputLength(value.merchant ?? '', CONST.MERCHANT_NAME_MAX_BYTES);

        const trimmedMerchant = (value.merchant ?? '').trim();
        if (trimmedMerchant && isInvalidMerchantValue(trimmedMerchant)) {
            errors.merchant = translate('iou.error.invalidMerchant');
        } else if (!isValid) {
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
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="SearchEditMultipleMerchantPage"
        >
            <HeaderWithBackButton
                title={translate('common.merchant')}
                onBackButtonPress={Navigation.goBack}
            />
            <FormProvider
                submitFlexEnabled={false}
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_MERCHANT_FORM}
                onSubmit={(values) => saveMerchant({...values, [INPUT_IDS.MERCHANT]: StringUtils.lineBreaksToSpaces(values[INPUT_IDS.MERCHANT])})}
                validate={(values) => validate({...values, [INPUT_IDS.MERCHANT]: StringUtils.lineBreaksToSpaces(values[INPUT_IDS.MERCHANT])})}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <AutoGrowHeightInputContainer style={styles.mb4}>
                    {(maxAutoGrowHeight) => (
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.MERCHANT}
                            name={INPUT_IDS.MERCHANT}
                            defaultValue={currentMerchant}
                            label={translate('common.merchant')}
                            accessibilityLabel={translate('common.merchant')}
                            role={CONST.ROLE.PRESENTATION}
                            ref={inputCallbackRef}
                            maxAutoGrowHeight={maxAutoGrowHeight}
                            autoGrowSingleLine
                        />
                    )}
                </AutoGrowHeightInputContainer>
            </FormProvider>
        </ScreenWrapper>
    );
}

export default SearchEditMultipleMerchantPage;
