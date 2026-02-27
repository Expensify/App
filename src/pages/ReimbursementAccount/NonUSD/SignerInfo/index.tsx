import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import YesNoStep from '@components/SubStepForms/YesNoStep';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import getInitialSubStepForSignerInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInitialSubStepForSignerInfoStep';
import getSignerDetailsAndSignerFilesForSignerInfo from '@pages/ReimbursementAccount/NonUSD/utils/getSignerDetailsAndSignerFilesForSignerInfo';
import type NonUSDPageProps from '@pages/ReimbursementAccount/NonUSD/types';
import {askForCorpaySignerInformation, clearReimbursementAccountSaveCorpayOnboardingDirectorInformation, saveCorpayOnboardingDirectorInformation} from '@userActions/BankAccounts';
import {clearErrors, setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import EnterEmail from './EnterEmail';
import type {EmailSubmitParams} from './EnterEmail';
import HangTight from './HangTight';
import SignerDetailsFormPages from './SignerDetailsFormPages';

const {PAGE_NAME, SIGNER_INFO_STEP} = CONST.NON_USD_BANK_ACCOUNT;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
const SUBSTEP: Record<string, number> = SIGNER_INFO_STEP.SUBSTEP;
const SUB_PAGE_NAMES = SIGNER_INFO_STEP.SUB_PAGE_NAMES;
const {OWNS_MORE_THAN_25_PERCENT, COMPANY_NAME, SIGNER_EMAIL, SIGNER_FULL_NAME, SECOND_SIGNER_EMAIL} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

function SignerInfo({onBackButtonPress, onSubmit, stepNames, currentSubPage}: NonUSDPageProps) {
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? reimbursementAccountDraft?.currency ?? '';
    const isUserOwner = reimbursementAccount?.achData?.corpay?.[OWNS_MORE_THAN_25_PERCENT] ?? reimbursementAccountDraft?.[OWNS_MORE_THAN_25_PERCENT] ?? false;
    const companyName = reimbursementAccount?.achData?.corpay?.[COMPANY_NAME] ?? reimbursementAccountDraft?.[COMPANY_NAME] ?? '';
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const isUserDirector = reimbursementAccountDraft?.isUserDirector ?? false;
    const shouldSendOnlySecondSignerEmail = currency === CONST.CURRENCY.AUD && isUserDirector;

    const savedSignerEmail = reimbursementAccount?.achData?.corpay?.[SIGNER_EMAIL];
    const savedSignerFullName = reimbursementAccount?.achData?.corpay?.[SIGNER_FULL_NAME];
    const savedSecondSignerEmail = reimbursementAccount?.achData?.corpay?.[SECOND_SIGNER_EMAIL];
    const primaryLogin = account?.primaryLogin ?? '';
    // Corpay does not accept emails with a "+" character and will not let us connect account at the end of whole flow
    const signerEmail = !isProduction ? Str.replaceAll(primaryLogin, '+', '') : primaryLogin;

    const isSubmittingRef = useRef(false);

    const initialSubStep = getInitialSubStepForSignerInfoStep(savedSignerEmail, savedSignerFullName, savedSecondSignerEmail, currency);
    const initialTargetSubPage = initialSubStep === SUBSTEP.HANG_TIGHT ? SUB_PAGE_NAMES.HANG_TIGHT : SUB_PAGE_NAMES.IS_DIRECTOR;
    const shouldRedirect = !currentSubPage;

    useEffect(() => {
        if (!shouldRedirect) {
            return;
        }
        Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.SIGNER_INFO, subPage: initialTargetSubPage}), {forceReplace: true});
    }, [shouldRedirect, policyID, initialTargetSubPage]);

    const submit = useCallback(() => {
        isSubmittingRef.current = true;
        const {signerDetails, signerFiles} = getSignerDetailsAndSignerFilesForSignerInfo(reimbursementAccountDraft, signerEmail, isUserOwner);
        saveCorpayOnboardingDirectorInformation({
            inputs: JSON.stringify(signerDetails),
            ...signerFiles,
            bankAccountID,
        });
    }, [bankAccountID, isUserOwner, reimbursementAccountDraft, signerEmail]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (reimbursementAccount?.errors || reimbursementAccount?.isSavingCorpayOnboardingDirectorInformation || !reimbursementAccount?.isSuccess) {
            return;
        }

        if (reimbursementAccount?.isSuccess && isSubmittingRef.current) {
            isSubmittingRef.current = false;
            if (currency === CONST.CURRENCY.AUD) {
                Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.SIGNER_INFO, subPage: SUB_PAGE_NAMES.ENTER_EMAIL}));
                clearReimbursementAccountSaveCorpayOnboardingDirectorInformation();
                return;
            }
            onSubmit();
            clearReimbursementAccountSaveCorpayOnboardingDirectorInformation();
        }

        return () => {
            clearReimbursementAccountSaveCorpayOnboardingDirectorInformation();
        };
    }, [reimbursementAccount?.errors, reimbursementAccount?.isSavingCorpayOnboardingDirectorInformation, reimbursementAccount?.isSuccess, onSubmit, currency, policyID]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (reimbursementAccount?.errors || reimbursementAccount?.isAskingForCorpaySignerInformation || !reimbursementAccount?.isAskingForCorpaySignerInformationSuccess) {
            return;
        }

        if (reimbursementAccount?.isAskingForCorpaySignerInformationSuccess) {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.SIGNER_INFO, subPage: SUB_PAGE_NAMES.HANG_TIGHT}));
        }
    }, [reimbursementAccount?.errors, reimbursementAccount?.isAskingForCorpaySignerInformation, reimbursementAccount?.isAskingForCorpaySignerInformationSuccess, policyID]);

    const handleEmailSubmit = useCallback(
        (values: EmailSubmitParams) => {
            const params = shouldSendOnlySecondSignerEmail
                ? {
                      secondSignerEmail: values.secondSignerEmail,
                      policyID: String(policyID),
                      bankAccountID,
                  }
                : {
                      signerEmail: values.signerEmail,
                      secondSignerEmail: values.secondSignerEmail,
                      policyID: String(policyID),
                      bankAccountID,
                  };

            askForCorpaySignerInformation(params);
        },
        [bankAccountID, policyID, shouldSendOnlySecondSignerEmail],
    );

    const handleIsDirectorSelected = useCallback(
        (value: boolean) => {
            setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {isUserDirector: value});
            if (value) {
                const firstFormPage = isUserOwner ? SUB_PAGE_NAMES.JOB_TITLE : SUB_PAGE_NAMES.NAME;
                Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.SIGNER_INFO, subPage: firstFormPage}));
            } else {
                Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.SIGNER_INFO, subPage: SUB_PAGE_NAMES.ENTER_EMAIL}));
            }
        },
        [isUserOwner, policyID],
    );

    const handleBackButtonPress = useCallback(() => {
        if (currentSubPage === SUB_PAGE_NAMES.ENTER_EMAIL) {
            clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
            const backSubPage = isUserDirector ? SUB_PAGE_NAMES.CONFIRMATION : SUB_PAGE_NAMES.IS_DIRECTOR;
            Navigation.goBack(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.SIGNER_INFO, subPage: backSubPage}));
        } else if (currentSubPage === SUB_PAGE_NAMES.HANG_TIGHT) {
            Navigation.goBack();
        } else {
            onBackButtonPress();
        }
    }, [currentSubPage, isUserDirector, onBackButtonPress, policyID]);

    const handleBackToIsDirector = useCallback(() => {
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        Navigation.goBack(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.SIGNER_INFO, subPage: SUB_PAGE_NAMES.IS_DIRECTOR}));
    }, [policyID]);

    if (shouldRedirect) {
        return <FullScreenLoadingIndicator />;
    }

    if (currentSubPage !== SUB_PAGE_NAMES.IS_DIRECTOR && currentSubPage !== SUB_PAGE_NAMES.ENTER_EMAIL && currentSubPage !== SUB_PAGE_NAMES.HANG_TIGHT) {
        return (
            <SignerDetailsFormPages
                onBackToIsDirector={handleBackToIsDirector}
                stepNames={stepNames}
                policyID={policyID}
                onFinished={submit}
            />
        );
    }

    return (
        <InteractiveStepWrapper
            wrapperID="SignerInfo"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('signerInfoStep.signerInfo')}
            stepNames={stepNames}
            startStepIndex={4}
        >
            {currentSubPage === SUB_PAGE_NAMES.IS_DIRECTOR && (
                <YesNoStep
                    title={translate('signerInfoStep.areYouDirector', companyName)}
                    description={translate('signerInfoStep.regulationRequiresUs')}
                    defaultValue={isUserDirector}
                    onSelectedValue={handleIsDirectorSelected}
                />
            )}
            {currentSubPage === SUB_PAGE_NAMES.ENTER_EMAIL && (
                <EnterEmail
                    onSubmit={handleEmailSubmit}
                    isUserDirector={isUserDirector}
                    isLoading={reimbursementAccount?.isAskingForCorpaySignerInformation}
                />
            )}
            {currentSubPage === SUB_PAGE_NAMES.HANG_TIGHT && (
                <HangTight
                    policyID={policyID}
                    bankAccountID={bankAccountID}
                />
            )}
        </InteractiveStepWrapper>
    );
}

export default SignerInfo;
