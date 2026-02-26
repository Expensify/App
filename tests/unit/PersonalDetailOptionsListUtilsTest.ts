// The rule is disabled for this file as test data uses numeric keys that don't follow naming conventions
/* eslint-disable @typescript-eslint/naming-convention */
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import DateUtils from '@libs/DateUtils';
import {canCreateOptimisticPersonalDetailOption, createOption, createOptionList, filterOption, getValidOptions, matchesSearchTerms} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils/types';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Report} from '@src/types/onyx';
import {formatPhoneNumber} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type PersonalDetailsList = Record<string, PersonalDetails>;

type OptionList = {
    currentUserOption: OptionData | undefined;
    options: OptionData[];
};

describe('PersonalDetailOptionsListUtils', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    // Given a set of reports with both single participants and multiple participants some pinned and some not
    const REPORTS: OnyxCollection<Report> = {
        '2': {
            lastReadTime: '2021-01-14 11:25:39.296',
            lastVisibleActionCreated: '2022-11-22 03:26:02.016',
            isPinned: false,
            reportID: '2',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                3: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Spider-Man',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // This is the only report we are pinning in this test
        '3': {
            lastReadTime: '2021-01-14 11:25:39.297',
            lastVisibleActionCreated: '2022-11-22 03:26:02.170',
            isPinned: true,
            reportID: '3',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                1: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Mister Fantastic',
            type: CONST.REPORT.TYPE.CHAT,
        },
        '4': {
            lastReadTime: '2021-01-14 11:25:39.298',
            lastVisibleActionCreated: '2022-11-22 03:26:02.180',
            isPinned: false,
            reportID: '4',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                4: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Black Panther',
            type: CONST.REPORT.TYPE.CHAT,
        },
        '5': {
            lastReadTime: '2021-01-14 11:25:39.299',
            lastVisibleActionCreated: '2022-11-22 03:26:02.019',
            isPinned: false,
            reportID: '5',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                5: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Invisible Woman',
            type: CONST.REPORT.TYPE.CHAT,
        },
        '6': {
            lastReadTime: '2021-01-14 11:25:39.300',
            lastVisibleActionCreated: '2022-11-22 03:26:02.020',
            isPinned: false,
            reportID: '6',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                6: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Thor',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // Note: This report has the largest lastVisibleActionCreated
        '7': {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:03.999',
            isPinned: false,
            reportID: '7',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                7: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Captain America',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // Note: This report has no lastVisibleActionCreated
        '8': {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:02.000',
            isPinned: false,
            reportID: '8',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                12: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Silver Surfer',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // Note: This report has an IOU
        '9': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.998',
            isPinned: false,
            reportID: '9',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                8: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Mister Sinister',
            iouReportID: '100',
            type: CONST.REPORT.TYPE.CHAT,
        },
    };

    const REPORTS_WITH_CONCIERGE: OnyxCollection<Report> = {
        ...REPORTS,

        '11': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '11',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                999: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Concierge',
            type: CONST.REPORT.TYPE.CHAT,
        },
    };

    const REPORTS_WITH_CHRONOS: OnyxCollection<Report> = {
        ...REPORTS,
        '12': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '12',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                1000: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Chronos',
            type: CONST.REPORT.TYPE.CHAT,
        },
    };

    const REPORTS_WITH_RECEIPTS: OnyxCollection<Report> = {
        ...REPORTS,
        '13': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '13',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                1001: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Receipts',
            type: CONST.REPORT.TYPE.CHAT,
        },
    };

    const REPORTS_WITH_SELF_DM: OnyxCollection<Report> = {
        ...REPORTS,
        '17': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '17',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: '',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
        },
    };

    const currentUserLogin = 'tonystark@expensify.com';
    const currentUserAccountID = 2;

    // And a set of personalDetails some with existing reports and some without
    const PERSONAL_DETAILS: PersonalDetailsList = {
        // These exist in our reports
        '1': {
            accountID: 1,
            displayName: 'Mister Fantastic',
            login: 'reedrichards@expensify.com',
        },
        '2': {
            accountID: 2,
            displayName: 'Iron Man',
            login: 'tonystark@expensify.com',
        },
        '3': {
            accountID: 3,
            displayName: 'Spider-Man',
            login: 'peterparker@expensify.com',
        },
        '4': {
            accountID: 4,
            displayName: 'Black Panther',
            login: 'tchalla@expensify.com',
        },
        '5': {
            accountID: 5,
            displayName: 'Invisible Woman',
            login: 'suestorm@expensify.com',
        },
        '6': {
            accountID: 6,
            displayName: 'Thor',
            login: 'thor@expensify.com',
        },
        '7': {
            accountID: 7,
            displayName: 'Captain America',
            login: 'steverogers@expensify.com',
        },
        '8': {
            accountID: 8,
            displayName: 'Mr Sinister',
            login: 'mistersinister@marauders.com',
        },

        // These do not exist in reports at all
        '9': {
            accountID: 9,
            displayName: 'Black Widow',
            login: 'natasharomanoff@expensify.com',
        },
        '10': {
            accountID: 10,
            displayName: 'The Incredible Hulk',
            login: 'brucebanner@expensify.com',
        },
        '11': {
            accountID: 11,
            displayName: 'Timothée',
            login: 'chalamet@expensify.com',
        },
    };

    const PERSONAL_DETAILS_WITH_CONCIERGE: PersonalDetailsList = {
        ...PERSONAL_DETAILS,
        '999': {
            accountID: 999,
            displayName: 'Concierge',
            login: 'concierge@expensify.com',
        },
    };

    const PERSONAL_DETAILS_WITH_CHRONOS: PersonalDetailsList = {
        ...PERSONAL_DETAILS,

        '1000': {
            accountID: 1000,
            displayName: 'Chronos',
            login: 'chronos@expensify.com',
        },
    };

    const PERSONAL_DETAILS_WITH_RECEIPTS: PersonalDetailsList = {
        ...PERSONAL_DETAILS,

        '1001': {
            accountID: 1001,
            displayName: 'Receipts',
            login: 'receipts@expensify.com',
        },
    };

    const PERSONAL_DETAILS_WITH_MANAGER_MCTEST: PersonalDetailsList = {
        ...PERSONAL_DETAILS,
        '1003': {
            accountID: 1003,
            displayName: 'Manager McTest',
            login: CONST.EMAIL.MANAGER_MCTEST,
        },
    };

    const ACCOUNT_ID_TO_REPORT_ID_MAP: Record<number, string> = {
        1: '3',
        2: '17', // Self-DM
        3: '2',
        4: '4',
        5: '5',
        6: '6',
        7: '7',
        8: '9',
        12: '8',
        999: '11',
        1000: '12',
        1001: '13',
    };

    const reportNameValuePairs = {
        private_isArchived: DateUtils.getDBTime(),
    };

    // Set the currently logged in user, report data, and personal details
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: 2, email: 'tonystark@expensify.com'},
                [`${ONYXKEYS.COLLECTION.REPORT}100` as const]: {
                    reportID: '',
                    ownerAccountID: 8,
                    total: 1000,
                },
                [ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING]: {},
            },
        });
        Onyx.registerLogger(() => {});
        return waitForBatchedUpdates().then(() => Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS));
    });

    let OPTIONS: OptionList;
    let OPTIONS_WITH_CONCIERGE: OptionList;
    let OPTIONS_WITH_CHRONOS: OptionList;
    let OPTIONS_WITH_RECEIPTS: OptionList;
    let OPTIONS_WITH_MANAGER_MCTEST: OptionList;
    let OPTIONS_WITH_SELF_DM: OptionList;

    function translateReportObjectToOnyxCollection(reports: OnyxCollection<Report>): OnyxCollection<Report> {
        return Object.entries(reports ?? {}).reduce(
            (acc, [, value]) => {
                if (value?.reportID) {
                    acc[`${ONYXKEYS.COLLECTION.REPORT}${value.reportID}`] = value;
                }
                return acc;
            },
            {} as NonNullable<OnyxCollection<Report>>,
        );
    }

    beforeEach(() => {
        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}10`, reportNameValuePairs);
        OPTIONS = createOptionList(currentUserAccountID, PERSONAL_DETAILS, ACCOUNT_ID_TO_REPORT_ID_MAP, translateReportObjectToOnyxCollection(REPORTS), undefined, {}, formatPhoneNumber);
        OPTIONS_WITH_SELF_DM = createOptionList(
            currentUserAccountID,
            PERSONAL_DETAILS,
            ACCOUNT_ID_TO_REPORT_ID_MAP,
            translateReportObjectToOnyxCollection(REPORTS_WITH_SELF_DM),
            undefined,
            {},
            formatPhoneNumber,
        );
        OPTIONS_WITH_CONCIERGE = createOptionList(
            currentUserAccountID,
            PERSONAL_DETAILS_WITH_CONCIERGE,
            ACCOUNT_ID_TO_REPORT_ID_MAP,
            translateReportObjectToOnyxCollection(REPORTS_WITH_CONCIERGE),
            undefined,
            {},
            formatPhoneNumber,
        );
        OPTIONS_WITH_CHRONOS = createOptionList(
            currentUserAccountID,
            PERSONAL_DETAILS_WITH_CHRONOS,
            ACCOUNT_ID_TO_REPORT_ID_MAP,
            translateReportObjectToOnyxCollection(REPORTS_WITH_CHRONOS),
            undefined,
            {},
            formatPhoneNumber,
        );
        OPTIONS_WITH_RECEIPTS = createOptionList(
            currentUserAccountID,
            PERSONAL_DETAILS_WITH_RECEIPTS,
            ACCOUNT_ID_TO_REPORT_ID_MAP,
            translateReportObjectToOnyxCollection(REPORTS_WITH_RECEIPTS),
            undefined,
            {},
            formatPhoneNumber,
        );
        OPTIONS_WITH_MANAGER_MCTEST = createOptionList(
            currentUserAccountID,
            PERSONAL_DETAILS_WITH_MANAGER_MCTEST,
            ACCOUNT_ID_TO_REPORT_ID_MAP,
            translateReportObjectToOnyxCollection(REPORTS),
            undefined,
            {},
            formatPhoneNumber,
        );
    });

    describe('Basic option list test', () => {
        it('should have created the expected number of options', () => {
            // There are 13 personalDetails but one of them is the current user so we expect 12 options
            expect(OPTIONS.options.length).toBe(Object.keys(PERSONAL_DETAILS).length);
            expect(OPTIONS_WITH_CONCIERGE.options.length).toBe(Object.keys(PERSONAL_DETAILS_WITH_CONCIERGE).length);
            expect(OPTIONS_WITH_CHRONOS.options.length).toBe(Object.keys(PERSONAL_DETAILS_WITH_CHRONOS).length);
            expect(OPTIONS_WITH_RECEIPTS.options.length).toBe(Object.keys(PERSONAL_DETAILS_WITH_RECEIPTS).length);
            expect(OPTIONS_WITH_MANAGER_MCTEST.options.length).toBe(Object.keys(PERSONAL_DETAILS_WITH_MANAGER_MCTEST).length);
        });

        it('should have created the expected current user option', () => {
            expect(OPTIONS.currentUserOption).toBeDefined();
            expect(OPTIONS.currentUserOption?.accountID).toBe(currentUserAccountID);
            expect(OPTIONS.currentUserOption?.text).toBe('Iron Man');
            expect(OPTIONS.currentUserOption?.login).toBe(currentUserLogin);
            expect(OPTIONS_WITH_SELF_DM.currentUserOption?.reportID).toBe('17');
        });
    });

    describe('createOption', () => {
        it('should create an option with the given parameters', () => {
            const option = createOption(PERSONAL_DETAILS['1'], REPORTS['3'], formatPhoneNumber);
            expect(option).toEqual({
                accountID: 1,
                allReportErrors: undefined,
                alternateText: 'reedrichards@expensify.com',
                text: 'Mister Fantastic',
                brickRoadIndicator: null,
                icons: [
                    {
                        id: 1,
                        name: 'Mister Fantastic',
                        fallbackIcon: undefined,
                        type: CONST.ICON_TYPE_AVATAR,
                        source: FallbackAvatar,
                    },
                ],
                isDisabled: false,
                isOptimisticPersonalDetail: false,
                isSelected: false,
                keyForList: '1',
                lastVisibleActionCreated: '2022-11-22 03:26:02.170',
                login: 'reedrichards@expensify.com',
                phoneNumber: undefined,
                private_isArchived: undefined,
                reportID: '3',
                selected: false,
                tooltipText: '1',
            });
        });

        it('should create an option with no reportID when report is not provided', () => {
            const option = createOption(PERSONAL_DETAILS['1'], undefined, formatPhoneNumber);
            expect(option).toEqual({
                accountID: 1,
                allReportErrors: undefined,
                alternateText: 'reedrichards@expensify.com',
                text: 'Mister Fantastic',
                brickRoadIndicator: null,
                icons: [
                    {
                        id: 1,
                        name: 'Mister Fantastic',
                        fallbackIcon: undefined,
                        type: CONST.ICON_TYPE_AVATAR,
                        source: FallbackAvatar,
                    },
                ],
                isDisabled: false,
                isOptimisticPersonalDetail: false,
                isSelected: false,
                keyForList: '1',
                lastVisibleActionCreated: undefined,
                login: 'reedrichards@expensify.com',
                phoneNumber: undefined,
                private_isArchived: undefined,
                reportID: undefined,
                selected: false,
                tooltipText: null,
            });
        });

        it('should create an option with isSelected when isSelected is provided', () => {
            const option = createOption(PERSONAL_DETAILS['1'], undefined, formatPhoneNumber, {isSelected: true});
            expect(option).toEqual({
                accountID: 1,
                allReportErrors: undefined,
                alternateText: 'reedrichards@expensify.com',
                text: 'Mister Fantastic',
                brickRoadIndicator: null,
                icons: [
                    {
                        id: 1,
                        name: 'Mister Fantastic',
                        fallbackIcon: undefined,
                        type: CONST.ICON_TYPE_AVATAR,
                        source: FallbackAvatar,
                    },
                ],
                isDisabled: false,
                isOptimisticPersonalDetail: false,
                isSelected: true,
                keyForList: '1',
                lastVisibleActionCreated: undefined,
                login: 'reedrichards@expensify.com',
                phoneNumber: undefined,
                private_isArchived: undefined,
                reportID: undefined,
                selected: false,
                tooltipText: null,
            });
        });
    });

    describe('getValidOptions', () => {
        it('should return empty options when no options are provided', () => {
            const results = getValidOptions([], currentUserLogin, formatPhoneNumber, 1);

            // Then the result should be empty
            expect(results.selectedOptions).toEqual([]);
            expect(results.personalDetails).toEqual([]);
            expect(results.userToInvite).toEqual(null);
            expect(results.recentOptions).toEqual([]);
        });

        describe('Default behavior', () => {
            let defaultOptions: ReturnType<typeof getValidOptions>;
            beforeAll(() => {
                defaultOptions = getValidOptions(OPTIONS.options, currentUserLogin, formatPhoneNumber, 1);
            });
            it('should have 5 recent options', () => {
                expect(defaultOptions.recentOptions.length).toBe(5);
            });

            it('should have 0 selected options', () => {
                expect(defaultOptions.selectedOptions.length).toBe(0);
            });

            it('should not have invited options', () => {
                expect(defaultOptions.userToInvite).toBe(null);
            });

            it('should have personal details options', () => {
                expect(defaultOptions.personalDetails.length).toBe(5);
            });

            it('should not include the current user option', () => {
                const currentUserOption = defaultOptions.personalDetails.find((option) => option.login === currentUserLogin);
                expect(currentUserOption).toBeUndefined();
                const currentUserInRecent = defaultOptions.recentOptions.find((option) => option.login === currentUserLogin);
                expect(currentUserInRecent).toBeUndefined();
            });

            it('should order recent options by lastVisibleActionCreated descending', () => {
                const expectedOrder = ['Captain America', 'Mr Sinister', 'Black Panther', 'Mister Fantastic', 'Thor'];
                const actualOrder = defaultOptions.recentOptions.map((item) => item.text);
                expect(actualOrder).toEqual(expectedOrder);
            });

            it('should order personal details options by name', () => {
                const expectedOrder = ['Black Widow', 'Invisible Woman', 'Spider-Man', 'The Incredible Hulk', 'Timothée'];
                const actualOrder = defaultOptions.personalDetails.map((item) => item.text);
                expect(actualOrder).toEqual(expectedOrder);
            });

            it('should include Concierge by default in results', () => {
                const results = getValidOptions(OPTIONS_WITH_CONCIERGE.options, currentUserLogin, formatPhoneNumber, 1);

                // Then the result should include all personalDetails except the currently logged in user
                expect(results.personalDetails.length).toBe(6);
                // Then the result should include Concierge
                expect(results.recentOptions).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
            });
        });

        it('should return empty recent options when no options are provided', () => {
            const results = getValidOptions(OPTIONS.options, currentUserLogin, formatPhoneNumber, 1, {}, {includeRecentReports: false});

            expect(results.personalDetails.length).toBe(10);
            expect(results.recentOptions).toEqual([]);
        });

        it('should return limited options when searchString is provided', () => {
            const results = getValidOptions(OPTIONS.options, currentUserLogin, formatPhoneNumber, 1, undefined, {searchString: 'er'});

            const expectedPersonalDetails = ['The Incredible Hulk'];
            const resultPersonalDetails = results.personalDetails.map((item) => item.text);
            expect(resultPersonalDetails).toEqual(expectedPersonalDetails);
            const expectedRecentOptions = ['Captain America', 'Mr Sinister', 'Black Panther', 'Mister Fantastic', 'Spider-Man'];
            const resultRecentOptions = results.recentOptions.map((item) => item.text);
            expect(resultRecentOptions).toEqual(expectedRecentOptions);
        });

        it('should return current user as valid option when includeCurrentUser is provided', () => {
            const results = getValidOptions(OPTIONS.options, currentUserLogin, formatPhoneNumber, 1, undefined, {includeCurrentUser: true});

            const combinedLength = results.personalDetails.length + results.recentOptions.length;
            expect(combinedLength).toBe(11);
            expect(results.personalDetails).toEqual(expect.arrayContaining([expect.objectContaining({login: currentUserLogin})]));
        });

        it('should limit recent options when recentMaxElements is provided', () => {
            const results = getValidOptions(OPTIONS.options, currentUserLogin, formatPhoneNumber, 1, undefined, {recentMaxElements: 2});
            expect(results.recentOptions.length).toBe(2);
            expect(results.personalDetails.length).toBe(8);
        });

        it('should limit personal detail options when maxElements is provided', () => {
            const results = getValidOptions(OPTIONS.options, currentUserLogin, formatPhoneNumber, 1, undefined, {maxElements: 2});
            expect(results.recentOptions.length).toBe(5);
            expect(results.personalDetails.length).toBe(2);
        });

        describe('excludedLogins', () => {
            it('should exclude Concierge when excludedLogins is specified', () => {
                const results = getValidOptions(OPTIONS_WITH_CONCIERGE.options, currentUserLogin, formatPhoneNumber, 1, undefined, {
                    excludeLogins: {[CONST.EMAIL.CONCIERGE]: true},
                });

                expect(results.personalDetails.length).toBe(5);
                expect(results.recentOptions).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
                expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
            });

            it('should exclude Chronos when excludedLogins is specified', () => {
                const results = getValidOptions(OPTIONS_WITH_CHRONOS.options, currentUserLogin, formatPhoneNumber, 1, undefined, {
                    excludeLogins: {[CONST.EMAIL.CHRONOS]: true},
                });

                expect(results.personalDetails.length).toBe(5);
                expect(results.recentOptions).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));
                expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));
            });

            it('should exclude Receipts when excludedLogins is specified', () => {
                const results = getValidOptions(OPTIONS_WITH_RECEIPTS.options, currentUserLogin, formatPhoneNumber, 1, undefined, {
                    excludeLogins: {[CONST.EMAIL.RECEIPTS]: true},
                });

                expect(results.personalDetails.length).toBe(5);
                expect(results.recentOptions).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
                expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
            });
        });

        describe('Invite user', () => {
            it('should return nothing if includeUserToInvite is false / default behavior', () => {
                const results = getValidOptions(OPTIONS.options, currentUserLogin, formatPhoneNumber, 1, undefined, {searchString: 'abc@def.com'});
                expect(results.userToInvite).toBe(null);
            });

            it('should return userToInvite if includeUserToInvite is true', () => {
                const results = getValidOptions(OPTIONS.options, currentUserLogin, formatPhoneNumber, 1, undefined, {searchString: 'abc@def.com', includeUserToInvite: true});
                expect(results.userToInvite).toEqual(expect.objectContaining({login: 'abc@def.com'}));
            });

            it('should return nothing if includeUserToInvite is true and searchString is present in logins', () => {
                const results = getValidOptions(OPTIONS.options, currentUserLogin, formatPhoneNumber, 1, {'abc@def.com': {}}, {searchString: 'abc@def.com', includeUserToInvite: true});
                expect(results.userToInvite).toBe(null);
            });

            it('should return nothing if includeUserToInvite is true and email is not valid', () => {
                const results = getValidOptions(OPTIONS.options, currentUserLogin, formatPhoneNumber, 1, undefined, {searchString: 'invalid-email', includeUserToInvite: true});
                expect(results.userToInvite).toBe(null);
            });

            it('should return userToInvite with invalid email if includeUserToInvite is true and shouldAcceptName is also true', () => {
                const results = getValidOptions(OPTIONS.options, currentUserLogin, formatPhoneNumber, 1, undefined, {
                    searchString: 'invalid-email',
                    includeUserToInvite: true,
                    shouldAcceptName: true,
                });
                expect(results.userToInvite).toEqual(expect.objectContaining({login: 'invalid-email'}));
            });

            it("should return userToInvite if includeUserToInvite is true and it's a valid phone number (without country code)", () => {
                const results = getValidOptions(OPTIONS.options, currentUserLogin, formatPhoneNumber, 1, undefined, {searchString: '5005550006', includeUserToInvite: true});
                expect(results.userToInvite).toEqual(expect.objectContaining({login: '+15005550006'}));
            });

            it("should return userToInvite if includeUserToInvite is true and it's a valid phone number (with country code)", () => {
                const results = getValidOptions(OPTIONS.options, currentUserLogin, formatPhoneNumber, 1, undefined, {searchString: '+15005550006', includeUserToInvite: true});
                expect(results.userToInvite).toEqual(expect.objectContaining({login: '+15005550006'}));
            });

            it("should return userToInvite if includeUserToInvite is true and it's a valid phone number (with special characters)", () => {
                const results = getValidOptions(OPTIONS.options, currentUserLogin, formatPhoneNumber, 1, undefined, {searchString: '+1 (800)324-3233', includeUserToInvite: true});
                expect(results.userToInvite).toEqual(expect.objectContaining({login: '+18003243233'}));
            });
        });

        describe('Selected options', () => {
            let optionsWithSelected: OptionData[];
            beforeAll(() => {
                optionsWithSelected = OPTIONS.options.map((option, index) => {
                    if (index < 3) {
                        return {...option, isSelected: true};
                    }
                    return option;
                });
            });
            it('should return selectedOptions when options have isSelected=true', () => {
                const results = getValidOptions(optionsWithSelected, currentUserLogin, formatPhoneNumber, 1, undefined, {includeCurrentUser: true});
                expect(results.selectedOptions.length).toBe(3);
                const selectedNames = results.selectedOptions.map((option) => option.text);
                expect(selectedNames).toEqual(['Iron Man', 'Mister Fantastic', 'Spider-Man']);
                expect(results.personalDetails.length).toEqual(3);
                expect(results.recentOptions.length).toBe(5);
            });

            it('should filter selectedOptions when search string is present', () => {
                const results = getValidOptions(optionsWithSelected, currentUserLogin, formatPhoneNumber, 1, undefined, {includeCurrentUser: true, searchString: 'Iron'});
                expect(results.selectedOptions.length).toBe(1);
                const selectedNames = results.selectedOptions.map((option) => option.text);
                expect(selectedNames).toEqual(['Iron Man']);
            });

            it('should exclude current user from selectedOptions when includeCurrentUser is false', () => {
                const results = getValidOptions(optionsWithSelected, currentUserLogin, formatPhoneNumber, 1, undefined, {includeCurrentUser: false});
                expect(results.selectedOptions.length).toBe(2);
                const selectedNames = results.selectedOptions.map((option) => option.text);
                expect(selectedNames).toEqual(['Mister Fantastic', 'Spider-Man']);
            });

            it('should exclude selectedOptions when excludeLogins is present', () => {
                const results = getValidOptions(optionsWithSelected, currentUserLogin, formatPhoneNumber, 1, undefined, {
                    includeCurrentUser: true,
                    excludeLogins: {'peterparker@expensify.com': true},
                });
                expect(results.selectedOptions.length).toBe(2);
                const selectedNames = results.selectedOptions.map((option) => option.text);
                expect(selectedNames).toEqual(['Iron Man', 'Mister Fantastic']);
            });
        });
    });

    describe('canCreateOptimisticPersonalDetailOption()', () => {
        const VALID_EMAIL = 'valid@email.com';

        it('should allow to create optimistic personal detail option if email is valid', () => {
            const canCreate = canCreateOptimisticPersonalDetailOption({
                searchValue: VALID_EMAIL,
                currentUserLogin,
                // Note: in the past this would check for the existence of the email in the personalDetails list, this has changed.
                // We expect only filtered lists to be passed to this function, so we don't need to check for the existence of the email in the personalDetails list.
                // This is a performance optimization.
                personalDetailsOptions: [],
                recentOptions: [],
                selectedOptions: [],
                countryCode: 1,
            });

            expect(canCreate).toBe(true);
        });

        it('should not allow to create option if email is an email of current user', () => {
            const canCreate = canCreateOptimisticPersonalDetailOption({
                searchValue: currentUserLogin,
                currentUserLogin,
                recentOptions: [],
                personalDetailsOptions: [],
                selectedOptions: [],
                countryCode: 1,
            });

            expect(canCreate).toBe(false);
        });
    });

    describe('matchesSearchTerms', () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const getSpiderManOption = () => OPTIONS.options.find((o) => o.text === 'Spider-Man')!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const getCurrentUserOption = () => OPTIONS.currentUserOption!;

        it('should match when search terms are found in option text', () => {
            expect(matchesSearchTerms(getSpiderManOption(), ['spider'])).toBe(true);
        });

        it('should match when search terms are found in option login', () => {
            // cspell:disable-next-line
            expect(matchesSearchTerms(getSpiderManOption(), ['peterparker'])).toBe(true);
        });

        it('should not match when search terms are not found', () => {
            expect(matchesSearchTerms(getSpiderManOption(), ['nonexistent'])).toBe(false);
        });

        it('should require all search terms to match', () => {
            expect(matchesSearchTerms(getSpiderManOption(), ['spider', 'man'])).toBe(true);
            expect(matchesSearchTerms(getSpiderManOption(), ['spider', 'nonexistent'])).toBe(false);
        });

        it('should match against extraSearchTerms when provided', () => {
            expect(matchesSearchTerms(getCurrentUserOption(), ['you'], ['You', 'me'])).toBe(true);
            expect(matchesSearchTerms(getCurrentUserOption(), ['me'], ['You', 'me'])).toBe(true);
        });

        it('should not match unrelated search terms even with extraSearchTerms', () => {
            expect(matchesSearchTerms(getCurrentUserOption(), ['nonexistent'], ['You', 'me'])).toBe(false);
        });

        it('should match against option text without needing extraSearchTerms', () => {
            expect(matchesSearchTerms(getCurrentUserOption(), ['iron'])).toBe(true);
        });

        it('should match with empty search terms', () => {
            expect(matchesSearchTerms(getCurrentUserOption(), [])).toBe(true);
        });
    });

    describe('filterOption', () => {
        it('should return the option when there are no search string', () => {
            const result = filterOption(OPTIONS.currentUserOption, '');
            expect(result).toBeDefined();
        });

        it('should return null, when the search does not match the option', () => {
            const result = filterOption(OPTIONS.currentUserOption, 'non-matching-string');
            expect(result).toBeNull();
        });

        it('should filter option by part text', () => {
            const result = filterOption(OPTIONS.currentUserOption, 'Iron');
            expect(result).toBeDefined();
        });

        it('should filter option by exact text', () => {
            const result = filterOption(OPTIONS.currentUserOption, 'Iron Man');
            expect(result).toBeDefined();
        });

        it('should filter option by part login', () => {
            const result = filterOption(OPTIONS.currentUserOption, 'tony');
            expect(result).toBeDefined();
        });

        it('should filter option by exact login', () => {
            const result = filterOption(OPTIONS.currentUserOption, currentUserLogin);
            expect(result).toBeDefined();
        });

        it('should match current user option when searching "You" with extraSearchTerms', () => {
            const result = filterOption(OPTIONS.currentUserOption, 'you', ['You', 'me']);
            expect(result).toBeDefined();
            expect(result?.accountID).toBe(currentUserAccountID);
        });

        it('should match current user option when searching "me" with extraSearchTerms', () => {
            const result = filterOption(OPTIONS.currentUserOption, 'me', ['You', 'me']);
            expect(result).toBeDefined();
            expect(result?.accountID).toBe(currentUserAccountID);
        });

        it('should not match current user option when searching unrelated term even with extraSearchTerms', () => {
            const result = filterOption(OPTIONS.currentUserOption, 'non-matching-string', ['You', 'me']);
            expect(result).toBeNull();
        });
    });
});
