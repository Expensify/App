import {act, renderHook} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import usePaymentContext, {PaymentContextProvider, useReportPaymentContext} from '@hooks/usePaymentContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'payer@example.com';
const DELEGATE_ACCOUNT_ID = 2;
const DELEGATE_EMAIL = 'delegate@example.com';
const ACTIVE_POLICY_ID = 'activePolicy';
const CHAT_REPORT_POLICY_ID = 'chatPolicy';
const ACTIVE_POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}${ACTIVE_POLICY_ID}` as const;
const CHAT_REPORT_POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}${CHAT_REPORT_POLICY_ID}` as const;

const activePolicy = {...createRandomPolicy(1), id: ACTIVE_POLICY_ID};
const chatReportPolicy = {...createRandomPolicy(2), id: CHAT_REPORT_POLICY_ID};

function wrapper({children}: {children: React.ReactNode}) {
    return (
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <CurrentUserPersonalDetailsProvider>
                    <PaymentContextProvider>{children}</PaymentContextProvider>
                </CurrentUserPersonalDetailsProvider>
            </LocaleContextProvider>
        </OnyxListItemProvider>
    );
}

describe('usePaymentContext', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        // Given a signed-in payer acting as a delegate, with an active workspace and the ASAP submit beta on
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_EMAIL},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_EMAIL, displayName: 'Payer', localCurrencyCode: CONST.CURRENCY.EUR},
                    [DELEGATE_ACCOUNT_ID]: {accountID: DELEGATE_ACCOUNT_ID, login: DELEGATE_EMAIL},
                },
                [ONYXKEYS.ACCOUNT]: {delegatedAccess: {delegate: DELEGATE_EMAIL}},
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: ACTIVE_POLICY_ID,
                [ACTIVE_POLICY_KEY]: activePolicy,
                [CHAT_REPORT_POLICY_KEY]: chatReportPolicy,
                [ONYXKEYS.BETAS]: [CONST.BETAS.ASAP_SUBMIT],
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('exposes the shared payment inputs from the provider', async () => {
        // Given the payer state seeded in beforeEach
        // When a consumer reads the payment context under the provider
        const {result} = renderHook(() => usePaymentContext(), {wrapper});
        await waitForBatchedUpdatesWithAct();

        // Then it gets the current user, the delegate resolved to an account ID, the active policy, the beta flags and a workspace name built from the email domain, because
        // pay flows pass these straight into payMoneyRequest and payInvoice
        expect(result.current.currentUserAccountID).toBe(CURRENT_USER_ACCOUNT_ID);
        expect(result.current.currentUserLogin).toBe(CURRENT_USER_EMAIL);
        expect(result.current.localCurrencyCode).toBe(CONST.CURRENCY.EUR);
        expect(result.current.delegateEmail).toBe(DELEGATE_EMAIL);
        expect(result.current.delegateAccountID).toBe(DELEGATE_ACCOUNT_ID);
        expect(result.current.activePolicyID).toBe(ACTIVE_POLICY_ID);
        expect(result.current.activePolicy).toEqual(expect.objectContaining({id: ACTIVE_POLICY_ID}));
        expect(result.current.isASAPSubmitBetaEnabled).toBe(true);
        expect(result.current.isWiseReimbursementsBetaEnabled).toBe(false);
        expect(result.current.defaultWorkspaceName).toContain('Example');
    });

    it('adds the chat report policy on top of the shared values', async () => {
        // Given the payer state seeded in beforeEach and a chat report on a different workspace
        // When a row reads the report-scoped context for its chat report's policy
        const {result} = renderHook(() => useReportPaymentContext({chatReportPolicyID: CHAT_REPORT_POLICY_ID}), {wrapper});
        await waitForBatchedUpdatesWithAct();

        // Then the shared values are kept and the chat report policy is resolved per row, because each row may belong to a different workspace
        expect(result.current.currentUserAccountID).toBe(CURRENT_USER_ACCOUNT_ID);
        expect(result.current.chatReportPolicy).toEqual(expect.objectContaining({id: CHAT_REPORT_POLICY_ID}));
    });

    it('throws when read outside the provider', () => {
        // Given no PaymentContextProvider above the consumer
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        try {
            // When the hook is read without a provider
            // Then it throws, because the Search page must mount the provider once instead of rows subscribing on their own
            expect(() => renderHook(() => usePaymentContext())).toThrow('usePaymentContext must be used within a PaymentContextProvider');
        } finally {
            consoleErrorSpy.mockRestore();
        }
    });
});
