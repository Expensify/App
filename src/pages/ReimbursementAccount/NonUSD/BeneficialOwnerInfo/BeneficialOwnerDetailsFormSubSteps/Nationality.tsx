import React, {useCallback, useState} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import PushRowWithModal from '@components/PushRowWithModal';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import {setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SafeString from '@src/utils/SafeString';

type NationalityProps = SubStepProps & {isUserEnteringHisOwnData: boolean; ownerBeingModifiedID: string};

const {NATIONALITY, PREFIX} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

function Nationality({onNext, isEditing, isUserEnteringHisOwnData, ownerBeingModifiedID}: NationalityProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const nationalityInputID = `${PREFIX}_${ownerBeingModifiedID}_${NATIONALITY}` as const;
    const countryDefaultValue = SafeString(reimbursementAccountDraft?.[nationalityInputID]);
    const [selectedCountry, setSelectedCountry] = useState<string>(countryDefaultValue);

    const handleSubmit = () => {
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[nationalityInputID]: selectedCountry});
        onNext();
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            return getFieldRequiredErrors(values, [nationalityInputID]);
        },
        [nationalityInputID],
    );

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={styles.flexGrow1}
            submitButtonStyles={[styles.mb0, styles.mh5]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb5, styles.mh5]}>
                {translate(isUserEnteringHisOwnData ? 'ownershipInfoStep.whatsYourNationality' : 'ownershipInfoStep.whatsTheOwnersNationality')}
            </Text>
            <InputWrapper
                InputComponent={PushRowWithModal}
                optionsList={CONST.ALL_COUNTRIES}
                onValueChange={(value) => setSelectedCountry(value as string)}
                description={translate('common.country')}
                modalHeaderTitle={translate('countryStep.selectCountry')}
                searchInputTitle={translate('countryStep.findCountry')}
                value={selectedCountry}
                inputID={nationalityInputID}
                shouldSaveDraft={false}
            />
        </FormProvider>
    );
}

Nationality.displayName = 'Nationality';

export default Nationality;
