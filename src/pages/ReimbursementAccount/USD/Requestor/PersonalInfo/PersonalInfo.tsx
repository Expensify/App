import type {ForwardedRef} from 'react';
import React, {useCallback, useMemo} from 'react';
import type {View} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountSubmit from '@hooks/useReimbursementAccountSubmit';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';
import Navigation from '@libs/Navigation/Navigation';
import {getBankAccountIDAsNumber} from '@libs/ReimbursementAccountUtils';
import getInitialSubStepForPersonalInfo from '@pages/ReimbursementAccount/USD/utils/getInitialSubStepForPersonalInfo';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import {updatePersonalInformationForBankAccount} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import Address from './subSteps/Address';
import Confirmation from './subSteps/Confirmation';
import DateOfBirth from './subSteps/DateOfBirth';
import FullName from './subSteps/FullName';
import SocialSecurityNumber from './subSteps/SocialSecurityNumber';

type PersonalInfoProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** Handles submit button press (URL-based navigation) */
    onSubmit?: () => void;

    /** Reference to the outer element */
    ref?: ForwardedRef<View>;

    /** Back to URL for preserving navigation context */
    backTo?: string;
};

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;
const PAGE_NAMES = CONST.BANK_ACCOUNT.PAGE_NAMES;
const SUB_PAGE_NAMES = CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.SUB_PAGE_NAMES;

const pages = [
    {pageName: SUB_PAGE_NAMES.FULL_NAME, component: FullName},
    {pageName: SUB_PAGE_NAMES.DATE_OF_BIRTH, component: DateOfBirth},
    {pageName: SUB_PAGE_NAMES.SSN, component: SocialSecurityNumber},
    {pageName: SUB_PAGE_NAMES.ADDRESS, component: Address},
    {pageName: SUB_PAGE_NAMES.CONFIRMATION, component: Confirmation},
];

function PersonalInfo({onBackButtonPress, onSubmit, ref, backTo}: PersonalInfoProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const policyID = reimbursementAccount?.achData?.policyID;
    const values = useMemo(() => getSubStepValues(PERSONAL_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const bankAccountID = getBankAccountIDAsNumber(reimbursementAccount?.achData);
    const markSubmitting = useReimbursementAccountSubmit(onSubmit);
    const submit = useCallback(
        (isConfirmPage: boolean) => {
            updatePersonalInformationForBankAccount(bankAccountID, {...values}, policyID, isConfirmPage);
        },
        [values, bankAccountID, policyID],
    );
    const isBankAccountVerifying = reimbursementAccount?.achData?.state === CONST.BANK_ACCOUNT.STATE.VERIFYING;
    const startFrom = useMemo(() => (isBankAccountVerifying ? 0 : getInitialSubStepForPersonalInfo(values)), [values, isBankAccountVerifying]);

    const buildRoute = useCallback(
        (pageName: string, action?: 'edit') => ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, page: PAGE_NAMES.REQUESTOR, subPage: pageName, action, backTo}),
        [policyID, backTo],
    );

    const {CurrentPage, isEditing, currentPageName, pageIndex, nextPage, prevPage, moveTo, isRedirecting} = useSubPage<SubPageProps>({
        pages,
        startFrom,
        onFinished: () => {
            submit(true);
            markSubmitting();
        },
        onPageChange: () => submit(false),
        buildRoute,
    });

    const handleBackButtonPress = () => {
        if (isEditing) {
            Navigation.goBack(buildRoute(SUB_PAGE_NAMES.CONFIRMATION));
            return;
        }

        if (pageIndex === 0) {
            onBackButtonPress();
        } else {
            prevPage();
        }
    };

    return (
        <InteractiveStepWrapper
            ref={ref}
            wrapperID="PersonalInfo"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('personalInfoStep.personalInfo')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={2}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
        >
            {isRedirecting ? (
                <FullScreenLoadingIndicator reasonAttributes={{context: 'PersonalInfo', isRedirecting}} />
            ) : (
                <CurrentPage
                    isEditing={isEditing}
                    onNext={nextPage}
                    onMove={moveTo}
                    currentPageName={currentPageName}
                />
            )}
        </InteractiveStepWrapper>
    );
}

export default PersonalInfo;
