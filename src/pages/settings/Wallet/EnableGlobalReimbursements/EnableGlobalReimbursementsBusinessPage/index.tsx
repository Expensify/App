import InteractiveStepWrapper from '@components/InteractiveStepWrapper';

import useEnableGlobalReimbursementsNavigation from '@hooks/useEnableGlobalReimbursementsNavigation';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSubPage from '@hooks/useSubPage';

import {getCorpayOnboardingFields} from '@libs/actions/BankAccounts';
import getActiveTabName from '@libs/Navigation/helpers/getActiveTabName';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {clearCorpayPayModal} from '@userActions/App';
import {clearErrors} from '@userActions/FormActions';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React, {useEffect, useMemo, useState} from 'react';

import type {BusinessInfoSubPageProps} from './types';

import AverageReimbursement from './subPages/AverageReimbursement';
import BusinessType from './subPages/BusinessType';
import Confirmation from './subPages/Confirmation';
import PaymentVolume from './subPages/PaymentVolume';
import RegistrationNumber from './subPages/RegistrationNumber';

type EnableGlobalReimbursementsBusinessPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.SETTINGS.WALLET.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS | typeof SCREENS.SETTINGS.WALLET.DYNAMIC_ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS
>;

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
    const [corpayPayModal] = useOnyx(ONYXKEYS.RAM_ONLY_CORPAY_PAY_MODAL);
    const [bankAccount] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: (list) => list?.[bankAccountID]});
    const [country, setCountry] = useState<Country>(() => (route.params?.bankCountry ?? '') as Country);
    const [currency, setCurrency] = useState(() => route.params?.bankCurrency ?? '');

    const persistedRouteParams = useMemo(
        () => ({
            bankCountry: route.params?.bankCountry ?? (country || undefined),
            bankCurrency: route.params?.bankCurrency ?? (currency || undefined),
        }),
        [route.params?.bankCountry, route.params?.bankCurrency, country, currency],
    );

    const {getAgreementsRoute, getBusinessRoute, getRootBackPath, isDynamic} = useEnableGlobalReimbursementsNavigation();
    const topmostFullScreenRoute = useRootNavigationState((state) => state?.routes.findLast((navigationRoute) => isFullScreenName(navigationRoute.name)));
    const activeTab = getActiveTabName(topmostFullScreenRoute);

    const buildBusinessRoute = (subPage: string, action?: 'edit') => getBusinessRoute(Number(bankAccountID), subPage, action, persistedRouteParams);

    useEffect(() => {
        if (route.params?.bankCountry) {
            setCountry(route.params.bankCountry as Country);
        }
        if (route.params?.bankCurrency) {
            setCurrency(route.params.bankCurrency);
        }

        const modalMatchesAccount = corpayPayModal?.bankAccountID === Number(bankAccountID);
        if (modalMatchesAccount && corpayPayModal) {
            if (!route.params?.bankCountry) {
                setCountry(corpayPayModal.bankCountry as Country);
            }
            if (!route.params?.bankCurrency) {
                setCurrency(corpayPayModal.bankCurrency);
            }
            clearCorpayPayModal();
            return;
        }

        if (!route.params?.bankCountry && bankAccount) {
            setCountry(bankAccount.bankCountry as Country);
            setCurrency(bankAccount.bankCurrency ?? '');
        }
    }, [corpayPayModal, bankAccount, bankAccountID, route.params?.bankCountry, route.params?.bankCurrency]);

    const goToAgreementsPage = () => {
        Navigation.navigate(getAgreementsRoute(Number(bankAccountID), persistedRouteParams), isDynamic ? {forceReplace: true} : undefined);
    };

    const {CurrentPage, isEditing, pageIndex, prevPage, nextPage, moveTo} = useSubPage<BusinessInfoSubPageProps>({
        pages,
        onFinished: goToAgreementsPage,
        buildRoute: (pageName, action) => buildBusinessRoute(pageName, action),
        shouldReplaceRoute: isDynamic,
    });

    useEffect(() => {
        getCorpayOnboardingFields(country);
    }, [country]);

    useEffect(() => {
        return clearErrors(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS);
    }, []);

    const goBackToConfirmStep = () => {
        const confirmRoute = buildBusinessRoute(CONST.ENABLE_GLOBAL_REIMBURSEMENTS.PAGE_NAME.BUSINESS_INFO.CONFIRM);
        if (isDynamic) {
            Navigation.navigate(confirmRoute, {forceReplace: true});
            return;
        }
        Navigation.goBack(confirmRoute);
    };

    const handleBackButtonPress = () => {
        clearErrors(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS);
        if (isEditing) {
            goBackToConfirmStep();
            return;
        }

        if (pageIndex === 0) {
            if (isDynamic) {
                Navigation.goBack(getRootBackPath());
                return;
            }

            switch (activeTab) {
                case NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR:
                    Navigation.goBack(getRootBackPath());
                    break;
                case NAVIGATORS.REPORTS_SPLIT_NAVIGATOR:
                    Navigation.closeRHPFlow();
                    break;
                default:
                    Navigation.goBack();
                    break;
            }
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
