import type {FilterConfig, IsItemInFilterCallback} from '@components/Table';
import type {DomainMemberRowData, DomainMembersTableFilterKey} from '@components/Tables/DomainMembersTable';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Domain, PersonalDetails} from '@src/types/onyx';
import type DomainErrors from '@src/types/onyx/DomainErrors';
import type {DomainMemberErrors} from '@src/types/onyx/DomainErrors';
import type DomainPendingActions from '@src/types/onyx/DomainPendingActions';

import type {DomainSecurityGroupWithID} from '@selectors/Domain';

import Onyx from 'react-native-onyx';

/* eslint-disable @typescript-eslint/naming-convention -- mock domain Onyx keys and group ids */

/**
 * Local-only mock domain for testing Domain Members (filters, search, errors).
 * Do not commit with SHOULD_USE_MOCK_DOMAIN_MEMBERS enabled for production.
 *
 * How to test:
 * 1. Keep SHOULD_USE_MOCK_DOMAIN_MEMBERS = true (default in __DEV__)
 * 2. Settings → Domains → open "fishnone.com"
 * 3. Domain → Members — 3 groups, members, filter bar
 *
 * Direct route: domain/888888/members
 */

/** Flip to false when done testing. Only applies in __DEV__ builds. */
const SHOULD_USE_MOCK_DOMAIN_MEMBERS = __DEV__;

const MOCK_DOMAIN_ACCOUNT_ID = 888_888;
const MOCK_DOMAIN_EMAIL = 'admin@fishnone.com';
const MOCK_ERROR_TIMESTAMP = 'mock-domain-members-error';
const MOCK_MEMBER_ID_START = 900_001;

type MockMemberConfig = {
    group: '1' | '2' | '3';
    name: string;
    email: string;
    optimistic?: boolean;
    pendingAction?: 'add' | 'update' | 'delete';
    lockAccount?: 'add';
    changeDomainSecurityGroup?: 'update';
    rowError?: string;
    vacationDelegateErrors?: string;
    twoFactorAuthExemptEmailsError?: string;
    changeDomainSecurityGroupErrors?: string;
};

type MockDomainMembersPageData = {
    memberAccountIDs: number[];
    personalDetailsByAccountID: Record<number, PersonalDetails>;
    domainPendingActions: NonNullable<DomainPendingActions['member']>;
    domainErrors: DomainErrors;
    groups: DomainSecurityGroupWithID[];
    filterConfig: FilterConfig<DomainMembersTableFilterKey>;
    isItemInFilter: IsItemInFilterCallback<DomainMemberRowData>;
    shouldShowGroupFilter: boolean;
    shouldShowGroupColumn: boolean;
    defaultSecurityGroupID: string;
};

const MOCK_MEMBERS: MockMemberConfig[] = [
    {group: '1', name: '[Error] Billing Owner', email: 'inline.error.demo@fishnone.com', rowError: 'Billing owner error: long message shown under the row with a dismiss X.'},
    {group: '1', name: '[Error] Vacation Delegate', email: 'vacation.error.demo@fishnone.com', vacationDelegateErrors: 'Vacation delegate error: shown inline under the row.'},
    {group: '1', name: 'Alice Anderson', email: 'alice.anderson@fishnone.com'},
    {group: '1', name: 'Pending Delete User', email: 'pending.delete@fishnone.com', pendingAction: 'delete'},
    {group: '1', name: 'Optimistic Invite', email: 'optimistic.invite@fishnone.com', optimistic: true},
    {group: '1', name: 'Pending Add User', email: 'pending.add@fishnone.com', pendingAction: 'add'},
    {group: '2', name: 'Bob Marketing', email: 'bob.marketing@fishnone.com'},
    {group: '2', name: 'Carol Campaign', email: 'carol.campaign@fishnone.com'},
    {group: '2', name: 'David Digital', email: 'david.digital@fishnone.com'},
    {group: '2', name: 'Eva Email', email: 'eva.email@fishnone.com'},
    {group: '2', name: 'Frank Funnel', email: 'frank.funnel@fishnone.com'},
    {group: '3', name: 'Noah North', email: 'noah.north@fishnone.com'},
    {group: '3', name: 'Olivia Outbound', email: 'olivia.outbound@fishnone.com'},
    {group: '3', name: 'Paul Pipeline', email: 'paul.pipeline@fishnone.com'},
    {group: '3', name: 'Quinn Quota', email: 'quinn.quota@fishnone.com'},
    {group: '3', name: 'Rita Revenue', email: 'rita.revenue@fishnone.com'},
];

function shouldUseMockDomainMembers(): boolean {
    return SHOULD_USE_MOCK_DOMAIN_MEMBERS;
}

function buildMockDomainMembersData(allMembersLabel: string): MockDomainMembersPageData {
    const groupShared: Record<'1' | '2' | '3', Record<string, 'read'>> = {
        '1': {},
        '2': {},
        '3': {},
    };

    const memberAccountIDs: number[] = [];
    const personalDetailsByAccountID: Record<number, PersonalDetails> = {};
    const domainPendingActions: NonNullable<DomainPendingActions['member']> = {};
    const memberErrors: NonNullable<DomainErrors['memberErrors']> = {};

    for (const [index, member] of MOCK_MEMBERS.entries()) {
        const accountID = MOCK_MEMBER_ID_START + index;
        const idKey = String(accountID);

        memberAccountIDs.push(accountID);
        groupShared[member.group][idKey] = 'read';

        personalDetailsByAccountID[accountID] = {
            accountID,
            login: member.email,
            displayName: member.name,
            avatar: '',
            ...(member.optimistic ? {isOptimisticPersonalDetail: true} : {}),
        };

        const pending: NonNullable<DomainPendingActions['member']>[string] = {};
        if (member.pendingAction) {
            pending.pendingAction = member.pendingAction;
        }
        if (member.lockAccount) {
            pending.lockAccount = member.lockAccount;
        }
        if (member.changeDomainSecurityGroup) {
            pending.changeDomainSecurityGroup = member.changeDomainSecurityGroup;
        }

        if (Object.keys(pending).length > 0) {
            domainPendingActions[member.email] = pending;
            domainPendingActions[accountID] = pending;
        }

        const errors: DomainMemberErrors = {errors: {}};
        if (member.rowError) {
            errors.errors = {[MOCK_ERROR_TIMESTAMP]: member.rowError};
        }
        if (member.vacationDelegateErrors) {
            errors.vacationDelegateErrors = {[MOCK_ERROR_TIMESTAMP]: member.vacationDelegateErrors};
        }
        if (member.twoFactorAuthExemptEmailsError) {
            errors.twoFactorAuthExemptEmailsError = {[MOCK_ERROR_TIMESTAMP]: member.twoFactorAuthExemptEmailsError};
        }
        if (member.changeDomainSecurityGroupErrors) {
            errors.changeDomainSecurityGroupErrors = {[MOCK_ERROR_TIMESTAMP]: member.changeDomainSecurityGroupErrors};
        }

        if (member.rowError || member.vacationDelegateErrors || member.twoFactorAuthExemptEmailsError || member.changeDomainSecurityGroupErrors) {
            memberErrors[member.email] = errors;
            memberErrors[accountID] = errors;
        }
    }

    const groups: DomainSecurityGroupWithID[] = [
        {
            id: '1',
            details: {
                name: 'Engineering',
                shared: groupShared['1'],
                enableRestrictedPrimaryLogin: false,
                enableRestrictedPolicyCreation: false,
            },
        },
        {
            id: '2',
            details: {
                name: 'Marketing',
                shared: groupShared['2'],
                enableRestrictedPrimaryLogin: false,
                enableRestrictedPolicyCreation: false,
            },
        },
        {
            id: '3',
            details: {
                name: 'Sales',
                shared: groupShared['3'],
                enableRestrictedPrimaryLogin: false,
                enableRestrictedPolicyCreation: false,
            },
        },
    ];

    const filterConfig: FilterConfig<DomainMembersTableFilterKey> = {
        group: {
            label: allMembersLabel,
            filterType: CONST.TABLES.FILTER_TYPE.SINGLE_SELECT,
            options: groups.map((group) => ({label: group.details.name ?? '', value: group.id})),
        },
    };

    const isItemInFilter: IsItemInFilterCallback<DomainMemberRowData> = (item, filterValues) => {
        const filterValue = filterValues.at(0);
        const matchedGroup = groups.find((group) => group.id === filterValue);

        if (!matchedGroup) {
            return true;
        }

        return String(item.accountID) in matchedGroup.details.shared;
    };

    return {
        memberAccountIDs,
        personalDetailsByAccountID,
        domainPendingActions,
        domainErrors: {
            errors: {},
            memberErrors,
            setTwoFactorAuthRequiredError: {[MOCK_ERROR_TIMESTAMP]: 'Mock members settings error for gear brick road'},
        },
        groups,
        filterConfig,
        isItemInFilter,
        shouldShowGroupFilter: true,
        shouldShowGroupColumn: true,
        defaultSecurityGroupID: '1',
    };
}

function getMockDomainMembersPageData(allMembersLabel: string): MockDomainMembersPageData {
    return buildMockDomainMembersData(allMembersLabel);
}

function buildMockDomainForOnyx(currentUserAccountID: number, groups: DomainSecurityGroupWithID[]): Domain {
    const domain: Record<string, unknown> = {
        validated: true,
        accountID: MOCK_DOMAIN_ACCOUNT_ID,
        email: MOCK_DOMAIN_EMAIL,
        domain_defaultSecurityGroupID: '1',
        [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}0`]: currentUserAccountID,
    };

    for (const group of groups) {
        domain[`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${group.id}`] = group.details;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- mock domain shape matches Onyx Domain
    return domain as Domain;
}

let hasSeededMockDomain = false;

/** Seeds mock domain + members into Onyx. Safe to call multiple times (runs once). */
function seedMockDomainToOnyx(currentUserAccountID: number): void {
    if (!shouldUseMockDomainMembers() || !currentUserAccountID || hasSeededMockDomain) {
        return;
    }

    hasSeededMockDomain = true;

    const mockData = buildMockDomainMembersData('All Members');
    const domain = buildMockDomainForOnyx(currentUserAccountID, mockData.groups);

    /* eslint-disable rulesdir/prefer-actions-set-data -- dev-only local mock seed */
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${MOCK_DOMAIN_ACCOUNT_ID}`, domain);
    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, mockData.personalDetailsByAccountID);
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${MOCK_DOMAIN_ACCOUNT_ID}`, mockData.domainErrors);
    Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${MOCK_DOMAIN_ACCOUNT_ID}`, {member: mockData.domainPendingActions});
    /* eslint-enable rulesdir/prefer-actions-set-data */
}

export {getMockDomainMembersPageData, MOCK_DOMAIN_ACCOUNT_ID, seedMockDomainToOnyx, shouldUseMockDomainMembers};
export type {MockDomainMembersPageData};
