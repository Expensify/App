import {act, fireEvent, render, screen} from '@testing-library/react-native';

import FormContext from '@components/Form/FormContext';
import FormWrapper from '@components/Form/FormWrapper';
import type {FormWrapperRef} from '@components/Form/types';

import useKeyboardState from '@hooks/useKeyboardState';

import Accessibility from '@libs/Accessibility';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ErrorFields} from '@src/types/onyx/OnyxCommon';

import React, {createRef} from 'react';
import {View} from 'react-native';
import {KeyboardEvents} from 'react-native-keyboard-controller';

import type {InputComponentBaseProps, InputRefs} from '../../../../src/components/Form/types';

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

const mockScrollTo = jest.fn();

jest.mock('@components/ScrollView', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {View: MockView} = jest.requireActual<{View: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
    return ({children, ref}: {children: React.ReactNode; ref: React.Ref<{scrollTo: typeof mockScrollTo}>}) => {
        ReactModule.useImperativeHandle(ref, () => ({scrollTo: mockScrollTo}));
        return ReactModule.createElement(MockView, null, children);
    };
});

jest.mock('@hooks/useKeyboardState', () => jest.fn());

jest.mock('@hooks/usePressLoading', () =>
    jest.fn(({isLoading = false}: {isLoading?: boolean} = {}) => ({
        isLoading,
        startWithLoading: async (runAfterPaint: () => void) => {
            runAfterPaint();
        },
    })),
);

const moveAccessibilityFocusSpy = jest.spyOn(Accessibility, 'moveAccessibilityFocus').mockImplementation(jest.fn());
const mockedUseKeyboardState = jest.mocked(useKeyboardState);
const mockedAddListener = jest.mocked(KeyboardEvents.addListener);

/** Returns the keyboard state of a keyboard that is open or closed */
function getKeyboardState(isKeyboardShown: boolean): ReturnType<typeof useKeyboardState> {
    return {
        isKeyboardShown,
        isKeyboardActive: isKeyboardShown,
        keyboardHeight: isKeyboardShown ? 300 : 0,
        keyboardActiveHeight: isKeyboardShown ? 300 : 0,
        isKeyboardAnimatingRef: {current: false},
    };
}

function renderFormWrapper({
    errors = {},
    serverErrorFields,
    inputRefs,
    ref,
}: {
    errors?: Record<string, string>;
    serverErrorFields?: ErrorFields | null;
    inputRefs: React.RefObject<InputRefs>;
    ref?: React.Ref<FormWrapperRef>;
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
        mockedUseKeyboardState.mockReturnValue(getKeyboardState(false));
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
    describe('scrollTo', () => {
        /** Renders the form and returns its ref */
        function renderScrollableForm() {
            const formRef = createRef<FormWrapperRef>();
            renderFormWrapper({inputRefs: {current: {}}, ref: formRef});
            return formRef;
        }

        /** Calls the keyboardDidShow listener that the form added */
        function showKeyboard() {
            const keyboardDidShow = mockedAddListener.mock.calls.find(([eventName]) => eventName === 'keyboardDidShow')?.at(1);
            if (typeof keyboardDidShow !== 'function') {
                throw new Error('The form did not listen for keyboardDidShow');
            }
            act(() => {
                keyboardDidShow({height: 300, duration: 250, timestamp: 0, target: 0, type: 'default', appearance: 'light'});
            });
        }

        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('scrolls as soon as the keyboard opens', () => {
            // Given a form whose input asks for a scroll as it gets focus, before the keyboard opens
            const formRef = renderScrollableForm();
            act(() => formRef.current?.scrollTo(120));
            expect(mockScrollTo).not.toHaveBeenCalled();

            // When the keyboard finishes opening, sooner than the fixed delay
            showKeyboard();

            // Then the form scrolls right away and only once, because a later second scroll is what makes the page jump
            expect(mockScrollTo).toHaveBeenCalledWith({y: 120, animated: true});
            act(() => jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION));
            expect(mockScrollTo).toHaveBeenCalledTimes(1);
        });

        it('scrolls right away when the keyboard is already open', () => {
            // Given a form with the keyboard already open, for example when focus moves from another input
            mockedUseKeyboardState.mockReturnValue(getKeyboardState(true));
            const formRef = renderScrollableForm();

            // When an input asks for a scroll
            act(() => formRef.current?.scrollTo(120));

            // Then the form scrolls without waiting, because the height of the form does not change
            expect(mockScrollTo).toHaveBeenCalledWith({y: 120, animated: true});
        });

        it('scrolls after the fixed delay when no keyboard opens', () => {
            // Given a form where the focused input opens no keyboard, as on web
            const formRef = renderScrollableForm();
            act(() => formRef.current?.scrollTo(120));

            // When the fixed delay ends with no keyboard event
            act(() => jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION));

            // Then the form still scrolls, so that platforms without a keyboard event keep the same behavior
            expect(mockScrollTo).toHaveBeenCalledTimes(1);
            expect(mockScrollTo).toHaveBeenCalledWith({y: 120, animated: true});
        });
    });
});
