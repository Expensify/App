import {act, cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';

import type {FloatingMessageCounterProps} from '@pages/inbox/report/FloatingMessageCounter';
import ReportActionsListFloatingMessageCounter from '@pages/inbox/report/ReportActionsList/ReportActionsListFloatingMessageCounter';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Rule} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const USER_EMAIL = 'submitter@example.com';
const OTHER_EMAIL = 'approver@example.com';
const POLICY_ID = '1';
const OTHER_POLICY_ID = '2';
const RULE_ITEM_INDEX = '1';
const RULE_KEY = `${ONYXKEYS.COLLECTION.RULE}1` as const;
const POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}` as const;
const OTHER_POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}${OTHER_POLICY_ID}` as const;

const report: Report = {
    reportID: '1',
    policyID: POLICY_ID,
    ownerAccountID: ACCOUNT_ID,
    managerID: ACCOUNT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
};

const policy: Policy = {
    id: POLICY_ID,
    name: 'Personal workspace',
    role: CONST.POLICY.ROLE.ADMIN,
    type: CONST.POLICY.TYPE.TEAM,
    owner: USER_EMAIL,
    outputCurrency: CONST.CURRENCY.USD,
    approver: USER_EMAIL,
    approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
};

const forwardingRule: Rule = {
    scope: CONST.RULES.SCOPE.POLICY,
    scopeID: POLICY_ID,
    triggers: {[RULE_ITEM_INDEX]: CONST.RULES.TRIGGERS.REPORT_SUBMIT},
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, right: USER_EMAIL},
    actions: {[RULE_ITEM_INDEX]: {name: CONST.RULES.ACTIONS.FORWARD_TO, approver: OTHER_EMAIL}},
};

const counterProps: Omit<FloatingMessageCounterProps, 'shouldShowMarkAsDoneCopy'> = {
    isActive: true,
    hasNewMessages: false,
    actionBadge: CONST.REPORT.ACTION_BADGE.SUBMIT,
    actionBadgeBrickRoadStatus: CONST.BRICK_ROAD_INDICATOR_STATUS.INFO,
};

type CounterHarnessProps = {
    report: Report;
    onParentRender: () => void;
    onListRender: () => void;
};

function SiblingList({onRender}: {onRender: () => void}) {
    onRender();
    return <View testID="sibling-list" />;
}

function CounterHarness({report: currentReport, onParentRender, onListRender}: CounterHarnessProps) {
    onParentRender();
    return (
        <View>
            <SiblingList onRender={onListRender} />
            <ReportActionsListFloatingMessageCounter
                {...counterProps}
                report={currentReport}
            />
        </View>
    );
}

async function updateOnyx(update: () => Promise<void>) {
    await act(async () => {
        await update();
        await waitForBatchedUpdates();
    });
}

async function renderCounter(currentReport = report, props = counterProps) {
    const result = render(
        <LocaleContextProvider>
            <ReportActionsListFloatingMessageCounter
                {...props}
                report={currentReport}
            />
        </LocaleContextProvider>,
    );
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return result;
}

describe('ReportActionsListFloatingMessageCounter', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: USER_EMAIL});
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: USER_EMAIL},
            [OTHER_ACCOUNT_ID]: {accountID: OTHER_ACCOUNT_ID, login: OTHER_EMAIL},
        });
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        await IntlStore.load(CONST.LOCALES.EN);
        await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.SUBMIT});
        await Onyx.set(POLICY_KEY, policy);
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        cleanup();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it.each([CONST.ONBOARDING_CHOICES.TRACK_PERSONAL, CONST.ONBOARDING_CHOICES.TRACK_BUSINESS, CONST.ONBOARDING_CHOICES.PERSONAL_SPEND])(
        'updates submit copy when onboarding changes to %s and back',
        async (choice) => {
            // Given an owned report that submits to its owner, onboarding intent is the remaining condition for the copy.
            await renderCounter();
            expect(screen.getByText('Submit')).toBeOnTheScreen();

            // When a live onboarding update selects tracking, the mounted counter must use that intent.
            await updateOnyx(() => Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice}));

            // Then tracking copy appears without requiring the report or counter props to change.
            expect(screen.getByText('Mark as done')).toBeOnTheScreen();
            expect(screen.queryByText('Submit')).toBeNull();

            await updateOnyx(() => Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.SUBMIT}));
            expect(screen.getByText('Submit')).toBeOnTheScreen();
            expect(screen.queryByText('Mark as done')).toBeNull();
        },
    );

    it('updates copy when the current policy approval mode changes', async () => {
        // Given a tracking user whose report can be marked done, requiring approval must change the action copy.
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL});
        await renderCounter();
        expect(screen.getByText('Mark as done')).toBeOnTheScreen();

        // When the workspace starts requiring approval, the existing counter must react to its policy subscription.
        await updateOnyx(() => Onyx.merge(POLICY_KEY, {approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC}));

        // Then the action is submit, and restoring submit-and-close restores tracking copy.
        expect(screen.getByText('Submit')).toBeOnTheScreen();
        await updateOnyx(() => Onyx.merge(POLICY_KEY, {approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL}));
        expect(screen.getByText('Mark as done')).toBeOnTheScreen();
    });

    it('updates copy when a rule changes the next approver', async () => {
        // Given a tracking report that submits to its owner, routing to another approver must prevent marking it done.
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL});
        await renderCounter();
        expect(screen.getByText('Mark as done')).toBeOnTheScreen();

        // When an approval rule is added while mounted, the real approval calculation must see the updated collection.
        await updateOnyx(() => Onyx.set(RULE_KEY, forwardingRule));

        // Then forwarding requires submit copy, and removing the rule restores marking done.
        expect(screen.getByText('Submit')).toBeOnTheScreen();
        await updateOnyx(() => Onyx.set(RULE_KEY, null));
        expect(screen.getByText('Mark as done')).toBeOnTheScreen();
    });

    it('updates copy when a missing policy arrives', async () => {
        // Given a tracking report whose policy has not loaded, submit copy must remain safe until policy data arrives.
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL});
        await Onyx.set(POLICY_KEY, null);
        await renderCounter();
        expect(screen.getByText('Submit')).toBeOnTheScreen();

        // When the policy loads, no report prop change should be needed to update the mounted counter.
        await updateOnyx(() => Onyx.set(POLICY_KEY, policy));

        // Then the now-known submit-and-close workspace allows tracking copy.
        expect(screen.getByText('Mark as done')).toBeOnTheScreen();
    });

    it('recalculates ownership when the report prop changes', async () => {
        // Given a tracking user viewing their own report, copy must not be reused for somebody else's report.
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL});
        const {rerender} = await renderCounter();
        expect(screen.getByText('Mark as done')).toBeOnTheScreen();

        // When navigation supplies a different owner without remounting the wrapper, report props are authoritative.
        rerender(
            <LocaleContextProvider>
                <ReportActionsListFloatingMessageCounter
                    {...counterProps}
                    report={{...report, reportID: '2', ownerAccountID: OTHER_ACCOUNT_ID}}
                />
            </LocaleContextProvider>,
        );

        // Then the new report must use submit copy even though onboarding and policy have not changed.
        expect(screen.getByText('Submit')).toBeOnTheScreen();
        expect(screen.queryByText('Mark as done')).toBeNull();
    });

    it('switches its policy subscription when the report policy changes', async () => {
        // Given two workspaces with different approval modes, a report move must select the destination workspace's copy.
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL});
        await Onyx.set(OTHER_POLICY_KEY, {...policy, id: OTHER_POLICY_ID, approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});
        const {rerender} = await renderCounter();
        expect(screen.getByText('Mark as done')).toBeOnTheScreen();

        // When the report moves, retaining the source workspace subscription would leave stale tracking copy.
        rerender(
            <LocaleContextProvider>
                <ReportActionsListFloatingMessageCounter
                    {...counterProps}
                    report={{...report, policyID: OTHER_POLICY_ID}}
                />
            </LocaleContextProvider>,
        );
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Then destination policy updates drive the copy, and source policy updates cannot override it.
        expect(screen.getByText('Submit')).toBeOnTheScreen();
        await updateOnyx(() => Onyx.merge(OTHER_POLICY_KEY, {approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL}));
        expect(screen.getByText('Mark as done')).toBeOnTheScreen();
        await updateOnyx(() => Onyx.merge(POLICY_KEY, {approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC}));
        expect(screen.getByText('Mark as done')).toBeOnTheScreen();
    });

    it.each([
        [true, 'New messages'],
        [false, 'Latest messages'],
    ] as const)('forwards message copy and click callbacks when hasNewMessages is %s', async (hasNewMessages, label) => {
        // Given no action badge, the wrapper must preserve the counter's message navigation behavior.
        const onClick = jest.fn();
        const onActionBadgePress = jest.fn();
        await renderCounter(report, {isActive: true, hasNewMessages, onClick, onActionBadgePress});

        // When the visible message pill is pressed, only message navigation should run.
        fireEvent.press(screen.getByText(label));

        // Then the message callback is forwarded without invoking action badge navigation.
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onActionBadgePress).not.toHaveBeenCalled();
    });

    it.each([
        [CONST.REPORT.ACTION_BADGE.SUBMIT, 'Submit'],
        [CONST.REPORT.ACTION_BADGE.APPROVE, 'Approve'],
        [CONST.REPORT.ACTION_BADGE.PAY, 'Pay'],
        [CONST.REPORT.ACTION_BADGE.FIX, 'Fix'],
    ] as const)('forwards the %s action badge and its press callback', async (actionBadge, label) => {
        // Given a non-tracking user, ordinary action labels must pass through the wrapper unchanged.
        const onClick = jest.fn();
        const onActionBadgePress = jest.fn();
        await renderCounter(report, {...counterProps, actionBadge, onClick, onActionBadgePress});

        // When the action pill is pressed, it should retain its own navigation rather than message navigation.
        fireEvent.press(screen.getByText(label));

        // Then badge navigation is forwarded and message navigation remains untouched.
        expect(onActionBadgePress).toHaveBeenCalledTimes(1);
        expect(onClick).not.toHaveBeenCalled();
        expect(screen.queryByText('Latest messages')).toBeNull();
    });

    it('keeps action navigation when submit copy changes to mark as done', async () => {
        // Given a mounted submit action, changing its copy must not change which navigation callback it uses.
        const onClick = jest.fn();
        const onActionBadgePress = jest.fn();
        await renderCounter(report, {...counterProps, onClick, onActionBadgePress});

        // When tracking copy replaces submit copy, the newly labeled pill should keep the action handler.
        await updateOnyx(() => Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL}));
        fireEvent.press(screen.getByText('Mark as done'));

        // Then the action callback runs exactly once, without scrolling to the latest messages instead.
        expect(onActionBadgePress).toHaveBeenCalledTimes(1);
        expect(onClick).not.toHaveBeenCalled();
    });

    it('keeps onboarding, policy, and rule updates inside the counter subtree', async () => {
        // Given a parent and sibling list with no copy subscriptions, counter updates must not repeat list rendering work.
        const onParentRender = jest.fn();
        const onListRender = jest.fn();
        render(
            <LocaleContextProvider>
                <CounterHarness
                    report={report}
                    onParentRender={onParentRender}
                    onListRender={onListRender}
                />
            </LocaleContextProvider>,
        );
        await act(async () => {
            await waitForBatchedUpdates();
        });
        expect(screen.getByText('Submit')).toBeOnTheScreen();
        expect(screen.getByTestId('sibling-list')).toBeOnTheScreen();
        const parentRenderCount = onParentRender.mock.calls.length;
        const listRenderCount = onListRender.mock.calls.length;

        // When each source of counter copy changes, the visible label proves the update actually reached the counter.
        await updateOnyx(() => Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL}));
        expect(screen.getByText('Mark as done')).toBeOnTheScreen();
        await updateOnyx(() => Onyx.merge(POLICY_KEY, {approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC}));
        expect(screen.getByText('Submit')).toBeOnTheScreen();
        await updateOnyx(() => Onyx.merge(POLICY_KEY, {approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL}));
        expect(screen.getByText('Mark as done')).toBeOnTheScreen();
        await updateOnyx(() => Onyx.set(RULE_KEY, forwardingRule));
        expect(screen.getByText('Submit')).toBeOnTheScreen();
        await updateOnyx(() => Onyx.set(RULE_KEY, null));
        expect(screen.getByText('Mark as done')).toBeOnTheScreen();

        // Then subscription notifications stay below the parent and do not rerender its sibling list.
        expect(onParentRender).toHaveBeenCalledTimes(parentRenderCount);
        expect(onListRender).toHaveBeenCalledTimes(listRenderCount);
    });
});
