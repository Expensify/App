import {render, screen} from '@testing-library/react-native';

import {renderScrollComponent} from '@components/ActionSheetAwareScrollView/index.ios';

jest.unmock('@components/ActionSheetAwareScrollView/index.ios');
jest.mock('@components/ActionSheetAwareScrollView/useActionSheetKeyboardSpacing', () => jest.fn(() => ({get: () => 304})));

describe('ActionSheetAwareScrollView on iOS', () => {
    it('lifts the content by the action sheet spacing without changing the scroll view layout', () => {
        // Given the keyboard closes under an open context menu, so the state machine asks for 304 pixels of spacing.
        // When the chat list renders its scroll view.
        render(renderScrollComponent({style: {flex: 1}, testID: 'action-sheet-aware-scroll-view'}));

        // Then the content moves up by the spacing. A top padding would push the rows of the chronological list down
        // and add to the scroll content, which made the list flash when switching edits.
        const scrollView = screen.getByTestId('action-sheet-aware-scroll-view');
        expect(scrollView).toHaveStyle({flex: 1, transform: [{translateY: -304}]});
        expect(scrollView).not.toHaveStyle({paddingTop: 304});
    });
});
