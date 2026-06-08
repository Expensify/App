import React, {createContext, useContext, useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';
import type {Beta, BillingGraceEndPeriod, IntroSelected, Policy, Report, ReportNextStepDeprecated} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLastWorkspaceNumber from './useLastWorkspaceNumber';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useParticipantsInvoiceReport from './useParticipantsInvoiceReport';
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
};

type ReportPaymentContextValue = PaymentContextValue & {
    nextStep: OnyxEntry<ReportNextStepDeprecated>;
    chatReportPolicy: OnyxEntry<Policy>;
    existingB2BInvoiceReport: OnyxEntry<Report>;
};

type UseReportPaymentContextParams = {
    reportID: string | undefined;
    chatReportPolicyID: string | undefined;
    invoiceReceiverPolicyID?: string | undefined;
};

const PaymentContext = createContext<PaymentContextValue | undefined>(undefined);

/**
 * Fetches shared Onyx data used by payInvoice and payMoneyRequest.
 * Prefer mounting PaymentContextProvider once near the search UI so list rows do not each subscribe to the same keys.
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
    const activePolicy = usePolicy(activePolicyID);

    const defaultWorkspaceName = useMemo(() => generateDefaultWorkspaceName(email ?? '', lastWorkspaceNumber, translate), [email, lastWorkspaceNumber, translate]);

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
    };
}

function PaymentContextProvider({children}: {children: React.ReactNode}) {
    const paymentContext = usePaymentContextValues();

    return <PaymentContext.Provider value={paymentContext}>{children}</PaymentContext.Provider>;
}

function usePaymentContext(): PaymentContextValue {
    const context = useContext(PaymentContext);
    const paymentContextValues = usePaymentContextValues();

    return context ?? paymentContextValues;
}

function useReportPaymentContext({reportID, chatReportPolicyID, invoiceReceiverPolicyID}: UseReportPaymentContextParams): ReportPaymentContextValue {
    const paymentContext = useContext(PaymentContext);
    if (!paymentContext) {
        throw new Error('useReportPaymentContext must be used within PaymentContextProvider');
    }
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(reportID)}`);
    const chatReportPolicy = usePolicy(chatReportPolicyID);
    const existingB2BInvoiceReport = useParticipantsInvoiceReport(paymentContext.activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, invoiceReceiverPolicyID ?? chatReportPolicyID);

    return {
        ...paymentContext,
        nextStep,
        chatReportPolicy,
        existingB2BInvoiceReport,
    };
}

export default usePaymentContext;
export {PaymentContext, PaymentContextProvider, usePaymentContextValues, useReportPaymentContext};
export type {PaymentContextValue, ReportPaymentContextValue, UseReportPaymentContextParams};
