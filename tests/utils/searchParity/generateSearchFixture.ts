// cspell:disable -- names and queries deliberately use diacritics, non-Latin scripts and misspelled forms
/* eslint-disable @typescript-eslint/naming-convention -- logins and IDs are object keys throughout this file */
import type {PrivateIsArchivedMap} from '@hooks/usePrivateIsArchivedMap';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Logins, PersonalDetails, PersonalDetailsList, Policy, Report, ReportActions} from '@src/types/onyx';
import type {ReportAttributes, SortedReportActionsDerivedValue, VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxCollection, OnyxMultiSetInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../getOnyxValue';
import waitForBatchedUpdates from '../waitForBatchedUpdates';

const CURRENT_USER_EMAIL = 'current.user@example.com';

const POLICY_IDS = {
    OWN: 'A1B2C3D4E5F60001',
    OTHER: 'A1B2C3D4E5F60002',
    MISSING: 'A1B2C3D4E5F60003',
} as const;

const ACCOUNT_IDS = {
    CURRENT_USER: 1,
    UNKNOWN: 999,
    CONCIERGE: CONST.ACCOUNT_ID.CONCIERGE,
    NOTIFICATIONS: CONST.ACCOUNT_ID.NOTIFICATIONS,
    JOSE_NUNEZ: 2,
    VIT_NOVAK: 3,
    ISMAIL_YILMAZ: 4,
    GROSS_STRASSE: 5,
    BOB_BUILDER: 10,
    MARY_JANE_OBRIEN: 11,
    ALEX_SMITH: 14,
} as const;

const SESSION = {
    accountID: ACCOUNT_IDS.CURRENT_USER,
    email: CURRENT_USER_EMAIL,
};

/** Contacts and reports carry fixed IDs, so adding one never renumbers the others and churns the golden master. */
const FIRST_FILLER_ACCOUNT_ID = 100;

/** A contact's generated 1:1 DM is DM_REPORT_ID_OFFSET + its accountID. */
const DM_REPORT_ID_OFFSET = 1000;

/** The system accounts' real IDs would break the accountID-derived reportID, day and DM assignment, so their DMs are pinned instead. */
const SYSTEM_DM_SLOTS: Record<number, {reportID: number; day: number}> = {
    // Empty (no report actions). Search drops it through the hard-excluded notifications login before the empty-notifications-DM rule in reasonForReportToBeInOptionList runs, so that rule is not pinned here
    [ACCOUNT_IDS.NOTIFICATIONS]: {reportID: DM_REPORT_ID_OFFSET + 16, day: 16},
    [ACCOUNT_IDS.CONCIERGE]: {reportID: DM_REPORT_ID_OFFSET + 21, day: 0},
};

/** Every reportID is above this, and a report's timestamp is derived from its distance to it. */
const REPORT_ID_TIMESTAMP_ORIGIN = 1000;

/** The values Onyx derives from the fixture, which the app passes to the search next to the raw collections. */
type SearchFixtureDerivedData = {
    reportAttributes: Record<string, ReportAttributes>;
    visibleReportActions: VisibleReportActionsDerivedValue;
    sortedReportActions: SortedReportActionsDerivedValue;
};

type SearchFixture = {
    personalDetails: PersonalDetailsList;
    reports: NonNullable<OnyxCollection<Report>>;
    reportActions: NonNullable<OnyxCollection<ReportActions>>;
    policies: NonNullable<OnyxCollection<Policy>>;
    privateIsArchivedMap: PrivateIsArchivedMap;

    /** Empty until writeSearchFixtureToOnyx returns what Onyx derived. */
    derived: SearchFixtureDerivedData;
    draftComments: NonNullable<OnyxCollection<string>>;
    loginList: Logins;
    conciergeReportID: string;
};

const NAMED_CONTACTS: Array<Pick<PersonalDetails, 'accountID' | 'login' | 'displayName' | 'firstName' | 'lastName'>> = [
    {
        accountID: ACCOUNT_IDS.CURRENT_USER,
        login: CURRENT_USER_EMAIL,
        displayName: 'Current User',
        firstName: 'Current',
        lastName: 'User',
    },
    {
        accountID: ACCOUNT_IDS.JOSE_NUNEZ,
        login: 'jose.nunez@example.com',
        displayName: 'Jos\u00e9 \u00d1\u00fa\u00f1ez',
    },
    {
        accountID: ACCOUNT_IDS.VIT_NOVAK,
        login: 'vit.novak@example.com',
        displayName: 'V\u00edt Nov\u00e1k',
    },
    {
        accountID: ACCOUNT_IDS.ISMAIL_YILMAZ,
        login: 'ismail@example.com',
        displayName: '\u0130smail Y\u0131lmaz',
    },
    {
        accountID: ACCOUNT_IDS.GROSS_STRASSE,
        login: 'strasse@example.com',
        displayName: 'Gro\u00df Stra\u00dfe',
    },
    {
        accountID: 6,
        login: 'lukasz@example.com',
        displayName: '\u0141ukasz W\u00f3jcik',
    },
    {
        accountID: 7,
        login: 'odysseus@example.com',
        displayName: '\u039f\u03b4\u03c5\u03c3\u03c3\u03b5\u03cd\u03c2',
    },
    {
        accountID: 8,
        login: 'zoe@example.com',
        displayName: 'Zo\u00eb \ud83d\udc69\u200d\ud83d\udcbb',
    },
    {
        accountID: 9,
        login: 'ana.maria@example.com',
        displayName: 'Ana\u200bMaria',
    },
    {
        accountID: ACCOUNT_IDS.BOB_BUILDER,
        login: 'bob.builder@example.com',
        displayName: 'Bob\u00a0Builder',
    },
    {
        accountID: ACCOUNT_IDS.MARY_JANE_OBRIEN,
        login: 'obrien@example.com',
        displayName: "Mary-Jane O'Brien",
    },
    {accountID: 12, login: 'first.last+tag@x.com', displayName: ''},
    {accountID: 13, login: '+15005550006@expensify.sms', displayName: ''},
    {accountID: ACCOUNT_IDS.ALEX_SMITH, login: 'alex.smith@example.com', displayName: 'Alex Smith'},

    // Shares the "alex smith" prefix but not the full name, so the two contacts never tie when sorted by name
    {
        accountID: 15,
        login: 'alex.smith2@example.com',
        displayName: 'Alex Smith Jr.',
    },
    {
        accountID: ACCOUNT_IDS.NOTIFICATIONS,
        login: CONST.EMAIL.NOTIFICATIONS,
        displayName: 'Expensify Notifications',
    },
    {
        accountID: 17,
        login: CONST.ACCOUNT_EXECUTIVE_LOGIN,
        displayName: 'Account Executive',
    },
    {accountID: 18, login: 'admin@example.com', displayName: 'Domain Admin'},
    {accountID: 19, login: undefined, displayName: 'No Login'},

    // Stored decomposed (NFD: "e" + combining acute), unlike every other name
    {
        accountID: 20,
        login: 'rene@example.com',
        displayName: 'Rene\u0301 Dupont',
    },
    {
        accountID: ACCOUNT_IDS.CONCIERGE,
        login: CONST.EMAIL.CONCIERGE,
        displayName: 'Concierge',
    },
];

const SEARCH_QUERIES = [
    '',
    '   ',
    'a',
    'al',
    'alex smith',
    'ada byrd',
    'smith jr',
    'jr alex',
    'cole lou',
    'vit workspace',
    'ex sm',
    'vit',
    'nunez',
    'ismail',
    'strasse',
    'lukasz',
    '\u03b4\u03c5\u03c3\u03c3\u03b5\u03c5\u03c2',
    '\ud83d\udc69\u200d\ud83d\udcbb',
    'anamaria',
    'bob builder',

    // Punctuation and phone digits, which a tokenizing search splits differently from a substring match
    'obrien',
    'mary-jane',
    'firstlast',
    'last+tag',
    'x.com',
    '@example',
    'rene',
    'concierge',
    'acme',
    'example.com',
    'you',
    'me',
    'hiking',
    'thread',
    '\u03b4\u03c5\u03c3\u03c3\u03b5\u03c5\u03c3',
    'admins',
    'workspace',
    'new.person@example.com',
    '+1 650 555 0100',
    '5550006',
    '(500) 555',

    // A padded login: the displayed passes rank by the raw query, which then matches no login exactly
    ' alex.smith@example.com ',
    'to:al',
    'zzzqqq',

    // Infixes, which a substring search finds and a word-prefix index does not: in a name, a room name, a workspace subtitle and a group participant's name
    'mith',
    'ikin',
    'nounce',
    'orkspace',
    'oldings',
    'ovak',

    // Matches a thread only through its "Thread" alternate text
    'packing thread',

    // Regular expression metacharacters, which a matcher must treat literally
    '*',
    '[',
    '\\',
    '.*',

    // Query-side normalization: case, diacritics (an NFC query against the NFD-stored "René"), ß, a dotted capital I, and an existing contact's phone and the own login, which must not invite
    'V\u00edt',
    'JOS\u00c9',
    'Gro\u00df',
    'Ren\u00e9',
    '\u0130SMAIL',
    '+15005550006',
    'CURRENT.USER@EXAMPLE.COM',
];

const FIRST_NAMES = ['Ada', 'Bea', 'Cyd', 'Dan', 'Eve', 'Fay', 'Gus', 'Hal', 'Ivy', 'Jon', 'Kim', 'Lou'];
const LAST_NAMES = ['Ames', 'Byrd', 'Cole', 'Dunn', 'Eads', 'Ford', 'Gray', 'Hale'];

// Every filler gets a distinct "First Last" pair (up to FIRST_NAMES.length * LAST_NAMES.length), so no two contacts tie when sorted by name
const FILLER_CONTACT_COUNT = 40;

/** The derived name of a DM with a nameless phone-number contact. */
const FORMATTED_PHONE_LOGINS: Record<string, string> = {
    '+15005550006@expensify.sms': '(500) 555-0006',
};

/** Per-contact overrides of the generated 1:1 DM, keyed by accountID. */
const DM_OVERRIDES: Record<number, Partial<Report>> = {
    // Unread: the contact wrote last and the current user has not read it since
    [ACCOUNT_IDS.BOB_BUILDER]: {
        lastActorAccountID: ACCOUNT_IDS.BOB_BUILDER,
        lastReadTime: '2024-01-01 00:00:00.000',
        lastMessageText: 'See you at the trailhead',
    },

    // Read: the current user wrote last and read everything
    [ACCOUNT_IDS.ISMAIL_YILMAZ]: {
        lastActorAccountID: ACCOUNT_IDS.CURRENT_USER,
        lastReadTime: '2024-12-31 00:00:00.000',
        lastMessageText: 'Thanks!',
    },
};

/** A unique timestamp per report: `day` sets the coarse recency, `sequence` (unique per report, below 3600) breaks every tie. */
function timestamp(day: number, sequence: number): string {
    const minutes = String(Math.floor(sequence / 60) % 60).padStart(2, '0');
    const seconds = String(sequence % 60).padStart(2, '0');
    return `2024-01-${String((day % 28) + 1).padStart(2, '0')} 10:${minutes}:${seconds}.000`;
}

function buildPolicy(id: string, name: string, role: Policy['role']): Policy {
    return {
        id,
        name,
        type: CONST.POLICY.TYPE.TEAM,
        role,
        owner: CURRENT_USER_EMAIL,
        ownerAccountID: ACCOUNT_IDS.CURRENT_USER,
        outputCurrency: CONST.CURRENCY.USD,
    };
}

function participantsOf(accountIDs: number[], hiddenAccountIDs: number[] = []): Report['participants'] {
    const participants: NonNullable<Report['participants']> = {};
    for (const accountID of accountIDs) {
        participants[accountID] = {
            notificationPreference: hiddenAccountIDs.includes(accountID) ? CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN : CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
        };
    }
    return participants;
}

/**
 * Builds a deterministic fixture covering every searchable report type and edge case (DMs, groups, rooms, threads, tasks, expenses, and status indicators).
 * Reports have unique timestamps and contacts have unique names.
 */
function generateSearchFixture(): SearchFixture {
    const personalDetails: PersonalDetailsList = {};
    const contactAccountIDs: number[] = [];

    for (const contact of NAMED_CONTACTS) {
        personalDetails[contact.accountID] = contact;
        contactAccountIDs.push(contact.accountID);
    }
    for (let index = 0; index < FILLER_CONTACT_COUNT; index++) {
        const accountID = FIRST_FILLER_ACCOUNT_ID + index;
        const firstName = FIRST_NAMES.at(index % FIRST_NAMES.length) ?? '';
        const lastName = LAST_NAMES.at(Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length) ?? '';
        personalDetails[accountID] = {
            accountID,
            login: `${firstName}.${lastName}.${index}@example.com`.toLowerCase(),
            displayName: `${firstName} ${lastName}`,
            firstName,
            lastName,
        };
        contactAccountIDs.push(accountID);
    }

    const policies: SearchFixture['policies'] = {
        [`${ONYXKEYS.COLLECTION.POLICY}${POLICY_IDS.OWN}`]: buildPolicy(POLICY_IDS.OWN, 'V\u00edt Workspace', CONST.POLICY.ROLE.ADMIN),
        [`${ONYXKEYS.COLLECTION.POLICY}${POLICY_IDS.OTHER}`]: buildPolicy(POLICY_IDS.OTHER, 'Acme Holdings', CONST.POLICY.ROLE.USER),
    };

    const reports: SearchFixture['reports'] = {};
    const reportActions: SearchFixture['reportActions'] = {};
    const privateIsArchivedMap: Record<string, boolean> = {};
    const draftComments: SearchFixture['draftComments'] = {};
    const dmReportIDByAccountID: Record<number, string> = {};

    // Real reports always carry a reportName (shouldReportBeInOptionList drops those that don't), so it defaults to the derived name.
    const addReport = (reportIDNumber: number, report: Omit<Report, 'reportID'>, reportName: string, day: number) => {
        const reportID = String(reportIDNumber);
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const;
        if (reports[reportKey]) {
            throw new Error(`Two fixture reports share the reportID ${reportID}`);
        }
        reports[reportKey] = {
            reportID,
            reportName,
            lastVisibleActionCreated: timestamp(day, reportIDNumber - REPORT_ID_TIMESTAMP_ORIGIN),
            ...report,
        };
        return reportID;
    };

    // Assigns a 1:1 DM to roughly two-thirds of contacts, picked by accountID so adding a contact never moves another contact's DM.
    // No contact receives multiple DMs to avoid collection order dependence.
    for (const accountID of contactAccountIDs) {
        const systemDMSlot = SYSTEM_DM_SLOTS[accountID];
        if (accountID === ACCOUNT_IDS.CURRENT_USER || (!systemDMSlot && accountID % 3 === 2)) {
            continue;
        }
        const contact = personalDetails[accountID];
        const name = contact?.displayName || FORMATTED_PHONE_LOGINS[contact?.login ?? ''] || (contact?.login ?? '');
        dmReportIDByAccountID[accountID] = addReport(
            systemDMSlot?.reportID ?? DM_REPORT_ID_OFFSET + accountID,
            {
                type: CONST.REPORT.TYPE.CHAT,
                participants: participantsOf([ACCOUNT_IDS.CURRENT_USER, accountID]),
                ...DM_OVERRIDES[accountID],
            },
            name,
            systemDMSlot?.day ?? accountID % 21,
        );
    }

    // The only DM with this contact, so the contact row has exactly one DM to point at.
    const archivedDMReportID = addReport(
        2000,
        {
            type: CONST.REPORT.TYPE.CHAT,
            participants: participantsOf([ACCOUNT_IDS.CURRENT_USER, ACCOUNT_IDS.MARY_JANE_OBRIEN]),
        },
        "Mary-Jane O'Brien (archived) ",
        25,
    );
    privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${archivedDMReportID}`] = true;

    addReport(
        2001,
        {
            type: CONST.REPORT.TYPE.CHAT,
            participants: participantsOf([ACCOUNT_IDS.CURRENT_USER, ACCOUNT_IDS.ALEX_SMITH], [ACCOUNT_IDS.CURRENT_USER]),
        },
        'Alex Smith',
        26,
    );

    addReport(
        2002,
        {
            type: CONST.REPORT.TYPE.CHAT,
            participants: participantsOf([ACCOUNT_IDS.CURRENT_USER, ACCOUNT_IDS.UNKNOWN]),
        },
        '',
        6,
    );

    addReport(
        2003,
        {
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.GROUP,
            reportName: 'Weekend Hiking',
            participants: participantsOf([ACCOUNT_IDS.CURRENT_USER, ACCOUNT_IDS.JOSE_NUNEZ, ACCOUNT_IDS.VIT_NOVAK, ACCOUNT_IDS.MARY_JANE_OBRIEN]),
        },
        'Weekend Hiking',
        5,
    );

    addReport(
        2004,
        {
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            ownerAccountID: ACCOUNT_IDS.CURRENT_USER,
            participants: participantsOf([ACCOUNT_IDS.CURRENT_USER]),
        },
        'Current User (you)',
        1,
    );

    // GBR: the current user has something to do in their own workspace chat
    addReport(
        2005,
        {
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            policyID: POLICY_IDS.OWN,
            policyName: 'V\u00edt Workspace',
            isOwnPolicyExpenseChat: true,
            ownerAccountID: ACCOUNT_IDS.CURRENT_USER,
            participants: participantsOf([ACCOUNT_IDS.CURRENT_USER]),
            hasOutstandingChildRequest: true,
        },
        "Current User's expenses",
        7,
    );

    addReport(
        2006,
        {
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            policyID: POLICY_IDS.OWN,
            policyName: 'V\u00edt Workspace',
            isOwnPolicyExpenseChat: false,
            ownerAccountID: ACCOUNT_IDS.GROSS_STRASSE,
            participants: participantsOf([ACCOUNT_IDS.CURRENT_USER, ACCOUNT_IDS.GROSS_STRASSE]),
        },
        "Gro\u00df Stra\u00dfe's expenses",
        7,
    );

    addReport(
        2007,
        {
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
            policyID: POLICY_IDS.OWN,
            policyName: 'V\u00edt Workspace',
            invoiceReceiver: {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                accountID: ACCOUNT_IDS.GROSS_STRASSE,
            },
            participants: participantsOf([ACCOUNT_IDS.CURRENT_USER, ACCOUNT_IDS.GROSS_STRASSE]),
        },
        'Gro\u00df Stra\u00dfe',
        12,
    );

    const rooms = [
        [2010, CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, '#admins', POLICY_IDS.OWN, 3, {}],
        [2011, CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, '#announce', POLICY_IDS.OWN, 8, {}],

        // RBR: the room has an error
        [2012, CONST.REPORT.CHAT_TYPE.POLICY_ROOM, '#v\u00edt-room', POLICY_IDS.OTHER, 14, {errorFields: {joinRoom: {joinRoom: 'Could not join the room'}}}],
        [2013, CONST.REPORT.CHAT_TYPE.POLICY_ROOM, '#orphan-room', POLICY_IDS.MISSING, 19, {}],
    ] as const satisfies ReadonlyArray<readonly [number, Report['chatType'], string, string, number, Partial<Report>]>;
    for (const [reportID, chatType, reportName, policyID, day, reportFields] of rooms) {
        addReport(
            reportID,
            {
                type: CONST.REPORT.TYPE.CHAT,
                chatType,
                reportName,
                policyID,
                policyName: policyID === POLICY_IDS.MISSING ? 'Gone Workspace' : undefined,
                participants: participantsOf([ACCOUNT_IDS.CURRENT_USER, ACCOUNT_IDS.JOSE_NUNEZ, ACCOUNT_IDS.ISMAIL_YILMAZ]),
                ...reportFields,
            },
            reportName,
            day,
        );
    }

    // Parent chat containing comments from which subsequent threads originate
    const threadParentReportID = addReport(
        2020,
        {
            type: CONST.REPORT.TYPE.CHAT,
            participants: participantsOf([ACCOUNT_IDS.CURRENT_USER, ACCOUNT_IDS.JOSE_NUNEZ]),
        },
        'Jos\u00e9 \u00d1\u00fa\u00f1ez',
        3,
    );
    const threadParentActions: ReportActions = {};
    reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadParentReportID}`] = threadParentActions;

    // A thread is named after its parent comment, so every thread gets one in the parent DM.
    const addThread = (reportIDNumber: number, reportName: string, report: Partial<Report> = {}) => {
        const parentReportActionID = String(reportIDNumber);
        const reportID = addReport(
            reportIDNumber,
            {
                type: CONST.REPORT.TYPE.CHAT,
                parentReportID: threadParentReportID,
                parentReportActionID,
                participants: participantsOf([ACCOUNT_IDS.CURRENT_USER, ACCOUNT_IDS.JOSE_NUNEZ]),
                ...report,
            },
            reportName,
            4,
        );
        threadParentActions[parentReportActionID] = {
            reportActionID: parentReportActionID,
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            created: timestamp(3, reportIDNumber - REPORT_ID_TIMESTAMP_ORIGIN),
            actorAccountID: ACCOUNT_IDS.JOSE_NUNEZ,
            childReportID: reportID,
            message: [
                {
                    type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                    html: reportName,
                    text: reportName,
                },
            ],
        };
        return reportID;
    };

    const addReply = (threadReportID: string, text: string) => {
        reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`] = {
            '1': {
                reportActionID: '1',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                created: reports[`${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`]?.lastVisibleActionCreated ?? '',
                actorAccountID: ACCOUNT_IDS.JOSE_NUNEZ,
                message: [{type: CONST.REPORT.MESSAGE.TYPE.COMMENT, html: text, text}],
            },
        };
    };

    // Thread with replies to verify that non-empty threads are kept in options
    addReply(addThread(2021, 'Thread about the offsite'), 'Count me in');

    // Hidden for the current user. It has a reply, so the empty-thread rule cannot drop it and only the excludeHidden check that every SearchRouter call site sets keeps it out
    addReply(
        addThread(2022, 'Hidden thread', {
            participants: participantsOf([ACCOUNT_IDS.CURRENT_USER, ACCOUNT_IDS.JOSE_NUNEZ], [ACCOUNT_IDS.CURRENT_USER]),
        }),
        'Muted for now',
    );

    // Empty threads are dropped by shouldReportBeInOptionList unless a draft or a pin keeps them
    addThread(2023, 'Empty thread');
    const draftedThreadReportID = addThread(2024, 'Empty thread with a draft');
    draftComments[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${draftedThreadReportID}`] = 'unsent draft';
    addThread(2025, 'Empty pinned thread', {isPinned: true});

    // The only thread whose name lacks "thread", so a query reaches it through its "Thread" alternate text alone
    addReply(addThread(2026, 'Packing list'), 'Tent and stove');

    addReport(
        2030,
        {
            type: CONST.REPORT.TYPE.TASK,
            reportName: 'Book flights',
            parentReportID: threadParentReportID,
            ownerAccountID: ACCOUNT_IDS.CURRENT_USER,
            participants: participantsOf([ACCOUNT_IDS.CURRENT_USER, ACCOUNT_IDS.JOSE_NUNEZ]),
        },
        'Book flights',
        9,
    );

    addReport(
        2031,
        {
            type: CONST.REPORT.TYPE.EXPENSE,
            reportName: 'Offsite expenses',
            policyID: POLICY_IDS.OWN,
            ownerAccountID: ACCOUNT_IDS.CURRENT_USER,
            participants: participantsOf([ACCOUNT_IDS.CURRENT_USER]),
        },
        'Offsite expenses',
        11,
    );

    // Dropped by shouldReportBeInOptionList: an empty submitted expense report whose only action is CREATED.
    const emptySubmittedReportID = addReport(
        2032,
        {
            type: CONST.REPORT.TYPE.EXPENSE,
            reportName: 'Empty submitted report',
            policyID: POLICY_IDS.OWN,
            ownerAccountID: ACCOUNT_IDS.CURRENT_USER,
            participants: participantsOf([ACCOUNT_IDS.CURRENT_USER]),
            total: 0,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        },
        'Empty submitted report',
        13,
    );
    reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${emptySubmittedReportID}`] = {
        '1': {
            reportActionID: '1',
            actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
            created: timestamp(13, 0),
        },
    };

    // Dropped by processReport: neither a room nor any participants.
    addReport(2033, {type: CONST.REPORT.TYPE.CHAT, participants: {}}, 'Empty', 2);

    // Dropped by shouldReportBeInOptionList: still loading, so the report itself has no reportName yet.
    addReport(
        2034,
        {
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            reportName: undefined,
            policyID: POLICY_IDS.OWN,
            participants: participantsOf([ACCOUNT_IDS.CURRENT_USER, ACCOUNT_IDS.JOSE_NUNEZ]),
        },
        '#loading-room',
        27,
    );

    const conciergeReportID = dmReportIDByAccountID[ACCOUNT_IDS.CONCIERGE];
    if (!conciergeReportID) {
        throw new Error('The fixture must give the Concierge contact a DM');
    }

    return {
        personalDetails,
        reports,
        reportActions,
        policies,
        privateIsArchivedMap,
        derived: {
            reportAttributes: {},
            visibleReportActions: {},
            sortedReportActions: {
                sortedActions: {},
                lastActions: {},
                transactionThreadIDs: {},
            },
        },
        draftComments,
        conciergeReportID,
        loginList: {
            [CURRENT_USER_EMAIL]: {
                created: '2024-01-01 00:00:00.000',
                accountID: ACCOUNT_IDS.CURRENT_USER,
                partnerID: 1,
                partnerUserID: CURRENT_USER_EMAIL,
                lastLogin: '2024-01-01 00:00:00.000',
                validatedDate: '2024-01-01 00:00:00.000',
            },
        },
    };
}

/** Shared by every archived report, so an unchanged archive keeps its reference between writes. */
const ARCHIVED_REPORT_NAME_VALUE_PAIRS = {
    private_isArchived: '2024-01-27 10:00:00.000',
};

/** The account's Onyx keys and values, for every key the search reads back. */
function getOnyxEntries(fixture: SearchFixture): OnyxMultiSetInput {
    return {
        [ONYXKEYS.SESSION]: SESSION,
        [ONYXKEYS.PERSONAL_DETAILS_LIST]: fixture.personalDetails,
        [ONYXKEYS.LOGINS]: fixture.loginList,
        ...fixture.reports,
        ...fixture.reportActions,
        ...fixture.policies,
        ...fixture.draftComments,

        // Mirrors privateIsArchivedMap so module-level archived reads agree with the map passed to createFilteredOptionList
        ...Object.fromEntries(Object.keys(fixture.privateIsArchivedMap).map((key) => [key, ARCHIVED_REPORT_NAME_VALUE_PAIRS])),
    };
}

async function writeOnyxEntries(entries: OnyxMultiSetInput): Promise<SearchFixtureDerivedData> {
    await Onyx.multiSet(entries);
    await waitForBatchedUpdates();
    const [reportAttributes, visibleReportActions, sortedReportActions] = await Promise.all([
        getOnyxValue(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES),
        getOnyxValue(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS),
        getOnyxValue(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS),
    ]);

    // Without derived values every report would silently fall back to defaults the app never computed
    if (!reportAttributes?.reports || !visibleReportActions || !sortedReportActions) {
        throw new Error('Onyx did not derive the report values; call initOnyxDerivedValues before writing the fixture');
    }
    return {
        reportAttributes: reportAttributes.reports,
        visibleReportActions,
        sortedReportActions,
    };
}

/** Writes the whole account to Onyx and returns what Onyx derived from it. */
function writeSearchFixtureToOnyx(fixture: SearchFixture): Promise<SearchFixtureDerivedData> {
    return writeOnyxEntries(getOnyxEntries(fixture));
}

export {generateSearchFixture, writeSearchFixtureToOnyx, ACCOUNT_IDS, CURRENT_USER_EMAIL, POLICY_IDS, SEARCH_QUERIES};
export type {SearchFixture};
