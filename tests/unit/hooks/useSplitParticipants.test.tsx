import {renderHook} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MoneyRequestAmountInput from '@components/MoneyRequestAmountInput';
import useSplitParticipants from '@components/MoneyRequestConfirmationList/hooks/useSplitParticipants';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () =>
        new Proxy(
            {},
            {
                get: () => ({}),
            },
        ),
}));

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({
        convertToDisplayString: (amount?: number, currency?: string) => `${currency ?? 'USD'} ${(amount ?? 0).toFixed(2)}`,
        getCurrencySymbol: () => '$',
    }),
}));

jest.mock('@components/MoneyRequestAmountInput', () => {
    function MoneyRequestAmountInputMock() {
        return null;
    }
    MoneyRequestAmountInputMock.displayName = 'MoneyRequestAmountInputMock';
    return {
        __esModule: true,
        default: MoneyRequestAmountInputMock,
    };
});

type Params = Parameters<typeof useSplitParticipants>[0];

const payee = {accountID: 1, login: 'me@test.com'} as CurrentUserPersonalDetails;
const otherParticipant = {accountID: 2, login: 'other@test.com', keyForList: '2'} as unknown as Participant;

function makeBase(overrides: Partial<Params> = {}): Params {
    return {
        isTypeSplit: false,
        shouldShowReadOnlySplits: false,
        payeePersonalDetails: payee as OnyxTypes.PersonalDetails,
        selectedParticipants: [otherParticipant],
        transaction: {transactionID: 'txn1', amount: 1000, comment: {}} as unknown as OnyxTypes.Transaction,
        iouAmount: 1000,
        iouCurrencyCode: 'USD',
        ...overrides,
    };
}

function collectText(node: unknown): string {
    if (node === null || node === undefined || typeof node === 'boolean') {
        return '';
    }
    if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
    }
    if (Array.isArray(node)) {
        return node.map(collectText).join(' ');
    }
    if (typeof node === 'object' && 'props' in (node as Record<string, unknown>)) {
        const element = node as {props?: {children?: unknown}};
        return collectText(element.props?.children);
    }
    return '';
}

function Wrapper({children}: {children: React.ReactNode}) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

describe('useSplitParticipants', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdatesWithAct();
    });

    it('returns an empty splitParticipants array when isTypeSplit is false', () => {
        const {result} = renderHook(() => useSplitParticipants(makeBase()), {wrapper: Wrapper});
        expect(result.current.splitParticipants).toEqual([]);
    });

    it('returns payee + selectedParticipants for split', () => {
        const {result} = renderHook(() => useSplitParticipants(makeBase({isTypeSplit: true})), {wrapper: Wrapper});
        expect(result.current.splitParticipants).toHaveLength(2);
        expect(result.current.splitParticipants.at(0)?.accountID).toBe(payee.accountID);
        expect(result.current.splitParticipants.at(1)?.accountID).toBe(otherParticipant.accountID);
    });

    it('marks split rows as non-interactive', () => {
        const {result} = renderHook(() => useSplitParticipants(makeBase({isTypeSplit: true})), {wrapper: Wrapper});
        for (const row of result.current.splitParticipants) {
            expect((row as {isInteractive?: boolean}).isInteractive).toBe(false);
        }
    });

    it('exposes a getSplitSectionHeader callback', () => {
        const {result} = renderHook(() => useSplitParticipants(makeBase({isTypeSplit: true})), {wrapper: Wrapper});
        expect(typeof result.current.getSplitSectionHeader).toBe('function');
    });

    it('uses a read-only Text rightElement that contains the formatted amount when shouldShowReadOnlySplits is true', () => {
        const {result} = renderHook(
            () =>
                useSplitParticipants(
                    makeBase({
                        isTypeSplit: true,
                        shouldShowReadOnlySplits: true,
                        iouAmount: 1000,
                    }),
                ),
            {wrapper: Wrapper},
        );
        const rows = result.current.splitParticipants;
        expect(rows).toHaveLength(2);
        for (const row of rows) {
            const rightElement = (row as {rightElement?: React.ReactElement}).rightElement;
            // Read-only path renders <View><Text>{amount}</Text></View>, never MoneyRequestAmountInput
            expect(rightElement?.type).not.toBe(MoneyRequestAmountInput);
            const text = collectText(rightElement);
            // convertToDisplayString mock returns "USD 5.00" for the calculated split amount
            expect(text).toContain('USD');
        }
    });

    it('renders an empty Text rightElement for read-only splits when iouAmount is zero', () => {
        const {result} = renderHook(
            () =>
                useSplitParticipants(
                    makeBase({
                        isTypeSplit: true,
                        shouldShowReadOnlySplits: true,
                        iouAmount: 0,
                    }),
                ),
            {wrapper: Wrapper},
        );
        const rows = result.current.splitParticipants;
        expect(rows).toHaveLength(2);
        for (const row of rows) {
            const rightElement = (row as {rightElement?: React.ReactElement}).rightElement;
            expect(rightElement?.type).not.toBe(MoneyRequestAmountInput);
            // No amount string should be rendered when iouAmount is 0
            const text = collectText(rightElement);
            expect(text).not.toContain('USD');
        }
    });

    it('uses MoneyRequestAmountInput as rightElement for editable splits', () => {
        const {result} = renderHook(
            () =>
                useSplitParticipants(
                    makeBase({
                        isTypeSplit: true,
                        shouldShowReadOnlySplits: false,
                        iouAmount: 1000,
                    }),
                ),
            {wrapper: Wrapper},
        );
        const rows = result.current.splitParticipants;
        expect(rows).toHaveLength(2);
        for (const row of rows) {
            const rightElement = (row as {rightElement?: React.ReactElement}).rightElement;
            expect(rightElement?.type).toBe(MoneyRequestAmountInput);
        }
        // Editable rows should be tab-skipped (tabIndex: -1) and non-interactive
        expect((rows.at(0) as {tabIndex?: number}).tabIndex).toBe(-1);
    });
});
