import React, {useCallback, useMemo} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountSubmit from '@hooks/useReimbursementAccountSubmit';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';
import Navigation from '@libs/Navigation/Navigation';
import {getBankAccountIDAsNumber} from '@libs/ReimbursementAccountUtils';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import {acceptACHContractForBankAccount} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import ConfirmAgreements from './subSteps/ConfirmAgreements';

type CompleteVerificationProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press (URL-based navigation) */
    onSubmit?: () => void;

    /** Back to URL for preserving navigation context */
    backTo?: string;
};

const COMPLETE_VERIFICATION_KEYS = INPUT_IDS.COMPLETE_VERIFICATION;
const PAGE_NAMES = CONST.BANK_ACCOUNT.PAGE_NAMES;
const SUB_PAGE_NAMES = CONST.BANK_ACCOUNT.COMPLETE_VERIFICATION_STEP.SUB_PAGE_NAMES;

const pages = [{pageName: SUB_PAGE_NAMES.CONFIRM_AGREEMENTS, component: ConfirmAgreements}];

function CompleteVerification({onBackButtonPress, onSubmit, backTo}: CompleteVerificationProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);

    const values = useMemo(() => getSubStepValues(COMPLETE_VERIFICATION_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const policyID = reimbursementAccount?.achData?.policyID;
    const bankAccountID = getBankAccountIDAsNumber(reimbursementAccount?.achData);
    const markSubmitting = useReimbursementAccountSubmit(onSubmit);

    const submit = useCallback(() => {
        acceptACHContractForBankAccount(
            bankAccountID,
            {
                isAuthorizedToUseBankAccount: values.isAuthorizedToUseBankAccount,
                certifyTrueInformation: values.certifyTrueInformation,
                acceptTermsAndConditions: values.acceptTermsAndConditions,
            },
            policyID,
            policyID ? lastPaymentMethod?.[policyID] : undefined,
        );
        markSubmitting();
    }, [bankAccountID, values.isAuthorizedToUseBankAccount, values.certifyTrueInformation, values.acceptTermsAndConditions, policyID, lastPaymentMethod, markSubmitting]);

    const buildRoute = useCallback(
        (pageName: string, action?: 'edit') => ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, page: PAGE_NAMES.ACH_CONTRACT, subPage: pageName, action, backTo}),
        [policyID, backTo],
    );

    const {CurrentPage, isEditing, pageIndex, nextPage, prevPage, moveTo} = useSubPage<SubPageProps>({pages, startFrom: 0, onFinished: submit, buildRoute});

    const handleBackButtonPress = () => {
        if (isEditing) {
            Navigation.goBack(buildRoute(SUB_PAGE_NAMES.CONFIRM_AGREEMENTS));
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
            wrapperID="CompleteVerification"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('completeVerificationStep.completeVerification')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={6}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
        >
            <CurrentPage
                isEditing={isEditing}
                onNext={nextPage}
                onMove={moveTo}
            />
        </InteractiveStepWrapper>
    );
}

export default CompleteVerification;
