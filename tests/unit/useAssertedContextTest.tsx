import {render} from '@testing-library/react-native';
import React, {createContext} from 'react';
import type {ReactNode} from 'react';
import {Text} from 'react-native';
import useAssertedContext from '@hooks/useAssertedContext';

type FooValue = {label: string};
const FooContext = createContext<FooValue | null>(null);

function Consumer() {
    const value = useAssertedContext(FooContext, 'useFoo', '<FooProvider>');
    return <Text>{value.label}</Text>;
}

// Silence the React error-boundary console.error noise from intentional throws.
const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
afterAll(() => {
    errorSpy.mockRestore();
});
beforeEach(() => {
    errorSpy.mockClear();
});

describe('useAssertedContext', () => {
    it('returns the context value when the provider is present', () => {
        const {getByText} = render(
            <FooContext.Provider value={{label: 'hello'}}>
                <Consumer />
            </FooContext.Provider>,
        );
        expect(getByText('hello')).toBeTruthy();
    });

    it('throws with a formatted message when the context is null (provider missing)', () => {
        expect(() => render(<Consumer />)).toThrow('useFoo() must be called inside <FooProvider>.');
    });

    it('uses the supplied hookName and parentDisplayName in the error message', () => {
        function CustomConsumer() {
            useAssertedContext(FooContext, 'useBar', '<BarRoot>');
            return null;
        }
        expect(() => render(<CustomConsumer />)).toThrow('useBar() must be called inside <BarRoot>.');
    });

    it('returns the value verbatim including object identity', () => {
        const value: FooValue = {label: 'identity-check'};
        let captured: FooValue | undefined;
        function CaptureConsumer() {
            captured = useAssertedContext(FooContext, 'useFoo', '<FooProvider>');
            return null;
        }
        render(
            <FooContext.Provider value={value}>
                <CaptureConsumer />
            </FooContext.Provider>,
        );
        expect(captured).toBe(value);
    });

    it('does NOT throw when the value is a falsy-but-non-null primitive (e.g. 0, "")', () => {
        const ZeroContext = createContext<number | null>(null);
        let captured: number | undefined;
        function ZeroConsumer({children}: {children?: ReactNode}) {
            captured = useAssertedContext(ZeroContext, 'useZero', '<ZeroProvider>');
            return <>{children}</>;
        }
        render(
            <ZeroContext.Provider value={0}>
                <ZeroConsumer />
            </ZeroContext.Provider>,
        );
        expect(captured).toBe(0);
    });
});
