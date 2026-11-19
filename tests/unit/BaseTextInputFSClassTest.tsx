import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import BaseTextInputImplementation from '@components/TextInput/BaseTextInput/implementation';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@hooks/useHtmlPaste', () => ({
    __esModule: true,
    default: jest.fn(),
}));

function renderWithProviders(children: React.ReactNode) {
    return render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>);
}

/** The FullStory class set on the native input itself */
function getInputFSClass(label: string): unknown {
    return (screen.getByLabelText(label).props as {fsClass?: unknown}).fsClass;
}

describe('BaseTextInput FullStory class', () => {
    it('should mask a secret input before and after its value is revealed', () => {
        // Given a secret input, like an accounting integration API key
        renderWithProviders(
            <BaseTextInputImplementation
                accessibilityLabel="API key"
                secureTextEntry
            />,
        );
        expect(getInputFSClass('API key')).toBe(CONST.FULLSTORY.CLASS.MASK);

        // When the user reveals the value with the eye toggle
        fireEvent.press(screen.getByLabelText(/visible/i));

        // Then the input stays masked, because the revealed value is plain text that FullStory would record
        expect(getInputFSClass('API key')).toBe(CONST.FULLSTORY.CLASS.MASK);
    });

    it('should keep a class passed to a secret input', () => {
        // Given a secret input that a caller explicitly excludes from recordings
        // When it renders
        renderWithProviders(
            <BaseTextInputImplementation
                accessibilityLabel="Password"
                secureTextEntry
                forwardedFSClass={CONST.FULLSTORY.CLASS.EXCLUDE}
            />,
        );

        // Then the caller's class wins over the secret default
        expect(getInputFSClass('Password')).toBe(CONST.FULLSTORY.CLASS.EXCLUDE);
    });

    it('should leave a regular input unmasked', () => {
        // Given an input that isn't secret and has no sensitive autofill hint
        // When it renders outside any masked container
        renderWithProviders(<BaseTextInputImplementation accessibilityLabel="Display name" />);

        // Then it keeps the unmasked default
        expect(getInputFSClass('Display name')).toBe(CONST.FULLSTORY.CLASS.UNMASK);
    });
});
