import {act, fireEvent, render, screen} from '@testing-library/react-native';

import usePolicy from '@hooks/usePolicy';

import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AddAgentRulePage from '@pages/workspace/rules/AgentRules/AddAgentRulePage';

import {addPolicyAgentRule} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Feed: 'Feed', Pencil: 'Pencil', Info: 'Info'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string, ...params: string[]) => [key, ...params].join(' '),
    })),
);
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/usePolicy', () => jest.fn());
jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: jest.fn(() => Promise.resolve()), closeModal: jest.fn()})));
jest.mock('@hooks/useDiscardChangesConfirmation', () => jest.fn(() => ({suppressDiscardPrompt: jest.fn()})));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    dismissModal: jest.fn(),
}));
jest.mock('@libs/actions/Tab', () => ({setSelectedTab: jest.fn()}));
jest.mock('@userActions/Policy/Rules', () => ({
    addPolicyAgentRule: jest.fn(),
    getAgentRuleSuggestions: jest.fn(),
}));
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/CollapsibleHeaderOnKeyboard',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/SidePanel/SidePanelButton', () => () => null);
jest.mock('@components/TabSelector/TabSelectorBase', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Pressable} = jest.requireActual<{Pressable: React.ComponentType<{accessibilityLabel?: string; onPress?: () => void}>}>('react-native');
    return ({tabs, onTabPress}: {tabs: Array<{key: string; title: string}>; onTabPress: (key: string) => void}) =>
        ReactModule.createElement(
            ReactModule.Fragment,
            null,
            tabs.map((tab) => ReactModule.createElement(Pressable, {key: tab.key, accessibilityLabel: tab.title, onPress: () => onTabPress(tab.key)})),
        );
});
jest.mock(
    '@components/TabSelector/TabSelectorContext',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/Header/composed/HeaderWithBackButtonAndTitle', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Pressable} = jest.requireActual<{Pressable: React.ComponentType<{accessibilityLabel?: string; onPress?: () => void}>}>('react-native');
    return ({onBackButtonPress}: {onBackButtonPress?: () => void}) => ReactModule.createElement(Pressable, {accessibilityLabel: 'Back', onPress: onBackButtonPress});
});
jest.mock('@components/Banner', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
    return ({text}: {text?: string}) => ReactModule.createElement(Text, null, text);
});
jest.mock('@pages/workspace/rules/AgentRules/AddAgentRuleSuggestionsTab', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Pressable} = jest.requireActual<{Pressable: React.ComponentType<{accessibilityLabel?: string; onPress?: () => void}>}>('react-native');
    return ({onSelectSuggestion}: {onSelectSuggestion: (suggestion: {id: string; title: string; prompt: string}) => void}) =>
        ReactModule.createElement(Pressable, {
            accessibilityLabel: 'PickSuggestion',
            onPress: () => onSelectSuggestion({id: 'suggestion1', title: 'Hold expenses without a receipt', prompt: 'Hold any expense over $75 without a receipt'}),
        });
});
jest.mock('@pages/workspace/rules/AgentRules/AddAgentRuleWriteTab', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Pressable, Text} = jest.requireActual<{
        Pressable: React.ComponentType<{accessibilityLabel?: string; onPress?: () => void; children?: React.ReactNode}>;
        Text: React.ComponentType<{children?: React.ReactNode}>;
    }>('react-native');
    return ({onSave}: {onSave: (values: {prompt: string}) => void}) =>
        ReactModule.createElement(Pressable, {accessibilityLabel: 'WriteTab', onPress: () => onSave({prompt: 'Hold gift card expenses'})}, ReactModule.createElement(Text, null, 'WriteTab'));
});

type AddAgentRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_AGENT_NEW>;

const POLICY_ID = 'policy1';
const GENERATION_ID = '7654321';
const PROMPT = 'Hold gift card expenses';
const FALLBACK_BANNER = 'workspace.rules.agentRules.fallbackBanner';
const EXPLANATION = 'Agent rules cannot stop a card charge. This holds the expense after it posts.';

const mockedUsePolicy = jest.mocked(usePolicy);

function renderAddAgentRulePage(generationID?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only screen props. The page reads only route.params.
    const props = {
        route: {key: 'Rules_Agent_New', name: SCREENS.WORKSPACE.RULES_AGENT_NEW, params: {policyID: POLICY_ID, generationID}},
        navigation: {},
    } as unknown as AddAgentRulePageProps;
    return render(<AddAgentRulePage {...props} />);
}

async function setAgentRuleAnswer(generationID: string) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.GENERATED_RULE, {generationID, state: CONST.GENERATED_RULE.STATE.AGENT_RULE, agentRulePrompt: PROMPT, explanation: EXPLANATION});
    });
}

async function setAgentRuleDraft(prompt: string) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM_DRAFT, {prompt});
    });
}

describe('AddAgentRulePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUsePolicy.mockReturnValue({
            ...createRandomPolicy(0, CONST.POLICY.TYPE.CORPORATE),
            id: POLICY_ID,
            rules: {agentRules: {existingRule: {ruleID: 'existingRule', prompt: 'Existing', created: '2026-10-01 00:00:00'}}},
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('opens on the Suggestions tab when there is no draft prompt', async () => {
        // Given no draft, because the admin opened the page from the Agents tab

        // When the page renders
        renderAddAgentRulePage();
        await waitForBatchedUpdatesWithAct();

        // Then the Write tab stays closed, so the admin starts from the suggested rules
        expect(screen.queryByText('WriteTab')).toBeNull();
    });

    it('opens on the Write tab when a draft prompt exists at mount', async () => {
        // Given a draft prompt, because the describe flow wrote it before it opened this page
        await setAgentRuleDraft(PROMPT);

        // When the page renders
        renderAddAgentRulePage(GENERATION_ID);
        await waitForBatchedUpdatesWithAct();

        // Then the admin sees the drafted prompt and does not have to look for it
        expect(screen.getByText('WriteTab')).toBeOnTheScreen();
    });

    it('opens on the Write tab when the draft prompt arrives after the first render', async () => {
        // Given the page renders before the draft loads
        renderAddAgentRulePage(GENERATION_ID);
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText('WriteTab')).toBeNull();

        // When the draft prompt loads
        await setAgentRuleDraft(PROMPT);
        await waitForBatchedUpdatesWithAct();

        // Then the page still switches to Write, because the first render must not decide the tab for good
        expect(screen.getByText('WriteTab')).toBeOnTheScreen();
    });

    it('shows the fallback banner when the page opens with a generationID', async () => {
        // Given a draft that came from a description that was not a standard rule
        await setAgentRuleDraft(PROMPT);

        // When the page renders with the generationID of that description
        renderAddAgentRulePage(GENERATION_ID);
        await waitForBatchedUpdatesWithAct();

        // Then the banner tells the admin that agent rules act after the fact
        expect(screen.getByText(FALLBACK_BANNER)).toBeOnTheScreen();
    });

    it('shows the explanation of the agent rule answer in the fallback banner', async () => {
        // Given Concierge answered the description with an agent rule that differs from what the admin asked for
        await setAgentRuleDraft(PROMPT);
        await setAgentRuleAnswer(GENERATION_ID);

        // When the page renders with the generationID of that answer
        renderAddAgentRulePage(GENERATION_ID);
        await waitForBatchedUpdatesWithAct();

        // Then the banner says how the agent rule differs, so the admin reviews the reworded rule before saving
        expect(screen.getByText(`workspace.rules.agentRules.fallbackBannerWithExplanation ${EXPLANATION}`)).toBeOnTheScreen();
    });

    it('ignores the explanation of an answer to another description', async () => {
        // Given the stored answer belongs to another description
        await setAgentRuleDraft(PROMPT);
        await setAgentRuleAnswer('1234567');

        // When the page renders with the generationID of this description
        renderAddAgentRulePage(GENERATION_ID);
        await waitForBatchedUpdatesWithAct();

        // Then the banner has no explanation, because that explanation describes another rule
        expect(screen.getByText(FALLBACK_BANNER)).toBeOnTheScreen();
    });

    it('does not show the fallback banner without a generationID', async () => {
        // Given a draft that the admin picked from the suggestions, not one from the describe flow
        await setAgentRuleDraft(PROMPT);

        // When the page renders without a generationID
        renderAddAgentRulePage();
        await waitForBatchedUpdatesWithAct();

        // Then the Write tab opens without the banner, because no description was turned into this rule
        expect(screen.getByText('WriteTab')).toBeOnTheScreen();
        expect(screen.queryByText(FALLBACK_BANNER)).toBeNull();
    });

    it('goes back to the previous screen from the Write tab when the page opens with a generationID', async () => {
        // Given the describe flow opened the page on the Write tab
        await setAgentRuleDraft(PROMPT);
        renderAddAgentRulePage(GENERATION_ID);
        await waitForBatchedUpdatesWithAct();

        // When the admin presses Back
        fireEvent.press(screen.getByLabelText('Back'));

        // Then the page closes and the admin returns to the previous screen, because they did not come from the Suggestions tab
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
        expect(screen.getByText('WriteTab')).toBeOnTheScreen();
    });

    it('switches from the Write tab to Suggestions on Back without a generationID', async () => {
        // Given the Write tab is open for a draft that did not come from the describe flow
        await setAgentRuleDraft(PROMPT);
        renderAddAgentRulePage();
        await waitForBatchedUpdatesWithAct();

        // When the admin presses Back
        fireEvent.press(screen.getByLabelText('Back'));

        // Then the page returns to Suggestions and stays open, because the admin can pick another suggestion
        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(screen.queryByText('WriteTab')).toBeNull();
    });

    it('drops the fallback banner and log after the admin picks a suggestion', async () => {
        // Given the describe flow opened the page with a generationID and the fallback banner
        const logSpy = jest.spyOn(Log, 'info');
        await setAgentRuleDraft(PROMPT);
        renderAddAgentRulePage(GENERATION_ID);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(FALLBACK_BANNER)).toBeOnTheScreen();

        // When the admin goes to Suggestions, picks a suggestion, and saves it
        fireEvent.press(screen.getByLabelText('workspace.rules.agentRules.suggestionsTab'));
        fireEvent.press(screen.getByLabelText('PickSuggestion'));
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('WriteTab')).toBeOnTheScreen();
        expect(screen.queryByText(FALLBACK_BANNER)).toBeNull();
        fireEvent.press(screen.getByLabelText('WriteTab'));

        // Then the save is not counted as a fallback rule, because the prompt came from the suggestion
        expect(addPolicyAgentRule).toHaveBeenCalledTimes(1);
        expect(logSpy).not.toHaveBeenCalledWith('[GenerateRule] Saved agent rule from fallback', expect.anything(), expect.anything());
        logSpy.mockRestore();
    });

    it('switches from the Write tab to Suggestions on Back after the admin picks a suggestion in the fallback flow', async () => {
        // Given the describe flow opened the page with a generationID and the admin picked a suggestion
        await setAgentRuleDraft(PROMPT);
        renderAddAgentRulePage(GENERATION_ID);
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText('workspace.rules.agentRules.suggestionsTab'));
        fireEvent.press(screen.getByLabelText('PickSuggestion'));
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('WriteTab')).toBeOnTheScreen();

        // When the admin presses Back
        fireEvent.press(screen.getByLabelText('Back'));

        // Then the page returns to Suggestions and stays open, because picking a suggestion leaves the fallback flow
        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(screen.queryByText('WriteTab')).toBeNull();
    });

    it('logs the generationID with the saved agent rule when the page opens with a generationID', async () => {
        // Given the describe flow opened the page with a generationID
        const logSpy = jest.spyOn(Log, 'info');
        await setAgentRuleDraft(PROMPT);
        renderAddAgentRulePage(GENERATION_ID);
        await waitForBatchedUpdatesWithAct();

        // When the admin saves the rule
        fireEvent.press(screen.getByLabelText('WriteTab'));

        // Then the log joins the saved rule to the offer on the generationID
        const agentRuleID = jest.mocked(addPolicyAgentRule).mock.calls.at(0)?.at(1);
        expect(addPolicyAgentRule).toHaveBeenCalledWith(POLICY_ID, expect.any(String), PROMPT);
        expect(logSpy).toHaveBeenCalledWith('[GenerateRule] Saved agent rule from fallback', false, {policyID: POLICY_ID, generationID: GENERATION_ID, agentRuleID});
        logSpy.mockRestore();
    });
});
