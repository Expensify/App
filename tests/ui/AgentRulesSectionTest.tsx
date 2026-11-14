import {act, fireEvent, render, renderHook, screen, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import Icon from '@components/Icon';
import type ImageSVGProps from '@components/ImageSVG/types';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';
import UserPill from '@components/UserPill';

import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';
import AgentRulesSection from '@pages/workspace/rules/AgentRulesSection';
import RulesAgentsTab from '@pages/workspace/rules/tabs/RulesAgentsTab';

import FontUtils from '@styles/utils/FontUtils';

import * as Modal from '@userActions/Modal';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {AgentRule} from '@src/types/onyx/Policy';

import type {View as NativeView} from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import findAncestorByType from '../utils/findAncestorByType';
import findAncestorWithStyle from '../utils/findAncestorWithStyle';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// The lazy asset mock supplies objects rather than native SVG components, so keep a visible image boundary.
jest.mock('@components/ImageSVG', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<{View: typeof NativeView}>('react-native');
    return ({src}: ImageSVGProps) => (src ? ReactModule.createElement(View, {testID: 'image-svg'}) : null);
});

// The pill's tooltip needs a navigator; its actual avatar and text still render in the section header.
jest.mock(
    '@components/UserDetailsTooltip',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock('@libs/Navigation/Navigation');
jest.mock('@userActions/Modal', () => ({
    ...jest.requireActual<typeof Modal>('@userActions/Modal'),
    close: jest.fn(),
}));

const POLICY_ID = '1A2B3C4D5E6F7788';
const POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}` as const;
const OWNER_EMAIL = 'owner@example.com';
const RULE_ID = '1001';
const OTHER_RULE_ID = '1002';
const NEWEST_RULE_ID = '1003';
const RULE_TITLE = 'Receipt review';
const OTHER_RULE_TITLE = 'Meal review';
const ERROR_MESSAGE = 'The receipt rule could not be saved.';
const OTHER_ERROR_MESSAGE = 'The meal rule could not be saved.';
const ERROR_KEY = '1';
const OTHER_ERROR_KEY = '2';
const RULE_BOT_ACCOUNT_ID = 777;
const RULE_BOT_EMAIL = 'agent_777@expensify.ai';
const RULE_BOT_AVATAR = 'https://example.com/rulebot.png';
const SAFE_AREA_METRICS = {
    frame: {x: 0, y: 0, width: 1440, height: 1000},
    insets: {top: 0, right: 0, bottom: 0, left: 0},
};

const callers = [
    {name: 'section', Component: AgentRulesSection},
    {name: 'Agents tab', Component: RulesAgentsTab},
] as const;

type EnforcementCase = {
    state: string;
    ruleBotAccountID: number | undefined;
    employeeList: NonNullable<Policy['employeeList']>;
    shouldShowPill: boolean;
};

const enforcementCases: EnforcementCase[] = [
    {state: 'active member', ruleBotAccountID: RULE_BOT_ACCOUNT_ID, employeeList: {[RULE_BOT_EMAIL]: {}}, shouldShowPill: true},
    {
        state: 'pending removal',
        ruleBotAccountID: RULE_BOT_ACCOUNT_ID,
        employeeList: {[RULE_BOT_EMAIL]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}},
        shouldShowPill: false,
    },
    {state: 'removed member', ruleBotAccountID: RULE_BOT_ACCOUNT_ID, employeeList: {}, shouldShowPill: false},
    {state: 'no bot', ruleBotAccountID: undefined, employeeList: {}, shouldShowPill: false},
];

function createRule(ruleID: string = RULE_ID, overrides: Partial<AgentRule> = {}): AgentRule {
    return {
        ruleID,
        prompt: 'Review the sample receipt.',
        title: RULE_TITLE,
        created: '2026-01-01 00:00:00',
        ...overrides,
    };
}

async function setPolicyAgentRules(agentRules: Record<string, AgentRule> | undefined, overrides: Partial<Policy> = {}) {
    const policy: Policy = {
        id: POLICY_ID,
        name: 'Rule test workspace',
        owner: OWNER_EMAIL,
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.CORPORATE,
        outputCurrency: CONST.CURRENCY.USD,
        employeeList: {[OWNER_EMAIL]: {role: CONST.POLICY.ROLE.ADMIN}},
        rules: {agentRules},
        ...overrides,
    };
    await act(async () => {
        await Onyx.set(POLICY_KEY, policy);
    });
    await waitForBatchedUpdatesWithAct();
}

async function renderCaller(Caller: typeof AgentRulesSection, canWriteRules = true) {
    const showReadOnlyModal = jest.fn();
    render(
        <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
            <ComposeProviders components={[ThemeStylesProvider, OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                <Caller
                    policyID={POLICY_ID}
                    canWriteRules={canWriteRules}
                    showReadOnlyModal={showReadOnlyModal}
                />
            </ComposeProviders>
        </SafeAreaProvider>,
    );
    await waitForBatchedUpdatesWithAct();
    return {showReadOnlyModal};
}

// Card handlers ignore a press without an event, so negative cases must use the same event payload as working presses.
function pressCard(title: string) {
    fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: title}), {nativeEvent: {}});
}

describe.each(callers)('Agent rules in the $name', ({name, Component}) => {
    beforeAll(async () => {
        await IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.SESSION, {email: OWNER_EMAIL, accountID: 1});
            await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: false});
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('shows normalized titles and prompt fallbacks in newest-first order', async () => {
        // Given saved rules whose titles and creation dates differ from their prompts and insertion order
        await setPolicyAgentRules({
            [RULE_ID]: createRule(RULE_ID, {title: 'Oldest rule'}),
            [OTHER_RULE_ID]: createRule(OTHER_RULE_ID, {title: undefined, prompt: '  Fallback\n\n prompt\t ', created: '2026-02-01 00:00:00'}),
            [NEWEST_RULE_ID]: createRule(NEWEST_RULE_ID, {title: '  Newest\n rule  ', prompt: 'Do not display this prompt.', created: '2026-03-01 00:00:00'}),
        });

        // When saved data reaches the caller's actual text and accessibility components
        await renderCaller(Component);
        const cards = screen.getAllByRole(CONST.ROLE.BUTTON, {name: /^(Newest rule|Fallback prompt|Oldest rule)$/});

        // Then users hear the same normalized title that they see, with the newest rule first
        expect(cards).toHaveLength(3);
        expect(cards.at(0)).toBe(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Newest rule'}));
        expect(cards.at(1)).toBe(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Fallback prompt'}));
        expect(cards.at(2)).toBe(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Oldest rule'}));
        expect(cards.at(0)).toHaveTextContent('Newest rule');
        expect(cards.at(1)).toHaveTextContent('Fallback prompt');
        expect(screen.queryByText('Do not display this prompt.')).not.toBeOnTheScreen();
    });

    it('keeps regular one-line titles and renders mixed custom emoji with its existing fragment', async () => {
        // Given long text and a real bundled custom emoji, which must not become bold field labels or plain glyphs
        const longTitle = 'Review receipts for a very long team meal rule that must remain on one line';
        const emojiTitle = `Review ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} receipts`;
        await setPolicyAgentRules({
            [RULE_ID]: createRule(RULE_ID, {title: longTitle}),
            [OTHER_RULE_ID]: createRule(OTHER_RULE_ID, {title: emojiTitle}),
        });

        // When the actual title text is rendered inside each accessible card
        const {result} = renderHook(() => useThemeStyles());
        await renderCaller(Component);
        const longCard = screen.getByRole(CONST.ROLE.BUTTON, {name: longTitle});
        const emojiCard = screen.getByRole(CONST.ROLE.BUTTON, {name: emojiTitle});
        const limitedText = within(longCard).getByText(longTitle, {exact: false});

        // Then the title stays regular and clipped to one line, while the emoji uses its own font and full accessible name
        expect(limitedText).toHaveProp('numberOfLines', 1);
        expect(limitedText).toHaveStyle(FontUtils.fontFamily.platform.EXP_NEUE);
        expect(limitedText).toHaveStyle(result.current.pre);
        expect(longCard).toHaveTextContent(longTitle);
        expect(within(emojiCard).UNSAFE_getByType(TextWithEmojiFragment).props.alignCustomEmoji).toBe(true);
        expect(within(emojiCard).getByText(CONST.CUSTOM_EMOJIS.GLOBAL_CREATE)).toHaveStyle(FontUtils.fontFamily.single.CUSTOM_EMOJI_FONT);
        expect(emojiCard).toHaveTextContent(emojiTitle);
    });

    it('preserves the caller spacing, bordered press target, chevron and telemetry', async () => {
        // Given the two callers supply different card and list spacing through the shared renderer
        await setPolicyAgentRules({[RULE_ID]: createRule()});

        // When each actual caller mounts its card with real theme styles and icon components
        const {result} = renderHook(() => useThemeStyles());
        await renderCaller(Component);
        const card = screen.getByRole(CONST.ROLE.BUTTON, {name: RULE_TITLE});
        const list = findAncestorWithStyle(card, 'gap', result.current.gap2.gap);
        const dataSet: unknown = card.props.dataSet;
        const dataSetLabel = typeof dataSet === 'object' && dataSet !== null && 'sentryLabel' in dataSet ? dataSet.sentryLabel : undefined;

        // Then the whole bordered card remains the named press target, with the caller's own spacing and unchanged arrow/label
        expect(card).toHaveStyle(result.current.borderedContentCard);
        expect(card).toHaveStyle(result.current.ph4);
        expect(card).toHaveStyle(name === 'section' ? result.current.pv2 : result.current.justifyContentCenter);
        expect(list).toHaveStyle(name === 'section' ? result.current.mt3 : result.current.mt6);
        expect(within(card).UNSAFE_getAllByType(Icon)).toHaveLength(1);
        expect(within(card).UNSAFE_getByType(Icon).props.src).toEqual(expect.objectContaining({src: 'mock-ArrowRight'}));
        expect(within(card).getByTestId('image-svg', {includeHiddenElements: true})).toBeOnTheScreen();
        expect(within(card).queryByTestId('image-svg')).toBeNull();
        expect(card.props.sentryLabel ?? dataSetLabel).toBe(CONST.SENTRY_LABEL.WORKSPACE.RULES.AGENT_RULE_ITEM);
    });

    it('opens the selected saved rule for a signed-in writer', async () => {
        // Given two distinct saved rules, so the press must retain the selected rule ID rather than a shared closure
        await setPolicyAgentRules({
            [RULE_ID]: createRule(),
            [OTHER_RULE_ID]: createRule(OTHER_RULE_ID, {title: OTHER_RULE_TITLE}),
        });
        const {showReadOnlyModal} = await renderCaller(Component);

        // When the second actual card receives a nonempty press event
        pressCard(OTHER_RULE_TITLE);

        // Then its existing editor route opens, and the read-only explanation is not used
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RULES_AGENT_EDIT.getRoute(POLICY_ID, OTHER_RULE_ID));
        expect(showReadOnlyModal).not.toHaveBeenCalled();
    });

    it('keeps read-only cards pressable so they explain the role restriction', async () => {
        // Given an Auditor can read rules but cannot write them
        await setPolicyAgentRules({[RULE_ID]: createRule()}, {role: CONST.POLICY.ROLE.AUDITOR});
        const {showReadOnlyModal} = await renderCaller(Component, false);

        // When the enabled card is pressed, rather than treating read-only access as disabled
        const card = screen.getByRole(CONST.ROLE.BUTTON, {name: RULE_TITLE});
        expect(card).toBeEnabled();
        pressCard(RULE_TITLE);

        // Then the caller's explanation opens without navigating to an editor
        expect(showReadOnlyModal).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it.each([true, false])('guards anonymous card presses when canWriteRules is %s', async (canWriteRules) => {
        // Given an anonymous session must not reach either the editor or a workspace-specific explanation
        await setPolicyAgentRules({[RULE_ID]: createRule()});
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
        });
        const {showReadOnlyModal} = await renderCaller(Component, canWriteRules);

        // When the actual enabled card receives the same nonempty press used by the positive cases
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: RULE_TITLE})).toBeEnabled();
        pressCard(RULE_TITLE);

        // Then the real session guard asks to close for sign-in instead of executing either card action
        expect(Modal.close).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(showReadOnlyModal).not.toHaveBeenCalled();
    });

    it.each([true, false])('shows pending deletion only offline and blocks its press when canWriteRules is %s', async (canWriteRules) => {
        // Given a saved rule is pending deletion, and must not reappear as an editable card during reconnect
        await setPolicyAgentRules({[RULE_ID]: createRule(RULE_ID, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})});
        const {result} = renderHook(() => useThemeStyles());
        const {showReadOnlyModal} = await renderCaller(Component, canWriteRules);
        expect(screen.queryByRole(CONST.ROLE.BUTTON, {name: RULE_TITLE})).not.toBeOnTheScreen();

        // When offline feedback exposes that pending card, and a user attempts the normal press
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        });
        await waitForBatchedUpdatesWithAct();
        const card = screen.getByRole(CONST.ROLE.BUTTON, {name: RULE_TITLE});
        pressCard(RULE_TITLE);

        // Then the real feedback remains dimmed/struck through and neither writing nor read-only card actions run
        expect(card).toBeDisabled();
        expect(findAncestorWithStyle(card, 'opacity', result.current.offlineFeedbackPending.opacity)).toBeDefined();
        expect(within(card).getByText(RULE_TITLE, {exact: false})).toHaveStyle(result.current.offlineFeedbackDeleted);
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(showReadOnlyModal).not.toHaveBeenCalled();
    });

    it.each([CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE])('retains writable offline feedback for a pending %s', async (pendingAction) => {
        // Given an offline add or update is pending, which is not the deletion-only interaction block
        await setPolicyAgentRules({[RULE_ID]: createRule(RULE_ID, {pendingAction})});
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        });

        // When the actual offline card is pressed by a writer
        const {result} = renderHook(() => useThemeStyles());
        await renderCaller(Component);
        const card = screen.getByRole(CONST.ROLE.BUTTON, {name: RULE_TITLE});
        pressCard(RULE_TITLE);

        // Then pending feedback survives without disabling the normal saved-rule route
        expect(card).toBeEnabled();
        expect(findAncestorWithStyle(card, 'opacity', result.current.offlineFeedbackPending.opacity)).toBeDefined();
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RULES_AGENT_EDIT.getRoute(POLICY_ID, RULE_ID));
    });

    it('renders and dismisses feedback for only the selected rule', async () => {
        // Given two saved rules have independent errors, so dismissal must not clear the whole list
        await setPolicyAgentRules({
            [RULE_ID]: createRule(RULE_ID, {errors: {[ERROR_KEY]: ERROR_MESSAGE}}),
            [OTHER_RULE_ID]: createRule(OTHER_RULE_ID, {title: OTHER_RULE_TITLE, errors: {[OTHER_ERROR_KEY]: OTHER_ERROR_MESSAGE}}),
        });
        const {result} = renderHook(() => useThemeStyles());
        await renderCaller(Component);
        const errorText = screen.getByText(ERROR_MESSAGE);
        const feedback = findAncestorByType(errorText, [OfflineWithFeedback]);
        if (!feedback) {
            throw new Error('Expected the rule error inside OfflineWithFeedback');
        }

        // When the real feedback row's dismiss button invokes the existing Onyx action
        expect(findAncestorWithStyle(errorText, 'paddingTop', result.current.agentRulesErrorRow.paddingTop)).toHaveStyle(result.current.agentRulesErrorRow);
        fireEvent.press(within(feedback).getByRole(CONST.ROLE.BUTTON, {name: 'Dismiss'}), {nativeEvent: {}});
        await waitForBatchedUpdatesWithAct();

        // Then only that error disappears, while both cards and the other rule's error remain readable
        expect(screen.queryByText(ERROR_MESSAGE)).not.toBeOnTheScreen();
        expect(screen.getByText(OTHER_ERROR_MESSAGE)).toBeOnTheScreen();
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: RULE_TITLE})).toBeOnTheScreen();
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: OTHER_RULE_TITLE})).toBeOnTheScreen();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('removes a failed optimistic add when its error is dismissed', async () => {
        // Given an unsaved add failed, while an unrelated saved rule must survive its cleanup
        await setPolicyAgentRules({
            [RULE_ID]: createRule(RULE_ID, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, errors: {[ERROR_KEY]: ERROR_MESSAGE}}),
            [OTHER_RULE_ID]: createRule(OTHER_RULE_ID, {title: OTHER_RULE_TITLE}),
        });
        await renderCaller(Component);

        // When the actual feedback dismissal clears the failed add through the existing action
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Dismiss'}), {nativeEvent: {}});
        await waitForBatchedUpdatesWithAct();

        // Then it removes the failed card instead of leaving a rule that never reached the server
        expect(screen.queryByRole(CONST.ROLE.BUTTON, {name: RULE_TITLE})).not.toBeOnTheScreen();
        expect(screen.queryByText(ERROR_MESSAGE)).not.toBeOnTheScreen();
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: OTHER_RULE_TITLE})).toBeOnTheScreen();
    });

    it.each([true, false])('preserves the add-rule action when canWriteRules is %s', async (canWriteRules) => {
        // Given an existing saved list leaves its add action below the cards
        await setPolicyAgentRules({[RULE_ID]: createRule()});
        const {showReadOnlyModal} = await renderCaller(Component, canWriteRules);

        // When the actual add row receives a nonempty press event
        pressCard('Add agent rule');

        // Then it keeps the existing writer route or read-only explanation, without affecting the saved card
        if (canWriteRules) {
            expect(Navigation.navigate).toHaveBeenCalledTimes(1);
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RULES_AGENT_NEW.getRoute(POLICY_ID));
            expect(showReadOnlyModal).not.toHaveBeenCalled();
        } else {
            expect(showReadOnlyModal).toHaveBeenCalledTimes(1);
            expect(Navigation.navigate).not.toHaveBeenCalled();
        }
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: RULE_TITLE})).toBeOnTheScreen();
    });

    it('keeps the existing empty presentation when no saved rules are available', async () => {
        // Given rules have not been configured, so no stale saved card should be shown
        await setPolicyAgentRules(undefined);

        // When each real caller chooses its own empty presentation
        await renderCaller(Component);

        // Then the section keeps its add row and the tab keeps its empty-state CTA
        expect(screen.queryByRole(CONST.ROLE.BUTTON, {name: RULE_TITLE})).not.toBeOnTheScreen();
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: name === 'section' ? 'Add agent rule' : 'Add AI rule'})).toBeOnTheScreen();
    });

    it.each(enforcementCases)('retains enforcement information for $state', async ({ruleBotAccountID, employeeList, shouldShowPill}) => {
        // Given saved rules can retain a bot ID after that bot leaves the workspace
        await setPolicyAgentRules({[RULE_ID]: createRule()}, {ruleBotAccountID, employeeList});
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [RULE_BOT_ACCOUNT_ID]: {accountID: RULE_BOT_ACCOUNT_ID, displayName: 'RuleBot', login: RULE_BOT_EMAIL, avatar: RULE_BOT_AVATAR},
            });
        });

        // When the actual caller renders the shared section header along with its saved card
        await renderCaller(Component);

        // Then only an active member is named as enforcing rules, with its existing identity props preserved
        if (shouldShowPill) {
            expect(screen.getByText('Agent rules are enforced by')).toBeOnTheScreen();
            expect(screen.getByText('RuleBot')).toBeOnTheScreen();
            expect(screen.UNSAFE_getByType(UserPill).props).toEqual(
                expect.objectContaining({accountID: RULE_BOT_ACCOUNT_ID, displayName: 'RuleBot', email: RULE_BOT_EMAIL, avatar: RULE_BOT_AVATAR}),
            );
        } else {
            expect(screen.queryByText('Agent rules are enforced by')).not.toBeOnTheScreen();
            expect(screen.UNSAFE_queryByType(UserPill)).toBeNull();
        }
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: RULE_TITLE})).toBeOnTheScreen();
    });
});
