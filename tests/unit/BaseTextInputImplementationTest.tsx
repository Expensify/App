import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import BaseTextInputImplementation from '@components/TextInput/BaseTextInput/implementation';

import React from 'react';

/**
 * Covers behaviour that lives in `BaseTextInput/implementation`. It is separate from
 * BaseTextInputTest because that file mocks the implementation module away to inspect the props
 * BaseTextInput forwards, so anything that needs the real implementation rendered belongs here.
 */
const mockUseHtmlPaste = jest.fn<void, unknown[]>();
jest.mock('@hooks/useHtmlPaste', () => ({
    __esModule: true,
    default: (...args: unknown[]): void => {
        mockUseHtmlPaste(...args);
    },
}));

function renderWithProviders(children: React.ReactNode) {
    return render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>);
}

describe('BaseTextInput implementation - HTML paste handler scoping', () => {
    /*
     * `useHtmlPaste` subscribes to the report collection so a pasted room mention resolves to its
     * name. Only markdown inputs can receive pasted HTML, so the hook is scoped to them via
     * `HtmlPasteHandler` — otherwise every text field in the app holds that subscription and
     * rebuilds the name map on each report write, for a paste path it never registers.
     */
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('subscribes for a markdown input, which can receive pasted HTML', () => {
        // Given a text input declared as markdown
        // When it renders
        renderWithProviders(
            <BaseTextInputImplementation
                type="markdown"
                accessibilityLabel="markdown input"
            />,
        );

        // Then the paste hook is mounted, so a pasted report mention can be resolved
        expect(mockUseHtmlPaste).toHaveBeenCalled();
    });

    it('does NOT subscribe for a plain input, which never registers a paste listener', () => {
        // Given a default (non-markdown) text input
        // When it renders
        renderWithProviders(<BaseTextInputImplementation accessibilityLabel="plain input" />);

        // Then the hook is never called, so the field holds no report subscription.
        // This is the regression guard: calling useHtmlPaste unconditionally from BaseTextInput
        // made every form field in the app subscribe to reports for a path it cannot reach.
        expect(mockUseHtmlPaste).not.toHaveBeenCalled();
    });
});
