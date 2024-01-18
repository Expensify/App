import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import AddressForm from '@pages/ReimbursementAccount/AddressForm';
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {FormValues} from '@src/types/onyx/Form';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type AddressOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type AddressProps = AddressOnyxProps & SubStepProps;

const personalInfoStepKey = CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY;

const INPUT_KEYS = {
    street: personalInfoStepKey.STREET,
    city: personalInfoStepKey.CITY,
    state: personalInfoStepKey.STATE,
    zipCode: personalInfoStepKey.ZIP_CODE,
};

const REQUIRED_FIELDS = [personalInfoStepKey.STREET, personalInfoStepKey.CITY, personalInfoStepKey.STATE, personalInfoStepKey.ZIP_CODE];

const validate = (values: FormValues): OnyxCommon.Errors => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

    if (values.requestorAddressStreet && !ValidationUtils.isValidAddress(values.requestorAddressStreet)) {
        errors.requestorAddressStreet = 'bankAccount.error.addressStreet';
    }

    if (values.requestorAddressZipCode && !ValidationUtils.isValidZipCode(values.requestorAddressZipCode)) {
        errors.requestorAddressZipCode = 'bankAccount.error.zipCode';
    }

    return errors;
};

function Address({reimbursementAccount, onNext, isEditing}: AddressProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultValues = {
        street: reimbursementAccount?.achData?.[personalInfoStepKey.STREET] ?? '',
        city: reimbursementAccount?.achData?.[personalInfoStepKey.CITY] ?? '',
        state: reimbursementAccount?.achData?.[personalInfoStepKey.STATE] ?? '',
        zipCode: reimbursementAccount?.achData?.[personalInfoStepKey.ZIP_CODE] ?? '',
    };

    const handleSubmit = (values: BankAccounts.PersonalAddress) => {
        BankAccounts.addPersonalAddressForDraft(values);
        onNext();
    };

    return (
        // @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            submitButtonStyles={[styles.mb0, styles.pb5]}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <View>
                <Text style={[styles.textHeadline]}>{translate('personalInfoStep.enterYourAddress')}</Text>
                <Text>{translate('common.noPO')}</Text>
                <AddressForm
                    inputKeys={INPUT_KEYS}
                    shouldSaveDraft
                    translate={translate}
                    streetTranslationKey="common.streetAddress"
                    defaultValues={defaultValues}
                />
                <HelpLinks containerStyles={[styles.mt5]} />
            </View>
        </FormProvider>
    );
}

Address.displayName = 'Address';

export default withOnyx<AddressProps, AddressOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(Address);
