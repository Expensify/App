import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';
import {delegateEmailSelector} from '@src/selectors/Account';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';
import type {Beta, BillingGraceEndPeriod, IntroSelected, Policy, ReportNextStepDeprecated} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import React, {createContext, useContext} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLastWorkspaceNumber from './useLastWorkspaceNumber';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

type PaymentContextValue = {
    currentUserAccountID: number;
    currentUserLogin: string | undefined;
    email: string | undefined;
    localCurrencyCode: string | undefined;
    introSelected: OnyxEntry<IntroSelected>;
    betas: OnyxEntry<Beta[]>;
    isSelfTourViewed: boolean;
    userBillingGracePeriodEnds: OnyxCollection<BillingGraceEndPeriod>;
    amountOwed: OnyxEntry<number>;
    ownerBillingGracePeriodEnd: OnyxEntry<number>;
    activePolicyID: string | undefined;
    activePolicy: OnyxEntry<Policy>;
    conciergeReportID: string | undefined;
    defaultWorkspaceName: string;
    delegateEmail: string | undefined;
};

type ReportPaymentContextValue = PaymentContextValue & {
    nextStep: OnyxEntry<ReportNextStepDeprecated>;
    chatReportPolicy: OnyxEntry<Policy>;
};

type UseReportPaymentContextParams = {
    reportID: string | undefined;
    chatReportPolicyID: string | undefined;
};

const PaymentContext = createContext<PaymentContextValue | undefined>(undefined);

/**
 * Fetches shared Onyx data used by payInvoice and payMoneyRequest.
 * Mount PaymentContextProvider once at the Search page level so list rows and bulk actions do not each subscribe to the same keys.
 */
function usePaymentContextValues(): PaymentContextValue {
    const {translate} = useLocalize();
    const {login: currentUserLogin, accountID: currentUserAccountID, email, localCurrencyCode} = useCurrentUserPersonalDetails();
    const lastWorkspaceNumber = useLastWorkspaceNumber();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const activePolicy = usePolicy(activePolicyID);

    const defaultWorkspaceName = generateDefaultWorkspaceName(email ?? '', lastWorkspaceNumber, translate);

    return {
        currentUserAccountID,
        currentUserLogin,
        email,
        localCurrencyCode,
        introSelected,
        betas,
        isSelfTourViewed,
        userBillingGracePeriodEnds,
        amountOwed,
        ownerBillingGracePeriodEnd,
        activePolicyID,
        activePolicy,
        conciergeReportID,
        defaultWorkspaceName,
        delegateEmail,
    };
}

function PaymentContextProvider({children}: {children: React.ReactNode}) {
    const paymentContext = usePaymentContextValues();

    return <PaymentContext.Provider value={paymentContext}>{children}</PaymentContext.Provider>;
}

function usePaymentContext(): PaymentContextValue {
    const context = useContext(PaymentContext);
    if (!context) {
        throw new Error('usePaymentContext must be used within a PaymentContextProvider');
    }
    return context;
}

function useReportPaymentContext({reportID, chatReportPolicyID}: UseReportPaymentContextParams): ReportPaymentContextValue {
    const paymentContext = usePaymentContext();
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(reportID)}`);
    const chatReportPolicy = usePolicy(chatReportPolicyID);

    return {
        ...paymentContext,
        nextStep,
        chatReportPolicy,
    };
}

export default usePaymentContext;
export {PaymentContextProvider, useReportPaymentContext};
