import {renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useCardPreferredWorkspace, {CARD_PREFERRED_WORKSPACE_STATE} from '@hooks/useCardPreferredWorkspace';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, Policy} from '@src/types/onyx';
import type {CardEmployeeDefaultWorkspace} from '@src/types/onyx/Card';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useEnvironment', () => jest.fn(() => ({environmentURL: 'https://new.expensify.com'})));

// Reimplements only the `workspace.card.preferredWorkspace.*` copy this hook uses (mirroring src/languages/en.ts),
// so assertions can check the real English strings without bootstrapping the full i18n provider tree.
const mockTranslate = jest.fn((key: string, ...args: string[]) => {
    switch (key) {
        case 'workspace.card.preferredWorkspace.title':
            return 'Preferred workspace';
        case 'workspace.card.preferredWorkspace.none':
            return 'None';
        case 'workspace.card.preferredWorkspace.unknownWorkspace':
            return 'Unknown workspace';
        case 'workspace.card.preferredWorkspace.employeeDefault':
            return `${args.at(0)} (Employee default)`;
        case 'workspace.card.preferredWorkspace.noneEmployeeDefault':
            return 'None (Employee default)';
        case 'workspace.card.preferredWorkspace.employeeDefaultOption':
            return `Employee default (${args.at(0)})`;
        case 'workspace.card.preferredWorkspace.employeeDefaultOptionUnknown':
            return 'Employee default';
        case 'workspace.card.preferredWorkspace.submissionsDisabled':
            return `<a href="${args.at(0)}">Submissions</a> must be enabled to configure this setting.`;
        case 'workspace.card.preferredWorkspace.domainGroupEnforced':
            return `The preferred workspace is enforced via <a href="${args.at(0)}">domain group settings</a>.`;
        default:
            return key;
    }
});

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: mockTranslate}),
}));

const CARDHOLDER_ACCOUNT_ID = 111;
const CARDHOLDER_EMAIL = 'cardholder@example.com';
const VISIBLE_POLICY_ID = 'visiblePolicy';

/**
 * A workspace the viewer belongs to, so it shows up in `ONYXKEYS.COLLECTION.POLICY` and in `eligiblePolicyIDs`.
 * The employee default deliberately is NOT one of these in most cases below: the whole point of the backend
 * `employeeDefault` object is to describe a workspace the card admin cannot see.
 */
const visiblePolicy: Policy = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'Visible workspace'),
    id: VISIBLE_POLICY_ID,
    owner: CARDHOLDER_EMAIL,
    autoReporting: true,
    pendingAction: null,
    archivedDate: undefined,
    employeeList: {[CARDHOLDER_EMAIL]: {email: CARDHOLDER_EMAIL, role: CONST.POLICY.ROLE.ADMIN}},
};

/** The cardholder's own workspace, resolved server-side. Never written to Onyx — the viewer is not a member. */
const INVISIBLE_DEFAULT: CardEmployeeDefaultWorkspace = {
    policyID: 'cardholdersOwnPolicy',
    name: "Cardholder's workspace",
    autoReporting: true,
    isEnforcedByDomainGroup: false,
};

function buildCard(nameValuePairs: Partial<NonNullable<Card['nameValuePairs']>> = {}): Card {
    return createMock<Card>({
        cardID: 1,
        accountID: CARDHOLDER_ACCOUNT_ID,
        nameValuePairs,
    });
}

async function setPolicies(policies: Policy[]) {
    await Onyx.multiSet(toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, policies, (policy) => policy.id));
}

async function setCardholder() {
    await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        [CARDHOLDER_ACCOUNT_ID]: {accountID: CARDHOLDER_ACCOUNT_ID, login: CARDHOLDER_EMAIL},
    });
    // The viewer is the card admin, not the cardholder — the eligible-workspace filter is scoped to both.
    await Onyx.merge(ONYXKEYS.SESSION, {email: 'admin@example.com'});
}

describe('useCardPreferredWorkspace', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await setCardholder();
    });

    it('locks to the domain-group-enforced workspace, ignoring any card-level pin', async () => {
        // Given a card pinned to one workspace while the cardholder's domain group enforces another
        await setPolicies([visiblePolicy]);
        const card = buildCard({
            preferredPolicy: 'somePinnedPolicy',
            employeeDefault: {...INVISIBLE_DEFAULT, isEnforcedByDomainGroup: true},
        });

        // When the row resolves
        const {result} = renderHook(() => useCardPreferredWorkspace(card), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        // Then the domain group wins over the pin, and the row is read-only with an explanatory link
        expect(result.current.state).toBe(CARD_PREFERRED_WORKSPACE_STATE.DOMAIN_GROUP_LOCK);
        expect(result.current.title).toBe(INVISIBLE_DEFAULT.name);
        expect(result.current.isInteractive).toBe(false);
        expect(result.current.helperText).toBeTruthy();
    });

    it('falls back to "Unknown workspace" when a domain group enforces a workspace that resolves to no policyID', async () => {
        // Given the documented combination: the group enforces a workspace the cardholder is not a member of,
        // and they have no active workspace either, so the chain resolves to nothing
        await setPolicies([visiblePolicy]);
        const card = buildCard({
            employeeDefault: {policyID: '', name: '', autoReporting: false, isEnforcedByDomainGroup: true},
        });

        // When the row resolves
        const {result} = renderHook(() => useCardPreferredWorkspace(card), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        // Then the row still locks, since the flag alone establishes that the admin cannot change this
        expect(result.current.state).toBe(CARD_PREFERRED_WORKSPACE_STATE.DOMAIN_GROUP_LOCK);
        expect(result.current.title).toBe('Unknown workspace');
        expect(result.current.isInteractive).toBe(false);
    });

    it('shows None, interactive, when the card is explicitly pinned to none', async () => {
        // Given a card pinned to the explicit "None" sentinel
        await setPolicies([visiblePolicy]);
        const card = buildCard({preferredPolicy: CONST.CARD_PREFERRED_POLICY.NONE});

        // When the row resolves
        const {result} = renderHook(() => useCardPreferredWorkspace(card), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        // Then it reads as None but stays editable, so the admin can undo the opt-out
        expect(result.current.state).toBe(CARD_PREFERRED_WORKSPACE_STATE.NONE);
        expect(result.current.title).toBe('None');
        expect(result.current.isInteractive).toBe(true);
    });

    it('shows the pinned workspace name when the pin points at a live eligible policy', async () => {
        // Given a card pinned to a workspace the viewer can see and that is still eligible
        await setPolicies([visiblePolicy]);
        const card = buildCard({preferredPolicy: VISIBLE_POLICY_ID, employeeDefault: INVISIBLE_DEFAULT});

        // When the row resolves
        const {result} = renderHook(() => useCardPreferredWorkspace(card), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        // Then the pin wins over the employee default and is named plainly, with no "(Employee default)" suffix
        expect(result.current.state).toBe(CARD_PREFERRED_WORKSPACE_STATE.CUSTOM);
        expect(result.current.title).toBe('Visible workspace');
        expect(result.current.isInteractive).toBe(true);
    });

    it('falls back to the employee default when the pinned workspace is archived', async () => {
        // Given a pin pointing at a workspace that has since been archived, so it is no longer eligible
        const archivedPolicy: Policy = {...visiblePolicy, id: 'archivedPolicy', name: 'Archived workspace', archivedDate: '2024-01-01'};
        await setPolicies([visiblePolicy, archivedPolicy]);
        const card = buildCard({preferredPolicy: 'archivedPolicy', employeeDefault: INVISIBLE_DEFAULT});

        // When the row resolves
        const {result} = renderHook(() => useCardPreferredWorkspace(card), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        // Then it does not present the stale pin as a live custom value, and describes the fallback instead
        expect(result.current.state).not.toBe(CARD_PREFERRED_WORKSPACE_STATE.CUSTOM);
        expect(result.current.title).toContain(INVISIBLE_DEFAULT.name);
    });

    it('names the employee default from the backend snapshot even though the viewer cannot see that workspace', async () => {
        // Given an employee default the viewer is not a member of, plus two other workspaces to choose between
        const otherPolicy: Policy = {...visiblePolicy, id: 'otherPolicy', name: 'Other workspace'};
        await setPolicies([visiblePolicy, otherPolicy]);
        const card = buildCard({employeeDefault: INVISIBLE_DEFAULT});

        // When the row resolves
        const {result} = renderHook(() => useCardPreferredWorkspace(card), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        // Then the snapshot name renders, which is the case a local policy lookup could never serve
        expect(result.current.state).toBe(CARD_PREFERRED_WORKSPACE_STATE.EMPLOYEE_DEFAULT);
        expect(result.current.title).toBe("Cardholder's workspace (Employee default)");
        expect(result.current.isInteractive).toBe(true);
    });

    it('does not count a join-request-pending workspace as an alternative, since the picker hides those', async () => {
        // Given one eligible workspace plus a second the cardholder is on but that the picker's `useWorkspaceList`
        // skips because a join request is still pending
        const joinPendingPolicy: Policy = {...visiblePolicy, id: 'joinPendingPolicy', name: 'Join pending workspace', isJoinRequestPending: true};
        await setPolicies([visiblePolicy, joinPendingPolicy]);
        const card = buildCard({employeeDefault: INVISIBLE_DEFAULT});

        // When the row resolves
        const {result} = renderHook(() => useCardPreferredWorkspace(card), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        // Then the row stays read-only rather than offering a picker that would list only one workspace
        expect(result.current.state).toBe(CARD_PREFERRED_WORKSPACE_STATE.EMPLOYEE_DEFAULT_ONLY_OPTION);
        expect(result.current.isInteractive).toBe(false);
    });

    it('makes the employee default read-only when there is only one workspace to choose between', async () => {
        // Given exactly one eligible workspace, so the picker would have nothing to offer
        await setPolicies([visiblePolicy]);
        const card = buildCard({employeeDefault: INVISIBLE_DEFAULT});

        // When the row resolves
        const {result} = renderHook(() => useCardPreferredWorkspace(card), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        // Then the row still names the default but drops the chevron
        expect(result.current.state).toBe(CARD_PREFERRED_WORKSPACE_STATE.EMPLOYEE_DEFAULT_ONLY_OPTION);
        expect(result.current.title).toBe("Cardholder's workspace (Employee default)");
        expect(result.current.isInteractive).toBe(false);
    });

    it('reads submissions state off the snapshot, linking to the invisible default workspace when alternatives exist', async () => {
        // Given an employee default with submissions disabled, known only from the snapshot, plus an alternative
        await setPolicies([visiblePolicy]);
        const card = buildCard({employeeDefault: {...INVISIBLE_DEFAULT, autoReporting: false}});

        // When the row resolves
        const {result} = renderHook(() => useCardPreferredWorkspace(card), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        // Then the row explains why the default is unusable and deep-links to that workspace's Workflows page,
        // while staying editable because the admin can still pick the alternative
        expect(result.current.state).toBe(CARD_PREFERRED_WORKSPACE_STATE.SUBMISSIONS_DISABLED);
        expect(result.current.title).toBe('None (Employee default)');
        expect(result.current.isInteractive).toBe(true);
        expect(result.current.helperText).toContain(`workspaces/${INVISIBLE_DEFAULT.policyID}/workflows`);
    });

    it('locks the row when the snapshot says submissions are disabled and there is no alternative workspace', async () => {
        // Given an employee default with submissions disabled and no eligible workspace to switch to
        const card = buildCard({employeeDefault: {...INVISIBLE_DEFAULT, autoReporting: false}});

        // When the row resolves
        const {result} = renderHook(() => useCardPreferredWorkspace(card), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        // Then there is nothing to configure, so the row is read-only, reads as a bare None per the spec, and
        // still explains why
        expect(result.current.state).toBe(CARD_PREFERRED_WORKSPACE_STATE.SUBMISSIONS_DISABLED_LOCKED);
        expect(result.current.title).toBe('None');
        expect(result.current.isInteractive).toBe(false);
        expect(result.current.helperText).toContain(`workspaces/${INVISIBLE_DEFAULT.policyID}/workflows`);
    });

    it('still reads as following the employee default when the backend sent no employeeDefault object at all', async () => {
        // Given no employeeDefault object, which means the backend found neither a fallback nor an enforcing group
        const otherPolicy: Policy = {...visiblePolicy, id: 'otherPolicy', name: 'Other workspace'};
        await setPolicies([visiblePolicy, otherPolicy]);
        const card = buildCard({});

        // When the row resolves
        const {result} = renderHook(() => useCardPreferredWorkspace(card), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        // Then it makes no claim about a workspace or about submissions, but still lets the admin pick one
        expect(result.current.state).toBe(CARD_PREFERRED_WORKSPACE_STATE.EMPLOYEE_DEFAULT_UNKNOWN);
        expect(result.current.title).toBe('None (Employee default)');
        expect(result.current.isInteractive).toBe(true);
        expect(result.current.helperText).toBeUndefined();
    });

    it('treats a null employeeDefault like an absent one, so a server-sent clear takes effect', async () => {
        // Given the backend nulled the object, which is how a company card clears a default that no longer
        // applies — the key is always sent, so null is the clear signal rather than omission
        await setPolicies([visiblePolicy]);
        const card = buildCard({employeeDefault: null});

        // When the row resolves
        const {result} = renderHook(() => useCardPreferredWorkspace(card), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        // Then the stale default is not resurrected from the nulled value
        expect(result.current.state).toBe(CARD_PREFERRED_WORKSPACE_STATE.EMPLOYEE_DEFAULT_UNKNOWN);
        expect(result.current.employeeDefaultPolicyID).toBeUndefined();
        expect(result.current.employeeDefaultPolicyName).toBeUndefined();
    });

    it('stays read-only when there is no employee default and no eligible workspaces', async () => {
        // Given neither a backend default nor any workspace the admin could pick
        const card = buildCard({});

        // When the row resolves
        const {result} = renderHook(() => useCardPreferredWorkspace(card), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        // Then there is nothing to show and nothing to configure
        expect(result.current.state).toBe(CARD_PREFERRED_WORKSPACE_STATE.EMPLOYEE_DEFAULT_UNKNOWN);
        expect(result.current.title).toBe('None (Employee default)');
        expect(result.current.isInteractive).toBe(false);
    });
});
