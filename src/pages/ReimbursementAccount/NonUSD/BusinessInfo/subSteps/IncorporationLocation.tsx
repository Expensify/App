import {CONST as COMMON_CONST} from 'expensify-common/dist/CONST';
import React, {useCallback, useMemo, useState} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import PushRowWithModal from '@components/PushRowWithModal';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type IncorporationLocationProps = SubStepProps;

const {FORMATION_INCORPORATION_COUNTRY_CODE, FORMATION_INCORPORATION_STATE, COMPANY_COUNTRY_CODE, COMPANY_STATE} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [FORMATION_INCORPORATION_COUNTRY_CODE, FORMATION_INCORPORATION_STATE];

const PROVINCES_LIST_OPTIONS = (Object.keys(COMMON_CONST.PROVINCES) as Array<keyof typeof COMMON_CONST.PROVINCES>).reduce(
    (acc, key) => {
        acc[COMMON_CONST.PROVINCES[key].provinceISO] = COMMON_CONST.PROVINCES[key].provinceName;
        return acc;
    },
    {} as Record<string, string>,
);

const STATES_LIST_OPTIONS = (Object.keys(COMMON_CONST.STATES) as Array<keyof typeof COMMON_CONST.STATES>).reduce(
    (acc, key) => {
        acc[COMMON_CONST.STATES[key].stateISO] = COMMON_CONST.STATES[key].stateName;
        return acc;
    },
    {} as Record<string, string>,
);

const isCountryWithSelectableState = (countryCode: string) => countryCode === CONST.COUNTRY.US || countryCode === CONST.COUNTRY.CA;

function IncorporationLocation({onNext, isEditing}: IncorporationLocationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const onyxValues = useMemo(
        () =>
            getSubStepValues(
                {FORMATION_INCORPORATION_COUNTRY_CODE, FORMATION_INCORPORATION_STATE, COMPANY_COUNTRY: COMPANY_COUNTRY_CODE, COMPANY_STATE},
                reimbursementAccountDraft,
                reimbursementAccount,
            ),
        [reimbursementAccount, reimbursementAccountDraft],
    );

    const incorporationCountryInitialValue = onyxValues[FORMATION_INCORPORATION_COUNTRY_CODE] !== '' ? onyxValues[FORMATION_INCORPORATION_COUNTRY_CODE] : onyxValues[COMPANY_COUNTRY_CODE];
    const businessAddressStateDefaultValue = isCountryWithSelectableState(onyxValues[COMPANY_COUNTRY_CODE]) ? onyxValues[COMPANY_STATE] : '';
    const incorporationStateInitialValue = onyxValues[FORMATION_INCORPORATION_STATE] !== '' ? onyxValues[FORMATION_INCORPORATION_STATE] : businessAddressStateDefaultValue;

    const [selectedCountry, setSelectedCountry] = useState<string>(incorporationCountryInitialValue);
    const [selectedState, setSelectedState] = useState<string>(incorporationStateInitialValue);
    const shouldGatherState = isCountryWithSelectableState(selectedCountry);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            return getFieldRequiredErrors(values, shouldGatherState ? STEP_FIELDS : [FORMATION_INCORPORATION_COUNTRY_CODE]);
        },
        [shouldGatherState],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    const handleSelectingCountry = (country: unknown) => {
        setSelectedCountry(typeof country === 'string' ? country : '');
        setSelectedState('');
    };

    const handleSelectingState = (state: unknown) => {
        setSelectedState(typeof state === 'string' ? state : '');
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1]}
            submitButtonStyles={[styles.mh5]}
            shouldHideFixErrorsAlert={!shouldGatherState}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mh5, styles.mb3]}>{translate('businessInfoStep.whereWasTheBusinessIncorporated')}</Text>
            {shouldGatherState && (
                <InputWrapper
                    InputComponent={PushRowWithModal}
                    optionsList={selectedCountry === CONST.COUNTRY.US ? STATES_LIST_OPTIONS : PROVINCES_LIST_OPTIONS}
                    description={translate('businessInfoStep.incorporationState')}
                    modalHeaderTitle={translate('businessInfoStep.selectIncorporationState')}
                    searchInputTitle={translate('businessInfoStep.findIncorporationState')}
                    inputID={FORMATION_INCORPORATION_STATE}
                    shouldSaveDraft={!isEditing}
                    value={selectedState}
                    onValueChange={handleSelectingState}
                />
            )}
            <InputWrapper
                InputComponent={PushRowWithModal}
                optionsList={CONST.ALL_COUNTRIES}
                onValueChange={handleSelectingCountry}
                description={translate('businessInfoStep.incorporationCountry')}
                modalHeaderTitle={translate('countryStep.selectCountry')}
                searchInputTitle={translate('countryStep.findCountry')}
                inputID={FORMATION_INCORPORATION_COUNTRY_CODE}
                shouldSaveDraft={!isEditing}
                defaultValue={incorporationCountryInitialValue}
            />
        </FormProvider>
    );
}

export default IncorporationLocation;
