import {render} from '@testing-library/react-native';
import React from 'react';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import Navigation from '@libs/Navigation/Navigation';
import AIRulesSection from '@pages/workspace/rules/AIRulesSection';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

jest.mock('@components/Badge', () => jest.fn(() => null));
jest.mock('@components/MenuItem', () => jest.fn(() => null));
jest.mock('@components/MenuItemWithTopDescription', () => jest.fn(() => null));
jest.mock(
    '@components/OfflineWithFeedback',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/Section',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/Text', () => jest.fn(() => null));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Plus: null})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/usePolicy', () => jest.fn());
jest.mock('@hooks/useTheme', () => jest.fn(() => ({text: '#000'})));
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
}));

jest.mock('@userActions/Policy/Rules', () => ({
    clearPolicyAIRuleErrors: jest.fn(),
}));

const mockedUsePolicy = jest.mocked(usePolicy);
const mockedUseNetwork = jest.mocked(useNetwork);
const mockedMenuItemWithTopDescription = jest.mocked(MenuItemWithTopDescription);
const mockedMenuItem = jest.mocked(MenuItem);
const mockedNavigate = jest.mocked(Navigation.navigate);

const POLICY_ID = 'POLICY_ID_1';

function setPolicyAIRules(aiRules: Record<string, unknown> | undefined) {
    (mockedUsePolicy as jest.Mock).mockReturnValue({rules: {aiRules}});
}

function getRuleTitles(): string[] {
    return mockedMenuItemWithTopDescription.mock.calls.map((call) => String(call.at(0)?.title ?? ''));
}

const mockKeyboardEvent = new KeyboardEvent('keydown');

describe('AIRulesSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseNetwork.mockReturnValue({isOffline: false} as ReturnType<typeof useNetwork>);
    });

    describe('title rendering', () => {
        it('uses rule.title when set', () => {
            setPolicyAIRules({
                r1: {ruleID: 'r1', prompt: 'Long prompt text', title: 'Short title', created: '2026-01-01 00:00:00'},
            });

            render(
                <AIRulesSection
                    policyID={POLICY_ID}
                    canWriteRules
                    showReadOnlyModal={jest.fn()}
                />,
            );

            expect(getRuleTitles()).toEqual(['Short title']);
        });

        it('falls back to rule.prompt when title is missing', () => {
            setPolicyAIRules({
                r1: {ruleID: 'r1', prompt: 'Prompt only', created: '2026-01-01 00:00:00'},
            });

            render(
                <AIRulesSection
                    policyID={POLICY_ID}
                    canWriteRules
                    showReadOnlyModal={jest.fn()}
                />,
            );

            expect(getRuleTitles()).toEqual(['Prompt only']);
        });

        it('collapses whitespace and trims', () => {
            setPolicyAIRules({
                r1: {ruleID: 'r1', prompt: '  hello\n\n  world  \t!  ', created: '2026-01-01 00:00:00'},
            });

            render(
                <AIRulesSection
                    policyID={POLICY_ID}
                    canWriteRules
                    showReadOnlyModal={jest.fn()}
                />,
            );

            expect(getRuleTitles()).toEqual(['hello world !']);
        });
    });

    describe('rule list filtering and sorting', () => {
        it('sorts rules by created desc', () => {
            setPolicyAIRules({
                r1: {ruleID: 'r1', prompt: 'first', title: 'A', created: '2026-01-01 00:00:00'},
                r2: {ruleID: 'r2', prompt: 'second', title: 'B', created: '2026-02-01 00:00:00'},
                r3: {ruleID: 'r3', prompt: 'third', title: 'C', created: '2026-03-01 00:00:00'},
            });

            render(
                <AIRulesSection
                    policyID={POLICY_ID}
                    canWriteRules
                    showReadOnlyModal={jest.fn()}
                />,
            );

            expect(getRuleTitles()).toEqual(['C', 'B', 'A']);
        });

        it('hides pending-delete rules when online', () => {
            setPolicyAIRules({
                r1: {ruleID: 'r1', prompt: 'keep', title: 'Keep', created: '2026-01-01 00:00:00'},
                r2: {
                    ruleID: 'r2',
                    prompt: 'goner',
                    title: 'Goner',
                    created: '2026-02-01 00:00:00',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            });

            render(
                <AIRulesSection
                    policyID={POLICY_ID}
                    canWriteRules
                    showReadOnlyModal={jest.fn()}
                />,
            );

            expect(getRuleTitles()).toEqual(['Keep']);
        });

        it('keeps pending-delete rules when offline so OfflineWithFeedback can style them', () => {
            mockedUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
            setPolicyAIRules({
                r1: {ruleID: 'r1', prompt: 'keep', title: 'Keep', created: '2026-01-01 00:00:00'},
                r2: {
                    ruleID: 'r2',
                    prompt: 'goner',
                    title: 'Goner',
                    created: '2026-02-01 00:00:00',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            });

            render(
                <AIRulesSection
                    policyID={POLICY_ID}
                    canWriteRules
                    showReadOnlyModal={jest.fn()}
                />,
            );

            expect(getRuleTitles()).toEqual(['Goner', 'Keep']);
        });

        it('renders no rule items when policy has none', () => {
            setPolicyAIRules(undefined);

            render(
                <AIRulesSection
                    policyID={POLICY_ID}
                    canWriteRules
                    showReadOnlyModal={jest.fn()}
                />,
            );

            expect(mockedMenuItemWithTopDescription).not.toHaveBeenCalled();
        });
    });

    describe('add rule button', () => {
        it('navigates to RULES_AI_NEW when user has write access', () => {
            setPolicyAIRules(undefined);

            render(
                <AIRulesSection
                    policyID={POLICY_ID}
                    canWriteRules
                    showReadOnlyModal={jest.fn()}
                />,
            );

            const onPress = mockedMenuItem.mock.calls.at(0)?.at(0)?.onPress;
            onPress?.(mockKeyboardEvent);

            expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.RULES_AI_NEW.getRoute(POLICY_ID));
        });

        it('calls showReadOnlyModal when user lacks write access', () => {
            const showReadOnlyModal = jest.fn();
            setPolicyAIRules(undefined);

            render(
                <AIRulesSection
                    policyID={POLICY_ID}
                    canWriteRules={false}
                    showReadOnlyModal={showReadOnlyModal}
                />,
            );

            const onPress = mockedMenuItem.mock.calls.at(0)?.at(0)?.onPress;
            onPress?.(mockKeyboardEvent);

            expect(showReadOnlyModal).toHaveBeenCalledTimes(1);
            expect(mockedNavigate).not.toHaveBeenCalled();
        });
    });

    describe('rule item press', () => {
        it('navigates to RULES_AI_EDIT when user has write access', () => {
            setPolicyAIRules({
                r1: {ruleID: 'r1', prompt: 'p', title: 'T', created: '2026-01-01 00:00:00'},
            });

            render(
                <AIRulesSection
                    policyID={POLICY_ID}
                    canWriteRules
                    showReadOnlyModal={jest.fn()}
                />,
            );

            const onPress = mockedMenuItemWithTopDescription.mock.calls.at(0)?.at(0)?.onPress;
            onPress?.(mockKeyboardEvent);

            expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.RULES_AI_EDIT.getRoute(POLICY_ID, 'r1'));
        });

        it('calls showReadOnlyModal when user lacks write access', () => {
            const showReadOnlyModal = jest.fn();
            setPolicyAIRules({
                r1: {ruleID: 'r1', prompt: 'p', title: 'T', created: '2026-01-01 00:00:00'},
            });

            render(
                <AIRulesSection
                    policyID={POLICY_ID}
                    canWriteRules={false}
                    showReadOnlyModal={showReadOnlyModal}
                />,
            );

            const onPress = mockedMenuItemWithTopDescription.mock.calls.at(0)?.at(0)?.onPress;
            onPress?.(mockKeyboardEvent);

            expect(showReadOnlyModal).toHaveBeenCalledTimes(1);
            expect(mockedNavigate).not.toHaveBeenCalled();
        });
    });
});
