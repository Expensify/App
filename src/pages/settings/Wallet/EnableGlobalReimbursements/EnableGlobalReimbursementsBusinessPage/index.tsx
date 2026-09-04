import InteractiveStepWrapper from '@components/InteractiveStepWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';

import {getCorpayOnboardingFields} from '@libs/actions/BankAccounts';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {clearCorpayPayModal} from '@userActions/App';
import {clearErrors} from '@userActions/FormActions';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect, useState} from 'react';

import type {BusinessInfoSubPageProps} from './types';

import AverageReimbursement from './subPages/AverageReimbursement';
import BusinessType from './subPages/BusinessType';
import Confirmation from './subPages/Confirmation';
import PaymentVolume from './subPages/PaymentVolume';
import RegistrationNumber from './subPages/RegistrationNumber';

type EnableGlobalReimbursementsBusinessPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS>;

const pages = [
    {pageName: CONST.ENABLE_GLOBAL_REIMBURSEMENTS.PAGE_NAME.BUSINESS_INFO.REGISTRATION_NUMBER, component: RegistrationNumber},
    {pageName: CONST.ENABLE_GLOBAL_REIMBURSEMENTS.PAGE_NAME.BUSINESS_INFO.TYPE, component: BusinessType},
    {pageName: CONST.ENABLE_GLOBAL_REIMBURSEMENTS.PAGE_NAME.BUSINESS_INFO.PAYMENT_VOLUME, component: PaymentVolume},
    {pageName: CONST.ENABLE_GLOBAL_REIMBURSEMENTS.PAGE_NAME.BUSINESS_INFO.AVERAGE_REIMBURSEMENT, component: AverageReimbursement},
    {pageName: CONST.ENABLE_GLOBAL_REIMBURSEMENTS.PAGE_NAME.BUSINESS_INFO.CONFIRM, component: Confirmation},
];

function EnableGlobalReimbursementsBusinessPage({route}: EnableGlobalReimbursementsBusinessPageProps) {
    const {translate} = useLocalize();
    const bankAccountID = route.params?.bankAccountID;
    // The pay modal sends bankCountry/bankCurrency in the corpayPayModal signal so this page can render without an
    // extra BANK_ACCOUNT_LIST lookup (which may not be hydrated when deep-linking from the report). The signal is
    // consumed on mount: its country/currency are captured into local state and the signal is cleared, so the next
    // pay attempt transitions null -> object and re-triggers the modal. Onyx skips notifications for deeply-equal
    // SETs, so leaving the signal alive would prevent the modal from reopening on a repeat pay. For the WalletPage
    // entry (no signal), country/currency fall back to BANK_ACCOUNT_LIST.
    const [corpayPayModal] = useOnyx(ONYXKEYS.RAM_ONLY_CORPAY_PAY_MODAL);
    const [bankAccount] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: (list) => list?.[bankAccountID]});
    const [country, setCountry] = useState<Country>('' as Country);
    const [currency, setCurrency] = useState('');

    useEffect(() => {
        const modalMatchesAccount = corpayPayModal?.bankAccountID === Number(bankAccountID);
        if (modalMatchesAccount && corpayPayModal) {
            setCountry(corpayPayModal.bankCountry as Country);
            setCurrency(corpayPayModal.bankCurrency);
            clearCorpayPayModal();
            return;
        }
        if (bankAccount) {
            setCountry(bankAccount.bankCountry as Country);
            setCurrency(bankAccount.bankCurrency ?? '');
        }
    }, [corpayPayModal, bankAccount, bankAccountID]);

    const goToAgreementsPage = () => {
        Navigation.navigate(ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS_AGREEMENTS.getRoute(Number(bankAccountID)));
    };

    const {CurrentPage, isEditing, pageIndex, prevPage, nextPage, moveTo} = useSubPage<BusinessInfoSubPageProps>({
        pages,
        onFinished: goToAgreementsPage,
        buildRoute: (pageName, action) => ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.getRoute(Number(bankAccountID), pageName, action),
    });

    useEffect(() => {
        getCorpayOnboardingFields(country);
    }, [country]);

    useEffect(() => {
        return clearErrors(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS);
    }, []);

    const goBackToConfirmStep = () => {
        Navigation.goBack(ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.getRoute(Number(bankAccountID), CONST.ENABLE_GLOBAL_REIMBURSEMENTS.PAGE_NAME.BUSINESS_INFO.CONFIRM));
    };

    const handleBackButtonPress = () => {
        clearErrors(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS);
        if (isEditing) {
            goBackToConfirmStep();
            return;
        }

        if (pageIndex === 0) {
            Navigation.goBack();
            return;
        }

        prevPage();
    };

    return (
        <InteractiveStepWrapper
            wrapperID="BusinessInfo"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('businessInfoStep.businessInfoTitle')}
            stepNames={CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP_INDEX_LIST}
            startStepIndex={0}
        >
            <CurrentPage
                isEditing={isEditing}
                onNext={nextPage}
                onMove={moveTo}
                country={country}
                currency={currency}
            />
        </InteractiveStepWrapper>
    );
}

export default EnableGlobalReimbursementsBusinessPage;
