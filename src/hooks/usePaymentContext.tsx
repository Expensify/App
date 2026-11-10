import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {delegateEmailSelector} from '@src/selectors/Account';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';
import type {BankAccountList, IntroSelected, Policy, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {createContext, useContext} from 'react';
import Onyx from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useLastWorkspaceNumber from './useLastWorkspaceNumber';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import usePolicy from './usePolicy';

type SearchActionInputs = {
    conciergeChat: OnyxEntry<Report>;
    introSelected: OnyxEntry<IntroSelected>;
    isSelfTourViewed: boolean;
    amountOwed: OnyxEntry<number>;
    bankAccountList: OnyxEntry<BankAccountList>;
};

type PaymentContextValue = {
    currentUserAccountID: number;
    currentUserLogin: string | undefined;
    email: string | undefined;
    localCurrencyCode: string | undefined;
    isASAPSubmitBetaEnabled: boolean;
    isWiseReimbursementsBetaEnabled: boolean;
    activePolicyID: string | undefined;
    activePolicy: OnyxEntry<Policy>;
    defaultWorkspaceName: string;
    delegateEmail: string | undefined;
    delegateAccountID: number | undefined;
    readSearchActionInputs: () => Promise<SearchActionInputs>;
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
    const {login: currentUserLogin, accountID: currentUserAccountID, email, displayName, localCurrencyCode} = useCurrentUserPersonalDetails();
    const lastWorkspaceNumber = useLastWorkspaceNumber();
    const {isBetaEnabled} = usePermissions();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const delegateAccountID = useDelegateAccountID();
    const activePolicy = usePolicy(activePolicyID);

    const defaultWorkspaceName = generateDefaultWorkspaceName(email ?? '', displayName, lastWorkspaceNumber, translate);

    const readSearchActionInputs = async (): Promise<SearchActionInputs> => {
        const [conciergeReportID, introSelected, onboarding, amountOwed, bankAccountList] = await Onyx.multiGet([
            ONYXKEYS.CONCIERGE_REPORT_ID,
            ONYXKEYS.NVP_INTRO_SELECTED,
            ONYXKEYS.NVP_ONBOARDING,
            ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED,
            ONYXKEYS.BANK_ACCOUNT_LIST,
        ]);
        const conciergeChat = await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
        return {conciergeChat, introSelected, isSelfTourViewed: hasSeenTourSelector(onboarding), amountOwed, bankAccountList};
    };

    return {
        currentUserAccountID,
        currentUserLogin,
        email,
        localCurrencyCode,
        isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
        isWiseReimbursementsBetaEnabled: isBetaEnabled(CONST.BETAS.WISE_REIMBURSEMENTS),
        activePolicyID,
        activePolicy,
        defaultWorkspaceName,
        delegateEmail,
        delegateAccountID,
        readSearchActionInputs,
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
export type {PaymentContextValue, SearchActionInputs};
