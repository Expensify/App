import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount, ReimbursementAccountDraft} from '@src/types/onyx';
import type {FormValues} from '@src/types/onyx/Form';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type IncorporationDateBusinessOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountDraft>;
};

type IncorporationDateBusinessProps = IncorporationDateBusinessOnyxProps & SubStepProps;

const companyIncorporationDateKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.INCORPORATION_DATE;

const validate = (values: FormValues): OnyxCommon.Errors => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, [companyIncorporationDateKey]);

    if (values.incorporationDate && !ValidationUtils.isValidDate(values.incorporationDate)) {
        errors.incorporationDate = 'common.error.dateInvalid';
    } else if (values.incorporationDate && !ValidationUtils.isValidPastDate(values.incorporationDate)) {
        errors.incorporationDate = 'bankAccount.error.incorporationDateFuture';
    }

    return errors;
};

function IncorporationDateBusiness({reimbursementAccount, reimbursementAccountDraft, onNext, isEditing}: IncorporationDateBusinessProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultCompanyIncorporationDate = reimbursementAccount?.achData?.incorporationDate ?? reimbursementAccountDraft?.incorporationDate ?? '';

    return (
        // @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <Text style={[styles.textHeadline, styles.mb3]}>{translate('businessInfoStep.selectYourCompanysIncorporationDate')}</Text>
            <InputWrapper
                // @ts-expect-error TODO: Remove this once DatePicker (https://github.com/Expensify/App/issues/25140) is migrated to TypeScript
                InputComponent={DatePicker}
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                inputID={companyIncorporationDateKey}
                label={translate('businessInfoStep.incorporationDate')}
                containerStyles={[styles.mt4]}
                placeholder={translate('businessInfoStep.incorporationDatePlaceholder')}
                defaultValue={defaultCompanyIncorporationDate}
                shouldSaveDraft
                maxDate={new Date()}
            />
        </FormProvider>
    );
}

IncorporationDateBusiness.displayName = 'IncorporationDateBusiness';

export default withOnyx<IncorporationDateBusinessProps, IncorporationDateBusinessOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(IncorporationDateBusiness);
