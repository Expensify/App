import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalBankAccountDetailsFormSubmit from '@hooks/usePersonalBankAccountDetailsFormSubmit';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {validatePlaidSelection} from '@userActions/BankAccounts';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';

import type {NavigationProp, RouteProp} from '@react-navigation/native';

import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const STEP_FIELDS = [BANK_INFO_STEP_KEYS.SELECTED_PLAID_ACCOUNT_ID];

function PlaidBankAccountStep({onNext, isEditing}: SubPageProps) {
    const navigation = useNavigation<NavigationProp<SettingsNavigatorParamList>>();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [selectedPlaidAccountId, setSelectedPlaidAccountId] = useState('');
    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA);
    const [bankAccountPersonalDetails] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);

    const handleSubmit = usePersonalBankAccountDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    const exitPlaid = () => {
        const countrySelectorRoute = navigation
            .getState()
            ?.routes.findLast((route): route is RouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.ADD_BANK_ACCOUNT> => route.name === SCREENS.SETTINGS.ADD_BANK_ACCOUNT);
        if (!countrySelectorRoute) {
            Navigation.goBack();
            return;
        }

        // Matching the existing params pops to the mounted country list instead of replacing it and losing its selection.
        const {backTo, subPage, action} = countrySelectorRoute.params ?? {};
        Navigation.goBack(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(backTo, subPage, action));
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM}
            isSubmitButtonVisible={(plaidData?.bankAccounts ?? []).length > 0}
            scrollContextEnabled
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            submitButtonStyles={styles.mh5}
            onSubmit={handleSubmit}
            validate={validatePlaidSelection}
            style={styles.flexGrow1}
            shouldHideFixErrorsAlert
        >
            <InputWrapper
                inputID={INPUT_IDS.BANK_INFO_STEP.SELECTED_PLAID_ACCOUNT_ID}
                InputComponent={AddPlaidBankAccount}
                onSelect={setSelectedPlaidAccountId}
                text={translate('walletPage.chooseAccountBody')}
                plaidData={plaidData}
                defaultValue={bankAccountPersonalDetails?.selectedPlaidAccountID}
                isDisplayedInWalletFlow
                onExitPlaid={exitPlaid}
                receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
                selectedPlaidAccountID={bankAccountPersonalDetails?.selectedPlaidAccountID ?? selectedPlaidAccountId}
            />
        </FormProvider>
    );
}
PlaidBankAccountStep.displayName = 'PlaidBankAccountStep';

export default PlaidBankAccountStep;
