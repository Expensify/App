import {act, fireEvent, render, screen} from '@testing-library/react-native';

import usePolicy from '@hooks/usePolicy';

import * as API from '@libs/API';
import type {GenerateRuleParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AddAgentRuleWriteTab from '@pages/workspace/rules/AgentRules/AddAgentRuleWriteTab';
import EditAgentRulePage from '@pages/workspace/rules/AgentRules/EditAgentRulePage';

import {updatePolicyAgentRule} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {GeneratedRule} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockPrompt = '';
let mockOnPromptChange: ((value: string) => void) | undefined;
let mockIsOffline = false;

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
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
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: mockIsOffline})));
jest.mock('@hooks/usePolicy', () => jest.fn());
jest.mock('@pages/workspace/rules/AgentRules/useAgentPromptInputStyles', () => jest.fn(() => ({})));
jest.mock('@pages/workspace/rules/useRuleDeleteHeaderProps', () => jest.fn(() => ({deleteIconButtonProps: undefined})));
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
jest.mock('@components/Header/composed/HeaderWithBackButtonAndTitle', () => () => null);
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@userActions/Policy/Rules', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/Policy/Rules'),
    updatePolicyAgentRule: jest.fn(),
    deletePolicyAgentRule: jest.fn(),
}));
jest.mock('@components/Text', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
    return ({children}: {children: React.ReactNode}) => ReactModule.createElement(Text, null, children);
});
jest.mock('@components/Button', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Pressable, Text} = jest.requireActual<{
        Pressable: React.ComponentType<{onPress?: () => void; children?: React.ReactNode}>;
        Text: React.ComponentType<{children?: React.ReactNode}>;
    }>('react-native');
    const MockButton = ({onPress, children}: {onPress: () => void; children: React.ReactNode}) => ReactModule.createElement(Pressable, {onPress}, children);
    MockButton.Text = ({children}: {children: React.ReactNode}) => ReactModule.createElement(Text, null, children);
    return MockButton;
});
jest.mock('@components/Form/InputWrapper', () => ({onValueChange}: {onValueChange?: (value: string) => void}) => {
    mockOnPromptChange = onValueChange;
    return null;
});
jest.mock('@components/Form/FormProvider', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Pressable, Text} = jest.requireActual<{
        Pressable: React.ComponentType<{accessibilityLabel?: string; onPress?: () => void; children?: React.ReactNode}>;
        Text: React.ComponentType<{children?: React.ReactNode}>;
    }>('react-native');
    return ({children, onSubmit, submitButtonText}: {children: React.ReactNode; onSubmit: (values: {prompt: string}) => void; submitButtonText: string}) =>
        ReactModule.createElement(
            ReactModule.Fragment,
            null,
            children,
            ReactModule.createElement(
                Pressable,
                {accessibilityLabel: submitButtonText, onPress: () => onSubmit({prompt: mockPrompt})},
                ReactModule.createElement(Text, null, submitButtonText),
            ),
        );
});

const POLICY_ID = 'policy1';
const RULE_ID = 'rule1';
const TYPED_PROMPT = "Text the approver's phone when a report is submitted";
const SUGGESTED_PROMPT = 'When a report is submitted, send the approver a direct message';
const CREATE_RULE = 'workspace.rules.agentRules.createRule';
const CREATE_ANYWAY = 'workspace.rules.agentRules.createAnyway';

type WriteSpy = jest.SpiedFunction<typeof API.write>;
type EditAgentRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_AGENT_EDIT>;

function isGenerateRuleParams(parameters: unknown): parameters is GenerateRuleParams {
    return typeof parameters === 'object' && parameters !== null && 'generationID' in parameters && 'prompt' in parameters;
}

/** Returns the parameters of every GenerateRule request, oldest first */
function getGenerateRuleRequests(writeSpy: WriteSpy): GenerateRuleParams[] {
    return writeSpy.mock.calls
        .filter(([command]) => command === WRITE_COMMANDS.GENERATE_RULE)
        .map(([, parameters]) => parameters)
        .filter(isGenerateRuleParams);
}

function getLastGenerationID(writeSpy: WriteSpy): string {
    const generationID = getGenerateRuleRequests(writeSpy).at(-1)?.generationID;
    if (!generationID) {
        throw new Error('The form did not request GenerateRule');
    }
    return generationID;
}

async function renderWriteTab(onSave: jest.Mock, checkedPrompt?: string) {
    render(
        <AddAgentRuleWriteTab
            policyID={POLICY_ID}
            checkedPrompt={checkedPrompt}
            onSave={onSave}
        />,
    );
    await waitForBatchedUpdatesWithAct();
}

async function submit(prompt: string, buttonLabel = CREATE_RULE) {
    mockPrompt = prompt;
    fireEvent.press(screen.getByLabelText(buttonLabel));
    await waitForBatchedUpdatesWithAct();
}

async function answerCheck(answer: GeneratedRule) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.GENERATED_RULE, answer);
    });
    await waitForBatchedUpdatesWithAct();
}

function buildImpossibleAnswer(generationID: string): GeneratedRule {
    return {
        generationID,
        state: CONST.GENERATED_RULE.STATE.IMPOSSIBLE,
        reason: CONST.GENERATED_RULE.IMPOSSIBLE_REASON.NO_CAPABILITY,
        explanation: "Agents can't send text messages.",
        suggestedPrompt: SUGGESTED_PROMPT,
    };
}

describe('Agent rule prompt check', () => {
    let writeSpy: WriteSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        mockPrompt = '';
        mockIsOffline = false;
        writeSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());
    });

    afterEach(async () => {
        jest.useRealTimers();
        writeSpy.mockRestore();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('saves a typed rule after Concierge answers that RuleBot can do it', async () => {
        // Given an admin who typed an agent rule
        const onSave = jest.fn();
        await renderWriteTab(onSave);
        await submit(TYPED_PROMPT);

        // Then the rule waits for the check, which asks for any rule type because the admin did not pick one
        expect(onSave).not.toHaveBeenCalled();
        const [request] = getGenerateRuleRequests(writeSpy);
        expect(request).toMatchObject({policyID: POLICY_ID, prompt: TYPED_PROMPT});
        expect(request?.ruleType).toBeUndefined();

        // When Concierge answers with an agent rule
        await answerCheck({generationID: getLastGenerationID(writeSpy), state: CONST.GENERATED_RULE.STATE.AGENT_RULE});

        // Then the rule saves with the text the admin typed, because only an impossible answer stops the save
        expect(onSave).toHaveBeenCalledWith({prompt: TYPED_PROMPT});
    });

    it('warns about an impossible rule and saves it when the admin taps Create anyway', async () => {
        // Given an admin who typed a rule that RuleBot cannot carry out
        const onSave = jest.fn();
        await renderWriteTab(onSave);
        await submit(TYPED_PROMPT);

        // When Concierge answers that the rule is impossible
        await answerCheck(buildImpossibleAnswer(getLastGenerationID(writeSpy)));

        // Then the rule does not save, and the form shows why with the suggested rule
        expect(onSave).not.toHaveBeenCalled();
        expect(screen.getByText('workspace.rules.newRule.impossible.noCapability')).toBeTruthy();
        expect(screen.getByText("Agents can't send text messages.")).toBeTruthy();
        expect(screen.getByText(SUGGESTED_PROMPT)).toBeTruthy();

        // When the admin taps Create anyway
        await submit(TYPED_PROMPT, CREATE_ANYWAY);

        // Then the rule saves without another check, because the check only warns
        expect(onSave).toHaveBeenCalledWith({prompt: TYPED_PROMPT});
        expect(getGenerateRuleRequests(writeSpy)).toHaveLength(1);
    });

    it('checks the suggested rule when the admin taps Try this instead', async () => {
        // Given Concierge refused the typed rule
        const onSave = jest.fn();
        await renderWriteTab(onSave);
        await submit(TYPED_PROMPT);
        await answerCheck(buildImpossibleAnswer(getLastGenerationID(writeSpy)));

        // When the admin taps Try this instead, and Concierge answers that RuleBot can do the suggestion
        fireEvent.press(screen.getByText('workspace.rules.newRule.impossible.tryThisInstead'));
        await waitForBatchedUpdatesWithAct();
        await answerCheck({generationID: getLastGenerationID(writeSpy), state: CONST.GENERATED_RULE.STATE.AGENT_RULE});

        // Then the suggested rule is checked and saved in place of the typed rule
        expect(getGenerateRuleRequests(writeSpy).at(-1)?.prompt).toBe(SUGGESTED_PROMPT);
        expect(onSave).toHaveBeenCalledWith({prompt: SUGGESTED_PROMPT});
    });

    it('saves an unchanged suggestion without a check', async () => {
        // Given an admin who picked a suggested rule and did not change it
        const onSave = jest.fn();
        await renderWriteTab(onSave, SUGGESTED_PROMPT);

        // When the admin creates the rule
        await submit(SUGGESTED_PROMPT);

        // Then the rule saves at once, because Concierge already wrote the suggestion
        expect(onSave).toHaveBeenCalledWith({prompt: SUGGESTED_PROMPT});
        expect(getGenerateRuleRequests(writeSpy)).toHaveLength(0);
    });

    it('saves a typed rule without a check when the admin is offline', async () => {
        // Given an admin who typed an agent rule while offline
        mockIsOffline = true;
        const onSave = jest.fn();
        await renderWriteTab(onSave);

        // When the admin creates the rule
        await submit(TYPED_PROMPT);

        // Then the rule saves at once, because the check cannot run offline
        expect(onSave).toHaveBeenCalledWith({prompt: TYPED_PROMPT});
        expect(getGenerateRuleRequests(writeSpy)).toHaveLength(0);
    });

    it('stops the check and keeps the page open when the admin edits the text during the check', async () => {
        // Given an admin who typed an agent rule, and the check has not answered
        const onSave = jest.fn();
        await renderWriteTab(onSave);
        await submit(TYPED_PROMPT);
        const generationID = getLastGenerationID(writeSpy);

        // When the admin changes the text, and the answer for the old text arrives after that
        act(() => {
            mockOnPromptChange?.(`${TYPED_PROMPT} and the submitter`);
        });
        await waitForBatchedUpdatesWithAct();
        await answerCheck({generationID, state: CONST.GENERATED_RULE.STATE.AGENT_RULE});

        // Then nothing saves and the form stops loading, because a save now would lose the admin's edit
        expect(onSave).not.toHaveBeenCalled();
        expect((await getOnyxValue(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM))?.isLoading).toBe(false);
    });

    it('saves the rule when the check fails', async () => {
        // Given an admin who typed an agent rule
        const onSave = jest.fn();
        await renderWriteTab(onSave);
        await submit(TYPED_PROMPT);

        // When the check fails
        await answerCheck({generationID: getLastGenerationID(writeSpy), state: CONST.GENERATED_RULE.STATE.FAILED});

        // Then the rule saves, because a failed check must not block the admin
        expect(onSave).toHaveBeenCalledWith({prompt: TYPED_PROMPT});
    });

    it('saves the rule when the answer does not arrive in time', async () => {
        // Given an admin who typed an agent rule, and Concierge does not answer. The batched updates helper runs every
        // pending timer when timers are fake, so this test flushes the microtasks itself.
        jest.useFakeTimers({doNotFake: ['nextTick', 'setImmediate']});
        const flushMicrotasks = () =>
            act(async () => {
                await Promise.resolve();
            });
        const onSave = jest.fn();
        render(
            <AddAgentRuleWriteTab
                policyID={POLICY_ID}
                onSave={onSave}
            />,
        );
        await flushMicrotasks();
        mockPrompt = TYPED_PROMPT;
        fireEvent.press(screen.getByLabelText(CREATE_RULE));
        await flushMicrotasks();

        // When the time limit has not passed yet
        act(() => {
            jest.advanceTimersByTime(CONST.GENERATED_RULE.AGENT_RULE_CHECK_TIMEOUT_MS - 1);
        });

        // Then the rule still waits for the answer
        expect(onSave).not.toHaveBeenCalled();

        // When the time limit passes
        act(() => {
            jest.advanceTimersByTime(1);
        });

        // Then the rule saves, because a slow check must not block the admin
        expect(onSave).toHaveBeenCalledWith({prompt: TYPED_PROMPT});
    });

    it('stops the loading state when the admin leaves during a check', async () => {
        // Given an admin who typed an agent rule, and the check has not answered
        const onSave = jest.fn();
        render(
            <AddAgentRuleWriteTab
                policyID={POLICY_ID}
                onSave={onSave}
            />,
        );
        await waitForBatchedUpdatesWithAct();
        mockPrompt = TYPED_PROMPT;
        fireEvent.press(screen.getByLabelText(CREATE_RULE));
        await act(async () => {
            await Promise.resolve();
        });

        // When the admin leaves the page
        screen.unmount();
        await waitForBatchedUpdatesWithAct();

        // Then the form is not loading, because the next visit must not open with a loading button
        expect((await getOnyxValue(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM))?.isLoading).toBe(false);
        expect(onSave).not.toHaveBeenCalled();
    });

    describe('EditAgentRulePage', () => {
        const SAVED_PROMPT = 'Hold any expense over $75 without a receipt';

        async function renderEditPage() {
            jest.mocked(usePolicy).mockReturnValue({
                ...createRandomPolicy(0, CONST.POLICY.TYPE.CORPORATE),
                id: POLICY_ID,
                rules: {agentRules: {[RULE_ID]: {ruleID: RULE_ID, prompt: SAVED_PROMPT, title: 'Receipts', created: '2026-10-01 00:00:00'}}},
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only screen props. The page reads only route.params.
            const props = {
                route: {key: 'Rules_Agent_Edit', name: SCREENS.WORKSPACE.RULES_AGENT_EDIT, params: {policyID: POLICY_ID, ruleID: RULE_ID}},
                navigation: {},
            } as unknown as EditAgentRulePageProps;
            render(<EditAgentRulePage {...props} />);
            await waitForBatchedUpdatesWithAct();
        }

        it('saves an unchanged rule without a check', async () => {
            // Given an admin who opened a saved agent rule
            await renderEditPage();

            // When the admin saves it without changing the text
            await submit(SAVED_PROMPT, 'common.save');

            // Then the page closes without a check or an update, because nothing changed
            expect(getGenerateRuleRequests(writeSpy)).toHaveLength(0);
            expect(updatePolicyAgentRule).not.toHaveBeenCalled();
            expect(Navigation.goBack).toHaveBeenCalled();
        });

        it('warns about an impossible edit and saves it when the admin taps Save anyway', async () => {
            // Given an admin who changed a saved agent rule to one that RuleBot cannot carry out
            await renderEditPage();
            await submit(TYPED_PROMPT, 'common.save');

            // When Concierge answers that the rule is impossible
            await answerCheck(buildImpossibleAnswer(getLastGenerationID(writeSpy)));

            // Then the rule does not update until the admin taps Save anyway
            expect(updatePolicyAgentRule).not.toHaveBeenCalled();
            await submit(TYPED_PROMPT, 'workspace.rules.agentRules.saveAnyway');
            expect(updatePolicyAgentRule).toHaveBeenCalledWith(POLICY_ID, RULE_ID, TYPED_PROMPT, SAVED_PROMPT, 'Receipts');
        });
    });
});
