import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import PushRowWithModal from '@components/PushRowWithModal';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useExpensifyCardUkEuSupported from '@hooks/useExpensifyCardUkEuSupported';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import mapCurrencyToCountry from '@libs/mapCurrencyToCountry';
import Navigation from '@libs/Navigation/Navigation';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import getAvailableEuCountries from '@pages/ReimbursementAccount/utils/getAvailableEuCountries';
import {clearErrors, setDraftValues} from '@userActions/FormActions';
import {setIsComingFromGlobalReimbursementsFlow} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const {COUNTRY} = INPUT_IDS.ADDITIONAL_DATA;

type ConfirmationStepProps = {
    /** ID of current policy */
    policyID: string | undefined;
} & SubStepProps;

function Confirmation({onNext, policyID, isComingFromExpensifyCard}: ConfirmationStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const currency = policy?.outputCurrency ?? '';

    const shouldAllowChange = currency === CONST.CURRENCY.EUR;
    const defaultCountries = shouldAllowChange ? CONST.ALL_EUROPEAN_UNION_COUNTRIES : CONST.ALL_COUNTRIES;
    const currencyMappedToCountry = mapCurrencyToCountry(currency);
    const isUkEuCurrencySupported = useExpensifyCardUkEuSupported(policyID) && isComingFromExpensifyCard;
    const countriesSupportedForExpensifyCard = getAvailableEuCountries();

    const countryDefaultValue = reimbursementAccountDraft?.[COUNTRY] ?? reimbursementAccount?.achData?.[COUNTRY] ?? '';
    const [selectedCountry, setSelectedCountry] = useState<string>(countryDefaultValue);

    const disableSubmit = !(currency in CONST.CURRENCY);

    const handleSettingsPress = () => {
        if (!policyID) {
            return;
        }

        setIsComingFromGlobalReimbursementsFlow(true);
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID), {forceReplace: !isSmallScreenWidth});
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
            shouldHideFixErrorsAlert
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('countryStep.confirmBusinessBank')}</Text>
            <MenuItemWithTopDescription
                description={translate('common.currency')}
                title={currency}
                interactive={false}
            />
            <View style={styles.ph5}>
                <Text style={[styles.mb3, styles.mutedTextLabel]}>
                    {`${translate('countryStep.yourBusiness')} ${translate('countryStep.youCanChange')}`}{' '}
                    <TextLink
                        style={[styles.label]}
                        onPress={handleSettingsPress}
                    >
                        {translate('common.settings').toLowerCase()}
                    </TextLink>
                    .
                </Text>
            </View>
            <InputWrapper
                InputComponent={PushRowWithModal}
                optionsList={isUkEuCurrencySupported ? countriesSupportedForExpensifyCard : defaultCountries}
                onValueChange={(value) => setSelectedCountry(value as string)}
                description={translate('common.country')}
                modalHeaderTitle={translate('countryStep.selectCountry')}
                searchInputTitle={translate('countryStep.findCountry')}
                shouldAllowChange={shouldAllowChange}
                value={selectedCountry}
                inputID={COUNTRY}
                shouldSaveDraft={false}
            />
        </FormProvider>
    );
}

export default Confirmation;
