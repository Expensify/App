import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {FormValues} from '@src/types/onyx/Form';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import BusinessTypePicker from './BusinessTypePicker';

type TypeBusinessOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type TypeBusinessProps = TypeBusinessOnyxProps & SubStepProps;

const COMPANY_INCORPORATION_TYPE_KEY = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.INCORPORATION_TYPE;
const STEP_FIELDS = [COMPANY_INCORPORATION_TYPE_KEY];

function TypeBusiness({reimbursementAccount, onNext, isEditing}: TypeBusinessProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const validate = (values: FormValues): OnyxCommon.Errors => ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

    const defaultIncorporationType = reimbursementAccount?.achData?.incorporationType ?? '';

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        isEditing,
        onNext,
    });

    return (
        // @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.flexGrow1]}
            submitButtonStyles={[styles.p5, styles.mb0]}
        >
            <Text style={[styles.textHeadline, styles.mb3, styles.ph5]}>{translate('businessInfoStep.selectYourCompanysType')}</Text>
            <InputWrapper
                // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
                InputComponent={BusinessTypePicker}
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                inputID={COMPANY_INCORPORATION_TYPE_KEY}
                label={translate('businessInfoStep.companyType')}
                defaultValue={defaultIncorporationType}
                shouldSaveDraft={!isEditing}
                wrapperStyle={[styles.ph5, styles.mt4]}
            />
        </FormProvider>
    );
}

TypeBusiness.displayName = 'TypeBusiness';

export default withOnyx<TypeBusinessProps, TypeBusinessOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(TypeBusiness);
