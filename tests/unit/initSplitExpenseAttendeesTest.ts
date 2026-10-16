/**
 * Protect attendee preservation through the local split draft action without unrelated network setup.
 */
import {renderHook} from '@testing-library/react-native';

import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';
import {useCurrencyListActions} from '@hooks/useCurrencyList';

import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import initSplitExpense from '@libs/actions/SplitExpenses';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxMultiSetInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import {isObject} from '../utils/typeGuards';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import currencyList from './currencyList.json';

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissModalWithReport: jest.fn(),
    dismissToPreviousRHP: jest.fn(),
    dismissToSuperWideRHP: jest.fn(),
    navigateBackToLastSuperWideRHPScreen: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => '23423423'),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    removeScreenByKey: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRouteByID: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(),
    getActiveRoute: jest.fn(),
    getIsFullscreenPreInsertedUnderRHP: jest.fn(() => false),
    clearFullscreenPreInsertedFlag: jest.fn(),
    revealRouteBeforeDismissingModal: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(),
        isReady: jest.fn(() => true),
    },
}));

jest.mock('@react-navigation/native');

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn(() => false));

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

let currencyListActions: CurrencyListActionsContextType;
let unmountCurrencyList: () => void;

beforeAll(async () => {
    Onyx.init({keys: ONYXKEYS});
    initOnyxDerivedValues();
    await IntlStore.load(CONST.LOCALES.EN);
    await waitForBatchedUpdates();
});

beforeEach(async () => {
    jest.clearAllTimers();
    await Onyx.clear();
    Onyx.init({
        keys: ONYXKEYS,
        initialKeyStates: {
            [ONYXKEYS.CURRENCY_LIST]: currencyList,
            [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                [RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL},
            },
        },
    });
    const {result, unmount} = renderHook(useCurrencyListActions, {wrapper: CurrencyListContextProvider});
    await waitForBatchedUpdates();
    currencyListActions = result.current;
    unmountCurrencyList = unmount;
});

afterEach(() => {
    unmountCurrencyList();
    jest.clearAllMocks();
});

describe('initSplitExpense', () => {
    describe.each([false, true])('attendee preservation with resplit=%s', (isResplit) => {
        const attendeeScenarios = [
            {
                scenario: 'comment attendees keep order and normalize names and email',
                commentAttendees: [
                    {displayName: '  Zoe  ', email: '  zoe@example.com  ', avatarUrl: 'zoe.png'},
                    {displayName: '  ', email: '  ada@example.com  ', avatarUrl: ''},
                ],
                modifiedAttendees: undefined,
                expectedAttendees: [
                    {displayName: 'Zoe', email: 'zoe@example.com', avatarUrl: 'zoe.png'},
                    {displayName: 'ada@example.com', email: 'ada@example.com', avatarUrl: ''},
                ],
            },
            {
                scenario: 'modified attendees replace comment attendees',
                commentAttendees: [{displayName: 'Original attendee', avatarUrl: ''}],
                modifiedAttendees: [
                    {displayName: '  Edited attendee  ', email: '  edited@example.com  ', avatarUrl: ''},
                    {displayName: '  ', email: '  next@example.com  ', avatarUrl: ''},
                ],
                expectedAttendees: [
                    {displayName: 'Edited attendee', email: 'edited@example.com', avatarUrl: ''},
                    {displayName: 'next@example.com', email: 'next@example.com', avatarUrl: ''},
                ],
            },
            {
                scenario: 'an empty modified list suppresses populated comment attendees',
                commentAttendees: [{displayName: 'Original attendee', avatarUrl: ''}],
                modifiedAttendees: [],
                expectedAttendees: [],
            },
            {
                scenario: 'missing attendees stay empty without a report owner fallback',
                commentAttendees: undefined,
                modifiedAttendees: undefined,
                expectedAttendees: [],
            },
        ] satisfies Array<{
            scenario: string;
            commentAttendees: NonNullable<Transaction['comment']>['attendees'];
            modifiedAttendees: Transaction['modifiedAttendees'];
            expectedAttendees: Attendee[];
        }>;

        it.each(attendeeScenarios)('$scenario', async ({commentAttendees, modifiedAttendees, expectedAttendees}) => {
            // Given distinct parent and child attendees so splitting again must read the original expense.
            const transaction: Transaction = {
                transactionID: 'attendee-original',
                amount: -100,
                currency: CONST.CURRENCY.USD,
                created: '2024-01-15',
                merchant: 'Lunch',
                reportID: 'attendee-report',
                comment: {comment: 'Team lunch', ...(commentAttendees !== undefined ? {attendees: commentAttendees} : {})},
                ...(modifiedAttendees !== undefined ? {modifiedAttendees} : {}),
            };
            const child: Transaction = {
                ...transaction,
                transactionID: 'attendee-child',
                amount: -50,
                modifiedAttendees: undefined,
                comment: {originalTransactionID: transaction.transactionID, source: CONST.IOU.TYPE.SPLIT, attendees: [{displayName: 'Child attendee', avatarUrl: ''}]},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`, {
                reportID: transaction.reportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: RORY_ACCOUNT_ID,
            });
            if (isResplit) {
                const transactionKey: `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` = `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`;
                const childKey: `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` = `${ONYXKEYS.COLLECTION.TRANSACTION}${child.transactionID}`;
                const siblingKey: `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` = `${ONYXKEYS.COLLECTION.TRANSACTION}attendee-sibling`;
                const transactions: OnyxMultiSetInput = {};
                transactions[transactionKey] = transaction;
                transactions[childKey] = child;
                transactions[siblingKey] = {...child, transactionID: 'attendee-sibling'};
                await Onyx.multiSet(transactions);
            }
            await waitForBatchedUpdates();
            const originalBefore = JSON.stringify(transaction);
            const childBefore = JSON.stringify(child);
            const storedOriginal = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`);
            const sourceTransaction = isResplit ? storedOriginal : transaction;
            const sourceAttendees = sourceTransaction?.modifiedAttendees ?? sourceTransaction?.comment?.attendees;
            const setSpy = jest.spyOn(Onyx, 'set');

            // When the real split action builds and writes its draft.
            initSplitExpense(
                isResplit ? child : transaction,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                currencyListActions.getCurrencyDecimals,
                currencyListActions.getCurrencySymbol,
            );
            await waitForBatchedUpdates();

            // Then the intended draft contains normalized attendees and never mutates or reuses the source attendees.
            const draftKey = `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transaction.transactionID}` as const;
            const draft = await getOnyxValue(draftKey);
            expect(draft).toBeTruthy();
            expect(draft?.comment?.attendees).toEqual(expectedAttendees);
            expect(draft?.comment?.originalTransactionID).toBe(transaction.transactionID);
            expect(draft?.comment?.splitExpenses).toHaveLength(2);
            const draftWrite = setSpy.mock.calls.find(([key]) => key === draftKey);
            expect(draftWrite).toBeDefined();
            const writtenDraft: unknown = draftWrite?.[1];
            if (!isObject(writtenDraft) || !isObject(writtenDraft.comment) || !Array.isArray(writtenDraft.comment.attendees)) {
                throw new Error('Expected the split draft write to contain attendees');
            }
            expect(writtenDraft.comment.attendees).not.toBe(sourceAttendees);
            for (const [index, attendee] of writtenDraft.comment.attendees.entries()) {
                expect(attendee).not.toBe(sourceAttendees?.[index]);
            }
            expect(JSON.stringify(transaction)).toBe(originalBefore);
            expect(JSON.stringify(child)).toBe(childBefore);
            setSpy.mockRestore();
        });

        it.each(['comment', 'modified'] as const)('normalizes %s attendees deserialized as an object', async (attendeeSource) => {
            // Given the legacy object shape supported by AttendeeUtils when Onyx deserializes an attendee array.
            const legacyAttendees: Record<number, Attendee | Omit<Attendee, 'displayName'>> = {};
            legacyAttendees[0] = {displayName: '  Zoe  ', email: '  zoe@example.com  ', avatarUrl: ''};
            legacyAttendees[1] = {email: '  ada@example.com  ', avatarUrl: ''};
            expect(Object.keys(legacyAttendees)).toEqual(['0', '1']);
            expect(Array.isArray(legacyAttendees)).toBe(false);
            expect(legacyAttendees[1]).not.toHaveProperty('displayName');
            const comment: NonNullable<Transaction['comment']> = {comment: 'Team lunch', attendees: [{displayName: 'Comment attendee', avatarUrl: ''}]};
            const transaction: Transaction = {
                transactionID: 'legacy-attendee-original',
                amount: -100,
                currency: CONST.CURRENCY.USD,
                created: '2024-01-15',
                merchant: 'Lunch',
                reportID: 'legacy-attendee-report',
                comment,
            };
            if (attendeeSource === 'comment') {
                // @ts-expect-error Onyx can deserialize this array as an object at the attendee property boundary.
                comment.attendees = legacyAttendees;
            } else {
                // @ts-expect-error Onyx can deserialize this array as an object at the attendee property boundary.
                transaction.modifiedAttendees = legacyAttendees;
            }
            const child: Transaction = {
                ...transaction,
                transactionID: 'legacy-attendee-child',
                amount: -50,
                modifiedAttendees: undefined,
                comment: {originalTransactionID: transaction.transactionID, source: CONST.IOU.TYPE.SPLIT, attendees: [{displayName: 'Child attendee', avatarUrl: ''}]},
            };
            if (isResplit) {
                const transactionKey: `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` = `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`;
                const childKey: `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` = `${ONYXKEYS.COLLECTION.TRANSACTION}${child.transactionID}`;
                const siblingKey: `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` = `${ONYXKEYS.COLLECTION.TRANSACTION}legacy-attendee-sibling`;
                const transactions: OnyxMultiSetInput = {};
                transactions[transactionKey] = transaction;
                transactions[childKey] = child;
                transactions[siblingKey] = {...child, transactionID: 'legacy-attendee-sibling'};
                await Onyx.multiSet(transactions);
            }
            await waitForBatchedUpdates();
            const sourceBefore = JSON.stringify(transaction);

            // When a new split or resplit reaches the real attendee normalizer through the action.
            initSplitExpense(
                isResplit ? child : transaction,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                currencyListActions.getCurrencyDecimals,
                currencyListActions.getCurrencySymbol,
            );
            await waitForBatchedUpdates();

            // Then the original expense's object values become an ordered normalized array.
            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transaction.transactionID}`);
            expect(draft).toBeTruthy();
            expect(draft?.comment?.attendees).toEqual([
                {displayName: 'Zoe', email: 'zoe@example.com', avatarUrl: ''},
                {displayName: 'ada@example.com', email: 'ada@example.com', avatarUrl: ''},
            ]);
            expect(draft?.comment?.splitExpenses).toHaveLength(2);
            expect(JSON.stringify(transaction)).toBe(sourceBefore);
        });
    });

    it('defaults resplit attendees to an empty array when the original is missing and two children remain', async () => {
        // Given two live split children whose original expense is no longer in Onyx.
        const originalTransactionID = 'missing-attendee-original';
        const child: Transaction = {
            transactionID: 'missing-attendee-child',
            amount: -50,
            currency: CONST.CURRENCY.USD,
            created: '2024-01-15',
            merchant: 'Lunch',
            reportID: 'missing-attendee-report',
            comment: {originalTransactionID, source: CONST.IOU.TYPE.SPLIT, attendees: [{displayName: 'Child attendee', avatarUrl: ''}]},
        };
        const childKey: `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` = `${ONYXKEYS.COLLECTION.TRANSACTION}${child.transactionID}`;
        const siblingKey: `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` = `${ONYXKEYS.COLLECTION.TRANSACTION}missing-attendee-sibling`;
        const transactions: OnyxMultiSetInput = {};
        transactions[childKey] = child;
        transactions[siblingKey] = {...child, transactionID: 'missing-attendee-sibling'};
        await Onyx.multiSet(transactions);
        await waitForBatchedUpdates();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`)).toBeFalsy();

        // When splitting again still selects the original draft key from those children.
        initSplitExpense(child, undefined, undefined, undefined, undefined, undefined, currencyListActions.getCurrencyDecimals, currencyListActions.getCurrencySymbol);
        await waitForBatchedUpdates();

        // Then the optimistic builder supplies its empty attendee default instead of borrowing child attendees.
        const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`);
        expect(draft).toBeTruthy();
        expect(draft?.comment?.originalTransactionID).toBe(originalTransactionID);
        expect(draft?.comment?.attendees).toEqual([]);
        expect(draft?.comment?.splitExpenses).toHaveLength(2);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${child.transactionID}`)).toBeFalsy();
    });
});
