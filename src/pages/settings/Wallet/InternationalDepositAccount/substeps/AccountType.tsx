import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import ValuePicker from '@components/ValuePicker';
import useInternationalBankAccountFormSubmit from '@hooks/useInternationalBankAccountFormSubmit';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomSubStepProps} from '@pages/settings/Wallet/InternationalDepositAccount/types';
import Text from '@src/components/Text';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function AccountType({isEditing, onNext, fieldsMap}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const fieldData = fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE]?.[CONST.CORPAY_FIELDS.ACCOUNT_TYPE_KEY] ?? {};

    const handleSubmit = useInternationalBankAccountFormSubmit({
        fieldIds: Object.keys(fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE]),
        onNext,
        shouldSaveDraft: isEditing,
    });

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM> => {
            if (!fieldData.isRequired || values[CONST.CORPAY_FIELDS.ACCOUNT_TYPE_KEY]) {
                return {};
            }
            return {[CONST.CORPAY_FIELDS.ACCOUNT_TYPE_KEY]: translate('common.error.pleaseSelectOne')};
        },
        [fieldData.isRequired, translate],
    );

    const options = useMemo(
        () =>
            (fieldData.valueSet ?? []).map((item) => {
                return {
                    value: item.id,
                    label: item.text,
                };
            }),
        [fieldData.valueSet],
    );

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1, styles.mt3]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
            enabledWhenOffline
        >
            <View style={styles.ph5}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('addPersonalBankAccount.accountTypeStepHeader')}</Text>
            </View>
            <InputWrapper
                InputComponent={ValuePicker}
                inputID={fieldData.id}
                label={fieldData.label}
                items={options}
                shouldSaveDraft={!isEditing}
                shouldShowModal={false}
            />
        </FormProvider>
    );
}

AccountType.displayName = 'AccountType';

export default AccountType;
