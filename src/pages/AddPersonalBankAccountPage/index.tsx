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
import {getCurrentAddress, getStreetLines} from '@libs/PersonalDetailsUtils';

import Navigation, {navigationRef} from '@navigation/Navigation';

import {addPersonalBankAccount, clearPersonalBankAccount, updatePersonalBankAccountCurrentPage} from '@userActions/BankAccounts';
import {clearDraftValues} from '@userActions/FormActions';
import {continueSetup} from '@userActions/PaymentMethods';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

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

type PersonalBankAccountSubPageProps = SubPageProps & {
    shouldSaveDraft?: boolean;
};

function AddPersonalBankAccountPage() {
    const {translate} = useLocalize();
    const route = useRoute();
    const urlSubPage = (route.params as {subPage?: string} | undefined)?.subPage;

    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [personalBankAccount, personalBankAccountMetadata] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [fullPersonalBankAccount, fullPersonalBankAccountMetadata] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const isManual = personalBankAccount?.setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL || urlSubPage === SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS;
    const error = getLatestErrorMessage(fullPersonalBankAccount ?? DEFAULT_OBJECT);
    const confirmedOwnershipDetails = useRef(false);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);

    const [plaidData, plaidDataMetadata] = useOnyx(ONYXKEYS.PLAID_DATA);
    const kycWallRef = useContext(KYCWallContext);

    const shouldShowSuccess = fullPersonalBankAccount?.shouldShowSuccess ?? false;

    const exit = () => {
        const topmostFullScreenRoute = navigationRef.current?.getRootState()?.routes.findLast((rootRoute) => isFullScreenName(rootRoute.name));
        const activeTab = getActiveTabName(topmostFullScreenRoute);
        switch (activeTab) {
            case NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR:
                Navigation.goBack(ROUTES.SETTINGS_WALLET);
                break;
            case SCREENS.HOME:
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
        }
        if (fullPersonalBankAccount?.source === CONST.BANK_ACCOUNT.SOURCE.WALLET) {
            clearDraftValues(ONYXKEYS.FORMS.HOME_ADDRESS_FORM);
        }
        // Clear the flow's scratch state on every real exit path. The flow no longer clears on unmount.
        clearPersonalBankAccount();
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

        // When the Address substep is skipped (the profile already has a complete address), the flat
        // addressStreet/addressCity/... keys that addPersonalBankAccount expects are never written to the form draft.
        // Map the saved profile address (stored nested in the addresses array) to those flat keys so the address
        // is still submitted. The form draft spread below wins, so a manually entered address still takes precedence.
        const currentAddress = getCurrentAddress(privatePersonalDetails);
        const [addressStreet, street2] = getStreetLines(currentAddress?.street);
        // The unit/suite may be stored either embedded after a newline in `street` (extracted above) or in the
        // separate `street2`/`addressLine2` fields; fall back to those so it isn't dropped, matching UpdatePersonalBankAccountPage.
        const addressStreet2 = street2 ?? currentAddress?.street2 ?? currentAddress?.addressLine2;
        const accountData = {
            ...privatePersonalDetails,
            addressStreet,
            addressStreet2,
            addressCity: currentAddress?.city,
            addressState: currentAddress?.state,
            addressZipCode: currentAddress?.zip,
            country: currentAddress?.country,
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

    const buildRoute = (pageName: string, action?: 'edit') =>
        route.name === SCREENS.SETTINGS.ADD_US_BANK_ACCOUNT ? ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT.getRoute(pageName, action) : ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(pageName, action);
    const onFinished = (data?: unknown) => exitFlow(!!data);

    let setupPageName: string | undefined;
    if (personalBankAccount?.setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL) {
        setupPageName = SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS;
    } else if (personalBankAccount?.setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
        setupPageName = SUB_PAGE_NAMES.PLAID_BANK_ACCOUNT;
    }
    const selectedPlaidAccount = plaidData?.bankAccounts?.find((bankAccount) => bankAccount.plaidAccountID === personalBankAccount?.selectedPlaidAccountID);
    const hasCompletedPlaidConnection = !!selectedPlaidAccount?.plaidAccessToken;
    const canResumeSavedPage = isManual || fullPersonalBankAccount?.currentPage === SUB_PAGE_NAMES.PLAID_BANK_ACCOUNT || hasCompletedPlaidConnection;
    const savedPageIndex = canResumeSavedPage ? pages.findIndex((page) => page.pageName === fullPersonalBankAccount?.currentPage) : -1;
    const setupPageIndex = pages.findIndex((page) => page.pageName === setupPageName);
    const firstIncompletePageIndex = pages.findIndex((page) => {
        if (skipPages.includes(page.pageName)) {
            return false;
        }
        if (page.pageName === SUB_PAGE_NAMES.LEGAL_NAME) {
            return !personalBankAccount?.legalFirstName || !personalBankAccount?.legalLastName;
        }
        if (page.pageName === SUB_PAGE_NAMES.ADDRESS) {
            const isUSOrCanada = personalBankAccount?.country === CONST.COUNTRY.US || personalBankAccount?.country === CONST.COUNTRY.CA;
            const isStateMissing = isUSOrCanada && !personalBankAccount?.addressState;
            return !personalBankAccount?.addressStreet || !personalBankAccount?.addressCity || !personalBankAccount?.addressZipCode || !personalBankAccount?.country || isStateMissing;
        }
        if (page.pageName === SUB_PAGE_NAMES.PHONE_NUMBER) {
            return !personalBankAccount?.phoneNumber;
        }
        return page.pageName === SUB_PAGE_NAMES.CONFIRMATION;
    });
    const isResumeStateLoading = isLoadingOnyxValue(privatePersonalDetailsMetadata, personalBankAccountMetadata, fullPersonalBankAccountMetadata, plaidDataMetadata);
    const hasCompletedConnection = isManual ? !!personalBankAccount?.routingNumber && !!personalBankAccount?.accountNumber : hasCompletedPlaidConnection;
    const draftStartFrom = hasCompletedConnection && firstIncompletePageIndex > 0 ? firstIncompletePageIndex : Math.max(setupPageIndex, 0);
    let startFrom = 0;
    if (isResumeStateLoading) {
        startFrom = -1;
    } else if (fullPersonalBankAccount?.source === CONST.BANK_ACCOUNT.SOURCE.WALLET) {
        startFrom = savedPageIndex >= 0 ? savedPageIndex : draftStartFrom;
    }
    const isURLSubPageValid = !urlSubPage || pages.some((page) => page.pageName === urlSubPage);
    const fallbackPageName = pages.at(startFrom)?.pageName ?? pages.at(0)?.pageName;
    const fallbackRoute = fallbackPageName ? buildRoute(fallbackPageName) : undefined;

    const {CurrentPage, isEditing, nextPage, prevPage, moveTo, pageIndex, currentPageName, isRedirecting} = useSubPage<PersonalBankAccountSubPageProps>({
        pages,
        skipPages,
        startFrom,
        onFinished,
        buildRoute,
    });

    const confirmationIndex = pages.findIndex((page) => page.pageName === SUB_PAGE_NAMES.CONFIRMATION);
    const successIndex = pages.findIndex((page) => page.pageName === SUB_PAGE_NAMES.SUCCESS);

    useEffect(() => {
        if (isResumeStateLoading || !urlSubPage || isURLSubPageValid || !fallbackRoute) {
            return;
        }
        Navigation.navigate(fallbackRoute, {forceReplace: true});
    }, [fallbackRoute, isResumeStateLoading, isURLSubPageValid, urlSubPage]);

    useEffect(() => {
        if (
            fullPersonalBankAccount?.source !== CONST.BANK_ACCOUNT.SOURCE.WALLET ||
            !currentPageName ||
            currentPageName === SUB_PAGE_NAMES.SUCCESS ||
            !pages.some((page) => page.pageName === currentPageName)
        ) {
            return;
        }
        updatePersonalBankAccountCurrentPage(currentPageName);
    }, [currentPageName, fullPersonalBankAccount?.source, pages]);

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
        if (currentPageName === SUB_PAGE_NAMES.SUCCESS) {
            exitFlow();
            return;
        }
        if (isEditing) {
            moveTo(confirmationIndex, false);
            return;
        }
        if (pageIndex === 0) {
            if (fullPersonalBankAccount?.source === CONST.BANK_ACCOUNT.SOURCE.WALLET) {
                clearDraftValues(ONYXKEYS.FORMS.HOME_ADDRESS_FORM);
                clearPersonalBankAccount({source: CONST.BANK_ACCOUNT.SOURCE.WALLET});
            }
            Navigation.goBack();
            return;
        }
        prevPage();
    };

    // Advance to the success step once the bank account has been added successfully. This can resolve while the user
    // has navigated back to an earlier substep, so jump straight to success rather than relying on the current page.
    useEffect(() => {
        if (!shouldShowSuccess || currentPageName === SUB_PAGE_NAMES.SUCCESS) {
            return;
        }
        moveTo(successIndex, false);
    }, [shouldShowSuccess, currentPageName, moveTo, successIndex]);

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

    if (isRedirecting || isResumeStateLoading || !isURLSubPageValid) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <InteractiveStepWrapper
            wrapperID={AddPersonalBankAccountPage.displayName}
            headerTitle={translate('bankAccount.addBankAccount')}
            handleBackButtonPress={handleBackButtonPress}
        >
            <CurrentPage
                isEditing={isEditing}
                onNext={handleNext}
                onMove={moveTo}
                shouldSaveDraft={fullPersonalBankAccount?.source === CONST.BANK_ACCOUNT.SOURCE.WALLET}
            />
        </InteractiveStepWrapper>
    );
}

AddPersonalBankAccountPage.displayName = 'AddPersonalBankAccountPage';

export default AddPersonalBankAccountPage;
