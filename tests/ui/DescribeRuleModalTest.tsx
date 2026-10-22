import {act, fireEvent, render, screen} from '@testing-library/react-native';

import * as API from '@libs/API';
import type {GenerateRuleParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';

import DescribeRuleModal from '@pages/workspace/rules/DescribeRuleModal';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GeneratedRule} from '@src/types/onyx';
import type {GeneratedRuleImpossibleReason, GeneratedRuleState, GeneratedRuleType} from '@src/types/onyx/GeneratedRule';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockPrompt = '';

jest.mock('@react-navigation/native', () => {
    const actualNavigation = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
    return {
        ...actualNavigation,
        useFocusEffect: (callback: () => void) => {
            callback();
        },
    };
});
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: false, shouldUseNarrowLayout: false})));
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
jest.mock('@components/Text', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
    return ({children}: {children: React.ReactNode}) => ReactModule.createElement(Text, null, children);
});
jest.mock(
    '@components/Modal',
    () =>
        ({isVisible, children}: {isVisible: boolean; children: React.ReactNode}) =>
            isVisible ? children : null,
);
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
jest.mock('@components/Form/InputWrapper', () => () => null);
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

const IMPOSSIBLE_ANSWER = {
    generationID: '',
    state: CONST.GENERATED_RULE.STATE.IMPOSSIBLE,
    reason: CONST.GENERATED_RULE.IMPOSSIBLE_REASON.NO_CAPABILITY,
    explanation: 'Rules cannot send text messages.',
    suggestedPrompt: 'Comment on the report when it is submitted',
} satisfies GeneratedRule;

type WriteSpy = jest.SpiedFunction<typeof API.write>;

function isGenerateRuleParams(parameters: unknown): parameters is GenerateRuleParams {
    return typeof parameters === 'object' && parameters !== null && 'generationID' in parameters && 'prompt' in parameters;
}

async function renderFlagForReviewModal(onRuleGenerated: jest.Mock, onClose: jest.Mock) {
    render(
        <DescribeRuleModal
            isVisible
            onClose={onClose}
            policyID={POLICY_ID}
            ruleType={CONST.GENERATED_RULE.RULE_TYPE.FLAG_FOR_REVIEW}
            onRuleGenerated={onRuleGenerated}
        />,
    );
    await waitForBatchedUpdatesWithAct();
}

/** Submits the prompt through the modal and returns the generationID of the GenerateRule request */
function describeRule(writeSpy: WriteSpy, prompt: string): string {
    mockPrompt = prompt;
    fireEvent.press(screen.getByLabelText('common.next'));
    const parameters = writeSpy.mock.calls.find(([command]) => command === WRITE_COMMANDS.GENERATE_RULE)?.at(1);
    if (!isGenerateRuleParams(parameters)) {
        throw new Error('The describe modal did not request GenerateRule');
    }
    return parameters.generationID;
}

/** Returns the parameters of every GenerateRule request, oldest first */
function getGenerateRuleRequests(writeSpy: WriteSpy): GenerateRuleParams[] {
    return writeSpy.mock.calls
        .filter(([command]) => command === WRITE_COMMANDS.GENERATE_RULE)
        .map(([, parameters]) => parameters)
        .filter(isGenerateRuleParams);
}

async function answerGeneration(answer: GeneratedRule) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.GENERATED_RULE, answer);
    });
    await waitForBatchedUpdatesWithAct();
}

async function getPromptErrors() {
    const form = await getOnyxValue(ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM);
    return Object.values(form?.errors ?? {});
}

describe('DescribeRuleModal', () => {
    let writeSpy: WriteSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        mockPrompt = '';
        writeSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());
    });

    afterEach(async () => {
        writeSpy.mockRestore();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('gives the generated values to the editor and closes when the answer has the rule type of the editor', async () => {
        // Given the flag for review editor asked for a rule
        const onRuleGenerated = jest.fn();
        const onClose = jest.fn();
        await renderFlagForReviewModal(onRuleGenerated, onClose);
        const generationID = describeRule(writeSpy, 'Flag expenses over $500');

        // When Concierge answers with a flag for review rule
        await answerGeneration({
            generationID,
            state: CONST.GENERATED_RULE.STATE.RULE,
            ruleType: CONST.GENERATED_RULE.RULE_TYPE.FLAG_FOR_REVIEW,
            rule: {maxExpenseAmount: '500'},
        });

        // Then the editor gets the values and the modal closes, because the editor can show them
        expect(onRuleGenerated).toHaveBeenCalledWith({maxExpenseAmount: '500'}, CONST.GENERATED_RULE.RULE_TYPE.FLAG_FOR_REVIEW);
        expect(onClose).toHaveBeenCalled();
    });

    it.each([
        {description: 'another rule type', generatedRuleType: CONST.GENERATED_RULE.RULE_TYPE.RESTRICT_CARD_SPEND},
        {description: 'no rule type', generatedRuleType: undefined},
    ])('shows the unsupported error and stays open when the answer has $description', async ({generatedRuleType}: {generatedRuleType: GeneratedRuleType | undefined}) => {
        // Given the flag for review editor asked for a rule
        const onRuleGenerated = jest.fn();
        const onClose = jest.fn();
        await renderFlagForReviewModal(onRuleGenerated, onClose);
        const generationID = describeRule(writeSpy, 'Block retail purchases on all cards');

        // When Concierge answers with a rule that is not a flag for review rule
        await answerGeneration({
            generationID,
            state: CONST.GENERATED_RULE.STATE.RULE,
            ruleType: generatedRuleType,
            rule: {merchantNames: ['Walmart']},
        });

        // Then the editor does not get the values, because they would replace its form with the fields of another rule type
        expect(onRuleGenerated).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(await getPromptErrors()).toEqual([translateLocal('workspace.rules.newRule.promptErrors.unsupported')]);
        expect(await getOnyxValue(ONYXKEYS.GENERATED_RULE)).toBeUndefined();
    });

    it('shows the error of an answer that is not a rule', async () => {
        // Given the flag for review editor asked for a rule
        const onRuleGenerated = jest.fn();
        const onClose = jest.fn();
        await renderFlagForReviewModal(onRuleGenerated, onClose);
        const generationID = describeRule(writeSpy, 'asdf qwerty zxcv');

        // When Concierge answers that the description is unintelligible
        await answerGeneration({generationID, state: CONST.GENERATED_RULE.STATE.UNINTELLIGIBLE});

        // Then the modal shows the unintelligible error, because the rule type check applies only to a rule answer
        expect(onRuleGenerated).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(await getPromptErrors()).toEqual([translateLocal('workspace.rules.newRule.promptErrors.unintelligible')]);
    });

    it.each([CONST.GENERATED_RULE.STATE.UNSUPPORTED, CONST.GENERATED_RULE.STATE.AGENT_RULE])(
        'shows the unsupported error for an answer of %s when the caller gives no agent rule fallback',
        async (state: GeneratedRuleState) => {
            // Given the flag for review editor asked for a rule, and the editor does not offer the agent rule fallback
            const onRuleGenerated = jest.fn();
            const onClose = jest.fn();
            await renderFlagForReviewModal(onRuleGenerated, onClose);
            const generationID = describeRule(writeSpy, 'Block gift cards');

            // When Concierge answers that no standard rule can do it
            await answerGeneration({generationID, state, agentRulePrompt: 'Hold gift card expenses'});

            // Then the modal shows the unsupported error, because only a caller with a fallback turns this answer into an agent rule
            expect(onRuleGenerated).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(await getPromptErrors()).toEqual([translateLocal('workspace.rules.newRule.promptErrors.unsupported')]);
        },
    );

    it('shows why the description cannot be done and keeps the editor form when the answer is impossible', async () => {
        // Given the flag for review editor asked for a rule
        const onRuleGenerated = jest.fn();
        const onClose = jest.fn();
        await renderFlagForReviewModal(onRuleGenerated, onClose);
        const generationID = describeRule(writeSpy, 'Text the approver when a report is submitted');

        // When Concierge answers that neither a rule nor an agent rule can do it
        await answerGeneration({...IMPOSSIBLE_ANSWER, generationID});

        // Then the modal stays open with the reason, the explanation and the suggestion, and nothing reaches the editor form
        expect(onRuleGenerated).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByText('workspace.rules.newRule.impossible.noCapability')).toBeOnTheScreen();
        expect(screen.getByText(IMPOSSIBLE_ANSWER.explanation)).toBeOnTheScreen();
        expect(screen.getByText(IMPOSSIBLE_ANSWER.suggestedPrompt)).toBeOnTheScreen();

        // And the form stops loading without an error, because the answer is shown in the form
        const form = await getOnyxValue(ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM);
        expect(form?.isLoading).toBe(false);
        expect(await getPromptErrors()).toEqual([]);
    });

    it('describes the suggested rule when the admin taps Try this instead', async () => {
        // Given Concierge answered that the description cannot be done and suggested another one
        const logSpy = jest.spyOn(Log, 'info');
        await renderFlagForReviewModal(jest.fn(), jest.fn());
        const generationID = describeRule(writeSpy, 'Text the approver when a report is submitted');
        await answerGeneration({...IMPOSSIBLE_ANSWER, generationID});

        // When the admin taps Try this instead
        fireEvent.press(screen.getByText('workspace.rules.newRule.impossible.tryThisInstead'));
        await waitForBatchedUpdatesWithAct();

        // Then Concierge gets the suggested description for the same editor, so the admin does not retype it
        const lastRequest = getGenerateRuleRequests(writeSpy).at(-1);
        expect(lastRequest?.prompt).toBe(IMPOSSIBLE_ANSWER.suggestedPrompt);
        expect(lastRequest?.ruleType).toBe(CONST.GENERATED_RULE.RULE_TYPE.FLAG_FOR_REVIEW);
        expect(logSpy).toHaveBeenCalledWith('[GenerateRule] Tried the suggested description', false, {policyID: POLICY_ID, generationID, reason: IMPOSSIBLE_ANSWER.reason});

        // And the refusal goes away, because it belongs to the earlier description
        expect(screen.queryByText(IMPOSSIBLE_ANSWER.explanation)).toBeNull();
        logSpy.mockRestore();
    });

    it('shows the general title and no suggestion when the reason is unknown and nothing is suggested', async () => {
        // Given the flag for review editor asked for a rule
        await renderFlagForReviewModal(jest.fn(), jest.fn());
        const generationID = describeRule(writeSpy, 'Text the approver when a report is submitted');

        // When Concierge answers with a reason that this app version does not know, and with no suggestion
        await answerGeneration({
            ...IMPOSSIBLE_ANSWER,
            generationID,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- simulates an answer from a server that knows more reasons than this app version
            reason: 'futureReason' as GeneratedRuleImpossibleReason,
            suggestedPrompt: '',
        });

        // Then the modal shows the general title and no Try this instead button, because there is nothing to try
        expect(screen.getByText('workspace.rules.newRule.impossible.noCapability')).toBeOnTheScreen();
        expect(screen.queryByText('workspace.rules.newRule.impossible.tryThisInstead')).toBeNull();
    });
});
