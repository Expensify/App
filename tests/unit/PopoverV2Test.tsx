import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React, {use, useEffect, useRef} from 'react';
import type {ReactNode} from 'react';
import type {View as RNViewType} from 'react-native';
import {View} from 'react-native';
import PopoverContent from '@components/Popover/v2/content/Content';
import {PopoverContentStateContext, Description as PopoverDescription, Title as PopoverTitle} from '@components/Popover/v2/content/Headings';
import type {PopoverContentState} from '@components/Popover/v2/content/Headings';
import * as Popover from '@components/Popover/v2/root';
import Text from '@components/Text';

jest.mock('@components/Overlay/Portal', () => {
    function MockPortal({children}: {children?: ReactNode}) {
        return children;
    }
    return MockPortal;
});

jest.mock('@components/Overlay/Presence', () => {
    const PRESENCE_VALUE = {
        state: {present: true, state: 'mounted'},
        actions: {onAnimationEnd: () => {}},
    } as const;
    function MockPresence({present, children}: {present: boolean; children?: ReactNode}) {
        return present ? children : null;
    }
    return {
        __esModule: true,
        default: MockPresence,
        usePresence: () => PRESENCE_VALUE,
    };
});

jest.mock('@components/FocusTrap/FocusTrapForModal', () => {
    function MockFocusTrap({children}: {children?: ReactNode}) {
        return children;
    }
    return MockFocusTrap;
});

jest.mock('@components/Overlay/DismissableLayer', () => {
    function MockDismissableLayer({children}: {children?: ReactNode}) {
        return children;
    }
    function MockModalLayer({children}: {children?: ReactNode}) {
        return children;
    }
    function MockFloatingLayer({children}: {children?: ReactNode}) {
        return children;
    }
    MockDismissableLayer.Modal = MockModalLayer;
    MockDismissableLayer.Floating = MockFloatingLayer;
    return MockDismissableLayer;
});

jest.mock('@components/Overlay/AnimatedSurface', () => {
    function MockAnimatedSurface({children}: {children?: ReactNode}) {
        return children;
    }
    return {__esModule: true, default: MockAnimatedSurface, FADE_ONLY_ENTER_SPEC: {}, FADE_ONLY_EXIT_SPEC: {}};
});

jest.mock('@components/Overlay/hooks/useOverlayEntry', () => () => {});

jest.mock('@components/Overlay/hooks/useAnchoredPosition', () => () => ({
    style: {},
    available: {width: 1024, height: 768},
    isPositioned: true,
    onContentLayout: () => {},
}));

jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: false, shouldUseNarrowLayout: false}));
jest.mock('@hooks/useThemeStyles', () => () => ({flex1: {flex: 1}, pv0: {paddingVertical: 0}}));
jest.mock('@hooks/useTheme', () => () => ({overlay: '#000', componentBG: '#fff'}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

function stubMeasureInWindow(): () => void {
    const proto: unknown = Reflect.get(View, 'prototype');
    if (typeof proto !== 'object' || proto === null) {
        throw new Error('View has no mutable prototype');
    }
    const original: unknown = Reflect.get(proto, 'measureInWindow');
    Reflect.set(proto, 'measureInWindow', (callback: (x: number, y: number, width: number, height: number) => void) => callback(10, 20, 100, 32));
    return () => {
        if (original === undefined) {
            Reflect.deleteProperty(proto, 'measureInWindow');
        } else {
            Reflect.set(proto, 'measureInWindow', original);
        }
    };
}

let restoreMeasure: (() => void) | null = null;
beforeEach(() => {
    restoreMeasure = stubMeasureInWindow();
});
afterEach(() => {
    restoreMeasure?.();
    restoreMeasure = null;
});

async function flushMicrotasks(): Promise<void> {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

describe('Popover V2', () => {
    describe('Root', () => {
        it('is closed by default', () => {
            render(
                <Popover.Root>
                    <PopoverContent>
                        <Text>Body</Text>
                    </PopoverContent>
                </Popover.Root>,
            );
            expect(screen.queryByText('Body')).toBeNull();
        });

        it('opens with defaultOpen', () => {
            render(
                <Popover.Root defaultOpen>
                    <PopoverContent>
                        <Text>Body</Text>
                    </PopoverContent>
                </Popover.Root>,
            );
            expect(screen.getByText('Body')).toBeDefined();
        });

        it('Trigger opens the popover', async () => {
            render(
                <Popover.Root>
                    <Popover.Trigger
                        accessibilityLabel="Open"
                        sentryLabel="PopoverV2Test.Trigger"
                    >
                        <Text>Open Me</Text>
                    </Popover.Trigger>
                    <PopoverContent>
                        <Text>Body</Text>
                    </PopoverContent>
                </Popover.Root>,
            );
            expect(screen.queryByText('Body')).toBeNull();
            fireEvent.press(screen.getByLabelText('Open'));
            await flushMicrotasks();
            expect(screen.getByText('Body')).toBeDefined();
        });

        it('Close closes the popover', () => {
            render(
                <Popover.Root defaultOpen>
                    <PopoverContent>
                        <Popover.Close
                            accessibilityLabel="Dismiss"
                            sentryLabel="PopoverV2Test.Close"
                        >
                            <Text>X</Text>
                        </Popover.Close>
                        <Text>Body</Text>
                    </PopoverContent>
                </Popover.Root>,
            );
            expect(screen.getByText('Body')).toBeDefined();
            fireEvent.press(screen.getByLabelText('Dismiss'));
            expect(screen.queryByText('Body')).toBeNull();
        });

        it('Trigger fires onOpenChange but does not flip the controlled value', async () => {
            const onOpenChange = jest.fn();
            render(
                <Popover.Root
                    isOpen={false}
                    onOpenChange={onOpenChange}
                >
                    <Popover.Trigger
                        accessibilityLabel="Open"
                        sentryLabel="PopoverV2Test.ControlledTrigger"
                    >
                        <Text>Open</Text>
                    </Popover.Trigger>
                    <PopoverContent>
                        <Text>Body</Text>
                    </PopoverContent>
                </Popover.Root>,
            );
            fireEvent.press(screen.getByLabelText('Open'));
            await flushMicrotasks();
            expect(onOpenChange).toHaveBeenCalledWith(true);
            expect(screen.queryByText('Body')).toBeNull();
        });
    });

    describe('Anchor', () => {
        it('publishes the rendered node as the popover anchor', () => {
            const captured: unknown[] = [];
            function AnchorProbe() {
                const {
                    state: {anchor},
                } = Popover.usePopover('AnchorProbe');
                useEffect(() => {
                    captured.push(anchor);
                });
                return null;
            }
            function Harness() {
                const ref = useRef<RNViewType>(null);
                return (
                    <Popover.Root>
                        <Popover.Anchor anchorRef={ref}>
                            <View ref={ref}>
                                <Text>Anchor target</Text>
                            </View>
                        </Popover.Anchor>
                        <AnchorProbe />
                    </Popover.Root>
                );
            }
            render(<Harness />);
            expect(captured.at(-1)).not.toBeNull();
        });

        it('preserves the published anchor across Trigger presses', async () => {
            const captured: unknown[] = [];
            function AnchorProbe() {
                const {
                    state: {anchor},
                } = Popover.usePopover('AnchorProbe');
                useEffect(() => {
                    captured.push(anchor);
                });
                return null;
            }
            function Harness() {
                const anchorTargetRef = useRef<RNViewType>(null);
                return (
                    <Popover.Root>
                        <Popover.Anchor anchorRef={anchorTargetRef}>
                            <View ref={anchorTargetRef}>
                                <Text>Anchor target</Text>
                            </View>
                        </Popover.Anchor>
                        <Popover.Trigger
                            accessibilityLabel="Open"
                            sentryLabel="PopoverV2Test.DecoupledTrigger"
                        >
                            <Text>Open from Trigger</Text>
                        </Popover.Trigger>
                        <AnchorProbe />
                    </Popover.Root>
                );
            }
            render(<Harness />);
            const publishedByAnchor = captured.at(-1);
            expect(publishedByAnchor).not.toBeNull();

            fireEvent.press(screen.getByLabelText('Open'));
            await flushMicrotasks();

            const publishedAfterTriggerPress = captured.at(-1);
            expect(publishedAfterTriggerPress).toBe(publishedByAnchor);
        });

        it('nulls the published anchor on unmount', () => {
            const captured: unknown[] = [];
            function AnchorProbe() {
                const {
                    state: {anchor},
                } = Popover.usePopover('AnchorProbe');
                useEffect(() => {
                    captured.push(anchor);
                });
                return null;
            }
            function Harness({mountAnchor}: {mountAnchor: boolean}) {
                const ref = useRef<RNViewType>(null);
                return (
                    <Popover.Root>
                        {mountAnchor ? (
                            <Popover.Anchor anchorRef={ref}>
                                <View ref={ref} />
                            </Popover.Anchor>
                        ) : null}
                        <AnchorProbe />
                    </Popover.Root>
                );
            }
            const tree = render(<Harness mountAnchor />);
            expect(captured.at(-1)).not.toBeNull();
            tree.rerender(<Harness mountAnchor={false} />);
            expect(captured.at(-1)).toBeNull();
        });
    });

    describe('Heading', () => {
        it('Title and Description nativeIDs match the published heading state', () => {
            const headingRef: {current: PopoverContentState | null} = {current: null};
            function HeadingStateProbe() {
                headingRef.current = use(PopoverContentStateContext);
                return null;
            }
            render(
                <Popover.Root defaultOpen>
                    <PopoverContent>
                        <HeadingStateProbe />
                        <PopoverTitle>My title</PopoverTitle>
                        <PopoverDescription>My description</PopoverDescription>
                    </PopoverContent>
                </Popover.Root>,
            );
            const titleEl = screen.getByText('My title');
            const descEl = screen.getByText('My description');
            const state = headingRef.current;
            expect(state).not.toBeNull();
            expect(titleEl.props.nativeID).toBe(state?.titleId);
            expect(descEl.props.nativeID).toBe(state?.descriptionId);
            expect(typeof state?.contentId).toBe('string');
            expect((state?.contentId ?? '').length).toBeGreaterThan(0);
        });

        it('Title throws outside Content', () => {
            const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
            expect(() =>
                render(
                    <Popover.Root>
                        <PopoverTitle>Orphan</PopoverTitle>
                    </Popover.Root>,
                ),
            ).toThrow(/Popover\.Title.*Popover\.Content/);
            spy.mockRestore();
        });
    });

    describe('a11y — Trigger', () => {
        it('Trigger advertises haspopup, expanded, and controls the Content via shared IDs', async () => {
            render(
                <Popover.Root defaultOpen>
                    <Popover.Trigger
                        accessibilityLabel="Open"
                        sentryLabel="PopoverV2Test.A11y.Trigger"
                    >
                        <Text>Open</Text>
                    </Popover.Trigger>
                    <PopoverContent>
                        <Text>Body</Text>
                    </PopoverContent>
                </Popover.Root>,
            );
            await flushMicrotasks();
            const trigger = screen.getByLabelText('Open');
            expect(trigger.props.accessibilityHasPopup).toBe('dialog');
            expect(trigger.props.accessibilityState).toEqual(expect.objectContaining({expanded: true}));
            expect(typeof trigger.props.accessibilityControls).toBe('string');
            expect(typeof trigger.props.nativeID).toBe('string');
        });

        it('Trigger keeps accessibilityControls populated when closed (always-on per WAI-ARIA APG)', () => {
            render(
                <Popover.Root>
                    <Popover.Trigger
                        accessibilityLabel="Open"
                        sentryLabel="PopoverV2Test.A11y.ClosedTrigger"
                    >
                        <Text>Open</Text>
                    </Popover.Trigger>
                    <PopoverContent>
                        <Text>Body</Text>
                    </PopoverContent>
                </Popover.Root>,
            );
            const trigger = screen.getByLabelText('Open');
            expect(trigger.props.accessibilityState).toEqual(expect.objectContaining({expanded: false}));
            expect(typeof trigger.props.accessibilityControls).toBe('string');
        });

        it("Trigger derives accessibilityHasPopup='menu' when Content publishes role='menu' (WAI-ARIA 1.2 §6.6.5)", async () => {
            render(
                <Popover.Root defaultOpen>
                    <Popover.Trigger
                        accessibilityLabel="Open"
                        sentryLabel="PopoverV2Test.A11y.MenuTrigger"
                    >
                        <Text>Open</Text>
                    </Popover.Trigger>
                    <PopoverContent role="menu">
                        <Text>Body</Text>
                    </PopoverContent>
                </Popover.Root>,
            );
            await flushMicrotasks();
            const trigger = screen.getByLabelText('Open');
            expect(trigger.props.accessibilityHasPopup).toBe('menu');
        });

        it("Trigger falls back to accessibilityHasPopup='dialog' for non-menu content roles (region/tooltip/dialog)", async () => {
            render(
                <Popover.Root defaultOpen>
                    <Popover.Trigger
                        accessibilityLabel="Open"
                        sentryLabel="PopoverV2Test.A11y.RegionTrigger"
                    >
                        <Text>Open</Text>
                    </Popover.Trigger>
                    <PopoverContent role="region">
                        <Text>Body</Text>
                    </PopoverContent>
                </Popover.Root>,
            );
            await flushMicrotasks();
            const trigger = screen.getByLabelText('Open');
            expect(trigger.props.accessibilityHasPopup).toBe('dialog');
        });
    });

    describe('Anchor measurement freshness', () => {
        it('clears anchorRect when isOpen flips false → true (render-phase measurementSession reset)', async () => {
            const anchorRectSamples: Array<{isOpen: boolean; hasRect: boolean}> = [];
            function StateProbe() {
                const {state} = Popover.usePopover('StateProbe');
                useEffect(() => {
                    anchorRectSamples.push({isOpen: state.isOpen, hasRect: state.anchorRect !== null});
                });
                return null;
            }
            const onOpenChange = jest.fn();
            const tree = render(
                <Popover.Root
                    isOpen={false}
                    onOpenChange={onOpenChange}
                >
                    <StateProbe />
                    <Popover.Trigger
                        accessibilityLabel="Open"
                        sentryLabel="PopoverV2Test.MeasurementSession.Trigger"
                    >
                        <Text>Open</Text>
                    </Popover.Trigger>
                    <PopoverContent>
                        <Text>Body</Text>
                    </PopoverContent>
                </Popover.Root>,
            );
            tree.rerender(
                <Popover.Root
                    isOpen
                    onOpenChange={onOpenChange}
                >
                    <StateProbe />
                    <Popover.Trigger
                        accessibilityLabel="Open"
                        sentryLabel="PopoverV2Test.MeasurementSession.Trigger"
                    >
                        <Text>Open</Text>
                    </Popover.Trigger>
                    <PopoverContent>
                        <Text>Body</Text>
                    </PopoverContent>
                </Popover.Root>,
            );
            await flushMicrotasks();
            // Immediately after the open-transition, the anchorRect was cleared to null (before measureAnchor resolves)
            // so a stale rect from a previous session can never flash through.
            const openTick = anchorRectSamples.find((s) => s.isOpen === true);
            expect(openTick).toBeDefined();
            // After the async measureAnchor resolves, anchorRect repopulates — we accept either state on the latest sample.
            expect(anchorRectSamples.some((s) => s.isOpen === true && s.hasRect === false)).toBe(true);
        });
    });

    describe('Compound invariants', () => {
        it('Trigger outside Root throws', () => {
            const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
            expect(() =>
                render(
                    <Popover.Trigger
                        accessibilityLabel="Open"
                        sentryLabel="PopoverV2Test.OrphanTrigger"
                    >
                        <Text>Orphan</Text>
                    </Popover.Trigger>,
                ),
            ).toThrow();
            spy.mockRestore();
        });

        it('Close outside Root throws', () => {
            const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
            expect(() =>
                render(
                    <Popover.Close
                        accessibilityLabel="Close"
                        sentryLabel="PopoverV2Test.OrphanClose"
                    >
                        <Text>X</Text>
                    </Popover.Close>,
                ),
            ).toThrow(/Popover\.Close.*Popover\.Root/);
            spy.mockRestore();
        });

        it('usePopover throws outside Root', () => {
            const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
            function Orphan() {
                Popover.usePopover('Orphan');
                return null;
            }
            expect(() => render(<Orphan />)).toThrow(/Orphan.*Popover\.Root/);
            spy.mockRestore();
        });
    });
});
