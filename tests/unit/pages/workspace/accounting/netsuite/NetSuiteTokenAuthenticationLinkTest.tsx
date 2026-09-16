import {fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import NetSuiteTokenAuthenticationLink from '@pages/workspace/accounting/netsuite/NetSuiteTokenInput/NetSuiteTokenAuthenticationLink';

import React from 'react';
// eslint-disable-next-line no-restricted-imports -- React Native Text stands in for TextLink so the test can press it without theme providers.
import {Text} from 'react-native';

const POLICY_ID = '123';

type MockTextLinkProps = {
    onPress: () => void;
    children: React.ReactNode;
};

// `Mock`-prefixed bindings are allowed inside jest.mock factories, unlike regular imports.
const MockText = Text;

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));
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
jest.mock('@components/TextLink', () => ({onPress, children}: MockTextLinkProps) => <MockText onPress={onPress}>{children}</MockText>);

const mockedNavigate = jest.mocked(Navigation.navigate);

describe('NetSuiteTokenAuthenticationLink', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('sends the user to the first token-based authentication step and keeps them in that flow', () => {
        render(<NetSuiteTokenAuthenticationLink policyID={POLICY_ID} />);

        fireEvent.press(screen.getByText('workspace.netsuite.tokenInput.connectWithTokenAuthentication'));

        expect(mockedNavigate).toHaveBeenCalledWith(`workspaces/${POLICY_ID}/accounting/netsuite/token-input/authentication?authType=tba`);
    });
});
