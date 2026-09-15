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
        await renderDropdown();

        expect(screen.getByTestId('selection-list-text-input')).toBeOnTheScreen();
    });

    it('hides the search input when the caller opts out', async () => {
        await renderDropdown({shouldShowTextInput: false});

        expect(screen.queryByTestId('selection-list-text-input')).not.toBeOnTheScreen();
    });

    it('lists a recently used option twice by default, once in the "Recent" section and once in the full list', async () => {
        await renderDropdown();

        expect(screen.getAllByTestId('base-list-item-Bravo')).toHaveLength(2);
    });

    it('lists a recently used option only once when the caller opts out of the "Recent" section', async () => {
        await renderDropdown({shouldShowRecentlyUsedOptions: false});

        expect(screen.getAllByTestId('base-list-item-Bravo')).toHaveLength(1);
    });

    it('submits the option that was picked', async () => {
        const onSubmit = jest.fn();
        await renderDropdown({onSubmit});

        fireEvent.press(screen.getByTestId('base-list-item-Charlie'));
        await waitForBatchedUpdatesWithAct();

        expect(onSubmit).toHaveBeenCalledWith({[fieldKey]: 'Charlie'});
    });

    it('submits the current value rather than an empty string when the option already selected is picked again', async () => {
        const onSubmit = jest.fn();
        await renderDropdown({onSubmit});

        fireEvent.press(screen.getByTestId('base-list-item-Alpha'));
        await waitForBatchedUpdatesWithAct();

        // Callers skip a save that would not change anything by comparing this against the stored value, so an empty
        // string here would be read as "the user cleared the field" instead.
        expect(onSubmit).toHaveBeenCalledWith({[fieldKey]: 'Alpha'});
    });
});
