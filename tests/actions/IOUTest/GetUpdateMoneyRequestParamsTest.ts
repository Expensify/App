import {getUpdateMoneyRequestParams} from '@libs/actions/IOU/UpdateMoneyRequest';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists, RecentlyUsedTags, Report, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import {getCurrencyDecimalsLocal, getCurrencySymbolLocal} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissModalWithReport: jest.fn(),
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
    navigationRef: {
        getRootState: jest.fn(),
    },
}));

jest.mock('@react-navigation/native');

jest.mock('@src/libs/actions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@src/libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...originalModule,
        notifyNewAction: jest.fn(),
    };
});

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

const TRANSACTION_ID = 'testTransactionID';
const REPORT_ID = 'testReportID';
const IOU_REPORT_ID = 'testIOUReportID';
const POLICY_ID = 'testPolicyID';

function isRecentlyUsedTags<TKey extends string>(value: unknown, tagListName: TKey): value is Pick<RecentlyUsedTags, TKey> {
    if (!isRecord(value)) {
        return false;
    }

    const tags = value[tagListName];
    return Array.isArray(tags) && tags.every((tag: unknown): tag is string => typeof tag === 'string');
}

const transactionThreadReport: Report = {
    reportID: REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    parentReportID: IOU_REPORT_ID,
    parentReportActionID: 'testParentReportActionID',
} as Report;

const iouReport: Report = {
    reportID: IOU_REPORT_ID,
    type: CONST.REPORT.TYPE.IOU,
    policyID: POLICY_ID,
    total: 1000,
    currency: CONST.CURRENCY.USD,
    ownerAccountID: RORY_ACCOUNT_ID,
} as Report;

beforeAll(() => {
    Onyx.init({
        keys: ONYXKEYS,
        initialKeyStates: {
            [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
        },
    });
    initOnyxDerivedValues();
    IntlStore.load(CONST.LOCALES.EN);
    return waitForBatchedUpdates();
});

beforeEach(() => {
    return Onyx.clear().then(waitForBatchedUpdates);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('getUpdateMoneyRequestParams — policyTagList', () => {
    it('should NOT add POLICY_RECENTLY_USED_TAGS to optimisticData when tag is not in transactionChanges', () => {
        // Given a policyTagList with tags
        const tagListName = 'Category';
        const tag1 = 'tag1';
        const policyTagList: PolicyTagLists = {
            [tagListName]: {
                name: tagListName,
                required: false,
                orderWeight: 0,
                tags: {[tag1]: {enabled: true, name: tag1}},
            },
        };

        // When updating a field other than tag
        const {onyxData} = getUpdateMoneyRequestParams({
            iouReportOwnerLogin: undefined,
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            delegateAccountID: undefined,
            transactionChanges: {merchant: 'Some Merchant'},
            policy: undefined,
            policyTagList,
            reportPolicyTags: policyTagList,
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            isTrackIntentUser: false,
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            getCurrencySymbol: getCurrencySymbolLocal,
        });

        // Then no recently used tags entry should be added
        const recentlyUsedTagsEntry = onyxData.optimisticData?.find((entry) => String(entry.key).includes(ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS));
        expect(recentlyUsedTagsEntry).toBeUndefined();
    });

    it('should add the new tag to POLICY_RECENTLY_USED_TAGS in optimisticData when tag changes', () => {
        // Given a policyTagList with two tags
        const tagListName = 'Category';
        const tag1 = 'tag1';
        const tag2 = 'tag2';
        const policyTagList: PolicyTagLists = {
            [tagListName]: {
                name: tagListName,
                required: false,
                orderWeight: 0,
                tags: {[tag1]: {enabled: true, name: tag1}, [tag2]: {enabled: true, name: tag2}},
            },
        };

        // When updating the tag field
        const {onyxData} = getUpdateMoneyRequestParams({
            iouReportOwnerLogin: undefined,
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            delegateAccountID: undefined,
            transactionChanges: {tag: tag1},
            policy: undefined,
            policyTagList,
            reportPolicyTags: policyTagList,
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            isTrackIntentUser: false,
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            getCurrencySymbol: getCurrencySymbolLocal,
        });

        // Then the tag should appear in the recently used tags for the correct policy and tag list
        const recentlyUsedTagsEntry = onyxData.optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`);
        expect(recentlyUsedTagsEntry).toBeDefined();
        if (!recentlyUsedTagsEntry || !isRecentlyUsedTags(recentlyUsedTagsEntry.value, tagListName)) {
            throw new Error('Expected recently used tags for the changed tag list');
        }
        expect(recentlyUsedTagsEntry.value[tagListName]).toContain(tag1);
    });

    it('should prepend the new tag before existing recently used tags', () => {
        // Given a policyTagList and an existing recently used tag
        const tagListName = 'Category';
        const tag1 = 'tag1';
        const tag2 = 'tag2';
        const policyTagList: PolicyTagLists = {
            [tagListName]: {
                name: tagListName,
                required: false,
                orderWeight: 0,
                tags: {[tag1]: {enabled: true, name: tag1}, [tag2]: {enabled: true, name: tag2}},
            },
        };

        // When updating the tag to tag2 while tag1 is already in recently used
        const {onyxData} = getUpdateMoneyRequestParams({
            iouReportOwnerLogin: undefined,
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            delegateAccountID: undefined,
            transactionChanges: {tag: tag2},
            policy: undefined,
            policyTagList,
            reportPolicyTags: policyTagList,
            policyRecentlyUsedTags: {[tagListName]: [tag1]},
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            isTrackIntentUser: false,
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            getCurrencySymbol: getCurrencySymbolLocal,
        });

        // Then the new tag should be first and the old tag should still be present
        const recentlyUsedTagsEntry = onyxData.optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`);
        expect(recentlyUsedTagsEntry).toBeDefined();
        if (!recentlyUsedTagsEntry || !isRecentlyUsedTags(recentlyUsedTagsEntry.value, tagListName)) {
            throw new Error('Expected recently used tags for the changed tag list');
        }
        expect(recentlyUsedTagsEntry.value[tagListName].at(0)).toBe(tag2);
        expect(recentlyUsedTagsEntry.value[tagListName]).toContain(tag1);
    });

    it('should deduplicate when the same tag is set again', () => {
        // Given a policyTagList and tag1 already in recently used
        const tagListName = 'Category';
        const tag1 = 'tag1';
        const tag2 = 'tag2';
        const policyTagList: PolicyTagLists = {
            [tagListName]: {
                name: tagListName,
                required: false,
                orderWeight: 0,
                tags: {[tag1]: {enabled: true, name: tag1}, [tag2]: {enabled: true, name: tag2}},
            },
        };

        // When updating the tag to tag1 which already exists in recently used
        const {onyxData} = getUpdateMoneyRequestParams({
            iouReportOwnerLogin: undefined,
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            delegateAccountID: undefined,
            transactionChanges: {tag: tag1},
            policy: undefined,
            policyTagList,
            reportPolicyTags: policyTagList,
            policyRecentlyUsedTags: {[tagListName]: [tag1, tag2]},
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            isTrackIntentUser: false,
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            getCurrencySymbol: getCurrencySymbolLocal,
        });

        // Then tag1 should appear exactly once and be at the front
        const recentlyUsedTagsEntry = onyxData.optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`);
        expect(recentlyUsedTagsEntry).toBeDefined();
        if (!recentlyUsedTagsEntry || !isRecentlyUsedTags(recentlyUsedTagsEntry.value, tagListName)) {
            throw new Error('Expected recently used tags for the changed tag list');
        }
        expect(recentlyUsedTagsEntry.value[tagListName].filter((tag) => tag === tag1)).toHaveLength(1);
        expect(recentlyUsedTagsEntry.value[tagListName].at(0)).toBe(tag1);
    });

    it('should fall back to the same behavior as passing an empty policyTagList when policyTagList is undefined and Onyx has no policy tags data', () => {
        // Given no policyTagList is provided and no policy tags in Onyx
        const tag1 = 'tag1';

        // When updating the tag with policyTagList: undefined
        const {onyxData: withUndefined} = getUpdateMoneyRequestParams({
            iouReportOwnerLogin: undefined,
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            delegateAccountID: undefined,
            transactionChanges: {tag: tag1},
            policy: undefined,
            policyTagList: undefined,
            reportPolicyTags: undefined,
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            isTrackIntentUser: false,
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            getCurrencySymbol: getCurrencySymbolLocal,
        });

        // When updating the tag with policyTagList: {} (empty)
        const {onyxData: withEmpty} = getUpdateMoneyRequestParams({
            iouReportOwnerLogin: undefined,
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            delegateAccountID: undefined,
            transactionChanges: {tag: tag1},
            policy: undefined,
            policyTagList: {},
            reportPolicyTags: {},
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            isTrackIntentUser: false,
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            getCurrencySymbol: getCurrencySymbolLocal,
        });

        // Then both should produce the same optimistic data (an undefined policy tag list is treated the same as an empty one)
        const entryWithUndefined = withUndefined.optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`);
        const entryWithEmpty = withEmpty.optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`);
        expect(entryWithUndefined?.value).toEqual(entryWithEmpty?.value);
    });
});

describe('getUpdateMoneyRequestParams — distance rate change with pending waypoints', () => {
    const distancePolicy: Policy = {
        ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
        id: POLICY_ID,
        customUnits: {
            distance: {
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                customUnitID: 'distance',
                rates: {
                    rate1: {customUnitRateID: 'rate1', currency: CONST.CURRENCY.USD, rate: 1},
                    rate2: {customUnitRateID: 'rate2', currency: CONST.CURRENCY.USD, rate: 2},
                },
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
            },
        },
    };

    function buildDistanceTransaction(overrides: Partial<Transaction>): Transaction {
        return {
            transactionID: TRANSACTION_ID,
            reportID: IOU_REPORT_ID,
            amount: 1000,
            currency: CONST.CURRENCY.USD,
            created: '2024-01-01',
            merchant: '10.00 mi @ $1.00 / mi',
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
            comment: {
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    customUnitRateID: 'rate1',
                    distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                },
            },
            pendingFields: {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            ...overrides,
        } as Transaction;
    }

    function getParamsForRateChange() {
        return getUpdateMoneyRequestParams({
            iouReportOwnerLogin: undefined,
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            delegateAccountID: undefined,
            transactionChanges: {customUnitRateID: 'rate2'},
            policy: distancePolicy,
            policyTagList: undefined,
            reportPolicyTags: undefined,
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            isTrackIntentUser: false,
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            getCurrencySymbol: getCurrencySymbolLocal,
        });
    }

    it('should build an optimistic MODIFIED_EXPENSE when the route distance is already known locally', async () => {
        // Given a distance expense whose waypoints are pending on the server but whose route distance is known locally
        await Onyx.merge(
            `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`,
            buildDistanceTransaction({
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        customUnitRateID: 'rate1',
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        quantity: 10,
                    },
                },
            }),
        );
        await waitForBatchedUpdates();

        // When changing the distance rate
        const {params} = getParamsForRateChange();

        // Then the report action is created optimistically instead of being deferred to the server
        expect(params.reportActionID).toBeDefined();
    });

    it('should NOT build an optimistic MODIFIED_EXPENSE when no route distance is known locally', async () => {
        // Given a distance expense with pending waypoints and no locally known distance (no quantity, no routes)
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, buildDistanceTransaction({}));
        await waitForBatchedUpdates();

        // When changing the distance rate
        const {params} = getParamsForRateChange();

        // Then the report action is left to the server, which owns the MapBox route response
        expect(params.reportActionID).toBeUndefined();
    });

    it('should NOT build an optimistic MODIFIED_EXPENSE when the pending waypoint edit zeroed the amount, leaving a stale distance', async () => {
        // Given a distance expense whose waypoints were just edited: the amount was zeroed while the server
        // recomputes the route, so the leftover quantity/routes from the pre-edit route are stale
        await Onyx.merge(
            `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`,
            buildDistanceTransaction({
                amount: 0,
                modifiedAmount: 0,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        customUnitRateID: 'rate1',
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        quantity: 10,
                    },
                },
                routes: {
                    route0: {
                        distance: 16093,
                        geometry: {
                            coordinates: [
                                [0, 0],
                                [1, 1],
                            ],
                            type: 'LineString',
                        },
                    },
                },
            }),
        );
        await waitForBatchedUpdates();

        // When changing the distance rate
        const {params} = getParamsForRateChange();

        // Then the stale distance is not used to build an optimistic report action
        expect(params.reportActionID).toBeUndefined();
    });
});

describe('getUpdateMoneyRequestParams — receipt page count', () => {
    const WAYPOINTS = {
        waypoint0: {address: '123 Start St', lat: 40.7128, lng: -74.006, keyForList: 'start'},
        waypoint1: {address: '456 End Ave', lat: 41.5, lng: -73.5, keyForList: 'stop'},
    };

    function buildTransactionWithMultiPagePDF(iouRequestType: Transaction['iouRequestType'], waypoints?: typeof WAYPOINTS): Transaction {
        return {
            transactionID: TRANSACTION_ID,
            reportID: IOU_REPORT_ID,
            amount: 1000,
            currency: CONST.CURRENCY.USD,
            created: '2024-01-01',
            merchant: '10.00 mi @ $1.00 / mi',
            iouRequestType,
            comment: {...(waypoints ? {waypoints} : {})},
            receipt: {source: 'https://example.com/receipt.pdf', filename: 'receipt.pdf', pageCount: 3},
        } as Transaction;
    }

    function getOptimisticPageCountForDistanceChange() {
        const {onyxData} = getUpdateMoneyRequestParams({
            iouReportOwnerLogin: undefined,
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            delegateAccountID: undefined,
            transactionChanges: {distance: 20},
            policy: undefined,
            policyTagList: undefined,
            reportPolicyTags: undefined,
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            isTrackIntentUser: false,
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            getCurrencySymbol: getCurrencySymbolLocal,
        });

        const optimisticTransaction: unknown = onyxData.optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`)?.value;
        if (!isRecord(optimisticTransaction) || !isRecord(optimisticTransaction.receipt)) {
            throw new Error('Expected an optimistic transaction with a receipt');
        }
        return optimisticTransaction.receipt.pageCount;
    }

    it('clears the page count when the map receipt is about to be regenerated', async () => {
        // Given a map distance expense whose receipt is a 3-page PDF
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, buildTransactionWithMultiPagePDF(CONST.IOU.REQUEST_TYPE.DISTANCE_MAP, WAYPOINTS));
        await waitForBatchedUpdates();

        // When the distance changes
        // Then the stale count is cleared so the badge cannot outlive the receipt it described
        expect(getOptimisticPageCountForDistanceChange()).toBeNull();
    });

    it('clears the page count for a manual distance expense that carries waypoints', async () => {
        // Given a manual distance expense that still has waypoints, so its receipt is a generated map
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, buildTransactionWithMultiPagePDF(CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL, WAYPOINTS));
        await waitForBatchedUpdates();

        // When the distance changes
        expect(getOptimisticPageCountForDistanceChange()).toBeNull();
    });

    it('keeps the page count for an odometer expense, whose receipt is uploaded', async () => {
        // Given an odometer distance expense whose 3-page PDF was uploaded by the user
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, buildTransactionWithMultiPagePDF(CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER));
        await waitForBatchedUpdates();

        // When the distance changes
        // Then the count survives, because nothing regenerates that receipt
        expect(getOptimisticPageCountForDistanceChange()).toBe(3);
    });
});
