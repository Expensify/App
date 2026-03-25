import {NavigationContainer} from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import type {Ref} from 'react';
import React, {act} from 'react';
import type {TextInput, TextInputProps} from 'react-native';
import TimePicker from '@src/components/TimePicker/TimePicker';
import type {TimePickerProps} from '@src/components/TimePicker/TimePicker';

// Store mocked inputs by testID so we can access them in tests
const mockInputs: Record<string, TextInput> = {};

// Tests currently run against index.ios.ts source, where functions that call
// native code (such as `isFocused` or `setNativeProps`) are not implemented.
// We need to implement them manually since tests are not run on actual devices.
jest.mock('react-native/Libraries/Components/TextInput/TextInput', () => {
    const originalReact: typeof React = jest.requireActual('react');

    function TextInputMock(props: TextInputProps & {ref: Ref<TextInput>; testID?: string}) {
        const [isFocused, setIsFocused] = originalReact.useState(false);

        const mockInstance = originalReact.useMemo(
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

        originalReact.useImperativeHandle(props.ref, () => mockInstance, [mockInstance]);

        // Store mock instance by testID for test access
        originalReact.useEffect(() => {
            const {testID} = props;
            if (!testID) {
                return;
            }
            mockInputs[testID] = mockInstance;
            return () => {
                delete mockInputs[testID];
            };
        }, [props.testID, mockInstance]);

        return null;
    }

    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: TextInputMock,
    };
});

describe('TimePicker Component', () => {
    const renderTimePicker = (props: Partial<TimePickerProps> = {}) =>
        render(
            <NavigationContainer>
                <TimePicker
                    onSubmit={() => {}}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                />
            </NavigationContainer>,
        );

    afterEach(() => {
        jest.clearAllMocks();
        // Clear stored mock inputs
        for (const key of Object.keys(mockInputs)) {
            delete mockInputs[key];
        }
    });

    describe('replaces digits with 0 when the backspace button is pressed', () => {
        function pressBackspaceAndExpect(expected: {hours: string; minutes: string; seconds?: string; milliseconds?: string}) {
            const backspaceBtn = screen.getByTestId('button_<');
            fireEvent.press(backspaceBtn);

            expect(mockInputs.hourInput?.props.value).toBe(expected.hours);
            expect(mockInputs.minuteInput?.props.value).toBe(expected.minutes);
            expect(mockInputs.secondInput?.props.value).toBe(expected.seconds);
            expect(mockInputs.millisecondInput?.props.value).toBe(expected.milliseconds);
        }

        it('when showFullFormat=true', () => {
            renderTimePicker({defaultValue: '2025-01-01 12:34:56.789 AM', showFullFormat: true});

            act(() => {
                mockInputs.millisecondInput?.focus();
            });

            const backspaceBtn = screen.getByTestId('button_<');

            // Milliseconds
            pressBackspaceAndExpect({hours: '12', minutes: '34', seconds: '56', milliseconds: '780'});
            pressBackspaceAndExpect({hours: '12', minutes: '34', seconds: '56', milliseconds: '700'});
            pressBackspaceAndExpect({hours: '12', minutes: '34', seconds: '56', milliseconds: '000'});

            fireEvent.press(backspaceBtn); // Skip separator

            // Seconds
            pressBackspaceAndExpect({hours: '12', minutes: '34', seconds: '50', milliseconds: '000'});
            pressBackspaceAndExpect({hours: '12', minutes: '34', seconds: '00', milliseconds: '000'});

            fireEvent.press(backspaceBtn); // Skip separator

            // Minutes
            pressBackspaceAndExpect({hours: '12', minutes: '30', seconds: '00', milliseconds: '000'});
            pressBackspaceAndExpect({hours: '12', minutes: '00', seconds: '00', milliseconds: '000'});

            fireEvent.press(backspaceBtn); // Skip separator

            // Hours
            pressBackspaceAndExpect({hours: '10', minutes: '00', seconds: '00', milliseconds: '000'});
            pressBackspaceAndExpect({hours: '00', minutes: '00', seconds: '00', milliseconds: '000'});
        });

        it('when showFullFormat=false', () => {
            renderTimePicker({defaultValue: '2025-01-01 12:34 AM', showFullFormat: false});

            act(() => {
                mockInputs.minuteInput?.focus();
            });

            const backspaceBtn = screen.getByTestId('button_<');

            // Minutes
            pressBackspaceAndExpect({hours: '12', minutes: '30'});
            pressBackspaceAndExpect({hours: '12', minutes: '00'});

            fireEvent.press(backspaceBtn); // Skip separator

            // Hours
            pressBackspaceAndExpect({hours: '10', minutes: '00'});
            pressBackspaceAndExpect({hours: '00', minutes: '00'});
        });
    });
});
