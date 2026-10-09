import {fireEvent, render, screen} from '@testing-library/react-native';

import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@components/CategoryPicker', () => () => null);
jest.mock(
    '@components/PopoverWithMeasuredContent',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

const renderModal = (onAddCategory?: () => void) =>
    render(
        <CategoryPickerModal
            isVisible
            onClose={() => {}}
            anchorPosition={{horizontal: 0, vertical: 0}}
            policyID="policyID"
            onAddCategory={onAddCategory}
        />,
    );

describe('CategoryPickerModal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('shows an add button that adds a category for users who can create one', () => {
        // Given a user who can add categories to the workspace, as the full-page selector's "+" allows
        const onAddCategory = jest.fn();
        renderModal(onAddCategory);
        expect(screen.getByText('common.category')).toBeOnTheScreen();

        // When they press the add button in the pop-over's header
        fireEvent.press(screen.getByLabelText('workspace.categories.addCategory'));

        // Then the pop-over hands over to the add-category flow, so the pop-over offers the same action the full page does
        expect(onAddCategory).toHaveBeenCalledTimes(1);
    });

    it('shows no header for users who cannot create a category', () => {
        // Given a user who cannot add categories, e.g. a member or a workspace synced with an accounting integration
        // When the pop-over opens
        renderModal();

        // Then there is no add button or header, matching the full page that hides its "+" for them
        expect(screen.queryByLabelText('workspace.categories.addCategory')).toBeNull();
        expect(screen.queryByText('common.category')).toBeNull();
    });
});
