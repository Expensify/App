import React, {useEffect, useMemo, useRef, useState} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';
import type {UpdatePersonalDetailsForWalletParams} from '@libs/API/parameters';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import IdologyQuestions from '@pages/EnablePayments/shared/IdologyQuestions';
import getInitialSubstepForPersonalInfo from '@pages/EnablePayments/Wallet/utils/getInitialSubstepForPersonalInfo';
import getSubstepValues from '@pages/EnablePayments/Wallet/utils/getSubstepValues';
import {requestValidateCodeAction} from '@userActions/User';
import {clearWalletAdditionalDetailsErrors, setAdditionalDetailsQuestions, updateCurrentStep, updatePersonalDetails} from '@userActions/Wallet';
import CONST from '@src/CONST';
import type {EnablePaymentsSubPageType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';
import Address from './substeps/AddressStep';
import Confirmation from './substeps/ConfirmationStep';
import DateOfBirth from './substeps/DateOfBirthStep';
import LegalName from './substeps/LegalNameStep';
import PhoneNumber from './substeps/PhoneNumberStep';
import SocialSecurityNumber from './substeps/SocialSecurityNumberStep';

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;
const PERSONAL_INFO_SUB_PAGES = CONST.ENABLE_PAYMENTS.PERSONAL_INFO_STEP.SUB_PAGE_NAMES;

const formPages = [
    {pageName: PERSONAL_INFO_SUB_PAGES.LEGAL_NAME, component: LegalName},
    {pageName: PERSONAL_INFO_SUB_PAGES.DATE_OF_BIRTH, component: DateOfBirth},
    {pageName: PERSONAL_INFO_SUB_PAGES.ADDRESS, component: Address},
    {pageName: PERSONAL_INFO_SUB_PAGES.PHONE_NUMBER, component: PhoneNumber},
    {pageName: PERSONAL_INFO_SUB_PAGES.SSN, component: SocialSecurityNumber},
    {pageName: PERSONAL_INFO_SUB_PAGES.CONFIRMATION, component: Confirmation},
];

function PersonalInfoPage() {
    const {translate} = useLocalize();

    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);
    const [walletAdditionalDetailsDraft] = useOnyx(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT);
    const [formData] = useOnyx(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const primaryLogin = usePrimaryContactMethod();

    const showIdologyQuestions = walletAdditionalDetails?.questions && walletAdditionalDetails?.questions.length > 0;

    // The details the user submitted, held while we prompt for a magic code to confirm a phone number change
    const submittedPersonalDetailsRef = useRef<UpdatePersonalDetailsForWalletParams | null>(null);
    const [isConfirmingMagicCode, setIsConfirmingMagicCode] = useState(false);

    // The backend requires a valid magic code to change an existing phone number. Keep the prompt open if the
    // submitted code was missing or invalid, even when the change wasn't detected client-side.
    const isMagicCodeRequired = isConfirmingMagicCode || walletAdditionalDetails?.errorCode === CONST.WALLET.ERROR.INCORRECT_MAGIC_CODE;

    // Once a submission finishes, keep prompting only if the magic code was missing or invalid; otherwise dismiss the
    // prompt so the flow can advance (e.g. to Onfido or KBA questions).
    const wasSubmittingRef = useRef(false);
    useEffect(() => {
        if (formData?.isLoading) {
            wasSubmittingRef.current = true;
            return;
        }
        if (!wasSubmittingRef.current) {
            return;
        }
        wasSubmittingRef.current = false;
        setIsConfirmingMagicCode(walletAdditionalDetails?.errorCode === CONST.WALLET.ERROR.INCORRECT_MAGIC_CODE);
    }, [formData?.isLoading, walletAdditionalDetails?.errorCode]);

    const values = useMemo(() => getSubstepValues(PERSONAL_INFO_STEP_KEYS, walletAdditionalDetailsDraft, walletAdditionalDetails), [walletAdditionalDetails, walletAdditionalDetailsDraft]);
    const submit = () => {
        const personalDetails: UpdatePersonalDetailsForWalletParams = {
            phoneNumber: (values.phoneNumber && parsePhoneNumber(values.phoneNumber, {regionCode: CONST.COUNTRY.US}).number?.significant) ?? '',
            legalFirstName: values?.[PERSONAL_INFO_STEP_KEYS.FIRST_NAME] ?? '',
            legalLastName: values?.[PERSONAL_INFO_STEP_KEYS.LAST_NAME] ?? '',
            addressStreet: values?.[PERSONAL_INFO_STEP_KEYS.STREET] ?? '',
            addressCity: values?.[PERSONAL_INFO_STEP_KEYS.CITY] ?? '',
            addressState: values?.[PERSONAL_INFO_STEP_KEYS.STATE] ?? '',
            addressZip: values?.[PERSONAL_INFO_STEP_KEYS.ZIP_CODE] ?? '',
            dob: values?.[PERSONAL_INFO_STEP_KEYS.DOB] ?? '',
            ssn: values?.[PERSONAL_INFO_STEP_KEYS.SSN_LAST_4] ?? '',
        };
        submittedPersonalDetailsRef.current = personalDetails;

        // Changing an existing phone number is protected by a magic code because it is used for card 3DS verification.
        // The stored phone number keeps its country code, so normalize it the same way as the submitted one before
        // comparing, otherwise an unchanged phone would look like a change and wrongly prompt for a magic code.
        const storedPhoneNumber = currentUserPersonalDetails.phoneNumber;
        const normalizedStoredPhoneNumber = (storedPhoneNumber && parsePhoneNumber(storedPhoneNumber, {regionCode: CONST.COUNTRY.US}).number?.significant) ?? '';
        const hasPhoneNumberChanged = !!normalizedStoredPhoneNumber && personalDetails.phoneNumber !== normalizedStoredPhoneNumber;
        if (hasPhoneNumberChanged) {
            setIsConfirmingMagicCode(true);
            return;
        }

        // Attempt to set the personal details
        updatePersonalDetails(personalDetails);
    };

    const confirmPersonalDetailsWithMagicCode = (validateCode: string) => {
        if (!submittedPersonalDetailsRef.current) {
            return;
        }
        updatePersonalDetails({...submittedPersonalDetailsRef.current, validateCode});
    };

    const closeMagicCodePrompt = () => {
        setIsConfirmingMagicCode(false);
        clearWalletAdditionalDetailsErrors();
    };

    const startFrom = useMemo(() => getInitialSubstepForPersonalInfo(values), [values]);

    const {CurrentPage, isEditing, pageIndex, nextPage, prevPage, moveTo, isRedirecting} = useSubPage<SubPageProps, EnablePaymentsSubPageType>({
        pages: formPages,
        startFrom,
        onFinished: submit,
        buildRoute: (pageName, action) =>
            ROUTES.SETTINGS_ENABLE_PAYMENTS.getRoute({
                page: CONST.ENABLE_PAYMENTS.PAGE_NAMES.PERSONAL_INFO,
                subPage: pageName,
                action,
            }),
    });

    const handleBackButtonPress = () => {
        if (isEditing) {
            moveTo(formPages.length - 1, false);
            return;
        }

        if (showIdologyQuestions) {
            setAdditionalDetailsQuestions(null, '');
            return;
        }

        if (pageIndex === 0) {
            // Step back to the Add Bank Account step; the URL correction in EnablePaymentsPage navigates there.
            updateCurrentStep(CONST.WALLET.STEP.ADD_BANK_ACCOUNT);
            return;
        }
        prevPage();
    };

    if (isRedirecting) {
        return <FullScreenLoadingIndicator reasonAttributes={{context: 'EnablePaymentsPersonalInfo', isRedirecting}} />;
    }

    if (isMagicCodeRequired) {
        return (
            <ValidateCodeActionContent
                validateCodeActionErrorField="walletPhoneNumber"
                handleSubmitForm={confirmPersonalDetailsWithMagicCode}
                isLoading={formData?.isLoading}
                title={translate('delegate.makeSureItIsYou')}
                descriptionPrimary={translate('contacts.enterMagicCode', primaryLogin ?? '')}
                sendValidateCode={() => requestValidateCodeAction()}
                validateError={getLatestErrorMessageField(walletAdditionalDetails)}
                clearError={clearWalletAdditionalDetailsErrors}
                onClose={closeMagicCodePrompt}
            />
        );
    }

    return (
        <InteractiveStepWrapper
            wrapperID="PersonalInfoPage"
            headerTitle={translate('personalInfoStep.personalInfo')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={1}
            stepNames={CONST.WALLET.STEP_NAMES}
        >
            {showIdologyQuestions ? (
                <IdologyQuestions
                    questions={walletAdditionalDetails?.questions ?? []}
                    idNumber={walletAdditionalDetails?.idNumber ?? ''}
                />
            ) : (
                <CurrentPage
                    isEditing={isEditing}
                    onNext={nextPage}
                    onMove={moveTo}
                />
            )}
        </InteractiveStepWrapper>
    );
}

export default PersonalInfoPage;
