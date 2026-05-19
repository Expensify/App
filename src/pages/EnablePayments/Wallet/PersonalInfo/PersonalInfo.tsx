import React, {useEffect, useMemo} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';
import {clearPersonalBankAccount} from '@libs/actions/BankAccounts';
import Navigation from '@libs/Navigation/Navigation';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import IdologyQuestions from '@pages/EnablePayments/shared/IdologyQuestions';
import getInitialSubstepForPersonalInfo from '@pages/EnablePayments/Wallet/utils/getInitialSubstepForPersonalInfo';
import getSubstepValues from '@pages/EnablePayments/Wallet/utils/getSubstepValues';
import {setAdditionalDetailsQuestions, updatePersonalDetails} from '@userActions/Wallet';
import CONST from '@src/CONST';
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
const PERSONAL_INFO_PAGE_NAME = CONST.ENABLE_PAYMENTS.PAGE_NAME.PERSONAL_INFO;

const formPages = [
    {pageName: PERSONAL_INFO_PAGE_NAME.LEGAL_NAME, component: LegalName},
    {pageName: PERSONAL_INFO_PAGE_NAME.DATE_OF_BIRTH, component: DateOfBirth},
    {pageName: PERSONAL_INFO_PAGE_NAME.ADDRESS, component: Address},
    {pageName: PERSONAL_INFO_PAGE_NAME.PHONE_NUMBER, component: PhoneNumber},
    {pageName: PERSONAL_INFO_PAGE_NAME.SSN, component: SocialSecurityNumber},
    {pageName: PERSONAL_INFO_PAGE_NAME.CONFIRMATION, component: Confirmation},
];

function PersonalInfoPage() {
    const {translate} = useLocalize();

    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);
    const [walletAdditionalDetailsDraft] = useOnyx(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT);

    useEffect(() => {
        // if we're at this step, then we have already added a bank account so we need to clear ONYX keys for the bank account
        clearPersonalBankAccount();
    }, []);

    const showIdologyQuestions = walletAdditionalDetails?.questions && walletAdditionalDetails?.questions.length > 0;

    const values = useMemo(() => getSubstepValues(PERSONAL_INFO_STEP_KEYS, walletAdditionalDetailsDraft, walletAdditionalDetails), [walletAdditionalDetails, walletAdditionalDetailsDraft]);
    const submit = () => {
        const personalDetails = {
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
        // Attempt to set the personal details
        updatePersonalDetails(personalDetails);
    };

    const startFrom = useMemo(() => getInitialSubstepForPersonalInfo(values), [values]);

    const {CurrentPage, isEditing, nextPage, prevPage, moveTo, pageIndex, isRedirecting} = useSubPage<SubPageProps>({
        pages: formPages,
        startFrom,
        onFinished: submit,
        buildRoute: (pageName, action) => ROUTES.SETTINGS_ENABLE_PAYMENTS.getRoute(pageName, action),
    });

    const handleBackButtonPress = () => {
        if (isEditing) {
            moveTo(formPages.length - 1, false);
            return;
        }
        if (pageIndex === 0) {
            Navigation.goBack(ROUTES.SETTINGS_WALLET);
            return;
        }
        if (showIdologyQuestions) {
            setAdditionalDetailsQuestions(null, '');
            return;
        }
        prevPage();
    };

    if (isRedirecting) {
        return <FullScreenLoadingIndicator reasonAttributes={{context: 'EnablePaymentsPersonalInfo', isRedirecting}} />;
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
