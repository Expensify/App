import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountDraft} from '@src/types/onyx';
import type {BeneficialOwnerDraftData} from '@src/types/onyx/ReimbursementAccountDraft';

const {FIRST_NAME, LAST_NAME} = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

type LegalNameUBOOnyxProps = {
    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountDraft>;
};
type LegalNameUBOProps = SubStepProps & LegalNameUBOOnyxProps & {beneficialOwnerBeingModifiedID: string};
type FormValues = BeneficialOwnerDraftData;

function LegalNameUBO({reimbursementAccountDraft, onNext, isEditing, beneficialOwnerBeingModifiedID}: LegalNameUBOProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const firstNameInputID: keyof FormValues = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${FIRST_NAME}`;
    const lastNameInputID: keyof FormValues = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${LAST_NAME}`;

    const defaultFirstName = reimbursementAccountDraft?.[firstNameInputID] ?? '';
    const defaultLastName = reimbursementAccountDraft?.[lastNameInputID] ?? '';

    const validate = (values: FormValues) => ValidationUtils.getFieldRequiredErrors(values, [firstNameInputID, lastNameInputID]);

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
            <Text style={styles.textHeadline}>{translate('beneficialOwnerInfoStep.enterLegalFirstAndLastName')}</Text>
            <InputWrapper
                // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
                InputComponent={TextInput}
                label={translate('beneficialOwnerInfoStep.legalFirstName')}
                aria-label={translate('beneficialOwnerInfoStep.legalFirstName')}
                role={CONST.ROLE.PRESENTATION}
                inputID={firstNameInputID}
                containerStyles={[styles.mt4]}
                defaultValue={defaultFirstName}
                shouldSaveDraft
            />
            <InputWrapper
                // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
                InputComponent={TextInput}
                label={translate('beneficialOwnerInfoStep.legalLastName')}
                aria-label={translate('beneficialOwnerInfoStep.legalLastName')}
                role={CONST.ROLE.PRESENTATION}
                inputID={lastNameInputID}
                containerStyles={[styles.mt4]}
                defaultValue={defaultLastName}
                shouldSaveDraft
            />
        </FormProvider>
    );
}

LegalNameUBO.displayName = 'LegalNameUBO';

export default withOnyx<LegalNameUBOProps, LegalNameUBOOnyxProps>({
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(LegalNameUBO);
