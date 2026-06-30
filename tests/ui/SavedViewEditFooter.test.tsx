import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SavedViewEditFooter from '@components/Search/SavedViewEditFooter';
import ONYXKEYS from '@src/ONYXKEYS';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type CapturedDropdownProps = {
    options: Array<{value: string; text: string; disabled?: boolean}>;
    onPress: (event: undefined, value: string) => void;
    isDisabled?: boolean;
};

// Capture the props the footer passes to the Save dropdown so we can assert its wiring without rendering the real menu.
let mockDropdownProps: CapturedDropdownProps | undefined;
jest.mock('@components/ButtonWithDropdownMenu', () => {
    function MockButtonWithDropdownMenu({options, onPress, isDisabled}: CapturedDropdownProps) {
        mockDropdownProps = {options, onPress, isDisabled};
        return null;
    }
    return MockButtonWithDropdownMenu;
});

describe('SavedViewEditFooter', () => {
    const onCancel = jest.fn();
    const onSaveEdits = jest.fn();
    const onSaveAsNewView = jest.fn();

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockDropdownProps = undefined;
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
    });

    const renderFooter = async () => {
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <SavedViewEditFooter
                    onCancel={onCancel}
                    onSaveEdits={onSaveEdits}
                    onSaveAsNewView={onSaveAsNewView}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
    };

    it('offers Save edits then Save as new view in the Save dropdown', async () => {
        await renderFooter();
        expect(mockDropdownProps?.options.map((option) => option.text)).toEqual([translateLocal('search.saveEdits'), translateLocal('search.saveAsNewView')]);
    });

    it('routes each dropdown option to its own handler', async () => {
        await renderFooter();
        mockDropdownProps?.onPress(undefined, 'edits');
        expect(onSaveEdits).toHaveBeenCalledTimes(1);
        expect(onSaveAsNewView).not.toHaveBeenCalled();

        mockDropdownProps?.onPress(undefined, 'newView');
        expect(onSaveAsNewView).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Cancel is pressed', async () => {
        await renderFooter();
        fireEvent.press(screen.getByRole('button', {name: translateLocal('common.cancel')}));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
