import {act, fireEvent, render, screen} from '@testing-library/react-native';

import usePolicy from '@hooks/usePolicy';

import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import * as API from '@libs/API';
import type {GenerateRuleParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import RulesNewPage from '@pages/workspace/rules/RulesNewPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {GeneratedRule} from '@src/types/onyx';
import type {GeneratedRuleState, GeneratedRuleType} from '@src/types/onyx/GeneratedRule';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import getOnyxValue from '../utils/getOnyxValue';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockPrompt = '';
let mockIsDescribeRuleBetaEnabled = true;

jest.mock('@react-navigation/native', () => {
    const actualNavigation = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
    return {
        ...actualNavigation,
        useFocusEffect: (callback: () => void) => {
            callback();
        },
        useIsFocused: () => true,
    };
});
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Sparkles: 'Sparkles'})),
    useMemoizedLazyIllustrations: jest.fn(() => ({CardReaderAlt: 'CardReaderAlt', Flag: 'Flag', CheckboxText: 'CheckboxText', ReportReceipt: 'ReportReceipt', AiBot: 'AiBot'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/usePermissions', () =>
    jest.fn(() => ({
        isBetaEnabled: (beta: string) => beta === jest.requireActual<{default: typeof CONST}>('@src/CONST').default.BETAS.DESCRIBE_RULE && mockIsDescribeRuleBetaEnabled,
    })),
);
jest.mock('@hooks/usePolicy', () => jest.fn());
jest.mock('@hooks/useTheme', () => jest.fn(() => ({icon: '#000'})));
jest.mock('@components/Icon', () => () => null);
jest.mock('@libs/actions/Policy/Category', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Policy/Category'),
    openPolicyCategoriesPage: jest.fn(),
}));
jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: jest.fn()})));
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
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
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
    '@components/ScrollView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/Header/composed/HeaderWithBackButtonAndTitle', () => () => null);
jest.mock('@components/Text', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
    return ({children}: {children: React.ReactNode}) => ReactModule.createElement(Text, null, children);
});
jest.mock('@components/MenuItem', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Pressable, Text} = jest.requireActual<{
        Pressable: React.ComponentType<{accessibilityLabel?: string; accessibilityRole?: string; onPress?: () => void; children?: React.ReactNode}>;
        Text: React.ComponentType<{children?: React.ReactNode}>;
    }>('react-native');
    return ({title, onPress}: {title: string; onPress: () => void}) =>
        ReactModule.createElement(Pressable, {accessibilityLabel: title, accessibilityRole: 'button', onPress}, ReactModule.createElement(Text, null, title));
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

type RulesNewPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_NEW>;

const POLICY_ID = 'policy1';

const mockedUsePolicy = jest.mocked(usePolicy);

type WriteSpy = jest.SpiedFunction<typeof API.write>;

function setAdminPolicy(areCategoriesEnabled = false) {
    mockedUsePolicy.mockReturnValue({...createRandomPolicy(0, CONST.POLICY.TYPE.CORPORATE), id: POLICY_ID, role: CONST.POLICY.ROLE.ADMIN, areCategoriesEnabled});
}

async function renderRulesNewPage(categoryName?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only screen props. The page reads only route.name and route.params.
    const props = {
        route: {key: 'Rules_New', name: SCREENS.WORKSPACE.RULES_NEW, params: {policyID: POLICY_ID, categoryName}},
        navigation: {},
    } as unknown as RulesNewPageProps;
    render(<RulesNewPage {...props} />);
    await waitForBatchedUpdatesWithAct();
}

function isGenerateRuleParams(parameters: unknown): parameters is GenerateRuleParams {
    return typeof parameters === 'object' && parameters !== null && 'generationID' in parameters && 'prompt' in parameters;
}

/** Submits the prompt through the describe form and returns the parameters of the GenerateRule request */
function describeRule(writeSpy: WriteSpy, prompt: string): GenerateRuleParams {
    mockPrompt = prompt;
    fireEvent.press(screen.getByLabelText('common.next'));
    const parameters = writeSpy.mock.calls.find(([command]) => command === WRITE_COMMANDS.GENERATE_RULE)?.at(1);
    if (!isGenerateRuleParams(parameters)) {
        throw new Error('The describe form did not request GenerateRule');
    }
    return parameters;
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

function getAddPolicyAgentRuleCalls(writeSpy: WriteSpy) {
    return writeSpy.mock.calls.filter(([command]) => command === WRITE_COMMANDS.ADD_POLICY_AGENT_RULE);
}

describe('New rule describe section', () => {
    let writeSpy: WriteSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        mockPrompt = '';
        mockIsDescribeRuleBetaEnabled = true;
        writeSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());
        setAdminPolicy();
    });

    afterEach(async () => {
        writeSpy.mockRestore();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('shows the four templates and then the describe section', async () => {
        // Given an admin with the describeRule beta on the New rule page
        await renderRulesNewPage();

        // When the admin looks at the options
        const options = screen.getAllByRole('button');

        // Then the four rule types come first, because the admin can describe the rule in the section below them
        const expectedOptionNames = [
            'workspace.rules.newRule.restrictCardSpend',
            'workspace.rules.newRule.flagForReview',
            'workspace.rules.newRule.requireFieldsShort',
            'workspace.rules.newRule.applyExpenseDefaults',
        ];
        expect(options).toHaveLength(expectedOptionNames.length);
        for (const [index, name] of expectedOptionNames.entries()) {
            expect(options.at(index)).toHaveAccessibleName(name);
        }

        // And the describe section follows, with its own submit button
        expect(screen.getByText('workspace.rules.newRule.startWithTemplate')).toBeOnTheScreen();
        expect(screen.getByText('workspace.rules.newRule.describeItBelow')).toBeOnTheScreen();
        expect(screen.getByLabelText('common.next')).toBeOnTheScreen();
    });

    it('asks for a template or a description when Next is pressed with an empty box', async () => {
        // Given an admin on New rule who neither picks a template nor types a description
        await renderRulesNewPage();
        mockPrompt = '';

        // When the admin presses Next
        fireEvent.press(screen.getByLabelText('common.next'));
        await waitForBatchedUpdatesWithAct();

        // Then the error above Next explains both ways forward, and nothing is sent, because the box is optional on New rule
        expect(await getPromptErrors()).toEqual([translateLocal('workspace.rules.newRule.selectTemplateOrDescribe')]);
        expect(writeSpy.mock.calls.filter(([command]) => command === WRITE_COMMANDS.GENERATE_RULE)).toHaveLength(0);
    });

    it('hides the describe section when New rule opens for a category', async () => {
        // Given an admin with the describeRule beta who opens New rule for a category, which the describe section cannot scope a rule to
        await renderRulesNewPage('Meals');

        // Then New rule lists only the rule types, without the describe section
        expect(screen.queryByText('workspace.rules.newRule.describeItBelow')).toBeNull();
        expect(screen.queryByLabelText('common.next')).toBeNull();
        expect(screen.getByText('workspace.rules.newRule.subtitle')).toBeOnTheScreen();
    });

    it('keeps Describe agent rule in place of the describe section without the beta', async () => {
        // Given an admin without the describeRule beta, who must see the New rule options that exist without the feature
        mockIsDescribeRuleBetaEnabled = false;
        await renderRulesNewPage();

        // When the admin looks at the options
        const options = screen.getAllByRole('button');

        // Then the four rule types come first and Describe agent rule comes last, with no describe section
        const expectedOptionNames = [
            'workspace.rules.newRule.restrictCardSpend',
            'workspace.rules.newRule.flagForReview',
            'workspace.rules.newRule.requireFields',
            'workspace.rules.newRule.applyExpenseDefaults',
            'workspace.rules.newRule.createAgentRule',
        ];
        expect(options).toHaveLength(expectedOptionNames.length);
        for (const [index, name] of expectedOptionNames.entries()) {
            expect(options.at(index)).toHaveAccessibleName(name);
        }

        expect(screen.queryByText('workspace.rules.newRule.describeItBelow')).toBeNull();

        // And Describe agent rule opens the agent rule page
        fireEvent.press(screen.getByLabelText('workspace.rules.newRule.createAgentRule'));
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RULES_AGENT_NEW.getRoute(POLICY_ID));
    });

    it('seeds the draft of the generated rule type and opens its editor', async () => {
        // Given the admin described a flag for review rule in the describe section, so the request lets Concierge pick the rule type
        await renderRulesNewPage();
        const {generationID, ruleType} = describeRule(writeSpy, 'Flag expenses over $500');
        expect(ruleType).toBeUndefined();

        // When Concierge answers with a flag for review rule
        await answerGeneration({
            generationID,
            state: CONST.GENERATED_RULE.STATE.RULE,
            ruleType: CONST.GENERATED_RULE.RULE_TYPE.FLAG_FOR_REVIEW,
            rule: {maxExpenseAmount: '500'},
        });

        // Then the flag for review editor opens with the generated values, so the admin only reviews and saves
        expect(await getOnyxValue(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM)).toEqual({maxExpenseAmount: '500'});
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(POLICY_ID));
    });

    it('scopes an expense defaults draft to a merchant rule', async () => {
        // Given the admin described an expense default for a merchant
        await renderRulesNewPage();
        const {generationID} = describeRule(writeSpy, 'Set Uber expenses to not billable');

        // When Concierge answers with an expense defaults rule
        await answerGeneration({
            generationID,
            state: CONST.GENERATED_RULE.STATE.RULE,
            ruleType: CONST.GENERATED_RULE.RULE_TYPE.EXPENSE_DEFAULTS,
            rule: {merchantToMatch: 'Uber'},
        });

        // Then the draft carries the merchant rule type, because the merchant editor sends a draft without one to the type picker
        expect(await getOnyxValue(ONYXKEYS.FORMS.MERCHANT_RULE_FORM)).toEqual({merchantToMatch: 'Uber', ruleType: CONST.POLICY.EXPENSE_DEFAULT_RULE_TYPE.MERCHANT});
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RULES_MERCHANT_NEW.getRoute(POLICY_ID));
    });

    it('opens the category tax rate editor for a categoryTaxRate answer', async () => {
        // Given a workspace with a Meals category and a GST rate that a category rule can use, and an admin who describes a tax default
        mockedUsePolicy.mockReturnValue({
            ...createRandomPolicy(0, CONST.POLICY.TYPE.CORPORATE),
            id: POLICY_ID,
            role: CONST.POLICY.ROLE.ADMIN,
            taxRates: {name: 'Tax', defaultExternalID: 'VAT', defaultValue: '5%', foreignTaxDefault: 'VAT', taxes: {VAT: {name: 'VAT', value: '5%'}, GST: {name: 'GST', value: '10%'}}},
        });
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, {Meals: {name: 'Meals', enabled: true}});
        });
        await renderRulesNewPage();
        const {generationID} = describeRule(writeSpy, 'Use GST for meals');

        // When Concierge answers with a category tax rate rule
        await answerGeneration({
            generationID,
            state: CONST.GENERATED_RULE.STATE.RULE,
            ruleType: CONST.GENERATED_RULE.RULE_TYPE.CATEGORY_TAX_RATE,
            rule: {categoriesToMatch: ['Meals'], tax: 'GST'},
        });

        // Then the expense defaults editor opens scoped to categories, because it takes its rule type from the draft
        expect(await getOnyxValue(ONYXKEYS.FORMS.MERCHANT_RULE_FORM)).toEqual({categoriesToMatch: ['Meals'], tax: 'GST', ruleType: CONST.POLICY.EXPENSE_DEFAULT_RULE_TYPE.CATEGORY});
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RULES_MERCHANT_NEW.getRoute(POLICY_ID));
    });

    it('shows an error when the generated category already has a tax rate rule', async () => {
        // Given a Meals category that already has a tax rate rule
        mockedUsePolicy.mockReturnValue({
            ...createRandomPolicy(0, CONST.POLICY.TYPE.CORPORATE),
            id: POLICY_ID,
            role: CONST.POLICY.ROLE.ADMIN,
            rules: {
                expenseRules: [
                    {
                        // eslint-disable-next-line @typescript-eslint/naming-convention -- the expense rule stores the tax under the field name that the backend uses
                        tax: {field_id_TAX: {externalID: 'GST'}},
                        applyWhen: [{condition: CONST.POLICY.RULE_CONDITIONS.MATCHES, field: CONST.POLICY.FIELDS.CATEGORY, value: 'Meals'}],
                    },
                ],
            },
        });
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, {Meals: {name: 'Meals', enabled: true}});
        });
        await renderRulesNewPage();
        const {generationID} = describeRule(writeSpy, 'Use GST for meals');

        // When Concierge answers with a tax rate rule for that category
        await answerGeneration({
            generationID,
            state: CONST.GENERATED_RULE.STATE.RULE,
            ruleType: CONST.GENERATED_RULE.RULE_TYPE.CATEGORY_TAX_RATE,
            rule: {categoriesToMatch: ['Meals'], tax: 'GST'},
        });

        // Then New rule shows the error and opens nothing, because a category can have one tax rate rule
        expect(await getPromptErrors()).toEqual([translateLocal('workspace.rules.newRule.promptErrors.categoryHasRule')]);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it.each([CONST.GENERATED_RULE.STATE.UNSUPPORTED, CONST.GENERATED_RULE.STATE.MULTIPLE_RULES])(
        'drafts an agent rule with the exact prompt for an admin when the answer is %s',
        async (state: GeneratedRuleState) => {
            // Given an admin described something no standard rule can do
            const logSpy = jest.spyOn(Log, 'info');
            const prompt = 'Block gift cards and require receipts over $50';
            await renderRulesNewPage();
            const {generationID} = describeRule(writeSpy, prompt);

            // When Concierge answers that it is not one standard rule
            await answerGeneration({generationID, state});

            // Then the prompt becomes the agent rule draft, and the agent rule page opens, joined to the description by its generationID
            expect(await getOnyxValue(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM_DRAFT)).toEqual({prompt});
            expect(logSpy).toHaveBeenCalledWith('[GenerateRule] Offered agent rule fallback', false, {policyID: POLICY_ID, generationID, state});
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RULES_AGENT_NEW.getRoute(POLICY_ID, generationID));

            // And nothing is saved, because the admin must still review the draft and press Create
            expect(getAddPolicyAgentRuleCalls(writeSpy)).toHaveLength(0);
            logSpy.mockRestore();
        },
    );

    it('drafts the instruction of an agent rule answer instead of the description', async () => {
        // Given an admin asked in the describe section for something that an agent rule can only approximate
        const prompt = 'Block gift cards';
        const agentRulePrompt = 'Hold any gift card expense and ask the submitter to justify it';
        await renderRulesNewPage();
        const {generationID} = describeRule(writeSpy, prompt);

        // When Concierge answers with an agent rule that says what the agent will do
        await answerGeneration({generationID, state: CONST.GENERATED_RULE.STATE.AGENT_RULE, agentRulePrompt, explanation: 'Agent rules cannot block a card charge.'});

        // Then the draft holds the agent's instruction, because that is the rule the admin reviews and saves
        expect(await getOnyxValue(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM_DRAFT)).toEqual({prompt: agentRulePrompt});
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RULES_AGENT_NEW.getRoute(POLICY_ID, generationID));

        // And the answer stays, because the agent rule page reads its explanation by the generationID
        expect((await getOnyxValue(ONYXKEYS.GENERATED_RULE))?.generationID).toBe(generationID);
    });

    it.each([undefined, 'futureRuleType'])('shows the unsupported error when a rule answer has the rule type %s', async (generatedRuleType) => {
        // Given an admin described a rule in the describe section
        await renderRulesNewPage();
        const {generationID} = describeRule(writeSpy, 'Flag expenses over $500');

        // When Concierge answers with a rule but with no rule type, or with a rule type that this app version does not know
        await answerGeneration({
            generationID,
            state: CONST.GENERATED_RULE.STATE.RULE,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- simulates an answer from a server that knows more rule types than this app version
            ruleType: generatedRuleType as GeneratedRuleType | undefined,
            rule: {maxExpenseAmount: '500'},
        });

        // Then the form shows the unsupported error, because no editor can show these values
        expect(await getPromptErrors()).toEqual([translateLocal('workspace.rules.newRule.promptErrors.unsupported')]);
        expect(screen.getByLabelText('common.next')).toBeOnTheScreen();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('shows why the description cannot be done and stays on New rule', async () => {
        // Given an admin asked for something that neither a rule nor an agent rule can do
        await renderRulesNewPage();
        const {generationID} = describeRule(writeSpy, 'Text the approver when a report is submitted');

        // When Concierge answers that it is impossible and suggests another description
        await answerGeneration({
            generationID,
            state: CONST.GENERATED_RULE.STATE.IMPOSSIBLE,
            reason: CONST.GENERATED_RULE.IMPOSSIBLE_REASON.NO_CAPABILITY,
            explanation: 'Rules cannot send text messages.',
            suggestedPrompt: 'Comment on the report when it is submitted',
        });

        // Then New rule shows the reason and the suggestion, and nothing opens, because no rule can be drafted
        expect(screen.getByText('workspace.rules.newRule.impossible.noCapability')).toBeOnTheScreen();
        expect(screen.getByText('Comment on the report when it is submitted')).toBeOnTheScreen();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(await getOnyxValue(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM_DRAFT)).toBeUndefined();
    });

    it('loads the policy categories when the workspace uses categories and none are loaded', async () => {
        // Given a workspace that uses categories, with no categories loaded
        setAdminPolicy(true);

        // When New rule opens with the describe section
        await renderRulesNewPage();

        // Then New rule requests the categories, because the describe form keeps only a category that the workspace has
        expect(openPolicyCategoriesPage).toHaveBeenCalledWith(POLICY_ID);
    });

    it('keeps the inline error for an unintelligible description', async () => {
        // Given an admin typed something Concierge cannot read
        await renderRulesNewPage();
        const {generationID} = describeRule(writeSpy, 'asdf qwerty zxcv');

        // When Concierge answers that the description is unintelligible
        await answerGeneration({generationID, state: CONST.GENERATED_RULE.STATE.UNINTELLIGIBLE});

        // Then the form asks for a clearer description, because an agent rule needs a prompt that makes sense
        expect(await getPromptErrors()).toEqual([translateLocal('workspace.rules.newRule.promptErrors.unintelligible')]);
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(await getOnyxValue(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM_DRAFT)).toBeUndefined();
    });
});
