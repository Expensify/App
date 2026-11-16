/** Collects AU owner citizenship and politically exposed person declarations. */
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import PushRowWithModal from '@components/PushRowWithModal';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

import React, {useState} from 'react';

const {ANY_BENEFICIAL_OWNERS_HOLD_US_CITIZENSHIP, POLITICALLY_EXPOSED_PERSON, NAME_TITLE_POSITION_HELD} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

type OwnerDeclarationsProps = {
    onSubmit: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>) => void;
};

function OwnerDeclarations({onSubmit}: OwnerDeclarationsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [draft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const saved = reimbursementAccount?.achData?.corpay;
    const [isPoliticallyExposed, setIsPoliticallyExposed] = useState(String(draft?.[POLITICALLY_EXPOSED_PERSON] ?? saved?.[POLITICALLY_EXPOSED_PERSON] ?? '') === 'true');

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        const errors = getFieldRequiredErrors(values, [ANY_BENEFICIAL_OWNERS_HOLD_US_CITIZENSHIP, POLITICALLY_EXPOSED_PERSON], translate);
        if (String(values[POLITICALLY_EXPOSED_PERSON]) === 'true') {
            return {...errors, ...getFieldRequiredErrors(values, [NAME_TITLE_POSITION_HELD], translate)};
        }
        return errors;
    };

    const optionsList = {true: translate('common.yes'), false: translate('common.no')};

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate('common.continue')}
            validate={validate}
            onSubmit={onSubmit}
            style={[styles.flexGrow1]}
            submitButtonStyles={[styles.mh5]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mh5, styles.mb3]}>{translate('ownershipInfoStep.ownerDeclarations')}</Text>
            <InputWrapper
                InputComponent={PushRowWithModal}
                optionsList={optionsList}
                description={translate('ownershipInfoStep.anyUSCitizenOwners')}
                modalHeaderTitle={translate('ownershipInfoStep.anyUSCitizenOwners')}
                inputID={ANY_BENEFICIAL_OWNERS_HOLD_US_CITIZENSHIP}
                sentryLabel={CONST.SENTRY_LABEL.CORPAY_ONBOARDING.US_CITIZEN_OWNERS}
                defaultValue={String(draft?.[ANY_BENEFICIAL_OWNERS_HOLD_US_CITIZENSHIP] ?? saved?.[ANY_BENEFICIAL_OWNERS_HOLD_US_CITIZENSHIP] ?? '')}
                shouldSaveDraft
            />
            <InputWrapper
                InputComponent={PushRowWithModal}
                optionsList={optionsList}
                description={translate('ownershipInfoStep.isPoliticallyExposed')}
                modalHeaderTitle={translate('ownershipInfoStep.isPoliticallyExposed')}
                numberOfLinesDescription={0}
                inputID={POLITICALLY_EXPOSED_PERSON}
                sentryLabel={CONST.SENTRY_LABEL.CORPAY_ONBOARDING.POLITICALLY_EXPOSED}
                defaultValue={String(draft?.[POLITICALLY_EXPOSED_PERSON] ?? saved?.[POLITICALLY_EXPOSED_PERSON] ?? '')}
                onValueChange={(value: unknown) => setIsPoliticallyExposed(value === 'true')}
                shouldSaveDraft
            />
            {isPoliticallyExposed && (
                <InputWrapper
                    InputComponent={TextInput}
                    label={translate('ownershipInfoStep.pepDetails')}
                    aria-label={translate('ownershipInfoStep.pepDetails')}
                    role={CONST.ROLE.PRESENTATION}
                    forceActiveLabel
                    inputID={NAME_TITLE_POSITION_HELD}
                    sentryLabel={CONST.SENTRY_LABEL.CORPAY_ONBOARDING.PEP_DETAILS}
                    containerStyles={[styles.mt5, styles.mh5]}
                    defaultValue={draft?.[NAME_TITLE_POSITION_HELD] ?? saved?.[NAME_TITLE_POSITION_HELD] ?? ''}
                    shouldSaveDraft
                />
            )}
        </FormProvider>
    );
}

export default OwnerDeclarations;
