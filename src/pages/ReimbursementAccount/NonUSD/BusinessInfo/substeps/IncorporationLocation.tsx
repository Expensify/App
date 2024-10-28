import {CONST as COMMON_CONST} from 'expensify-common/dist/CONST';
import React, {useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import PushRowWithModal from '@components/PushRowWithModal';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import PROVINCES from '@pages/ReimbursementAccount/NonUSD/mockedCanadianProvinces';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type IncorporationLocationProps = SubStepProps;

const {FORMATION_INCORPORATION_COUNTRY_CODE, FORMATION_INCORPORATION_STATE} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [FORMATION_INCORPORATION_COUNTRY_CODE, FORMATION_INCORPORATION_STATE];

function IncorporationLocation({onNext, isEditing}: IncorporationLocationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const businessStepCountryDraftValue =
        reimbursementAccount?.achData?.additionalData?.corpay?.[FORMATION_INCORPORATION_COUNTRY_CODE] ?? reimbursementAccountDraft?.[FORMATION_INCORPORATION_COUNTRY_CODE] ?? '';

    const countryStepCountryDraftValue = reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';
    const countryInitialValue =
        businessStepCountryDraftValue !== '' && businessStepCountryDraftValue !== countryStepCountryDraftValue ? businessStepCountryDraftValue : countryStepCountryDraftValue;
    const selectedIncorporationStateInitialValue: string =
        reimbursementAccount?.achData?.additionalData?.corpay?.[FORMATION_INCORPORATION_STATE] ?? reimbursementAccountDraft?.[FORMATION_INCORPORATION_STATE] ?? '';

    const [selectedCountry, setSelectedCountry] = useState<string>(countryInitialValue);
    const [selectedIncorporationState, setSelectedIncorporationState] = useState<string>(selectedIncorporationStateInitialValue);

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    const handleSelectingCountry = (country: string) => {
        if (!isEditing) {
            FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[FORMATION_INCORPORATION_COUNTRY_CODE]: country});
        }
        setSelectedCountry(country);
    };

    const handleSelectingIncorporationState = (state: string) => {
        if (!isEditing) {
            FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[FORMATION_INCORPORATION_STATE]: state});
        }
        setSelectedIncorporationState(state);
    };

    useEffect(() => {
        FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[FORMATION_INCORPORATION_COUNTRY_CODE]: selectedCountry});
        FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[FORMATION_INCORPORATION_STATE]: selectedIncorporationState});
    }, [selectedIncorporationState, selectedCountry]);

    const provincesListOptions = (Object.keys(PROVINCES) as Array<keyof typeof PROVINCES>).reduce((acc, key) => {
        acc[PROVINCES[key].provinceISO] = PROVINCES[key].provinceName;
        return acc;
    }, {} as Record<string, string>);

    const statesListOptions = (Object.keys(COMMON_CONST.STATES) as Array<keyof typeof COMMON_CONST.STATES>).reduce((acc, key) => {
        acc[COMMON_CONST.STATES[key].stateISO] = COMMON_CONST.STATES[key].stateName;
        return acc;
    }, {} as Record<string, string>);

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            style={[styles.flexGrow1]}
            submitButtonStyles={[styles.mh5]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mh5, styles.mb3]}>{translate('businessInfoStep.whereWasTheBusinessIncorporated')}</Text>
            {(selectedCountry === CONST.COUNTRY.US || selectedCountry === CONST.COUNTRY.CA) && (
                <InputWrapper
                    InputComponent={PushRowWithModal}
                    optionsList={selectedCountry === CONST.COUNTRY.US ? statesListOptions : provincesListOptions}
                    selectedOption={selectedIncorporationState}
                    onOptionChange={handleSelectingIncorporationState}
                    description={translate('businessInfoStep.incorporationState')}
                    modalHeaderTitle={translate('businessInfoStep.selectIncorporationState')}
                    searchInputTitle={translate('businessInfoStep.findIncorporationState')}
                    value={selectedIncorporationState}
                    inputID={FORMATION_INCORPORATION_STATE}
                />
            )}
            <InputWrapper
                InputComponent={PushRowWithModal}
                optionsList={CONST.ALL_COUNTRIES}
                selectedOption={selectedCountry}
                onOptionChange={handleSelectingCountry}
                description={translate('businessInfoStep.incorporationCountry')}
                modalHeaderTitle={translate('countryStep.selectCountry')}
                searchInputTitle={translate('countryStep.findCountry')}
                value={selectedCountry}
                inputID={FORMATION_INCORPORATION_COUNTRY_CODE}
            />
        </FormProvider>
    );
}

IncorporationLocation.displayName = 'IncorporationLocation';

export default IncorporationLocation;
