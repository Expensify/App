import {render, screen} from '@testing-library/react-native';
import React, {createContext, useImperativeHandle} from 'react';
import type {Ref} from 'react';
import Text from '@components/Text';
import useAssertedContext from '@hooks/useAssertedContext';

type FooValue = {label: string};
const FooContext = createContext<FooValue | null>(null);

function Consumer() {
    const value = useAssertedContext(FooContext, 'useFoo', '<FooProvider>');
    return <Text>{value.label}</Text>;
}

type CaptureHandle<T> = {value: T};

function CaptureConsumer<T>({
    contextRef,
    hookName,
    parentDisplayName,
    captureRef,
}: {
    contextRef: React.Context<T | null>;
    hookName: string;
    parentDisplayName: string;
    captureRef: Ref<CaptureHandle<T>>;
}) {
    const value = useAssertedContext(contextRef, hookName, parentDisplayName);
    useImperativeHandle(captureRef, () => ({value}), [value]);
    return null;
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
        render(
            <FooContext.Provider value={{label: 'hello'}}>
                <Consumer />
            </FooContext.Provider>,
        );
        expect(screen.getByText('hello')).toBeTruthy();
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
        const captureRef = React.createRef<CaptureHandle<FooValue>>();
        render(
            <FooContext.Provider value={value}>
                <CaptureConsumer<FooValue>
                    contextRef={FooContext}
                    hookName="useFoo"
                    parentDisplayName="<FooProvider>"
                    captureRef={captureRef}
                />
            </FooContext.Provider>,
        );
        expect(captureRef.current?.value).toBe(value);
    });

    it('does NOT throw when the value is a falsy-but-non-null primitive (e.g. 0, "")', () => {
        const ZeroContext = createContext<number | null>(null);
        const captureRef = React.createRef<CaptureHandle<number>>();
        render(
            <ZeroContext.Provider value={0}>
                <CaptureConsumer<number>
                    contextRef={ZeroContext}
                    hookName="useZero"
                    parentDisplayName="<ZeroProvider>"
                    captureRef={captureRef}
                />
            </ZeroContext.Provider>,
        );
        expect(captureRef.current?.value).toBe(0);
    });
});
