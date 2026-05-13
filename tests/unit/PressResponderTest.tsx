import {render} from '@testing-library/react-native';
import React, {useImperativeHandle} from 'react';
import type {ReactNode, Ref} from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent, View as RNViewType} from 'react-native';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import PressResponder from '@components/Pressable/PressResponder/PressResponder';
import usePressResponderProps from '@components/Pressable/PressResponder/usePressResponderProps';
import useResponderRef from '@components/Pressable/PressResponder/useResponderRef';
import Text from '@components/Text';
import Log from '@libs/Log';

const warnSpy = jest.spyOn(Log, 'warn').mockImplementation(() => undefined as ReturnType<typeof Log.warn>);

beforeEach(() => {
    warnSpy.mockClear();
});

afterAll(() => {
    warnSpy.mockRestore();
});

type ProbeProps = {
    consumerOnPress?: PressableProps['onPress'];
    consumerNativeID?: string;
    consumerAccessibilityState?: {expanded?: boolean; disabled?: boolean};
    consumerRef?: PressableProps['ref'];
};

type ProbeHandle = {
    capturedProps: ReturnType<typeof usePressResponderProps>;
    capturedRef: PressableProps['ref'];
};

type ProbeForwardedProps = ProbeProps & {probeRef?: Ref<ProbeHandle>};

function Probe({consumerOnPress, consumerNativeID, consumerAccessibilityState, consumerRef, probeRef}: ProbeForwardedProps) {
    const merged = usePressResponderProps({onPress: consumerOnPress, nativeID: consumerNativeID, accessibilityState: consumerAccessibilityState});
    const mergedRef = useResponderRef(consumerRef);
    useImperativeHandle(probeRef, () => ({capturedProps: merged, capturedRef: mergedRef}), [merged, mergedRef]);
    return (
        <PressableWithFeedback
            ref={mergedRef}
            onPress={merged.onPress ?? (() => {})}
            nativeID={merged.nativeID}
            accessibilityState={merged.accessibilityState}
            accessibilityLabel="probe"
            sentryLabel="probe"
        >
            <Text>probe</Text>
        </PressableWithFeedback>
    );
}

// Must use <View>, not PressableWithFeedback — the latter internally calls useResponderRef and would complete the handshake.
function PropsOnlyProbe() {
    usePressResponderProps({});
    return (
        <View>
            <Text>props-only</Text>
        </View>
    );
}

function Tooltip({children}: {children: ReactNode}) {
    return <View>{children}</View>;
}

function IconButton({children}: {children: ReactNode}) {
    return <View>{children}</View>;
}

describe('PressResponder', () => {
    describe('without a <PressResponder> ancestor', () => {
        it('usePressResponderProps returns the consumer props unchanged', () => {
            const probeRef = React.createRef<ProbeHandle>();
            const consumerHandler = jest.fn();
            render(
                <Probe
                    consumerOnPress={consumerHandler}
                    consumerNativeID="local-id"
                    probeRef={probeRef}
                />,
            );
            expect(probeRef.current?.capturedProps.nativeID).toBe('local-id');
            expect(probeRef.current?.capturedProps.onPress).toBe(consumerHandler);
        });

        it('useResponderRef returns the consumer ref unchanged', () => {
            const probeRef = React.createRef<ProbeHandle>();
            const consumerRef = React.createRef<RNViewType>();
            render(
                <Probe
                    consumerRef={consumerRef as PressableProps['ref']}
                    probeRef={probeRef}
                />,
            );
            expect(probeRef.current?.capturedRef).toBe(consumerRef);
        });

        it('does not emit a Log.warn', () => {
            render(<Probe />);
            expect(warnSpy).not.toHaveBeenCalled();
        });
    });

    describe('with a <PressResponder> ancestor that publishes props', () => {
        it('publishes nativeID and accessibilityControls to the descendant', () => {
            const probeRef = React.createRef<ProbeHandle>();
            render(
                <PressResponder
                    ref={undefined}
                    nativeID="ancestor-id"
                    accessibilityControls="content-id"
                    onPress={() => {}}
                >
                    <Probe probeRef={probeRef} />
                </PressResponder>,
            );
            expect(probeRef.current?.capturedProps.nativeID).toBe('ancestor-id');
            expect(probeRef.current?.capturedProps.accessibilityControls).toBe('content-id');
        });

        it('merges accessibilityState (ancestor wins on conflict, consumer keys are kept otherwise)', () => {
            const probeRef = React.createRef<ProbeHandle>();
            render(
                <PressResponder
                    ref={undefined}
                    accessibilityState={{expanded: true}}
                    onPress={() => {}}
                >
                    <Probe
                        consumerAccessibilityState={{expanded: false, disabled: true}}
                        probeRef={probeRef}
                    />
                </PressResponder>,
            );
            expect(probeRef.current?.capturedProps.accessibilityState).toEqual({expanded: true, disabled: true});
        });

        it('chains consumer onPress before the responder onPress', () => {
            const probeRef = React.createRef<ProbeHandle>();
            const calls: string[] = [];
            const consumerOnPress = () => {
                calls.push('consumer');
            };
            const responderOnPress = () => {
                calls.push('responder');
            };
            render(
                <PressResponder
                    ref={undefined}
                    onPress={responderOnPress}
                >
                    <Probe
                        consumerOnPress={consumerOnPress}
                        probeRef={probeRef}
                    />
                </PressResponder>,
            );
            probeRef.current?.capturedProps.onPress?.({} as GestureResponderEvent);
            expect(calls).toEqual(['consumer', 'responder']);
        });

        it('returns the consumer onPress unchanged when no responder onPress is published', () => {
            const probeRef = React.createRef<ProbeHandle>();
            const consumerOnPress = jest.fn();
            render(
                <PressResponder
                    ref={undefined}
                    nativeID="just-aria"
                >
                    <Probe
                        consumerOnPress={consumerOnPress}
                        probeRef={probeRef}
                    />
                </PressResponder>,
            );
            expect(probeRef.current?.capturedProps.onPress).toBe(consumerOnPress);
        });

        it('flows props through arbitrary wrapper depth (no cloneElement required)', () => {
            const probeRef = React.createRef<ProbeHandle>();
            render(
                <PressResponder
                    ref={undefined}
                    nativeID="deep-ancestor"
                    onPress={() => {}}
                >
                    <IconButton>
                        <Tooltip>
                            <Probe probeRef={probeRef} />
                        </Tooltip>
                    </IconButton>
                </PressResponder>,
            );
            expect(probeRef.current?.capturedProps.nativeID).toBe('deep-ancestor');
        });
    });

    describe('ref handling', () => {
        it('merges the consumer ref with the responder ref', () => {
            const probeRef = React.createRef<ProbeHandle>();
            const responderRef = React.createRef<RNViewType>();
            const consumerRef = React.createRef<RNViewType>();
            render(
                <PressResponder
                    ref={responderRef as PressableProps['ref']}
                    onPress={() => {}}
                >
                    <Probe
                        consumerRef={consumerRef as PressableProps['ref']}
                        probeRef={probeRef}
                    />
                </PressResponder>,
            );
            expect(responderRef.current).toBeTruthy();
            expect(consumerRef.current).toBe(responderRef.current);
        });

        it('returns the consumer ref unchanged when responder has no ref', () => {
            const probeRef = React.createRef<ProbeHandle>();
            const consumerRef = React.createRef<RNViewType>();
            render(
                <PressResponder
                    ref={undefined}
                    nativeID="no-ref"
                    onPress={() => {}}
                >
                    <Probe
                        consumerRef={consumerRef as PressableProps['ref']}
                        probeRef={probeRef}
                    />
                </PressResponder>,
            );
            expect(consumerRef.current).toBeTruthy();
        });
    });

    describe('dev-mode handshake warnings', () => {
        it('warns when handlers are published but no descendant consumed them', () => {
            render(
                <PressResponder
                    ref={undefined}
                    onPress={() => {}}
                >
                    <View>
                        <Text>no-pressable-descendant</Text>
                    </View>
                </PressResponder>,
            );
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('published press handler(s) but no descendant pressable consumed them'));
        });

        it('warns when secondary handler is published but no descendant consumed it', () => {
            render(
                <PressResponder
                    ref={undefined}
                    onSecondaryInteraction={() => {}}
                >
                    <View>
                        <Text>no-secondary-consumer</Text>
                    </View>
                </PressResponder>,
            );
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('published secondary handler(s) but no descendant pressable consumed them'));
        });

        it('warns when ref is published but no descendant called useResponderRef', () => {
            const responderRef = React.createRef<RNViewType>();
            render(
                <PressResponder
                    ref={responderRef as PressableProps['ref']}
                    onPress={() => {}}
                >
                    <PropsOnlyProbe />
                </PressResponder>,
            );
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('published a ref but no descendant called `useResponderRef`'));
        });

        it('does not warn when handshake is complete (props + ref both consumed)', () => {
            const responderRef = React.createRef<RNViewType>();
            render(
                <PressResponder
                    ref={responderRef as PressableProps['ref']}
                    onPress={() => {}}
                >
                    <Probe />
                </PressResponder>,
            );
            expect(warnSpy).not.toHaveBeenCalled();
        });

        it('does not warn when no handlers and no ref are published', () => {
            render(
                <PressResponder
                    ref={undefined}
                    nativeID="aria-only"
                >
                    <Probe />
                </PressResponder>,
            );
            expect(warnSpy).not.toHaveBeenCalled();
        });
    });
});
