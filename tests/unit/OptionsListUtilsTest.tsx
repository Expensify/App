import {act, render, renderHook} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
/* eslint-disable @typescript-eslint/naming-convention */
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SEARCH_ROUTER_OPTIONS_CONFIG from '@components/Search/SearchRouter/searchRouterOptionsConfig';

import type {PrivateIsArchivedMap} from '@hooks/usePrivateIsArchivedMap';
import useReportIsArchived from '@hooks/useReportIsArchived';

import {getAddAgentRuleMessage, getDeleteAgentRuleMessage, getUpdateAgentRuleMessage} from '@libs/AgentRuleChangeLogUtils';
import DateUtils from '@libs/DateUtils';
import {translate} from '@libs/Localize';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import type {HydratedPersonalDetailOption, OptionList, Options, PersonalDetailOptionOrShell, SearchOption, SearchOptionData} from '@libs/OptionsListUtils';
import {
    canCreateOptimisticPersonalDetailOption,
    clearFilteredOptionListCache,
    createFilteredOptionList,
    createOption,
    createOptionFromReport,
    filterAndOrderOptions,
    filterReports,
    filterSelfDMChat,
    filterWorkspaceChats,
    formatMemberForList,
    formatSectionsFromSearchTerm,
    getAlternateText,
    getIOUConfirmationOptionsFromPayeePersonalDetail,
    getLastMessageTextForReport,
    getParticipantsOption,
    getPolicyExpenseReportOption,
    getReportDisplayOption,
    getReportOption,
    getSearchOptions,
    getSearchValueForPhoneOrEmail,
    getUserToInviteOption,
    getValidOptions,
    hydrateContactOption,
    optionsOrderAndGroupBy,
    optionsOrderBy,
    orderOptions,
    orderPersonalDetailsOptions,
    orderWorkspaceOptions,
    recentReportComparator,
    sortAlphabetically,
} from '@libs/OptionsListUtils';
import {getLastActorDisplayName, getLastActorDisplayNameFromLastVisibleActions, shouldShowLastActorDisplayName} from '@libs/OptionsListUtils/getChatPreviewParts';
import {getCurrentUserSearchTerms, getPersonalDetailSearchTerms} from '@libs/OptionsListUtils/searchMatchUtils';
import Parser from '@libs/Parser';
import {
    getAddedCardFeedMessage,
    getAssignedCompanyCardMessage,
    getChangedApproverActionMessage,
    getCurrencyDefaultTaxUpdateMessage,
    getCustomTaxNameUpdateMessage,
    getDynamicExternalWorkflowRoutedMessage,
    getForeignCurrencyDefaultTaxUpdateMessage,
    getRemovedCardFeedMessage,
    getRenamedCardFeedMessage,
    getRequireCompanyCardsEnabledMessage,
    getRequiresCategoryMessage,
    getRequiresTagMessage,
    getUnassignedCompanyCardMessage,
    getUpdatedAutoHarvestingMessage,
    getUpdatedCardFeedLiabilityMessage,
    getUpdatedCardFeedStatementPeriodMessage,
} from '@libs/ReportActionsUtils';
import {
    canCreateTaskInReport,
    canUserPerformWriteAction,
    formatReportLastMessageText,
    getMovedActionMessage,
    getMovedTransactionMessage,
    parseMovedTransactionReportIDs,
    getReportPreviewReportActionMessage,
    getReportTransactions,
    isCanceledTaskReport,
    isExpensifyOnlyParticipantInReport,
} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import {isScanning} from '@libs/TransactionUtils';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Report, ReportAction, ReportNameValuePairs, Transaction} from '@src/types/onyx';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';
import type {Participant} from '@src/types/onyx/IOU';
import type Login from '@src/types/onyx/Login';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport, createRegularChat} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';
import {getFakeAdvancedReportAction} from '../utils/LHNTestUtils';
import {convertToDisplayString, formatPhoneNumber, getCurrencyDecimalsLocal, localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    dismissModal: jest.fn(),
    dismissModalWithReport: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => undefined),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRHPActiveRoute: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());

type PersonalDetailsList = Record<string, PersonalDetails & OptionData>;

const renderLocaleContextProvider = () => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <View>TEST</View>
        </ComposeProviders>,
    );
};

const EMPTY_PRIVATE_IS_ARCHIVED_MAP: PrivateIsArchivedMap = {};

describe('OptionsListUtils', () => {
    const policyID = 'ABC123';

    const POLICY: Policy = {
        id: policyID,
        name: 'Hero Policy',
        role: 'user',
        type: CONST.POLICY.TYPE.TEAM,
        owner: 'reedrichards@expensify.com',
        outputCurrency: '',
        approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
    };

    const allPolicies: OnyxCollection<Policy> = {
        [`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: POLICY,
    };

    const COUNTRY_CODE = 1;

    // Given a set of reports with both single participants and multiple participants some pinned and some not
    const REPORTS: OnyxCollection<Report> = {
        '1': {
            lastReadTime: '2021-01-14 11:25:39.295',
            lastVisibleActionCreated: '2022-11-22 03:26:02.015',
            isPinned: false,
            reportID: '1',
            participants: {
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                1: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                5: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
            },
            reportName: 'Iron Man, Mister Fantastic, Invisible Woman',
            type: CONST.REPORT.TYPE.CHAT,
        },
        '2': {
            lastReadTime: '2021-01-14 11:25:39.296',
            lastVisibleActionCreated: '2022-11-22 03:26:02.016',
            isPinned: false,
            reportID: '2',
            participants: {
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                3: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
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
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                1: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
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
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                4: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
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
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                5: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
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
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                6: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
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
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                7: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
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
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                12: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
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
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                8: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
            },
            reportName: 'Mister Sinister',
            iouReportID: '100',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // This report is an archived room – it does not have a name and instead falls back on oldPolicyName
        '10': {
            lastReadTime: '2021-01-14 11:25:39.200',
            lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            reportID: '10',
            isPinned: false,
            participants: {
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                7: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
            },
            reportName: '',
            oldPolicyName: "SHIELD's workspace",
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            isOwnPolicyExpenseChat: true,
            type: CONST.REPORT.TYPE.CHAT,
            lastActorAccountID: 2,
        },
        '11': {
            lastReadTime: '2021-01-14 11:25:39.200',
            lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            reportID: '11',
            isPinned: false,
            participants: {
                10: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                },
            },
            reportName: '',
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            isOwnPolicyExpenseChat: true,
            type: CONST.REPORT.TYPE.CHAT,
            policyID,
            policyName: POLICY.name,
        },

        // Thread report with notification preference = hidden
        '12': {
            lastReadTime: '2021-01-14 11:25:39.200',
            lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            reportID: '11',
            isPinned: false,
            participants: {
                10: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                },
            },
            reportName: '',
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            isOwnPolicyExpenseChat: true,
            type: CONST.REPORT.TYPE.CHAT,
            policyID,
            policyName: POLICY.name,
            parentReportActionID: '123',
            parentReportID: '123',
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
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                999: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
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
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                1000: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
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
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                1001: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
            },
            reportName: 'Receipts',
            type: CONST.REPORT.TYPE.CHAT,
        },
    };

    const REPORTS_WITH_WORKSPACE_ROOMS: OnyxCollection<Report> = {
        ...REPORTS,
        '14': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '14',
            participants: {
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                1: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                10: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                3: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
            },
            reportName: '',
            oldPolicyName: 'Avengers Room',
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
            isOwnPolicyExpenseChat: true,
            type: CONST.REPORT.TYPE.CHAT,
        },
    };

    const REPORTS_WITH_CHAT_ROOM: OnyxCollection<Report> = {
        ...REPORTS,
        15: {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:02.000',
            isPinned: false,
            reportID: '15',
            participants: {
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                3: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                4: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
            },
            reportName: 'Spider-Man, Black Panther',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
        },
    };

    const REPORTS_WITH_SELF_DM: OnyxCollection<Report> = {
        16: {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '16',
            participants: {
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
            },
            reportName: 'Expense Report',
            type: CONST.REPORT.TYPE.EXPENSE,
        },
        17: {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '17',
            participants: {
                2: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
            },
            reportName: '',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
        },
    };

    const activePolicyID = 'DEF456';

    // And a set of personalDetails some with existing reports and some without
    const PERSONAL_DETAILS: PersonalDetailsList = {
        // These exist in our reports
        '1': {
            accountID: 1,
            displayName: 'Mister Fantastic',
            login: 'reedrichards@expensify.com',
            keyForList: 'reedrichards@expensify.com',
            isSelected: true,
            reportID: '1',
        },
        '2': {
            accountID: 2,
            displayName: 'Iron Man',
            login: 'tonystark@expensify.com',
            keyForList: 'tonystark@expensify.com',
            reportID: '1',
        },
        '3': {
            accountID: 3,
            displayName: 'Spider-Man',
            login: 'peterparker@expensify.com',
            keyForList: 'peterparker@expensify.com',
            reportID: '1',
        },
        '4': {
            accountID: 4,
            displayName: 'Black Panther',
            login: 'tchalla@expensify.com',
            keyForList: 'tchalla@expensify.com',
            reportID: '1',
        },
        '5': {
            accountID: 5,
            displayName: 'Invisible Woman',
            login: 'suestorm@expensify.com',
            keyForList: 'suestorm@expensify.com',
            reportID: '1',
        },
        '6': {
            accountID: 6,
            displayName: 'Thor',
            login: 'thor@expensify.com',
            keyForList: 'thor@expensify.com',
            reportID: '1',
        },
        '7': {
            accountID: 7,
            displayName: 'Captain America',
            login: 'steverogers@expensify.com',
            keyForList: 'steverogers@expensify.com',
            reportID: '1',
        },
        '8': {
            accountID: 8,
            displayName: 'Mr Sinister',
            login: 'mistersinister@marauders.com',
            keyForList: 'mistersinister@marauders.com',
            reportID: '1',
        },

        // These do not exist in reports at all
        '9': {
            accountID: 9,
            displayName: 'Black Widow',
            login: 'natasharomanoff@expensify.com',
            keyForList: 'natasharomanoff@expensify.com',
            reportID: '',
        },
        '10': {
            accountID: 10,
            displayName: 'The Incredible Hulk',
            login: 'brucebanner@expensify.com',
            keyForList: 'brucebanner@expensify.com',
            reportID: '',
        },
        '11': {
            accountID: 11,
            displayName: 'Timothée',
            login: 'chalamet@expensify.com',
            keyForList: 'chalamet@expensify.com',
            reportID: '',
        },
    };

    const PERSONAL_DETAILS_WITH_CONCIERGE: PersonalDetailsList = {
        ...PERSONAL_DETAILS,
        '999': {
            accountID: 999,
            displayName: 'Concierge',
            login: 'concierge@expensify.com',
            keyForList: 'concierge@expensify.com',
            reportID: '',
        },
    };

    const PERSONAL_DETAILS_WITH_CHRONOS: PersonalDetailsList = {
        ...PERSONAL_DETAILS,

        '1000': {
            accountID: 1000,
            displayName: 'Chronos',
            login: 'chronos@expensify.com',
            keyForList: 'chronos@expensify.com',
            reportID: '',
        },
    };

    const PERSONAL_DETAILS_WITH_RECEIPTS: PersonalDetailsList = {
        ...PERSONAL_DETAILS,

        '1001': {
            accountID: 1001,
            displayName: 'Receipts',
            login: 'receipts@expensify.com',
            keyForList: 'receipts@expensify.com',
            reportID: '',
        },
    };

    const PERSONAL_DETAILS_WITH_PERIODS: PersonalDetailsList = {
        ...PERSONAL_DETAILS,

        '1002': {
            accountID: 1002,
            displayName: 'The Flash',
            login: 'barry.allen@expensify.com',
            keyForList: 'barry.allen@expensify.com',
            reportID: '',
        },
    };

    const WORKSPACE_CHATS: OptionData[] = [
        {
            reportID: '1',
            text: 'Google Workspace',
            policyID: '11',
            keyForList: '11',
            isPolicyExpenseChat: true,
        },
        {
            reportID: '2',
            text: 'Google Drive Workspace',
            policyID: '22',
            keyForList: '22',
            isPolicyExpenseChat: false,
        },
        {
            reportID: '3',
            text: 'Slack Team Workspace',
            policyID: '33',
            keyForList: '33',
            isPolicyExpenseChat: false,
        },
        {
            reportID: '4',
            text: 'Slack Development Workspace',
            policyID: '44',
            keyForList: '44',
            isPolicyExpenseChat: true,
        },
        {
            reportID: '5',
            text: 'Microsoft Teams Workspace',
            policyID: '55',
            keyForList: '55',
            isPolicyExpenseChat: false,
        },
        {
            reportID: '6',
            text: 'Microsoft Project Workspace',
            policyID: '66',
            keyForList: '66',
            isPolicyExpenseChat: false,
        },
        {
            reportID: '7',
            text: 'Notion Design Workspace',
            policyID: '77',
            keyForList: '77',
            isPolicyExpenseChat: false,
        },
        {
            reportID: '8',
            text: 'Notion Workspace for Marketing',
            policyID: activePolicyID,
            keyForList: activePolicyID,
            isPolicyExpenseChat: true,
        },
        {
            reportID: '9',
            text: 'Adana Task Workspace',
            policyID: '99',
            keyForList: '99',
            isPolicyExpenseChat: false,
        },
        {
            reportID: '10',
            text: 'Adana Project Management',
            policyID: '1010',
            keyForList: '1010',
            isPolicyExpenseChat: true,
        },
    ];

    const loginList: OnyxEntry<Login> = {};
    const CURRENT_USER_ACCOUNT_ID = 2;
    const CURRENT_USER_EMAIL = 'tonystark@expensify.com';

    const reportNameValuePairs = {
        private_isArchived: DateUtils.getDBTime(),
    };

    let OPTIONS: OptionList;

    /**
     * Creates mock reportAttributesDerived data for tests.
     * For CHAT type reports, builds name from participants (excluding current user) to simulate
     * the real reportAttributesDerived computation that happens on the server.
     */
    const createMockReportAttributesDerived = (reports: OnyxCollection<Report>, personalDetails: PersonalDetailsList, currentUserAccountID: number): Record<string, ReportAttributes> => {
        const derived: Record<string, ReportAttributes> = {};
        const reportValues = Object.values(reports ?? {});
        for (const report of reportValues) {
            if (!report?.reportID) {
                continue;
            }

            let name = report.reportName;

            if (report.type === CONST.REPORT.TYPE.CHAT && report.participants) {
                const participantAccountIDs = Object.keys(report.participants)
                    .map(Number)
                    .filter((id) => id !== currentUserAccountID)
                    .slice(0, 5);

                if (participantAccountIDs.length > 0) {
                    const participantNames = participantAccountIDs.map((accountID) => personalDetails[accountID]?.displayName).filter(Boolean);

                    if (participantNames.length > 0) {
                        name = participantNames.join(', ');
                    }
                }
            }

            if (!name) {
                if (report.oldPolicyName) {
                    name = report.oldPolicyName;
                } else {
                    name = `Report ${report.reportID}`;
                }
            }

            derived[report.reportID] = {
                reportName: name,
                isEmpty: false,
                brickRoadStatus: undefined,
                requiresAttention: false,
                reportErrors: {},
            };
        }
        return derived;
    };

    const MOCK_REPORT_ATTRIBUTES_DERIVED_RAW = createMockReportAttributesDerived(REPORTS, PERSONAL_DETAILS, CURRENT_USER_ACCOUNT_ID);
    const MOCK_REPORT_ATTRIBUTES_DERIVED: Record<string, ReportAttributes> = {
        ...MOCK_REPORT_ATTRIBUTES_DERIVED_RAW,
        '10': {
            ...MOCK_REPORT_ATTRIBUTES_DERIVED_RAW['10'],
            reportName: `${MOCK_REPORT_ATTRIBUTES_DERIVED_RAW['10']?.reportName || ''} (Archived)`,
        },
    };
    const MOCK_REPORT_ATTRIBUTES_DERIVED_WITH_CONCIERGE = createMockReportAttributesDerived(REPORTS_WITH_CONCIERGE, PERSONAL_DETAILS_WITH_CONCIERGE, CURRENT_USER_ACCOUNT_ID);
    const MOCK_REPORT_ATTRIBUTES_DERIVED_WITH_CHRONOS = createMockReportAttributesDerived(REPORTS_WITH_CHRONOS, PERSONAL_DETAILS_WITH_CHRONOS, CURRENT_USER_ACCOUNT_ID);
    const MOCK_REPORT_ATTRIBUTES_DERIVED_WITH_RECEIPTS = createMockReportAttributesDerived(REPORTS_WITH_RECEIPTS, PERSONAL_DETAILS_WITH_RECEIPTS, CURRENT_USER_ACCOUNT_ID);
    const MOCK_REPORT_ATTRIBUTES_DERIVED_WITH_WORKSPACE_ROOM = createMockReportAttributesDerived(REPORTS_WITH_WORKSPACE_ROOMS, PERSONAL_DETAILS, CURRENT_USER_ACCOUNT_ID);
    let OPTIONS_WITH_CONCIERGE: OptionList;
    let OPTIONS_WITH_CHRONOS: OptionList;
    let OPTIONS_WITH_RECEIPTS: OptionList;
    let OPTIONS_WITH_WORKSPACE_ROOM: OptionList;

    // Set the currently logged in user, report data, and personal details
    beforeAll(async () => {
        IntlStore.load(CONST.LOCALES.EN);
        initOnyxDerivedValues();
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: 2, email: 'tonystark@expensify.com'},
                [`${ONYXKEYS.COLLECTION.REPORT}100` as const]: {
                    reportID: '',
                    ownerAccountID: 8,
                    total: 1000,
                },
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const]: POLICY,
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: activePolicyID,
                [ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING]: {},
            },
        });

        Onyx.registerLogger(() => {});

        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}10`, REPORTS['10'] ?? {});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}10`, reportNameValuePairs);
        await waitForBatchedUpdates();

        OPTIONS = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, MOCK_REPORT_ATTRIBUTES_DERIVED, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, {
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            dateFnsLocale: undefined,
            conciergeReportID: undefined,
            isSearching: true,
        });
        OPTIONS_WITH_CONCIERGE = createFilteredOptionList(
            PERSONAL_DETAILS_WITH_CONCIERGE,
            REPORTS_WITH_CONCIERGE,
            MOCK_REPORT_ATTRIBUTES_DERIVED_WITH_CONCIERGE,
            EMPTY_PRIVATE_IS_ARCHIVED_MAP,
            undefined,
            {currentUserAccountID: CURRENT_USER_ACCOUNT_ID, dateFnsLocale: undefined, conciergeReportID: undefined, isSearching: true},
        );
        OPTIONS_WITH_CHRONOS = createFilteredOptionList(
            PERSONAL_DETAILS_WITH_CHRONOS,
            REPORTS_WITH_CHRONOS,
            MOCK_REPORT_ATTRIBUTES_DERIVED_WITH_CHRONOS,
            EMPTY_PRIVATE_IS_ARCHIVED_MAP,
            undefined,
            {currentUserAccountID: CURRENT_USER_ACCOUNT_ID, dateFnsLocale: undefined, conciergeReportID: undefined, isSearching: true},
        );
        OPTIONS_WITH_RECEIPTS = createFilteredOptionList(
            PERSONAL_DETAILS_WITH_RECEIPTS,
            REPORTS_WITH_RECEIPTS,
            MOCK_REPORT_ATTRIBUTES_DERIVED_WITH_RECEIPTS,
            EMPTY_PRIVATE_IS_ARCHIVED_MAP,
            undefined,
            {currentUserAccountID: CURRENT_USER_ACCOUNT_ID, dateFnsLocale: undefined, conciergeReportID: undefined, isSearching: true},
        );
        OPTIONS_WITH_WORKSPACE_ROOM = createFilteredOptionList(
            PERSONAL_DETAILS,
            REPORTS_WITH_WORKSPACE_ROOMS,
            MOCK_REPORT_ATTRIBUTES_DERIVED_WITH_WORKSPACE_ROOM,
            EMPTY_PRIVATE_IS_ARCHIVED_MAP,
            undefined,
            {currentUserAccountID: CURRENT_USER_ACCOUNT_ID, dateFnsLocale: undefined, conciergeReportID: undefined, isSearching: true},
        );
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();

        // createFilteredOptionList caches results at module level; clear it so tests stay order-independent.
        clearFilteredOptionListCache();

        // Onyx.clear() models sign-out and empties PERSONAL_DETAILS_LIST. Report-holder option text
        // resolves via ReportUtils.allPersonalDetails (the live connect), so restore the list the
        // same way a signed-in session would after login.
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS);
        await waitForBatchedUpdates();
    });

    describe('getSearchOptions()', () => {
        it('should return all options when no search value is provided', () => {
            // Given a set of options
            // When we call getSearchOptions with all betas
            const {options: results} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });

            // Then all personal details (including those that have reports) should be returned
            expect(results.personalDetails.length).toBe(10);

            // Then all of the reports should be shown including the archived rooms, except for the thread report with notificationPreferences hidden.
            expect(results.recentReports.length).toBe(Object.values(OPTIONS.reports).length - 1);
        });

        it('should include a policy expense chat when the current user notification preference is hidden', () => {
            // Given a member's workspace chat where the current user (admin) is a participant with a hidden notification preference
            const memberWorkspaceChat: OnyxCollection<Report> = {
                '20': {
                    lastReadTime: '2021-01-14 11:25:39.200',
                    lastVisibleActionCreated: '2022-11-22 03:26:02.001',
                    reportID: '20',
                    participants: {
                        [CURRENT_USER_ACCOUNT_ID]: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                        },
                        3: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                    },
                    reportName: "Spider-Man's expenses",
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    ownerAccountID: 3,
                    type: CONST.REPORT.TYPE.CHAT,
                    policyID,
                    policyName: POLICY.name,
                },
            };
            const optionsWithMemberWorkspaceChat = createFilteredOptionList(
                PERSONAL_DETAILS,
                memberWorkspaceChat,
                createMockReportAttributesDerived(memberWorkspaceChat, PERSONAL_DETAILS, CURRENT_USER_ACCOUNT_ID),
                EMPTY_PRIVATE_IS_ARCHIVED_MAP,
                allPolicies,
                {currentUserAccountID: CURRENT_USER_ACCOUNT_ID, dateFnsLocale: undefined, conciergeReportID: undefined, isSearching: true},
            );

            // When we call getSearchOptions
            const {options: results} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: optionsWithMemberWorkspaceChat,
                reportAttributesDerived: createMockReportAttributesDerived(memberWorkspaceChat, PERSONAL_DETAILS, CURRENT_USER_ACCOUNT_ID),
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });

            // Then the member's workspace chat should still be included in the search results
            expect(results.recentReports.some((report) => report.reportID === '20')).toBe(true);
        });

        it('should include current user when includeCurrentUser is true for type:chat from suggestions', () => {
            // Given a set of options where the current user is Iron Man (accountID: 2)
            // When we call getSearchOptions with includeCurrentUser set to true
            const {options: results} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                draftComments: {},
                betas: [CONST.BETAS.ALL],
                isUsedInChatFinder: true,
                includeReadOnly: true,
                searchQuery: '',
                maxResults: undefined,
                includeUserToInvite: false,
                includeRecentReports: true,
                includeCurrentUser: true,
                loginList,
                policyCollection: allPolicies,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });

            // Then the current user should be included in personalDetails
            const currentUserOption = results.personalDetails.find((option) => option.login === 'tonystark@expensify.com');
            expect(currentUserOption).toBeDefined();
            expect(currentUserOption?.text).toBe('Iron Man');
            expect(currentUserOption?.accountID).toBe(2);

            // Then all personal details including the current user should be returned
            expect(results.personalDetails.length).toBe(11);
        });

        it('should exclude current user when includeCurrentUser is false', () => {
            // Given a set of options where the current user is Iron Man (accountID: 2)
            // When we call getSearchOptions with includeCurrentUser set to false (default behavior)
            const {options: results} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                draftComments: {},
                betas: [CONST.BETAS.ALL],
                isUsedInChatFinder: true,
                includeReadOnly: true,
                searchQuery: '',
                maxResults: undefined,
                includeUserToInvite: false,
                includeRecentReports: true,
                loginList,
                policyCollection: allPolicies,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });

            // Then the current user should not be included in personalDetails
            const currentUserOption = results.personalDetails.find((option) => option.login === 'tonystark@expensify.com');
            expect(currentUserOption).toBeUndefined();

            // Then all personal details except the current user should be returned
            expect(results.personalDetails.length).toBe(10);
        });

        it('should use policyCollection to filter workspace chats correctly', () => {
            // Given a set of options with workspace rooms
            // When we call getSearchOptions with policyCollection
            const {options: results} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS_WITH_WORKSPACE_ROOM,
                draftComments: {},
                betas: [CONST.BETAS.ALL],
                isUsedInChatFinder: true,
                includeReadOnly: true,
                searchQuery: '',
                maxResults: undefined,
                includeUserToInvite: false,
                includeRecentReports: true,
                loginList,
                policyCollection: allPolicies,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });

            // Then recent reports should include the workspace room
            expect(results.recentReports.length).toBeGreaterThan(0);

            // Then the workspace room should be in recent reports (with subtitle 'Avengers Room')
            const workspaceRoom = results.recentReports.find((report) => report.subtitle === 'Avengers Room');
            expect(workspaceRoom).toBeDefined();
        });

        it('should handle empty policyCollection', () => {
            // Given a set of options
            // When we call getSearchOptions with empty policyCollection
            const {options: results} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                draftComments: {},
                betas: [CONST.BETAS.ALL],
                isUsedInChatFinder: true,
                includeReadOnly: true,
                searchQuery: '',
                maxResults: undefined,
                includeUserToInvite: false,
                includeRecentReports: true,
                loginList,
                policyCollection: {},
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });

            // Then it should still return personal details
            expect(results.personalDetails.length).toBeGreaterThan(0);

            // Then it should still return recent reports
            expect(results.recentReports.length).toBeGreaterThan(0);
        });

        it('should handle undefined policyCollection', () => {
            // Given a set of options
            // When we call getSearchOptions with undefined policyCollection
            const {options: results} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                draftComments: {},
                betas: [CONST.BETAS.ALL],
                isUsedInChatFinder: true,
                includeReadOnly: true,
                searchQuery: '',
                maxResults: undefined,
                includeUserToInvite: false,
                includeRecentReports: true,
                loginList,
                policyCollection: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });

            // Then it should still return personal details
            expect(results.personalDetails.length).toBeGreaterThan(0);

            // Then it should still return recent reports
            expect(results.recentReports.length).toBeGreaterThan(0);
        });

        it('should pass conciergeReportID through to results when provided', () => {
            // Given a set of options that includes Concierge and a valid conciergeReportID
            const conciergeReportID = '11';
            // When we call getSearchOptions with conciergeReportID
            const {options: results} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS_WITH_CONCIERGE,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED_WITH_CONCIERGE,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS_WITH_CONCIERGE,
                conciergeReportID,
                sortedActions: undefined,
            });

            // Then the Concierge report should be included in recent reports
            const conciergeOption = results.recentReports.find((option) => option.login === 'concierge@expensify.com');
            expect(conciergeOption).toBeDefined();
            // And the concierge option's reportID should match the provided conciergeReportID
            expect(conciergeOption?.reportID).toBe(conciergeReportID);
        });

        it('should handle undefined conciergeReportID without errors', () => {
            // Given a set of options with Concierge
            // When we call getSearchOptions with conciergeReportID set to undefined
            const {options: results} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS_WITH_CONCIERGE,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED_WITH_CONCIERGE,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS_WITH_CONCIERGE,
                conciergeReportID: undefined,
                sortedActions: undefined,
            });

            // Then the function should complete without errors
            expect(results.recentReports).toBeDefined();
            expect(results.personalDetails).toBeDefined();
            // And the Concierge report should still appear in recent reports
            const conciergeOption = results.recentReports.find((option) => option.login === 'concierge@expensify.com');
            expect(conciergeOption).toBeDefined();
        });

        it('should include Concierge in results with matching conciergeReportID when searching', () => {
            // Given a search query that matches Concierge
            const conciergeReportID = '11';
            // When we call getSearchOptions with a search query matching Concierge
            const {options: results} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS_WITH_CONCIERGE,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED_WITH_CONCIERGE,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                searchQuery: 'Concierge',
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS_WITH_CONCIERGE,
                conciergeReportID,
                sortedActions: undefined,
            });

            // Then the Concierge report should be in recent reports
            const conciergeOption = results.recentReports.find((option) => option.login === 'concierge@expensify.com');
            expect(conciergeOption).toBeDefined();
            expect(conciergeOption?.reportID).toBe(conciergeReportID);
        });
    });

    describe('orderOptions()', () => {
        it('should sort options alphabetically and preserves reportID for personal details with existing reports', () => {
            // Given a set of reports and personalDetails
            // When we call getValidOptions()
            const {options: validOptions} = getValidOptions(
                {
                    reports: OPTIONS.reports,
                    personalDetails: OPTIONS.personalDetails,
                },
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            let results: Pick<Options, 'personalDetails' | 'recentReports'> = validOptions;
            // When we call orderOptions()
            results = orderOptions(results);

            // Then all personalDetails except the currently logged in user should be returned
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS.personalDetails).length - 1);

            const expected = [
                'Black Panther',
                'Black Widow',
                'Captain America',
                'Invisible Woman',
                'Mister Fantastic',
                'Mr Sinister',
                'Spider-Man',
                'The Incredible Hulk',
                'Thor',
                'Timothée',
            ];
            const actual = results.personalDetails?.map((item) => item.text);

            // Then the results should be sorted alphabetically
            expect(actual).toEqual(expected);

            const personalDetailWithExistingReport = results.personalDetails.find((personalDetail) => personalDetail.login === 'peterparker@expensify.com');
            // Then the result which has an existing report should also have the reportID attached
            expect(personalDetailWithExistingReport?.reportID).toBe('2');
        });

        it('should sort personal details options alphabetically when only personal details are provided', () => {
            // Given a set of personalDetails and an empty reports array
            const {options: validOptions} = getValidOptions(
                {personalDetails: OPTIONS.personalDetails, reports: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            let results: Pick<Options, 'personalDetails' | 'recentReports'> = validOptions;
            // When we call orderOptions()
            results = orderOptions(results);

            const expected = [
                'Black Panther',
                'Black Widow',
                'Captain America',
                'Invisible Woman',
                'Mister Fantastic',
                'Mr Sinister',
                'Spider-Man',
                'The Incredible Hulk',
                'Thor',
                'Timothée',
            ];
            const actual = results.personalDetails?.map((item) => item.text);

            // Then the results should be sorted alphabetically
            expect(actual).toEqual(expected);
        });
    });

    describe('getValidOptions()', () => {
        it('should return empty options when no reports or personal details are provided', () => {
            // Given empty arrays of reports and personalDetails
            // When we call getValidOptions()
            const {options: results} = getValidOptions(
                {reports: [], personalDetails: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );

            // Then the result should be empty
            expect(results.personalDetails).toEqual([]);
            expect(results.recentReports).toEqual([]);
            expect(results.currentUserOption).toBeUndefined();
            expect(results.userToInvite).toEqual(null);
            expect(results.workspaceChats).toEqual([]);
            expect(results.selfDMChat).toEqual(undefined);
        });

        it('should include Concierge by default in results', () => {
            // Given a set of reports and personalDetails that includes Concierge
            // When we call getValidOptions()
            const {options: results} = getValidOptions(
                {
                    reports: OPTIONS_WITH_CONCIERGE.reports,
                    personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails,
                },
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );

            // Then the result should include all personalDetails except the currently logged in user
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 1);
            // Then the result should include Concierge
            expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
        });

        it.each([
            {
                description: 'Vietnamese diacritics',
                // cspell:disable-next-line
                displayName: 'Trần Hải',
                searchString: 'tran',
            },
            {
                description: 'Vietnamese extended diacritics',
                // cspell:disable-next-line
                displayName: 'Nguyễn Văn A',
                searchString: 'nguyen',
            },
            {
                description: 'a zero-width space',
                displayName: 'Jo\u200Bhn',
                searchString: 'john',
            },
        ])('should preserve a contact when the canonical matcher finds $description', ({displayName, searchString}) => {
            const accountID = 1003;
            const personalDetails: PersonalDetailsList = {
                [accountID]: {
                    accountID,
                    displayName,
                    login: 'contact1003@example.com',
                    keyForList: 'contact1003@example.com',
                    reportID: '',
                },
            };
            const optionList = createFilteredOptionList(personalDetails, {}, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });

            const {options: preFilteredOptions} = getValidOptions(
                optionList,
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {
                    dateFnsLocale: undefined,
                    includeRecentReports: false,
                    personalDetails,
                    searchString,
                },
                translateLocal,
            );

            // The contact must survive getValidOptions' pre-filter so the final filter can return it.
            expect(preFilteredOptions.personalDetails).toEqual(expect.arrayContaining([expect.objectContaining({login: 'contact1003@example.com'})]));

            const filteredOptions = filterAndOrderOptions(preFilteredOptions, searchString, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, personalDetails);

            expect(filteredOptions.personalDetails).toEqual([expect.objectContaining({login: 'contact1003@example.com'})]);
        });

        it('should exclude Concierge when excludedLogins is specified', () => {
            // Given a set of reports and personalDetails that includes Concierge and a config object that excludes Concierge
            // When we call getValidOptions()
            const {options: results} = getValidOptions(
                {
                    reports: OPTIONS_WITH_CONCIERGE.reports,
                    personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails,
                },
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, excludeLogins: {[CONST.EMAIL.CONCIERGE]: true}, sortedActions: undefined},
                translateLocal,
            );

            // Then the result should include all personalDetails except the currently logged in user and Concierge
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 2);
            // Then the result should not include Concierge
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
        });

        it('should pass conciergeReportID through to options when provided', () => {
            // Given a set of reports that includes Concierge and a valid conciergeReportID
            const conciergeReportID = '11';
            // When we call getValidOptions() with a conciergeReportID
            const {options: results} = getValidOptions(
                {
                    reports: OPTIONS_WITH_CONCIERGE.reports,
                    personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails,
                },
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                conciergeReportID,
                {dateFnsLocale: undefined},
                translateLocal,
            );

            // Then the result should still include Concierge in the results
            expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
            // And the concierge report should have a valid reportID
            const conciergeOption = results.recentReports.find((option) => option.login === 'concierge@expensify.com');
            expect(conciergeOption?.reportID).toBe(conciergeReportID);
        });

        it('should exclude Chronos when excludedLogins is specified', () => {
            // Given a set of reports and personalDetails that includes Chronos and a config object that excludes Chronos
            // When we call getValidOptions()
            const {options: results} = getValidOptions(
                {
                    reports: OPTIONS_WITH_CHRONOS.reports,
                    personalDetails: OPTIONS_WITH_CHRONOS.personalDetails,
                },
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, excludeLogins: {[CONST.EMAIL.CHRONOS]: true}, sortedActions: undefined},
                translateLocal,
            );

            // Then the result should include all personalDetails except the currently logged in user and Chronos
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CHRONOS.personalDetails).length - 2);
            // Then the result should not include Chronos
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));
        });

        it('should exclude Receipts option from results when excludedLogins is specified', () => {
            // Given a set of reports and personalDetails that includes receipts and a config object that excludes receipts
            // When we call getValidOptions()
            const {options: results} = getValidOptions(
                {
                    reports: OPTIONS_WITH_RECEIPTS.reports,
                    personalDetails: OPTIONS_WITH_RECEIPTS.personalDetails,
                },
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, excludeLogins: {[CONST.EMAIL.RECEIPTS]: true}, sortedActions: undefined},
                translateLocal,
            );

            // Then the result should include all personalDetails except the currently logged in user and receipts
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_RECEIPTS.personalDetails).length - 2);
            // Then the result should not include receipts
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
        });

        it('should keep admin rooms if specified', () => {
            // Given an admin room report search option
            const adminRoom: SearchOption<Report> = {
                item: {
                    chatType: 'policyAdmins',
                    currency: 'USD',
                    errorFields: {},
                    lastActionType: 'CREATED',
                    lastReadTime: '2025-03-21 07:25:46.279',
                    lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                    lastVisibleActionLastModified: '2024-12-15 21:13:24.317',
                    ownerAccountID: 0,
                    permissions: ['read', 'write'],
                    policyID: '52A5ABD88FBBD18F',
                    policyName: "David's Playground",
                    reportID: '1455140530846319',
                    reportName: '#admins',
                    type: 'chat',
                    writeCapability: 'all',
                },
                text: '#admins',
                alternateText: "David's Playground",
                allReportErrors: {},
                subtitle: "David's Playground",
                participantsList: [],
                reportID: '1455140530846319',
                keyForList: '1455140530846319',
                isDefaultRoom: true,
                isChatRoom: true,
                policyID: '52A5ABD88FBBD18F',
                lastMessageText: '',
                lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                notificationPreference: 'hidden',
            };
            // When we call getValidOptions with includeMultipleParticipantReports set to true
            const {options: results} = getValidOptions(
                {reports: [adminRoom], personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeMultipleParticipantReports: true, sortedActions: undefined},
                translateLocal,
            );
            const adminRoomOption = results.recentReports.find((report) => report.reportID === '1455140530846319');

            // Then the result should include the admin room
            expect(adminRoomOption).toBeDefined();
        });

        it('should include brickRoadIndicator if showRBR is true', () => {
            const reportID = '1455140530846319';
            const workspaceChat: SearchOption<Report> = {
                item: {
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    currency: 'USD',
                    errorFields: {},
                    lastActionType: 'CREATED',
                    lastReadTime: '2025-03-21 07:25:46.279',
                    lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                    lastVisibleActionLastModified: '2024-12-15 21:13:24.317',
                    ownerAccountID: 0,
                    permissions: ['read', 'write'],
                    participants: {1: {notificationPreference: 'always'}},
                    policyID: '52A5ABD88FBBD18F',
                    policyName: "A's Workspace",
                    reportID,
                    reportName: "A's Workspace chat",
                    type: 'chat',
                    writeCapability: 'all',
                },
                text: "A's Workspace chat",
                alternateText: "A's Workspace",
                allReportErrors: {},
                subtitle: "A's Workspace",
                participantsList: [],
                reportID,
                keyForList: '1455140530846319',
                isDefaultRoom: true,
                isChatRoom: true,
                policyID: '52A5ABD88FBBD18F',
                lastMessageText: '',
                lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                notificationPreference: 'hidden',
                brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
            };
            const {options: results} = getValidOptions(
                {reports: [workspaceChat], personalDetails: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeMultipleParticipantReports: true, showRBR: true, sortedActions: undefined},
                translateLocal,
            );
            expect(results.recentReports.at(0)?.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        });

        it('should not include brickRoadIndicator if showRBR is false', () => {
            const reportID = '1455140530846319';
            const workspaceChat: SearchOption<Report> = {
                item: {
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    currency: 'USD',
                    errorFields: {},
                    lastActionType: 'CREATED',
                    lastReadTime: '2025-03-21 07:25:46.279',
                    lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                    lastVisibleActionLastModified: '2024-12-15 21:13:24.317',
                    ownerAccountID: 0,
                    permissions: ['read', 'write'],
                    participants: {1: {notificationPreference: 'always'}},
                    policyID: '52A5ABD88FBBD18F',
                    policyName: "A's Workspace",
                    reportID,
                    reportName: "A's Workspace chat",
                    type: 'chat',
                    writeCapability: 'all',
                },
                text: "A's Workspace chat",
                alternateText: "A's Workspace",
                allReportErrors: {},
                subtitle: "A's Workspace",
                participantsList: [],
                reportID,
                keyForList: '1455140530846319',
                isDefaultRoom: true,
                isChatRoom: true,
                policyID: '52A5ABD88FBBD18F',
                lastMessageText: '',
                lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                notificationPreference: 'hidden',
                brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
            };
            const {options: results} = getValidOptions(
                {reports: [workspaceChat], personalDetails: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeMultipleParticipantReports: true, showRBR: false, sortedActions: undefined},
                translateLocal,
            );
            expect(results.recentReports.at(0)?.brickRoadIndicator).toBe(null);
        });

        it('should mark unread report as bold when shouldUnreadBeBold is true', async () => {
            const reportID = '99999';
            const report: Report = {
                ...createRegularChat(Number(reportID), [1]),
                reportID,
                reportName: 'Unread Report',
                lastReadTime: DateUtils.getDBTime(Date.now() - 10000),
                lastVisibleActionCreated: DateUtils.getDBTime(Date.now()),
                lastActorAccountID: 1,
                lastMessageText: 'Test message',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const inputOption: SearchOption<Report> = {
                item: report,
                reportID,
                text: 'Unread Report',
                isUnread: false, // Intentionally false initially to prove it gets recalculated
                participantsList: [],
                keyForList: reportID,
                isChatRoom: true,
                policyID: '123',
                lastMessageText: '',
                lastVisibleActionCreated: report.lastVisibleActionCreated,
                notificationPreference: 'always',
                accountID: 0,
                login: '',
                alternateText: '',
                subtitle: '',
                firstName: '',
                lastName: '',
                icons: [],
                isSelected: false,
                isDisabled: false,
                brickRoadIndicator: null,
                isBold: false,
            };

            const {options: results} = getValidOptions(
                {reports: [inputOption], personalDetails: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeRecentReports: true, shouldUnreadBeBold: true, includeMultipleParticipantReports: true, sortedActions: undefined},
                translateLocal,
            );

            expect(results.recentReports.at(0)?.isBold).toBe(true);
            expect(results.recentReports.at(0)?.isUnread).toBe(true);
        });

        it('should use personalDetails parameter when passed to getValidOptions', () => {
            // Given a personalDetails object to pass explicitly
            const customPersonalDetails = {
                2: {
                    accountID: 2,
                    displayName: 'Custom Iron Man',
                    login: 'tonystark@expensify.com',
                },
                3: {
                    accountID: 3,
                    displayName: 'Custom Spider-Man',
                    login: 'peterparker@expensify.com',
                },
            };

            // When we call getValidOptions with personalDetails parameter
            const {options: results} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                {},
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, personalDetails: customPersonalDetails, sortedActions: undefined},
                translateLocal,
            );

            // Then the function should complete without errors and return valid results
            // The personalDetails param is used internally by prepareReportOptionsForDisplay for workspace chats
            expect(results.recentReports.length).toBeGreaterThan(0);
            expect(results.personalDetails.length).toBeGreaterThan(0);
        });

        it('should mark a personal detail as selected in place when it matches a selected option and includeSelectedOptions is true', () => {
            // Given a selected option matching Spider-Man (accountID 3) by accountID and login
            const selectedOptions = [{accountID: 3, login: 'peterparker@expensify.com'}];

            // When we call getValidOptions with that selected option and includeSelectedOptions enabled
            const {options: results} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, selectedOptions, includeSelectedOptions: true, sortedActions: undefined},
                translateLocal,
            );

            // Then the matching personal detail should be kept in the list and marked as selected
            const selectedDetail = results.personalDetails.find((option) => option.login === 'peterparker@expensify.com');
            expect(selectedDetail).toBeDefined();
            expect(selectedDetail?.isSelected).toBe(true);

            // And other personal details should not be marked as selected
            const otherDetail = results.personalDetails.find((option) => option.login === 'reedrichards@expensify.com');
            expect(otherDetail?.isSelected).not.toBe(true);
        });

        it('should return hasMore true when there are more options than maxElements', () => {
            const {hasMore} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, maxElements: 1},
                translateLocal,
            );

            expect(hasMore).toBe(true);
        });

        it('should return hasMore false when maxElements is larger than the total number of options', () => {
            const {hasMore} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, maxElements: 100},
                translateLocal,
            );

            expect(hasMore).toBe(false);
        });
    });

    describe('getValidOptions() with lazy contact options', () => {
        const hydrateAllPersonalDetails = (list: OptionList): OptionList => ({
            ...list,
            personalDetails: list.personalDetails.map(hydrateContactOption),
        });

        // NOTE: `eagerList` is NOT a correctness baseline for what hydration produces — both sides of every
        // comparison below run through hydrateContactOption, so a dropped hydration input would
        // change both and still pass. What these tests prove is that getValidOptions handles the two halves of
        // PersonalDetailOptionOrShell identically (filtering, ranking, the top-N heap, marking).
        // The non-circular check — hydration output vs. a direct createOption call with non-default inputs —
        // lives in 'lazy contact hydration vs. a direct createOption build' below.
        const buildOptionLists = () => {
            const lazyList = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, MOCK_REPORT_ATTRIBUTES_DERIVED, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });
            const eagerList = hydrateAllPersonalDetails(lazyList);
            return {eagerList, lazyList};
        };

        it('should defer the full option build for every contact', () => {
            // Given an option list from createFilteredOptionList
            const {lazyList} = buildOptionLists();

            // Then every contact option is a lightweight one: it is not hydrated and skips expensive fields like icons
            expect(lazyList.personalDetails.length).toBeGreaterThan(0);
            expect(lazyList.personalDetails.every((option) => !option.isHydrated)).toBe(true);
            expect(lazyList.personalDetails.every((option) => !('icons' in option))).toBe(true);
        });

        it('should produce results identical to eagerly built options after hydration', () => {
            // Given the same data as lightweight shells and as fully hydrated options
            const {eagerList, lazyList} = buildOptionLists();

            // When both lists go through getValidOptions with a top-N cap that exercises the heap
            const config = {dateFnsLocale: undefined, maxElements: 3, personalDetails: PERSONAL_DETAILS};
            const {options: eagerResults} = getValidOptions(eagerList, allPolicies, {}, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, config, translateLocal);
            const {options: lazyResults} = getValidOptions(lazyList, allPolicies, {}, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, config, translateLocal);

            // Then the surviving contacts are hydrated (createOption ran for them) and match the eager results exactly
            expect(lazyResults.personalDetails.length).toBeGreaterThan(0);
            expect(lazyResults.personalDetails.every((option) => option.icons !== undefined)).toBe(true);
            expect(lazyResults.personalDetails.every((option) => !('hydrate' in option))).toBe(true);
            expect(lazyResults.personalDetails).toEqual(eagerResults.personalDetails);
        });

        it('should produce results identical to eagerly built options when searching', () => {
            // Given the same data as lightweight shells and as fully hydrated options
            const {eagerList, lazyList} = buildOptionLists();

            // When both lists go through getValidOptions with a search string (contact filtering reads text/login/participantsList)
            const config = {dateFnsLocale: undefined, searchString: 'spider', personalDetails: PERSONAL_DETAILS};
            const {options: eagerResults} = getValidOptions(eagerList, allPolicies, {}, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, config, translateLocal);
            const {options: lazyResults} = getValidOptions(lazyList, allPolicies, {}, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, config, translateLocal);

            // Then filtering and ordering are unchanged and the hydrated results match
            expect(lazyResults.personalDetails).toEqual(eagerResults.personalDetails);
        });

        it.each([
            {
                description: 'an apostrophe',
                reportText: "Don't forget",
                searchText: 'dont',
            },
            {
                description: 'a hyphen',
                reportText: 'Foo-Bar',
                searchText: 'foobar',
            },
            {
                description: 'diacritics',
                // cspell:disable-next-line
                reportText: 'Café Zürich',
                searchText: 'cafe zurich',
            },
            {
                description: 'a zero-width character',
                reportText: 'Foo\u200BBar',
                searchText: 'foobar',
            },
            {
                description: 'dots omitted from an email address',
                reportText: 'Test User',
                reportLogin: 'test.user@example.com',
                searchText: 'testuser@example.com',
            },
            {
                description: 'a formatted phone number',
                reportText: 'Phone Contact',
                reportLogin: '+12345678901',
                searchText: '+1 (234) 567-8901',
            },
        ])('should preserve a report match through the pre-filter and final filter for $description', ({reportText, reportLogin, searchText}) => {
            // Given a report option with a search-sensitive display value
            const sourceReport = OPTIONS.reports.find((report) => !!report.login);
            expect(sourceReport).toBeDefined();
            if (!sourceReport) {
                return;
            }

            const report = {
                ...sourceReport,
                text: reportText,
                login: reportLogin ?? sourceReport.login,
            };

            // When getValidOptions receives the NewChat-style normalized search value and the result is
            // filtered again with the raw search value, as it is in NewChatPage
            const searchString = getSearchValueForPhoneOrEmail(searchText, COUNTRY_CODE);
            const {options} = getValidOptions(
                {reports: [report], personalDetails: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, searchString, includeP2P: true},
                translateLocal,
            );
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then the report must survive both filtering stages
            expect(filteredOptions.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({reportID: report.reportID, text: reportText})]));
        });

        it('should keep every shell filter and sort field identical to the hydrated option', () => {
            // Given lightweight shells from createFilteredOptionList
            const {eagerList, lazyList} = buildOptionLists();

            // Then each shell carries the exact values the downstream filter (login/accountID/participantsList/text)
            // and the heap comparator key read on the hydrated option, which also guarantees identical
            // tie-breaking for contacts with equal comparator keys
            expect(lazyList.personalDetails.length).toBe(eagerList.personalDetails.length);
            for (const [index, eagerOption] of eagerList.personalDetails.entries()) {
                const shell = lazyList.personalDetails.at(index);
                expect(shell?.text).toBe(eagerOption.text);
                expect(shell?.login).toBe(eagerOption.login);
                expect(shell?.accountID).toBe(eagerOption.accountID);
                expect(shell?.participantsList).toEqual(eagerOption.participantsList);
            }
        });

        it('should not let createOption drift from the lazy shell on any filter- or rank-relevant field', () => {
            // Drift guard for the lazy shell: it hand-reproduces the subset of createOption's showPersonalDetails
            // output that getValidOptions filters and ranks on. If createOption ever changes how one of those
            // values is derived - or starts populating a new one (e.g. displayName / isOptimisticPersonalDetail,
            // currently undefined on both paths) - the shell must be updated in lockstep or filtering/ranking
            // will diverge from what is displayed after hydration. This asserts exact parity across every such
            // field so that a one-sided change to createOption fails here.
            //
            // When you add a field that the personal-details filter (see getValidOptions -> filteringFunction
            // / doesPersonalDetailMatchSearchTerm) or the heap comparator (personalDetailsComparator) reads,
            // add it to this list AND reproduce it in buildPersonalDetailsOptions.
            const FILTER_AND_RANK_FIELDS = ['text', 'login', 'accountID', 'participantsList', 'displayName', 'isOptimisticPersonalDetail'] as const;

            // Given lightweight shells and their hydrated counterparts
            const {eagerList, lazyList} = buildOptionLists();

            // Then every shell reproduces every filter/rank field exactly, and the resolved comparator key matches
            expect(lazyList.personalDetails.length).toBe(eagerList.personalDetails.length);
            expect(lazyList.personalDetails.length).toBeGreaterThan(0);
            for (const [index, eagerOption] of eagerList.personalDetails.entries()) {
                const shell = lazyList.personalDetails.at(index);
                for (const field of FILTER_AND_RANK_FIELDS) {
                    expect(shell?.[field]).toEqual(eagerOption[field]);
                }
                // personalDetailsComparator ranks on `text ?? alternateText ?? login`. Both paths always populate
                // `text` with a string, so the fallbacks are unreachable for personal details and the shells
                // getValidOptions ranks cannot order differently from the hydrated options orderOptions ranks
                // later. Assert that invariant directly: if createOption ever leaves `text` nullish, the two
                // passes would silently diverge (the shell has no alternateText to fall back to, by design).
                expect(typeof shell?.text).toBe('string');
                expect(typeof eagerOption.text).toBe('string');
            }
        });

        it('should produce results identical to eagerly built options with custom exclusions', () => {
            // Given the same data as lightweight shells and as fully hydrated options
            const {eagerList, lazyList} = buildOptionLists();

            // When both lists go through getValidOptions with a custom exclusion (filter reads shell.login)
            const config = {dateFnsLocale: undefined, excludeLogins: {'peterparker@expensify.com': true}, personalDetails: PERSONAL_DETAILS};
            const {options: eagerResults} = getValidOptions(eagerList, allPolicies, {}, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, config, translateLocal);
            const {options: lazyResults} = getValidOptions(lazyList, allPolicies, {}, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, config, translateLocal);

            // Then the excluded contact is dropped from both and the remaining results match
            expect(lazyResults.personalDetails.some((option) => option.login === 'peterparker@expensify.com')).toBe(false);
            expect(lazyResults.personalDetails).toEqual(eagerResults.personalDetails);
        });

        it('should handle empty personal details', () => {
            // Given a lazily built option list with no personal details
            const lazyList = createFilteredOptionList({}, REPORTS, MOCK_REPORT_ATTRIBUTES_DERIVED, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });

            // When it goes through getValidOptions
            const {options: results} = getValidOptions(
                lazyList,
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );

            // Then no contacts are produced and nothing throws
            expect(lazyList.personalDetails).toEqual([]);
            expect(results.personalDetails).toEqual([]);
        });

        it('should hydrate every rendering-critical property on surviving contacts', () => {
            // Given a lazily built option list
            const {lazyList} = buildOptionLists();

            // When it goes through getValidOptions
            const {options: results} = getValidOptions(
                lazyList,
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {
                    dateFnsLocale: undefined,
                    personalDetails: PERSONAL_DETAILS,
                },
                translateLocal,
            );

            // Then every surviving contact has the properties SelectionList rendering and selection rely on,
            // so the deferred build introduces no missing fields
            expect(results.personalDetails.length).toBeGreaterThan(0);
            for (const option of results.personalDetails) {
                expect(option.icons).toBeDefined();
                expect(option.keyForList).toBeTruthy();
                expect(option.text).toBeDefined();
                expect(option.alternateText).toBeDefined();
                expect(option.login).toBeDefined();
                expect(option.accountID).toBeDefined();
                expect(typeof option.isSelected).toBe('boolean');
            }
        });

        it('should produce results identical to eagerly built options when searching with a top-N cap', () => {
            // Given the same data as lightweight shells and as fully hydrated options
            const {eagerList, lazyList} = buildOptionLists();

            // When both lists go through getValidOptions with search + maxElements together
            // (filter selects matches, then the heap keeps only the top-N survivors to hydrate)
            const config = {dateFnsLocale: undefined, searchString: 'man', maxElements: 3, personalDetails: PERSONAL_DETAILS};
            const {options: eagerResults} = getValidOptions(eagerList, allPolicies, {}, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, config, translateLocal);
            const {options: lazyResults} = getValidOptions(lazyList, allPolicies, {}, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, config, translateLocal);

            // Then filtering, ranking, and hydration match the eager path
            expect(lazyResults.personalDetails.length).toBeGreaterThan(0);
            expect(lazyResults.personalDetails.every((option) => option.icons !== undefined)).toBe(true);
            expect(lazyResults.personalDetails.every((option) => !('hydrate' in option))).toBe(true);
            expect(lazyResults.personalDetails).toEqual(eagerResults.personalDetails);
        });

        it('should hydrate correctly after a filtered option list cache hit', () => {
            // Given lazy contact options built while not searching (the only mode that uses the option-list cache)
            clearFilteredOptionListCache();
            const firstLazyList = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, MOCK_REPORT_ATTRIBUTES_DERIVED, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });
            const cachedLazyList = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, MOCK_REPORT_ATTRIBUTES_DERIVED, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });
            const eagerList = hydrateAllPersonalDetails(firstLazyList);

            // Then the cache hit still returns shells
            expect(cachedLazyList.personalDetails.every((option) => !option.isHydrated)).toBe(true);

            // And the clone from the cache hit shares each shell's hydration closure, so the expensive build is
            // reused rather than re-run per clone. cloneOptionList allocates a new shell object on every return,
            // so a memo keyed on shell identity would start empty here and rebuild the whole visible page.
            const freshShell = firstLazyList.personalDetails.at(0);
            const cachedShell = cachedLazyList.personalDetails.at(0);
            expect(freshShell).toBeDefined();
            expect(cachedShell).toBeDefined();
            expect(cachedShell).not.toBe(freshShell);
            if (freshShell && cachedShell) {
                expect(hydrateContactOption(cachedShell).icons).toBe(hydrateContactOption(freshShell).icons);
            }

            // When both the fresh and cached lazy lists go through getValidOptions
            const config = {dateFnsLocale: undefined, maxElements: 3, personalDetails: PERSONAL_DETAILS};
            const {options: firstResults} = getValidOptions(firstLazyList, allPolicies, {}, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, config, translateLocal);
            const {options: cachedResults} = getValidOptions(cachedLazyList, allPolicies, {}, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, config, translateLocal);
            const {options: eagerResults} = getValidOptions(eagerList, allPolicies, {}, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, config, translateLocal);

            // Then hydration from the cached clone matches the fresh lazy build and the eager path
            expect(cachedResults.personalDetails).toEqual(firstResults.personalDetails);
            expect(cachedResults.personalDetails).toEqual(eagerResults.personalDetails);
        });

        it('serves the SearchRouter empty-query list from the cache on the second build', () => {
            // Given the config the SearchRouter warm-up and SearchAutocompleteList both build with
            const {maxRecentReports, includeP2P, deferContactsUntilSearch} = SEARCH_ROUTER_OPTIONS_CONFIG;
            const options = {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                maxRecentReports,
                includeP2P,
                deferContactsUntilSearch,
                isSearching: false,
            };
            clearFilteredOptionListCache();

            // When the warm-up builds the list and the first open builds it again from the same Onyx snapshots
            const warmed = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, MOCK_REPORT_ATTRIBUTES_DERIVED, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, options);
            const opened = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, MOCK_REPORT_ATTRIBUTES_DERIVED, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, options);

            // Then the open gets a clone of the warm build instead of rebuilding it, contacts stay deferred,
            // and typing is a separate entry that still builds them
            expect(opened.reports.at(0)).not.toBe(warmed.reports.at(0));
            expect(opened.reports.at(0)?.icons).toBe(warmed.reports.at(0)?.icons);
            expect(warmed.personalDetails).toHaveLength(0);
            expect(
                createFilteredOptionList(PERSONAL_DETAILS, REPORTS, MOCK_REPORT_ATTRIBUTES_DERIVED, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, {...options, isSearching: true})
                    .personalDetails.length,
            ).toBeGreaterThan(0);
        });

        it('should hydrate with the build-time inputs, keeping brickRoadIndicator without any caller-provided data', () => {
            // Given a contact whose 1:1 DM report has a brick road status in the derived report attributes
            const {lazyList: baseList} = buildOptionLists();
            const dmReportID = baseList.personalDetails.find((option) => option.reportID)?.reportID;
            expect(dmReportID).toBeTruthy();
            const attributesWithError: Record<string, ReportAttributes> = {
                ...MOCK_REPORT_ATTRIBUTES_DERIVED,
                [String(dmReportID)]: {
                    ...MOCK_REPORT_ATTRIBUTES_DERIVED[String(dmReportID)],
                    brickRoadStatus: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
                },
            };
            const lazyList = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, attributesWithError, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });
            const shell = lazyList.personalDetails.find((option) => option.reportID === dmReportID);
            expect(shell).toBeDefined();
            if (!shell) {
                return;
            }

            // When the shell is hydrated (hydration reads the inputs captured at build time, so no consumer
            // - e.g. a getSearchOptions caller without report attributes in scope - can drop display data)
            const hydrated = hydrateContactOption(shell);

            // Then the RBR indicator matches what the eager build would have produced
            expect(hydrated.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        });

        it('should reuse the built option per shell while still returning a fresh object every time', () => {
            // Given a shell hydrated once (screens like NewChatPage re-run getValidOptions on every keystroke,
            // so re-running createOption for every surviving contact would be slower than the eager build)
            const {lazyList} = buildOptionLists();
            const shell = lazyList.personalDetails.at(0);
            expect(shell).toBeDefined();
            if (!shell) {
                return;
            }
            const first = hydrateContactOption(shell);

            // When the same shell is hydrated again
            const second = hydrateContactOption(shell);

            // Then the expensive parts are shared, but the option itself is a new object so consumers marking it
            // in place (isSelected/isBold) cannot leak into other callers and list rows still see a changed reference
            expect(second).not.toBe(first);
            expect(second).toEqual(first);
            expect(second.icons).toBe(first.icons);

            // And mutating one copy leaves later hydrations of the same shell untouched
            first.isSelected = true;
            expect(hydrateContactOption(shell).isSelected).toBe(false);
        });

        it('should hydrate lazy shells when mixed with fully-built device contacts', () => {
            // Given a fully-built device contact appended onto eager and lazy lists as the hydrated half of the
            // union, matching useSearchSelector's contactOptions concat path
            const deviceContactLogin = '+15551234567';
            const deviceContact: HydratedPersonalDetailOption = {
                item: {
                    accountID: 9999,
                    displayName: 'Device Contact Jane',
                    login: deviceContactLogin,
                },
                reportID: '',
                keyForList: '9999',
                text: 'Device Contact Jane',
                alternateText: deviceContactLogin,
                login: deviceContactLogin,
                accountID: 9999,
                participantsList: [
                    {
                        accountID: 9999,
                        displayName: 'Device Contact Jane',
                        login: deviceContactLogin,
                    },
                ],
                icons: [
                    {
                        source: '',
                        name: 'Device Contact Jane',
                        type: CONST.ICON_TYPE_AVATAR,
                        id: 9999,
                    },
                ],
                isSelected: false,
                selected: false,
                brickRoadIndicator: null,
                isHydrated: true,
            };

            const {eagerList, lazyList} = buildOptionLists();
            const eagerWithContacts: OptionList = {
                ...eagerList,
                personalDetails: eagerList.personalDetails.concat(deviceContact),
            };
            const lazyWithContacts: OptionList = {
                ...lazyList,
                personalDetails: lazyList.personalDetails.concat(deviceContact),
            };

            // When both mixed lists are filtered for the device contact
            const config = {dateFnsLocale: undefined, searchString: 'Device Contact Jane', personalDetails: PERSONAL_DETAILS};
            const {options: eagerResults} = getValidOptions(eagerWithContacts, allPolicies, {}, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, config, translateLocal);
            const {options: lazyResults} = getValidOptions(lazyWithContacts, allPolicies, {}, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, config, translateLocal);

            // Then the device contact survives hydrate unchanged, lazy shells hydrate, and results match eager
            expect(lazyResults.personalDetails.some((option) => option.login === deviceContactLogin)).toBe(true);
            expect(lazyResults.personalDetails.find((option) => option.login === deviceContactLogin)?.icons).toBeDefined();
            expect(lazyResults.personalDetails.every((option) => !('hydrate' in option))).toBe(true);
            expect(lazyResults.personalDetails).toEqual(eagerResults.personalDetails);
        });
    });

    describe('lazy contact hydration vs. a direct createOption build', () => {
        // A self-contained fixture so every hydration input can be set to a non-default value and the output
        // field it drives can be asserted individually. Comparing hydration against another hydration cannot
        // catch a dropped input; comparing it against a direct createOption call can.
        const PARITY_ACCOUNT_ID = 77;
        const PARITY_REPORT_ID = '7700';
        const PARITY_LOGIN = 'parity@expensify.com';

        const PARITY_PERSONAL_DETAILS: PersonalDetailsList = {
            '77': {
                accountID: PARITY_ACCOUNT_ID,
                displayName: 'Parity Contact',
                login: PARITY_LOGIN,
                keyForList: PARITY_LOGIN,
                reportID: PARITY_REPORT_ID,
            },
        };
        const PARITY_PERSONAL_DETAIL = PARITY_PERSONAL_DETAILS['77'] ?? null;

        // A plain 1:1 DM, so createFilteredOptionList maps it onto the contact above.
        const PARITY_REPORT: Report = {
            reportID: PARITY_REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            reportName: 'Parity Contact',
            lastVisibleActionCreated: '2024-01-01 00:00:00.000',
            participants: {
                [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [PARITY_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
        };
        const PARITY_REPORTS: OnyxCollection<Report> = {[PARITY_REPORT_ID]: PARITY_REPORT};

        // Non-default hydration inputs. Each one drives a different field of the built option, asserted below.
        const PARITY_ATTRIBUTES: Record<string, ReportAttributes> = {
            [PARITY_REPORT_ID]: {
                reportName: 'Parity Contact',
                isEmpty: false,
                brickRoadStatus: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
                requiresAttention: true,
                reportErrors: {},
            },
        };
        const PARITY_ARCHIVED_MAP: PrivateIsArchivedMap = {
            [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${PARITY_REPORT_ID}`]: true,
        };

        const buildParityShell = () => {
            clearFilteredOptionListCache();
            const list = createFilteredOptionList(PARITY_PERSONAL_DETAILS, PARITY_REPORTS, PARITY_ATTRIBUTES, PARITY_ARCHIVED_MAP, allPolicies, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });
            const shell = list.personalDetails.at(0);
            expect(shell).toBeDefined();
            // Guard against a vacuous pass: the DM has to be mapped onto the contact, or none of the
            // report-derived inputs below would reach createOption on either side.
            expect(shell?.reportID).toBe(PARITY_REPORT_ID);
            return shell;
        };

        it('should produce exactly what createOption produces from the same inputs', () => {
            // Given a shell built from a fixture where every report-derived hydration input is non-default
            const shell = buildParityShell();
            if (!shell) {
                return;
            }

            // When it is hydrated
            const hydrated = hydrateContactOption(shell);

            // Then it matches an option built by calling createOption directly with those same inputs.
            // Dropping any input from the hydration path makes this diverge, because this side names them all.
            const expected: HydratedPersonalDetailOption = {
                item: PARITY_PERSONAL_DETAIL,
                ...createOption({
                    dateFnsLocale: undefined,
                    accountIDs: [PARITY_ACCOUNT_ID],
                    personalDetails: PARITY_PERSONAL_DETAILS,
                    report: PARITY_REPORT,
                    policy: undefined,
                    privateIsArchived: true,
                    conciergeReportID: undefined,
                    config: {showPersonalDetails: true},
                    reportAttributesDerived: PARITY_ATTRIBUTES,
                    policyTags: undefined,
                    visibleReportActionsData: {},
                }),
                isHydrated: true,
            };

            expect(hydrated).toEqual(expected);
        });

        it('should carry the brick road status from reportAttributesDerived into the built option', () => {
            // Given reportAttributesDerived marking the mapped DM with an error brick road
            const shell = buildParityShell();
            if (!shell) {
                return;
            }

            // Then hydration surfaces it, so a caller with no report attributes in scope cannot lose it
            expect(hydrateContactOption(shell).brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        });

        it('should carry the archived state from privateIsArchivedMap into the built option', () => {
            // Given a privateIsArchivedMap marking the mapped DM as archived
            const shell = buildParityShell();
            if (!shell) {
                return;
            }

            // Then hydration reflects it
            expect(hydrateContactOption(shell).private_isArchived).toBe(true);
        });

        it('should carry conciergeReportID into the built option', () => {
            // Given the mapped DM is the Concierge report
            clearFilteredOptionListCache();
            const list = createFilteredOptionList(PARITY_PERSONAL_DETAILS, PARITY_REPORTS, PARITY_ATTRIBUTES, PARITY_ARCHIVED_MAP, allPolicies, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: PARITY_REPORT_ID,
                isSearching: true,
            });
            const shell = list.personalDetails.at(0);
            expect(shell).toBeDefined();
            if (!shell) {
                return;
            }

            // Then hydration builds the same option a direct createOption call with that conciergeReportID does,
            // rather than the one it would build with conciergeReportID dropped
            const hydrated = hydrateContactOption(shell);
            const withConcierge = createOption({
                dateFnsLocale: undefined,
                accountIDs: [PARITY_ACCOUNT_ID],
                personalDetails: PARITY_PERSONAL_DETAILS,
                report: PARITY_REPORT,
                policy: undefined,
                privateIsArchived: true,
                conciergeReportID: PARITY_REPORT_ID,
                config: {showPersonalDetails: true},
                reportAttributesDerived: PARITY_ATTRIBUTES,
                policyTags: undefined,
                visibleReportActionsData: {},
            });

            expect(hydrated).toEqual({item: PARITY_PERSONAL_DETAIL, ...withConcierge, isHydrated: true});
        });
    });

    describe('lazy contact options on the warm path', () => {
        // createOption is called through a module-local binding, so a jest spy on the export never sees it.
        // buildFullOption allocates a fresh `icons` array per build instead, so sharing that array by reference
        // is exactly "no createOption ran": a rebuild could not produce the same array object.
        const buildIdentity = (option: PersonalDetailOptionOrShell) => hydrateContactOption(option).icons;

        it('should not rebuild any contact option when the second option list comes from the entry cache', () => {
            // Given two identical createFilteredOptionList calls, the second served from the entry cache
            clearFilteredOptionListCache();
            const first = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, MOCK_REPORT_ATTRIBUTES_DERIVED, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });
            const second = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, MOCK_REPORT_ATTRIBUTES_DERIVED, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });
            expect(first.personalDetails.length).toBeGreaterThan(0);
            expect(second.personalDetails.length).toBe(first.personalDetails.length);

            // When both are run through getValidOptions (the first pass builds, the second must not)
            const config = {dateFnsLocale: undefined, personalDetails: PERSONAL_DETAILS};
            const firstBuilds = first.personalDetails.map(buildIdentity);
            const {options: firstResults} = getValidOptions(first, allPolicies, {}, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, config, translateLocal);
            const {options: secondResults} = getValidOptions(second, allPolicies, {}, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, config, translateLocal);
            const secondBuilds = second.personalDetails.map(buildIdentity);

            // Then every contact on the second pass reused the first pass's build.
            // cloneOptionList hands out fresh shell objects on every return, so a memo keyed on shell identity
            // starts empty for each clone and rebuilds the whole visible page — slower than the eager build it
            // replaced. Keying the memo inside the shell's own closure is what makes the warm path free.
            expect(secondBuilds).toHaveLength(firstBuilds.length);
            for (let i = 0; i < firstBuilds.length; i++) {
                expect(secondBuilds.at(i)).toBe(firstBuilds.at(i));
            }

            // And the two passes still produce equal output
            expect(secondResults.personalDetails).toEqual(firstResults.personalDetails);
        });

        it('should freeze the memoized build in dev while leaving the copy handed to callers writable', () => {
            // Given a hydrated contact option
            clearFilteredOptionListCache();
            const list = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, MOCK_REPORT_ATTRIBUTES_DERIVED, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });
            const shell = list.personalDetails.at(0);
            expect(shell).toBeDefined();
            if (!shell) {
                return;
            }
            const hydrated = hydrateContactOption(shell);
            const icons = hydrated.icons;
            expect(icons?.length).toBeGreaterThan(0);

            // Then its nested objects — shared with every other caller that hydrates the same contact — are
            // locked, so a consumer that mutates one cannot silently corrupt what the next caller reads.
            // NOTE: jest runs this file in sloppy mode, where assigning to a frozen property fails silently
            // instead of throwing, so assert the freeze itself plus a mutation that throws in either mode.
            expect(Object.isFrozen(icons)).toBe(true);
            expect(Object.isFrozen(icons?.at(0))).toBe(true);
            const originalSource = icons?.at(0)?.source;
            const icon = icons?.at(0);
            if (icon) {
                icon.source = '';
            }
            expect(icons?.at(0)?.source).toBe(originalSource);
            expect(() => icons?.pop()).toThrow(TypeError);

            // While the top-level copy stays writable, because getValidOptions marks options in place
            hydrated.isBold = true;
            expect(hydrated.isBold).toBe(true);
            expect(Object.isFrozen(hydrated)).toBe(false);
        });
    });

    describe('PersonalDetailOptionOrShell typing', () => {
        it('should not let a display field be read without narrowing on isHydrated', () => {
            clearFilteredOptionListCache();
            const list = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, MOCK_REPORT_ATTRIBUTES_DERIVED, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });
            const option = list.personalDetails.at(0);
            expect(option).toBeDefined();
            if (!option) {
                return;
            }

            // The display fields only exist on the hydrated half of the union, so reading one off the union is
            // a compile error rather than an `undefined` that reaches a rendered row.
            // @ts-expect-error icons is not readable without narrowing on isHydrated
            const {icons} = option;
            // @ts-expect-error subtitle is not readable without narrowing on isHydrated
            const {subtitle} = option;
            expect(icons).toBeUndefined();
            expect(subtitle).toBeUndefined();

            // Narrowing (or hydrating) is what makes them readable
            expect(hydrateContactOption(option).icons).toBeDefined();
        });
    });

    describe('getValidOptions() for chat room', () => {
        it('should include all reports by default', () => {
            // Given a set of reports and personalDetails that includes workspace rooms
            // When we call getValidOptions()
            const {options: results} = getValidOptions(
                OPTIONS_WITH_WORKSPACE_ROOM,
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeRecentReports: true, includeMultipleParticipantReports: true, includeP2P: true, includeOwnedWorkspaceChats: true, sortedActions: undefined},
                translateLocal,
            );

            // Then the result should include all reports except the currently logged in user
            expect(results.recentReports.length).toBe(OPTIONS_WITH_WORKSPACE_ROOM.reports.length - 1);
            expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({reportID: '14'})]));
        });

        it('should use personalDetails config for workspace chat lookups when shouldSeparateWorkspaceChat is true', () => {
            // Given a set of reports with workspace rooms and a custom personalDetails collection
            const customPersonalDetails: PersonalDetailsList = {
                '1': {
                    accountID: 1,
                    displayName: 'Custom Reed Richards',
                    login: 'reedrichards@expensify.com',
                    keyForList: 'reedrichards@expensify.com',
                    reportID: '1',
                },
                '2': {
                    accountID: 2,
                    displayName: 'Custom Iron Man',
                    login: 'tonystark@expensify.com',
                    keyForList: 'tonystark@expensify.com',
                    reportID: '2',
                },
            };

            // When we call getValidOptions with shouldSeparateWorkspaceChat and personalDetails config
            const {options: results} = getValidOptions(
                OPTIONS_WITH_WORKSPACE_ROOM,
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {
                    dateFnsLocale: undefined,
                    includeRecentReports: true,
                    includeMultipleParticipantReports: true,
                    includeP2P: true,
                    includeOwnedWorkspaceChats: true,
                    shouldSeparateWorkspaceChat: true,
                    personalDetails: customPersonalDetails,
                    sortedActions: undefined,
                },
                translateLocal,
            );

            // Then the function should process without errors and return workspace chats
            expect(results.workspaceChats).toBeDefined();
            // And recent reports should still be returned
            expect(results.recentReports.length).toBeGreaterThanOrEqual(0);
        });

        it('should handle undefined personalDetails config in workspace chat lookups', () => {
            // Given a set of reports with workspace rooms
            // When we call getValidOptions with shouldSeparateWorkspaceChat but no personalDetails config
            const {options: results} = getValidOptions(
                OPTIONS_WITH_WORKSPACE_ROOM,
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {
                    dateFnsLocale: undefined,
                    includeRecentReports: true,
                    includeMultipleParticipantReports: true,
                    includeP2P: true,
                    includeOwnedWorkspaceChats: true,
                    shouldSeparateWorkspaceChat: true,
                    personalDetails: undefined,
                    sortedActions: undefined,
                },
                translateLocal,
            );

            // Then the function should fall back to allPersonalDetails and process without errors
            expect(results.workspaceChats).toBeDefined();
            expect(results.recentReports.length).toBeGreaterThanOrEqual(0);
        });

        it('should handle empty personalDetails config in workspace chat lookups', () => {
            // Given a set of reports with workspace rooms
            // When we call getValidOptions with shouldSeparateWorkspaceChat and empty personalDetails
            const {options: results} = getValidOptions(
                OPTIONS_WITH_WORKSPACE_ROOM,
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {
                    dateFnsLocale: undefined,
                    includeRecentReports: true,
                    includeMultipleParticipantReports: true,
                    includeP2P: true,
                    includeOwnedWorkspaceChats: true,
                    shouldSeparateWorkspaceChat: true,
                    personalDetails: {},
                    sortedActions: undefined,
                },
                translateLocal,
            );

            // Then the function should fall back to allPersonalDetails and process without errors
            expect(results.workspaceChats).toBeDefined();
            expect(results.recentReports.length).toBeGreaterThanOrEqual(0);
        });

        it('should handle null personalDetails config in workspace chat lookups', () => {
            // Given a set of reports with workspace rooms
            // When we call getValidOptions with shouldSeparateWorkspaceChat and null personalDetails
            const {options: results} = getValidOptions(
                OPTIONS_WITH_WORKSPACE_ROOM,
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {
                    dateFnsLocale: undefined,
                    includeRecentReports: true,
                    includeMultipleParticipantReports: true,
                    includeP2P: true,
                    includeOwnedWorkspaceChats: true,
                    shouldSeparateWorkspaceChat: true,
                    personalDetails: {},
                    sortedActions: undefined,
                },
                translateLocal,
            );

            // Then the function should fall back to allPersonalDetails and process without errors
            expect(results.workspaceChats).toBeDefined();
            expect(results.recentReports.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('getValidOptions() for group Chat', () => {
        it('should exclude users with recent reports from personalDetails', () => {
            // Given a set of reports and personalDetails
            // When we call getValidOptions with no search value
            const {options: results} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            const reportLogins = new Set(results.recentReports.map((reportOption) => reportOption.login));
            const personalDetailsOverlapWithReports = results.personalDetails.every((personalDetailOption) => reportLogins.has(personalDetailOption.login));

            // Then we should expect all the personalDetails to show except the currently logged in user
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS.personalDetails).length - 1);
            // Then none of our personalDetails should include any of the users with recent reports
            expect(personalDetailsOverlapWithReports).toBe(false);
        });

        it('should exclude selected options', () => {
            // Given a set of reports and personalDetails
            // When we call getValidOptions with excludeLogins param
            const {options: results} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, excludeLogins: {'peterparker@expensify.com': true}, sortedActions: undefined},
                translateLocal,
            );

            // Then the option should not appear anywhere in either list
            expect(results.recentReports.every((option) => option.login !== 'peterparker@expensify.com')).toBe(true);
            expect(results.personalDetails.every((option) => option.login !== 'peterparker@expensify.com')).toBe(true);
        });

        it('should include Concierge in the results by default', () => {
            // Given a set of report and personalDetails that include Concierge
            // When we call getValidOptions()
            const {options: results} = getValidOptions(
                {
                    reports: OPTIONS_WITH_CONCIERGE.reports,
                    personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails,
                },
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );

            // Then the result should include all personalDetails except the currently logged in user
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 1);
            // Then Concierge should be included in the results
            expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
        });

        it('should exclude Concierge from the results when it is specified in excludedLogins', () => {
            // Given a set of reports and personalDetails that includes Concierge
            // When we call getValidOptions with excludeLogins param
            const {options: results} = getValidOptions(
                {
                    reports: OPTIONS_WITH_CONCIERGE.reports,
                    personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails,
                },
                undefined,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, excludeLogins: {[CONST.EMAIL.CONCIERGE]: true}, sortedActions: undefined},
                translateLocal,
            );

            // Then the result should include all personalDetails except the currently logged in user and Concierge
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 2);
            // Then none of the results should include Concierge
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
            expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
        });

        it('should exclude Chronos from the results when it is specified in excludedLogins', () => {
            // given a set of reports and personalDetails that includes Chronos
            // When we call getValidOptions() with excludeLogins param
            const {options: results} = getValidOptions(
                {
                    reports: OPTIONS_WITH_CHRONOS.reports,
                    personalDetails: OPTIONS_WITH_CHRONOS.personalDetails,
                },
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, excludeLogins: {[CONST.EMAIL.CHRONOS]: true}, sortedActions: undefined},
                translateLocal,
            );

            // Then the result should include all personalDetails except the currently logged in user and Chronos
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CHRONOS.personalDetails).length - 2);
            // Then none of the results should include Chronos
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));
            expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));
        });

        it('should exclude Receipts from the results when it is specified in excludedLogins', () => {
            // Given a set of reports and personalDetails that includes receipts
            // When we call getValidOptions() with excludeLogins param
            const {options: results} = getValidOptions(
                {
                    reports: OPTIONS_WITH_RECEIPTS.reports,
                    personalDetails: OPTIONS_WITH_RECEIPTS.personalDetails,
                },
                undefined,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, excludeLogins: {[CONST.EMAIL.RECEIPTS]: true}, sortedActions: undefined},
                translateLocal,
            );

            // Then the result should include all personalDetails except the currently logged in user and receipts
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_RECEIPTS.personalDetails).length - 2);
            // Then none of the results should include receipts
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
            expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
        });

        it('should limit recent reports when maxRecentReportElements is specified', () => {
            // Given a set of reports and personalDetails with multiple reports
            // When we call getValidOptions with maxRecentReportElements set to 2
            const maxRecentReports = 2;
            const {options: results} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, maxRecentReportElements: maxRecentReports, sortedActions: undefined},
                translateLocal,
            );

            // Then the recent reports should be limited to the specified number
            expect(results.recentReports.length).toBeLessThanOrEqual(maxRecentReports);
        });

        it('should show all reports when maxRecentReportElements is not specified', () => {
            // Given a set of reports and personalDetails
            // When we call getValidOptions without maxRecentReportElements
            const {options: resultsWithoutLimit} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            const {options: resultsWithLimit} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, maxRecentReportElements: 2, sortedActions: undefined},
                translateLocal,
            );

            // Then the results without limit should have more or equal reports
            expect(resultsWithoutLimit.recentReports.length).toBeGreaterThanOrEqual(resultsWithLimit.recentReports.length);
        });

        it('should not affect personalDetails count when maxRecentReportElements is specified', () => {
            // Given a set of reports and personalDetails
            // When we call getValidOptions with and without maxRecentReportElements
            const {options: resultsWithoutLimit} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            const {options: resultsWithLimit} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, maxRecentReportElements: 2, sortedActions: undefined},
                translateLocal,
            );

            // Then personalDetails should remain the same regardless of maxRecentReportElements
            expect(resultsWithLimit.personalDetails.length).toBe(resultsWithoutLimit.personalDetails.length);
        });

        it('should respect maxRecentReportElements when combined with maxElements', () => {
            // Given a set of reports and personalDetails
            // When we call getValidOptions with both maxElements and maxRecentReportElements
            const maxRecentReports = 3;
            const maxTotalElements = 10;
            const {options: results} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, maxElements: maxTotalElements, maxRecentReportElements: maxRecentReports, sortedActions: undefined},
                translateLocal,
            );

            // Then recent reports should be limited by maxRecentReportElements
            expect(results.recentReports.length).toBeLessThanOrEqual(maxRecentReports);
            // Then the total number of options (reports + personalDetails) should not exceed maxElements
            expect(results.recentReports.length + results.personalDetails.length).toBeLessThanOrEqual(maxTotalElements);
        });
    });

    describe('getShareDestinationsOptions()', () => {
        beforeEach(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}10`, REPORTS['10'] ?? {});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}10`, reportNameValuePairs);
        });

        it('should exclude archived rooms and hidden threads from share destinations', () => {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            const filteredReports = Object.values(OPTIONS.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                const {result: isReportArchived} = renderHook(() => useReportIsArchived(report.reportID));
                if (canUserPerformWriteAction(report, isReportArchived.current) && canCreateTaskInReport(report) && !isCanceledTaskReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            // When we call getValidOptions for share destination with an empty search value
            const {options: results} = getValidOptions(
                {reports: filteredReports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {
                    dateFnsLocale: undefined,
                    betas: [],
                    includeMultipleParticipantReports: true,
                    showChatPreviewLine: true,
                    forcePolicyNamePreview: true,
                    includeThreads: true,
                    includeMoneyRequests: true,
                    includeTasks: true,
                    excludeLogins: {},
                    includeOwnedWorkspaceChats: true,
                    includeSelfDM: true,
                    searchString: '',
                    includeUserToInvite: false,
                    sortedActions: undefined,
                },
                translateLocal,
            );

            // Then all the recent reports should be returned except the archived rooms and the hidden thread
            expect(results.recentReports.length).toBe(Object.values(OPTIONS.reports).length - 2);
        });

        it('should include DMS, group chats, and workspace rooms in share destinations', () => {
            // Given a set of filtered current Reports (as we do in the component) with workspace rooms before getting share destination options
            const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                const {result: isReportArchived} = renderHook(() => useReportIsArchived(report.reportID));

                if (canUserPerformWriteAction(report, isReportArchived.current) || isExpensifyOnlyParticipantInReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            // When we call getValidOptions for share destination with an empty search value
            const {options: results} = getValidOptions(
                {
                    reports: filteredReportsWithWorkspaceRooms,
                    personalDetails: OPTIONS.personalDetails,
                },
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {
                    dateFnsLocale: undefined,
                    betas: [],
                    includeMultipleParticipantReports: true,
                    showChatPreviewLine: true,
                    forcePolicyNamePreview: true,
                    includeThreads: true,
                    includeMoneyRequests: true,
                    includeTasks: true,
                    excludeLogins: {},
                    includeOwnedWorkspaceChats: true,
                    includeSelfDM: true,
                    searchString: '',
                    includeUserToInvite: false,
                    sortedActions: undefined,
                },
                translateLocal,
            );

            // Then all recent reports should be returned except the archived rooms and the hidden thread
            expect(results.recentReports.length).toBe(Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).length - 2);
        });
    });

    describe('getLastActorDisplayName()', () => {
        it('should return correct display name', () => {
            renderLocaleContextProvider();
            // Given two different personal details and current user is accountID 2
            const currentUserAccountID = 2;

            // When we call getLastActorDisplayName
            const result1 = getLastActorDisplayName(PERSONAL_DETAILS['2'], currentUserAccountID, translateLocal);
            const result2 = getLastActorDisplayName(PERSONAL_DETAILS['3'], currentUserAccountID, translateLocal);

            // We should expect "You" for current user and first name for others
            expect(result1).toBe('You');
            expect(result2).toBe('Spider-Man');
        });

        it('should resolve the current user label and hidden fallback through the provided translate function', () => {
            const currentUserAccountID = 2;
            const translateWithMarkers: LocalizedTranslate = (path, ...parameters) => {
                if (path === 'common.you') {
                    return 'YouMarker';
                }
                if (path === 'common.hidden') {
                    return 'HiddenMarker';
                }
                return translateLocal(path, ...parameters);
            };

            // The current user resolves to the translated "you" label.
            expect(getLastActorDisplayName(PERSONAL_DETAILS['2'], currentUserAccountID, translateWithMarkers)).toBe('YouMarker');

            // An actor without firstName, displayName, or login falls back to the translated hidden label.
            expect(getLastActorDisplayName({accountID: 999}, currentUserAccountID, translateWithMarkers)).toBe('HiddenMarker');
        });
    });

    describe('shouldShowLastActorDisplayName()', () => {
        const currentUserAccountID = 2;

        it('should return false when lastReportAction is not available', () => {
            // Given a report with no lastVisibleReportAction and no lastAction provided
            const report = REPORTS['1'];
            const lastActorDetails = PERSONAL_DETAILS['3'];

            const result = shouldShowLastActorDisplayName(report, lastActorDetails, undefined, currentUserAccountID, translateLocal);
            expect(result).toBe(false);
        });

        it('should return false when lastActorDetails is null', () => {
            // Given a report with a lastReportAction but no lastActorDetails
            const report = REPORTS['1'];
            const lastAction = createRandomReportAction(1);

            const result = shouldShowLastActorDisplayName(report, null, lastAction, currentUserAccountID, translateLocal);
            expect(result).toBe(false);
        });

        it('should return false when report is a self DM', () => {
            // Given a self DM report with a lastAction and lastActorDetails
            const report = REPORTS_WITH_SELF_DM['17'];
            const lastActorDetails = PERSONAL_DETAILS['2'];
            const lastAction = createRandomReportAction(1);

            // When we call shouldShowLastActorDisplayName with a self DM report
            const result = shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID, translateLocal);
            expect(result).toBe(false);
        });

        it('should return false when report is a DM but lastActorDetails is not the current user', () => {
            // Given a DM report where last actor is not current user
            const report = REPORTS['2'];
            expect(report).toBeDefined();
            if (!report) {
                throw new Error('Expected the DM report fixture to be defined');
            }
            const lastActorDetails = PERSONAL_DETAILS['3'];
            const lastAction = createRandomReportAction(1);

            const result = shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID, translateLocal);
            expect(result).toBe(false);
        });

        it('should return false when the last action is an IOU', () => {
            // Given a report with an IOU last action name
            const report = REPORTS['1'];
            const lastActorDetails = PERSONAL_DETAILS['2'];
            const lastAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            };

            const result = shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID, translateLocal);
            expect(result).toBe(false);
        });

        it('should return false when getLastActorDisplayName returns empty string', () => {
            renderLocaleContextProvider();
            // Given a report with lastActorDetails that has no displayName or firstName
            const report = REPORTS['1'];
            const lastActorDetails: Partial<PersonalDetails> = {
                accountID: 99,
                login: '',
                displayName: '',
                firstName: '',
            };
            const lastAction = createRandomReportAction(1);

            const result = shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID, translateLocal);
            expect(result).toBe(false);
        });

        it('should return true when all conditions are met', () => {
            renderLocaleContextProvider();
            // Given a report without reportID (so it uses the lastReportAction)
            const report: Report | undefined = undefined;
            const lastActorDetails = PERSONAL_DETAILS['3'];
            const lastAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            };

            // When we call shouldShowLastActorDisplayName with all valid conditions
            const result = shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID, translateLocal);
            expect(result).toBe(true);
        });

        it('should return true when the last actor is the current user in a group chat', () => {
            renderLocaleContextProvider();
            // Given a report without reportID (so it uses the lastReportAction)
            const report: Report | undefined = undefined;
            const lastActorDetails = PERSONAL_DETAILS['2'];
            const lastAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            };

            const result = shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID, translateLocal);
            expect(result).toBe(true);
        });

        it('should return true when report is a DM with current user as the last actor', () => {
            renderLocaleContextProvider();
            // Given a report without reportID
            const report: Report | undefined = undefined;
            const lastActorDetails = PERSONAL_DETAILS['2'];
            const lastAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            };

            // When we call shouldShowLastActorDisplayName with the current user as last actor
            const result = shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID, translateLocal);
            expect(result).toBe(true);
        });
    });

    describe('formatMemberForList()', () => {
        it('should format members correctly', () => {
            // Given a set of personal details
            // When we call formatMemberForList
            const formattedMembers = Object.values(PERSONAL_DETAILS).map((personalDetail) => formatMemberForList(personalDetail));

            // Then the formatted members' order should be the same as the original PERSONAL_DETAILS array
            expect(formattedMembers.at(0)?.text).toBe('Mister Fantastic');
            expect(formattedMembers.at(1)?.text).toBe('Iron Man');
            expect(formattedMembers.at(2)?.text).toBe('Spider-Man');

            // Then only the first item should be selected
            expect(formattedMembers.at(0)?.isSelected).toBe(true);
            // Then all remaining items should be unselected
            expect(formattedMembers.slice(1).every((personalDetail) => !personalDetail.isSelected)).toBe(true);
            // Then all items should be enabled
            expect(formattedMembers.every((personalDetail) => !personalDetail.isDisabled)).toBe(true);
        });
    });

    describe('filterAndOrderOptions()', () => {
        it('should return all options when search is empty', () => {
            // Given a set of options
            // When we call getSearchOptions with all betas
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we pass the returned options to filterAndOrderOptions with an empty search value
            const filteredOptions = filterAndOrderOptions(options, '', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then all options should be returned
            expect(filteredOptions.recentReports.length + filteredOptions.personalDetails.length).toBe(14);
        });

        it('should return filtered options in correct order', () => {
            const searchText = 'man';
            // Given a set of options
            // When we call getSearchOptions with all betas
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we pass the returned options to filterAndOrderOptions with a search value and sortByReportTypeInSearch param
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, {
                dateFnsLocale: undefined,
                sortByReportTypeInSearch: true,
            });

            // Then we expect all options to be part of the recentReports list and reports should be first:
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then returned reports should match the search text
            expect(filteredOptions.recentReports.length).toBe(4);
            // Then the returned reports should be ordered by most recent action (and other criteria such as whether they are archived)
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Invisible Woman'); // '2022-11-22 03:26:02.019'
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Spider-Man'); // '2022-11-22 03:26:02.016'
            expect(filteredOptions.recentReports.at(2)?.text).toBe('Black Widow'); // This is a personal detail, which has no lastVisibleActionCreated, but matches the login
            expect(filteredOptions.recentReports.at(3)?.text).toBe('Mister Fantastic, Invisible Woman'); // This again is a report with '2022-11-22 03:26:02.015'
        });

        it('should filter users by email', () => {
            const searchText = 'mistersinister@marauders.com';
            // Given a set of options
            // When we call getSearchOptions with all betas
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we pass the returned options to filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Mr Sinister');
        });

        it('should find archived chats', () => {
            const searchText = 'Archived';
            // Given a set of options with report 10 marked as archived
            const archivedMap: PrivateIsArchivedMap = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}10`]: !!reportNameValuePairs.private_isArchived,
            };
            const OPTIONS_WITH_ARCHIVED = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, MOCK_REPORT_ATTRIBUTES_DERIVED, archivedMap, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });
            // When we call getSearchOptions with all betas
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS_WITH_ARCHIVED,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we pass the returned options to filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(!!filteredOptions.recentReports.at(0)?.private_isArchived).toBe(true);
        });

        it('should filter options by email if dot is skipped in the email', () => {
            // cspell:disable-next-line
            const searchText = 'barryallen';
            // Given a set of options created from PERSONAL_DETAILS_WITH_PERIODS
            const OPTIONS_WITH_PERIODS = createFilteredOptionList(PERSONAL_DETAILS_WITH_PERIODS, REPORTS, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });
            // When we call getSearchOptions with all betas
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS_WITH_PERIODS,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                policyCollection: allPolicies,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS_WITH_PERIODS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we pass the returned options to filterAndOrderOptions with a search value and sortByReportTypeInSearch param
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS_WITH_PERIODS, {
                dateFnsLocale: undefined,
                sortByReportTypeInSearch: true,
            });

            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(filteredOptions.recentReports.at(0)?.login).toBe('barry.allen@expensify.com');
        });

        it('should include workspace rooms in the search results', () => {
            const searchText = 'avengers';
            // Given a set of options with workspace rooms
            // When we call getSearchOptions with all betas
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS_WITH_WORKSPACE_ROOM,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                policyCollection: allPolicies,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we pass the returned options to filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(filteredOptions.recentReports.at(0)?.subtitle).toBe('Avengers Room');
        });

        it('should put exact match by login on the top of the list', () => {
            const searchText = 'reedrichards@expensify.com';
            // Given a set of options with all betas
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we pass the returned options to filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(filteredOptions.recentReports.at(0)?.login).toBe(searchText);
        });

        it('should prioritize options with matching display name over chat rooms', () => {
            const searchText = 'spider';
            // Given a set of options with chat rooms
            const MOCK_REPORT_ATTRIBUTES_DERIVED_WITH_CHAT_ROOM = createMockReportAttributesDerived(REPORTS_WITH_CHAT_ROOM, PERSONAL_DETAILS, CURRENT_USER_ACCOUNT_ID);
            const OPTIONS_WITH_CHAT_ROOMS = createFilteredOptionList(
                PERSONAL_DETAILS,
                REPORTS_WITH_CHAT_ROOM,
                MOCK_REPORT_ATTRIBUTES_DERIVED_WITH_CHAT_ROOM,
                EMPTY_PRIVATE_IS_ARCHIVED_MAP,
                undefined,
                {currentUserAccountID: CURRENT_USER_ACCOUNT_ID, dateFnsLocale: undefined, conciergeReportID: undefined, isSearching: true},
            );
            // When we call getSearchOptions with all betas
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS_WITH_CHAT_ROOMS,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                policyCollection: allPolicies,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we pass the returned options to filterAndOrderOptions with a search value
            const filterOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then only two reports should be returned
            expect(filterOptions.recentReports.length).toBe(2);
            // Then the second report should match the search text
            expect(filterOptions.recentReports.at(1)?.isChatRoom).toBe(true);
        });

        it('should put the item with latest lastVisibleActionCreated on top when search value match multiple items', () => {
            renderLocaleContextProvider();
            const searchText = 'fantastic';
            // Given a set of options
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED,
                draftComments: {},
                loginList,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we call filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then only three reports should be returned
            expect(filteredOptions.recentReports.length).toBe(3);
            // Then the first report should match the search text
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Mister Fantastic');
            // Then the second report should match the search text
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Mister Fantastic, Invisible Woman');
        });

        it('should return the user to invite when the search value is a valid, non-existent email', () => {
            const searchText = 'test@email.com';
            // Given a set of options
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED,
                draftComments: {},
                loginList,

                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we call filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then the user to invite should be returned
            expect(filteredOptions.userToInvite?.login).toBe(searchText);
        });

        it('should not return any results if the search value is on an excluded logins list', () => {
            const searchText = 'admin@expensify.com';
            // Given a set of options with excluded logins list
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT, sortedActions: undefined},
                translateLocal,
            );
            // When we call filterAndOrderOptions with a search value and excluded logins list
            const filterOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, {
                dateFnsLocale: undefined,
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            });

            // Then no personal details should be returned
            expect(filterOptions.recentReports.length).toBe(0);
        });

        it('should return the user to invite when the search value is a valid, non-existent email and the user is not excluded', () => {
            const searchText = 'test@email.com';
            // Given a set of options
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED,
                draftComments: {},
                loginList,

                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we call filterAndOrderOptions with a search value and excludeLogins
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, {
                dateFnsLocale: undefined,
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            });

            // Then the user to invite should be returned
            expect(filteredOptions.userToInvite?.login).toBe(searchText);
        });

        it('should return limited amount of recent reports if the limit is set', () => {
            const searchText = '';
            // Given a set of options
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED,
                draftComments: {},
                loginList,

                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we call filterAndOrderOptions with a search value and maxRecentReportsToShow set to 2
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, {
                dateFnsLocale: undefined,
                maxRecentReportsToShow: 2,
            });

            // Then only two reports should be returned
            expect(filteredOptions.recentReports.length).toBe(2);

            // Note: in the past maxRecentReportsToShow: 0 would return all recent reports, this has changed, and is expected to return none now
            // When we call filterAndOrderOptions with a search value and maxRecentReportsToShow set to 0
            const limitToZeroOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, {
                dateFnsLocale: undefined,
                maxRecentReportsToShow: 0,
            });

            // Then no reports should be returned
            expect(limitToZeroOptions.recentReports.length).toBe(0);
        });

        it('should not return any user to invite if email exists on the personal details list', () => {
            const searchText = 'natasharomanoff@expensify.com';
            // Given a set of options with all betas
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we call filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then there should be one matching result
            expect(filteredOptions.personalDetails.length).toBe(1);
            // Then the user to invite should be null
            expect(filteredOptions.userToInvite).toBe(null);
        });

        it('should not show any recent reports if a search value does not match the group chat name (getShareDestinationsOptions)', () => {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            const filteredReports = Object.values(OPTIONS.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                if (canUserPerformWriteAction(report, false) && canCreateTaskInReport(report) && !isCanceledTaskReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);
            // When we call getValidOptions for share destination with the filteredReports
            const {options} = getValidOptions(
                {reports: filteredReports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {
                    dateFnsLocale: undefined,
                    betas: [],
                    includeMultipleParticipantReports: true,
                    showChatPreviewLine: true,
                    forcePolicyNamePreview: true,
                    includeThreads: true,
                    includeMoneyRequests: true,
                    includeTasks: true,
                    excludeLogins: {},
                    includeOwnedWorkspaceChats: true,
                    includeSelfDM: true,
                    searchString: '',
                    includeUserToInvite: false,
                    sortedActions: undefined,
                },
                translateLocal,
            );
            // When we pass the returned options to filterAndOrderOptions with a search value that does not match the group chat name
            const filteredOptions = filterAndOrderOptions(options, 'mutants', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
        });

        it('should return a workspace room when we search for a workspace room(getShareDestinationsOptions)', () => {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;

                if (canUserPerformWriteAction(report, false) || isExpensifyOnlyParticipantInReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            // When we call getValidOptions for share destination with the filteredReports
            const {options} = getValidOptions(
                {
                    reports: filteredReportsWithWorkspaceRooms,
                    personalDetails: OPTIONS.personalDetails,
                },
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {
                    dateFnsLocale: undefined,
                    betas: [],
                    includeMultipleParticipantReports: true,
                    showChatPreviewLine: true,
                    forcePolicyNamePreview: true,
                    includeThreads: true,
                    includeMoneyRequests: true,
                    includeTasks: true,
                    excludeLogins: {},
                    includeOwnedWorkspaceChats: true,
                    includeSelfDM: true,
                    searchString: '',
                    includeUserToInvite: false,
                    sortedActions: undefined,
                },
                translateLocal,
            );
            // When we pass the returned options to filterAndOrderOptions with a search value that matches the group chat name
            const filteredOptions = filterAndOrderOptions(options, 'Avengers Room', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then one recent report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
        });

        it('should not show any results if searching for a non-existing workspace room(getShareDestinationOptions)', () => {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;

                if (canUserPerformWriteAction(report, false) || isExpensifyOnlyParticipantInReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            // When we call getValidOptions for share destination with the filteredReports
            const {options} = getValidOptions(
                {
                    reports: filteredReportsWithWorkspaceRooms,
                    personalDetails: OPTIONS.personalDetails,
                },
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {
                    dateFnsLocale: undefined,
                    betas: [],
                    includeMultipleParticipantReports: true,
                    showChatPreviewLine: true,
                    forcePolicyNamePreview: true,
                    includeThreads: true,
                    includeMoneyRequests: true,
                    includeTasks: true,
                    excludeLogins: {},
                    includeOwnedWorkspaceChats: true,
                    includeSelfDM: true,
                    searchString: '',
                    includeUserToInvite: false,
                    sortedActions: undefined,
                },
                translateLocal,
            );
            // When we pass the returned options to filterAndOrderOptions with a search value that does not match the group chat name
            const filteredOptions = filterAndOrderOptions(options, 'Mutants Lair', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
        });

        it('should show the option from personal details when searching for personal detail with no existing report', () => {
            // Given a set of options
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            // When we call filterAndOrderOptions with a search value that matches a personal detail with no existing report
            const filteredOptions = filterAndOrderOptions(options, 'hulk', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            // Then one personal detail should be returned
            expect(filteredOptions.personalDetails.length).toBe(1);
            // Then the returned personal detail should match the search text
            expect(filteredOptions.personalDetails.at(0)?.login).toBe('brucebanner@expensify.com');
        });

        it('should find group chat when searching by participant display name', () => {
            // Given a group chat report with participants
            const REPORTS_WITH_GROUP_CHAT: OnyxCollection<Report> = {
                '18': {
                    lastReadTime: '2021-01-14 11:25:39.302',
                    lastVisibleActionCreated: '2022-11-22 03:26:02.022',
                    isPinned: false,
                    reportID: '18',
                    participants: {
                        2: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                        3: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                        4: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                    },
                    reportName: 'Team Chat',
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                },
            };

            const OPTIONS_WITH_GROUP_CHAT = createFilteredOptionList(PERSONAL_DETAILS, REPORTS_WITH_GROUP_CHAT, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });

            // When we call getSearchOptions with a search query that matches a participant display name
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS_WITH_GROUP_CHAT,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
                searchQuery: 'Spider-Man',
                policyCollection: allPolicies,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });

            // Then one report should be returned
            expect(options.recentReports.length).toBe(1);
            // Then the returned report should be the group chat
            expect(options.recentReports.at(0)?.reportID).toBe('18');
        });

        it('should find group chat when searching by participant login', () => {
            // Given a group chat report with participants
            const REPORTS_WITH_GROUP_CHAT: OnyxCollection<Report> = {
                '18': {
                    lastReadTime: '2021-01-14 11:25:39.302',
                    lastVisibleActionCreated: '2022-11-22 03:26:02.022',
                    isPinned: false,
                    reportID: '18',
                    participants: {
                        2: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                        3: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                        4: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                    },
                    reportName: 'Team Chat',
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                },
            };

            const OPTIONS_WITH_GROUP_CHAT = createFilteredOptionList(PERSONAL_DETAILS, REPORTS_WITH_GROUP_CHAT, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });

            // When we call getSearchOptions with a search query that matches a participant login
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS_WITH_GROUP_CHAT,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
                searchQuery: 'peterparker@expensify.com',
                policyCollection: allPolicies,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });

            // Then one report should be returned
            expect(options.recentReports.length).toBe(1);
            // Then the returned report should be the group chat
            expect(options.recentReports.at(0)?.reportID).toBe('18');
        });

        it('should find group chat when searching by multiple participant names', () => {
            // Given a group chat report with participants
            const REPORTS_WITH_GROUP_CHAT: OnyxCollection<Report> = {
                '18': {
                    lastReadTime: '2021-01-14 11:25:39.302',
                    lastVisibleActionCreated: '2022-11-22 03:26:02.022',
                    isPinned: false,
                    reportID: '18',
                    participants: {
                        2: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                        3: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                        4: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                    },
                    reportName: 'Team Chat',
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                },
            };

            const OPTIONS_WITH_GROUP_CHAT = createFilteredOptionList(PERSONAL_DETAILS, REPORTS_WITH_GROUP_CHAT, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });

            // When we call getSearchOptions with a search query that matches a participant name
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS_WITH_GROUP_CHAT,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
                searchQuery: 'Black Panther',
                policyCollection: allPolicies,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });

            // Then one report should be returned
            expect(options.recentReports.length).toBe(1);
            // Then the returned report should be the group chat
            expect(options.recentReports.at(0)?.reportID).toBe('18');
        });

        it('should not find group chat when search does not match any participant', () => {
            // Given a group chat report with participants
            const REPORTS_WITH_GROUP_CHAT: OnyxCollection<Report> = {
                '18': {
                    lastReadTime: '2021-01-14 11:25:39.302',
                    lastVisibleActionCreated: '2022-11-22 03:26:02.022',
                    isPinned: false,
                    reportID: '18',
                    participants: {
                        2: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                        3: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                        4: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                    },
                    reportName: 'Team Chat',
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                },
            };

            const OPTIONS_WITH_GROUP_CHAT = createFilteredOptionList(PERSONAL_DETAILS, REPORTS_WITH_GROUP_CHAT, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });

            // When we call getSearchOptions with a search query that does not match any participant
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS_WITH_GROUP_CHAT,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
                searchQuery: 'Wolverine',
                policyCollection: allPolicies,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });

            // Then no reports should be returned
            expect(options.recentReports.length).toBe(0);
        });

        it('should handle group chat with empty participantsList gracefully', () => {
            // Given a group chat report with participants but no matching personal details
            const REPORTS_WITH_GROUP_CHAT_NO_PARTICIPANTS: OnyxCollection<Report> = {
                '19': {
                    lastReadTime: '2021-01-14 11:25:39.302',
                    lastVisibleActionCreated: '2022-11-22 03:26:02.022',
                    isPinned: false,
                    reportID: '19',
                    participants: {
                        9999: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                        9998: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                    },
                    reportName: 'Unknown Group',
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                },
            };

            const OPTIONS_WITH_GROUP_CHAT_NO_PARTICIPANTS = createFilteredOptionList(
                PERSONAL_DETAILS,
                REPORTS_WITH_GROUP_CHAT_NO_PARTICIPANTS,
                undefined,
                EMPTY_PRIVATE_IS_ARCHIVED_MAP,
                undefined,
                {currentUserAccountID: CURRENT_USER_ACCOUNT_ID, dateFnsLocale: undefined, conciergeReportID: undefined, isSearching: true},
            );

            // When we call getSearchOptions with all betas
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS_WITH_GROUP_CHAT_NO_PARTICIPANTS,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
                policyCollection: allPolicies,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });

            // When we pass the returned options to filterAndOrderOptions with any search value
            const filteredOptions = filterAndOrderOptions(options, 'Unknown', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then the report should still be found by its reportName even if participantsList is empty
            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports.at(0)?.reportID).toBe('19');
        });

        it('should not return any options or user to invite if there are no search results and the string does not match a potential email or phone', () => {
            // Given a set of options
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports
            const filteredOptions = filterAndOrderOptions(options, 'marc@expensify', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then no user to invite should be returned
            expect(filteredOptions.userToInvite).toBe(null);
        });

        it('should not return any options but should return an user to invite if no matching options exist and the search value is a potential email', () => {
            // Given a set of options
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports
            const filteredOptions = filterAndOrderOptions(options, 'marc@expensify.com', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then an user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
        });

        it('should return user to invite when search term has a period with options for it that do not contain the period', () => {
            // Given a set of options
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            const filteredOptions = filterAndOrderOptions(options, 'peter.parker@expensify.com', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            // Then one user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
        });

        it('should return user which has displayName with accent mark when search value without accent mark', () => {
            // Given a set of options
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            // When we call filterAndOrderOptions with a search value without accent mark
            const filteredOptions = filterAndOrderOptions(options, 'Timothee', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then one personalDetails with accent mark should be returned
            expect(filteredOptions.personalDetails.length).toBe(1);
        });

        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number', () => {
            // Given a set of options
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            const filteredOptions = filterAndOrderOptions(options, '5005550006', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then one user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
            // Then the user to invite should match the search value
            expect(filteredOptions.userToInvite?.login).toBe('+15005550006');
        });

        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number with country code added', () => {
            // Given a set of options
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            const filteredOptions = filterAndOrderOptions(options, '+15005550006', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then one user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
            // Then the user to invite should match the search value
            expect(filteredOptions.userToInvite?.login).toBe('+15005550006');
        });

        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number with special characters added', () => {
            // Given a set of options
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            const filteredOptions = filterAndOrderOptions(options, '+1 (800)324-3233', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then one user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
            // Then the user to invite should match the search value
            expect(filteredOptions.userToInvite?.login).toBe('+18003243233');
        });

        it('should not return any options or user to invite if contact number contains alphabet characters', () => {
            // Given a set of options
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports
            const filteredOptions = filterAndOrderOptions(options, '998243aaaa', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then no user to invite should be returned
            expect(filteredOptions.userToInvite).toBe(null);
        });

        it('should not return userToInvite for plain text name when shouldAcceptName is false', () => {
            // Given a set of options
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                {},
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeUserToInvite: true, sortedActions: undefined},
                translateLocal,
            );

            // When we call filterAndOrderOptions with a plain text name (not email or phone) without shouldAcceptName
            const filteredOptions = filterAndOrderOptions(options, 'Jeff Amazon', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, {
                dateFnsLocale: undefined,
                shouldAcceptName: false,
            });

            // Then userToInvite should be null since plain names are not accepted by default
            expect(filteredOptions?.userToInvite).toBe(null);
        });

        it('should return userToInvite for plain text name when shouldAcceptName is true', () => {
            // Given a set of options
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                {},
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeUserToInvite: true, sortedActions: undefined},
                translateLocal,
            );

            // When we call filterAndOrderOptions with a plain text name (not email or phone) with shouldAcceptName
            const filteredOptions = filterAndOrderOptions(options, 'Jeff', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, {
                dateFnsLocale: undefined,
                shouldAcceptName: true,
            });

            // Then userToInvite should be returned for the plain name
            expect(filteredOptions?.userToInvite?.text).toBe('Jeff');
        });

        it('should not return any options if search value does not match any personal details', () => {
            // Given a set of options
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details
            const filteredOptions = filterAndOrderOptions(options, 'magneto', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then no personal details should be returned
            expect(filteredOptions.personalDetails.length).toBe(0);
        });

        it('should return one recent report and no personal details if a search value provides an email', () => {
            // Given a set of options
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            // When we call filterAndOrderOptions with a search value that matches an email
            const filteredOptions = filterAndOrderOptions(options, 'peterparker@expensify.com', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, {
                dateFnsLocale: undefined,
                sortByReportTypeInSearch: true,
            });

            // Then one recent report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned recent report should match the search text
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Spider-Man');
            // Then no personal details should be returned
            expect(filteredOptions.personalDetails.length).toBe(0);
        });

        it('should return all matching reports and personal details', () => {
            // Given a set of options
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );
            // When we call filterAndOrderOptions with a search value that matches both reports and personal details and maxRecentReportsToShow param
            const filteredOptions = filterAndOrderOptions(options, '.com', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, {
                dateFnsLocale: undefined,
                maxRecentReportsToShow: 5,
            });

            // Then there should be 4 matching personal details
            expect(filteredOptions.personalDetails.length).toBe(5);
            // Then the first personal detail should match the search text
            expect(filteredOptions.personalDetails.at(0)?.login).toBe('natasharomanoff@expensify.com');
            // Then there should be 5 matching recent reports
            expect(filteredOptions.recentReports.length).toBe(5);
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Captain America');
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Mr Sinister');
            expect(filteredOptions.recentReports.at(2)?.text).toBe('Black Panther');
        });

        it('should return matching option when searching (getSearchOptions)', () => {
            // Given a set of options
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED,
                draftComments: {},
                loginList,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we call filterAndOrderOptions with a search value that matches a personal detail
            const filteredOptions = filterAndOrderOptions(options, 'spider', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then one personal detail should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned personal detail should match the search text
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Spider-Man');
        });

        it('should return latest lastVisibleActionCreated item on top when search value matches multiple items (getSearchOptions)', () => {
            // Given a set of options
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED,
                draftComments: {},
                loginList,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we call filterAndOrderOptions with a search value that matches multiple items
            const filteredOptions = filterAndOrderOptions(options, 'fantastic', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then only three reports should be returned
            expect(filteredOptions.recentReports.length).toBe(3);
            // Then the first report should match the search text
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Mister Fantastic');
            // Then the second report should match the search text
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Mister Fantastic, Invisible Woman');

            return waitForBatchedUpdates()
                .then(() => Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS_WITH_PERIODS))
                .then(() => {
                    // Given a set of options with periods
                    const OPTIONS_WITH_PERIODS = createFilteredOptionList(PERSONAL_DETAILS_WITH_PERIODS, REPORTS, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, undefined, {
                        currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                        dateFnsLocale: undefined,
                        conciergeReportID: undefined,
                        isSearching: true,
                    });
                    // When we call getSearchOptions
                    const {options: results} = getSearchOptions({
                        dateFnsLocale: undefined,
                        translate: translateLocal,
                        options: OPTIONS_WITH_PERIODS,
                        draftComments: {},
                        loginList,
                        currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                        currentUserEmail: CURRENT_USER_EMAIL,
                        policyCollection: allPolicies,
                        personalDetails: PERSONAL_DETAILS_WITH_PERIODS,
                        sortedActions: undefined,
                        conciergeReportID: undefined,
                    });
                    // When we pass the returned options to filterAndOrderOptions with a search value
                    const filteredResults = filterAndOrderOptions(
                        results,
                        'barry.allen@expensify.com',
                        COUNTRY_CODE,
                        loginList,
                        CURRENT_USER_EMAIL,
                        CURRENT_USER_ACCOUNT_ID,
                        PERSONAL_DETAILS_WITH_PERIODS,
                        {dateFnsLocale: undefined, sortByReportTypeInSearch: true},
                    );

                    // Then only one report should be returned
                    expect(filteredResults.recentReports.length).toBe(1);
                    // Then the returned report should match the search text
                    expect(filteredResults.recentReports.at(0)?.text).toBe('The Flash');
                });
        });

        it('should filter out duplicated entries by login', () => {
            const login = 'brucebanner@expensify.com';

            // Duplicate personalDetails entries and reassign to OPTIONS
            OPTIONS.personalDetails = OPTIONS.personalDetails.flatMap((obj) => [obj, {...obj}]);

            // Given a set of options
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we call filterAndOrderOptions with a an empty search value
            const filteredOptions = filterAndOrderOptions(options, '', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);
            const matchingEntries = filteredOptions.personalDetails.filter((detail) => detail.login === login);

            // Then there should be 2 unique login entries
            expect(filteredOptions.personalDetails.length).toBe(3);
            // Then there should be 1 matching entry
            expect(matchingEntries.length).toBe(1);
        });

        it('should order self dm always on top if the search matches with the self dm login', () => {
            const searchTerm = 'tonystark@expensify.com';
            const OPTIONS_WITH_SELF_DM = createFilteredOptionList(PERSONAL_DETAILS, REPORTS_WITH_SELF_DM, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });

            // Given a set of options with self dm and all betas
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS_WITH_SELF_DM,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                policyCollection: allPolicies,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });
            // When we call filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchTerm, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then the self dm should be on top.
            expect(filteredOptions.recentReports.at(0)?.isSelfDM).toBe(true);
        });

        it('should return the same matches for normalized multi-word queries with extra spaces', () => {
            const {options} = getSearchOptions({
                translate: translateLocal,
                dateFnsLocale: undefined,
                options: OPTIONS,
                reportAttributesDerived: MOCK_REPORT_ATTRIBUTES_DERIVED,
                draftComments: {},
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyCollection: allPolicies,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });

            const multiSpaceQueryResults = filterAndOrderOptions(options, 'Invisible   Woman', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);
            const spaceSeparatedQueryResults = filterAndOrderOptions(options, 'Invisible Woman', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            expect(multiSpaceQueryResults.recentReports.map((option) => option.reportID)).toEqual(spaceSeparatedQueryResults.recentReports.map((option) => option.reportID));
            expect(multiSpaceQueryResults.personalDetails.map((option) => option.accountID)).toEqual(spaceSeparatedQueryResults.personalDetails.map((option) => option.accountID));
        });
    });

    describe('canCreateOptimisticPersonalDetailOption()', () => {
        const VALID_EMAIL = 'valid@email.com';
        const currentUserEmail = 'tonystark@expensify.com';

        it('should allow to create optimistic personal detail option if email is valid', () => {
            const canCreate = canCreateOptimisticPersonalDetailOption({
                searchValue: VALID_EMAIL,
                currentUserOption: {
                    login: currentUserEmail,
                    reportID: currentUserEmail,
                    keyForList: currentUserEmail,
                },
                // Note: in the past this would check for the existence of the email in the personalDetails list, this has changed.
                // We expect only filtered lists to be passed to this function, so we don't need to check for the existence of the email in the personalDetails list.
                // This is a performance optimization.
                personalDetailsOptions: [],
                recentReportOptions: [],
            });

            expect(canCreate).toBe(true);
        });

        it('should not allow to create option if email is an email of current user', () => {
            // Given a set of arguments with currentUserOption object
            // When we call canCreateOptimisticPersonalDetailOption
            const canCreate = canCreateOptimisticPersonalDetailOption({
                searchValue: currentUserEmail,
                recentReportOptions: [],
                personalDetailsOptions: [],
                currentUserOption: {
                    login: currentUserEmail,
                    reportID: currentUserEmail,
                    keyForList: currentUserEmail,
                },
            });

            // Then the returned value should be false
            expect(canCreate).toBe(false);
        });

        it('createFilteredOptionList() localization', async () => {
            renderLocaleContextProvider();
            // Given a set of reports and personal details
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS);
            // When we call createFilteredOptionList and extract the reports
            const reports = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            }).reports;

            // Then the returned reports should match the expected values
            expect(reports.at(10)?.subtitle).toBe(`Submits to Mister Fantastic`);

            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES);

            await waitForBatchedUpdates();

            // When we call createFilteredOptionList again
            const newReports = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            }).reports;
            // Then the returned reports should change to Spanish
            // cspell:disable-next-line
            expect(newReports.at(10)?.subtitle).toBe('Se envía a Mister Fantastic');
        });
    });

    describe('filterWorkspaceChats()', () => {
        it('should return an empty array if there are no expense chats', () => {
            // Given an empty array of expense chats and no search terms
            // When we call filterWorkspaceChats
            const result = filterWorkspaceChats([], []);

            // Then the returned value should be an empty array
            expect(result.length).toEqual(0);
        });

        it('should return all expense chats if there are no search terms', () => {
            // Given a list of expense chats and no search terms
            // When we call filterWorkspaceChats
            const result = filterWorkspaceChats(WORKSPACE_CHATS, []);

            // Then the returned value should be the same as the input
            expect(result).toEqual(WORKSPACE_CHATS);
            // Then the length of the result should be equal to the length of the input
            expect(result.length).toEqual(WORKSPACE_CHATS.length);
        });

        it('should filter multiple expense chats by search term', () => {
            // Given a list of expense chats and one search term
            // When we call filterWorkspaceChats
            const result = filterWorkspaceChats(WORKSPACE_CHATS, ['Google']);

            // Then the returned value should should only include the matching expense chats
            expect(result.length).toEqual(2);
        });

        it('should filter expense chat by exact name', () => {
            // Given a list of expense chats and multiple search terms that reflect the exact name
            // When we call filterWorkspaceChats
            const result = filterWorkspaceChats(WORKSPACE_CHATS, ['Microsoft', 'Teams', 'Workspace']);

            // Then the returned value should should only include the matching expense chat
            expect(result.length).toEqual(1);
        });

        it('should return an empty array if there are no matching expense chats', () => {
            // Given a list of expense chats and a search term that does not match any expense chats
            // When we call filterWorkspaceChats
            const result = filterWorkspaceChats(WORKSPACE_CHATS, ['XYZ']);

            // Then the returned value should be an empty array
            expect(result.length).toEqual(0);
        });
    });

    describe('orderWorkspaceOptions()', () => {
        it('should put the default workspace on top of the list', () => {
            // Given a list of expense chats
            // When we call orderWorkspaceOptions
            const result = orderWorkspaceOptions(WORKSPACE_CHATS);

            // Then the first item in the list should be the default workspace
            expect(result.at(0)?.text).toEqual('Notion Workspace for Marketing');
        });
    });

    describe('Alternative text', () => {
        it("The text should not contain the last actor's name at prefix if the report is archived.", async () => {
            renderLocaleContextProvider();
            // When we set the preferred locale to English and create an ADD_COMMENT report action
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.EN,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}10` as const]: {
                    '1': getFakeAdvancedReportAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT),
                },
            });
            await waitForBatchedUpdates();

            // When we call createFilteredOptionList with report 10 marked as archived
            const archivedMap: PrivateIsArchivedMap = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}10`]: !!reportNameValuePairs.private_isArchived,
            };
            const reports = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, archivedMap, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            }).reports;
            const archivedReport = reports.find((report) => report.reportID === '10');

            // Then the returned report should contain default archived reason
            expect(archivedReport?.lastMessageText).toBe('This chat room has been archived.');
        });
    });

    describe('getAlternateText()', () => {
        const ROOM_REPORT_ID = '9100';
        const DM_REPORT_ID = '9200';

        const participants = {
            2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            3: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
        };

        const buildRoomReport = (overrides: Partial<Report> = {}): Report => ({
            reportID: ROOM_REPORT_ID,
            reportName: '#galaxy',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            policyID,
            lastReadTime: '2024-01-01 10:00:00.000',
            lastVisibleActionCreated: '2024-01-01 10:00:00.000',
            lastMessageText: 'hello',
            lastActionType: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            lastActorAccountID: 3,
            participants,
            ...overrides,
        });

        const buildDMReport = (overrides: Partial<Report> = {}): Report => ({
            reportID: DM_REPORT_ID,
            reportName: '',
            type: CONST.REPORT.TYPE.CHAT,
            lastReadTime: '2024-01-01 10:00:00.000',
            lastVisibleActionCreated: '2024-01-01 10:00:00.000',
            lastMessageText: 'hello',
            lastActionType: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            lastActorAccountID: 3,
            participants,
            ...overrides,
        });

        const buildAction = (actionName: Parameters<typeof getFakeAdvancedReportAction>[0], actorAccountID = 3, originalMessage?: Record<string, unknown>): ReportAction =>
            ({
                ...getFakeAdvancedReportAction(actionName),
                actorAccountID,
                ...(originalMessage === undefined ? {} : {originalMessage}),
            }) as ReportAction;

        const setReport = async (report: Report) => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await waitForBatchedUpdates();
        };

        type AlternateTextConfig = Parameters<typeof getAlternateText>[2];

        const buildConfig = (lastAction?: ReportAction, reportID: string = ROOM_REPORT_ID, overrides: Partial<AlternateTextConfig> = {}): AlternateTextConfig => ({
            isReportArchived: false,
            personalDetails: PERSONAL_DETAILS,
            dateFnsLocale: undefined,
            conciergeReportID: undefined,
            translate: translateLocal,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            ...(lastAction ? {sortedActions: {[reportID]: [lastAction]}} : {}),
            ...overrides,
        });

        it('should keep the raw comment text when the last action is ADD_COMMENT', async () => {
            // Given a DM whose last action is a plain comment containing markup typed by the user
            const report = buildDMReport({lastMessageText: '<b>test</b>'});
            await setReport(report);
            const option: OptionData = {reportID: DM_REPORT_ID, keyForList: '', lastMessageText: '<b>test</b>'};

            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(undefined, DM_REPORT_ID));

            // Then the markup is preserved as typed (https://github.com/Expensify/App/issues/82036)
            expect(result).toBe('<b>test</b>');
        });

        it('should strip HTML from the last message when the last action is not ADD_COMMENT', async () => {
            // Given a DM whose last action is not a comment, so the last message is server-built HTML
            const report = buildDMReport({lastMessageText: '<b>test</b>', lastActionType: CONST.REPORT.ACTIONS.TYPE.RENAMED});
            await setReport(report);
            const option: OptionData = {reportID: DM_REPORT_ID, keyForList: '', lastMessageText: '<b>test</b>'};

            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(undefined, DM_REPORT_ID));

            expect(result).toBe('test');
        });

        it('should prefix the room preview with the last actor display name', async () => {
            await setReport(buildRoomReport());
            const comment = buildAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, 3);
            const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'hello', isChatRoom: true};

            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(comment));

            expect(result).toBe('Spider-Man: hello');
        });

        it('should use "You" as the prefix when the current user sent the last message', async () => {
            await setReport(buildRoomReport({lastActorAccountID: CURRENT_USER_ACCOUNT_ID}));
            const comment = buildAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, CURRENT_USER_ACCOUNT_ID);
            const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'hello', isChatRoom: true};

            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(comment));

            expect(result).toBe('You: hello');
        });

        it('should omit the actor prefix when the report is archived', async () => {
            await setReport(buildRoomReport());
            const comment = buildAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, 3);
            const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'hello', isChatRoom: true};

            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(comment, ROOM_REPORT_ID, {isReportArchived: true}));

            expect(result).toBe('hello');
        });

        it('should omit the actor prefix when currentUserAccountID is undefined', async () => {
            await setReport(buildRoomReport());
            const comment = buildAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, 3);
            const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'hello', isChatRoom: true};

            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(comment, ROOM_REPORT_ID, {currentUserAccountID: undefined}));

            expect(result).toBe('hello');
        });

        it('should omit the actor prefix when the last action is a report preview', async () => {
            await setReport(buildRoomReport({lastActionType: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, lastMessageText: 'owes $10'}));
            const preview = buildAction(CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, 3);
            const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'owes $10', isChatRoom: true};

            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(preview));

            expect(result).toBe('owes $10');
        });

        it('should fall back to the report action person text when the actor is missing from personal details', async () => {
            await setReport(buildRoomReport({lastActorAccountID: 999}));
            // The fake action carries person: [{text: 'Email One'}] and account 999 is not in PERSONAL_DETAILS
            const comment = buildAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, 999);
            const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'hello', isChatRoom: true};

            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(comment));

            expect(result).toBe('Email One: hello');
        });

        it('should replace the preview with the rename message for a RENAMED last action', async () => {
            await setReport(buildRoomReport({lastActionType: CONST.REPORT.ACTIONS.TYPE.RENAMED, lastMessageText: 'renamed this room'}));
            const renamed = buildAction(CONST.REPORT.ACTIONS.TYPE.RENAMED, 3, {oldName: 'Old Room', newName: 'New Room'});
            const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'renamed this room', isChatRoom: true};

            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(renamed));

            expect(result).toBe('Spider-Man renamed this room to "New Room" (previously "Old Room")');
        });

        it('should replace the preview with the leave message for a room LEAVE_ROOM last action', async () => {
            await setReport(buildRoomReport({lastMessageText: 'left the chat'}));
            const leave = buildAction(CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.LEAVE_ROOM, 3);
            const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'left the chat', isChatRoom: true};

            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(leave));

            expect(result).toBe('Spider-Man: left the chat');
        });

        it('should prefix the action message with the actor for a policy LEAVE_ROOM last action', async () => {
            await setReport(buildRoomReport({lastMessageText: 'left the workspace'}));
            // The fake action's message text is 'hey'
            const leave = buildAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM, 3);
            const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'left the workspace', isChatRoom: true};

            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(leave));

            expect(result).toBe('Spider-Man: hey');
        });

        it('should build the invite message with member count and room name', async () => {
            await setReport(buildRoomReport({lastMessageText: 'invited'}));
            const invite = buildAction(CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM, 3, {targetAccountIDs: [4, 5], roomName: '#galaxy'});
            const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'invited', isChatRoom: true};

            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(invite));

            expect(result).toBe('Spider-Man: invited 2 members to #galaxy');
        });

        it('should build the remove message with a singular member and room name', async () => {
            await setReport(buildRoomReport({lastMessageText: 'removed'}));
            const remove = buildAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_FROM_ROOM, 3, {targetAccountIDs: [4], roomName: '#galaxy'});
            const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'removed', isChatRoom: true};

            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(remove));

            expect(result).toBe('Spider-Man: removed 1 member from #galaxy');
        });

        it('should count invited members from lastMessageHtml mentions when targetAccountIDs is empty', async () => {
            await setReport(
                buildRoomReport({
                    lastMessageText: 'invited',
                    lastMessageHtml: '<mention-user accountID="4"></mention-user> <mention-user accountID="5"></mention-user>',
                }),
            );
            const invite = buildAction(CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM, 3, {targetAccountIDs: []});
            const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'invited', isChatRoom: true};

            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(invite));

            expect(result).toBe('Spider-Man: invited 2 members');
        });

        it.each([CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED, CONST.REPORT.ACTIONS.TYPE.RETRACTED])(
            'should suppress the actor prefix for %s because its text already embeds the actor',
            async (actionName) => {
                await setReport(buildRoomReport({lastActionType: actionName, lastMessageText: 'issued a new card'}));
                const action = buildAction(actionName, 3);
                const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'issued a new card', isChatRoom: true};

                const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(action));

                expect(result).toBe('issued a new card');
            },
        );

        it('should skip whisper actions when picking the last visible action from sortedActions', async () => {
            await setReport(buildRoomReport());
            // getWhisperedTo prefers message.whisperedTo over originalMessage, so mark the whisper there
            const whisper = {
                ...buildAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, 4),
                message: [{type: 'COMMENT', html: 'psst', text: 'psst', isEdited: false, whisperedTo: [999], isDeletedParentAction: false}],
            } as ReportAction;
            const comment = buildAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, 3);
            const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'hello', isChatRoom: true};

            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(undefined, ROOM_REPORT_ID, {sortedActions: {[ROOM_REPORT_ID]: [whisper, comment]}}));

            expect(result).toBe('Spider-Man: hello');
        });

        it('should resolve the same last action from Onyx when sortedActions is not provided', async () => {
            // Dedicated reportID: module-level report-action caches survive Onyx.clear(), so writing
            // REPORT_ACTIONS for the shared room would poison later tests that reuse its reportID.
            const onyxRoomReportID = '9150';
            await setReport(buildRoomReport({reportID: onyxRoomReportID}));
            const comment = buildAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, 3);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${onyxRoomReportID}`, {[comment.reportActionID]: comment});
            await waitForBatchedUpdates();
            const option: OptionData = {reportID: onyxRoomReportID, keyForList: '', lastMessageText: 'hello', isChatRoom: true};

            const withSortedActions = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(comment, onyxRoomReportID));
            const fromOnyx = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(undefined, onyxRoomReportID));

            expect(fromOnyx).toBe('Spider-Man: hello');
            expect(fromOnyx).toBe(withSortedActions);
        });

        it('should fall back to type subtitles when showChatPreviewLine is false', async () => {
            await setReport(buildRoomReport());
            const roomOption: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'hello', isChatRoom: true, subtitle: 'Custom subtitle'};
            const threadOption: OptionData = {reportID: '', keyForList: '', isThread: true};

            expect(getAlternateText(roomOption, {showChatPreviewLine: false}, buildConfig())).toBe('Custom subtitle');
            expect(getAlternateText(threadOption, {showChatPreviewLine: false}, buildConfig())).toBe(translateLocal('threads.thread'));
        });

        it('should thread currentUserAccountID through getValidOptions to build the actor prefix', async () => {
            // Given a room whose last visible action is a comment from another user
            const report = buildRoomReport();
            await setReport(report);
            const comment = buildAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, 3);

            const optionList = createFilteredOptionList(PERSONAL_DETAILS, {[ROOM_REPORT_ID]: report}, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });

            const {options} = getValidOptions(
                {reports: optionList.reports, personalDetails: []},
                undefined,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {
                    dateFnsLocale: undefined,
                    showChatPreviewLine: true,
                    includeMultipleParticipantReports: true,
                    personalDetails: PERSONAL_DETAILS,
                    sortedActions: {[ROOM_REPORT_ID]: [comment]},
                },
                translateLocal,
            );

            // Then the search option preview matches the LHN format: `Name: message`
            const roomOption = options.recentReports.find((option) => option.reportID === ROOM_REPORT_ID);
            expect(roomOption?.alternateText).toBe('Spider-Man: hello');
        });

        it('should match the LHN alternate text from SidebarUtils.getOptionData for the same room and last action', async () => {
            const report = buildRoomReport();
            await setReport(report);
            // Align the action's own message with report.lastMessageText — the LHN reads the former, search options the latter
            const comment = {
                ...buildAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, 3),
                message: [{type: 'COMMENT', html: 'hello', text: 'hello', isEdited: false, whisperedTo: [], isDeletedParentAction: false}],
            } as ReportAction;

            const lhnOption = SidebarUtils.getOptionData({
                report,
                reportAttributes: undefined,
                oneTransactionThreadReport: undefined,
                reportNameValuePairs: {},
                personalDetails: PERSONAL_DETAILS,
                policy: undefined,
                parentReportAction: undefined,
                conciergeReportID: undefined,
                invoiceReceiverPolicy: undefined,
                card: undefined,
                lastAction: comment,
                translate: translateLocal,
                dateFnsLocale: undefined,
                convertToDisplayString,
                localeCompare,
                isReportArchived: false,
                lastActionReport: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: CURRENT_USER_EMAIL,
                formatPhoneNumber,
            });

            const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'hello', isChatRoom: true};
            const searchAlternateText = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(comment));

            expect(lhnOption?.alternateText).toBe('Spider-Man: hello');
            expect(searchAlternateText).toBe(lhnOption?.alternateText);
        });

        it.each([CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT])(
            'should keep the actor prefix for %s to match the generic LHN preview',
            async (actionName) => {
                // Given a room whose last action is a policy change log action that has no custom
                // alternate text branch in SidebarUtils.getOptionData, so the LHN shows `Name: message`
                const report = buildRoomReport({lastMessageText: 'updated a custom unit'});
                await setReport(report);
                const action = {
                    ...buildAction(actionName, 3),
                    message: [{type: 'COMMENT', html: 'updated a custom unit', text: 'updated a custom unit', isEdited: false, whisperedTo: [], isDeletedParentAction: false}],
                } as ReportAction;

                const lhnOption = SidebarUtils.getOptionData({
                    report,
                    reportAttributes: undefined,
                    oneTransactionThreadReport: undefined,
                    reportNameValuePairs: {},
                    personalDetails: PERSONAL_DETAILS,
                    policy: undefined,
                    parentReportAction: undefined,
                    conciergeReportID: undefined,
                    invoiceReceiverPolicy: undefined,
                    card: undefined,
                    lastAction: action,
                    translate: translateLocal,
                    dateFnsLocale: undefined,
                    convertToDisplayString,
                    localeCompare,
                    isReportArchived: false,
                    lastActionReport: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    currentUserLogin: CURRENT_USER_EMAIL,
                    formatPhoneNumber,
                });

                const option: OptionData = {reportID: ROOM_REPORT_ID, keyForList: '', lastMessageText: 'updated a custom unit', isChatRoom: true};
                const searchAlternateText = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(action));

                expect(lhnOption?.alternateText).toBe('Spider-Man: updated a custom unit');
                expect(searchAlternateText).toBe(lhnOption?.alternateText);
            },
        );

        it('should resolve the actor from the transaction thread when its comment is the newest action of a one-transaction report', async () => {
            // Given a one-transaction expense report whose newest visible action is a comment in its transaction thread
            const EXPENSE_REPORT_ID = '9300';
            const TRANSACTION_THREAD_REPORT_ID = '9301';
            const CHAT_REPORT_ID = '9302';

            const expenseReport: Report = {
                reportID: EXPENSE_REPORT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                chatReportID: CHAT_REPORT_ID,
                parentReportID: CHAT_REPORT_ID,
                parentReportActionID: '9400',
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                lastReadTime: '2024-01-01 10:00:00.000',
                lastVisibleActionCreated: '2024-01-02 10:00:00.000',
                lastMessageText: 'thread comment',
                lastActionType: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                lastActorAccountID: 3,
                participants,
            };
            const transactionThreadReport: Report = {
                reportID: TRANSACTION_THREAD_REPORT_ID,
                type: CONST.REPORT.TYPE.CHAT,
                parentReportID: EXPENSE_REPORT_ID,
                parentReportActionID: '9401',
                participants,
            };
            const iouAction: ReportAction = {
                ...buildAction(CONST.REPORT.ACTIONS.TYPE.IOU, CURRENT_USER_ACCOUNT_ID, {
                    IOUTransactionID: 'txn9300',
                    IOUReportID: EXPENSE_REPORT_ID,
                    amount: 100,
                    currency: 'USD',
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                }),
                reportActionID: '9401',
                reportID: EXPENSE_REPORT_ID,
                created: '2024-01-01 10:00:00.000',
                childReportID: TRANSACTION_THREAD_REPORT_ID,
            };
            const threadComment: ReportAction = {
                ...buildAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, 3),
                reportActionID: '9402',
                reportID: TRANSACTION_THREAD_REPORT_ID,
                created: '2024-01-02 10:00:00.000',
                message: [{type: 'COMMENT', html: 'thread comment', text: 'thread comment', isEdited: false, whisperedTo: [], isDeletedParentAction: false}],
            };

            // Reports must exist before the report actions merge so the one-transaction thread caches resolve the thread ID
            await setReport(expenseReport);
            await setReport(transactionThreadReport);
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${EXPENSE_REPORT_ID}`]: {[iouAction.reportActionID]: iouAction},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${TRANSACTION_THREAD_REPORT_ID}`]: {[threadComment.reportActionID]: threadComment},
            });
            await waitForBatchedUpdates();

            const option: OptionData = {reportID: EXPENSE_REPORT_ID, keyForList: '', lastMessageText: 'thread comment', isMoneyRequestReport: true};

            // When the alternate text is built without sortedActions, forcing the fallback last-action lookup
            const result = getAlternateText(option, {showChatPreviewLine: true}, buildConfig(undefined, EXPENSE_REPORT_ID));

            // Then the actor prefix comes from the transaction thread comment, not from the parent report's IOU action
            expect(result).toBe('Spider-Man: thread comment');
        });
    });

    describe('createFilteredOptionList()', () => {
        it('should set private_isArchived on personal details options when privateIsArchivedMap is provided', () => {
            renderLocaleContextProvider();
            // Given a privateIsArchivedMap with an archived report for a 1:1 chat
            // Report '3' is a 1:1 chat between account 2 (current user) and account 1 (Mister Fantastic)
            const privateIsArchivedMap: PrivateIsArchivedMap = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}3`]: true,
            };

            // When we call createFilteredOptionList with this privateIsArchivedMap
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, privateIsArchivedMap, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });

            // Then the hydrated personal detail option for account 1 (Mister Fantastic) should have private_isArchived set
            const misterFantasticOption = result.personalDetails.find((pd) => pd.item?.accountID === 1);
            const hydratedMisterFantasticOption = misterFantasticOption ? hydrateContactOption(misterFantasticOption) : undefined;
            expect(hydratedMisterFantasticOption?.private_isArchived).toBe(true);
        });

        it('should not set private_isArchived on personal details options when privateIsArchivedMap is empty', () => {
            renderLocaleContextProvider();
            // Given an empty privateIsArchivedMap
            const emptyMap: PrivateIsArchivedMap = {};

            // When we call createFilteredOptionList with an empty privateIsArchivedMap
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, emptyMap, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });

            // Then no personal details options should have private_isArchived set once hydrated
            const optionsWithArchived = result.personalDetails.map(hydrateContactOption).filter((pd) => pd.private_isArchived);
            expect(optionsWithArchived.length).toBe(0);
        });

        it('should correctly map multiple archived reports to personal details options', () => {
            renderLocaleContextProvider();
            // Given a privateIsArchivedMap with multiple archived reports
            const privateIsArchivedMap: PrivateIsArchivedMap = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}3`]: true, // Report for account 1
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}5`]: true, // Report for account 5
            };

            // When we call createFilteredOptionList with this privateIsArchivedMap
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, privateIsArchivedMap, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });

            // Then the hydrated personal detail options should have the correct private_isArchived values
            const misterFantasticOption = result.personalDetails.find((pd) => pd.item?.accountID === 1);
            const invisibleWomanOption = result.personalDetails.find((pd) => pd.item?.accountID === 5);
            const hydratedMisterFantasticOption = misterFantasticOption ? hydrateContactOption(misterFantasticOption) : undefined;
            const hydratedInvisibleWomanOption = invisibleWomanOption ? hydrateContactOption(invisibleWomanOption) : undefined;

            expect(hydratedMisterFantasticOption?.private_isArchived).toBe(true);
            expect(hydratedInvisibleWomanOption?.private_isArchived).toBe(true);
        });

        it('should set private_isArchived on report options when privateIsArchivedMap is provided', () => {
            renderLocaleContextProvider();
            // Given a privateIsArchivedMap with archived reports
            const privateIsArchivedMap: PrivateIsArchivedMap = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}3`]: true,
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}5`]: true,
            };

            // When we call createFilteredOptionList with this privateIsArchivedMap
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, privateIsArchivedMap, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });

            // Then the report options should have the correct private_isArchived values
            const report3Option = result.reports.find((r) => r.item?.reportID === '3');
            const report5Option = result.reports.find((r) => r.item?.reportID === '5');
            const report1Option = result.reports.find((r) => r.item?.reportID === '1');

            expect(report3Option?.private_isArchived).toBe(true);
            expect(report5Option?.private_isArchived).toBe(true);
            // Report 1 should not have private_isArchived since it's not in the map
            expect(report1Option?.private_isArchived).toBeUndefined();
        });

        it('should not set private_isArchived from map when privateIsArchivedMap is empty', () => {
            renderLocaleContextProvider();
            // Given an empty privateIsArchivedMap
            const emptyMap: PrivateIsArchivedMap = {};

            // When we call createFilteredOptionList with an empty privateIsArchivedMap
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, emptyMap, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });

            // Then reports NOT in Onyx (like report 3, 5) should not have private_isArchived set
            // Note: Report 10 gets private_isArchived from Onyx (set in beforeAll)
            const report3Option = result.reports.find((r) => r.item?.reportID === '3');
            const report5Option = result.reports.find((r) => r.item?.reportID === '5');
            expect(report3Option?.private_isArchived).toBeUndefined();
            expect(report5Option?.private_isArchived).toBeUndefined();
        });

        it('should correctly map multiple archived reports in privateIsArchivedMap', () => {
            renderLocaleContextProvider();
            // Given a privateIsArchivedMap with multiple archived reports
            const privateIsArchivedMap: PrivateIsArchivedMap = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}1`]: true,
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}3`]: true,
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}5`]: true,
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}7`]: true,
            };

            // When we call createFilteredOptionList with this privateIsArchivedMap
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, privateIsArchivedMap, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });

            // Then the report options should have the correct private_isArchived values
            const report1Option = result.reports.find((r) => r.item?.reportID === '1');
            const report3Option = result.reports.find((r) => r.item?.reportID === '3');
            const report5Option = result.reports.find((r) => r.item?.reportID === '5');
            const report7Option = result.reports.find((r) => r.item?.reportID === '7');
            const report2Option = result.reports.find((r) => r.item?.reportID === '2');

            expect(report1Option?.private_isArchived).toBe(true);
            expect(report3Option?.private_isArchived).toBe(true);
            expect(report5Option?.private_isArchived).toBe(true);
            expect(report7Option?.private_isArchived).toBe(true);
            // Report 2 should not have private_isArchived since it's not in the map
            expect(report2Option?.private_isArchived).toBeUndefined();
        });

        it('should respect maxRecentReports option while preserving archived status', () => {
            renderLocaleContextProvider();
            // Given a privateIsArchivedMap and a maxRecentReports limit larger than the total reports count
            // Note: Report 7 has largest lastVisibleActionCreated but is archived, so it sorts last
            // (archived reports use "0_" prefix vs "1_" for non-archived in the sort comparator)
            const privateIsArchivedMap: PrivateIsArchivedMap = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}7`]: true,
            };

            // When we call createFilteredOptionList with a maxRecentReports limit that includes all reports
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, privateIsArchivedMap, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                maxRecentReports: 20,
            });

            // Then the report 7 (most recent) should still have private_isArchived set
            const report7Option = result.reports.find((r) => r.item?.reportID === '7');
            expect(report7Option?.private_isArchived).toBe(true);
        });
    });

    describe('filterSelfDMChat()', () => {
        const REPORT = {
            reportID: '1',
            text: 'Google Workspace',
            policyID: '11',
            keyForList: '11',
            isPolicyExpenseChat: true,
        };
        const LOGIN = 'johndoe@test.com';
        const ALTERNATE_TEXT = 'John William Doe';
        const SUBTITLE = 'Software Engineer';

        it('should return the report when there are no search terms', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and no search terms
            const result = filterSelfDMChat(REPORT, []);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should return undefined, when the search term does not match the report', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and a search term that does not match the report
            const result = filterSelfDMChat(REPORT, ['XYZ']);

            // Then the returned value should be undefined
            expect(result).toBeUndefined();
        });

        it('should filter report by text', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and search term that matches the report
            const result = filterSelfDMChat(REPORT, ['Google']);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by exact text', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and multiple search terms that match the report's exact name
            const result = filterSelfDMChat(REPORT, ['Google', 'Workspace']);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by login', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and a search term that matches the report's login
            const result = filterSelfDMChat({...REPORT, login: LOGIN}, ['john']);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by exact login', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and multiple search terms that match the report's exact login
            const result = filterSelfDMChat({...REPORT, login: LOGIN}, [LOGIN]);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by alternate text', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and a search term that matches the report's alternate text
            const result = filterSelfDMChat({...REPORT, alternateText: ALTERNATE_TEXT, isThread: true}, ['William']);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by exact alternate text', () => {
            // Given a report object that is a thread
            // When we call filterSelfDMChat with the report and multiple search terms that match the report's exact alternate text
            const result = filterSelfDMChat({...REPORT, alternateText: ALTERNATE_TEXT, isThread: true}, ['John', 'William', 'Doe']);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by alternate text if it is not a thread', () => {
            // Given a report object that is not a thread
            // When we call filterSelfDMChat with the report and a search term that matches the report's alternate text
            const result = filterSelfDMChat({...REPORT, alternateText: ALTERNATE_TEXT, isThread: false}, ['William']);

            // Then the returned value should be undefined
            expect(result?.reportID).toBeUndefined();
        });

        it('should filter report by subtitle', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and a search term that matches the report's subtitle
            const result = filterSelfDMChat({...REPORT, subtitle: SUBTITLE}, ['Software']);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by exact subtitle', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and multiple search terms that match the report's exact subtitle
            const result = filterSelfDMChat({...REPORT, subtitle: SUBTITLE}, ['Software', 'Engineer']);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should not filter report by subtitle if it is not an expense chat nor a chat room', () => {
            // Given a report object that is not an expense chat nor a chat room
            // When we call filterSelfDMChat with the report and a search term that matches the report's subtitle
            const result = filterSelfDMChat(
                {
                    ...REPORT,
                    subtitle: SUBTITLE,
                    isPolicyExpenseChat: false,
                    isChatRoom: false,
                },
                ['Software'],
            );

            // Then the returned value should be undefined
            expect(result).toBeUndefined();
        });

        it('should filter report by subtitle if it is a chat room', () => {
            // Given a report object that is not an expense chat but is a chat room
            // When we call filterSelfDMChat with the report and a search term that matches the report's subtitle
            const result = filterSelfDMChat(
                {
                    ...REPORT,
                    subtitle: SUBTITLE,
                    isPolicyExpenseChat: false,
                    isChatRoom: true,
                },
                ['Software'],
            );

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });
    });

    describe('filterReports()', () => {
        it('should match a user with an accented name when searching using non-accented characters', () => {
            // Given a report with accented characters in the text property
            // cspell:disable-next-line
            const reports: OptionData[] = [{text: "Álex Timón D'artagnan Zo-e", reportID: 'accented', keyForList: 'accented'}];
            // Given a search term with non-accented characters
            // cspell:disable-next-line
            const searchTerms = ['Alex Timon Dartagnan Zoe'];
            // When we call filterReports with the report and search terms
            const filteredReports = filterReports(reports, searchTerms);

            // Then the returned value should match the search term
            expect(filteredReports).toEqual(reports);
        });

        it.each([
            {
                description: 'an apostrophe',
                reportText: "Don't forget",
                searchText: 'dont',
            },
            {
                description: 'a hyphen',
                reportText: 'Foo-Bar',
                searchText: 'foobar',
            },
            {
                description: 'a zero-width character',
                reportText: 'Foo\u200BBar',
                searchText: 'foobar',
            },
        ])('should match report text containing $description', ({reportText, searchText}) => {
            // Given a report whose display text contains characters normalized by report search
            const report: OptionData = {text: reportText, reportID: 'normalized', keyForList: 'normalized'};

            // When the report is filtered with the normalized search value
            const filteredReports = filterReports([report], [searchText]);

            // Then the report should remain in the results
            expect(filteredReports).toEqual([report]);
        });

        it('should match a report by email when dots are omitted from the search', () => {
            const report: OptionData = {
                text: 'Test User',
                login: 'test.user@example.com',
                reportID: 'email',
                keyForList: 'email',
            };

            const filteredReports = filterReports([report], ['testuser@example.com']);

            expect(filteredReports).toEqual([report]);
        });

        it('should match a report by its normalized phone number', () => {
            const report: OptionData = {
                text: 'Phone Contact',
                login: '+12345678901',
                reportID: 'phone',
                keyForList: 'phone',
            };

            const filteredReports = filterReports([report], [getSearchValueForPhoneOrEmail('+1 (234) 567-8901', COUNTRY_CODE)]);

            expect(filteredReports).toEqual([report]);
        });
    });

    describe('getMostRecentOptions()', () => {
        it('returns the most recent options up to the specified limit', () => {
            const options: OptionData[] = [
                {
                    reportID: '1',
                    lastVisibleActionCreated: '2022-01-01T10:00:00Z',
                    keyForList: '1',
                },
                {
                    reportID: '2',
                    lastVisibleActionCreated: '2022-01-01T12:00:00Z',
                    keyForList: '2',
                },
                {
                    reportID: '3',
                    lastVisibleActionCreated: '2022-01-01T09:00:00Z',
                    keyForList: '3',
                },
                {
                    reportID: '4',
                    lastVisibleActionCreated: '2022-01-01T13:00:00Z',
                    keyForList: '4',
                },
            ];
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';
            const result = optionsOrderBy(options, comparator, 2).options;
            expect(result.length).toBe(2);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(0)!.reportID).toBe('4');
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(1)!.reportID).toBe('2');
        });

        it('returns all options if limit is greater than options length', () => {
            const options: OptionData[] = [
                {
                    reportID: '1',
                    lastVisibleActionCreated: '2022-01-01T10:00:00Z',
                    keyForList: '1',
                },
                {
                    reportID: '2',
                    lastVisibleActionCreated: '2022-01-01T12:00:00Z',
                    keyForList: '2',
                },
            ];
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';
            const result = optionsOrderBy(options, comparator, 5).options;
            expect(result.length).toBe(2);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(0)!.reportID).toBe('2');
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(1)!.reportID).toBe('1');
        });

        it('returns empty array if options is empty', () => {
            const result = optionsOrderBy([], recentReportComparator, 3).options;
            expect(result).toEqual([]);
        });

        it('applies filter function if provided', () => {
            const options: OptionData[] = [
                {
                    reportID: '1',
                    lastVisibleActionCreated: '2022-01-01T10:00:00Z',
                    isPinned: true,
                    keyForList: '1',
                },
                {
                    reportID: '2',
                    lastVisibleActionCreated: '2022-01-01T12:00:00Z',
                    isPinned: false,
                    keyForList: '2',
                },
                {
                    reportID: '3',
                    lastVisibleActionCreated: '2022-01-01T09:00:00Z',
                    isPinned: true,
                    keyForList: '3',
                },
            ];
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';
            const result = optionsOrderBy(options, comparator, 2, (option) => option.isPinned).options;
            expect(result.length).toBe(2);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(0)!.reportID).toBe('1');
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(1)!.reportID).toBe('3');
        });

        it('handles negative limit by returning empty array', () => {
            const options: OptionData[] = [
                {
                    reportID: '1',
                    lastVisibleActionCreated: '2022-01-01T10:00:00Z',
                    keyForList: '1',
                },
                {
                    reportID: '2',
                    lastVisibleActionCreated: '2022-01-01T12:00:00Z',
                    keyForList: '2',
                },
                {
                    reportID: '3',
                    lastVisibleActionCreated: '2022-01-01T09:00:00Z',
                    keyForList: '3',
                },
            ];
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';
            const result = optionsOrderBy(options, comparator, -1).options;
            expect(result).toEqual([]);
        });

        it('handles negative limit with large absolute value', () => {
            const options: OptionData[] = [
                {
                    reportID: '1',
                    lastVisibleActionCreated: '2022-01-01T10:00:00Z',
                    keyForList: '1',
                },
                {
                    reportID: '2',
                    lastVisibleActionCreated: '2022-01-01T12:00:00Z',
                    keyForList: '2',
                },
            ];
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';
            const result = optionsOrderBy(options, comparator, -100).options;
            expect(result).toEqual([]);
        });

        it('handles limit equal to zero', () => {
            const options: OptionData[] = [
                {
                    reportID: '1',
                    lastVisibleActionCreated: '2022-01-01T10:00:00Z',
                    keyForList: '1',
                },
                {
                    reportID: '2',
                    lastVisibleActionCreated: '2022-01-01T12:00:00Z',
                    keyForList: '2',
                },
            ];
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';
            const result = optionsOrderBy(options, comparator, 0).options;
            expect(result).toEqual([]);
        });

        it('returns the older options up to the specified limit', () => {
            const options: OptionData[] = [
                {
                    reportID: '1',
                    lastVisibleActionCreated: '2022-01-01T10:00:00Z',
                    keyForList: '1',
                },
                {
                    reportID: '2',
                    lastVisibleActionCreated: '2022-01-01T12:00:00Z',
                    keyForList: '2',
                },
                {
                    reportID: '3',
                    lastVisibleActionCreated: '2022-01-01T09:00:00Z',
                    keyForList: '3',
                },
                {
                    reportID: '4',
                    lastVisibleActionCreated: '2022-01-01T13:00:00Z',
                    keyForList: '4',
                },
            ];
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';
            // We will pass reversed === true to sort the list in ascending order
            const result = optionsOrderBy(options, comparator, 2, undefined, true).options;
            expect(result.length).toBe(2);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(0)!.reportID).toBe('3');
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(1)!.reportID).toBe('1');
        });
    });

    describe('optionsOrderBy()', () => {
        const createRecentOptions = (count: number): OptionData[] =>
            Array.from({length: count}, (_, index) => ({
                reportID: String(index + 1),
                lastVisibleActionCreated: `2022-01-01T${String(10 + index).padStart(2, '0')}:00:00Z`,
                keyForList: String(index + 1),
            }));

        it('calls comparator exactly once per option that passes the filter', () => {
            const options = createRecentOptions(8);
            const comparator = jest.fn((option: OptionData) => option.lastVisibleActionCreated ?? '');

            optionsOrderBy(options, comparator, 3);

            expect(comparator).toHaveBeenCalledTimes(8);
            for (const option of options) {
                expect(comparator).toHaveBeenCalledWith(option);
            }
        });

        it('does not call comparator for options rejected by the filter', () => {
            const passingOptions: OptionData[] = [
                {
                    reportID: '1',
                    lastVisibleActionCreated: '2022-01-01T10:00:00Z',
                    isPinned: true,
                    keyForList: '1',
                },
                {
                    reportID: '3',
                    lastVisibleActionCreated: '2022-01-01T12:00:00Z',
                    isPinned: true,
                    keyForList: '3',
                },
            ];
            const filteredOutOptions: OptionData[] = [
                {
                    reportID: '2',
                    lastVisibleActionCreated: '2022-01-01T11:00:00Z',
                    isPinned: false,
                    keyForList: '2',
                },
            ];
            const options = [...passingOptions, ...filteredOutOptions];
            const comparator = jest.fn((option: OptionData) => option.lastVisibleActionCreated ?? '');

            optionsOrderBy(options, comparator, 2, (option) => option.isPinned);

            expect(comparator).toHaveBeenCalledTimes(passingOptions.length);
            for (const option of passingOptions) {
                expect(comparator).toHaveBeenCalledWith(option);
            }
            for (const option of filteredOutOptions) {
                expect(comparator).not.toHaveBeenCalledWith(option);
            }
        });

        it('calls comparator exactly once per passing option when heap evictions occur', () => {
            const options = createRecentOptions(12);
            const comparator = jest.fn((option: OptionData) => option.lastVisibleActionCreated ?? '');

            optionsOrderBy(options, comparator, 3);

            expect(comparator).toHaveBeenCalledTimes(12);
        });

        it('does not call comparator when limit is 0', () => {
            const options = createRecentOptions(5);
            const comparator = jest.fn((option: OptionData) => option.lastVisibleActionCreated ?? '');

            optionsOrderBy(options, comparator, 0);

            expect(comparator).not.toHaveBeenCalled();
        });

        it('returns hasMore true when limit is less than the number of options', () => {
            const options = createRecentOptions(5);
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';

            const result = optionsOrderBy(options, comparator, 3);

            expect(result.options).toHaveLength(3);
            expect(result.hasMore).toBe(true);
        });

        it('returns hasMore false when limit is greater than or equal to the number of options', () => {
            const options = createRecentOptions(5);
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';

            const result = optionsOrderBy(options, comparator, 5);

            expect(result.options).toHaveLength(5);
            expect(result.hasMore).toBe(false);
        });
    });

    describe('optionsOrderAndGroupBy()', () => {
        const createGroupedOptions = (count: number): OptionData[] =>
            Array.from({length: count}, (_, index) => {
                const groupType = index % 3;
                return {
                    reportID: String(index + 1),
                    lastVisibleActionCreated: `2022-01-01T${String(10 + index).padStart(2, '0')}:00:00Z`,
                    keyForList: String(index + 1),
                    isSelfDM: groupType === 0,
                    isPolicyExpenseChat: groupType === 1,
                };
            });

        const separators = [(option: OptionData) => option.isSelfDM, (option: OptionData) => option.isPolicyExpenseChat];

        it('calls comparator exactly once per option that passes the filter', () => {
            const options = createGroupedOptions(9);
            const comparator = jest.fn((option: OptionData) => option.lastVisibleActionCreated ?? '');

            optionsOrderAndGroupBy(separators, options, comparator, 2);

            expect(comparator).toHaveBeenCalledTimes(9);
            for (const option of options) {
                expect(comparator).toHaveBeenCalledWith(option);
            }
        });

        it('does not call comparator for options rejected by the filter', () => {
            const passingOptions: OptionData[] = [
                {
                    reportID: '1',
                    lastVisibleActionCreated: '2022-01-01T10:00:00Z',
                    isSelfDM: true,
                    keyForList: '1',
                },
                {
                    reportID: '2',
                    lastVisibleActionCreated: '2022-01-01T11:00:00Z',
                    isPolicyExpenseChat: true,
                    keyForList: '2',
                },
            ];
            const filteredOutOptions: OptionData[] = [
                {
                    reportID: '3',
                    lastVisibleActionCreated: '2022-01-01T12:00:00Z',
                    keyForList: '3',
                },
            ];
            const options = [...passingOptions, ...filteredOutOptions];
            const comparator = jest.fn((option: OptionData) => option.lastVisibleActionCreated ?? '');

            optionsOrderAndGroupBy(separators, options, comparator, 2, (option) => option.isSelfDM === true || option.isPolicyExpenseChat === true);

            expect(comparator).toHaveBeenCalledTimes(passingOptions.length);
            for (const option of passingOptions) {
                expect(comparator).toHaveBeenCalledWith(option);
            }
            for (const option of filteredOutOptions) {
                expect(comparator).not.toHaveBeenCalledWith(option);
            }
        });

        it('calls comparator exactly once per passing option when heap evictions occur across groups', () => {
            const options = createGroupedOptions(15);
            const comparator = jest.fn((option: OptionData) => option.lastVisibleActionCreated ?? '');

            optionsOrderAndGroupBy(separators, options, comparator, 2);

            expect(comparator).toHaveBeenCalledTimes(15);
        });

        it('does not call comparator when limit is 0', () => {
            const options = createGroupedOptions(5);
            const comparator = jest.fn((option: OptionData) => option.lastVisibleActionCreated ?? '');

            const result = optionsOrderAndGroupBy(separators, options, comparator, 0);

            expect(comparator).not.toHaveBeenCalled();
            expect(result.options).toStrictEqual([[], [], []]);
        });

        it('keeps the oldest options per group up to the limit when reversed', () => {
            const options = createGroupedOptions(9);
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';

            const result = optionsOrderAndGroupBy(separators, options, comparator, 2, undefined, true);

            expect(result.options.map((group) => group.map((option) => option.reportID))).toStrictEqual([
                ['1', '4'],
                ['2', '5'],
                ['3', '6'],
            ]);
            expect(result.hasMore).toBe(true);
        });
    });

    describe('sortAlphabetically', () => {
        it('should sort options alphabetically by text', () => {
            const options: OptionData[] = [
                {text: 'Banana', reportID: '1', keyForList: '1'},
                {text: 'Apple', reportID: '2', keyForList: '2'},
                {text: 'Cherry', reportID: '3', keyForList: '3'},
            ];
            const sortedOptions = sortAlphabetically(options, 'text', localeCompare);
            expect(sortedOptions.at(0)?.reportID).toBe('2');
            expect(sortedOptions.at(1)?.reportID).toBe('1');
            expect(sortedOptions.at(2)?.reportID).toBe('3');
        });

        it('should handle empty array', () => {
            const sortedOptions = sortAlphabetically([], 'abc', localeCompare);
            expect(sortedOptions).toEqual([]);
        });

        it('should handle single option', () => {
            const options: OptionData[] = [{text: 'Single', reportID: '1', keyForList: '1'}];
            const sortedOptions = sortAlphabetically(options, 'text', localeCompare);
            expect(sortedOptions.length).toBe(1);
            expect(sortedOptions.at(0)?.text).toBe('Single');
        });
    });
    describe('getSearchValueForPhoneOrEmail', () => {
        it('should return E164 format for valid phone number', () => {
            const result = getSearchValueForPhoneOrEmail('+1 (234) 567-8901', 1);
            expect(result).toBe('+12345678901');
        });

        it('should return E164 format for valid international phone number', () => {
            const result = getSearchValueForPhoneOrEmail('+44 20 8759 9036', 44);
            expect(result).toBe('+442087599036');
        });

        it('should return lowercase for email address', () => {
            const result = getSearchValueForPhoneOrEmail('Test@Example.COM', 1);
            expect(result).toBe('test@example.com');
        });

        it('should handle SMS domain removal for valid phone number', () => {
            const result = getSearchValueForPhoneOrEmail('+12345678901@expensify.sms', 1);
            expect(result).toBe('+12345678901');
        });

        it('should return empty string for empty input', () => {
            const result = getSearchValueForPhoneOrEmail('', 1);
            expect(result).toBe('');
        });
    });

    describe('createOption', () => {
        it('should return alternative text correctly when the last action is report preview action', async () => {
            const report: Report = {
                chatType: undefined,
                currency: 'USD',
                description: '',
                errorFields: {},
                hasOutstandingChildRequest: false,
                hasOutstandingChildTask: false,
                iouReportID: '456',
                lastMessageHtml: '',
                lastMessageText: '',
                participants: {
                    '1': {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    '2': {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
                reportID: '123',
                type: CONST.REPORT.TYPE.CHAT,
                lastActorAccountID: 1,
            };

            const reportPreviewAction: ReportAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                actorAccountID: 1,
                childManagerAccountID: 2,
                childOwnerAccountID: 1,
                childReportID: '456',
                childReportName: 'IOU',
                created: '2025-10-02 06:50:36.302',
                reportActionID: '12345678',
                shouldShow: true,
                message: [
                    {
                        html: 'Iron Man owes ₫34',
                        text: 'Iron Man owes ₫34',
                        type: 'COMMENT',
                        whisperedTo: [],
                    },
                ],
            };

            const iouReport: Report = {
                chatReportID: '123',
                currency: 'VND',
                managerID: 2,
                ownerAccountID: 1,
                parentReportActionID: '12345678',
                parentReportID: '123',
                participants: {
                    '19960856': {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    '20669492': {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
                reportID: '456',
                reportName: 'IOU',
                total: 3400,
            };

            const iouAction: ReportAction = {
                actorAccountID: 1,
                created: '2025-10-02 06:50:36.302',
                message: [
                    {
                        type: 'COMMENT',
                        html: '₫34 expense',
                        text: '₫34 expense',
                        isEdited: false,
                        whisperedTo: [],
                        isDeletedParentAction: false,
                        deleted: '',
                    },
                ],
                originalMessage: {
                    IOUTransactionID: '123456',
                    amount: 3400,
                    comment: '',
                    currency: 'VND',
                    participantAccountIDs: [1, 2],
                },
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                reportActionID: '789',
                reportID: '456',
            };

            const transaction: Transaction = {
                transactionID: '123456',
                amount: 3400,
                currency: 'VND',
                reportID: '3993091505909230',
                comment: {
                    comment: '',
                },
                merchant: '(none)',
                created: '2025-10-02',
                category: '',
                taxAmount: 0,
                reimbursable: true,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {[reportPreviewAction.reportActionID]: reportPreviewAction});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`, {[iouAction.reportActionID]: iouAction});
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await waitForBatchedUpdates();

            const result = createOption({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                accountIDs: [1, 2],
                personalDetails: PERSONAL_DETAILS,
                report,
                privateIsArchived: undefined,
                config: {showChatPreviewLine: true},
            });

            expect(result.alternateText).toBe('Iron Man owes ₫34');
        });

        it('should work correctly when reports collection with chatReport is passed', async () => {
            const reportID = '123';
            const chatReportID = '456';

            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID,
                chatReportID,
                participants: {
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    2: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const chatReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: chatReportID,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport);
            await waitForBatchedUpdates();

            const result = createOption({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                accountIDs: [1, 2],
                personalDetails: PERSONAL_DETAILS,
                report,
                privateIsArchived: undefined,
            });

            expect(result.reportID).toBe(reportID);
            expect(typeof result.text).toBe('string');
        });

        it('should work correctly when reports is undefined', async () => {
            const report: Report = {
                ...createRandomReport(0, undefined),
                participants: {
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    2: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await waitForBatchedUpdates();

            // Should not throw when reports is undefined
            const result = createOption({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                accountIDs: [1, 2],
                personalDetails: PERSONAL_DETAILS,
                report,
                privateIsArchived: undefined,
            });

            expect(result.reportID).toBe(report.reportID);
        });
    });

    describe('getParticipantsOption', () => {
        it('returns the personal-detail display name for a known Expensify user', () => {
            const participant: Participant = {
                accountID: 2,
                login: 'tonystark@expensify.com',
            };
            const result = getParticipantsOption(participant, PERSONAL_DETAILS, translateLocal);

            // formatPhoneNumber replaces spaces with non-breaking spaces, so normalize before comparing.
            expect(result.text?.replaceAll(String.fromCharCode(0xa0), ' ')).toBe('Iron Man');
            expect(result.login).toBe('tonystark@expensify.com');
            expect(result.accountID).toBe(2);
            expect(result.keyForList).toBe('2');
        });

        it('prefers participant.displayName over the personal-detail name when provided', () => {
            const participant: Participant = {
                accountID: 2,
                login: 'tonystark@expensify.com',
                displayName: 'Override Name',
            };
            const result = getParticipantsOption(participant, PERSONAL_DETAILS, translateLocal);

            // participant.displayName takes precedence and is returned as-is.
            expect(result.text).toBe('Override Name');
        });

        it('falls back to the device-contact name (participant.text) when the personal detail has no login', () => {
            // Optimistic accountID for an imported device contact: not in PERSONAL_DETAILS,
            // so getPersonalDetailsForAccountIDs returns a stub with no login.
            const participant: Participant = {
                accountID: 9999999,
                login: '+12025550123@expensify.sms',
                text: 'John Smith',
            };

            const result = getParticipantsOption(participant, PERSONAL_DETAILS, translateLocal);

            expect(result.text).toBe('John Smith');
            expect(result.login).toBe('+12025550123@expensify.sms');
        });

        it('falls back to the formatted phone number when neither displayName, personal-detail login, nor participant.text exist', () => {
            const participant: Participant = {
                accountID: 9999998,
                login: '+12025550124@expensify.sms',
            };

            const result = getParticipantsOption(participant, PERSONAL_DETAILS, translateLocal);

            // The display name should be derived from the login (formatted phone), not be empty.
            expect(result.text).toBeTruthy();
            expect(result.text).not.toBe('');
        });

        it('uses participant.login when no accountID is provided', () => {
            const participant: Participant = {login: 'guest@example.com'};

            const result = getParticipantsOption(participant, PERSONAL_DETAILS, translateLocal);

            expect(result.login).toBe('guest@example.com');
            expect(result.keyForList).toBe('guest@example.com');
        });

        it('returns the avatar, firstName, and lastName from the personal detail when available', () => {
            const personalDetails: PersonalDetailsList = {
                '42': {
                    accountID: 42,
                    login: 'agent@example.com',
                    displayName: 'Agent Smith',
                    firstName: 'Agent',
                    lastName: 'Smith',
                    avatar: 'https://example.com/avatar.png',
                    keyForList: 'agent@example.com',
                    reportID: '',
                },
            };

            const participant: Participant = {accountID: 42};
            const result = getParticipantsOption(participant, personalDetails, translateLocal);

            expect(result.firstName).toBe('Agent');
            expect(result.lastName).toBe('Smith');
            expect(result.icons?.[0]?.source).toBe('https://example.com/avatar.png');
        });
    });

    describe('getIOUConfirmationOptionsFromPayeePersonalDetail', () => {
        it('formats payee text and alternate text with the injected phone-number formatter', () => {
            const personalDetail = {
                accountID: 42,
                login: '+18332403627@expensify.sms',
                keyForList: '+18332403627@expensify.sms',
                reportID: '',
            };

            const result = getIOUConfirmationOptionsFromPayeePersonalDetail(personalDetail, translateLocal, formatPhoneNumber);

            expect(result.text).toBe('(833) 240-3627');
            expect(result.alternateText).toBe('(833) 240-3627');
        });
    });

    describe('getLastMessageTextForReport', () => {
        describe('getReportPreviewMessage', () => {
            it('should format report preview message correctly for non-policy expense chat with IOU action', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    isOwnPolicyExpenseChat: false,
                };
                const iouReport: Report = {
                    ...createRandomReport(1, undefined),
                    isOwnPolicyExpenseChat: false,
                    type: CONST.REPORT.TYPE.IOU,
                    isWaitingOnBankAccount: false,
                    currency: CONST.CURRENCY.USD,
                    total: 100,
                    unheldTotal: 100,
                };
                const reportPreviewAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                    childMoneyRequestCount: 1,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        linkedReportID: iouReport.reportID,
                    },
                    shouldShow: true,
                };
                const transaction: Transaction = {
                    ...createRandomTransaction(0),
                    amount: 100,
                    currency: CONST.CURRENCY.USD,
                    merchant: '',
                    modifiedMerchant: '',
                    comment: {
                        comment: '<strong>A</strong><br />A<br />A',
                    },
                };
                const iouAction: ReportAction = {
                    ...createRandomReportAction(2),
                    reportID: iouReport.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        IOUTransactionID: transaction.transactionID,
                        type: 'create',
                    },
                    shouldShow: true,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [reportPreviewAction.reportActionID]: reportPreviewAction,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`, {
                    [iouAction.reportActionID]: iouAction,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
                const reportPreviewMessage = getReportPreviewReportActionMessage(
                    {
                        reportOrID: iouReport,
                        iouReportAction: iouAction,
                        shouldConsiderScanningReceiptOrPendingRoute: true,
                        policy: null,
                        isForListPreview: true,
                        originalReportAction: reportPreviewAction,
                    },
                    getCurrencyDecimalsLocal,
                );
                const formattedMessage = formatReportLastMessageText(Parser.htmlToText(reportPreviewMessage));
                expect(formattedMessage).toBe('$1.00 for A A A');
            });
        });
        describe('canonical money request preview fallback', () => {
            it('should preserve the minus sign when formatting negative expense previews', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-1',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(1),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const moneyRequestAction: ReportAction = {
                    ...createRandomReportAction(2),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 10:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: -2500,
                        currency: CONST.CURRENCY.USD,
                        comment: '<strong>Dinner</strong>',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [moneyRequestAction.reportActionID]: moneyRequestAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_EMAIL,
                });

                expect(lastMessage).toBe('-$25.00 for Dinner');
            });

            it('should ignore deleted money request actions when building canonical expense preview', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-2',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(3),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const deletedMoneyRequestAction: ReportAction = {
                    ...createRandomReportAction(4),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 11:00:00.000',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: -9900,
                        currency: CONST.CURRENCY.USD,
                        comment: 'Deleted comment',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };
                const visibleMoneyRequestAction: ReportAction = {
                    ...createRandomReportAction(5),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 10:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: -4500,
                        currency: CONST.CURRENCY.USD,
                        comment: 'Visible comment',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [deletedMoneyRequestAction.reportActionID]: deletedMoneyRequestAction,
                    [visibleMoneyRequestAction.reportActionID]: visibleMoneyRequestAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_EMAIL,
                });

                expect(lastMessage).toBe('-$45.00 for Visible comment');
            });

            it('should format amount-only preview when the canonical money request has an empty comment', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-3',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(6),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const moneyRequestAction: ReportAction = {
                    ...createRandomReportAction(7),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 12:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: -2500,
                        currency: CONST.CURRENCY.USD,
                        comment: '',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [moneyRequestAction.reportActionID]: moneyRequestAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_EMAIL,
                });

                expect(lastMessage).toBe('-$25.00');
            });

            it('should format zero-value expense previews without adding a minus sign', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-zero',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(14),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const moneyRequestAction: ReportAction = {
                    ...createRandomReportAction(15),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 16:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: 0,
                        currency: CONST.CURRENCY.USD,
                        comment: 'Zero amount',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [moneyRequestAction.reportActionID]: moneyRequestAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_EMAIL,
                });

                expect(lastMessage).toBe('$0.00 for Zero amount');
            });

            it('should format preview correctly for non-USD currencies', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-4',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.EUR,
                    transactionCount: 1,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(8),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const moneyRequestAction: ReportAction = {
                    ...createRandomReportAction(9),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 13:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: -2500,
                        currency: CONST.CURRENCY.EUR,
                        comment: 'Lunch',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [moneyRequestAction.reportActionID]: moneyRequestAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_EMAIL,
                });

                expect(lastMessage).toBe('-€25.00 for Lunch');
            });

            it('should return an empty preview when the canonical money request is missing amount', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-5',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(10),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const moneyRequestAction: ReportAction = {
                    ...createRandomReportAction(11),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 14:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        currency: CONST.CURRENCY.USD,
                        comment: 'Missing amount',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [moneyRequestAction.reportActionID]: moneyRequestAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_EMAIL,
                });

                expect(lastMessage).toBe('');
            });

            it('should return an empty preview when only a created action is visible after expense deletion', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-deleted',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                    lastMessageText: '-$25.00 for Deleted expense',
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(16),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_EMAIL,
                });

                expect(lastMessage).toBe('');
            });

            it('should preserve last visible message fallback for non-expense IOU reports', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'iou-report-created-last-action',
                    type: CONST.REPORT.TYPE.IOU,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                    ownerAccountID: 1,
                    managerID: CURRENT_USER_ACCOUNT_ID,
                    isWaitingOnBankAccount: false,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(17),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    created: '2026-04-01 09:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const transaction: Transaction = {
                    ...createRandomTransaction(1),
                    amount: 2500,
                    currency: CONST.CURRENCY.USD,
                    merchant: 'Coffee',
                    modifiedMerchant: '',
                };
                const moneyRequestAction: ReportAction = {
                    ...createRandomReportAction(18),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    actorAccountID: 1,
                    created: '2026-04-01 10:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: -2500,
                        currency: CONST.CURRENCY.USD,
                        IOUTransactionID: transaction.transactionID,
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [moneyRequestAction.reportActionID]: moneyRequestAction,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_EMAIL,
                });

                expect(lastMessage).toBe('');
            });

            it('should fall back to the report currency when the canonical money request is missing currency', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-6',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(12),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const moneyRequestAction: ReportAction = {
                    ...createRandomReportAction(13),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 15:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: -2500,
                        comment: 'Missing currency',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [moneyRequestAction.reportActionID]: moneyRequestAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_EMAIL,
                });

                expect(lastMessage).toBe('-$25.00 for Missing currency');
            });
        });
        it('MOVED_TRANSACTION action', async () => {
            const mockIsSearchTopmostFullScreenRoute = jest.mocked(isSearchTopmostFullScreenRoute);
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
            const report: Report = createRandomReport(2, undefined);
            const report2: Report = {
                ...createRandomReport(1, undefined),
                reportName: 'Expense Report #123',
            };
            const movedTransactionAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {
                    toReportID: report2.reportID,
                    fromReportID: report.reportID,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`, report2);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [movedTransactionAction.reportActionID]: movedTransactionAction,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            const {fromReportID, toReportID} = parseMovedTransactionReportIDs(movedTransactionAction);
            expect(lastMessage).toBe(Parser.htmlToText(getMovedTransactionMessage({translate: translateLocal, fromReportID, toReportID})));
        });
        describe('SUBMITTED action', () => {
            it('should return automatic submitted message if submitted via harvesting', async () => {
                const report: Report = createRandomReport(0, undefined);
                const submittedAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: 1,
                        harvesting: true,
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [submittedAction.reportActionID]: submittedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,

                    currentUserLogin: CURRENT_USER_EMAIL,
                });
                expect(lastMessage).toBe(Parser.htmlToText(translate(CONST.LOCALES.EN, 'iou.automaticallySubmitted')));
            });
        });
        describe('APPROVED action', () => {
            it('should return automatic approved message if approved automatically', async () => {
                const report: Report = createRandomReport(0, undefined);
                const approvedAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
                        automaticAction: true,
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [approvedAction.reportActionID]: approvedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,

                    currentUserLogin: CURRENT_USER_EMAIL,
                });
                expect(lastMessage).toBe(Parser.htmlToText(translate(CONST.LOCALES.EN, 'iou.automaticallyApproved')));
            });
        });
        describe('FORWARDED action', () => {
            it('should return forwarded message with memo', async () => {
                const report: Report = createRandomReport(0, undefined);
                const memo = 'Testing approval memo';
                const forwardedAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        automaticAction: false,
                        message: memo,
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [forwardedAction.reportActionID]: forwardedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,

                    currentUserLogin: CURRENT_USER_EMAIL,
                });
                expect(lastMessage).toBe(translateLocal('iou.forwarded', memo));
            });

            it('should return automatic forwarded message if forwarded automatically', async () => {
                const report: Report = createRandomReport(0, undefined);
                const forwardedAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        automaticAction: true,
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [forwardedAction.reportActionID]: forwardedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,

                    currentUserLogin: CURRENT_USER_EMAIL,
                });
                expect(lastMessage).toBe(Parser.htmlToText(translate(CONST.LOCALES.EN, 'iou.automaticallyForwarded')));
            });
        });
        describe('POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE action', () => {
            it('should return forced corporate upgrade message', async () => {
                const report: Report = createRandomReport(0, undefined);
                const corporateForceUpgradeAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [corporateForceUpgradeAction.reportActionID]: corporateForceUpgradeAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,

                    currentUserLogin: CURRENT_USER_EMAIL,
                });
                expect(lastMessage).toBe(Parser.htmlToText(translate(CONST.LOCALES.EN, 'workspaceActions.forcedCorporateUpgrade')));
            });
        });
        it('UPDATE_CUSTOM_TAX_NAME action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_TAX_NAME,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {oldName: 'Sales Tax', newName: 'VAT'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getCustomTaxNameUpdateMessage(translateLocal, action));
        });
        it('UPDATE_CURRENCY_DEFAULT_TAX action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY_DEFAULT_TAX,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {oldName: 'Standard Rate', newName: 'Reduced Rate'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getCurrencyDefaultTaxUpdateMessage(translateLocal, action));
        });
        it('ADD_AGENT_RULE action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_AGENT_RULE,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {ruleTitle: 'Receipts required', prompt: 'Flag any expense over $25 that is missing a receipt'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_EMAIL,
                conciergeReportID: undefined,
            });
            expect(lastMessage).toBe(getAddAgentRuleMessage(translateLocal, action));
        });
        it('UPDATE_AGENT_RULE action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AGENT_RULE,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {ruleTitle: 'Receipts required', prompt: 'Reject any expense that includes alcohol'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                conciergeReportID: undefined,
                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getUpdateAgentRuleMessage(translateLocal, action));
        });
        it('DELETE_AGENT_RULE action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_AGENT_RULE,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {ruleTitle: 'Receipts required'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                conciergeReportID: undefined,
                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getDeleteAgentRuleMessage(translateLocal, action));
        });
        it('UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {
                    oldName: 'Foreign Tax (15%)',
                    newName: 'Foreign Tax (10%)',
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getForeignCurrencyDefaultTaxUpdateMessage(translateLocal, action));
        });
        it('UPDATE_REQUIRE_COMPANY_CARDS_ENABLED action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRE_COMPANY_CARDS_ENABLED,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {enabled: true},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getRequireCompanyCardsEnabledMessage(translateLocal, action));
        });
        it('UPDATE_REQUIRES_CATEGORY action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_CATEGORY,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {enabled: true},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getRequiresCategoryMessage(translateLocal, action));
        });
        it.each([
            [CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.COMPANY, 'updated the currency conversion fee setting to "Company pays"'],
            [CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.EMPLOYEE, 'updated the currency conversion fee setting to "Employee pays"'],
        ])('UPDATE_GLOBAL_REIMBURSEMENTS_FX_PREFERENCE action with the %s preference', async (preference, expectedMessage) => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_GLOBAL_REIMBURSEMENTS_FX_PREFERENCE,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {preference},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(expectedMessage);
        });
        it('UPDATE_AUTO_HARVESTING action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_HARVESTING,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {value: true},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getUpdatedAutoHarvestingMessage(translateLocal, action));
        });
        it('UPDATE_REQUIRES_TAG action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_TAG,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {enabled: false},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getRequiresTagMessage(translateLocal, action));
        });
        it('ADD_CARD_FEED action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CARD_FEED,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {feedName: 'Visa Commercial'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getAddedCardFeedMessage(translateLocal, action));
        });
        it('DELETE_CARD_FEED action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CARD_FEED,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {feedName: 'Amex Corporate'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getRemovedCardFeedMessage(translateLocal, action));
        });
        it('RENAME_CARD_FEED action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.RENAME_CARD_FEED,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {oldName: 'Old Feed', newName: 'New Feed'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getRenamedCardFeedMessage(translateLocal, action));
        });
        it('ASSIGN_COMPANY_CARD action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ASSIGN_COMPANY_CARD,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {
                    email: 'user@example.com',
                    feedName: 'US Bank',
                    cardLastFour: '1234',
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getAssignedCompanyCardMessage(translateLocal, action));
        });
        it('UNASSIGN_COMPANY_CARD action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UNASSIGN_COMPANY_CARD,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {
                    email: 'user@example.com',
                    feedName: 'US Bank',
                    cardLastFour: '5678',
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getUnassignedCompanyCardMessage(translateLocal, action));
        });
        it('UPDATE_CARD_FEED_LIABILITY action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_LIABILITY,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {
                    feedName: 'Visa Commercial',
                    liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.ALLOW,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getUpdatedCardFeedLiabilityMessage(translateLocal, action));
        });
        it('UPDATE_CARD_FEED_STATEMENT_PERIOD action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_STATEMENT_PERIOD,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {
                    feedName: 'Visa Commercial',
                    statementPeriodEndDay: '15',
                    previousStatementPeriodEndDay: '20',
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(getUpdatedCardFeedStatementPeriodMessage(translateLocal, action));
        });
        it('TAKE_CONTROL action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const takeControlAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [takeControlAction.reportActionID]: takeControlAction,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(Parser.htmlToText(getChangedApproverActionMessage(translateLocal, takeControlAction)));
        });
        it('REROUTE action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const rerouteAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REROUTE,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [rerouteAction.reportActionID]: rerouteAction,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(Parser.htmlToText(getChangedApproverActionMessage(translateLocal, rerouteAction)));
        });
        it('MOVED action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const movedAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MOVED,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [movedAction.reportActionID]: movedAction,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(Parser.htmlToText(getMovedActionMessage(translateLocal, movedAction, report)));
        });
        it('DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action', async () => {
            // Given a DYNAMIC_EXTERNAL_WORKFLOW_ROUTED as the last action
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED> = {
                reportActionID: '1',
                created: '',
                actionName: CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {to: 'example@gmail.com', message: ''},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });

            // When getting the last message text for the report
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });

            // Then it should return the DYNAMIC_EXTERNAL_WORKFLOW_ROUTED message
            expect(lastMessage).toBe(Parser.htmlToText(getDynamicExternalWorkflowRoutedMessage(action, translateLocal)));
        });
        it('should return last visible message text when last action is hidden (e.g. whisper)', async () => {
            const report: Report = {
                ...createRandomReport(0, undefined),
                lastMessageText: 'joined the chat',
            };
            const whisperAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [whisperAction.reportActionID]: whisperAction,
            });
            await waitForBatchedUpdates();

            const expectedVisibleText = '';
            const result = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(result).toBe(expectedVisibleText);
        });
        it('should return "@Hidden" when last action is an ADD_COMMENT mentioning a user not in personal details', async () => {
            // Given a chat report whose last action is an ADD_COMMENT that mentions a user who does not exist in personal details
            const mentionedAccountID = 999999;
            const report: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.CHAT,
                lastActionType: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            };
            const addCommentAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                created: DateUtils.getDBTime(),
                message: [
                    {
                        type: 'COMMENT',
                        html: `<mention-user accountID="${mentionedAccountID}"></mention-user>`,
                        text: '',
                        isEdited: false,
                        isDeletedParentAction: false,
                        whisperedTo: [],
                    },
                ],
                originalMessage: {
                    html: `<mention-user accountID="${mentionedAccountID}"></mention-user>`,
                    mentionedAccountIDs: [mentionedAccountID],
                },
                shouldShow: true,
                pendingAction: null,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [addCommentAction.reportActionID]: addCommentAction,
            });
            await waitForBatchedUpdates();

            // When we get the last message text while the mentioned user is absent from personal details
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                lastAction: addCommentAction,
                currentUserLogin: CURRENT_USER_EMAIL,
            });

            // Then the mention should fall back to the hidden placeholder
            expect(lastMessage).toBe(`@${translateLocal('common.hidden')}`);
        });
        it('should return "No activity yet" for MoneyRequestReport with zero transactions', async () => {
            const report: Report = {
                ...createRandomReport(0, undefined),
                type: Math.floor(Math.random() * 2) === 1 ? CONST.REPORT.TYPE.IOU : CONST.REPORT.TYPE.EXPENSE,
                transactionCount: 0,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(lastMessage).toBe(translateLocal('report.noActivityYet'));
        });
        it('should return "Receipt scanning..." for MoneyRequestReport with scanning transactions', async () => {
            const report: Report = {
                ...createRandomReport(0, undefined),
                type: Math.floor(Math.random() * 2) === 1 ? CONST.REPORT.TYPE.IOU : CONST.REPORT.TYPE.EXPENSE,
                transactionCount: 1,
            };
            const scannedTransaction: Transaction = {
                ...createRandomTransaction(2),
                reportID: report.reportID,
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                modifiedMerchant: '',
                amount: 0,
                receipt: {
                    state: CONST.IOU.RECEIPT_STATE.SCANNING,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${scannedTransaction.transactionID}`, scannedTransaction);
            await waitForBatchedUpdates();

            const result = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            const transactions = getReportTransactions(report.reportID);
            const scanningTransactions = transactions.filter((transaction) => isScanning(transaction));
            expect(result).toBe(
                translateLocal('iou.receiptScanning', {
                    count: scanningTransactions.length,
                }),
            );
        });
        it('should NOT leak fraud alert text when user cannot perform write actions', async () => {
            const report: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                permissions: [CONST.REPORT.PERMISSIONS.READ],
                lastMessageText: 'Fraud alert: Sensitive transaction details',
            };
            const fraudAction: ReportAction = {
                ...createRandomReportAction(2),
                actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT,
                message: [
                    {
                        text: 'Sensitive',
                        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                        whisperedTo: [],
                    },
                ],
                originalMessage: {
                    whisperedTo: [],
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [fraudAction.reportActionID]: fraudAction,
            });
            await waitForBatchedUpdates();

            const result = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                report,
                translate: translateLocal,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_EMAIL,
            });
            expect(result).toBe('');
        });

        describe('DEW (Dynamic External Workflow)', () => {
            it('should show queued message for SUBMITTED action with DEW policy when offline and pending submit', async () => {
                const reportID = 'dewReport1';
                const report: Report = {
                    reportID,
                    reportName: 'Test Report',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    policyID: 'dewPolicy1',
                };
                const policy: Policy = {
                    ...POLICY,
                    id: 'dewPolicy1',
                    name: 'Test Policy',
                    type: CONST.POLICY.TYPE.CORPORATE,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
                };
                const submittedAction: ReportAction = {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    created: '2024-01-01 00:00:00',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    message: [{type: 'COMMENT', text: 'submitted'}],
                    originalMessage: {},
                };
                const reportMetadata = {
                    pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.SUBMIT,
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                    [submittedAction.reportActionID]: submittedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    policy,
                    reportMetadata,

                    currentUserLogin: CURRENT_USER_EMAIL,
                });
                expect(lastMessage).toBe(translate(CONST.LOCALES.EN, 'iou.queuedToSubmitViaDEW'));
            });

            it('should show custom error message for DEW_SUBMIT_FAILED action', async () => {
                const reportID = 'dewReport2';
                const report: Report = {
                    reportID,
                    reportName: 'Test Report',
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                const customErrorMessage = 'This report contains an expense missing required fields.';
                const dewSubmitFailedAction: ReportAction = {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    created: '2024-01-01 00:00:00',
                    message: [{type: 'COMMENT', text: customErrorMessage}],
                    originalMessage: {
                        message: customErrorMessage,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                    [dewSubmitFailedAction.reportActionID]: dewSubmitFailedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,

                    currentUserLogin: CURRENT_USER_EMAIL,
                });
                expect(lastMessage).toBe(customErrorMessage);
            });

            it('should show fallback message for DEW_SUBMIT_FAILED action without message', async () => {
                const reportID = 'dewReport3';
                const report: Report = {
                    reportID,
                    reportName: 'Test Report',
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                const dewSubmitFailedAction: ReportAction = {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    created: '2024-01-01 00:00:00',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                    [dewSubmitFailedAction.reportActionID]: dewSubmitFailedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,

                    currentUserLogin: CURRENT_USER_EMAIL,
                });
                expect(lastMessage).toBe(translate(CONST.LOCALES.EN, 'iou.error.genericCreateFailureMessage'));
            });
        });

        describe('archived report with policy', () => {
            it('should use the passed policy name for POLICY_DELETED archive reason', async () => {
                const testPolicyID = 'archivePolicyTest';
                const policy: Policy = {
                    ...POLICY,
                    id: testPolicyID,
                    name: 'Test Workspace',
                    type: CONST.POLICY.TYPE.TEAM,
                };
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    policyID: testPolicyID,
                    type: CONST.REPORT.TYPE.CHAT,
                };
                const closedAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
                    originalMessage: {
                        policyName: policy.name,
                        reason: CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED,
                    },
                } as ReportAction;
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [closedAction.reportActionID]: closedAction,
                });

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy,
                    isReportArchived: true,

                    currentUserLogin: '',
                });

                expect(lastMessage).toBe(translateLocal('reportArchiveReasons.policyDeleted', {policyName: policy.name}));
            });

            it('should use the passed policy name for REMOVED_FROM_POLICY archive reason', async () => {
                const testPolicyID = 'archivePolicyTest2';
                const policy: Policy = {
                    ...POLICY,
                    id: testPolicyID,
                    name: 'My Workspace',
                    type: CONST.POLICY.TYPE.TEAM,
                };
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    policyID: testPolicyID,
                    type: CONST.REPORT.TYPE.CHAT,
                };
                const closedAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
                    originalMessage: {
                        policyName: policy.name,
                        reason: CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY,
                    },
                } as ReportAction;
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [closedAction.reportActionID]: closedAction,
                });

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy,
                    isReportArchived: true,

                    currentUserLogin: '',
                });

                expect(lastMessage).toBe(translateLocal('reportArchiveReasons.removedFromPolicy', {displayName: 'Hidden', policyName: policy.name}));
            });

            it('resolves the workspace-unavailable fallback through the provided translate function when the archived policy is unavailable', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    type: CONST.REPORT.TYPE.CHAT,
                    // No resolvable policy, so the archived preview name falls back to the unavailable label.
                    policyID: 'missing-archive-policy',
                    policyName: undefined,
                    reportName: undefined,
                };
                const closedAction = createMock<ReportAction>({
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
                    originalMessage: {
                        reason: CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY,
                    },
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [closedAction.reportActionID]: closedAction,
                });
                const translateWithUnavailableMarker: LocalizedTranslate = (path, ...parameters) =>
                    path === 'workspace.common.unavailable' ? 'UnavailableMarker' : translateLocal(path, ...parameters);

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    personalDetails: undefined,
                    translate: translateWithUnavailableMarker,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: true,

                    currentUserLogin: '',
                });

                expect(lastMessage).toContain('UnavailableMarker');
            });
        });
        describe('UPDATE_CATEGORY_TAX_RATE action', () => {
            it('should surface the rendered category default tax rate change in the last-message preview', async () => {
                const report: Report = createRandomReport(0, undefined);
                const changelogAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY_TAX_RATE,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        categoryName: 'Office Supplies',
                        oldTaxName: 'Tax Exempt',
                        oldTaxPercentage: '0%',
                        newTaxName: 'Tax Rate 1',
                        newTaxPercentage: '5%',
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [changelogAction.reportActionID]: changelogAction,
                });

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    personalDetails: undefined,
                    isReportArchived: false,
                    currentUserLogin: CURRENT_USER_EMAIL,
                });

                expect(lastMessage).toBe('changed the "Office Supplies" category default tax rate to "Tax Rate 1 (5%)" (previously "Tax Exempt (0%)")');
            });
        });

        describe('UPDATE_MCC_GROUP_CATEGORY action', () => {
            it('should surface the friendly MCC group label in the last-message preview', async () => {
                const report: Report = createRandomReport(0, undefined);
                const changelogAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MCC_GROUP_CATEGORY,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        mccGroupName: 'Airlines',
                        oldCategory: 'Insurance',
                        newCategory: 'Travel',
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [changelogAction.reportActionID]: changelogAction,
                });

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,
                    currentUserLogin: CURRENT_USER_EMAIL,
                });

                expect(lastMessage).toBe('changed the default spend category for "Airlines" to "Travel" (previously "Insurance")');
            });
        });
    });

    describe('getPersonalDetailSearchTerms', () => {
        it('should include display name', () => {
            const displayName = 'test';
            const searchTerms = getPersonalDetailSearchTerms({displayName}, CURRENT_USER_ACCOUNT_ID);
            expect(searchTerms.includes(displayName)).toBe(true);
            const searchTerms2 = getPersonalDetailSearchTerms({participantsList: [{displayName, accountID: 123}]}, CURRENT_USER_ACCOUNT_ID);
            expect(searchTerms2.includes(displayName)).toBe(true);
        });
    });

    describe('getCurrentUserSearchTerms', () => {
        it('should include display name', () => {
            const displayName = 'test';
            const searchTerms = getCurrentUserSearchTerms({displayName});
            expect(searchTerms.includes(displayName)).toBe(true);
            const searchTerms2 = getCurrentUserSearchTerms({text: displayName});
            expect(searchTerms2.includes(displayName)).toBe(true);
        });
    });

    describe('getLastActorDisplayNameFromLastVisibleActions', () => {
        beforeEach(() => {
            renderLocaleContextProvider();
        });

        it('should return display name from lastActorDetails when no last visible action exists', () => {
            // Given a report with no last visible action and lastActorDetails
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID: 'test-report-1',
            };
            const lastActorDetails: Partial<PersonalDetails> = {
                accountID: 3,
                displayName: 'Spider-Man',
                login: 'peterparker@expensify.com',
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            // When we call getLastActorDisplayNameFromLastVisibleActions
            const result = getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, CURRENT_USER_ACCOUNT_ID, personalDetails, undefined, translateLocal);

            // Then it should return the display name from lastActorDetails
            expect(result).toBe('Spider-Man');
        });

        it('should return display name from personalDetails when last visible action exists and actor is found in personalDetails', async () => {
            // Given a report with a last visible action
            const reportID = 'test-report-2';
            const actorAccountID = 3;
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID,
                lastActorAccountID: actorAccountID,
            };
            const lastActorDetails: Partial<PersonalDetails> = {
                accountID: 1,
                displayName: 'Mister Fantastic',
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            const reportAction: ReportAction = {
                ...createRandomReportAction(actorAccountID),
                reportActionID: 'action-1',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                actorAccountID,
                created: DateUtils.getDBTime(),
                message: [
                    {
                        type: 'COMMENT',
                        text: 'Test message',
                        html: 'Test message',
                        isEdited: false,
                        isDeletedParentAction: false,
                        whisperedTo: [],
                    },
                ],
                shouldShow: true,
                pendingAction: null,
            };

            // Set up the report and report action in Onyx so it gets picked up by lastVisibleReportActions
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [reportAction.reportActionID]: reportAction,
            });
            await waitForBatchedUpdates();

            // When we call getLastActorDisplayNameFromLastVisibleActions
            const result = getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, CURRENT_USER_ACCOUNT_ID, personalDetails, undefined, translateLocal);

            // Then it should return the display name from personalDetails for the actor
            expect(result).toBe('Spider-Man');
        });

        it('should return display name from reportAction.person when actor is not found in personalDetails', async () => {
            // Given a report with a last visible action where actor is not in personalDetails
            const reportID = 'test-report-3';
            const actorAccountID = 999;
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID,
                lastActorAccountID: actorAccountID,
            };
            const lastActorDetails: Partial<PersonalDetails> = {
                accountID: 1,
                displayName: 'Mister Fantastic',
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            const reportAction: ReportAction = {
                ...createRandomReportAction(actorAccountID),
                reportActionID: 'action-2',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                actorAccountID,
                created: DateUtils.getDBTime(),
                message: [
                    {
                        type: 'COMMENT',
                        text: 'Test message',
                        html: 'Test message',
                        isEdited: false,
                        isDeletedParentAction: false,
                        whisperedTo: [],
                    },
                ],
                shouldShow: true,
                pendingAction: null,
                person: [{text: 'Unknown User', type: 'TEXT'}],
            };

            // Set up the report and report action in Onyx
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [reportAction.reportActionID]: reportAction,
            });
            await waitForBatchedUpdates();

            // When we call getLastActorDisplayNameFromLastVisibleActions
            const result = getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, CURRENT_USER_ACCOUNT_ID, personalDetails, undefined, translateLocal);

            // Then it should return the display name from reportAction.person
            expect(result).toBe('Unknown User');
        });

        it('should return "You" when the last actor is the current user', async () => {
            // Given a report with current user as the last actor
            const reportID = 'test-report-4';
            const currentUserAccountID = 2; // Iron Man
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID,
                lastActorAccountID: currentUserAccountID,
            };
            const lastActorDetails: Partial<PersonalDetails> = {
                accountID: 1,
                displayName: 'Mister Fantastic',
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            const reportAction: ReportAction = {
                ...createRandomReportAction(currentUserAccountID),
                reportActionID: 'action-3',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                actorAccountID: currentUserAccountID,
                created: DateUtils.getDBTime(),
                message: [
                    {
                        type: 'COMMENT',
                        text: 'Test message',
                        html: 'Test message',
                        isEdited: false,
                        isDeletedParentAction: false,
                        whisperedTo: [],
                    },
                ],
                shouldShow: true,
                pendingAction: null,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [reportAction.reportActionID]: reportAction,
            });
            await waitForBatchedUpdates();

            // When we call getLastActorDisplayNameFromLastVisibleActions
            const result = getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, currentUserAccountID, personalDetails, undefined, translateLocal);

            // Then it should return "You" for the current user
            expect(result).toBe('You');
        });

        it('should fall back to lastActorDetails when last visible action exists but actor cannot be determined', async () => {
            // Given a report with a last visible action but no actor account ID
            const reportID = 'test-report-5';
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID,
            };
            const lastActorDetails: Partial<PersonalDetails> = {
                accountID: 3,
                displayName: 'Spider-Man',
                firstName: 'Spider',
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                reportActionID: 'action-4',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                actorAccountID: undefined,
                created: DateUtils.getDBTime(),
                message: [
                    {
                        type: 'COMMENT',
                        text: 'Test message',
                        html: 'Test message',
                        isEdited: false,
                        isDeletedParentAction: false,
                        whisperedTo: [],
                    },
                ],
                shouldShow: true,
                pendingAction: null,
                person: [], // Ensure person array is empty so it doesn't create actorDetails from person
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [reportAction.reportActionID]: reportAction,
            });
            await waitForBatchedUpdates();

            // When we call getLastActorDisplayNameFromLastVisibleActions
            const result = getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, 0, personalDetails, undefined, translateLocal);

            // Then it should fall back to lastActorDetails
            // getLastActorDisplayName returns firstName if available, otherwise formatPhoneNumberPhoneUtils(getDisplayNameOrDefault(...))
            expect(result).toBe('Spider');
        });

        it('should use privateIsArchived string to determine archived status', () => {
            // Given a report with no last visible action and lastActorDetails
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID: 'test-report-archived',
            };
            const lastActorDetails: Partial<PersonalDetails> = {
                accountID: 3,
                displayName: 'Spider-Man',
                login: 'peterparker@expensify.com',
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            // When we pass true for privateIsArchived (archived report)
            const privateIsArchived = true;
            const result = getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, CURRENT_USER_ACCOUNT_ID, personalDetails, privateIsArchived, translateLocal);

            // Then it should still return the display name from lastActorDetails since there's no last visible action
            expect(result).toBe('Spider-Man');
        });
    });

    describe('getReportDisplayOption', () => {
        beforeEach(() => {
            renderLocaleContextProvider();
        });

        it('should return option with isSelfDM alternateText when report is a self DM', () => {
            // Given a self DM report
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID: 'self-dm-1',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                participants: {
                    2: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            // When we call getReportDisplayOption
            const result = getReportDisplayOption({
                dateFnsLocale: undefined,
                report,
                unknownUserDetails: undefined,
                personalDetails,
                privateIsArchived: undefined,
                policy: undefined,
                conciergeReportID: undefined,
                translate: translateLocal,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            });

            // Then it should return an option with isSelfDM and alternateText set
            expect(result.isSelfDM).toBe(true);
            expect(result.alternateText).toBe(translateLocal('reportActionsView.yourSpace'));
            expect(result.isDisabled).toBe(true);
            expect(result.isSelected).toBe(false);
        });

        it('should return option with invoice room text and alternateText when report is an invoice room', () => {
            // Given an invoice room report
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID: 'invoice-room-1',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            // When we call getReportDisplayOption
            const result = getReportDisplayOption({
                dateFnsLocale: undefined,
                report,
                unknownUserDetails: undefined,
                personalDetails,
                privateIsArchived: undefined,
                policy: undefined,
                conciergeReportID: undefined,
                translate: translateLocal,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            });

            // Then it should return an option with invoice room text and alternateText
            expect(result.isInvoiceRoom).toBe(true);
            expect(result.alternateText).toBe(translateLocal('workspace.common.invoices'));
            expect(result.isDisabled).toBe(true);
        });

        it('should return option with unknownUserDetails when provided', () => {
            // Given a report with unknown user details
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID: 'unknown-user-1',
            };
            const unknownUserDetails = {
                accountID: 999,
                login: 'unknown@expensify.com',
                text: 'Unknown User',
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            // When we call getReportDisplayOption
            const result = getReportDisplayOption({
                dateFnsLocale: undefined,
                report,
                unknownUserDetails,
                personalDetails,
                privateIsArchived: undefined,
                policy: undefined,
                conciergeReportID: undefined,
                translate: translateLocal,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            });

            // Then it should return an option with unknownUserDetails data
            expect(result.text).toBe('Unknown User');
            expect(result.alternateText).toBe('unknown@expensify.com');
            expect(result.participantsList).toBeDefined();
            expect(result.participantsList?.at(0)?.accountID).toBe(999);
            expect(result.isDisabled).toBe(true);
        });

        it('should return option with workspace name when report has ownerAccountID', () => {
            // Given a workspace report
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID: 'workspace-1',
                ownerAccountID: 1,
                policyID,
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            // When we call getReportDisplayOption
            const result = getReportDisplayOption({
                dateFnsLocale: undefined,
                report,
                unknownUserDetails: undefined,
                personalDetails,
                privateIsArchived: undefined,
                policy: undefined,
                conciergeReportID: undefined,
                translate: translateLocal,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            });

            // Then it should return an option with workspace name
            expect(result.text).toBe(POLICY.name);
            expect(result.alternateText).toBe(translateLocal('workspace.common.workspace'));
            expect(result.isDisabled).toBe(true);
        });

        it('should use personalDetails parameter instead of Onyx.connect data', () => {
            // Given a report with participants
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID: 'test-personal-details-1',
                participants: {
                    3: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };
            // Use a modified personalDetails that differs from what's in Onyx
            const customPersonalDetails: PersonalDetailsList = {
                ...PERSONAL_DETAILS,
                3: {
                    ...PERSONAL_DETAILS['3'],
                    displayName: 'Custom Spider-Man Name',
                },
            };

            // When we call getReportDisplayOption with custom personalDetails
            const result = getReportDisplayOption({
                dateFnsLocale: undefined,
                report,
                unknownUserDetails: undefined,
                personalDetails: customPersonalDetails,
                privateIsArchived: undefined,
                policy: undefined,
                conciergeReportID: undefined,
                translate: translateLocal,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            });

            // Then it should use the custom personalDetails parameter
            expect(result).toBeDefined();
            expect(result.isDisabled).toBe(true);
            expect(result.isSelected).toBe(false);
        });

        it('should handle empty personalDetails gracefully', () => {
            // Given a report with empty personalDetails
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID: 'test-empty-details-1',
            };
            const emptyPersonalDetails: PersonalDetailsList = {};

            // When we call getReportDisplayOption
            const result = getReportDisplayOption({
                dateFnsLocale: undefined,
                report,
                unknownUserDetails: undefined,
                personalDetails: emptyPersonalDetails,
                privateIsArchived: undefined,
                policy: undefined,
                conciergeReportID: undefined,
                translate: translateLocal,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            });

            // Then it should not throw and return a valid option
            expect(result).toBeDefined();
            expect(result.isDisabled).toBe(true);
        });

        it('should handle undefined report gracefully', () => {
            // Given an undefined report
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            // When we call getReportDisplayOption with undefined report
            const result = getReportDisplayOption({
                dateFnsLocale: undefined,
                report: undefined,
                unknownUserDetails: undefined,
                personalDetails,
                privateIsArchived: undefined,
                policy: undefined,
                conciergeReportID: undefined,
                translate: translateLocal,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            });

            // Then it should return a valid option (createOption handles undefined)
            expect(result).toBeDefined();
            expect(result.isDisabled).toBe(true);
        });
    });

    describe('getValidOptions with policies parameter', () => {
        it('should accept policies collection as second parameter', () => {
            const policy: Policy = {
                id: 'test-policy',
                name: 'Test Policy',
                role: 'admin',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                outputCurrency: 'USD',
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                areCategoriesEnabled: true,
            };

            const policies = {
                [`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy,
            };

            // Test that getValidOptions accepts policies collection as second parameter
            const {options: results} = getValidOptions(
                {reports: [], personalDetails: []},
                policies,
                undefined,
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );

            expect(results).toBeDefined();
            expect(results.recentReports).toBeDefined();
            expect(results.personalDetails).toBeDefined();
        });

        it('should work with undefined policies', () => {
            const options = {reports: [], personalDetails: []};
            const {options: results} = getValidOptions(
                options,
                undefined,
                undefined,
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );

            expect(results).toBeDefined();
            expect(results.recentReports).toBeDefined();
            expect(results.personalDetails).toBeDefined();
        });

        it('should work with empty policies collection', () => {
            const options = {reports: [], personalDetails: []};
            const {options: results} = getValidOptions(options, {}, undefined, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, undefined, {dateFnsLocale: undefined}, translateLocal);

            expect(results).toBeDefined();
            expect(results.recentReports).toBeDefined();
            expect(results.personalDetails).toBeDefined();
        });

        it('should pass policies to filtering logic', () => {
            const testPolicyID = 'test-policy-123';
            const policy: Policy = {
                id: testPolicyID,
                name: 'Test Workspace',
                role: 'admin',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                outputCurrency: 'USD',
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                areCategoriesEnabled: true,
            };

            const policies = {
                [`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`]: policy,
            };

            // Verify function works with policies parameter
            const {options: results} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                policies,
                undefined,
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, betas: [], includeRecentReports: true, sortedActions: undefined},
                translateLocal,
            );

            expect(results.recentReports).toBeDefined();
            expect(Array.isArray(results.recentReports)).toBe(true);
        });
    });

    describe('getReportOption', () => {
        it('should return option with correct workspace name when policy is provided', async () => {
            const reportID = '101';
            const testPolicyID = 'policy123';
            const policy: Policy = {
                id: testPolicyID,
                name: 'Test Workspace',
                role: 'admin',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                outputCurrency: 'USD',
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
            };
            const report: Report = {
                reportID,
                reportName: 'Test Report',
                type: CONST.REPORT.TYPE.CHAT,
                policyID: testPolicyID,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
            };

            const option = getReportOption(participant, undefined, policy, {}, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option.text).toBe('Test Workspace');
            expect(option.alternateText).toBe(translateLocal('workspace.common.workspace'));
            expect(option.isSelected).toBe(undefined);
        });

        it('should title a self DM with "<display name> (you)" even when the derived report name is empty', async () => {
            // The report-attributes derivation has not populated the self DM's name yet on a cold load, so the option
            // has to resolve the title itself instead of rendering only the "Your space" subtitle. See #96559.
            const reportID = '109';
            const ownerAccountID = 7777;
            const report: Report = {
                reportID,
                reportName: '',
                ownerAccountID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                // A self DM's own participant entry is excluded from the display list (the backend sends an empty
                // notificationPreference, which isHiddenForCurrentUser treats the same as HIDDEN), so createOption has
                // no personal details to build a name from and has to fall back to the report name.
                participants: {[ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN}},
            };
            const selfPersonalDetails = {
                [ownerAccountID]: {accountID: ownerAccountID, displayName: 'Test', login: 'test@test.com'},
            };

            await Onyx.merge(ONYXKEYS.SESSION, {accountID: ownerAccountID, email: 'test@test.com'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const option = getReportOption({reportID}, undefined, undefined, selfPersonalDetails, undefined, undefined, undefined, ownerAccountID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option.text).toBe(`Test (${translateLocal('common.you').toLowerCase()})`);
            expect(option.alternateText).toBe(translateLocal('reportActionsView.yourSpace'));
        });

        it('should show submits to info when policy has approval workflow', async () => {
            const reportID = '102';
            const testPolicyID = 'policy124';
            const ownerAccountID = 8888;
            const approverAccountID = 9999;
            const policy: Policy = {
                id: testPolicyID,
                name: 'Test Workspace with Submit',
                role: 'user',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                outputCurrency: 'USD',
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            };
            const report: Report = {
                reportID,
                reportName: 'Test Report',
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: testPolicyID,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                ownerAccountID,
            };

            const personalDetails = {
                [ownerAccountID]: {
                    accountID: ownerAccountID,
                    displayName: 'Report Owner',
                    login: 'owner@test.com',
                },
                [approverAccountID]: {
                    accountID: approverAccountID,
                    displayName: 'John Manager',
                    login: 'manager@test.com',
                },
            };

            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
            };

            // Pass the real personalDetails so the submits-to subtitle resolves to a name
            const option = getReportOption(participant, undefined, policy, personalDetails, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option.text).toBe('Test Workspace with Submit');
            // For a BASIC-approval policy the report submits to the default approver (the owner),
            // so the subtitle is produced by the injected translate via the `iou.submitsTo` copy
            expect(option.alternateText).toBe(translateLocal('iou.submitsTo', 'Report Owner'));
        });

        it('should mark draft reports as disabled', async () => {
            const reportID = '103';
            const report: Report = {
                reportID,
                reportName: 'Draft Report',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
            };

            const option = getReportOption(participant, undefined, POLICY, {}, undefined, undefined, report, CONST.DEFAULT_NUMBER_ID, {translate: translateLocal, dateFnsLocale: undefined});

            expect(option.isDisabled).toBe(true);
        });

        it('should handle self DM reports correctly', async () => {
            const reportID = '104';
            const currentUserAccountID = 1;
            const report: Report = {
                reportID,
                reportName: 'My Space',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                participants: {
                    [currentUserAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const personalDetails = {
                [currentUserAccountID]: {
                    accountID: currentUserAccountID,
                    displayName: 'Current User',
                    login: 'currentuser@test.com',
                },
            };

            await Onyx.merge(ONYXKEYS.SESSION, {
                accountID: currentUserAccountID,
                email: 'currentuser@test.com',
            });
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                isSelfDM: true,
            };

            const option = getReportOption(participant, undefined, POLICY, personalDetails, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            // The option.isSelfDM is set by createOption based on the report type
            // Just verify the alternateText is correct for self DM
            if (option.isSelfDM) {
                expect(option.alternateText).toBe(translateLocal('reportActionsView.yourSpace'));
            } else {
                // If not detected as selfDM, just ensure option was created
                expect(option).toBeDefined();
            }
        });

        it('should handle invoice rooms correctly', async () => {
            const reportID = '105';
            const testPolicyID = 'policy125';
            const report: Report = {
                reportID,
                reportName: 'Invoice Room',
                type: CONST.REPORT.TYPE.INVOICE,
                policyID: testPolicyID,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                invoiceReceiver: {
                    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                    accountID: 1,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                isInvoiceRoom: true,
            };

            const option = getReportOption(participant, undefined, POLICY, {}, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option.isInvoiceRoom).toBe(true);
            expect(option.alternateText).toBe(translateLocal('workspace.common.invoices'));
        });

        it('should return option with correct text for workspace chat', async () => {
            const workspaceReport: Report = {
                lastReadTime: '2021-01-14 11:25:39.302',
                lastVisibleActionCreated: '2022-11-22 03:26:02.022',
                isPinned: false,
                reportID: '18',
                participants: {
                    2: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
                reportName: '',
                policyID,
                policyName: POLICY.name,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                isOwnPolicyExpenseChat: true,
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}18`, workspaceReport);
            await waitForBatchedUpdates();

            const participant: Participant = {
                reportID: '18',
                selected: false,
            };

            let reportNameValuePair: OnyxEntry<ReportNameValuePairs>;
            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${participant.reportID}`,
                callback: (value) => {
                    reportNameValuePair = value;
                },
            });
            await waitForBatchedUpdates();

            const option = getReportOption(participant, !!reportNameValuePair?.private_isArchived, POLICY, {}, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option.text).toBe(POLICY.name);
            expect(option.alternateText).toBeTruthy();
            expect(option.alternateText === translateLocal('workspace.common.workspace') || option.alternateText?.includes('Submits to')).toBe(true);
        });

        it('should handle draft reports', async () => {
            const draftReport: Report = {
                lastReadTime: '2021-01-14 11:25:39.302',
                lastVisibleActionCreated: '2022-11-22 03:26:02.022',
                isPinned: false,
                reportID: '19',
                participants: {
                    2: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    3: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
                reportName: 'Draft Report',
                type: CONST.REPORT.TYPE.CHAT,
                writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ADMINS,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}19`, draftReport);
            await waitForBatchedUpdates();

            const participant: Participant = {
                reportID: '19',
                selected: false,
            };

            let reportNameValuePair: OnyxEntry<ReportNameValuePairs>;
            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${participant.reportID}`,
                callback: (value) => {
                    reportNameValuePair = value;
                },
            });
            await waitForBatchedUpdates();

            const option = getReportOption(participant, !!reportNameValuePair?.private_isArchived, POLICY, {}, undefined, {}, draftReport, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option.isDisabled).toBe(true);
        });

        it('should not disable option when reportDraft is undefined for a regular report', async () => {
            const reportID = '200';
            const report: Report = {
                reportID,
                reportName: 'Regular Report',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant: Participant = {reportID, selected: false};

            // Pass reportDraft = undefined → not a draft, should NOT be disabled
            const option = getReportOption(participant, undefined, POLICY, {}, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option.isDisabled).toBeFalsy();
        });

        it('should disable option when reportDraft is explicitly passed', async () => {
            const reportID = '201';
            const draftReport: Report = {
                reportID,
                reportName: 'Explicit Draft Report',
                type: CONST.REPORT.TYPE.CHAT,
            };

            const participant: Participant = {reportID, selected: false};

            // Pass reportDraft explicitly → should be disabled regardless of Onyx state
            const option = getReportOption(participant, undefined, POLICY, {}, undefined, undefined, draftReport, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option.isDisabled).toBe(true);
        });

        it('should not disable option when reportDraft param is undefined even if report exists in REPORT_DRAFT', async () => {
            const reportID = '202';
            const draftReport: Report = {
                reportID,
                reportName: 'Global Draft Report',
                type: CONST.REPORT.TYPE.CHAT,
            };

            // Draft exists in Onyx but is NOT passed as param
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`, draftReport);
            await waitForBatchedUpdates();

            const participant: Participant = {reportID, selected: false};

            // Callers are responsible for passing reportDraft explicitly — undefined means not disabled
            const option = getReportOption(participant, undefined, POLICY, {}, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option.isDisabled).toBeFalsy();
        });
    });

    describe('getReportDisplayOption', () => {
        it('should use reportNameValuePair parameter for archived reports', async () => {
            const reportID = '23';
            const report: Report = {
                ...createRegularChat(Number(reportID), [2, 7]),
                reportID,
                lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            };

            const reportNameValuePair: ReportNameValuePairs = {
                private_isArchived: DateUtils.getDBTime(),
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const option = getReportDisplayOption({
                dateFnsLocale: undefined,
                report,
                unknownUserDetails: undefined,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: !!reportNameValuePair?.private_isArchived,
                policy: undefined,
                conciergeReportID: undefined,
                translate: translateLocal,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            });

            expect(option).toBeDefined();
            expect(option.reportID).toBe(reportID);
            expect(option.private_isArchived).toBeDefined();
            expect(option?.private_isArchived).toBe(true);
            expect(option.isDisabled).toBe(true);
            expect(option.isSelected).toBe(false);
        });

        it('should use reportNameValuePair parameter for non-archived reports', async () => {
            const reportID = '24';
            const report: Report = {
                ...createRegularChat(Number(reportID), [2, 7]),
                reportID,
                lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            };

            const reportNameValuePair: ReportNameValuePairs = {};

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const option = getReportDisplayOption({
                dateFnsLocale: undefined,
                report,
                unknownUserDetails: undefined,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: !!reportNameValuePair?.private_isArchived,
                policy: undefined,
                conciergeReportID: undefined,
                translate: translateLocal,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            });

            expect(option).toBeDefined();
            expect(option.reportID).toBe(reportID);
            expect(option.private_isArchived).toBe(false);
            expect(option.isDisabled).toBe(true);
            expect(option.isSelected).toBe(false);
        });

        it('should handle undefined reportNameValuePair', async () => {
            const reportID = '25';
            const report: Report = {
                ...createRegularChat(Number(reportID), [2, 7]),
                reportID,
                lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const option = getReportDisplayOption({
                dateFnsLocale: undefined,
                report,
                unknownUserDetails: undefined,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: undefined,
                policy: undefined,
                conciergeReportID: undefined,
                translate: translateLocal,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            });

            expect(option).toBeDefined();
            expect(option.reportID).toBe(reportID);
            expect(option.isDisabled).toBe(true);
            expect(option.isSelected).toBe(false);
        });

        it('should use reportNameValuePair for invoice room reports', async () => {
            const reportID = '26';
            const report: Report = {
                ...createRegularChat(Number(reportID), [2, 7]),
                reportID,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            };

            const reportNameValuePair: ReportNameValuePairs = {
                private_isArchived: DateUtils.getDBTime(),
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const option = getReportDisplayOption({
                dateFnsLocale: undefined,
                report,
                unknownUserDetails: undefined,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: !!reportNameValuePair?.private_isArchived,
                policy: undefined,
                conciergeReportID: undefined,
                translate: translateLocal,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            });

            expect(option).toBeDefined();
            expect(option.reportID).toBe(reportID);
            expect(option.isInvoiceRoom).toBe(true);
            expect(option.private_isArchived).toBeDefined();
            expect(option.private_isArchived).toBe(true);
        });

        it('should use reportNameValuePair for self DM reports', async () => {
            const reportID = '27';
            const report: Report = {
                ...createRegularChat(Number(reportID), [2]),
                reportID,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                ownerAccountID: 2,
                lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            };

            const reportNameValuePair: ReportNameValuePairs = {};

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const option = getReportDisplayOption({
                dateFnsLocale: undefined,
                report,
                unknownUserDetails: undefined,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: !!reportNameValuePair?.private_isArchived,
                policy: undefined,
                conciergeReportID: undefined,
                translate: translateLocal,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            });

            expect(option).toBeDefined();
            expect(option.reportID).toBe(reportID);
            expect(option.isSelfDM).toBe(true);
        });

        it('should preserve selected state from participant', async () => {
            const reportID = '106';
            const report: Report = {
                reportID,
                reportName: 'Selected Report',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                selected: true,
            };

            const option = getReportOption(participant, undefined, POLICY, {}, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option.isSelected).toBe(true);
            expect(option.selected).toBe(true);
        });

        it('should handle policy parameter being null', async () => {
            const reportID = '107';
            const report: Report = {
                reportID,
                reportName: 'Test Report',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
            };

            const option = getReportOption(participant, undefined, undefined, {}, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option).toBeDefined();
            expect(option.text).toBeDefined();
        });

        it('should handle reportAttributesDerived parameter', async () => {
            const reportID = '108';
            const report: Report = {
                reportID,
                reportName: 'Test Report',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
            };

            // Test that the function works with reportAttributesDerived parameter (optional)
            const option = getReportOption(participant, undefined, POLICY, {}, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option).toBeDefined();
        });

        it('should use personalDetails to populate participant display names', async () => {
            const reportID = '109';
            const participantAccountID = 12345;
            const report: Report = {
                reportID,
                reportName: 'Test Chat',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [participantAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const testPersonalDetails = {
                [participantAccountID]: {
                    accountID: participantAccountID,
                    displayName: 'Test User Display Name',
                    login: 'testuser@example.com',
                    firstName: 'Test',
                    lastName: 'User',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
            };

            const option = getReportOption(participant, undefined, POLICY, testPersonalDetails, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option).toBeDefined();
            // The createOption function uses personalDetails to build display names
            // Verify that option was created successfully with the personalDetails
            expect(option.participantsList).toBeDefined();
        });

        it('should show submits to info using personalDetails when policy has approval workflow', async () => {
            const reportID = '110';
            const testPolicyID = 'policy_with_submits_to';
            const submitterAccountID = 100;
            const approverAccountID = 200;

            const report: Report = {
                reportID,
                reportName: 'Test Workspace',
                type: CONST.REPORT.TYPE.EXPENSE,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID: submitterAccountID,
                participants: {
                    [submitterAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const policy: Policy = {
                id: testPolicyID,
                name: 'Test Workspace with Approver',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                role: 'user',
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                outputCurrency: 'USD',
            };

            // PersonalDetails with the approver's information
            const testPersonalDetails = {
                [submitterAccountID]: {
                    accountID: submitterAccountID,
                    displayName: 'Submitter Name',
                    login: 'submitter@test.com',
                },
                [approverAccountID]: {
                    accountID: approverAccountID,
                    displayName: 'Approver Manager',
                    login: 'approver@test.com',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
            };

            const option = getReportOption(participant, undefined, policy, testPersonalDetails, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option).toBeDefined();
            expect(option.text).toBe('Test Workspace with Approver');
            // The alternateText should include "Submits to" with the approver's name from personalDetails
            // Note: This depends on the policy approval mode and workflow configuration
            expect(option.alternateText).toBeDefined();
        });

        it('should fall back gracefully when personalDetails is empty', async () => {
            const reportID = '111';
            const report: Report = {
                reportID,
                reportName: 'Test Report Empty PD',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
            };

            // Pass empty personalDetails
            const option = getReportOption(participant, undefined, POLICY, {}, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option).toBeDefined();
            expect(option.text).toBeDefined();
        });

        it('should fall back gracefully when personalDetails is undefined', async () => {
            const reportID = '112';
            const report: Report = {
                reportID,
                reportName: 'Test Report Undefined PD',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
            };

            // Pass undefined personalDetails
            const option = getReportOption(participant, undefined, POLICY, undefined, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option).toBeDefined();
            expect(option.text).toBeDefined();
        });

        it('should use personalDetails for invoice room report name', async () => {
            const reportID = '113';
            const senderAccountID = 300;
            const receiverAccountID = 400;
            const report: Report = {
                reportID,
                reportName: 'Invoice Room',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                invoiceReceiver: {
                    type: 'individual',
                    accountID: receiverAccountID,
                },
                participants: {
                    [senderAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    [receiverAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const testPersonalDetails = {
                [senderAccountID]: {
                    accountID: senderAccountID,
                    displayName: 'Invoice Sender',
                    login: 'sender@test.com',
                },
                [receiverAccountID]: {
                    accountID: receiverAccountID,
                    displayName: 'Invoice Receiver',
                    login: 'receiver@test.com',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                isInvoiceRoom: true,
            };

            const option = getReportOption(participant, undefined, POLICY, testPersonalDetails, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option).toBeDefined();
            expect(option.isInvoiceRoom).toBe(true);
            // personalDetails is used in computeReportName for invoice rooms
            expect(option.text).toBeDefined();
        });

        it('should accept conciergeReportID and create a valid option', async () => {
            const reportID = '114';
            const conciergeReportID = '999';
            const report: Report = {
                reportID,
                reportName: 'Test Report',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {reportID};

            const option = getReportOption(participant, undefined, POLICY, {}, conciergeReportID, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option).toBeDefined();
            expect(option.reportID).toBe(reportID);
        });

        it('should accept undefined conciergeReportID without breaking option creation', async () => {
            const reportID = '115';
            const report: Report = {
                reportID,
                reportName: 'Test Report',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {reportID};

            const option = getReportOption(participant, undefined, POLICY, {}, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option).toBeDefined();
            expect(option.reportID).toBe(reportID);
        });

        it('should use Concierge display name in lastMessageText when conciergeReportID matches a referenced report', async () => {
            const reportID = '116';
            const conciergeReportID = reportID;
            const participantAccountID = 12345;
            const report: Report = {
                reportID,
                reportName: 'Test Chat',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [participantAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const testPersonalDetails = {
                [participantAccountID]: {
                    accountID: participantAccountID,
                    displayName: 'Some User',
                    login: 'user@test.com',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, testPersonalDetails);
            await waitForBatchedUpdates();

            const participant = {reportID};

            // Passing conciergeReportID matching the reportID identifies this as the Concierge chat,
            // which affects getMovedTransactionMessage to use CONST.CONCIERGE_DISPLAY_NAME ('Concierge')
            const option = getReportOption(participant, undefined, POLICY, testPersonalDetails, conciergeReportID, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            expect(option).toBeDefined();
            expect(option.reportID).toBe(reportID);
        });

        it('should not treat report as concierge chat when conciergeReportID does not match reportID', async () => {
            const reportID = '117';
            const differentConciergeReportID = '9999';
            const report: Report = {
                reportID,
                reportName: 'Regular Chat',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {reportID};

            const optionWithConcierge = getReportOption(participant, undefined, POLICY, {}, differentConciergeReportID, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });
            const optionWithoutConcierge = getReportOption(participant, undefined, POLICY, {}, undefined, undefined, undefined, CONST.DEFAULT_NUMBER_ID, {
                translate: translateLocal,
                dateFnsLocale: undefined,
            });

            // Both should produce the same result since the IDs don't match
            expect(optionWithConcierge.reportID).toBe(optionWithoutConcierge.reportID);
            expect(optionWithConcierge.text).toBe(optionWithoutConcierge.text);
        });
    });

    describe('getPolicyExpenseReportOption', () => {
        it('should return option with policy expense chat details', async () => {
            const reportID = '201';
            const testPolicyID = 'policy201';
            const ownerAccountID = 1001;

            const report: Report = {
                reportID,
                reportName: 'Test Policy Expense',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID,
                participants: {
                    [ownerAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const policy: Policy = {
                id: testPolicyID,
                name: 'Test Workspace Policy',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                role: 'user',
                outputCurrency: 'USD',
            };

            const testPersonalDetails = {
                [ownerAccountID]: {
                    accountID: ownerAccountID,
                    displayName: 'Policy Owner',
                    login: 'owner@test.com',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, testPersonalDetails);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
                selected: true,
            };

            const option = getPolicyExpenseReportOption(
                participant,
                undefined,
                testPersonalDetails,
                report,
                undefined,
                {translate: translateLocal, dateFnsLocale: undefined},
                CURRENT_USER_ACCOUNT_ID,
            );

            expect(option).toBeDefined();
            expect(option.text).toBe('Test Workspace Policy');
            expect(option.alternateText).toBe(translateLocal('workspace.common.workspace'));
            expect(option.isSelected).toBe(true);
        });

        it('routes the workspace subtitle through the injected translate function', async () => {
            const reportID = '9001';
            const testPolicyID = 'policyMarker';
            const report: Report = {
                reportID,
                reportName: 'Marker Workspace Policy',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                isOwnPolicyExpenseChat: true,
                ownerAccountID: 1,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            // A translate that tags the workspace subtitle so we can prove the option used the injected translate
            const translateWithMarker: LocalizedTranslate = (path, ...parameters) => (path === 'workspace.common.workspace' ? 'WorkspaceMarker' : translateLocal(path, ...parameters));

            const participant = {reportID, policyID: testPolicyID, isPolicyExpenseChat: true, selected: false};
            const option = getPolicyExpenseReportOption(participant, undefined, {}, report, undefined, {translate: translateWithMarker, dateFnsLocale: undefined}, CURRENT_USER_ACCOUNT_ID);

            // The subtitle resolves to the marker, proving the option builder used the injected translate (not translateLocal)
            expect(option.alternateText).toBe('WorkspaceMarker');
        });

        it('should use personalDetails to create option with participant info', async () => {
            const reportID = '202';
            const testPolicyID = 'policy202';
            const ownerAccountID = 1002;
            const memberAccountID = 1003;

            const report: Report = {
                reportID,
                reportName: 'Team Expense Chat',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID,
                participants: {
                    [ownerAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    [memberAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const policy: Policy = {
                id: testPolicyID,
                name: 'Team Workspace',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                role: 'admin',
                outputCurrency: 'USD',
            };

            const testPersonalDetails = {
                [ownerAccountID]: {
                    accountID: ownerAccountID,
                    displayName: 'Team Owner',
                    login: 'teamowner@test.com',
                },
                [memberAccountID]: {
                    accountID: memberAccountID,
                    displayName: 'Team Member',
                    login: 'teammember@test.com',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, testPersonalDetails);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
            };

            const option = getPolicyExpenseReportOption(
                participant,
                undefined,
                testPersonalDetails,
                report,
                undefined,
                {translate: translateLocal, dateFnsLocale: undefined},
                CURRENT_USER_ACCOUNT_ID,
            );

            expect(option).toBeDefined();
            expect(option.text).toBe('Team Workspace');
        });

        it('should handle empty personalDetails gracefully', async () => {
            const reportID = '203';
            const testPolicyID = 'policy203';
            const ownerAccountID = 1004;

            const report: Report = {
                reportID,
                reportName: 'Empty Details Chat',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID,
                participants: {
                    [ownerAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const policy: Policy = {
                id: testPolicyID,
                name: 'Workspace Without Details',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                role: 'user',
                outputCurrency: 'USD',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
            };

            // Should not throw when personalDetails is empty
            const option = getPolicyExpenseReportOption(participant, undefined, {}, report, undefined, {translate: translateLocal, dateFnsLocale: undefined}, CURRENT_USER_ACCOUNT_ID);

            expect(option).toBeDefined();
            expect(option.text).toBe('Workspace Without Details');
        });

        it('should handle undefined personalDetails gracefully', async () => {
            const reportID = '204';
            const testPolicyID = 'policy204';
            const ownerAccountID = 1005;

            const report: Report = {
                reportID,
                reportName: 'Undefined Details Chat',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID,
                participants: {
                    [ownerAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const policy: Policy = {
                id: testPolicyID,
                name: 'Workspace Undefined Details',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                role: 'user',
                outputCurrency: 'USD',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
            };

            // Should not throw when personalDetails is undefined
            const option = getPolicyExpenseReportOption(participant, undefined, undefined, report, undefined, {translate: translateLocal, dateFnsLocale: undefined}, CURRENT_USER_ACCOUNT_ID);

            expect(option).toBeDefined();
            expect(option.text).toBe('Workspace Undefined Details');
        });

        it('should preserve selected state from participant', async () => {
            const reportID = '205';
            const testPolicyID = 'policy205';
            const ownerAccountID = 1006;

            const report: Report = {
                reportID,
                reportName: 'Selected State Chat',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID,
                participants: {
                    [ownerAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const policy: Policy = {
                id: testPolicyID,
                name: 'Selection Test Workspace',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                role: 'user',
                outputCurrency: 'USD',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await waitForBatchedUpdates();

            const participantSelected = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
                selected: true,
            };

            // eslint-disable-next-line rulesdir/no-negated-variables
            const participantNotSelected = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
                selected: false,
            };

            const optionSelected = getPolicyExpenseReportOption(
                participantSelected,
                undefined,
                {},
                report,
                undefined,
                {translate: translateLocal, dateFnsLocale: undefined},
                CURRENT_USER_ACCOUNT_ID,
            );

            // eslint-disable-next-line rulesdir/no-negated-variables
            const optionNotSelected = getPolicyExpenseReportOption(
                participantNotSelected,
                undefined,
                {},
                report,
                undefined,
                {translate: translateLocal, dateFnsLocale: undefined},
                CURRENT_USER_ACCOUNT_ID,
            );

            expect(optionSelected.isSelected).toBe(true);
            expect(optionSelected.selected).toBe(true);
            expect(optionNotSelected.isSelected).toBe(false);
            expect(optionNotSelected.selected).toBe(false);
        });

        it('should return a valid option when called with different currentUserAccountID values', async () => {
            const reportID = '210';
            const testPolicyID = 'policy210';
            const ownerAccountID = 1001;

            const report: Report = {
                reportID,
                reportName: 'Thread Test',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID,
                participants: {
                    [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const testPersonalDetails = {
                [ownerAccountID]: {
                    accountID: ownerAccountID,
                    displayName: 'Policy Owner',
                    login: 'owner@test.com',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {reportID, policyID: testPolicyID, isPolicyExpenseChat: true, selected: true};

            const optionWithCurrentUser = getPolicyExpenseReportOption(
                participant,
                undefined,
                testPersonalDetails,
                report,
                undefined,
                {translate: translateLocal, dateFnsLocale: undefined},
                CURRENT_USER_ACCOUNT_ID,
            );
            const optionWithDifferentUser = getPolicyExpenseReportOption(
                participant,
                undefined,
                testPersonalDetails,
                report,
                undefined,
                {translate: translateLocal, dateFnsLocale: undefined},
                9999,
            );

            expect(optionWithCurrentUser).toBeDefined();
            expect(optionWithDifferentUser).toBeDefined();
            expect(optionWithCurrentUser.reportID).toBe(reportID);
            expect(optionWithDifferentUser.reportID).toBe(reportID);
        });
    });

    describe('getPolicyExpenseReportOption with privateIsArchived', () => {
        it('should set private_isArchived on the option when privateIsArchived is provided', async () => {
            const reportID = '301';
            const testPolicyID = 'policy301';
            const ownerAccountID = 2001;
            const report: Report = {
                reportID,
                reportName: 'Archived Policy Expense',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID,
                participants: {
                    [ownerAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const policy: Policy = {
                id: testPolicyID,
                name: 'Archived Workspace',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                role: 'user',
                outputCurrency: 'USD',
            };

            const testPersonalDetails = {
                [ownerAccountID]: {
                    accountID: ownerAccountID,
                    displayName: 'Archived Owner',
                    login: 'archivedowner@test.com',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, testPersonalDetails);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
                selected: false,
            };

            const option = getPolicyExpenseReportOption(
                participant,
                true,
                testPersonalDetails,
                report,
                undefined,
                {translate: translateLocal, dateFnsLocale: undefined},
                CURRENT_USER_ACCOUNT_ID,
            );

            expect(option).toBeDefined();
            expect(option.private_isArchived).toBe(true);
            expect(option.text).toBe('Archived Workspace');
        });

        it('should set private_isArchived to undefined when privateIsArchived is not provided', async () => {
            const reportID = '302';
            const testPolicyID = 'policy302';
            const ownerAccountID = 2002;

            const report: Report = {
                reportID,
                reportName: 'Active Policy Expense',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID,
                participants: {
                    [ownerAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const policy: Policy = {
                id: testPolicyID,
                name: 'Active Workspace',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                role: 'user',
                outputCurrency: 'USD',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
            };

            const option = getPolicyExpenseReportOption(participant, undefined, {}, report, undefined, {translate: translateLocal, dateFnsLocale: undefined}, CURRENT_USER_ACCOUNT_ID);

            expect(option).toBeDefined();
            expect(option?.private_isArchived).toBeUndefined();
        });
    });

    describe('formatSectionsFromSearchTerm', () => {
        const formatTestPolicyID = 'policyFormat1';
        const formatOwnerAccountID = 3001;
        const formatMemberAccountID = 3002;
        const formatReportID1 = '401';
        const formatReportID2 = '402';

        const formatPolicy: Policy = {
            id: formatTestPolicyID,
            name: 'Format Test Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            owner: 'formatowner@test.com',
            role: 'admin',
            outputCurrency: 'USD',
        };

        const formatPersonalDetails = {
            [formatOwnerAccountID]: {
                accountID: formatOwnerAccountID,
                displayName: 'Format Owner',
                login: 'formatowner@test.com',
            },
            [formatMemberAccountID]: {
                accountID: formatMemberAccountID,
                displayName: 'Format Member',
                login: 'formatmember@test.com',
            },
        };

        beforeEach(async () => {
            const report1: Report = {
                reportID: formatReportID1,
                reportName: 'Archived Format Chat',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: formatTestPolicyID,
                ownerAccountID: formatOwnerAccountID,
                participants: {
                    [formatOwnerAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const report2: Report = {
                reportID: formatReportID2,
                reportName: 'Active Format Chat',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: formatTestPolicyID,
                ownerAccountID: formatMemberAccountID,
                participants: {
                    [formatMemberAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${formatReportID1}`, report1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${formatReportID2}`, report2);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${formatTestPolicyID}`, formatPolicy);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, formatPersonalDetails);
            await waitForBatchedUpdates();
        });

        it('should pass privateIsArchived from map to policy expense options when searchTerm is empty and shouldGetOptionDetails is true', () => {
            const privateIsArchivedMap: Record<string, boolean> = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${formatReportID1}`]: true,
            };

            const selectedOptions: SearchOptionData[] = [
                {
                    reportID: formatReportID1,
                    isPolicyExpenseChat: true,
                    selected: true,
                    text: 'Format Test Workspace',
                    alternateText: '',
                    isSelected: true,
                    keyForList: formatReportID1,
                },
            ];

            const result = formatSectionsFromSearchTerm(
                '',
                selectedOptions,
                [],
                [],
                privateIsArchivedMap,
                CURRENT_USER_ACCOUNT_ID,
                undefined,
                translateLocal,
                undefined,
                formatPersonalDetails,
                true,
            );

            expect(result.section.data).toHaveLength(1);

            const option = result.section.data.at(0);
            expect(option?.private_isArchived).toBe(true);
        });

        it('should not set private_isArchived when report is not in the archived map', () => {
            const privateIsArchivedMap: Record<string, boolean> = {};

            const selectedOptions: SearchOptionData[] = [
                {
                    reportID: formatReportID2,
                    isPolicyExpenseChat: true,
                    selected: true,
                    text: 'Format Test Workspace',
                    alternateText: '',
                    isSelected: true,
                    keyForList: formatReportID2,
                },
            ];

            const result = formatSectionsFromSearchTerm(
                '',
                selectedOptions,
                [],
                [],
                privateIsArchivedMap,
                CURRENT_USER_ACCOUNT_ID,
                undefined,
                translateLocal,
                undefined,
                formatPersonalDetails,
                true,
            );

            expect(result.section.data).toHaveLength(1);

            const option = result.section.data.at(0);
            expect(option).toBeDefined();
            if (!option) {
                throw new Error('Expected the active policy expense option to be defined');
            }
            expect(option.private_isArchived).toBeUndefined();
        });

        it('should handle mix of archived and non-archived policy expense chats', () => {
            const privateIsArchivedMap: Record<string, boolean> = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${formatReportID1}`]: true,
            };

            const selectedOptions: SearchOptionData[] = [
                {
                    reportID: formatReportID1,
                    isPolicyExpenseChat: true,
                    selected: true,
                    text: 'Archived Workspace',
                    alternateText: '',
                    isSelected: true,
                    keyForList: formatReportID1,
                },
                {
                    reportID: formatReportID2,
                    isPolicyExpenseChat: true,
                    selected: true,
                    text: 'Active Workspace',
                    alternateText: '',
                    isSelected: true,
                    keyForList: formatReportID2,
                },
            ];

            const result = formatSectionsFromSearchTerm(
                '',
                selectedOptions,
                [],
                [],
                privateIsArchivedMap,
                CURRENT_USER_ACCOUNT_ID,
                undefined,
                translateLocal,
                undefined,
                formatPersonalDetails,
                true,
            );

            expect(result.section.data).toHaveLength(2);

            const archivedOption = result.section.data.at(0);
            const activeOption = result.section.data.at(1);
            expect(archivedOption?.private_isArchived).toBe(true);
            expect(activeOption).toBeDefined();
            if (!activeOption) {
                throw new Error('Expected the active policy expense option to be defined');
            }
            expect(activeOption.private_isArchived).toBeUndefined();
        });

        it('should not transform options when shouldGetOptionDetails is false', () => {
            const privateIsArchivedMap: Record<string, boolean> = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${formatReportID1}`]: true,
            };

            const selectedOptions: SearchOptionData[] = [
                {
                    reportID: formatReportID1,
                    isPolicyExpenseChat: true,
                    selected: true,
                    text: 'Format Test Workspace',
                    alternateText: '',
                    isSelected: true,
                    keyForList: formatReportID1,
                },
            ];

            const result = formatSectionsFromSearchTerm(
                '',
                selectedOptions,
                [],
                [],
                privateIsArchivedMap,
                CURRENT_USER_ACCOUNT_ID,
                undefined,
                translateLocal,
                undefined,
                formatPersonalDetails,
                false,
            );

            expect(result.section.data).toHaveLength(1);
            // When shouldGetOptionDetails is false, the original selectedOptions are returned unchanged
            expect(result.section.data.at(0)).toBe(selectedOptions.at(0));
        });

        it('should pass privateIsArchived from map when searchTerm matches and participant is not in filtered lists', () => {
            const privateIsArchivedMap: Record<string, boolean> = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${formatReportID1}`]: true,
            };

            const selectedOptions: SearchOptionData[] = [
                {
                    reportID: formatReportID1,
                    accountID: formatOwnerAccountID,
                    isPolicyExpenseChat: true,
                    selected: true,
                    text: 'Format Test Workspace',
                    alternateText: '',
                    isSelected: true,
                    login: 'formatowner@test.com',
                    displayName: 'Format Owner',
                    keyForList: formatReportID1,
                },
            ];

            // Pass empty filtered lists so the selected option is not deduplicated
            const result = formatSectionsFromSearchTerm(
                'format',
                selectedOptions,
                [],
                [],
                privateIsArchivedMap,
                CURRENT_USER_ACCOUNT_ID,
                undefined,
                translateLocal,
                undefined,
                formatPersonalDetails,
                true,
            );

            expect(result.section.data).toHaveLength(1);

            const option = result.section.data.at(0);
            expect(option?.private_isArchived).toBe(true);
        });

        it('should handle non-policy expense chat participants without privateIsArchived', () => {
            const privateIsArchivedMap: Record<string, boolean> = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${formatReportID1}`]: true,
            };

            const selectedOptions: SearchOptionData[] = [
                {
                    reportID: formatReportID1,
                    accountID: formatOwnerAccountID,
                    isPolicyExpenseChat: false,
                    selected: true,
                    text: 'Format Owner',
                    alternateText: '',
                    isSelected: true,
                    login: 'formatowner@test.com',
                    displayName: 'Format Owner',
                    keyForList: formatReportID1,
                },
            ];

            const result = formatSectionsFromSearchTerm(
                '',
                selectedOptions,
                [],
                [],
                privateIsArchivedMap,
                CURRENT_USER_ACCOUNT_ID,
                undefined,
                translateLocal,
                undefined,
                formatPersonalDetails,
                true,
            );

            expect(result.section.data).toHaveLength(1);

            // Non-policy expense chats go through getParticipantsOption, not getPolicyExpenseReportOption
            // so private_isArchived is not set
            const option = result.section.data.at(0);
            expect(option).toBeDefined();
            expect(option?.private_isArchived).toBeUndefined();
        });

        it('should return empty section when no selectedOptions are provided', () => {
            const result = formatSectionsFromSearchTerm('', [], [], [], {}, CURRENT_USER_ACCOUNT_ID, undefined, translateLocal, undefined, formatPersonalDetails, true);

            expect(result.section.data).toHaveLength(0);
        });

        it('should resolve the policy expense report through the getReportByID resolver instead of the module-level Onyx cache', () => {
            // This report is intentionally NOT merged into Onyx, so it is only reachable through the resolver.
            // If the function used the module-level Onyx.connect() cache, the report would not be found and
            // private_isArchived would be undefined.
            const resolverReportID = 'resolverOnlyReport1';
            const resolverReport: Report = {
                reportID: resolverReportID,
                reportName: 'Resolver Workspace',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: formatTestPolicyID,
                ownerAccountID: formatOwnerAccountID,
                participants: {
                    [formatOwnerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };
            const getReportByID = (reportID: string | undefined) => (reportID === resolverReportID ? resolverReport : undefined);

            const privateIsArchivedMap: Record<string, boolean> = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${resolverReportID}`]: true,
            };

            const selectedOptions: SearchOptionData[] = [
                {
                    reportID: resolverReportID,
                    keyForList: resolverReportID,
                    isPolicyExpenseChat: true,
                    selected: true,
                    text: 'Resolver Workspace',
                    alternateText: '',
                    isSelected: true,
                },
            ];

            const result = formatSectionsFromSearchTerm(
                '',
                selectedOptions,
                [],
                [],
                privateIsArchivedMap,
                CURRENT_USER_ACCOUNT_ID,
                undefined,
                translateLocal,
                undefined,
                formatPersonalDetails,
                true,
                undefined,
                undefined,
                getReportByID,
            );

            expect(result.section.data).toHaveLength(1);

            const option = result.section.data.at(0);
            expect(option?.private_isArchived).toBe(true);
        });
    });

    describe('getUserToInviteOption', () => {
        it('should not return userToInvite for plain text name when shouldAcceptName is false', () => {
            const result = getUserToInviteOption({
                dateFnsLocale: undefined,
                searchValue: 'Jeff Amazon',
                personalDetails: PERSONAL_DETAILS,
                loginList: {},
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            expect(result).toBeNull();
        });

        it('should return userToInvite for plain text name when shouldAcceptName is true', () => {
            const result = getUserToInviteOption({
                dateFnsLocale: undefined,
                searchValue: 'Jeff Amazon',
                personalDetails: PERSONAL_DETAILS,
                shouldAcceptName: true,
                loginList: {},
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            expect(result).not.toBeNull();
            expect(result?.login).toBe('Jeff Amazon');
        });
    });

    describe('reports parameter functionality', () => {
        it('getValidOptions should use reports parameter to look up chat reports', () => {
            // When we call getValidOptions with the reports collection
            const {options: results} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );

            // Then the function should complete without errors and return valid results
            expect(results).toBeDefined();
            expect(results.recentReports).toBeDefined();
            expect(results.personalDetails).toBeDefined();
        });

        it('filterAndOrderOptions should use reports parameter correctly', () => {
            // Given a set of options and reports collection
            const {options} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );

            // When we call filterAndOrderOptions with the reports parameter
            const filteredOptions = filterAndOrderOptions(options, 'spider', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS);

            // Then the function should complete without errors and return valid results
            expect(filteredOptions).toBeDefined();
            expect(filteredOptions.recentReports).toBeDefined();
            expect(filteredOptions.personalDetails).toBeDefined();
        });

        it('getSearchOptions should use reports parameter from config', () => {
            // When we call getSearchOptions with reports in the config
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                draftComments: {},
                loginList,
                policyCollection: {},
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });

            // Then the function should complete without errors and return valid results
            expect(options).toBeDefined();
            expect(options.recentReports).toBeDefined();
            expect(options.personalDetails).toBeDefined();
        });

        it('getSearchOptions should forward sortedActions to getValidOptions', () => {
            const sortedActions = {};
            const {options} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: OPTIONS,
                draftComments: {},
                loginList,
                policyCollection: {},
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
                sortedActions,
                conciergeReportID: undefined,
            });

            expect(options).toBeDefined();
            expect(options.recentReports).toBeDefined();
            expect(options.personalDetails).toBeDefined();
        });

        it('getUserToInviteOption should use reports parameter correctly', () => {
            // Given a valid email search value and reports collection
            const result = getUserToInviteOption({
                dateFnsLocale: undefined,
                searchValue: 'newuser@example.com',
                loginList: {},
                currentUserEmail: CURRENT_USER_EMAIL,
                personalDetails: PERSONAL_DETAILS,
            });

            // Then the function should return a user to invite
            expect(result).not.toBeNull();
            expect(result?.login).toBe('newuser@example.com');
        });

        it('should work correctly when reports is an empty object', () => {
            // When we call getValidOptions with empty reports
            const {options: results} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );

            // Then the function should still work correctly
            expect(results).toBeDefined();
            expect(results.recentReports).toBeDefined();
            expect(results.personalDetails).toBeDefined();
        });

        it('should work correctly when reports is undefined', () => {
            // When we call getValidOptions without reports parameter
            const {options: results} = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined},
                translateLocal,
            );

            // Then the function should still work correctly
            expect(results).toBeDefined();
            expect(results.recentReports).toBeDefined();
            expect(results.personalDetails).toBeDefined();
        });

        it('createOption should look up chatReport from reports collection when report has chatReportID', async () => {
            // This test verifies the core functionality: using reports to look up linked chat reports
            const reportID = 'expense-report-123';
            const chatReportID = 'linked-chat-456';

            const expenseReport: Report = {
                ...createRandomReport(0, undefined),
                reportID,
                chatReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                participants: {
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    2: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const linkedChatReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: chatReportID,
                type: CONST.REPORT.TYPE.CHAT,
                reportName: 'Linked Chat Report',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, linkedChatReport);
            await waitForBatchedUpdates();

            // When we call createOption with the linked chat report
            const result = createOption({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                accountIDs: [1, 2],
                personalDetails: PERSONAL_DETAILS,
                report: expenseReport,
                privateIsArchived: undefined,
            });

            // Then the option should be created successfully
            expect(result).toBeDefined();
            expect(result.reportID).toBe(reportID);
        });

        it('getReportDisplayOption should use reports parameter to look up chat report', async () => {
            const reportID = 'test-report-789';
            const chatReportID = 'test-chat-101';

            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID,
                chatReportID,
                participants: {
                    2: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const chatReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: chatReportID,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport);
            await waitForBatchedUpdates();

            // When we call getReportDisplayOption with chat report
            const option = getReportDisplayOption({
                dateFnsLocale: undefined,
                report,
                unknownUserDetails: undefined,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: undefined,
                policy: undefined,
                conciergeReportID: undefined,
                translate: translateLocal,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            });

            // Then the option should be created successfully using the reports collection
            expect(option).toBeDefined();
            expect(option.reportID).toBe(reportID);
        });

        it('getPolicyExpenseReportOption should use reports parameter correctly', async () => {
            const reportID = 'policy-expense-123';
            const testPolicyID = 'test-policy-456';

            const report: Report = {
                reportID,
                reportName: 'Test Policy Expense Chat',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            };

            const policy: Policy = {
                id: testPolicyID,
                name: 'Test Reports Param Workspace',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                role: 'admin',
                outputCurrency: 'USD',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
            };

            // When we call getPolicyExpenseReportOption with report passed directly
            const option = getPolicyExpenseReportOption(
                participant,
                undefined,
                PERSONAL_DETAILS,
                report,
                undefined,
                {translate: translateLocal, dateFnsLocale: undefined},
                CURRENT_USER_ACCOUNT_ID,
            );

            // Then the option should be created successfully
            expect(option).toBeDefined();
            expect(option.text).toBe('Test Reports Param Workspace');
        });
    });

    describe('createOptionFromReport', () => {
        it('should subtitle the option as Concierge support only when the threaded conciergeReportID matches the report', () => {
            const report: Report = {
                reportID: 'concierge-option-1',
                reportName: 'Chat',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            // When the threaded conciergeReportID matches the report
            const conciergeOption = createOptionFromReport({
                dateFnsLocale: undefined,
                report,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: undefined,
                policy: undefined,
                sortedActions: undefined,
                conciergeReportID: report.reportID,
            });
            expect(conciergeOption.subtitle).toBe(translateLocal('reportActionsView.conciergeSupport'));

            // And an identical report with a non-matching conciergeReportID is not treated as Concierge
            const regularOption = createOptionFromReport({
                dateFnsLocale: undefined,
                report,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: undefined,
                policy: undefined,
                sortedActions: undefined,
                conciergeReportID: 'a-different-report-id',
            });
            expect(regularOption.subtitle).not.toBe(translateLocal('reportActionsView.conciergeSupport'));
        });

        it('should create an option from a report with all required parameters', () => {
            const report: Report = {
                reportID: '1',
                reportName: 'Test Report',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };
            const reportAction = createRandomReportAction(1);
            const sortedActions = {[report.reportID]: [reportAction]};

            const result = createOptionFromReport({
                dateFnsLocale: undefined,
                report,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: undefined,
                policy: undefined,
                sortedActions,
                conciergeReportID: undefined,
            });

            expect(result).toBeDefined();
            expect(result.reportID).toBe('1');
            expect(result.item).toBe(report);
        });

        it('should mark report as archived when privateIsArchived is provided', () => {
            const report: Report = {
                reportID: '10',
                reportName: 'Archived Report',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };
            const reportAction = createRandomReportAction(1);
            const sortedActions = {[report.reportID]: [reportAction]};

            const result = createOptionFromReport({
                dateFnsLocale: undefined,
                report,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: true,
                policy: undefined,
                sortedActions,
                conciergeReportID: undefined,
            });

            expect(result).toBeDefined();
            expect(result.private_isArchived).toBe(true);
        });

        it('should not mark report as archived when privateIsArchived is undefined', () => {
            const report: Report = {
                reportID: '1',
                reportName: 'Non-Archived Report',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };
            const reportAction = createRandomReportAction(1);
            const sortedActions = {[report.reportID]: [reportAction]};

            const result = createOptionFromReport({
                dateFnsLocale: undefined,
                report,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: undefined,
                policy: undefined,
                sortedActions,
                conciergeReportID: undefined,
            });

            expect(result).toBeDefined();
            expect(result.private_isArchived).toBeUndefined();
        });

        it('should accept reportAttributesDerived parameter', () => {
            const report: Report = {
                reportID: '1',
                reportName: 'Report with Attributes',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };
            const reportAction = createRandomReportAction(1);
            const sortedActions = {[report.reportID]: [reportAction]};

            const result = createOptionFromReport({
                dateFnsLocale: undefined,
                report,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: undefined,
                policy: undefined,
                sortedActions,
                conciergeReportID: undefined,
            });

            expect(result).toBeDefined();
            expect(result.reportID).toBe('1');
        });

        it('should apply config options when provided', () => {
            const report: Report = {
                reportID: '1',
                reportName: 'Report with Config',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };
            const reportAction = createRandomReportAction(1);
            const sortedActions = {[report.reportID]: [reportAction]};

            const config = {showPersonalDetails: true};
            const result = createOptionFromReport({
                dateFnsLocale: undefined,
                report,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: undefined,
                policy: undefined,
                sortedActions,
                conciergeReportID: undefined,
                config,
            });

            expect(result).toBeDefined();
            expect(result.reportID).toBe('1');
        });

        it('should keep the room name for a chat room unless showPersonalDetails is enabled', async () => {
            const report: Report = {
                reportID: '20',
                reportName: '#admins',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                policyID,
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };
            const reportAction = createRandomReportAction(1);
            const sortedActions = {[report.reportID]: [reportAction]};

            // The participant's display name is resolved from Onyx, so seed it to keep the assertion below deterministic.
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS);

            const roomOption = createOptionFromReport({
                dateFnsLocale: undefined,
                report,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: undefined,
                policy: POLICY,
                sortedActions,
                conciergeReportID: undefined,
            });
            const personalDetailsOption = createOptionFromReport({
                dateFnsLocale: undefined,
                report,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: undefined,
                policy: POLICY,
                sortedActions,
                conciergeReportID: undefined,
                config: {showPersonalDetails: true},
            });

            expect(roomOption.text).toBe('#admins');
            // With showPersonalDetails the option is named after the other participant (account 1 in PERSONAL_DETAILS).
            expect(personalDetailsOption.text).toBe('Mister Fantastic');
        });
    });

    describe('createFilteredOptionList', () => {
        const createChatReport = (reportID: string, lastVisibleActionCreated: string, chatType?: Report['chatType']): Report => ({
            reportID,
            reportName: `Report ${reportID}`,
            type: CONST.REPORT.TYPE.CHAT,
            chatType,
            lastVisibleActionCreated,
            participants: {
                [CURRENT_USER_ACCOUNT_ID]: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
                1: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
            },
        });

        const reportsToCollection = (reports: Report[]): OnyxCollection<Report> => Object.fromEntries(reports.map((report) => [report.reportID, report]));

        it('returns the most recent reports when maxRecentReports is less than the input size', () => {
            const reports = [createChatReport('101', '2022-01-01 00:00:00'), createChatReport('102', '2024-01-01 00:00:00'), createChatReport('103', '2023-01-01 00:00:00')];

            const result = createFilteredOptionList({}, reportsToCollection(reports), undefined, {}, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                maxRecentReports: 2,
                includeP2P: false,
            });

            expect(result.reports.map((option) => option.item?.reportID)).toEqual(['102', '103']);
        });

        it('prioritizes self-DM over newer non-self-DM reports', () => {
            const reports = [createChatReport('101', '2024-01-01 00:00:00'), createChatReport('102', '2020-01-01 00:00:00', CONST.REPORT.CHAT_TYPE.SELF_DM)];

            const result = createFilteredOptionList({}, reportsToCollection(reports), undefined, {}, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                maxRecentReports: 1,
                includeP2P: false,
            });

            expect(result.reports.map((option) => option.item?.reportID)).toEqual(['102']);
        });

        it('prioritizes non-archived reports over newer archived reports', () => {
            const reports = [createChatReport('101', '2022-01-01 00:00:00'), createChatReport('102', '2024-01-01 00:00:00')];
            const privateIsArchivedMap: PrivateIsArchivedMap = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}102`]: true,
            };

            const result = createFilteredOptionList({}, reportsToCollection(reports), undefined, privateIsArchivedMap, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                maxRecentReports: 1,
                includeP2P: false,
            });

            expect(result.reports.map((option) => option.item?.reportID)).toEqual(['101']);
        });

        it('returns all reports when isSearching is true', () => {
            const reports = [createChatReport('101', '2022-01-01 00:00:00'), createChatReport('102', '2024-01-01 00:00:00'), createChatReport('103', '2023-01-01 00:00:00')];

            const result = createFilteredOptionList({}, reportsToCollection(reports), undefined, {}, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                maxRecentReports: 1,
                isSearching: true,
                includeP2P: false,
            });

            expect(result.reports.map((option) => option.item?.reportID)).toEqual(['101', '102', '103']);
        });

        it('returns an empty array when maxRecentReports is zero', () => {
            const reports = [createChatReport('101', '2024-01-01 00:00:00')];

            const result = createFilteredOptionList({}, reportsToCollection(reports), undefined, {}, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                maxRecentReports: 0,
                includeP2P: false,
            });

            expect(result.reports).toEqual([]);
        });
        it('should return report options limited by maxRecentReports', () => {
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, {}, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                maxRecentReports: 5,
            });

            expect(result).toBeDefined();
            expect(result.reports.length).toBeLessThanOrEqual(5);
        });

        it('should sort reports by lastVisibleActionCreated (most recent first)', () => {
            const reportsWithDates = [
                {
                    reportID: '101',
                    reportName: 'Oldest Report',
                    type: CONST.REPORT.TYPE.CHAT,
                    lastVisibleActionCreated: '2022-01-01 00:00:00',
                    participants: {
                        [CURRENT_USER_ACCOUNT_ID]: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                        1: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                    },
                },
                {
                    reportID: '102',
                    reportName: 'Newest Report',
                    type: CONST.REPORT.TYPE.CHAT,
                    lastVisibleActionCreated: '2024-01-01 00:00:00',
                    participants: {
                        [CURRENT_USER_ACCOUNT_ID]: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                        1: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                    },
                },
                {
                    reportID: '103',
                    reportName: 'Middle Report',
                    type: CONST.REPORT.TYPE.CHAT,
                    lastVisibleActionCreated: '2023-01-01 00:00:00',
                    participants: {
                        [CURRENT_USER_ACCOUNT_ID]: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                        1: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                    },
                },
            ] satisfies Report[];

            const result = createFilteredOptionList({}, Object.fromEntries(reportsWithDates.map((report) => [report.reportID, report])), undefined, {}, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                maxRecentReports: 3,
                includeP2P: false,
                conciergeReportID: undefined,
            });

            expect(result.reports.map((option) => option.item?.reportID)).toEqual(['102', '103', '101']);
        });

        it('should include personal details when includeP2P is true', () => {
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, {}, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                includeP2P: true,
            });

            expect(result).toBeDefined();
            expect(result.personalDetails).toBeDefined();
            expect(result.personalDetails.length).toBeGreaterThan(0);
        });

        it('should exclude personal details when includeP2P is false', () => {
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, {}, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                includeP2P: false,
            });

            expect(result).toBeDefined();
            expect(result.personalDetails.length).toBe(0);
        });

        it('should handle empty reports collection', () => {
            const result = createFilteredOptionList(PERSONAL_DETAILS, {}, undefined, {}, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });

            expect(result).toBeDefined();
            expect(result.reports.length).toBe(0);
        });

        it('should handle undefined reports collection', () => {
            const result = createFilteredOptionList(PERSONAL_DETAILS, undefined, undefined, {}, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });

            expect(result).toBeDefined();
            expect(result.reports.length).toBe(0);
        });

        it('should use privateIsArchivedMap to determine archived status', () => {
            const report: Report = {
                reportID: '999',
                reportName: 'Archived Test Report',
                type: CONST.REPORT.TYPE.CHAT,
                lastVisibleActionCreated: '2024-01-01 00:00:00',
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const reportsCollection: OnyxCollection<Report> = {
                '999': report,
            };

            const privateIsArchivedMap = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}999`]: true,
            };

            const result = createFilteredOptionList(PERSONAL_DETAILS, reportsCollection, undefined, privateIsArchivedMap, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                maxRecentReports: 10,
            });

            expect(result).toBeDefined();
        });

        it('should handle isSearching filtering', () => {
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, {}, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                isSearching: true,
            });

            expect(result).toBeDefined();
            expect(result.reports.length).toBe(Object.keys(REPORTS).length);
        });

        it('should return all reports when isSearching is true', () => {
            const result = createFilteredOptionList(
                PERSONAL_DETAILS,
                REPORTS,
                undefined,
                {},
                {},
                {currentUserAccountID: CURRENT_USER_ACCOUNT_ID, dateFnsLocale: undefined, conciergeReportID: undefined, isSearching: true, maxRecentReports: 2},
            );

            expect(result).toBeDefined();
            expect(result.reports.length).toBe(Object.keys(REPORTS).length);
        });

        it('should return both reports and personal details', () => {
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, {}, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });

            expect(result).toBeDefined();
            expect(result).toHaveProperty('reports');
            expect(result).toHaveProperty('personalDetails');
        });

        // The SearchRouter relies on this: its empty-query state renders recent reports only,
        // so contacts must not be built until the user starts searching.
        it('should not build personal details when deferContactsUntilSearch is true and not searching', () => {
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, {}, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                deferContactsUntilSearch: true,
            });

            expect(result.reports.length).toBeGreaterThan(0);
            expect(result.personalDetails.length).toBe(0);
        });

        it('should build personal details when deferContactsUntilSearch is true and searching', () => {
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, {}, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                deferContactsUntilSearch: true,
                isSearching: true,
            });

            expect(result.personalDetails.length).toBeGreaterThan(0);
        });

        it('should keep top-level fields of returned options mutable while the cached entry stays pristine', () => {
            const first = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });
            const firstOption = first.personalDetails.at(0);
            expect(firstOption).toBeDefined();
            if (firstOption) {
                firstOption.isSelected = true;
            }

            const second = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });
            const secondOption = second.personalDetails.at(0);

            // Same cache entry (nested objects are shared between clones), but each caller gets fresh top-level objects.
            // Personal detail shells share participantsList; report options share icons.
            expect(secondOption?.participantsList).toBe(firstOption?.participantsList);
            expect(secondOption).not.toBe(firstOption);
            expect(secondOption?.isSelected).toBeFalsy();
            expect(second.reports.at(0)?.icons).toBe(first.reports.at(0)?.icons);
        });

        // conciergeReportID affects the Concierge option's subtitle/alternate text, so a change must
        // invalidate the cache instead of serving options built with the previous value.
        it('should recompute cached options when only conciergeReportID changes', () => {
            const first = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });
            const second = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: '1',
            });

            // A cache hit copies each shell's `hydrate` by reference between clones (see the pristine-cache test
            // above), so a fresh closure is what proves the entry was rebuilt rather than served.
            const getHydrate = (option: PersonalDetailOptionOrShell | undefined) => (option && !option.isHydrated ? option.hydrate : undefined);
            expect(getHydrate(first.personalDetails.at(0))).toBeDefined();
            expect(getHydrate(second.personalDetails.at(0))).not.toBe(getHydrate(first.personalDetails.at(0)));
        });

        // The cached entry is frozen in dev, so a consumer that mutates a nested object shared with the
        // cache throws instead of silently corrupting the results returned to every other screen.
        it('should throw when a nested object shared with the cache is mutated', () => {
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });
            // Report options still carry fully-built icons; personal detail shells do not.
            const icons = result.reports.at(0)?.icons;

            expect(icons?.length).toBeGreaterThan(0);
            expect(() => icons?.pop()).toThrow(TypeError);
        });

        // Onyx snapshot objects referenced by the options are shared with the whole app and existing code
        // still writes to them in place, so the dev freeze must leave them untouched (see deepFreeze).
        it('should not freeze the Onyx snapshot objects referenced by cached options', () => {
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, undefined, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });
            const personalDetailItem = result.personalDetails.at(0)?.item;
            const reportItem = result.reports.at(0)?.item;

            expect(personalDetailItem).toBeDefined();
            expect(Object.isFrozen(personalDetailItem)).toBe(false);
            expect(reportItem).toBeDefined();
            expect(Object.isFrozen(reportItem)).toBe(false);

            // Hydration freezes the option it memoizes, and it reads shared Onyx Reports out of its captured
            // build inputs — those must survive unfrozen too.
            const hydrated = result.personalDetails.map(hydrateContactOption);
            expect(hydrated.length).toBeGreaterThan(0);
            expect(hydrated.every((option) => !Object.isFrozen(option))).toBe(true);
            expect(Object.values(REPORTS).every((report) => !Object.isFrozen(report))).toBe(true);
        });
    });
    describe('getValidOptions() with recentAttendees', () => {
        const recentAttendees = Array.from({length: 8}, (_, index) => ({
            login: `john${index}@example.com`,
            text: `John ${index}`,
            accountID: 1000 + index,
        }));

        it('caps recent attendees to maxRecentReportElements when there is no search term', () => {
            // When we call getValidOptions with more recent attendees than the display cap and no search term
            const {options: results} = getValidOptions(
                {reports: [], personalDetails: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeRecentReports: false, recentAttendees, maxRecentReportElements: 5, sortedActions: undefined},
                translateLocal,
            );

            // Then only the first 5 recent attendees are shown
            expect(results.recentReports.length).toBe(5);
        });

        it('shows all matching recent attendees beyond the cap when there is a search term', () => {
            // When we call getValidOptions with a search term that matches all recent attendees
            const {options: results} = getValidOptions(
                {reports: [], personalDetails: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeRecentReports: false, recentAttendees, maxRecentReportElements: 5, searchString: 'john', sortedActions: undefined},
                translateLocal,
            );

            // Then all matching recent attendees are shown, not just the first 5
            expect(results.recentReports.length).toBe(8);
        });
    });

    describe('policy parameter passing', () => {
        it('createFilteredOptionList should accept policiesCollection parameter', () => {
            const result = createFilteredOptionList(PERSONAL_DETAILS, REPORTS, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, allPolicies, {
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
            });
            expect(result).toBeDefined();
            expect(result.reports).toBeDefined();
            expect(result.personalDetails).toBeDefined();
        });

        it('createOptionFromReport should accept policy parameter', () => {
            const report: Report = {
                reportID: '10',
                reportName: 'Policy Report',
                type: CONST.REPORT.TYPE.CHAT,
                policyID,
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };
            const reportAction = createRandomReportAction(1);
            const sortedActions = {[report.reportID]: [reportAction]};

            const result = createOptionFromReport({
                dateFnsLocale: undefined,
                report,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: undefined,
                policy: POLICY,
                sortedActions,
                conciergeReportID: undefined,
            });
            expect(result).toBeDefined();
            expect(result.policyID).toBe(policyID);
        });

        it('getReportDisplayOption should accept policy parameter', () => {
            const report: Report = {
                reportID: '10',
                reportName: 'Display Option Policy Report',
                type: CONST.REPORT.TYPE.CHAT,
                policyID,
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const result = getReportDisplayOption({
                dateFnsLocale: undefined,
                report,
                unknownUserDetails: undefined,
                personalDetails: PERSONAL_DETAILS,
                privateIsArchived: undefined,
                policy: POLICY,
                conciergeReportID: undefined,
                translate: translateLocal,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            });
            expect(result).toBeDefined();
            expect(result.policyID).toBe(policyID);
        });

        it('getPolicyExpenseReportOption should accept policy parameter', () => {
            const report: Report = {
                reportID: '10',
                reportName: "SHIELD's workspace",
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                ownerAccountID: 1,
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            const participant = {
                accountID: CURRENT_USER_ACCOUNT_ID,
                reportID: '10',
                isPolicyExpenseChat: true,
                selected: true,
            };

            const result = getPolicyExpenseReportOption(
                participant,
                undefined,
                PERSONAL_DETAILS,
                report,
                POLICY,
                {translate: translateLocal, dateFnsLocale: undefined},
                CURRENT_USER_ACCOUNT_ID,
            );
            expect(result).toBeDefined();
            expect(result.policyID).toBe(policyID);
        });

        it('formatSectionsFromSearchTerm should accept policy parameter', () => {
            const result = formatSectionsFromSearchTerm('', [], [], [], {}, CURRENT_USER_ACCOUNT_ID, allPolicies, translateLocal, undefined, PERSONAL_DETAILS, true);
            expect(result).toBeDefined();
            expect(result.section).toBeDefined();
        });
    });

    describe('prepareReportOptionsForDisplay with sortedActions', () => {
        it('should use sortedActions to compute lastIOUCreationDate for expense report sorting', async () => {
            const reportID = 'sorted-test-1';
            const iouReportID = 'sorted-iou-1';
            const iouActionModified = '2025-06-15 10:30:00.000';

            const report: Report = {
                ...createRegularChat(Number(reportID), [1]),
                reportID,
                reportName: 'Test Report',
                lastVisibleActionCreated: '2025-06-15 10:00:00.000',
                lastActorAccountID: 1,
                lastMessageText: 'Test',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const reportPreviewAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                originalMessage: {linkedReportID: iouReportID},
            } as ReportAction;

            const iouAction: ReportAction = {
                ...createRandomReportAction(2),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                lastModified: iouActionModified,
            } as ReportAction;

            const inputOption: SearchOption<Report> = {
                item: report,
                reportID,
                text: 'Test Report',
                isUnread: false,
                participantsList: [],
                keyForList: reportID,
                isChatRoom: true,
                policyID: '123',
                lastMessageText: 'Test',
                lastVisibleActionCreated: report.lastVisibleActionCreated,
                notificationPreference: 'always',
                accountID: 0,
                login: '',
                alternateText: '',
                subtitle: '',
                firstName: '',
                lastName: '',
                icons: [],
                isSelected: false,
                isDisabled: false,
                brickRoadIndicator: null,
                isBold: false,
            };

            const sortedActions = {
                [reportID]: [reportPreviewAction],
                [iouReportID]: [iouAction],
            };

            const {options: results} = getValidOptions(
                {reports: [inputOption], personalDetails: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeRecentReports: true, includeMultipleParticipantReports: true, action: CONST.IOU.ACTION.CREATE, sortedActions},
                translateLocal,
            );

            expect(results.recentReports.length).toBe(1);
            const resultOption = results.recentReports.at(0);
            expect(resultOption?.lastIOUCreationDate).toBe(iouActionModified);
        });

        it('should not have lastIOUCreationDate when sortedActions is empty', async () => {
            const reportID = 'sorted-test-2';

            const report: Report = {
                ...createRegularChat(Number(reportID), [1]),
                reportID,
                reportName: 'Test Report 2',
                lastVisibleActionCreated: '2025-06-15 10:00:00.000',
                lastActorAccountID: 1,
                lastMessageText: 'Test',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const inputOption: SearchOption<Report> = {
                item: report,
                reportID,
                text: 'Test Report 2',
                isUnread: false,
                participantsList: [],
                keyForList: reportID,
                isChatRoom: true,
                policyID: '123',
                lastMessageText: 'Test',
                lastVisibleActionCreated: report.lastVisibleActionCreated,
                notificationPreference: 'always',
                accountID: 0,
                login: '',
                alternateText: '',
                subtitle: '',
                firstName: '',
                lastName: '',
                icons: [],
                isSelected: false,
                isDisabled: false,
                brickRoadIndicator: null,
                isBold: false,
            };

            const sortedActions = {};

            const {options: results} = getValidOptions(
                {reports: [inputOption], personalDetails: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeRecentReports: true, action: CONST.IOU.ACTION.CREATE, sortedActions},
                translateLocal,
            );

            const resultOption = results.recentReports.at(0);
            expect(resultOption?.lastIOUCreationDate).toBeUndefined();
        });

        it('should not have lastIOUCreationDate when sortedActions is undefined', async () => {
            const reportID = 'sorted-test-3';

            const report: Report = {
                ...createRegularChat(Number(reportID), [1]),
                reportID,
                reportName: 'Test Report 3',
                lastVisibleActionCreated: '2025-06-15 10:00:00.000',
                lastActorAccountID: 1,
                lastMessageText: 'Test',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const inputOption: SearchOption<Report> = {
                item: report,
                reportID,
                text: 'Test Report 3',
                isUnread: false,
                participantsList: [],
                keyForList: reportID,
                isChatRoom: true,
                policyID: '123',
                lastMessageText: 'Test',
                lastVisibleActionCreated: report.lastVisibleActionCreated,
                notificationPreference: 'always',
                accountID: 0,
                login: '',
                alternateText: '',
                subtitle: '',
                firstName: '',
                lastName: '',
                icons: [],
                isSelected: false,
                isDisabled: false,
                brickRoadIndicator: null,
                isBold: false,
            };

            const {options: results} = getValidOptions(
                {reports: [inputOption], personalDetails: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeRecentReports: true, action: CONST.IOU.ACTION.CREATE, sortedActions: undefined},
                translateLocal,
            );

            const resultOption = results.recentReports.at(0);
            expect(resultOption?.lastIOUCreationDate).toBeUndefined();
        });

        it('should pick the correct lastIOUCreationDate from multiple IOU actions', async () => {
            const reportID = 'sorted-test-4';
            const iouReportID = 'sorted-iou-4';
            const olderDate = '2025-06-10 08:00:00.000';
            const newerDate = '2025-06-15 10:30:00.000';

            const report: Report = {
                ...createRegularChat(Number(reportID), [1]),
                reportID,
                reportName: 'Test Report 4',
                lastVisibleActionCreated: '2025-06-15 10:00:00.000',
                lastActorAccountID: 1,
                lastMessageText: 'Test',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const reportPreviewAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                originalMessage: {linkedReportID: iouReportID},
            } as ReportAction;

            const newerIOUAction: ReportAction = {
                ...createRandomReportAction(2),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                lastModified: newerDate,
            } as ReportAction;

            const olderIOUAction: ReportAction = {
                ...createRandomReportAction(3),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                lastModified: olderDate,
            } as ReportAction;

            const inputOption: SearchOption<Report> = {
                item: report,
                reportID,
                text: 'Test Report 4',
                isUnread: false,
                participantsList: [],
                keyForList: reportID,
                isChatRoom: true,
                policyID: '123',
                lastMessageText: 'Test',
                lastVisibleActionCreated: report.lastVisibleActionCreated,
                notificationPreference: 'always',
                accountID: 0,
                login: '',
                alternateText: '',
                subtitle: '',
                firstName: '',
                lastName: '',
                icons: [],
                isSelected: false,
                isDisabled: false,
                brickRoadIndicator: null,
                isBold: false,
            };

            const sortedActions = {
                [reportID]: [reportPreviewAction],
                [iouReportID]: [newerIOUAction, olderIOUAction],
            };

            const {options: results} = getValidOptions(
                {reports: [inputOption], personalDetails: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeRecentReports: true, includeMultipleParticipantReports: true, action: CONST.IOU.ACTION.CREATE, sortedActions},
                translateLocal,
            );

            expect(results.recentReports.length).toBe(1);
            const resultOption = results.recentReports.at(0);
            expect(resultOption?.lastIOUCreationDate).toBe(newerDate);
        });

        it('should not set lastIOUCreationDate when action is not CREATE', async () => {
            const reportID = 'sorted-test-5';
            const iouReportID = 'sorted-iou-5';

            const report: Report = {
                ...createRegularChat(Number(reportID), [1]),
                reportID,
                reportName: 'Test Report 5',
                lastVisibleActionCreated: '2025-06-15 10:00:00.000',
                lastActorAccountID: 1,
                lastMessageText: 'Test',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const reportPreviewAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                originalMessage: {linkedReportID: iouReportID},
            } as ReportAction;

            const iouAction: ReportAction = {
                ...createRandomReportAction(2),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                lastModified: '2025-06-15 10:30:00.000',
            } as ReportAction;

            const inputOption: SearchOption<Report> = {
                item: report,
                reportID,
                text: 'Test Report 5',
                isUnread: false,
                participantsList: [],
                keyForList: reportID,
                isChatRoom: true,
                policyID: '123',
                lastMessageText: 'Test',
                lastVisibleActionCreated: report.lastVisibleActionCreated,
                notificationPreference: 'always',
                accountID: 0,
                login: '',
                alternateText: '',
                subtitle: '',
                firstName: '',
                lastName: '',
                icons: [],
                isSelected: false,
                isDisabled: false,
                brickRoadIndicator: null,
                isBold: false,
            };

            const sortedActions = {
                [reportID]: [reportPreviewAction],
                [iouReportID]: [iouAction],
            };

            const {options: results} = getValidOptions(
                {reports: [inputOption], personalDetails: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeRecentReports: true, sortedActions},
                translateLocal,
            );

            const resultOption = results.recentReports.at(0);
            expect(resultOption?.lastIOUCreationDate).toBeUndefined();
        });

        it('should not set lastIOUCreationDate when report has no REPORT_PREVIEW action in sortedActions', async () => {
            const reportID = 'sorted-test-6';

            const report: Report = {
                ...createRegularChat(Number(reportID), [1]),
                reportID,
                reportName: 'Test Report 6',
                lastVisibleActionCreated: '2025-06-15 10:00:00.000',
                lastActorAccountID: 1,
                lastMessageText: 'Test',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const nonPreviewAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            } as ReportAction;

            const inputOption: SearchOption<Report> = {
                item: report,
                reportID,
                text: 'Test Report 6',
                isUnread: false,
                participantsList: [],
                keyForList: reportID,
                isChatRoom: true,
                policyID: '123',
                lastMessageText: 'Test',
                lastVisibleActionCreated: report.lastVisibleActionCreated,
                notificationPreference: 'always',
                accountID: 0,
                login: '',
                alternateText: '',
                subtitle: '',
                firstName: '',
                lastName: '',
                icons: [],
                isSelected: false,
                isDisabled: false,
                brickRoadIndicator: null,
                isBold: false,
            };

            const sortedActions = {
                [reportID]: [nonPreviewAction],
            };

            const {options: results} = getValidOptions(
                {reports: [inputOption], personalDetails: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeRecentReports: true, action: CONST.IOU.ACTION.CREATE, sortedActions},
                translateLocal,
            );

            const resultOption = results.recentReports.at(0);
            expect(resultOption?.lastIOUCreationDate).toBeUndefined();
        });
    });

    describe('orderPersonalDetailsOptions()', () => {
        it('sorts options alphabetically using text values', () => {
            const options: SearchOptionData[] = [
                {accountID: 1, reportID: '1', keyForList: '1', text: 'Charlie', login: 'c@example.com'},
                {accountID: 2, reportID: '2', keyForList: '2', text: 'aaron', login: 'a@example.com'},
                {accountID: 3, reportID: '3', keyForList: '3', text: 'Bob', login: 'b@example.com'},
            ];

            const sorted = orderPersonalDetailsOptions(options);

            expect(sorted.map((option) => option.text)).toEqual(['aaron', 'Bob', 'Charlie']);
        });

        it('falls back to alternateText and login when text is missing', () => {
            const options: SearchOptionData[] = [
                {
                    accountID: 1,
                    reportID: '1',
                    keyForList: '1',
                    text: undefined,
                    alternateText: 'mango',
                    login: 'm@example.com',
                },
                {accountID: 2, reportID: '2', keyForList: '2', text: 'apple', login: 'a@example.com'},
                {
                    accountID: 3,
                    reportID: '3',
                    keyForList: '3',
                    text: undefined,
                    alternateText: undefined,
                    login: 'banana@example.com',
                },
            ];

            const sorted = orderPersonalDetailsOptions(options);

            expect(sorted.map((option) => option.accountID)).toEqual([2, 3, 1]);
        });
    });

    describe('getValidOptions with sortedActions', () => {
        it('returns lastIOUCreationDate from the latest IOU action linked via REPORT_PREVIEW', async () => {
            const reportID = 'gvo-sorted-1';
            const iouReportID = 'gvo-iou-1';
            const expectedDate = '2025-06-15 10:30:00.000';

            const report: Report = {
                ...createRegularChat(Number(reportID), [1]),
                reportID,
                reportName: 'Expense Chat',
                lastVisibleActionCreated: '2025-06-15 10:00:00.000',
                lastActorAccountID: 1,
                lastMessageText: 'Test',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const reportPreviewAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                originalMessage: {linkedReportID: iouReportID},
            } as ReportAction;

            const iouAction: ReportAction = {
                ...createRandomReportAction(2),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                lastModified: expectedDate,
            } as ReportAction;

            const inputOption: SearchOption<Report> = {
                item: report,
                reportID,
                text: 'Expense Chat',
                isUnread: false,
                participantsList: [],
                keyForList: reportID,
                isChatRoom: true,
                policyID: '123',
                lastMessageText: 'Test',
                lastVisibleActionCreated: report.lastVisibleActionCreated,
                notificationPreference: 'always',
                accountID: 0,
                login: '',
                alternateText: '',
                subtitle: '',
                firstName: '',
                lastName: '',
                icons: [],
                isSelected: false,
                isDisabled: false,
                brickRoadIndicator: null,
                isBold: false,
            };

            const sortedActions = {
                [reportID]: [reportPreviewAction],
                [iouReportID]: [iouAction],
            };

            const {options: results} = getValidOptions(
                {reports: [inputOption], personalDetails: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeRecentReports: true, includeMultipleParticipantReports: true, action: CONST.IOU.ACTION.CREATE, sortedActions},
                translateLocal,
            );

            expect(results.recentReports.length).toBe(1);
            expect(results.recentReports.at(0)?.lastIOUCreationDate).toBe(expectedDate);
        });

        it('returns undefined lastIOUCreationDate when sortedActions has no matching IOU actions', async () => {
            const reportID = 'gvo-sorted-2';

            const report: Report = {
                ...createRegularChat(Number(reportID), [1]),
                reportID,
                reportName: 'Chat with no IOU',
                lastVisibleActionCreated: '2025-06-15 10:00:00.000',
                lastActorAccountID: 1,
                lastMessageText: 'Test',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const commentAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            } as ReportAction;

            const inputOption: SearchOption<Report> = {
                item: report,
                reportID,
                text: 'Chat with no IOU',
                isUnread: false,
                participantsList: [],
                keyForList: reportID,
                isChatRoom: true,
                policyID: '123',
                lastMessageText: 'Test',
                lastVisibleActionCreated: report.lastVisibleActionCreated,
                notificationPreference: 'always',
                accountID: 0,
                login: '',
                alternateText: '',
                subtitle: '',
                firstName: '',
                lastName: '',
                icons: [],
                isSelected: false,
                isDisabled: false,
                brickRoadIndicator: null,
                isBold: false,
            };

            const {options: results} = getValidOptions(
                {reports: [inputOption], personalDetails: []},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                {dateFnsLocale: undefined, includeRecentReports: true, action: CONST.IOU.ACTION.CREATE, sortedActions: {[reportID]: [commentAction]}},
                translateLocal,
            );

            expect(results.recentReports.at(0)?.lastIOUCreationDate).toBeUndefined();
        });
    });

    describe('getSearchOptions with sortedActions', () => {
        it('should not have lastIOUCreationDate when sortedActions is undefined', async () => {
            const reportID = 'search-sorted-2';

            const report: Report = {
                ...createRegularChat(Number(reportID), [1]),
                reportID,
                reportName: 'Search Sorted Test 2',
                lastVisibleActionCreated: '2025-06-15 10:00:00.000',
                lastActorAccountID: 1,
                lastMessageText: 'Test',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const inputOption: SearchOption<Report> = {
                item: report,
                reportID,
                text: 'Search Sorted Test 2',
                isUnread: false,
                participantsList: [],
                keyForList: reportID,
                isChatRoom: true,
                policyID: '123',
                lastMessageText: 'Test',
                lastVisibleActionCreated: report.lastVisibleActionCreated,
                notificationPreference: 'always',
                accountID: 0,
                login: '',
                alternateText: '',
                subtitle: '',
                firstName: '',
                lastName: '',
                icons: [],
                isSelected: false,
                isDisabled: false,
                brickRoadIndicator: null,
                isBold: false,
            };

            const {options: results} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: {reports: [inputOption], personalDetails: []},
                draftComments: {},
                betas: [CONST.BETAS.ALL],
                loginList,
                policyCollection: allPolicies,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                sortedActions: undefined,
                conciergeReportID: undefined,
            });

            expect(results.recentReports.length).toBe(1);
            expect(results.recentReports.at(0)?.lastIOUCreationDate).toBeUndefined();
        });

        it('should use sortedActions for unread computation with shouldUnreadBeBold on IOU reports', async () => {
            const reportID = 'search-sorted-3';

            const report: Report = {
                ...createRegularChat(Number(reportID), [1]),
                reportID,
                reportName: 'Search IOU Test',
                lastVisibleActionCreated: '2025-06-15 10:00:00.000',
                lastActorAccountID: 1,
                lastMessageText: 'Test',
                type: CONST.REPORT.TYPE.IOU,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const iouAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            } as ReportAction;

            const inputOption: SearchOption<Report> = {
                item: report,
                reportID,
                text: 'Search IOU Test',
                isUnread: true,
                participantsList: [],
                keyForList: reportID,
                isChatRoom: false,
                policyID: '123',
                lastMessageText: 'Test',
                lastVisibleActionCreated: report.lastVisibleActionCreated,
                notificationPreference: 'always',
                accountID: 0,
                login: '',
                alternateText: '',
                subtitle: '',
                firstName: '',
                lastName: '',
                icons: [],
                isSelected: false,
                isDisabled: false,
                brickRoadIndicator: null,
                isBold: false,
            };

            const sortedActions = {
                [reportID]: [iouAction],
            };

            const {options: results} = getSearchOptions({
                dateFnsLocale: undefined,
                translate: translateLocal,
                options: {reports: [inputOption], personalDetails: []},
                draftComments: {},
                betas: [CONST.BETAS.ALL],
                loginList,
                policyCollection: allPolicies,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                shouldUnreadBeBold: true,
                sortedActions,
                conciergeReportID: undefined,
            });

            expect(results.recentReports.length).toBe(1);
            expect(results.recentReports.at(0)?.isUnread).toBe(true);
            expect(results.recentReports.at(0)?.isBold).toBe(true);
        });
    });
});
