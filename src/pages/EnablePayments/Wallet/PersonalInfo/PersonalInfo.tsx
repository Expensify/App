import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';

import useInitialOnyxValue from '@hooks/useInitialOnyxValue';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';

import getWalletPersonalDetailsParams from '@pages/EnablePayments/shared/getWalletPersonalDetailsParams';
import IdologyQuestions from '@pages/EnablePayments/shared/IdologyQuestions';
import useWalletPhoneValidateCode from '@pages/EnablePayments/shared/useWalletPhoneValidateCode';
import {getBankAccountOwnerDetails, getPersonalInfoStepValues, getSkippedBankAccountOwnerPages} from '@pages/EnablePayments/Wallet/utils/getBankAccountOwnerDetails';
import getInitialSubstepForPersonalInfo from '@pages/EnablePayments/Wallet/utils/getInitialSubstepForPersonalInfo';

import {setAdditionalDetailsQuestions, updateCurrentStep} from '@userActions/Wallet';

import CONST from '@src/CONST';
import type {EnablePaymentsSubPageType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {useMemo} from 'react';

import Address from './substeps/AddressStep';
import Confirmation from './substeps/ConfirmationStep';
import DateOfBirth from './substeps/DateOfBirthStep';
import LegalName from './substeps/LegalNameStep';
import PhoneNumber from './substeps/PhoneNumberStep';
import SocialSecurityNumber from './substeps/SocialSecurityNumberStep';

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
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);

    const showIdologyQuestions = walletAdditionalDetails?.questions && walletAdditionalDetails?.questions.length > 0;

    const {submitPersonalDetails} = useWalletPhoneValidateCode();

    const values = useMemo(
        () => getPersonalInfoStepValues(walletAdditionalDetailsDraft, walletAdditionalDetails, privatePersonalDetails),
        [privatePersonalDetails, walletAdditionalDetails, walletAdditionalDetailsDraft],
    );
    // Snapshot the sources once Onyx has loaded. Filling a page writes the wallet draft immediately, and a live skip
    // list would make Back from the next page skip the page the user just completed.
    const initialWalletAdditionalDetails = useInitialOnyxValue(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);
    const initialWalletAdditionalDetailsDraft = useInitialOnyxValue(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT);
    const initialPrivatePersonalDetails = useInitialOnyxValue(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const skipPages = useMemo(
        () =>
            getSkippedBankAccountOwnerPages(
                getBankAccountOwnerDetails({
                    walletAdditionalDetailsDraft: initialWalletAdditionalDetailsDraft,
                    walletAdditionalDetails: initialWalletAdditionalDetails,
                    privatePersonalDetails: initialPrivatePersonalDetails,
                }),
            ),
        [initialPrivatePersonalDetails, initialWalletAdditionalDetails, initialWalletAdditionalDetailsDraft],
    );

    const submit = () => {
        submitPersonalDetails(getWalletPersonalDetailsParams(values));
    };

    const startFrom = useMemo(() => getInitialSubstepForPersonalInfo(values), [values]);

    const {CurrentPage, isEditing, pageIndex, nextPage, prevPage, moveTo, isRedirecting} = useSubPage<SubPageProps, EnablePaymentsSubPageType>({
        pages: formPages,
        skipPages,
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

        const hasPreviousPage = formPages.slice(0, pageIndex).some((page) => !skipPages.some((skippedPage) => skippedPage === page.pageName));
        if (!hasPreviousPage) {
            // Step back to the Add Bank Account step. pageIndex is not 0 when legal name was skipped and KYC starts at date of birth.
            updateCurrentStep(CONST.WALLET.STEP.ADD_BANK_ACCOUNT);
            return;
        }
        prevPage();
    };

    if (isRedirecting) {
        return <FullScreenLoadingIndicator />;
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
