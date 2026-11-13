import {act, fireEvent, render, screen} from '@testing-library/react-native';

import FormContext from '@components/Form/FormContext';
import FormWrapper from '@components/Form/FormWrapper';
import ScrollView from '@components/ScrollView';

import Accessibility from '@libs/Accessibility';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ErrorFields} from '@src/types/onyx/OnyxCommon';

import React from 'react';
// The native prototype lets this test observe the real wrapper's imperative scroll calls.
// eslint-disable-next-line no-restricted-imports
import {ScrollView as RNScrollView, View} from 'react-native';

import type {FormWrapperRef, InputComponentBaseProps, InputRefs} from '../../../../src/components/Form/types';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => {
            switch (key) {
                case 'common.please':
                    return 'Please';
                case 'common.fixTheErrors':
                    return 'fix the errors';
                case 'common.inTheFormBeforeContinuing':
                    return 'in the form before continuing';
                default:
                    return key;
            }
        },
        preferredLocale: 'en',
        numberFormat: jest.fn(),
    })),
);

jest.mock('@hooks/usePressLoading', () =>
    jest.fn(({isLoading = false}: {isLoading?: boolean} = {}) => ({
        isLoading,
        startWithLoading: async (runAfterPaint: () => void) => {
            runAfterPaint();
        },
    })),
);

const moveAccessibilityFocusSpy = jest.spyOn(Accessibility, 'moveAccessibilityFocus').mockImplementation(jest.fn());

function renderFormWrapper({
    errors = {},
    serverErrorFields,
    inputRefs,
    shouldScrollChildToFocus,
    ref,
}: {
    errors?: Record<string, string>;
    serverErrorFields?: ErrorFields | null;
    inputRefs: React.RefObject<InputRefs>;
    shouldScrollChildToFocus?: boolean;
    ref?: React.RefObject<FormWrapperRef | null>;
}) {
    return render(
        <FormContext.Provider
            value={{
                registerInput: jest.fn(),
                getErrorAnnouncementKey: () => 0,
                getFallbackAnnouncementMessage: () => '',
            }}
        >
            <FormWrapper
                ref={ref}
                formID={ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM}
                submitButtonText="Submit"
                onSubmit={jest.fn()}
                inputRefs={inputRefs}
                errors={errors}
                isAlertVisible
                serverErrorFields={serverErrorFields}
                shouldScrollChildToFocus={shouldScrollChildToFocus}
            >
                {null}
            </FormWrapper>
        </FormContext.Provider>,
    );
}

function createFocusableInput(inputID: string): InputComponentBaseProps {
    return {
        InputComponent: View,
        inputID,
        focus: jest.fn(),
        getNativeRef: jest.fn(),
    };
}

describe('FormWrapper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('starts an animated edit recovery immediately without a delayed second scroll', () => {
        // Given a form with a focused input whose keyboard is already open
        jest.useFakeTimers();
        const scrollSpy = jest.spyOn(RNScrollView.prototype, 'scrollTo').mockImplementation(() => {});
        const ref = React.createRef<FormWrapperRef>();
        renderFormWrapper({inputRefs: {current: {}}, ref});

        // When recovery opts out of the keyboard-opening wait
        act(() => ref.current?.scrollTo(216, {animated: true, shouldWaitForKeyboard: false}));

        // Then scrolling is animated but starts now, with no queued scroll overriding a later interaction
        expect(scrollSpy).toHaveBeenCalledTimes(1);
        expect(scrollSpy).toHaveBeenCalledWith({y: 216, animated: true});
        act(() => jest.runOnlyPendingTimers());
        expect(scrollSpy).toHaveBeenCalledTimes(1);
        scrollSpy.mockRestore();
        jest.useRealTimers();
    });

    it('preserves delayed animated scrolling for existing callers', () => {
        // Given a form opening the keyboard on initial focus
        jest.useFakeTimers();
        const scrollSpy = jest.spyOn(RNScrollView.prototype, 'scrollTo').mockImplementation(() => {});
        const ref = React.createRef<FormWrapperRef>();
        renderFormWrapper({inputRefs: {current: {}}, ref});

        // When an existing caller omits scrolling options
        act(() => ref.current?.scrollTo(-10));

        // Then it waits for the keyboard and clamps the target as before
        expect(scrollSpy).not.toHaveBeenCalled();
        act(() => jest.runOnlyPendingTimers());
        expect(scrollSpy).toHaveBeenCalledTimes(1);
        expect(scrollSpy).toHaveBeenCalledWith({y: 0, animated: true});
        scrollSpy.mockRestore();
        jest.useRealTimers();
    });

    it('focuses the first local validation error before server field errors', () => {
        const localInput = createFocusableInput('name');
        const serverInput = createFocusableInput('type');
        const inputRefs = {
            current: {
                name: {current: localInput},
                type: {current: serverInput},
            },
        } as React.RefObject<InputRefs>;

        renderFormWrapper({
            errors: {name: 'Required'},
            serverErrorFields: {type: {server: 'Server error'}},
            inputRefs,
        });

        fireEvent(screen.getByText('fix the errors'), 'press', {preventDefault: jest.fn()});

        expect(localInput.focus).toHaveBeenCalledTimes(1);
        expect(serverInput.focus).not.toHaveBeenCalled();
        expect(moveAccessibilityFocusSpy).toHaveBeenCalled();
    });

    it('falls back to server field errors when there are no local validation errors', () => {
        const serverInput = createFocusableInput('type');
        const inputRefs = {
            current: {
                type: {current: serverInput},
            },
        } as React.RefObject<InputRefs>;

        renderFormWrapper({
            errors: {},
            serverErrorFields: {type: {server: 'Server error'}},
            inputRefs,
        });

        fireEvent(screen.getByText('fix the errors'), 'press', {preventDefault: jest.fn()});

        expect(serverInput.focus).toHaveBeenCalledTimes(1);
        expect(moveAccessibilityFocusSpy).toHaveBeenCalled();
    });

    it('keeps the Android scroll to a focused input by default', () => {
        // Given a form that does not scroll to its inputs itself
        // When the form renders
        renderFormWrapper({inputRefs: {current: {}}});

        // Then the scroll view moves a focused input into view
        expect(screen.UNSAFE_getByType(ScrollView).props.scrollsChildToFocus).toBe(true);
    });

    it('turns off the Android scroll to a focused input when the form scrolls to the input itself', () => {
        // Given a form that scrolls to its input when the input gets focus
        // When the form renders
        renderFormWrapper({inputRefs: {current: {}}, shouldScrollChildToFocus: false});

        // Then the scroll view does not also move the focused input, which would move the page two times
        expect(screen.UNSAFE_getByType(ScrollView).props.scrollsChildToFocus).toBe(false);
    });
});
