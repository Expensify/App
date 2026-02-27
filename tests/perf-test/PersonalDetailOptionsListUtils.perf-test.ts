import type * as NativeNavigation from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import {createOptionList, getValidOptions} from '@libs/PersonalDetailOptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import {getRandomDate} from '../utils/collections/reportActions';
import {formatPhoneNumber} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORTS_COUNT = 1000;
const PERSONAL_DETAILS_LIST_COUNT = 5000;
const SEARCH_VALUE = 'TestingValue';

const personalDetails = createCollection<PersonalDetails>(
    (item) => item.accountID,
    (index) => createPersonalDetails(index),
    PERSONAL_DETAILS_LIST_COUNT,
);

const reports = createCollection<Report>(
    (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
    (index) => ({
        reportID: index.toString(),
        type: CONST.REPORT.TYPE.CHAT,
        participants: {
            [index]: {
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            },
            [REPORTS_COUNT + 1]: {
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            },
        },
        lastVisibleActionCreated: getRandomDate(),
    }),
    REPORTS_COUNT,
);

const accountIDToReportIDMap: Record<number, string> = {};
for (let i = 0; i < REPORTS_COUNT; i++) {
    accountIDToReportIDMap[i] = reports[`${ONYXKEYS.COLLECTION.REPORT}${i}`].reportID;
}

const options = createOptionList(REPORTS_COUNT + 1, personalDetails, accountIDToReportIDMap, reports, undefined, {}, formatPhoneNumber);

const selectedOptions = options.options.map((option, index) => ({
    ...option,
    isSelected: index % 10 === 0,
}));

const currentLogin = personalDetails[REPORTS_COUNT + 1].login ?? '';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        createNavigationContainerRef: () => ({
            getState: () => jest.fn(),
        }),
    };
});

describe('PersonalDetailsOptionsListUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });

        Onyx.multiSet({
            ...personalDetails,
            ...(reports as Record<`${typeof ONYXKEYS.COLLECTION.REPORT}`, Report>),
        });
    });

    afterAll(() => {
        Onyx.clear();
    });

    test('[PersonalDetailsOptionsListUtils] getValidOptions with includeRecentReports=false', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => getValidOptions(options.options, currentLogin, formatPhoneNumber, 1, undefined, {includeRecentReports: false}));
    });

    test('[PersonalDetailsOptionsListUtils] getValidOptions with includeRecentReports=true', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => getValidOptions(options.options, currentLogin, formatPhoneNumber, 1, undefined, {includeRecentReports: true}));
    });

    test('[PersonalDetailsOptionsListUtils] getValidOptions with includeRecentReports=false and searchValue', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => getValidOptions(options.options, currentLogin, formatPhoneNumber, 1, undefined, {includeRecentReports: false, searchString: SEARCH_VALUE}));
    });

    test('[PersonalDetailsOptionsListUtils] getValidOptions with includeRecentReports=true and searchValue', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => getValidOptions(options.options, currentLogin, formatPhoneNumber, 1, undefined, {includeRecentReports: true, searchString: SEARCH_VALUE}));
    });

    test('[PersonalDetailsOptionsListUtils] getValidOptions with includeRecentReports=false on selected options', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => getValidOptions(selectedOptions, currentLogin, formatPhoneNumber, 1, undefined, {includeRecentReports: false}));
    });

    test('[PersonalDetailsOptionsListUtils] getValidOptions with includeRecentReports=true on selected options', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => getValidOptions(selectedOptions, currentLogin, formatPhoneNumber, 1, undefined, {includeRecentReports: true}));
    });
});
