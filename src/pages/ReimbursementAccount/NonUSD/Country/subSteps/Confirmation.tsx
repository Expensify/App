import React, {useCallback, useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import PushRowWithModal from '@components/PushRowWithModal';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import mapCurrencyToCountry from '@pages/ReimbursementAccount/utils/mapCurrencyToCountry';
import {clearErrors, setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const {COUNTRY} = INPUT_IDS.ADDITIONAL_DATA;

type ConfirmationStepProps = {
    /** ID of current policy */
    policyID: string | undefined;
} & SubStepProps;

function Confirmation({onNext, policyID}: ConfirmationStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? '';

    const shouldAllowChange = currency === CONST.CURRENCY.EUR;
    const currencyMappedToCountry = mapCurrencyToCountry(currency);

    const countryDefaultValue = reimbursementAccount?.achData?.[COUNTRY] ?? reimbursementAccountDraft?.[COUNTRY] ?? '';
    const [selectedCountry, setSelectedCountry] = useState<string>(countryDefaultValue);

    const disableSubmit = !(currency in CONST.CURRENCY);

    const handleSettingsPress = () => {
        if (!policyID) {
            return;
        }

        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID));
    };

    const handleSubmit = () => {
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[COUNTRY]: selectedCountry});
        onNext();
    };

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        return getFieldRequiredErrors(values, [COUNTRY]);
    }, []);

    useEffect(() => {
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
    });

    useEffect(() => {
        if (currency === CONST.CURRENCY.EUR) {
            return;
        }

        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[COUNTRY]: currencyMappedToCountry});
        setSelectedCountry(currencyMappedToCountry);
    }, [currency, currencyMappedToCountry]);

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate('common.confirm')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.flexGrow1]}
            submitButtonStyles={[styles.mh5, styles.pb0]}
            isSubmitDisabled={disableSubmit}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('countryStep.confirmBusinessBank')}</Text>
            <MenuItemWithTopDescription
                description={translate('common.currency')}
                title={currency}
                interactive={false}
            />
            <Text style={[styles.ph5, styles.mb3, styles.mutedTextLabel]}>
                {`${translate('countryStep.yourBusiness')} ${translate('countryStep.youCanChange')}`}{' '}
                <TextLink
                    style={[styles.label]}
                    onPress={handleSettingsPress}
                >
                    {translate('common.settings').toLowerCase()}.
                </TextLink>
            </Text>
            <InputWrapper
                InputComponent={PushRowWithModal}
                optionsList={shouldAllowChange ? CONST.ALL_EUROPEAN_COUNTRIES : CONST.ALL_COUNTRIES}
                onValueChange={(value) => setSelectedCountry(value as string)}
                description={translate('common.country')}
                modalHeaderTitle={translate('countryStep.selectCountry')}
                searchInputTitle={translate('countryStep.findCountry')}
                shouldAllowChange={shouldAllowChange}
                value={selectedCountry}
                inputID={COUNTRY}
            />
        </FormProvider>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
