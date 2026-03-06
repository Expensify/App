import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubPage from '@hooks/useSubPage';
import {getCorpayOnboardingFields} from '@libs/actions/BankAccounts';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {clearErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import AverageReimbursement from './subPages/AverageReimbursement';
import BusinessType from './subPages/BusinessType';
import Confirmation from './subPages/Confirmation';
import PaymentVolume from './subPages/PaymentVolume';
import RegistrationNumber from './subPages/RegistrationNumber';
import type {BusinessInfoSubPageProps} from './types';

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
    const [bankAccount] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: (list) => list?.[bankAccountID]});
    const currency = bankAccount?.bankCurrency ?? '';
    const country = bankAccount?.bankCountry as Country;

    const goToAgreementsPage = () => {
        Navigation.navigate(ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS_AGREEMENTS.getRoute(Number(bankAccountID)));
    };

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
