import type * as Environment from '@libs/Environment/Environment';
import {isProduction} from '@libs/Environment/Environment';
import navigationRef from '@libs/Navigation/navigationRef';

import type * as SessionActions from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import addUtilsToWindow from '@src/setup/addUtilsToWindow';
import type {Policy, Report, ReportAction, Session, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry, OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.unmock('react-native-onyx');
jest.mock('@libs/Environment/Environment', () => ({
    ...jest.requireActual<typeof Environment>('@libs/Environment/Environment'),
    isProduction: jest.fn(),
}));
jest.mock('@userActions/Session', () => ({
    ...jest.requireActual<typeof SessionActions>('@userActions/Session'),
    setSupportAuthToken: jest.fn(),
}));
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        getCurrentRoute: jest.fn(),
        get current() {
            return this;
        },
    },
}));

const mockGetCurrentRoute = jest.spyOn(navigationRef, 'getCurrentRoute');
const debugWindowProperties = ['Onyx', 'setSupportToken', 'policy', 'report', 'transaction', 'receipt'];

// These minimal persisted shapes follow buildOptimisticIOUReportAction and the transaction collection fixture.
// The modern object message and the legacy array/originalMessage pair are read by the real message accessor.
const iouAction = {
    reportActionID: 'parent-action',
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    created: '2026-10-22 12:00:00',
} satisfies ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>;
const modernTransaction = {
    transactionID: 'modern',
    reportID: 'report',
    amount: 100,
    created: '2026-10-22',
    currency: CONST.CURRENCY.USD,
    merchant: 'Coffee',
    receipt: {filename: 'receipt.jpg'},
} satisfies Transaction;
const legacyTransaction = {...modernTransaction, transactionID: 'legacy'} satisfies Transaction;
const fallbackTransaction = {...modernTransaction, transactionID: 'fallback'} satisfies Transaction;

describe('addUtilsToWindow', () => {
    const windowDescriptors = new Map<string, PropertyDescriptor | undefined>();
    const onyxDescriptors = new Map<string, PropertyDescriptor | undefined>();

    beforeEach(async () => {
        for (const key of debugWindowProperties) {
            windowDescriptors.set(key, Object.getOwnPropertyDescriptor(window, key));
        }
        for (const key of ['get', 'log']) {
            onyxDescriptors.set(key, Object.getOwnPropertyDescriptor(Onyx, key));
        }
        jest.clearAllMocks();
        jest.mocked(isProduction).mockResolvedValue(false);
        mockGetCurrentRoute.mockReturnValue(undefined);
        await Onyx.clear();
        await waitForBatchedUpdates();
        addUtilsToWindow();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        for (const [key, descriptor] of windowDescriptors) {
            if (descriptor) {
                Object.defineProperty(window, key, descriptor);
            } else {
                Reflect.deleteProperty(window, key);
            }
        }
        for (const [key, descriptor] of onyxDescriptors) {
            if (descriptor) {
                Object.defineProperty(Onyx, key, descriptor);
            } else {
                Reflect.deleteProperty(Onyx, key);
            }
        }
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('leaves the existing debug installation untouched in production', async () => {
        // Given a production environment, even existing development properties must not be replaced.
        const descriptors = debugWindowProperties.map((key) => Object.getOwnPropertyDescriptor(window, key));
        jest.mocked(isProduction).mockResolvedValue(true);

        // When the asynchronous environment check completes, no debug properties should be installed.
        addUtilsToWindow();
        await waitForBatchedUpdates();

        // Then each property keeps its original descriptor, including the getter identity.
        expect(debugWindowProperties.map((key) => Object.getOwnPropertyDescriptor(window, key))).toEqual(descriptors);
    });

    it('exposes the original native Onyx get without replacing it', () => {
        // Given the native get descriptor saved before installation, the debug API should retain its value.
        // When nonproduction setup exposes Onyx, it should expose the original object and read function.
        const exposedGet = window.Onyx.get;

        // Then a replacement wrapper or copied API object cannot satisfy these identity checks.
        expect(window.Onyx).toBe(Onyx);
        expect(exposedGet).toEqual(expect.any(Function));
        expect(exposedGet).toBe(onyxDescriptors.get('get')?.value);
    });

    it('logs the value read by the native public get', async () => {
        // Given a populated configured collection, log should print the value from a real native read.
        const key = ONYXKEYS.COLLECTION.TRANSACTION;
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}modern`, modernTransaction);
        await waitForBatchedUpdates();
        const get = jest.spyOn(Onyx, 'get');
        const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

        // When the installed optional log member runs, retain its local reference without an assertion.
        const log = window.Onyx.log;
        log?.(key);
        await waitForBatchedUpdates();

        // Then both the read and the logged value prove the installed log body executed.
        expect(get).toHaveBeenCalledTimes(1);
        expect(get).toHaveBeenCalledWith(key);
        expect(consoleLog).toHaveBeenCalledTimes(1);
        expect(consoleLog).toHaveBeenCalledWith({[`${ONYXKEYS.COLLECTION.TRANSACTION}modern` satisfies OnyxKey]: modernTransaction});
    });

    it('reads a stored member through the native public get', async () => {
        // Given an awaited member write, the native read should return its current stored value.
        const key = `${ONYXKEYS.COLLECTION.TRANSACTION}modern` satisfies OnyxKey;
        await Onyx.set(key, modernTransaction);
        await waitForBatchedUpdates();

        // When the exposed native read starts, its promise keeps the member value type.
        const result = window.Onyx.get(key) satisfies Promise<OnyxEntry<Transaction>>;
        const value = await result;

        // Then the exact transaction is returned without a debug subscription wrapper.
        expect(value).toEqual(modernTransaction);
    });

    it.each([true, false])('reads a regular key through the native public get, present: %s', async (isPresent) => {
        // Given a present or absent session, its creation date follows the Session action writer.
        const storedSession = {accountID: 123, creationDate: 1} satisfies Session;
        if (isPresent) {
            await Onyx.set(ONYXKEYS.SESSION, storedSession);
        }
        await waitForBatchedUpdates();

        // When the exposed native read starts, its promise keeps the regular-key value type.
        const result = window.Onyx.get(ONYXKEYS.SESSION) satisfies Promise<OnyxEntry<Session>>;
        const session = await result;

        // Then presence returns the exact session and absence remains undefined.
        expect(session).toEqual(isPresent ? storedSession : undefined);
    });

    it('preserves absent member reads through the native public get', async () => {
        // Given a missing member, its value is absent without losing the transaction return type.
        // When the exposed native read starts, its promise keeps the member value type.
        const result = window.Onyx.get(`${ONYXKEYS.COLLECTION.TRANSACTION}missing`) satisfies Promise<OnyxEntry<Transaction>>;
        const missing = await result;

        // Then a missing member remains undefined rather than an empty collection.
        expect(missing).toBeUndefined();
    });

    it('preserves initialized empty, populated and empty-after-deletion collection-root snapshots', async () => {
        // Given global Onyx initialization, the configured root is already known and empty before its first write.
        // An unseeded/pre-init root is not reachable through this initialized public seam.
        // When native reads follow awaited writes and deletion, each promise retains its collection category.
        const initialResult = window.Onyx.get(ONYXKEYS.COLLECTION.TRANSACTION) satisfies Promise<OnyxCollection<Transaction>>;
        const initial = await initialResult;
        expect(initial).toEqual({});
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}modern`, modernTransaction);
        await waitForBatchedUpdates();

        const populatedResult = window.Onyx.get(ONYXKEYS.COLLECTION.TRANSACTION) satisfies Promise<OnyxCollection<Transaction>>;
        const populated = await populatedResult;
        expect(populated).toEqual({[`${ONYXKEYS.COLLECTION.TRANSACTION}modern` satisfies OnyxKey]: modernTransaction});
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}modern`, null);
        await waitForBatchedUpdates();

        const emptyResult = window.Onyx.get(ONYXKEYS.COLLECTION.TRANSACTION) satisfies Promise<OnyxCollection<Transaction>>;
        const empty = await emptyResult;

        // Then deletion returns the collection root to an empty object.
        expect(empty).toEqual({});
    });

    it.each([
        {
            name: 'modern-only parent',
            parentAction: {...iouAction, message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, text: '', IOUTransactionID: 'modern'}} satisfies ReportAction,
            expectedTransaction: modernTransaction,
        },
        {
            name: 'legacy-only parent',
            parentAction: {...iouAction, originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'legacy'}} satisfies ReportAction,
            expectedTransaction: legacyTransaction,
        },
        {
            name: 'legacy array-message parent',
            parentAction: {
                ...iouAction,
                message: [{type: 'COMMENT', text: 'legacy'}],
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'legacy'},
            } satisfies ReportAction,
            expectedTransaction: legacyTransaction,
        },
        {
            name: 'conflicting modern and legacy parent IDs',
            parentAction: {
                ...iouAction,
                message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, text: '', IOUTransactionID: 'modern'},
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'legacy'},
            } satisfies ReportAction,
            expectedTransaction: modernTransaction,
        },
        {
            name: 'modern parent without an ID does not reuse its legacy ID',
            parentAction: {
                ...iouAction,
                message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, text: ''},
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'legacy'},
            } satisfies ReportAction,
            expectedTransaction: fallbackTransaction,
        },
        {
            name: 'empty parent ID falls through',
            parentAction: {...iouAction, message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, text: '', IOUTransactionID: ''}} satisfies ReportAction,
            expectedTransaction: fallbackTransaction,
        },
        {
            name: 'non-IOU parent cannot supply a transaction',
            parentAction: {
                ...iouAction,
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, text: '', IOUTransactionID: 'modern'},
            } satisfies ReportAction,
            expectedTransaction: fallbackTransaction,
        },
    ])('uses the production linked-ID lookup for $name', async ({parentAction, expectedTransaction}) => {
        // Given conflicting parent, legacy and fallback records, the real domain accessor decides which ID is eligible.
        mockGetCurrentRoute.mockReturnValue({key: 'route', name: SCREENS.DEBUG.REPORT, params: {reportID: 'report'}});
        await Onyx.multiSet({
            [`${ONYXKEYS.COLLECTION.REPORT}report` satisfies OnyxKey]: {reportID: 'report', parentReportID: 'parent', parentReportActionID: 'parent-action'} satisfies Report,
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}parent` satisfies OnyxKey]: {[parentAction.reportActionID]: parentAction},
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}report` satisfies OnyxKey]: {
                fallback: {...iouAction, reportActionID: 'fallback', message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, text: '', IOUTransactionID: 'fallback'}},
            },
            [`${ONYXKEYS.COLLECTION.TRANSACTION}modern` satisfies OnyxKey]: modernTransaction,
            [`${ONYXKEYS.COLLECTION.TRANSACTION}legacy` satisfies OnyxKey]: legacyTransaction,
            [`${ONYXKEYS.COLLECTION.TRANSACTION}fallback` satisfies OnyxKey]: fallbackTransaction,
        });
        await waitForBatchedUpdates();

        // When the installed getter reads the report, it must prefer an eligible parent over the report's own actions.
        const transaction = await window.transaction;

        // Then both modern-message priority and legacy compatibility are observable on the returned production value.
        expect(transaction).toEqual(expectedTransaction);
    });

    it.each(['modern', 'legacy'])('skips ineligible fallback actions and returns the first linked %s IOU', async (messageFormat) => {
        // Given a missing parent action, fallback order includes non-IOU, missing-ID and empty-ID actions before two valid IOUs.
        const firstAction = {
            ...iouAction,
            reportActionID: 'first',
            ...(messageFormat === 'modern'
                ? {
                      message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, text: '', IOUTransactionID: 'modern'},
                      originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'legacy'},
                  }
                : {message: [{type: 'COMMENT', text: 'legacy'}], originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'legacy'}}),
        } satisfies ReportAction;
        mockGetCurrentRoute.mockReturnValue({key: 'route', name: SCREENS.DEBUG.REPORT, params: {reportID: 'report'}});
        await Onyx.multiSet({
            [`${ONYXKEYS.COLLECTION.REPORT}report` satisfies OnyxKey]: {reportID: 'report', parentReportID: 'parent', parentReportActionID: 'absent'} satisfies Report,
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}report` satisfies OnyxKey]: {
                comment: {...iouAction, actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, text: '', IOUTransactionID: 'fallback'}},
                missing: {...iouAction, message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, text: ''}},
                empty: {...iouAction, message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, text: '', IOUTransactionID: ''}},
                first: firstAction,
                later: {...iouAction, message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, text: '', IOUTransactionID: 'fallback'}},
            },
            [`${ONYXKEYS.COLLECTION.TRANSACTION}modern` satisfies OnyxKey]: modernTransaction,
            [`${ONYXKEYS.COLLECTION.TRANSACTION}legacy` satisfies OnyxKey]: legacyTransaction,
            [`${ONYXKEYS.COLLECTION.TRANSACTION}fallback` satisfies OnyxKey]: fallbackTransaction,
        });
        await waitForBatchedUpdates();

        // When the real getter scans report actions, it uses the same shared accessor as the parent path.
        const transaction = await window.transaction;

        // Then iteration order selects the first eligible IOU, and a non-IOU cannot win merely by carrying an ID.
        expect(transaction).toEqual(messageFormat === 'modern' ? modernTransaction : legacyTransaction);
    });

    it.each(['missing report', 'missing actions', 'no linked action'])('returns no transaction for %s', async (scenario) => {
        // Given an incomplete report lookup, no arbitrary action field should manufacture a transaction ID.
        mockGetCurrentRoute.mockReturnValue({key: 'route', name: SCREENS.DEBUG.REPORT, params: {reportID: 'report'}});
        if (scenario !== 'missing report') {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}report`, {reportID: 'report'});
        }
        if (scenario === 'no linked action') {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}report`, {missing: {...iouAction, message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, text: ''}}});
        }
        await waitForBatchedUpdates();

        // When the public getter exhausts the available sources, absence should remain absence.
        const transaction = await window.transaction;

        // Then callers can distinguish an unavailable transaction from a valid stored transaction.
        expect(transaction).toBeUndefined();
    });

    it('keeps direct route IDs ahead of conflicting transaction, report and parent fallbacks', async () => {
        // Given all three route IDs, each direct ID must outrank related records pointing somewhere else.
        const params = {reportID: 'direct-report', transactionID: 'modern', policyID: 'direct-policy'};
        const report = {reportID: 'direct-report', policyID: 'report-policy', parentReportID: 'parent'} satisfies Report;
        const policy = {id: 'direct-policy', name: 'Direct'} satisfies Partial<Policy>;
        mockGetCurrentRoute.mockReturnValue({key: 'route', name: SCREENS.DEBUG.REPORT, params});
        await Onyx.multiSet({
            [`${ONYXKEYS.COLLECTION.REPORT}direct-report` satisfies OnyxKey]: report,
            [`${ONYXKEYS.COLLECTION.REPORT}report` satisfies OnyxKey]: {reportID: 'report', policyID: 'other-policy'},
            [`${ONYXKEYS.COLLECTION.REPORT}parent` satisfies OnyxKey]: {reportID: 'parent', policyID: 'parent-policy'},
            [`${ONYXKEYS.COLLECTION.TRANSACTION}modern` satisfies OnyxKey]: modernTransaction,
            [`${ONYXKEYS.COLLECTION.POLICY}direct-policy` satisfies OnyxKey]: policy,
            [`${ONYXKEYS.COLLECTION.POLICY}report-policy` satisfies OnyxKey]: {id: 'report-policy'},
            [`${ONYXKEYS.COLLECTION.POLICY}parent-policy` satisfies OnyxKey]: {id: 'parent-policy'},
        });
        await waitForBatchedUpdates();

        // When the installed getters resolve together, receipt must follow the directly selected transaction.
        const values = await Promise.all([window.report, window.policy, window.transaction, window.receipt]);

        // Then each public getter exposes the direct record rather than a conflicting fallback.
        expect(values).toEqual([report, policy, modernTransaction, modernTransaction.receipt]);
    });

    it.each([true, false])('resolves a transaction route through its report with own policy present: %s', async (hasOwnPolicy) => {
        // Given a transaction-only route, report discovery precedes the report's own policy and then its parent's policy.
        const ownPolicy = {id: 'own-policy'} satisfies Partial<Policy>;
        const parentPolicy = {id: 'parent-policy'} satisfies Partial<Policy>;
        mockGetCurrentRoute.mockReturnValue({key: 'route', name: SCREENS.DEBUG.TRANSACTION, params: {transactionID: 'modern'}});
        await Onyx.multiSet({
            [`${ONYXKEYS.COLLECTION.TRANSACTION}modern` satisfies OnyxKey]: modernTransaction,
            [`${ONYXKEYS.COLLECTION.REPORT}report` satisfies OnyxKey]: {reportID: 'report', parentReportID: 'parent', ...(hasOwnPolicy ? {policyID: 'own-policy'} : {})},
            [`${ONYXKEYS.COLLECTION.REPORT}parent` satisfies OnyxKey]: {reportID: 'parent', policyID: 'parent-policy'},
            [`${ONYXKEYS.COLLECTION.POLICY}own-policy` satisfies OnyxKey]: ownPolicy,
            [`${ONYXKEYS.COLLECTION.POLICY}parent-policy` satisfies OnyxKey]: parentPolicy,
        });
        await waitForBatchedUpdates();

        // When the public report and policy getters read through the transaction, both fallbacks use real Onyx values.
        const report = await window.report;
        const policy = await window.policy;

        // Then report selection and own-before-parent policy selection retain their existing priorities.
        expect(report).toEqual({reportID: 'report', parentReportID: 'parent', ...(hasOwnPolicy ? {policyID: 'own-policy'} : {})});
        expect(policy).toEqual(hasOwnPolicy ? ownPolicy : parentPolicy);
    });

    it.each(['0', ' '])('preserves a nonempty route ID without coercion or trimming: %j', async (reportID) => {
        // Given IDs that are unusual but nonempty strings, route lookup must preserve their exact bytes.
        const report = {reportID} satisfies Report;
        mockGetCurrentRoute.mockReturnValue({key: 'route', name: SCREENS.DEBUG.REPORT, params: {reportID}});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
        await waitForBatchedUpdates();

        // When the public getter reads the current report, the helper must neither trim nor coerce the ID.
        const result = await window.report;

        // Then the exact record is found, proving that the ID was accepted rather than silently treated as absent.
        expect(result).toEqual(report);
    });

    it('returns absent data for absent params, empty params and empty route IDs', async () => {
        // Given no route params, all lazy getters must tolerate the missing lookup context.
        mockGetCurrentRoute.mockReturnValue({key: 'route', name: SCREENS.HOME});

        // When route params progress from absent to empty to empty-string IDs, none is a usable ID.
        const absent = await Promise.all([window.report, window.policy, window.transaction, window.receipt]);
        mockGetCurrentRoute.mockReturnValue({key: 'route', name: SCREENS.UNLINK_LOGIN, params: {}});
        const empty = await Promise.all([window.report, window.policy, window.transaction, window.receipt]);
        const params = {reportID: '', policyID: '', transactionID: ''};
        mockGetCurrentRoute.mockReturnValue({key: 'route', name: SCREENS.DEBUG.REPORT, params});
        const emptyIDs = await Promise.all([window.report, window.policy, window.transaction, window.receipt]);

        // Then every getter consistently returns undefined without a fabricated Onyx key.
        expect(absent).toEqual([undefined, undefined, undefined, undefined]);
        expect(empty).toEqual(absent);
        expect(emptyIDs).toEqual(absent);
    });

    it('rejects route IDs that are not strings instead of coercing them into stored keys', async () => {
        // Given malformed route IDs and matching string keys, accepting coercion would return the wrong records.
        await Onyx.multiSet({
            [`${ONYXKEYS.COLLECTION.REPORT}123` satisfies OnyxKey]: {reportID: '123'},
            [`${ONYXKEYS.COLLECTION.TRANSACTION}123` satisfies OnyxKey]: modernTransaction,
            [`${ONYXKEYS.COLLECTION.POLICY}123` satisfies OnyxKey]: {id: '123'},
        });
        mockGetCurrentRoute.mockReturnValue({
            key: 'route',
            name: SCREENS.DEBUG.REPORT,
            // @ts-expect-error Historical malformed route params deliberately violate the framework's string ID contract.
            params: {reportID: 123, transactionID: 123, policyID: 123},
        });
        await waitForBatchedUpdates();

        // When the public getters inspect the malformed route, local record narrowing must still reject the ID values.
        const values = await Promise.all([window.report, window.policy, window.transaction, window.receipt]);

        // Then no numeric ID is coerced to a string and no matching stored record is exposed.
        expect(values).toEqual([undefined, undefined, undefined, undefined]);
    });

    it('returns absent data when valid direct IDs have no related Onyx records', async () => {
        // Given valid route strings with missing storage entries, lookup absence is different from malformed params.
        const params = {reportID: 'missing', transactionID: 'missing', policyID: 'missing'};
        mockGetCurrentRoute.mockReturnValue({key: 'route', name: SCREENS.DEBUG.REPORT, params});

        // When each public getter follows its normal direct lookup, a missing related entry must be tolerated.
        const values = await Promise.all([window.report, window.policy, window.transaction, window.receipt]);

        // Then all exposed data remains absent, including the receipt that depends on the selected transaction.
        expect(values).toEqual([undefined, undefined, undefined, undefined]);
    });
});
