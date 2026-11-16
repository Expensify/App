import {fireEvent, render, screen} from '@testing-library/react-native';

import DynamicFormDropdownField from '@components/DynamicForm/components/DynamicFormDropdownField';
import type {DynamicFormDropdownFieldRenderProps} from '@components/DynamicForm/components/DynamicFormDropdownField';
import DynamicFormModalContext from '@components/DynamicForm/components/DynamicFormModalContext';
import {LocaleContextProvider} from '@components/LocaleContextProvider';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

// The full page is a modal, which a bare render cannot open, so it shows its list straight away
jest.mock(
    '@components/DynamicForm/components/DynamicFormFullPageList',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: false, shouldUseNarrowLayout: false})));
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 1280, windowHeight: 800})));

const LABEL = 'Country of residence';

describe('DynamicFormDropdownField', () => {
    let fullPageListProps: DynamicFormDropdownFieldRenderProps | undefined;
    const renderDropdown = jest.fn(() => null);

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        fullPageListProps = undefined;
        renderDropdown.mockClear();
        jest.spyOn(View.prototype, 'measureInWindow').mockImplementation((callback) => callback(16, 100, 300, 60));
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const renderField = (isInsideModal: boolean) =>
        render(
            <LocaleContextProvider>
                <DynamicFormModalContext.Provider value={isInsideModal}>
                    <DynamicFormDropdownField
                        label={LABEL}
                        title={LABEL}
                        errorText=""
                        disabled={false}
                        renderDropdown={renderDropdown}
                        renderFullPageList={(props) => {
                            fullPageListProps = props;
                            return null;
                        }}
                    />
                </DynamicFormModalContext.Provider>
            </LocaleContextProvider>,
        );

    const pressRow = () => fireEvent.press(screen.getByLabelText(LABEL, {exact: false}), {nativeEvent: {}});

    it('opens the list anchored to the row on a page', () => {
        // Given a field on a page, with room under its row
        renderField(false);

        // When the user presses the row
        pressRow();

        // Then the list opens in the container under the row, and the full page stays shut
        expect(renderDropdown).toHaveBeenCalledWith(expect.objectContaining({isVisible: true}));
        expect(fullPageListProps?.isVisible).toBe(false);
    });

    it('opens the list on a full page inside a modal, which the anchored container would draw behind', () => {
        // Given a field inside the list entry editor modal
        renderField(true);

        // When the user presses the row
        pressRow();

        // Then the list opens on the full page over the modal, and no container is drawn behind it
        expect(fullPageListProps?.isVisible).toBe(true);
        expect(renderDropdown).not.toHaveBeenCalled();
    });
});
