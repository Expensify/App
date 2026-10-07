import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOpenReport from '@hooks/useOpenReport';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';

import {getLatestErrorMessage} from '@libs/ErrorUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {formatE164PhoneNumber} from '@libs/LoginUtils';
import getActiveTabName from '@libs/Navigation/helpers/getActiveTabName';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import {getCurrentAddress, getStreetLines} from '@libs/PersonalDetailsUtils';

import Navigation, {navigationRef} from '@navigation/Navigation';

import {addPersonalBankAccount, clearPersonalBankAccount} from '@userActions/BankAccounts';
import {setDraftValues} from '@userActions/FormActions';
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
import ValidateCode from './substeps/ValidateCodeStep';
import getSkippedStepsPersonalInfo from './utils/getSkippedStepsPersonalInfo';

const SUB_PAGE_NAMES = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES;

const infoPages = [
    {pageName: SUB_PAGE_NAMES.LEGAL_NAME, component: LegalName},
    {pageName: SUB_PAGE_NAMES.ADDRESS, component: Address},
    {pageName: SUB_PAGE_NAMES.PHONE_NUMBER, component: PhoneNumber},
    {pageName: SUB_PAGE_NAMES.CONFIRMATION, component: Confirmation},
    {pageName: SUB_PAGE_NAMES.VALIDATE_CODE, component: ValidateCode},
    {pageName: SUB_PAGE_NAMES.SUCCESS, component: Success},
];
const pagesWithPlaid = [{pageName: SUB_PAGE_NAMES.PLAID_BANK_ACCOUNT, component: PlaidBankAccount}, ...infoPages];
const pagesWithManualSetup = [
    {
        pageName: SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS,
        component: ManualBankAccountDetails,
    },
    ...infoPages,
];

const DEFAULT_OBJECT = {};
const ACCOUNT_OWNERSHIP_ERROR_SUBSTRING = 'account ownership';

// The fields addPersonalBankAccount saves to the user's private personal details
const PERSONAL_DETAILS_FIELDS = ['legalFirstName', 'legalLastName', 'addressStreet', 'addressStreet2', 'addressCity', 'addressState', 'addressZipCode', 'country', 'phoneNumber'] as const;

function AddPersonalBankAccountPage() {
    const {translate} = useLocalize();
    const route = useRoute();
    const urlSubPage = (route.params as {subPage?: string} | undefined)?.subPage;

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [personalBankAccount] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [fullPersonalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const isManual = personalBankAccount?.setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL || urlSubPage === SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS;
    const error = getLatestErrorMessage(fullPersonalBankAccount ?? DEFAULT_OBJECT);
    const hasRefreshedExitReport = useRef(false);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);

    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA);
    const kycWallRef = useContext(KYCWallContext);

    const shouldShowSuccess = fullPersonalBankAccount?.shouldShowSuccess ?? false;
    const exitReportID = fullPersonalBankAccount?.exitReportID;
    const [hasExitReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(exitReportID)}`, {selector: Boolean});
    const openReport = useOpenReport();

    const exit = () => {
        const topmostFullScreenRoute = navigationRef.current?.getRootState()?.routes.findLast((rootRoute) => isFullScreenName(rootRoute.name));
        const activeTab = getActiveTabName(topmostFullScreenRoute);
        switch (activeTab) {
            case NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR:
                Navigation.goBack(ROUTES.SETTINGS_WALLET);
                break;
            case SCREENS.HOME:
            case NAVIGATORS.REPORTS_SPLIT_NAVIGATOR:
            case NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR:
                Navigation.closeRHPFlow();
                break;
            default:
                Navigation.goBack();
                break;
        }
    };

    const exitFlow = (shouldContinue = false) => {
        const onSuccessFallbackRoute = fullPersonalBankAccount?.onSuccessFallbackRoute ?? '';

        if (shouldContinue && onSuccessFallbackRoute) {
            continueSetup(kycWallRef, onSuccessFallbackRoute);
        } else {
            exit();
        }
        // Clear the flow's scratch state on every real exit path. The flow no longer clears on unmount.
        clearPersonalBankAccount();
    };

    const getAccountData = () => {
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
        // Compare against the values exactly as saved, without the fallbacks and formatting applied above, so that anything the backend treats as a change also asks for the magic
        // code here. At worst this asks for a code the backend wouldn't need, such as when a saved phone number isn't in E.164 format.
        const savedPersonalDetails = {
            legalFirstName: privatePersonalDetails?.legalFirstName,
            legalLastName: privatePersonalDetails?.legalLastName,
            addressStreet,
            addressStreet2: street2,
            addressCity: currentAddress?.city,
            addressState: currentAddress?.state,
            addressZipCode: currentAddress?.zip,
            country: currentAddress?.country,
            phoneNumber: privatePersonalDetails?.phoneNumber,
        };
        const hasPersonalDetailsChanges = PERSONAL_DETAILS_FIELDS.some((field) => (accountData[field] ?? '') !== (savedPersonalDetails[field] ?? ''));
        return {accountData, hasPersonalDetailsChanges};
    };

    const submitBankAccountForm = (validateCode?: string) => {
        addPersonalBankAccount(getAccountData().accountData, personalPolicyID, undefined, undefined, undefined, validateCode);
    };

    const pages = isManual ? pagesWithManualSetup : pagesWithPlaid;
    const skipPages = getSkippedStepsPersonalInfo(privatePersonalDetails)
        .map((index) => pages.at(index)?.pageName)
        .filter((pageName): pageName is NonNullable<typeof pageName> => !!pageName);

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
    const successIndex = pages.findIndex((page) => page.pageName === SUB_PAGE_NAMES.SUCCESS);

    const handleNext = (data?: unknown) => {
        // Submitting a details step may change what the user confirmed after an account ownership error, so they need to confirm again
        if (currentPageName !== SUB_PAGE_NAMES.CONFIRMATION && currentPageName !== SUB_PAGE_NAMES.VALIDATE_CODE) {
            setDraftValues(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM, {confirmedOwnershipDetails: null});
        }

        // When editing a field from the confirmation step, jump straight back to it.
        if (isEditing) {
            moveTo(confirmationIndex, false);
            return;
        }
        // On the confirmation step we submit the bank account first; the success step is
        // only shown once the request succeeds (see the effect below).
        // Saving a changed name, address, or phone number to the user's private personal details requires a magic code, as it does from Profile > Private.
        if (currentPageName === SUB_PAGE_NAMES.CONFIRMATION) {
            if (getAccountData().hasPersonalDetailsChanges) {
                nextPage();
                return;
            }
            submitBankAccountForm();
            return;
        }
        if (currentPageName === SUB_PAGE_NAMES.VALIDATE_CODE) {
            if (typeof data === 'string') {
                submitBankAccountForm(data);
            }
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

    // Refresh the report the flow was opened from once the account is added, since that changes its server-owned fields.
    // Doing it here instead of on exit covers every way of closing the flow. The report may not be on screen, so don't mark it as read.
    useEffect(() => {
        if (!shouldShowSuccess || !exitReportID || currentPageName !== SUB_PAGE_NAMES.SUCCESS || hasRefreshedExitReport.current) {
            return;
        }
        hasRefreshedExitReport.current = true;
        openReport({
            reportID: exitReportID,
            hasReportActions: hasExitReportActions,
            shouldMarkAsRead: false,
        });
    }, [shouldShowSuccess, exitReportID, currentPageName, openReport, hasExitReportActions]);

    // Once the backend reports an account ownership mismatch, the next submission confirms the details as entered. Each substep is a separate screen, and the magic code step clears
    // the error when the user types or goes back, so the confirmation is kept in the form draft, where every substep and later retry reads it.
    useEffect(() => {
        if (!error?.includes(ACCOUNT_OWNERSHIP_ERROR_SUBSTRING)) {
            return;
        }
        setDraftValues(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM, {confirmedOwnershipDetails: true});
    }, [error]);

    if (isRedirecting) {
        return <FullScreenLoadingIndicator />;
    }

    // The magic code page renders its own screen and header
    if (currentPageName === SUB_PAGE_NAMES.VALIDATE_CODE) {
        return (
            <CurrentPage
                isEditing={isEditing}
                onNext={handleNext}
                onMove={moveTo}
                prevPage={prevPage}
            />
        );
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
            />
        </InteractiveStepWrapper>
    );
}

AddPersonalBankAccountPage.displayName = 'AddPersonalBankAccountPage';

export default AddPersonalBankAccountPage;
