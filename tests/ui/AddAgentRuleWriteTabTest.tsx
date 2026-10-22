import {render, screen} from '@testing-library/react-native';

import useNetwork from '@hooks/useNetwork';

import AddAgentRuleWriteTab from '@pages/workspace/rules/AgentRules/AddAgentRuleWriteTab';

import React from 'react';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useIsFocusedRef', () => jest.fn(() => ({current: true})));
jest.mock('@hooks/useNetwork');
jest.mock('@hooks/usePressLoading', () => jest.fn(() => ({isLoading: false, startWithLoading: (fn: () => void) => fn()})));
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
jest.mock('@components/TextInput', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {TextInput} = jest.requireActual<{
        TextInput: React.ComponentType<{value?: string; onChangeText?: (text: string) => void; accessibilityLabel?: string}>;
    }>('react-native');
    return ({value, onChangeText, label}: {value?: string; onChangeText?: (text: string) => void; label?: string}) =>
        ReactModule.createElement(TextInput, {
            value,
            onChangeText,
            accessibilityLabel: label,
        });
});

const mockedUseNetwork = jest.mocked(useNetwork);

describe('AddAgentRuleWriteTab', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseNetwork.mockReturnValue({isOffline: false});
    });

    it('disables Create rule while offline', () => {
        // Given the device is offline
        mockedUseNetwork.mockReturnValue({isOffline: true});

        // When the Write tab renders
        render(<AddAgentRuleWriteTab onSave={jest.fn()} />);

        // Then the Create rule submit button is disabled, matching every other rule editor's submit while offline
        const submitButton = screen.getByText('workspace.rules.agentRules.createRule');
        expect(submitButton).toBeDisabled();
    });

    it('enables Create rule while online', () => {
        // Given the device is online

        // When the Write tab renders
        render(<AddAgentRuleWriteTab onSave={jest.fn()} />);

        // Then the Create rule submit button is enabled
        const submitButton = screen.getByText('workspace.rules.agentRules.createRule');
        expect(submitButton).toBeEnabled();
    });
});
