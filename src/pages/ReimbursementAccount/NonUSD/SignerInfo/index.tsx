import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import YesNoStep from '@components/SubStepForms/YesNoStep';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type NonUSDPageProps from '@pages/ReimbursementAccount/NonUSD/types';
import getCurrencyForNonUSDBankAccount from '@pages/ReimbursementAccount/NonUSD/utils/getCurrencyForNonUSDBankAccount';
import getDraftValuesForSignerInfo from '@pages/ReimbursementAccount/NonUSD/utils/getDraftValuesForSignerInfo';
import getSignerDetailsAndSignerFilesForSignerInfo from '@pages/ReimbursementAccount/NonUSD/utils/getSignerDetailsAndSignerFilesForSignerInfo';
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

const SUB_PAGE_NAMES = SIGNER_INFO_STEP.SUB_PAGE_NAMES;
const {OWNS_MORE_THAN_25_PERCENT, COMPANY_NAME, SIGNER_FULL_NAME} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

function SignerInfo({onBackButtonPress, onSubmit, stepNames, currentSubPage, backTo}: NonUSDPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isProduction, environmentURL} = useEnvironment();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const {currency} = getCurrencyForNonUSDBankAccount(policy, reimbursementAccountDraft, reimbursementAccount);
    const isUserOwner = reimbursementAccount?.achData?.corpay?.[OWNS_MORE_THAN_25_PERCENT] ?? reimbursementAccountDraft?.[OWNS_MORE_THAN_25_PERCENT] ?? false;
    const companyName = reimbursementAccount?.achData?.corpay?.[COMPANY_NAME] ?? reimbursementAccountDraft?.[COMPANY_NAME] ?? '';
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const isUserDirector = reimbursementAccountDraft?.isUserDirector ?? false;
    const shouldSendOnlySecondSignerEmail = currency === CONST.CURRENCY.AUD && isUserDirector;
    const [showNoPolicyError, setShowNoPolicyError] = useState(false);

    const primaryLogin = account?.primaryLogin ?? '';
    // Corpay does not accept emails with a "+" character and will not let us connect account at the end of whole flow
    const signerEmail = !isProduction ? Str.replaceAll(primaryLogin, '+', '') : primaryLogin;

    const isSubmittingRef = useRef(false);

    const signerDraftValues = useMemo(() => getDraftValuesForSignerInfo(reimbursementAccount), [reimbursementAccount]);
    const signerFullNameDraft = reimbursementAccountDraft?.[SIGNER_FULL_NAME];

    useEffect(() => {
        if (signerFullNameDraft || !signerDraftValues.isUserDirector) {
            return;
        }
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, signerDraftValues);
    }, [signerFullNameDraft, signerDraftValues]);

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
        if (reimbursementAccount?.errors || reimbursementAccount?.isSavingCorpayOnboardingDirectorInformation || !reimbursementAccount?.isSuccess) {
            return;
        }

        if (reimbursementAccount?.isSuccess && isSubmittingRef.current) {
            isSubmittingRef.current = false;
            if (currency === CONST.CURRENCY.AUD) {
                Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.SIGNER_INFO, subPage: SUB_PAGE_NAMES.ENTER_EMAIL, backTo}));
                clearReimbursementAccountSaveCorpayOnboardingDirectorInformation();
                return;
            }
            onSubmit();
            clearReimbursementAccountSaveCorpayOnboardingDirectorInformation();
        }

        return () => {
            clearReimbursementAccountSaveCorpayOnboardingDirectorInformation();
        };
    }, [reimbursementAccount?.errors, reimbursementAccount?.isSavingCorpayOnboardingDirectorInformation, reimbursementAccount?.isSuccess, onSubmit, currency, policyID, backTo]);

    useEffect(() => {
        if (reimbursementAccount?.errors || reimbursementAccount?.isAskingForCorpaySignerInformation || !reimbursementAccount?.isAskingForCorpaySignerInformationSuccess) {
            return;
        }

        if (reimbursementAccount?.isAskingForCorpaySignerInformationSuccess) {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.SIGNER_INFO, subPage: SUB_PAGE_NAMES.HANG_TIGHT, backTo}));
        }
    }, [reimbursementAccount?.errors, reimbursementAccount?.isAskingForCorpaySignerInformation, reimbursementAccount?.isAskingForCorpaySignerInformationSuccess, policyID, backTo]);

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
            if (!policyID && !value) {
                setShowNoPolicyError(true);
                return;
            }
            setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {isUserDirector: value});
            if (value) {
                const firstFormPage = isUserOwner ? SUB_PAGE_NAMES.JOB_TITLE : SUB_PAGE_NAMES.NAME;
                Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.SIGNER_INFO, subPage: firstFormPage, backTo}));
            } else {
                Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.SIGNER_INFO, subPage: SUB_PAGE_NAMES.ENTER_EMAIL, backTo}));
            }
        },
        [policyID, isUserOwner, backTo],
    );

    const handleBackButtonPress = useCallback(() => {
        if (currentSubPage === SUB_PAGE_NAMES.ENTER_EMAIL) {
            clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
            const backSubPage = isUserDirector ? SUB_PAGE_NAMES.CONFIRMATION : SUB_PAGE_NAMES.IS_DIRECTOR;
            Navigation.goBack(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.SIGNER_INFO, subPage: backSubPage, backTo}));
        } else if (currentSubPage === SUB_PAGE_NAMES.HANG_TIGHT) {
            Navigation.dismissModal();
        } else {
            onBackButtonPress();
        }
    }, [currentSubPage, isUserDirector, onBackButtonPress, policyID, backTo]);

    const handleBackToIsDirector = useCallback(() => {
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        Navigation.goBack(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.SIGNER_INFO, subPage: SUB_PAGE_NAMES.IS_DIRECTOR, backTo}));
    }, [policyID, backTo]);

    if (currentSubPage !== SUB_PAGE_NAMES.IS_DIRECTOR && currentSubPage !== SUB_PAGE_NAMES.ENTER_EMAIL && currentSubPage !== SUB_PAGE_NAMES.HANG_TIGHT) {
        return (
            <SignerDetailsFormPages
                onBackToIsDirector={handleBackToIsDirector}
                stepNames={stepNames}
                policyID={policyID}
                onFinished={submit}
                backTo={backTo}
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
                    onValueChange={() => setShowNoPolicyError(false)}
                    submitFlexEnabled={!showNoPolicyError}
                >
                    {showNoPolicyError && (
                        <View style={[styles.flex1, styles.justifyContentEnd]}>
                            <FormHelpMessage
                                style={styles.mt3}
                                isError
                                shouldRenderMessageAsHTML
                                message={translate('signerInfoStep.error.connectToWorkspace', `${environmentURL}/${ROUTES.WORKSPACES_LIST.getRoute()}`)}
                            />
                        </View>
                    )}
                </YesNoStep>
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
