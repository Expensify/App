import Onyx from 'react-native-onyx';
import {getUpdateMoneyRequestParams} from '@libs/actions/IOU/UpdateMoneyRequest';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists, RecentlyUsedTags, Report} from '@src/types/onyx';
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
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            transactionChanges: {merchant: 'Some Merchant'},
            policy: undefined,
            policyTagList,
            reportPolicyTags: policyTagList,
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            iouReportNextStep: undefined,
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
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            transactionChanges: {tag: tag1},
            policy: undefined,
            policyTagList,
            reportPolicyTags: policyTagList,
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            iouReportNextStep: undefined,
        });

        // Then the tag should appear in the recently used tags for the correct policy and tag list
        const recentlyUsedTagsEntry = onyxData.optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`);
        expect(recentlyUsedTagsEntry).toBeDefined();
        const value = recentlyUsedTagsEntry?.value as RecentlyUsedTags;
        expect(value[tagListName]).toContain(tag1);
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
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            transactionChanges: {tag: tag2},
            policy: undefined,
            policyTagList,
            reportPolicyTags: policyTagList,
            policyRecentlyUsedTags: {[tagListName]: [tag1]},
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            iouReportNextStep: undefined,
        });

        // Then the new tag should be first and the old tag should still be present
        const recentlyUsedTagsEntry = onyxData.optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`);
        expect(recentlyUsedTagsEntry).toBeDefined();
        const value = recentlyUsedTagsEntry?.value as RecentlyUsedTags;
        expect(value[tagListName].at(0)).toBe(tag2);
        expect(value[tagListName]).toContain(tag1);
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
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            transactionChanges: {tag: tag1},
            policy: undefined,
            policyTagList,
            reportPolicyTags: policyTagList,
            policyRecentlyUsedTags: {[tagListName]: [tag1, tag2]},
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            iouReportNextStep: undefined,
        });

        // Then tag1 should appear exactly once and be at the front
        const recentlyUsedTagsEntry = onyxData.optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`);
        expect(recentlyUsedTagsEntry).toBeDefined();
        const value = recentlyUsedTagsEntry?.value as RecentlyUsedTags;
        expect(value[tagListName].filter((t) => t === tag1).length).toBe(1);
        expect(value[tagListName].at(0)).toBe(tag1);
    });

    it('should fall back to the same behavior as passing an empty policyTagList when policyTagList is undefined and Onyx has no policy tags data', () => {
        // Given no policyTagList is provided and no policy tags in Onyx
        const tag1 = 'tag1';

        // When updating the tag with policyTagList: undefined
        const {onyxData: withUndefined} = getUpdateMoneyRequestParams({
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            transactionChanges: {tag: tag1},
            policy: undefined,
            policyTagList: undefined,
            reportPolicyTags: undefined,
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            iouReportNextStep: undefined,
        });

        // When updating the tag with policyTagList: {} (empty)
        const {onyxData: withEmpty} = getUpdateMoneyRequestParams({
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            iouReport,
            transactionChanges: {tag: tag1},
            policy: undefined,
            policyTagList: {},
            reportPolicyTags: {},
            policyCategories: undefined,
            currentUserAccountIDParam: RORY_ACCOUNT_ID,
            currentUserEmailParam: RORY_EMAIL,
            isASAPSubmitBetaEnabled: false,
            iouReportNextStep: undefined,
        });

        // Then both should produce the same optimistic data (getPolicyTagsData returns {} when no Onyx data)
        const entryWithUndefined = withUndefined.optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`);
        const entryWithEmpty = withEmpty.optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`);
        expect(entryWithUndefined?.value).toEqual(entryWithEmpty?.value);
    });
});
