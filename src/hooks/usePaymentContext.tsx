import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';

import ONYXKEYS from '@src/ONYXKEYS';
import {delegateEmailSelector} from '@src/selectors/Account';
import type {Policy, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {createContext, useContext} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useLastWorkspaceNumber from './useLastWorkspaceNumber';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

type PaymentContextValue = {
    currentUserAccountID: number;
    currentUserLogin: string | undefined;
    email: string | undefined;
    localCurrencyCode: string | undefined;
    activePolicyID: string | undefined;
    activePolicy: OnyxEntry<Policy>;
    conciergeReportID: string | undefined;
    conciergeChat: OnyxEntry<Report>;
    defaultWorkspaceName: string;
    delegateEmail: string | undefined;
    delegateAccountID: number | undefined;
};

type ReportPaymentContextValue = PaymentContextValue & {
    chatReportPolicy: OnyxEntry<Policy>;
};

type UseReportPaymentContextParams = {
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
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const delegateAccountID = useDelegateAccountID();
    const activePolicy = usePolicy(activePolicyID);

    const defaultWorkspaceName = generateDefaultWorkspaceName(email ?? '', lastWorkspaceNumber, translate);

    return {
        currentUserAccountID,
        currentUserLogin,
        email,
        localCurrencyCode,
        activePolicyID,
        activePolicy,
        conciergeReportID,
        conciergeChat,
        defaultWorkspaceName,
        delegateEmail,
        delegateAccountID,
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

function useReportPaymentContext({chatReportPolicyID}: UseReportPaymentContextParams): ReportPaymentContextValue {
    const paymentContext = usePaymentContext();
    const chatReportPolicy = usePolicy(chatReportPolicyID);

    return {
        ...paymentContext,
        chatReportPolicy,
    };
}

export default usePaymentContext;
export {PaymentContextProvider, useReportPaymentContext};
