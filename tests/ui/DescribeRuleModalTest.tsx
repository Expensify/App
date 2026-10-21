import {act, fireEvent, render, screen} from '@testing-library/react-native';

import * as API from '@libs/API';
import type {GenerateRuleParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';

import DescribeRuleModal from '@pages/workspace/rules/DescribeRuleModal';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GeneratedRule} from '@src/types/onyx';
import type {GeneratedRuleType} from '@src/types/onyx/GeneratedRule';

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

    it('shows the unsupported error for an unsupported answer when the caller gives no agent rule fallback', async () => {
        // Given the flag for review editor asked for a rule, and the editor does not offer the agent rule fallback
        const onRuleGenerated = jest.fn();
        const onClose = jest.fn();
        await renderFlagForReviewModal(onRuleGenerated, onClose);
        const generationID = describeRule(writeSpy, 'Block gift cards');

        // When Concierge answers that the rule is not supported
        await answerGeneration({generationID, state: CONST.GENERATED_RULE.STATE.UNSUPPORTED});

        // Then the modal shows the unsupported error, because only a caller with a fallback turns this answer into an agent rule
        expect(onRuleGenerated).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(await getPromptErrors()).toEqual([translateLocal('workspace.rules.newRule.promptErrors.unsupported')]);
    });
});
