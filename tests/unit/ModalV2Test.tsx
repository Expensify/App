import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React, {useEffect} from 'react';
import type {ReactNode} from 'react';
import {useActiveModalKind, useModal} from '@components/Modal/v2/compound/state';
import {AlertDialog, BottomDockedModal, CenteredModal, FullscreenModal} from '@components/Modal/v2/variants';
import Text from '@components/Text';
import useDisclosureState from '@hooks/useDisclosureState';
import CONST from '@src/CONST';

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

type SheetProps = {onRequestClose?: () => void; onDismiss?: () => void; testID?: string; children?: ReactNode};
const sheetPropsCapture: {current: SheetProps[]} = {current: []};
jest.mock('@components/Modal/v2/compound/Sheet', () => {
    function MockSheet({onRequestClose, onDismiss, testID, children}: SheetProps) {
        sheetPropsCapture.current.push({onRequestClose, onDismiss, testID, children});
        return children ?? null;
    }
    return MockSheet;
});

type BackdropProps = {onPress?: () => void; animationInTiming: number; animationOutTiming: number};
const backdropPropsCapture: {current: BackdropProps[]} = {current: []};
jest.mock('@components/Modal/v2/compound/Backdrop', () => {
    function MockBackdrop({onPress, animationInTiming, animationOutTiming}: BackdropProps) {
        backdropPropsCapture.current.push({onPress, animationInTiming, animationOutTiming});
        return null;
    }
    return MockBackdrop;
});

type SurfaceProps = {
    onExitComplete?: () => void;
    role?: 'dialog' | 'alertdialog';
    labelledBy?: string;
    describedBy?: string;
    nativeID?: string;
    animationIn?: string;
    animationOut?: string;
    animationInTiming?: number;
    animationOutTiming?: number;
    onSwipeDismiss?: () => void;
    children?: ReactNode;
};
const surfacePropsCapture: {current: SurfaceProps[]} = {current: []};
jest.mock('@components/Modal/v2/compound/Surface', () => {
    function MockSurface({
        onExitComplete,
        role,
        labelledBy,
        describedBy,
        nativeID,
        animationIn,
        animationOut,
        animationInTiming,
        animationOutTiming,
        onSwipeDismiss,
        children,
    }: SurfaceProps) {
        surfacePropsCapture.current.push({
            onExitComplete,
            role,
            labelledBy,
            describedBy,
            nativeID,
            animationIn,
            animationOut,
            animationInTiming,
            animationOutTiming,
            onSwipeDismiss,
            children,
        });
        return children ?? null;
    }
    return MockSurface;
});

type DismissableLayerProps = {onDismiss?: () => void; escapeBehavior?: string; children?: ReactNode};
const dismissableLayerPropsCapture: {current: DismissableLayerProps[]} = {current: []};
jest.mock('@components/Overlay/DismissableLayer', () => {
    function MockDismissableLayer({children}: {children?: ReactNode}) {
        return children;
    }
    function MockModalLayer({onDismiss, escapeBehavior, children}: DismissableLayerProps) {
        dismissableLayerPropsCapture.current.push({onDismiss, escapeBehavior, children});
        return children ?? null;
    }
    function MockFloatingLayer({children}: {children?: ReactNode}) {
        return children;
    }
    MockDismissableLayer.Modal = MockModalLayer;
    MockDismissableLayer.Floating = MockFloatingLayer;
    return MockDismissableLayer;
});

jest.mock('@components/FocusTrap/FocusTrapForModal', () => {
    function MockFocusTrap({children}: {children?: ReactNode}) {
        return children;
    }
    return MockFocusTrap;
});

jest.mock('@components/ColorSchemeWrapper', () => {
    function MockColorSchemeWrapper({children}: {children?: ReactNode}) {
        return children;
    }
    return MockColorSchemeWrapper;
});

jest.mock('@components/Overlay/hooks/useOverlayEntry', () => () => {});

jest.mock('@hooks/useThemeStyles', () => () => ({
    flex1: {flex: 1},
    defaultModalContainer: {},
    bottomDockedModalDismissButton: {},
    pv0: {paddingVertical: 0},
}));
jest.mock('@hooks/useTheme', () => () => ({overlay: '#000', componentBG: '#fff'}));

jest.mock('@hooks/useStyleUtils', () => () => ({
    getModalStyles: jest.fn(() => ({
        modalStyle: {},
        modalContainerStyle: {},
        shouldAddBottomSafeAreaMargin: false,
        shouldAddTopSafeAreaMargin: false,
        shouldAddBottomSafeAreaPadding: false,
        shouldAddTopSafeAreaPadding: false,
    })),
    getModalPaddingStyles: jest.fn(() => ({})),
    parseStyleFromFunction: (s: unknown, state: unknown) => {
        const isStyleFn = (v: unknown): v is (state: unknown) => unknown => typeof v === 'function';
        return isStyleFn(s) ? s(state) : s;
    },
    parseStyleAsArray: (s: unknown): unknown[] => (Array.isArray(s) ? (s as unknown[]) : [s]),
    getButtonStyleWithIcon: () => ({}),
    getCheckboxPressableStyle: () => ({}),
}));

const responsiveLayoutValue = {isSmallScreenWidth: false, shouldUseNarrowLayout: false};
jest.mock('@hooks/useResponsiveLayout', () => () => responsiveLayoutValue);
jest.mock('@hooks/useSafeAreaInsets', () => () => ({top: 0, bottom: 0, left: 0, right: 0}));
jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: 1024, windowHeight: 768}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

beforeEach(() => {
    sheetPropsCapture.current = [];
    backdropPropsCapture.current = [];
    surfacePropsCapture.current = [];
    dismissableLayerPropsCapture.current = [];
    responsiveLayoutValue.isSmallScreenWidth = false;
    responsiveLayoutValue.shouldUseNarrowLayout = false;
});

function lastSheet(): SheetProps | undefined {
    return sheetPropsCapture.current.at(-1);
}
function lastSurface(): SurfaceProps | undefined {
    return surfacePropsCapture.current.at(-1);
}
function lastDismissableLayer(): DismissableLayerProps | undefined {
    return dismissableLayerPropsCapture.current.at(-1);
}

describe('Modal V2', () => {
    describe('Uncontrolled root', () => {
        it('is closed by default', () => {
            render(
                <CenteredModal.Root>
                    <CenteredModal.Content>
                        <Text>Hidden</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            expect(sheetPropsCapture.current).toHaveLength(0);
        });

        it('opens with defaultOpen', () => {
            render(
                <CenteredModal.Root defaultOpen>
                    <CenteredModal.Content>
                        <Text>Visible</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            expect(sheetPropsCapture.current.length).toBeGreaterThan(0);
            expect(surfacePropsCapture.current.length).toBeGreaterThan(0);
        });

        it('Trigger opens the modal', () => {
            render(
                <CenteredModal.Root>
                    <CenteredModal.Trigger
                        accessibilityLabel="Open"
                        sentryLabel="ModalV2Test.Trigger"
                    >
                        <Text>Open Me</Text>
                    </CenteredModal.Trigger>
                    <CenteredModal.Content>
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            expect(sheetPropsCapture.current).toHaveLength(0);
            fireEvent.press(screen.getByLabelText('Open'));
            expect(sheetPropsCapture.current.length).toBeGreaterThan(0);
        });

        it('Close closes the modal', () => {
            render(
                <CenteredModal.Root defaultOpen>
                    <CenteredModal.Content>
                        <CenteredModal.Close
                            accessibilityLabel="Dismiss"
                            sentryLabel="ModalV2Test.Close"
                        >
                            <Text>X</Text>
                        </CenteredModal.Close>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            const before = sheetPropsCapture.current.length;
            expect(before).toBeGreaterThan(0);
            fireEvent.press(screen.getByLabelText('Dismiss'));
            expect(sheetPropsCapture.current.length).toBe(before);
        });
    });

    describe('Controlled root', () => {
        it('Trigger fires onOpenChange but does not flip the controlled value', () => {
            const onOpenChange = jest.fn();
            render(
                <CenteredModal.Root
                    isOpen={false}
                    onOpenChange={onOpenChange}
                >
                    <CenteredModal.Trigger
                        accessibilityLabel="Open"
                        sentryLabel="ModalV2Test.Trigger"
                    >
                        <Text>Open Me</Text>
                    </CenteredModal.Trigger>
                    <CenteredModal.Content>
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            expect(sheetPropsCapture.current).toHaveLength(0);
            fireEvent.press(screen.getByLabelText('Open'));
            expect(onOpenChange).toHaveBeenCalledWith(true);
            expect(sheetPropsCapture.current).toHaveLength(0);
        });

        it('isOpen prop drives mount and unmount', () => {
            function ControlledHarness({open}: {open: boolean}) {
                return (
                    <CenteredModal.Root
                        isOpen={open}
                        onOpenChange={() => {}}
                    >
                        <CenteredModal.Content>
                            <Text>Body</Text>
                        </CenteredModal.Content>
                    </CenteredModal.Root>
                );
            }
            const tree = render(<ControlledHarness open={false} />);
            expect(sheetPropsCapture.current).toHaveLength(0);
            tree.rerender(<ControlledHarness open />);
            expect(sheetPropsCapture.current.length).toBeGreaterThan(0);
            const renderedCount = sheetPropsCapture.current.length;
            tree.rerender(<ControlledHarness open={false} />);
            expect(sheetPropsCapture.current.length).toBe(renderedCount);
        });
    });

    describe('Escape behavior', () => {
        it("defaults to 'dismiss'", () => {
            render(
                <CenteredModal.Root defaultOpen>
                    <CenteredModal.Content>
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            expect(lastDismissableLayer()?.escapeBehavior).toBe('dismiss');
        });

        it("'ignore' disables Android hardware-back", () => {
            render(
                <CenteredModal.Root defaultOpen>
                    <CenteredModal.Content escapeBehavior="ignore">
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            expect(lastSheet()?.onRequestClose).toBeUndefined();
            expect(lastDismissableLayer()?.escapeBehavior).toBe('ignore');
        });

        it("'dismiss' wires Android hardware-back to close", () => {
            const onOpenChange = jest.fn();
            render(
                <CenteredModal.Root
                    defaultOpen
                    onOpenChange={onOpenChange}
                >
                    <CenteredModal.Content>
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            const onRequestClose = lastSheet()?.onRequestClose;
            expect(onRequestClose).toBeDefined();
            act(() => onRequestClose?.());
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });
    });

    describe('Backdrop', () => {
        it('tap closes the modal by default', () => {
            const onOpenChange = jest.fn();
            render(
                <CenteredModal.Root
                    defaultOpen
                    onOpenChange={onOpenChange}
                >
                    <CenteredModal.Content>
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            const onPress = backdropPropsCapture.current.at(-1)?.onPress;
            expect(onPress).toBeDefined();
            act(() => onPress?.());
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('onBackdropPress override suppresses the auto-close', () => {
            const onBackdropPress = jest.fn();
            const onOpenChange = jest.fn();
            render(
                <CenteredModal.Root
                    defaultOpen
                    onOpenChange={onOpenChange}
                >
                    <CenteredModal.Content onBackdropPress={onBackdropPress}>
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            act(() => backdropPropsCapture.current.at(-1)?.onPress?.());
            expect(onBackdropPress).toHaveBeenCalled();
            expect(onOpenChange).not.toHaveBeenCalled();
        });

        it('swipe dismissal routes through the onBackdropPress override', () => {
            const onBackdropPress = jest.fn();
            const onOpenChange = jest.fn();
            render(
                <CenteredModal.Root
                    defaultOpen
                    onOpenChange={onOpenChange}
                >
                    <CenteredModal.Content onBackdropPress={onBackdropPress}>
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            const onSwipeDismiss = lastSurface()?.onSwipeDismiss;
            expect(onSwipeDismiss).toBeDefined();
            act(() => onSwipeDismiss?.());
            expect(onBackdropPress).toHaveBeenCalled();
            expect(onOpenChange).not.toHaveBeenCalled();
        });

        it('swipe dismissal closes when no onBackdropPress override is provided', () => {
            const onOpenChange = jest.fn();
            render(
                <CenteredModal.Root
                    defaultOpen
                    onOpenChange={onOpenChange}
                >
                    <CenteredModal.Content>
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            const onSwipeDismiss = lastSurface()?.onSwipeDismiss;
            expect(onSwipeDismiss).toBeDefined();
            act(() => onSwipeDismiss?.());
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it("swipe dismissal is inert when escapeBehavior is 'ignore' and no onBackdropPress is provided", () => {
            const onOpenChange = jest.fn();
            render(
                <CenteredModal.Root
                    defaultOpen
                    onOpenChange={onOpenChange}
                >
                    <CenteredModal.Content escapeBehavior="ignore">
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            expect(lastSurface()?.onSwipeDismiss).toBeUndefined();
            expect(onOpenChange).not.toHaveBeenCalled();
        });

        it("tap is inert when escapeBehavior is 'ignore' and no onBackdropPress is provided", () => {
            const onOpenChange = jest.fn();
            render(
                <CenteredModal.Root
                    defaultOpen
                    onOpenChange={onOpenChange}
                >
                    <CenteredModal.Content escapeBehavior="ignore">
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            expect(backdropPropsCapture.current.at(-1)?.onPress).toBeUndefined();
            expect(onOpenChange).not.toHaveBeenCalled();
        });
    });

    describe('Animation defaults per kind', () => {
        it('CENTERED uses fadeIn/fadeOut by default', () => {
            render(
                <CenteredModal.Root defaultOpen>
                    <CenteredModal.Content>
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            expect(lastSurface()?.animationIn).toBe('fadeIn');
            expect(lastSurface()?.animationOut).toBe('fadeOut');
        });

        it('BOTTOM_DOCKED uses slideInUp/slideOutDown by default', () => {
            render(
                <BottomDockedModal.Root defaultOpen>
                    <BottomDockedModal.Content>
                        <Text>Body</Text>
                    </BottomDockedModal.Content>
                </BottomDockedModal.Root>,
            );
            expect(lastSurface()?.animationIn).toBe('slideInUp');
            expect(lastSurface()?.animationOut).toBe('slideOutDown');
        });

        it('FULLSCREEN uses slideAndFadeInRight/slideAndFadeOutRight by default', () => {
            render(
                <FullscreenModal.Root defaultOpen>
                    <FullscreenModal.Content>
                        <Text>Body</Text>
                    </FullscreenModal.Content>
                </FullscreenModal.Root>,
            );
            expect(lastSurface()?.animationIn).toBe('slideAndFadeInRight');
            expect(lastSurface()?.animationOut).toBe('slideAndFadeOutRight');
        });

        it('props override the per-kind default', () => {
            render(
                <CenteredModal.Root defaultOpen>
                    <CenteredModal.Content
                        animationIn="slideInUp"
                        animationOut="slideOutDown"
                        animationInTiming={111}
                        animationOutTiming={222}
                    >
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            expect(lastSurface()?.animationIn).toBe('slideInUp');
            expect(lastSurface()?.animationOut).toBe('slideOutDown');
            expect(lastSurface()?.animationInTiming).toBe(111);
            expect(lastSurface()?.animationOutTiming).toBe(222);
        });
    });

    describe('Heading', () => {
        it('labels Content via Title and Description nativeIDs', () => {
            render(
                <AlertDialog.Root defaultOpen>
                    <AlertDialog.Content>
                        <AlertDialog.Title>My title</AlertDialog.Title>
                        <AlertDialog.Description>My description</AlertDialog.Description>
                    </AlertDialog.Content>
                </AlertDialog.Root>,
            );
            const titleEl = screen.getByText('My title');
            const descEl = screen.getByText('My description');
            const surface = lastSurface();
            expect(surface?.labelledBy).toBeDefined();
            expect(surface?.describedBy).toBeDefined();
            expect(titleEl.props.nativeID).toBe(surface?.labelledBy);
            expect(descEl.props.nativeID).toBe(surface?.describedBy);
        });

        it('Title throws outside Content', () => {
            const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
            expect(() =>
                render(
                    <AlertDialog.Root>
                        <AlertDialog.Title>Orphan</AlertDialog.Title>
                    </AlertDialog.Root>,
                ),
            ).toThrow(/Modal\.Title.*Modal\.Content/);
            spy.mockRestore();
        });
    });

    describe('a11y — Trigger', () => {
        it('Trigger advertises haspopup, expanded, and controls the Content via shared IDs', () => {
            render(
                <CenteredModal.Root defaultOpen>
                    <CenteredModal.Trigger
                        accessibilityLabel="Open"
                        sentryLabel="ModalV2Test.A11y.Trigger"
                    >
                        <Text>Open</Text>
                    </CenteredModal.Trigger>
                    <CenteredModal.Content>
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            const trigger = screen.getByLabelText('Open');
            expect(trigger.props.accessibilityHasPopup).toBe('dialog');
            expect(trigger.props.accessibilityState).toEqual(expect.objectContaining({expanded: true}));
            expect(trigger.props.accessibilityControls).toBe(lastSurface()?.nativeID);
            const {nativeID} = trigger.props;
            expect(typeof nativeID).toBe('string');
            if (typeof nativeID === 'string') {
                expect(nativeID.length).toBeGreaterThan(0);
            }
        });

        it('Trigger keeps the controls relationship always-on (WAI-ARIA APG: the structural relationship matters, not the momentary mount state)', () => {
            render(
                <CenteredModal.Root>
                    <CenteredModal.Trigger
                        accessibilityLabel="Open"
                        sentryLabel="ModalV2Test.A11y.ClosedTrigger"
                    >
                        <Text>Open</Text>
                    </CenteredModal.Trigger>
                    <CenteredModal.Content>
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            const trigger = screen.getByLabelText('Open');
            expect(trigger.props.accessibilityState).toEqual(expect.objectContaining({expanded: false}));
            expect(typeof trigger.props.accessibilityControls).toBe('string');
            expect(trigger.props.accessibilityControls).toBeTruthy();
        });
    });

    describe('a11y — Surface role per kind', () => {
        it('CONFIRM kind uses role="alertdialog"', () => {
            render(
                <AlertDialog.Root defaultOpen>
                    <AlertDialog.Content>
                        <Text>Body</Text>
                    </AlertDialog.Content>
                </AlertDialog.Root>,
            );
            expect(lastSurface()?.role).toBe('alertdialog');
        });

        it('non-CONFIRM kinds use role="dialog"', () => {
            render(
                <CenteredModal.Root defaultOpen>
                    <CenteredModal.Content>
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            expect(lastSurface()?.role).toBe('dialog');
        });
    });

    describe('Small-screen dismiss button', () => {
        it('does not render on wide layouts', () => {
            render(
                <BottomDockedModal.Root defaultOpen>
                    <BottomDockedModal.Content>
                        <Text>Body</Text>
                    </BottomDockedModal.Content>
                </BottomDockedModal.Root>,
            );
            expect(screen.queryByLabelText('common.dismiss')).toBeNull();
        });

        it('renders for BOTTOM_DOCKED on small screens', () => {
            responsiveLayoutValue.isSmallScreenWidth = true;
            render(
                <BottomDockedModal.Root defaultOpen>
                    <BottomDockedModal.Content>
                        <Text>Body</Text>
                    </BottomDockedModal.Content>
                </BottomDockedModal.Root>,
            );
            expect(screen.getByLabelText('common.dismiss')).toBeDefined();
        });

        it('does not render for non-BOTTOM_DOCKED kinds on small screens', () => {
            responsiveLayoutValue.isSmallScreenWidth = true;
            render(
                <CenteredModal.Root defaultOpen>
                    <CenteredModal.Content>
                        <Text>Body</Text>
                    </CenteredModal.Content>
                </CenteredModal.Root>,
            );
            expect(screen.queryByLabelText('common.dismiss')).toBeNull();
        });

        it("does not render when escapeBehavior is 'ignore'", () => {
            responsiveLayoutValue.isSmallScreenWidth = true;
            render(
                <BottomDockedModal.Root defaultOpen>
                    <BottomDockedModal.Content escapeBehavior="ignore">
                        <Text>Body</Text>
                    </BottomDockedModal.Content>
                </BottomDockedModal.Root>,
            );
            expect(screen.queryByLabelText('common.dismiss')).toBeNull();
        });

        it("renders when escapeBehavior is 'ignore' but onBackdropPress is provided", () => {
            responsiveLayoutValue.isSmallScreenWidth = true;
            const onBackdropPress = jest.fn();
            render(
                <BottomDockedModal.Root defaultOpen>
                    <BottomDockedModal.Content
                        escapeBehavior="ignore"
                        onBackdropPress={onBackdropPress}
                    >
                        <Text>Body</Text>
                    </BottomDockedModal.Content>
                </BottomDockedModal.Root>,
            );
            const button = screen.getByLabelText('common.dismiss');
            expect(button).toBeDefined();
            fireEvent.press(button);
            expect(onBackdropPress).toHaveBeenCalled();
        });
    });

    describe('Compound invariants', () => {
        it('Trigger outside Root throws', () => {
            const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
            expect(() =>
                render(
                    <CenteredModal.Trigger
                        accessibilityLabel="Open"
                        sentryLabel="ModalV2Test.OrphanTrigger"
                    >
                        <Text>Orphan</Text>
                    </CenteredModal.Trigger>,
                ),
            ).toThrow();
            spy.mockRestore();
        });

        it('Close outside Root throws', () => {
            const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
            expect(() =>
                render(
                    <CenteredModal.Close
                        accessibilityLabel="Close"
                        sentryLabel="ModalV2Test.OrphanClose"
                    >
                        <Text>X</Text>
                    </CenteredModal.Close>,
                ),
            ).toThrow(/Modal\.Close.*Modal\.Root/);
            spy.mockRestore();
        });

        it('useModal throws outside Root', () => {
            const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
            function OrphanConsumer() {
                useModal('OrphanConsumer');
                return null;
            }
            expect(() => render(<OrphanConsumer />)).toThrow(/OrphanConsumer.*Modal\.Root/);
            spy.mockRestore();
        });

        it('useActiveModalKind returns the Root kind', () => {
            const captured: Array<string | null> = [];
            function KindProbe() {
                captured.push(useActiveModalKind());
                return null;
            }
            render(
                <AlertDialog.Root defaultOpen>
                    <KindProbe />
                </AlertDialog.Root>,
            );
            expect(captured.at(-1)).toBe(CONST.MODAL.MODAL_TYPE.CONFIRM);
        });

        it('useActiveModalKind returns null outside any Root', () => {
            const captured: Array<string | null> = [];
            function KindProbe() {
                captured.push(useActiveModalKind());
                return null;
            }
            render(<KindProbe />);
            expect(captured.at(-1)).toBeNull();
        });
    });

    describe('useDisclosureState', () => {
        it('two synchronous toggles round-trip', () => {
            const captured: Array<{isOpen: boolean; toggle: () => void}> = [];
            function HookProbe() {
                const d = useDisclosureState({defaultOpen: false});
                useEffect(() => {
                    captured.push({isOpen: d.isOpen, toggle: d.toggle});
                });
                return null;
            }
            render(<HookProbe />);
            expect(captured.at(-1)?.isOpen).toBe(false);
            act(() => {
                captured.at(-1)?.toggle();
                captured.at(-1)?.toggle();
            });
            expect(captured.at(-1)?.isOpen).toBe(false);
        });

        it('controlled isOpen wins over setOpen', () => {
            const onOpenChange = jest.fn();
            const captured: Array<{isOpen: boolean; open: () => void}> = [];
            function HookProbe({controlled}: {controlled: boolean}) {
                const d = useDisclosureState({isOpen: controlled, onOpenChange});
                useEffect(() => {
                    captured.push({isOpen: d.isOpen, open: d.open});
                });
                return null;
            }
            const tree = render(<HookProbe controlled={false} />);
            expect(captured.at(-1)?.isOpen).toBe(false);
            act(() => captured.at(-1)?.open());
            expect(onOpenChange).toHaveBeenCalledWith(true);
            expect(captured.at(-1)?.isOpen).toBe(false);
            tree.rerender(<HookProbe controlled />);
            expect(captured.at(-1)?.isOpen).toBe(true);
        });
    });
});
