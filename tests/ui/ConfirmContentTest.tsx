import {render, screen} from '@testing-library/react-native';

import ConfirmContent from '@components/ConfirmContent';
import ModalContext from '@components/Modal/ModalContext';

import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {ScrollView} from 'react-native';

const PROMPT = 'Long list of report names';

function renderConfirmContent() {
    return (
        <ConfirmContent
            title="Submit reports"
            prompt={PROMPT}
            onConfirm={jest.fn()}
            isVisible
            shouldEnablePromptScroll
        />
    );
}

describe('ConfirmContent', () => {
    it('does not nest a prompt ScrollView when the modal already wraps its content in one', () => {
        // Given a bottom-docked modal in landscape, which already wraps its children in a vertical ScrollView
        render(<ModalContext.Provider value={{isContentWrappedInScrollView: true, default: false}}>{renderConfirmContent()}</ModalContext.Provider>);

        // When the scrollable prompt is rendered
        // Then it is not wrapped in its own ScrollView, because nested vertical ScrollViews can't share a drag and leave the list or buttons unreachable
        expect(screen.getByText(PROMPT)).toBeOnTheScreen();
        expect(screen.UNSAFE_queryAllByType(ScrollView)).toHaveLength(0);
    });

    it('wraps the prompt in a ScrollView when the modal does not wrap its content in one', () => {
        // Given a modal that does not wrap its children in a ScrollView (for example, a bottom-docked modal in portrait)
        render(<ModalContext.Provider value={{isContentWrappedInScrollView: false, default: false}}>{renderConfirmContent()}</ModalContext.Provider>);

        // When the scrollable prompt is rendered
        // Then the prompt scrolls on its own so the title and buttons stay in place
        expect(screen.getByText(PROMPT)).toBeOnTheScreen();
        expect(screen.UNSAFE_queryAllByType(ScrollView)).toHaveLength(1);
    });

    it('wraps the prompt in a ScrollView when rendered outside a modal', () => {
        // Given no modal provider, so the default context is used
        render(renderConfirmContent());

        // When the scrollable prompt is rendered
        // Then it keeps its own ScrollView, as before
        expect(screen.getByText(PROMPT)).toBeOnTheScreen();
        expect(screen.UNSAFE_queryAllByType(ScrollView)).toHaveLength(1);
    });
});
