import {NavigationContainer} from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import type {Ref} from 'react';
import React, {act, createRef} from 'react';
import type {TextInput, TextInputProps} from 'react-native';
import TimePicker from '@src/components/TimePicker/TimePicker';
import type {TimePickerProps, TimePickerRef} from '@src/components/TimePicker/TimePicker';

// Tests currently run against index.ios.ts source, where functions that call
// native code (such as `isFocused` or `setNativeProps`) are not implemented.
// We need to implement them manually since tests are not run on actual devices.
jest.mock('react-native/Libraries/Components/TextInput/TextInput', () => {
    const originalReact: typeof React = jest.requireActual('react');

    function TextInputMock(props: TextInputProps & {ref: Ref<TextInput>}) {
        const [isFocused, setIsFocused] = originalReact.useState(false);

        originalReact.useImperativeHandle(
            props.ref,
            () =>
                ({
                    focus: () => {
                        setIsFocused(true);
                    },
                    blur: () => {
                        setIsFocused(false);
                    },
                    isFocused: () => isFocused,
                    setNativeProps: () => {},
                    props,
                }) as unknown as TextInput,
            [isFocused, props],
        );

        return null;
    }

    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: TextInputMock,
    };
});

describe('TimePicker Component', () => {
    const renderTimePicker = (props: Partial<TimePickerProps> = {}, ref?: React.Ref<TimePickerRef>) =>
        render(
            <NavigationContainer>
                <TimePicker
                    ref={ref}
                    onSubmit={() => {}}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                />
            </NavigationContainer>,
        );

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('replaces digits with 0 when the backspace button is pressed', () => {
        function pressBackspaceAndExpect(
            ref: React.RefObject<TimePickerRef | null>,
            expected: {
                hours: string;
                minutes: string;
                seconds?: string;
                milliseconds?: string;
            },
        ) {
            const backspaceBtn = screen.getByTestId('button_<');
            fireEvent.press(backspaceBtn);

            expect(ref.current?.hourRef?.props.value).toBe(expected.hours);
            expect(ref.current?.minuteRef?.props.value).toBe(expected.minutes);
            expect(ref.current?.secondRef?.props.value).toBe(expected.seconds);
            expect(ref.current?.millisecondRef?.props.value).toBe(expected.milliseconds);
        }

        it('when showFullFormat=true', () => {
            const ref = createRef<TimePickerRef>();
            renderTimePicker({defaultValue: '2025-01-01 12:34:56.789 AM', showFullFormat: true}, ref);

            act(() => {
                ref.current?.millisecondRef?.focus();
            });

            const backspaceBtn = screen.getByTestId('button_<');

            // Milliseconds
            pressBackspaceAndExpect(ref, {hours: '12', minutes: '34', seconds: '56', milliseconds: '780'});
            pressBackspaceAndExpect(ref, {hours: '12', minutes: '34', seconds: '56', milliseconds: '700'});
            pressBackspaceAndExpect(ref, {hours: '12', minutes: '34', seconds: '56', milliseconds: '000'});

            fireEvent.press(backspaceBtn); // Skip separator

            // Seconds
            pressBackspaceAndExpect(ref, {hours: '12', minutes: '34', seconds: '50', milliseconds: '000'});
            pressBackspaceAndExpect(ref, {hours: '12', minutes: '34', seconds: '00', milliseconds: '000'});

            fireEvent.press(backspaceBtn); // Skip separator

            // Minutes
            pressBackspaceAndExpect(ref, {hours: '12', minutes: '30', seconds: '00', milliseconds: '000'});
            pressBackspaceAndExpect(ref, {hours: '12', minutes: '00', seconds: '00', milliseconds: '000'});

            fireEvent.press(backspaceBtn); // Skip separator

            // Hours
            pressBackspaceAndExpect(ref, {hours: '10', minutes: '00', seconds: '00', milliseconds: '000'});
            pressBackspaceAndExpect(ref, {hours: '00', minutes: '00', seconds: '00', milliseconds: '000'});
        });

        it('when showFullFormat=false', () => {
            const ref = createRef<TimePickerRef>();
            renderTimePicker({defaultValue: '2025-01-01 12:34 AM', showFullFormat: false}, ref);

            act(() => {
                ref.current?.minuteRef?.focus();
            });

            const backspaceBtn = screen.getByTestId('button_<');

            // Minutes
            pressBackspaceAndExpect(ref, {hours: '12', minutes: '30'});
            pressBackspaceAndExpect(ref, {hours: '12', minutes: '00'});

            fireEvent.press(backspaceBtn); // Skip separator

            // Hours
            pressBackspaceAndExpect(ref, {hours: '10', minutes: '00'});
            pressBackspaceAndExpect(ref, {hours: '00', minutes: '00'});
        });
    });
});
