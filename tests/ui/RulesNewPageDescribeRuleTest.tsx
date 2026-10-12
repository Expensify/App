import {act, fireEvent, render, screen} from '@testing-library/react-native';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import usePolicy from '@hooks/usePolicy';

import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import * as API from '@libs/API';
import type {GenerateRuleParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import DescribeRuleModal from '@pages/workspace/rules/DescribeRuleModal';
import RulesNewPage from '@pages/workspace/rules/RulesNewPage';

import type * as ModalActions from '@userActions/Modal';
import {onModalDidClose} from '@userActions/Modal';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {GeneratedRule} from '@src/types/onyx';
import type {GeneratedRuleState, GeneratedRuleType} from '@src/types/onyx/GeneratedRule';

import type * as ReactNavigationNative from '@react-navigation/native';
import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import getOnyxValue from '../utils/getOnyxValue';
import {buildPersonalDetails, translateLocal} from '../utils/TestHelper';
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
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn(() => ({CardReaderAlt: 'CardReaderAlt', Flag: 'Flag', CheckboxText: 'CheckboxText', ReportReceipt: 'ReportReceipt', AiBot: 'AiBot'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/usePolicy', () => jest.fn());
jest.mock('@libs/actions/Policy/Category', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Policy/Category'),
    openPolicyCategoriesPage: jest.fn(),
}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn());
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
jest.mock('@components/Modal', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {setCloseModal} = jest.requireActual<typeof ModalActions>('@userActions/Modal');
    // Register the close callback the same as BaseModal does, because the `close` action in `@userActions/Modal` must close this modal.
    function MockModal({isVisible, onClose, children}: {isVisible: boolean; onClose: () => void; children: React.ReactNode}) {
        ReactModule.useEffect(() => (isVisible ? setCloseModal(onClose) : undefined), [isVisible, onClose]);
        return isVisible ? children : null;
    }
    return MockModal;
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
const ADMIN_LOGIN = 'admin@example.com';

const mockedUsePolicy = jest.mocked(usePolicy);
const mockedUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);

type WriteSpy = jest.SpiedFunction<typeof API.write>;

function setPolicyRole(role: ValueOf<typeof CONST.POLICY.ROLE>, areCategoriesEnabled = false) {
    mockedUsePolicy.mockReturnValue({...createRandomPolicy(0, CONST.POLICY.TYPE.CORPORATE), id: POLICY_ID, role, areCategoriesEnabled});
}

async function renderRulesNewPage() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only screen props. The page reads only route.name and route.params.
    const props = {
        route: {key: 'Rules_New', name: SCREENS.WORKSPACE.RULES_NEW, params: {policyID: POLICY_ID}},
        navigation: {},
    } as unknown as RulesNewPageProps;
    render(<RulesNewPage {...props} />);
    await waitForBatchedUpdatesWithAct();
}

async function openDescribeModal() {
    await renderRulesNewPage();
    fireEvent.press(screen.getByLabelText('workspace.rules.newRule.describeYourRule'));
    await waitForBatchedUpdatesWithAct();
}

function isGenerateRuleParams(parameters: unknown): parameters is GenerateRuleParams {
    return typeof parameters === 'object' && parameters !== null && 'generationID' in parameters && 'prompt' in parameters;
}

/** Submits the prompt through the describe modal and returns the parameters of the GenerateRule request */
function describeRule(writeSpy: WriteSpy, prompt: string): GenerateRuleParams {
    mockPrompt = prompt;
    fireEvent.press(screen.getByLabelText('common.next'));
    const parameters = writeSpy.mock.calls.find(([command]) => command === WRITE_COMMANDS.GENERATE_RULE)?.at(1);
    if (!isGenerateRuleParams(parameters)) {
        throw new Error('The describe modal did not request GenerateRule');
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

describe('RulesNewPage describe flow', () => {
    let writeSpy: WriteSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        mockPrompt = '';
        writeSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());
        mockedUseCurrentUserPersonalDetails.mockReturnValue(buildPersonalDetails(ADMIN_LOGIN, 1));
        setPolicyRole(CONST.POLICY.ROLE.ADMIN);
    });

    afterEach(async () => {
        writeSpy.mockRestore();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('lists Describe your rule first, before the four rule types', async () => {
        // Given an admin on the New rule page

        // When the page renders
        await renderRulesNewPage();

        // Then describing comes first, so the admin can describe the rule before picking a rule type
        const options = screen.getAllByRole('button');
        const expectedOptionNames = [
            'workspace.rules.newRule.describeYourRule',
            'workspace.rules.newRule.restrictCardSpend',
            'workspace.rules.newRule.flagForReview',
            'workspace.rules.newRule.requireFields',
            'workspace.rules.newRule.applyExpenseDefaults',
        ];
        expect(options).toHaveLength(expectedOptionNames.length);
        for (const [index, name] of expectedOptionNames.entries()) {
            expect(options.at(index)).toHaveAccessibleName(name);
        }
    });

    it('seeds the draft of the generated rule type and opens its editor', async () => {
        // Given the admin described a flag for review rule from New rule, so the request lets Concierge pick the rule type
        await openDescribeModal();
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
        await openDescribeModal();
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

    it.each([CONST.GENERATED_RULE.STATE.UNSUPPORTED, CONST.GENERATED_RULE.STATE.MULTIPLE_RULES])(
        'drafts an agent rule with the exact prompt for an admin when the answer is %s',
        async (state: GeneratedRuleState) => {
            // Given an admin described something no standard rule can do
            const logSpy = jest.spyOn(Log, 'info');
            const prompt = 'Block gift cards and require receipts over $50';
            await openDescribeModal();
            const {generationID} = describeRule(writeSpy, prompt);

            // When Concierge answers that it is not one standard rule
            await answerGeneration({generationID, state});

            // Then the modal closes with the prompt as an agent rule draft, and nothing opens while the modal hides
            expect(screen.queryByLabelText('common.next')).toBeNull();
            expect(await getOnyxValue(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM_DRAFT)).toEqual({prompt});
            expect(logSpy).toHaveBeenCalledWith('[GenerateRule] Offered agent rule fallback', false, {policyID: POLICY_ID, generationID, state});
            expect(Navigation.navigate).not.toHaveBeenCalled();

            // When the modal finishes its hide transition
            act(() => {
                onModalDidClose();
            });

            // Then the agent rule page opens, joined to the description by its generationID
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RULES_AGENT_NEW.getRoute(POLICY_ID, generationID));

            // And nothing is saved, because the admin must still review the draft and press Create
            expect(getAddPolicyAgentRuleCalls(writeSpy)).toHaveLength(0);
            logSpy.mockRestore();
        },
    );

    it.each([CONST.GENERATED_RULE.STATE.UNSUPPORTED, CONST.GENERATED_RULE.STATE.MULTIPLE_RULES])(
        'tells a member who cannot create agent rules to ask an admin when the answer is %s',
        async (state: GeneratedRuleState) => {
            // Given a member with write access to rules who is not a workspace admin
            setPolicyRole(CONST.POLICY.ROLE.USER);
            await openDescribeModal();
            const {generationID} = describeRule(writeSpy, 'Block gift cards');

            // When Concierge answers that it is not one standard rule
            await answerGeneration({generationID, state});

            // Then the modal shows the admin-only error and nothing opens, because the agent rule page would refuse this member
            expect(await getPromptErrors()).toEqual([translateLocal('workspace.rules.newRule.promptErrors.agentRuleAdminOnly')]);
            expect(Navigation.navigate).not.toHaveBeenCalled();
            expect(await getOnyxValue(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM_DRAFT)).toBeUndefined();
        },
    );

    it.each([undefined, 'futureRuleType'])('shows the unsupported error when a rule answer has the rule type %s', async (generatedRuleType) => {
        // Given an admin described a rule from New rule
        await openDescribeModal();
        const {generationID} = describeRule(writeSpy, 'Flag expenses over $500');

        // When Concierge answers with a rule but with no rule type, or with a rule type that this app version does not know
        await answerGeneration({
            generationID,
            state: CONST.GENERATED_RULE.STATE.RULE,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- simulates an answer from a server that knows more rule types than this app version
            ruleType: generatedRuleType as GeneratedRuleType | undefined,
            rule: {maxExpenseAmount: '500'},
        });

        // Then the modal stays open with the unsupported error, because no editor can show these values
        expect(await getPromptErrors()).toEqual([translateLocal('workspace.rules.newRule.promptErrors.unsupported')]);
        expect(screen.getByLabelText('common.next')).toBeOnTheScreen();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('loads the policy categories when the workspace uses categories and none are loaded', async () => {
        // Given a workspace that uses categories, with no categories loaded
        setPolicyRole(CONST.POLICY.ROLE.ADMIN, true);

        // When the New rule page opens
        await renderRulesNewPage();

        // Then the page requests the categories, because the describe modal keeps only a category that the workspace has
        expect(openPolicyCategoriesPage).toHaveBeenCalledWith(POLICY_ID);
    });

    it('keeps the inline error for an unintelligible description', async () => {
        // Given an admin typed something Concierge cannot read
        await openDescribeModal();
        const {generationID} = describeRule(writeSpy, 'asdf qwerty zxcv');

        // When Concierge answers that the description is unintelligible
        await answerGeneration({generationID, state: CONST.GENERATED_RULE.STATE.UNINTELLIGIBLE});

        // Then the modal asks for a clearer description, because an agent rule needs a prompt that makes sense
        expect(await getPromptErrors()).toEqual([translateLocal('workspace.rules.newRule.promptErrors.unintelligible')]);
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(await getOnyxValue(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM_DRAFT)).toBeUndefined();
    });
});

describe('DescribeRuleModal in a rule editor', () => {
    let writeSpy: WriteSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        writeSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());
    });

    afterEach(async () => {
        writeSpy.mockRestore();
        await act(async () => {
            await Onyx.clear();
        });
    });

    async function renderEditorModal(onRuleGenerated: jest.Mock) {
        render(
            <DescribeRuleModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                ruleType={CONST.GENERATED_RULE.RULE_TYPE.FLAG_FOR_REVIEW}
                onRuleGenerated={onRuleGenerated}
            />,
        );
        await waitForBatchedUpdatesWithAct();
    }

    it('shows the unsupported error when the answer has another rule type', async () => {
        // Given the flag for review editor asked for a rule
        const onRuleGenerated = jest.fn();
        await renderEditorModal(onRuleGenerated);
        const {generationID} = describeRule(writeSpy, 'Block retail purchases on all cards');

        // When Concierge answers with a card spend rule
        await answerGeneration({
            generationID,
            state: CONST.GENERATED_RULE.STATE.RULE,
            ruleType: CONST.GENERATED_RULE.RULE_TYPE.RESTRICT_CARD_SPEND,
            rule: {merchantNames: ['Walmart']},
        });

        // Then the editor keeps its form, because it cannot show the values of another rule type
        expect(onRuleGenerated).not.toHaveBeenCalled();
        expect(await getPromptErrors()).toEqual([translateLocal('workspace.rules.newRule.promptErrors.unsupported')]);
    });

    it('keeps the inline error for an unsupported answer when no agent rule fallback is given', async () => {
        // Given an editor, which does not offer the agent rule fallback
        const onRuleGenerated = jest.fn();
        await renderEditorModal(onRuleGenerated);
        const {generationID} = describeRule(writeSpy, 'Block gift cards');

        // When Concierge answers that the rule is not supported
        await answerGeneration({generationID, state: CONST.GENERATED_RULE.STATE.UNSUPPORTED});

        // Then the editor shows the unsupported error, because only the New rule page routes to an agent rule
        expect(onRuleGenerated).not.toHaveBeenCalled();
        expect(await getPromptErrors()).toEqual([translateLocal('workspace.rules.newRule.promptErrors.unsupported')]);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
