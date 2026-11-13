import {render} from '@testing-library/react-native';

import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';

import usePolicy from '@hooks/usePolicy';

import Navigation from '@libs/Navigation/Navigation';

import RulesAgentsTab from '@pages/workspace/rules/tabs/RulesAgentsTab';

import ROUTES from '@src/ROUTES';

import React from 'react';

jest.mock('@components/AgentRules/AgentRulesList', () => jest.fn(() => null));
jest.mock('@components/AgentRules/useAgentRulesSectionHeader', () => jest.fn(() => ({renderTitle: jest.fn(), renderSubtitle: jest.fn()})));
jest.mock('@components/EmptyStateComponent/GenericEmptyStateComponent', () => jest.fn(() => null));
jest.mock('@components/MenuItem', () =>
    Object.assign(
        jest.fn(() => null),
        {
            Row: jest.fn(() => null),
            Leading: jest.fn(() => null),
            Content: jest.fn(() => null),
            Icon: jest.fn(() => null),
            Title: jest.fn(() => null),
        },
    ),
);
jest.mock('@components/MenuItem/presets/MenuItemSectionRoot', () => jest.fn(() => null));
jest.mock(
    '@components/ScrollView',
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

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Plus: null})),
    useMemoizedLazyIllustrations: jest.fn(() => ({AgentsIceCream: null})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/usePolicy', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));
jest.mock('@hooks/useStyleUtils', () => jest.fn(() => ({getMaximumWidth: jest.fn(() => ({}))})));
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

const mockedUsePolicy = jest.mocked(usePolicy);
const mockedMenuItemSectionRoot = jest.mocked(MenuItemSectionRoot);
const mockedNavigate = jest.mocked(Navigation.navigate);

const POLICY_ID = 'POLICY_ID_1';

const mockKeyboardEvent = new KeyboardEvent('keydown');

function pressAddAgentRule() {
    const onPress = mockedMenuItemSectionRoot.mock.calls.at(0)?.at(0)?.onPress;
    onPress?.(mockKeyboardEvent);
}

describe('RulesAgentsTab', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Given a workspace that already has an agent rule, so the tab shows the list and not the empty state
        (mockedUsePolicy as jest.Mock).mockReturnValue({
            id: POLICY_ID,
            rules: {agentRules: {r1: {ruleID: 'r1', prompt: 'Reject expenses over $75', created: '2026-01-01 00:00:00'}}},
        });
    });

    it('opens a new agent rule from the row under the list', () => {
        // Given an admin who can write rules
        render(
            <RulesAgentsTab
                policyID={POLICY_ID}
                canWriteRules
                showReadOnlyModal={jest.fn()}
            />,
        );

        // When the admin presses Add agent rule
        pressAddAgentRule();

        // Then the agent rule page opens, because New rule has no agent rule option of its own
        expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.RULES_AGENT_NEW.getRoute(POLICY_ID));
    });

    it('explains why a user who cannot write rules cannot add one', () => {
        // Given a user who cannot write rules
        const showReadOnlyModal = jest.fn();
        render(
            <RulesAgentsTab
                policyID={POLICY_ID}
                canWriteRules={false}
                showReadOnlyModal={showReadOnlyModal}
            />,
        );

        // When the user presses Add agent rule
        pressAddAgentRule();

        // Then the read-only explanation shows and no page opens
        expect(showReadOnlyModal).toHaveBeenCalled();
        expect(mockedNavigate).not.toHaveBeenCalled();
    });
});
