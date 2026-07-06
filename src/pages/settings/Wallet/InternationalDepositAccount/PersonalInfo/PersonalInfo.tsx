import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';

import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {formatE164PhoneNumber} from '@libs/LoginUtils';
import getActiveTabName from '@libs/Navigation/helpers/getActiveTabName';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';

import Navigation, {navigationRef} from '@navigation/Navigation';

import {addPersonalBankAccount, clearPersonalBankAccount} from '@userActions/BankAccounts';
import {continueSetup} from '@userActions/PaymentMethods';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useRef} from 'react';

import Address from './substeps/AddressStep';
import Confirmation from './substeps/ConfirmationStep';
import LegalName from './substeps/LegalNameStep';
import ManualBankAccountDetails from './substeps/ManualBankAccountDetailsStep';
import PhoneNumber from './substeps/PhoneNumberStep';
import PlaidBankAccount from './substeps/PlaidBankAccountStep';
import Success from './substeps/SuccessStep';
import getSkippedStepsPersonalInfo from './utils/getSkippedStepsPersonalInfo';

const SUB_PAGE_NAMES = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES;

const infoPages = [
    {pageName: SUB_PAGE_NAMES.LEGAL_NAME, component: LegalName},
    {pageName: SUB_PAGE_NAMES.ADDRESS, component: Address},
    {pageName: SUB_PAGE_NAMES.PHONE_NUMBER, component: PhoneNumber},
    {pageName: SUB_PAGE_NAMES.CONFIRMATION, component: Confirmation},
    {pageName: SUB_PAGE_NAMES.SUCCESS, component: Success},
];
const pagesWithPlaid = [{pageName: SUB_PAGE_NAMES.PLAID_BANK_ACCOUNT, component: PlaidBankAccount}, ...infoPages];
const pagesWithManualSetup = [{pageName: SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS, component: ManualBankAccountDetails}, ...infoPages];

const DEFAULT_OBJECT = {};
const ACCOUNT_OWNERSHIP_ERROR_SUBSTRING = 'account ownership';

function PersonalInfoPage() {
    const {translate} = useLocalize();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [personalBankAccount] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [fullPersonalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const isManual = personalBankAccount?.setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL;
    const error = getLatestErrorMessage(fullPersonalBankAccount ?? DEFAULT_OBJECT);
    const confirmedOwnershipDetails = useRef(false);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);

    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA);
    const kycWallRef = useContext(KYCWallContext);

    const shouldShowSuccess = fullPersonalBankAccount?.shouldShowSuccess ?? false;

    const exit = () => {
        const topmostFullScreenRoute = navigationRef.current?.getRootState()?.routes.findLast((rootRoute) => isFullScreenName(rootRoute.name));
        const activeTab = getActiveTabName(topmostFullScreenRoute);
        switch (activeTab) {
            case NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR:
                Navigation.goBack(ROUTES.SETTINGS_WALLET);
                break;
            case NAVIGATORS.REPORTS_SPLIT_NAVIGATOR:
                Navigation.closeRHPFlow();
                break;
            default:
                Navigation.goBack();
                break;
        }
    };

    const exitFlow = (shouldContinue = false) => {
        const exitReportID = fullPersonalBankAccount?.exitReportID;
        const onSuccessFallbackRoute = fullPersonalBankAccount?.onSuccessFallbackRoute ?? '';

        if (exitReportID) {
            Navigation.dismissModalWithReport({reportID: exitReportID});
        } else if (shouldContinue && onSuccessFallbackRoute) {
            continueSetup(kycWallRef, onSuccessFallbackRoute);
        } else {
            exit();
            clearPersonalBankAccount();
        }
    };

    const submitBankAccountForm = () => {
        const bankAccounts = plaidData?.bankAccounts ?? [];

        const selectedPlaidBankAccount = bankAccounts.find((bankAccount) => bankAccount.plaidAccountID === personalBankAccount?.selectedPlaidAccountID);
        const bankAccountWithToken = selectedPlaidBankAccount?.plaidAccessToken
            ? selectedPlaidBankAccount
            : {
                  ...selectedPlaidBankAccount,
                  plaidAccessToken: plaidData?.plaidAccessToken ?? '',
              };
        const finalPhoneNumber = personalBankAccount?.phoneNumber ?? privatePersonalDetails?.phoneNumber ?? '';
        const accountData = {
            ...privatePersonalDetails,
            ...personalBankAccount,
            ...bankAccountWithToken,
            phoneNumber: formatE164PhoneNumber(finalPhoneNumber, countryCode),
        };
        if (confirmedOwnershipDetails.current) {
            accountData.confirmedOwnershipDetails = true;
        }
        addPersonalBankAccount(accountData, personalPolicyID);
    };

    const pages = isManual ? pagesWithManualSetup : pagesWithPlaid;
    const skipPages = getSkippedStepsPersonalInfo(privatePersonalDetails)
        .map((index) => pages.at(index)?.pageName)
        .filter((pageName): pageName is NonNullable<typeof pageName> => !!pageName);

    // This flow is rendered by two screens, so the substep URL must be built for whichever route is currently active.
    const route = useRoute();
    const buildRoute = (pageName: string, action?: 'edit') =>
        route.name === SCREENS.SETTINGS.ADD_US_BANK_ACCOUNT ? ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT.getRoute(pageName, action) : ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(pageName, action);
    const onFinished = (data?: unknown) => exitFlow(!!data);

    const {CurrentPage, isEditing, nextPage, prevPage, moveTo, pageIndex, currentPageName, isRedirecting} = useSubPage<SubPageProps>({
        pages,
        skipPages,
        onFinished,
        buildRoute,
    });

    const confirmationIndex = pages.findIndex((page) => page.pageName === SUB_PAGE_NAMES.CONFIRMATION);

    const handleNext = (data?: unknown) => {
        // When editing a field from the confirmation step, jump straight back to it.
        if (isEditing) {
            moveTo(confirmationIndex, false);
            return;
        }
        // On the confirmation step we submit the bank account first; the success step is
        // only shown once the request succeeds (see the effect below).
        if (currentPageName === SUB_PAGE_NAMES.CONFIRMATION) {
            submitBankAccountForm();
            return;
        }
        nextPage(data);
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            moveTo(confirmationIndex, false);
            return;
        }
        if (pageIndex === 0) {
            Navigation.goBack();
            return;
        }
        prevPage();
    };

    // Advance to the success step once the bank account has been added successfully.
    useEffect(() => {
        if (!shouldShowSuccess || currentPageName !== SUB_PAGE_NAMES.CONFIRMATION) {
            return;
        }
        nextPage();
    }, [shouldShowSuccess, currentPageName, nextPage]);

    useEffect(() => {
        if (!error) {
            return;
        }
        if (error.includes(ACCOUNT_OWNERSHIP_ERROR_SUBSTRING)) {
            confirmedOwnershipDetails.current = true;
        }
        return () => {
            confirmedOwnershipDetails.current = false;
        };
    }, [error]);

    if (isRedirecting) {
        return <FullScreenLoadingIndicator reasonAttributes={{context: 'PersonalInfoPage', isRedirecting}} />;
    }

    return (
        <InteractiveStepWrapper
            wrapperID={PersonalInfoPage.displayName}
            headerTitle={translate('bankAccount.addBankAccount')}
            handleBackButtonPress={handleBackButtonPress}
        >
            <CurrentPage
                isEditing={isEditing}
                onNext={handleNext}
                onMove={moveTo}
            />
        </InteractiveStepWrapper>
    );
}

PersonalInfoPage.displayName = 'PersonalInfoPage';

export default PersonalInfoPage;
