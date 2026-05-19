import React from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';
import Navigation from '@navigation/Navigation';
import {acceptWalletTerms, clearPersonalBankAccount} from '@userActions/BankAccounts';
import {resetWalletAdditionalDetailsDraft, updateCurrentStep} from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import FeesStep from './substeps/FeesStep';
import TermsStep from './substeps/TermsStep';

const FEES_AND_TERMS_PAGE_NAME = CONST.ENABLE_PAYMENTS.PAGE_NAME.FEES_AND_TERMS;

const termsAndFeesPages = [
    {pageName: FEES_AND_TERMS_PAGE_NAME.FEES, component: FeesStep},
    {pageName: FEES_AND_TERMS_PAGE_NAME.TERMS, component: TermsStep},
];

function FeesAndTerms() {
    const {translate} = useLocalize();
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);

    const submit = () => {
        acceptWalletTerms({
            hasAcceptedTerms: true,
            // eslint-disable-next-line rulesdir/no-default-id-values -- empty string is the expected fallback for acceptWalletTerms
            reportID: walletTerms?.chatReportID ?? '',
        });
        clearPersonalBankAccount();
        resetWalletAdditionalDetailsDraft();
        Navigation.navigate(ROUTES.SETTINGS_WALLET);
    };

    const {CurrentPage, isEditing, pageIndex, nextPage, prevPage, moveTo, isRedirecting} = useSubPage<SubPageProps>({
        pages: termsAndFeesPages,
        startFrom: 0,
        onFinished: submit,
        buildRoute: (pageName, action) => ROUTES.SETTINGS_ENABLE_PAYMENTS.getRoute(pageName, action),
    });

    const handleBackButtonPress = () => {
        if (pageIndex === 0) {
            updateCurrentStep(CONST.WALLET.STEP.ONFIDO);
            return;
        }
        prevPage();
    };

    if (isRedirecting) {
        return <FullScreenLoadingIndicator reasonAttributes={{context: 'EnablePaymentsFeesAndTerms', isRedirecting}} />;
    }

    return (
        <InteractiveStepWrapper
            wrapperID="FeesAndTerms"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('termsStep.headerTitleRefactor')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={3}
            stepNames={CONST.WALLET.STEP_NAMES}
        >
            <CurrentPage
                isEditing={isEditing}
                onNext={nextPage}
                onMove={moveTo}
            />
        </InteractiveStepWrapper>
    );
}

export default FeesAndTerms;
