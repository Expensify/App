import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOpenReport from '@hooks/useOpenReport';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';

import {getLatestErrorMessage} from '@libs/ErrorUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {formatE164PhoneNumber} from '@libs/LoginUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getActiveTabName from '@libs/Navigation/helpers/getActiveTabName';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import {getCurrentAddress, getStreetLines} from '@libs/PersonalDetailsUtils';

import Navigation, {navigationRef} from '@navigation/Navigation';

import {addPersonalBankAccount, clearPersonalBankAccount, clearPersonalBankAccountErrors} from '@userActions/BankAccounts';
import {setDraftValues} from '@userActions/FormActions';
import {continueSetup} from '@userActions/PaymentMethods';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {fullPolicySnapshotLastModifiedSelector} from '@selectors/Policy';
import {getReportPolicyID} from '@selectors/Report';
import React, {useContext, useEffect, useEffectEvent, useRef} from 'react';

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
const pagesWithManualSetup = [{pageName: SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS, component: ManualBankAccountDetails}, ...infoPages];

const DEFAULT_OBJECT = {};
const ACCOUNT_OWNERSHIP_ERROR_SUBSTRING = 'account ownership';

// The backend's errors for a wrong magic code and for too many wrong magic codes
const VALIDATE_CODE_ERROR_SUBSTRINGS = ['magic code', 'failed attempts'];

function AddPersonalBankAccountPage() {
    const {translate} = useLocalize();
    const route = useRoute();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const urlSubPage = (route.params as {subPage?: string} | undefined)?.subPage;
    const isOpenedFromWalletFlow = route.name === SCREENS.SETTINGS.DYNAMIC_ADD_US_BANK_ACCOUNT;
    const basePath = useDynamicBackPath(DYNAMIC_ROUTES.ADD_US_BANK_ACCOUNT.path, isOpenedFromWalletFlow);

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [personalBankAccount] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [fullPersonalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const isManual = personalBankAccount?.setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL || urlSubPage === SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS;
    const error = getLatestErrorMessage(fullPersonalBankAccount ?? DEFAULT_OBJECT);
    const hasRefreshedExitReport = useRef(false);

    // Each substep is a separate screen, so on the magic code screen this tracks whether a code was submitted from it
    const hasSubmittedValidateCode = useRef(false);

    // Whether this substep moved the flow on to the success step, and whether it was out of focus once the bank account was added, like under the success step
    const hasMovedToSuccess = useRef(false);
    const wasUnfocusedAfterSuccess = useRef(false);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);

    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA);
    const kycWallRef = useContext(KYCWallContext);

    const shouldShowSuccess = fullPersonalBankAccount?.shouldShowSuccess ?? false;
    const exitReportID = fullPersonalBankAccount?.exitReportID;
    const [hasExitReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(exitReportID)}`, {selector: Boolean});
    const [exitReportPolicyID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(exitReportID)}`, {selector: getReportPolicyID});
    const [exitReportFullPolicySnapshotLastModified] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_FULL_POLICY_SNAPSHOT}${getNonEmptyStringOnyxID(exitReportPolicyID)}`, {
        selector: fullPolicySnapshotLastModifiedSelector,
    });
    const openReport = useOpenReport();

    const phoneNumber = formatE164PhoneNumber(personalBankAccount?.phoneNumber ?? privatePersonalDetails?.phoneNumber ?? '', countryCode);

    // Saving a changed phone number to the user's private personal details requires a magic code, because it is used to verify Expensify Card transactions. The backend compares
    // the submitted phone number with the saved one as stored, so a saved phone number that isn't in E.164 format is replaced by the formatted one and needs a code too.
    const hasPhoneNumberChange = (phoneNumber ?? '') !== (privatePersonalDetails?.phoneNumber ?? '');

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
        // When the Address substep is skipped (the profile already has a complete address), the flat
        // addressStreet/addressCity/... keys that addPersonalBankAccount expects are never written to the form draft.
        // Map the saved profile address (stored nested in the addresses array) to those flat keys so the address
        // is still submitted. The form draft spread below wins, so a manually entered address still takes precedence.
        const currentAddress = getCurrentAddress(privatePersonalDetails);
        const [addressStreet, street2] = getStreetLines(currentAddress?.street);
        // The unit/suite may be stored either embedded after a newline in `street` (extracted above) or in the
        // separate `street2`/`addressLine2` fields; fall back to those so it isn't dropped, matching UpdatePersonalBankAccountPage.
        const addressStreet2 = street2 ?? currentAddress?.street2 ?? currentAddress?.addressLine2;
        return {
            ...privatePersonalDetails,
            addressStreet,
            addressStreet2,
            addressCity: currentAddress?.city,
            addressState: currentAddress?.state,
            addressZipCode: currentAddress?.zip,
            country: currentAddress?.country,
            ...personalBankAccount,
            ...bankAccountWithToken,
            phoneNumber,
        };
    };

    const pages = isManual ? pagesWithManualSetup : pagesWithPlaid;
    const skipPages = getSkippedStepsPersonalInfo(privatePersonalDetails)
        .map((index) => pages.at(index)?.pageName)
        .filter((pageName): pageName is NonNullable<typeof pageName> => !!pageName);

    const buildRoute = (pageName: string, action?: 'edit') =>
        isOpenedFromWalletFlow ? createDynamicRoute(DYNAMIC_ROUTES.ADD_US_BANK_ACCOUNT.getRoute(pageName, action), basePath) : ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(pageName, action);
    const onFinished = (data?: unknown) => exitFlow(!!data);

    const {CurrentPage, isEditing, nextPage, prevPage, moveTo, pageIndex, currentPageName, isRedirecting} = useSubPage<SubPageProps>({
        pages,
        skipPages,
        onFinished,
        buildRoute,
    });

    const confirmationIndex = pages.findIndex((page) => page.pageName === SUB_PAGE_NAMES.CONFIRMATION);
    const successIndex = pages.findIndex((page) => page.pageName === SUB_PAGE_NAMES.SUCCESS);
    const successRoute = buildRoute(SUB_PAGE_NAMES.SUCCESS);
    const isDetailsStep = currentPageName !== SUB_PAGE_NAMES.CONFIRMATION && currentPageName !== SUB_PAGE_NAMES.VALIDATE_CODE && currentPageName !== SUB_PAGE_NAMES.SUCCESS;

    const handleNext = (data?: unknown) => {
        // Submitting a details step may change what the user confirmed after an account ownership error, so they need to confirm again
        if (isDetailsStep) {
            setDraftValues(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM, {confirmedOwnershipDetails: null});
        }

        // When editing a field from the confirmation step, jump straight back to it.
        if (isEditing) {
            moveTo(confirmationIndex, false);
            return;
        }
        // On the confirmation step we submit the bank account first; the success step is
        // only shown once the request succeeds (see the effect below).
        if (currentPageName === SUB_PAGE_NAMES.CONFIRMATION) {
            if (hasPhoneNumberChange) {
                // The error belongs to the previous submission, so the magic code page doesn't show it
                clearPersonalBankAccountErrors();
                nextPage();
                return;
            }
            addPersonalBankAccount(getAccountData(), personalPolicyID);
            return;
        }
        if (currentPageName === SUB_PAGE_NAMES.VALIDATE_CODE) {
            if (typeof data === 'string') {
                hasSubmittedValidateCode.current = true;
                addPersonalBankAccount(getAccountData(), personalPolicyID, {validateCode: data});
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

    const moveToSuccess = useEffectEvent(() => {
        // Replace the magic code step, so going back from success lands on the confirmation step instead of a code form that would send another magic code
        if (currentPageName === SUB_PAGE_NAMES.VALIDATE_CODE) {
            Navigation.navigate(successRoute, {forceReplace: true});
            return;
        }
        moveTo(successIndex, false);
    });
    const leaveFlow = useEffectEvent(() => exitFlow());

    // Advance to the success step once the bank account has been added successfully. This can resolve while the user has navigated back to an earlier substep, so jump straight to
    // success rather than relying on the current page. Every substep the user passed through stays mounted under the one on top of the flow, so only that one moves on, even while
    // another screen covers the flow, so the success step is there when the user closes it.
    // A substep that comes back into focus after the bank account was added is one the user went back to from the success step. The bank account is already added, so that leaves
    // the flow, like the success step's back button.
    useEffect(() => {
        if (!shouldShowSuccess || currentPageName === SUB_PAGE_NAMES.SUCCESS) {
            return;
        }
        if (!isFocused) {
            wasUnfocusedAfterSuccess.current = true;
        } else if (wasUnfocusedAfterSuccess.current) {
            wasUnfocusedAfterSuccess.current = false;
            leaveFlow();
            return;
        }

        // Other screens can share this flow's stack, like keyboard shortcuts in the Settings stack, so compare against the flow's own topmost substep
        const isTopmostSubstep = navigation.getState()?.routes.findLast((stackRoute) => stackRoute.name === route.name)?.key === route.key;
        if (hasMovedToSuccess.current || !isTopmostSubstep) {
            return;
        }
        hasMovedToSuccess.current = true;
        moveToSuccess();
    }, [shouldShowSuccess, currentPageName, isFocused, navigation, route.name, route.key]);

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
            fullPolicySnapshot:
                exitReportPolicyID && exitReportFullPolicySnapshotLastModified ? {policyID: exitReportPolicyID, lastModified: exitReportFullPolicySnapshotLastModified} : undefined,
        });
    }, [shouldShowSuccess, exitReportID, currentPageName, openReport, hasExitReportActions, exitReportPolicyID, exitReportFullPolicySnapshotLastModified]);

    // Once the user sees an account ownership mismatch on the confirmation step, the next submission confirms the details shown there. Each substep is a separate screen, and the
    // error is cleared before the magic code step, so the confirmation is kept in the form draft, where every substep and later retry reads it. An error that arrives while a details
    // step is focused is cleared there unseen, so it confirms nothing, and the next submission gets it again on the confirmation step.
    // The magic code page doesn't show the details being confirmed, so a code submitted from it that gets this error sends the user back to the confirmation step, which shows them
    // next to the error. An error already there when the page opens is from an earlier submission and is being cleared.
    useEffect(() => {
        if (!isFocused || !error?.includes(ACCOUNT_OWNERSHIP_ERROR_SUBSTRING)) {
            return;
        }
        if (currentPageName === SUB_PAGE_NAMES.CONFIRMATION) {
            setDraftValues(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM, {confirmedOwnershipDetails: true});
            return;
        }
        if (currentPageName !== SUB_PAGE_NAMES.VALIDATE_CODE || !hasSubmittedValidateCode.current) {
            return;
        }
        hasSubmittedValidateCode.current = false;
        prevPage();
    }, [isFocused, error, currentPageName, prevPage]);

    // The submission error is about the details being confirmed, so only the confirmation and magic code steps show it, and a magic code error only the magic code step. The details
    // steps are forms on the same Onyx key, and a form with a server error shows it and won't submit. So the error is cleared once the user is on a step that doesn't show it, however
    // they navigated there. An account ownership error the user saw on the confirmation step is already kept as a confirmation in the form draft by the effect above.
    // A magic code error can only come from a submission with a code, and there is a magic code step only when the phone number changes.
    useEffect(() => {
        if (!isFocused || !error) {
            return;
        }
        const isValidateCodeError = hasPhoneNumberChange && VALIDATE_CODE_ERROR_SUBSTRINGS.some((substring) => error.includes(substring));
        if (!isDetailsStep && !(currentPageName === SUB_PAGE_NAMES.CONFIRMATION && isValidateCodeError)) {
            return;
        }
        clearPersonalBankAccountErrors();
    }, [isFocused, isDetailsStep, currentPageName, error, hasPhoneNumberChange]);

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
