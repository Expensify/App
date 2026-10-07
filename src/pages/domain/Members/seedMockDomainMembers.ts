import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Domain} from '@src/types/onyx';
import type PersonalDetails from '@src/types/onyx/PersonalDetails';

import Onyx from 'react-native-onyx';

/** Fixed account ID for the mock domain — safe to navigate to directly after seeding. */
const MOCK_DOMAIN_ACCOUNT_ID = 999999;

const MOCK_DOMAIN_EMAIL = '+@mocktestdomain.com';

const MOCK_GROUP_IDS = {
    ENGINEERING: '10001',
    SALES: '10002',
} as const;

type MockMember = {
    accountID: number;
    login: string;
    displayName: string;
    groupID: (typeof MOCK_GROUP_IDS)[keyof typeof MOCK_GROUP_IDS];
};

const MOCK_MEMBERS: MockMember[] = [
    {accountID: 900001, login: 'alice@mocktestdomain.com', displayName: 'Alice Anderson', groupID: MOCK_GROUP_IDS.ENGINEERING},
    {accountID: 900002, login: 'bob@mocktestdomain.com', displayName: 'Bob Baker', groupID: MOCK_GROUP_IDS.ENGINEERING},
    {accountID: 900003, login: 'carol@mocktestdomain.com', displayName: 'Carol Chen', groupID: MOCK_GROUP_IDS.ENGINEERING},
    {accountID: 900004, login: 'dan@mocktestdomain.com', displayName: 'Dan Davis', groupID: MOCK_GROUP_IDS.SALES},
    {accountID: 900005, login: 'eve@mocktestdomain.com', displayName: 'Eve Evans', groupID: MOCK_GROUP_IDS.SALES},
    {accountID: 900006, login: 'frank@mocktestdomain.com', displayName: 'Frank Foster', groupID: MOCK_GROUP_IDS.SALES},
];

function buildSharedMembers(groupID: MockMember['groupID'], currentUserAccountID?: number): Record<string, 'read'> {
    const shared: Record<string, 'read'> = {};

    for (const member of MOCK_MEMBERS) {
        if (member.groupID === groupID) {
            shared[String(member.accountID)] = 'read';
        }
    }

    if (currentUserAccountID && !MOCK_MEMBERS.some((member) => member.accountID === currentUserAccountID)) {
        shared[String(currentUserAccountID)] = 'read';
    }

    return shared;
}

function buildMockDomain(currentUserAccountID: number): Domain {
    return {
        validated: true,
        accountID: MOCK_DOMAIN_ACCOUNT_ID,
        email: MOCK_DOMAIN_EMAIL,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        domain_defaultSecurityGroupID: MOCK_GROUP_IDS.ENGINEERING,
        [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}0`]: currentUserAccountID,
        [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${MOCK_GROUP_IDS.ENGINEERING}`]: {
            name: 'Engineering',
            enableRestrictedPrimaryLogin: false,
            enableRestrictedPolicyCreation: false,
            shared: buildSharedMembers(MOCK_GROUP_IDS.ENGINEERING, currentUserAccountID),
        },
        [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${MOCK_GROUP_IDS.SALES}`]: {
            name: 'Sales',
            enableRestrictedPrimaryLogin: false,
            enableRestrictedPolicyCreation: false,
            shared: buildSharedMembers(MOCK_GROUP_IDS.SALES),
        },
    };
}

function buildPersonalDetailsUpdates(): Record<number, PersonalDetails> {
    return Object.fromEntries(
        MOCK_MEMBERS.map((member) => [
            member.accountID,
            {
                accountID: member.accountID,
                login: member.login,
                displayName: member.displayName,
            },
        ]),
    );
}

/**
 * Seeds a mock domain with members into Onyx for local development testing.
 * The current user is granted domain admin access and added to the Engineering group.
 */
function seedMockDomainMembers(currentUserAccountID?: number): Promise<number> {
    if (!currentUserAccountID) {
        return Promise.reject(new Error('seedMockDomainMembers requires a signed-in user accountID'));
    }

    const domain = buildMockDomain(currentUserAccountID);
    const personalDetailsUpdates = buildPersonalDetailsUpdates();

    return Promise.all([Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${MOCK_DOMAIN_ACCOUNT_ID}`, domain), Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsUpdates)]).then(
        () => MOCK_DOMAIN_ACCOUNT_ID,
    );
}

export {MOCK_DOMAIN_ACCOUNT_ID, seedMockDomainMembers};
