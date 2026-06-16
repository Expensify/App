/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import '@libs/actions/IOU/MoneyRequest';
import {
    getOdometerHasUnsavedChanges,
    isOdometerDraftPendingHydration,
    removeMoneyRequestOdometerImage,
    saveOdometerDraft,
    setMoneyRequestOdometerImage,
} from '@libs/actions/OdometerTransactionUtils';
import type {OdometerUnsavedChangesState} from '@libs/actions/OdometerTransactionUtils';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {getOdometerImageIdentity} from '@libs/OdometerImageUtils';
import type * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import currencyList from '../unit/currencyList.json';
import createRandomTransaction from '../utils/collections/transaction';
import getOnyxValue from '../utils/getOnyxValue';
import {getGlobalFetchMock} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const topMostReportID = '23423423';
jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissToPreviousRHP: jest.fn(),
    dismissToSuperWideRHP: jest.fn(),
    navigateBackToLastSuperWideRHPScreen: jest.fn(),
    dismissModalWithReport: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => topMostReportID),
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

jest.mock('@src/libs/actions/Report', () => {
    const originalModule = jest.requireActual('@src/libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...originalModule,
        notifyNewAction: jest.fn(),
    };
});
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn());
// In production, requestMoney defers its API.write() call until the target screen's
// content lays out (or a safety timeout fires). In tests there is no target component
// to flush the deferred write, so we bypass the deferral by executing the callback immediately
jest.mock('@libs/deferredLayoutWrite', () => ({
    registerDeferredWrite: (_key: string, callback: () => void) => callback(),
    flushDeferredWrite: jest.fn(),
    cancelDeferredWrite: jest.fn(),
    hasDeferredWrite: () => false,
    getOptimisticWatchKey: () => undefined,
    deferOrExecuteWrite: (apiWrite: () => void) => apiWrite(),
    reserveDeferredWriteChannel: jest.fn(),
    resetForTesting: jest.fn(),
}));
jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

const unapprovedCashHash = 71801560;
const unapprovedCashSimilarSearchHash = 1832274510;
jest.mock('@src/libs/SearchQueryUtils', () => {
    const actual = jest.requireActual('@src/libs/SearchQueryUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        getCurrentSearchQueryJSON: jest.fn().mockImplementation(() => ({
            hash: unapprovedCashHash,
            query: 'test',
            type: 'expense',
            status: ['drafts', 'outstanding'],
            filters: {operator: 'eq', left: 'reimbursable', right: 'yes'},
            flatFilters: [{key: 'reimbursable', filters: [{operator: 'eq', value: 'yes'}]}],
            inputQuery: '',
            recentSearchHash: 89,
            similarSearchHash: unapprovedCashSimilarSearchHash,
            sortBy: 'tag',
            sortOrder: 'asc',
        })),
        buildCannedSearchQuery: jest.fn(),
    };
});

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
    isPolicyOwner: jest.fn().mockImplementation((policy?: OnyxEntry<Policy>, currentUserAccountID?: number) => !!currentUserAccountID && policy?.ownerAccountID === currentUserAccountID),
}));

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

OnyxUpdateManager();
describe('actions/OdometerTransactionUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
                [ONYXKEYS.CURRENCY_LIST]: currencyList,
            },
        });
        initOnyxDerivedValues();
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllTimers();
        global.fetch = getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('setMoneyRequestOdometerImage and removeMoneyRequestOdometerImage', () => {
        beforeEach(() => {
            jest.mock('@libs/OdometerImageUtils', () => ({
                __esModule: true,
                default: jest.fn(),
            }));
        });

        afterEach(() => {
            jest.unmock('@libs/OdometerImageUtils');
        });
        it('should set odometer start image on a draft transaction', () => {
            const transaction = createRandomTransaction(1);
            const transactionID = transaction.transactionID;
            const file = {uri: 'image.uri', name: 'image.jpg', type: 'image/jpeg', size: 1234};
            const imageType = CONST.IOU.ODOMETER_IMAGE_TYPE.START;

            return Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, transaction)
                .then(() => {
                    setMoneyRequestOdometerImage(transaction, imageType, file, true, false);
                    return waitForBatchedUpdates();
                })
                .then(() => getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`))
                .then((draftTransaction) => {
                    expect(draftTransaction?.comment?.odometerStartImage).toEqual(file);
                });
        });

        it('should set odometer end image on a non-draft transaction', () => {
            const transaction = createRandomTransaction(1);
            const transactionID = transaction.transactionID;
            const file = {uri: 'image.uri', name: 'image.jpg', type: 'image/jpeg', size: 1234};
            const imageType = CONST.IOU.ODOMETER_IMAGE_TYPE.END;

            return Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction)
                .then(() => {
                    setMoneyRequestOdometerImage(transaction, imageType, file, false, false);
                    return waitForBatchedUpdates();
                })
                .then(() => getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`))
                .then((updatedTransaction) => {
                    expect(updatedTransaction?.comment?.odometerEndImage).toEqual(file);
                });
        });

        it('should remove odometer start image from a draft transaction', () => {
            const base = createRandomTransaction(1);
            const transaction: Transaction = {
                ...base,
                comment: {
                    ...base.comment,
                    odometerStartImage: {uri: 'image.uri'},
                },
            };
            const transactionID = transaction.transactionID;
            const imageType = CONST.IOU.ODOMETER_IMAGE_TYPE.START;

            return Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, transaction)
                .then(() => {
                    removeMoneyRequestOdometerImage(transaction, imageType, true, false);
                    return waitForBatchedUpdates();
                })
                .then(() => getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`))
                .then((draftTransaction) => {
                    expect(draftTransaction?.comment?.odometerStartImage).toBeUndefined();
                });
        });

        it('should remove odometer end image from a non-draft transaction', () => {
            const base = createRandomTransaction(1);
            const transaction: Transaction = {
                ...base,
                comment: {
                    ...base.comment,
                    odometerEndImage: {uri: 'image.uri'},
                },
            };
            const transactionID = transaction.transactionID;
            const imageType = CONST.IOU.ODOMETER_IMAGE_TYPE.END;

            return Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction)
                .then(() => {
                    removeMoneyRequestOdometerImage(transaction, imageType, false, false);
                    return waitForBatchedUpdates();
                })
                .then(() => getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`))
                .then((updatedTransaction) => {
                    expect(updatedTransaction?.comment?.odometerEndImage).toBeUndefined();
                });
        });
    });

    describe('saveOdometerDraft', () => {
        afterEach(() => Onyx.set(ONYXKEYS.ODOMETER_DRAFT, null));

        // The image's lastModified must be persisted alongside the serialized image so the re-minted image can
        // restore it and keep its identity stable across the draft round-trip.
        it('persists the image lastModified into the draft', () => {
            const startImage = {uri: 'blob:start', name: 'a.jpg', type: 'image/jpeg', size: 1234, lastModified: 1700000000000};

            return saveOdometerDraft({startImage})
                .then(() => getOnyxValue(ONYXKEYS.ODOMETER_DRAFT))
                .then((odometerDraft) => {
                    expect(odometerDraft?.odometerStartImageLastModified).toBe(1700000000000);
                });
        });

        // A native/string image (or one without lastModified) must not write a stray lastModified field.
        it('omits lastModified when the image does not carry one', () => {
            const startImage = {uri: 'blob:start', name: 'a.jpg', type: 'image/jpeg', size: 1234};

            return saveOdometerDraft({startImage})
                .then(() => getOnyxValue(ONYXKEYS.ODOMETER_DRAFT))
                .then((odometerDraft) => {
                    expect(odometerDraft?.odometerStartImageLastModified).toBeUndefined();
                });
        });
    });

    describe('isOdometerDraftPendingHydration (directional)', () => {
        it('returns false when there is no draft (no save-for-later flow)', () => {
            expect(isOdometerDraftPendingHydration(undefined, {odometerStart: 120, odometerEnd: 300})).toBe(false);
        });

        it('is pending while the transaction is still MISSING readings the draft carries (the hydration window)', () => {
            const draft = {odometerStartReading: 100, odometerEndReading: 250};
            expect(isOdometerDraftPendingHydration(draft, undefined)).toBe(true);
            expect(isOdometerDraftPendingHydration(draft, {})).toBe(true);
            // Partially hydrated (start landed, end not yet) is still pending.
            expect(isOdometerDraftPendingHydration(draft, {odometerStart: 100})).toBe(true);
        });

        // After Next the transaction holds new readings but the draft still holds the old ones (Next doesn't write
        // the draft). A staler-than-transaction draft must read as NOT pending, else the baseline defers forever
        it('is NOT pending once the transaction holds the readings, even if the draft is now staler', () => {
            const staleDraft = {odometerStartReading: 100, odometerEndReading: 250};
            const newerComment = {odometerStart: 120, odometerEnd: 300};
            expect(isOdometerDraftPendingHydration(staleDraft, newerComment)).toBe(false);
        });

        // A readings-bearing draft hydrates atomically, so once the transaction holds the readings a still-missing
        // image is a deliberate user removal, NOT pending hydration (else the baseline would defer forever)
        it('is NOT pending when a readings-bearing draft is hydrated but its image was removed from the transaction', () => {
            const draft = {odometerStartReading: 100, odometerEndReading: 250, odometerStartImage: 'data:image/png;base64,xxx'};
            expect(isOdometerDraftPendingHydration(draft, {odometerStart: 100, odometerEnd: 250})).toBe(false);
        });

        // A readings + image draft on a fresh/wiped transaction is still pending via the readings (the image
        // rides along in the same atomic hydration merge), so it must hydrate after a refresh
        it('is pending while a readings+image draft has not hydrated into an empty transaction', () => {
            const draft = {odometerStartReading: 100, odometerEndReading: 250, odometerStartImage: 'data:image/png;base64,xxx'};
            expect(isOdometerDraftPendingHydration(draft, {})).toBe(true);
        });

        // An image-only draft (no readings) has no reading to mark the hydration window, so its image presence is
        // what signals "still pending" - required so an image-only save-for-later restores after a page refresh
        it('is pending while an image-only draft is missing from the transaction', () => {
            const draft = {odometerStartImage: 'data:image/png;base64,xxx'};
            expect(isOdometerDraftPendingHydration(draft, {})).toBe(true);
            expect(isOdometerDraftPendingHydration(draft, {odometerEndImage: {uri: 'other.uri'}})).toBe(true);
        });

        it('is NOT pending once an image-only draft has hydrated into the transaction', () => {
            const draft = {odometerStartImage: 'data:image/png;base64,xxx'};
            expect(isOdometerDraftPendingHydration(draft, {odometerStartImage: {uri: 'image.uri'}})).toBe(false);
        });

        it('is NOT pending when the transaction already has an image the draft lacks (transaction is ahead)', () => {
            const draft = {odometerStartReading: 100, odometerEndReading: 250};
            const comment = {odometerStart: 100, odometerEnd: 250, odometerStartImage: {uri: 'image.uri'}};
            expect(isOdometerDraftPendingHydration(draft, comment)).toBe(false);
        });
    });

    describe('getOdometerHasUnsavedChanges', () => {
        // Guard active, not mid-typing, a save-for-later readings draft that has fully hydrated into the
        // transaction, image URIs matching their baseline, no reading change => nothing unsaved
        const STEADY: OdometerUnsavedChangesState = {
            isGuardActive: true,
            isUserTyping: false,
            odometerDraft: {odometerStartReading: 100, odometerEndReading: 250},
            currentComment: {odometerStart: 100, odometerEnd: 250},
            transactionStartImageUri: '',
            transactionEndImageUri: '',
            baselineStartImageUri: '',
            baselineEndImageUri: '',
            hasReadingChanges: false,
        };

        const buildState = (overrides: Partial<OdometerUnsavedChangesState> = {}): OdometerUnsavedChangesState => ({...STEADY, ...overrides});

        it('returns false in a steady state (draft hydrated, nothing changed)', () => {
            expect(getOdometerHasUnsavedChanges(STEADY)).toBe(false);
        });

        it('returns false when the discard guard is inactive, even if everything else looks changed', () => {
            expect(
                getOdometerHasUnsavedChanges(
                    buildState({
                        isGuardActive: false,
                        isUserTyping: true,
                        hasReadingChanges: true,
                        transactionStartImageUri: 'b.jpg',
                        baselineStartImageUri: 'a.jpg',
                    }),
                ),
            ).toBe(false);
        });

        // The user ADDS an image the draft lacked, so the transaction is ahead of the draft. The presence-only
        // isOdometerDraftPendingHydration reports "not pending", so without the image guard the modal is suppressed
        it('detects an added image when the draft carried none (the false-negative being fixed)', () => {
            expect(getOdometerHasUnsavedChanges(buildState({transactionStartImageUri: 'new.jpg', baselineStartImageUri: ''}))).toBe(true);
        });

        // Mirror regression guard: a readings-bearing draft whose image is absent from the transaction (removed)
        // has no transaction-vs-baseline image diff, so it must STAY silent (the previously-fixed false-positive)
        it('stays silent when the image was removed (baseline and transaction both have no image)', () => {
            expect(
                getOdometerHasUnsavedChanges(
                    buildState({
                        odometerDraft: {odometerStartReading: 100, odometerEndReading: 250, odometerStartImage: 'data:image/png;base64,xxx'},
                        transactionStartImageUri: '',
                        baselineStartImageUri: '',
                    }),
                ),
            ).toBe(false);
        });

        it('detects a swapped image (content differs from the baseline)', () => {
            expect(getOdometerHasUnsavedChanges(buildState({transactionStartImageUri: 'b.jpg', baselineStartImageUri: 'a.jpg'}))).toBe(true);
        });

        it('detects a reading change while the user is actively typing', () => {
            expect(getOdometerHasUnsavedChanges(buildState({isUserTyping: true, hasReadingChanges: true}))).toBe(true);
        });

        // Proves we did NOT gate the clause on !hasReadingChanges: a readings diff that is NOT from live typing
        // (e.g. baseline drift after an external resync) against a hydrated draft must stay suppressed
        it('suppresses a non-typing reading diff against a hydrated draft (readings false-positive guard)', () => {
            expect(getOdometerHasUnsavedChanges(buildState({isUserTyping: false, hasReadingChanges: true}))).toBe(false);
        });

        // User changes a reading + Next with a save-for-later draft, so the transaction is AHEAD of the draft. The
        // directional check reports "not pending", but the change is genuinely unsaved -> leaving MUST still prompt
        it('detects a reading change when the transaction is AHEAD of the draft (changed + Next + back)', () => {
            expect(
                getOdometerHasUnsavedChanges(
                    buildState({
                        odometerDraft: {odometerStartReading: 100, odometerEndReading: 300},
                        currentComment: {odometerStart: 100, odometerEnd: 400},
                        hasReadingChanges: true,
                    }),
                ),
            ).toBe(true);
        });

        it('detects when both readings and an image changed', () => {
            expect(
                getOdometerHasUnsavedChanges(
                    buildState({
                        hasReadingChanges: true,
                        transactionStartImageUri: 'b.jpg',
                        baselineStartImageUri: 'a.jpg',
                    }),
                ),
            ).toBe(true);
        });

        // No save-for-later draft => the draft clause never applies, so a genuine image change must prompt
        it('detects an image change when there is no draft at all', () => {
            expect(getOdometerHasUnsavedChanges(buildState({odometerDraft: undefined, transactionStartImageUri: 'b.jpg', baselineStartImageUri: ''}))).toBe(true);
        });

        it('stays silent when a saved-for-later draft is re-entered with no change', () => {
            expect(getOdometerHasUnsavedChanges(buildState())).toBe(false);
        });
    });

    describe('getOdometerImageIdentity (re-mint-invariant)', () => {
        it('is empty for a missing image', () => {
            expect(getOdometerImageIdentity(undefined)).toBe('');
            expect(getOdometerImageIdentity(null)).toBe('');
        });

        // A non-user blob re-mint (base64 -> blob on resume/reload) keeps name + size and only changes the uri, so
        // the identity must stay equal - this is what lets the discard guard stay silent on a re-mint
        it('is invariant under a blob re-mint (same name + size, new uri)', () => {
            const original = {uri: 'blob:abc', name: 'a.jpg', type: 'image/jpeg', size: 1234};
            const reminted = {uri: 'blob:xyz', name: 'a.jpg', type: 'image/jpeg', size: 1234};
            expect(getOdometerImageIdentity(reminted)).toBe(getOdometerImageIdentity(original));
        });

        // A genuine user swap is a different file (different name and/or size), so the identity must change - this is
        // what lets the discard guard fire on an add/swap/remove
        it('changes when the user swaps to a different file (different name and size)', () => {
            const a = {uri: 'blob:abc', name: 'a.jpg', type: 'image/jpeg', size: 1234};
            const b = {uri: 'blob:xyz', name: 'b.jpg', type: 'image/jpeg', size: 5678};
            expect(getOdometerImageIdentity(b)).not.toBe(getOdometerImageIdentity(a));
        });

        // Two genuinely different files can share the same filename AND byte size; lastModified disambiguates them so
        // the discard guard still fires on the swap (the collision the name|size-only identity missed).
        it('changes when the user swaps to a same-name/same-size file with a different lastModified', () => {
            const a = {uri: 'blob:abc', name: 'a.jpg', type: 'image/jpeg', size: 1234, lastModified: 1000};
            const b = {uri: 'blob:xyz', name: 'a.jpg', type: 'image/jpeg', size: 1234, lastModified: 2000};
            expect(getOdometerImageIdentity(b)).not.toBe(getOdometerImageIdentity(a));
        });

        // lastModified is preserved across the draft round-trip, so a re-mint that keeps name + size + lastModified
        // (only the uri changes) must stay invariant - the discard guard must not fire on a resume/reload.
        it('is invariant under a re-mint that keeps name + size + lastModified (new uri only)', () => {
            const original = {uri: 'blob:abc', name: 'a.jpg', type: 'image/jpeg', size: 1234, lastModified: 1000};
            const reminted = {uri: 'blob:xyz', name: 'a.jpg', type: 'image/jpeg', size: 1234, lastModified: 1000};
            expect(getOdometerImageIdentity(reminted)).toBe(getOdometerImageIdentity(original));
        });

        it('uses the uri string directly for native images', () => {
            expect(getOdometerImageIdentity('file:///path/to/a.jpg')).toBe('file:///path/to/a.jpg');
        });
    });
});
