import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import EditReportFieldDropdown from '@pages/EditReportFieldDropdown';

import ONYXKEYS from '@src/ONYXKEYS';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => ({
    ...((): typeof NativeNavigation => jest.requireActual('@react-navigation/native'))(),
    useNavigation: jest.fn(() => ({navigate: jest.fn(), addListener: jest.fn(() => jest.fn())})),
    useIsFocused: jest.fn(() => true),
    useRoute: jest.fn(() => ({key: '', name: ''})),
    // The dropdown is rendered outside a navigator here, so the focus effect that resets the pinned selection is a noop.
    useFocusEffect: jest.fn(),
}));

const fieldKey = 'expensify_field_dropdown';
const fieldOptions = ['Alpha', 'Bravo', 'Charlie'];

const renderDropdown = async (props: Partial<React.ComponentProps<typeof EditReportFieldDropdown>> = {}) => {
    const rendered = render(
        <ComposeProviders components={[OnyxListItemProvider]}>
            <EditReportFieldDropdown
                fieldKey={fieldKey}
                fieldValue="Alpha"
                fieldOptions={fieldOptions}
                onSubmit={jest.fn()}
                {...props}
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
    return rendered;
};

describe('EditReportFieldDropdown', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            // "Bravo" was used recently, so the "Recent" section has something to render when it is enabled.
            await Onyx.merge(ONYXKEYS.RECENTLY_USED_REPORT_FIELDS, {[fieldKey]: ['Bravo']});
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('shows the search input by default', async () => {
        // Given a dropdown rendered without any opt-out
        await renderDropdown();

        // When the list is displayed
        // Then the search input is there, because the editor page has always been searchable and the new flags must
        // not quietly change what an existing caller gets
        expect(screen.getByTestId('selection-list-text-input')).toBeOnTheScreen();
    });

    it('hides the search input when the caller opts out', async () => {
        // Given a caller that opts out of the search input, which the inline field does for a short option list
        await renderDropdown({shouldShowTextInput: false});

        // When the list is displayed
        // Then the search input is gone, so the popover does not reserve height for a box that is quicker to scan
        // past than to type into
        expect(screen.queryByTestId('selection-list-text-input')).not.toBeOnTheScreen();
    });

    it('lists a recently used option twice by default, once in the "Recent" section and once in the full list', async () => {
        // Given "Bravo" recorded as recently used and a dropdown rendered without any opt-out
        await renderDropdown();

        // When the list is displayed
        // Then "Bravo" appears in both the "Recent" section and the full list, which is the editor page's existing
        // behavior and must survive the flags being added
        expect(screen.getAllByTestId('base-list-item-Bravo')).toHaveLength(2);
    });

    it('lists a recently used option only once when the caller opts out of the "Recent" section', async () => {
        // Given "Bravo" recorded as recently used and a caller that opts out of the "Recent" section
        await renderDropdown({shouldShowRecentlyUsedOptions: false});

        // When the list is displayed
        // Then "Bravo" appears once. A short list shown in a small popover is worse for having the same few options
        // repeated at the top than it is for making the user read all of them
        expect(screen.getAllByTestId('base-list-item-Bravo')).toHaveLength(1);
    });

    it('submits the option that was picked', async () => {
        // Given a dropdown whose field currently holds "Alpha"
        const onSubmit = jest.fn();
        await renderDropdown({onSubmit});

        // When a different option is pressed
        fireEvent.press(screen.getByTestId('base-list-item-Charlie'));
        await waitForBatchedUpdatesWithAct();

        // Then it is submitted under the field's own key, which is what both the editor page and the inline field
        // rely on to know which field the value belongs to
        expect(onSubmit).toHaveBeenCalledWith({[fieldKey]: 'Charlie'});
    });

    it('submits the current value rather than an empty string when the option already selected is picked again', async () => {
        // Given a dropdown whose field currently holds "Alpha"
        const onSubmit = jest.fn();
        await renderDropdown({onSubmit});

        // When that same option is pressed again
        fireEvent.press(screen.getByTestId('base-list-item-Alpha'));
        await waitForBatchedUpdatesWithAct();

        // Then the current value is submitted, not an empty string. Callers skip a no-op save by comparing this
        // against the stored value, so an empty string would be read as the user having cleared the field
        expect(onSubmit).toHaveBeenCalledWith({[fieldKey]: 'Alpha'});
    });
});
