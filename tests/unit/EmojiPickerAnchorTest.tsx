/** Exercises anchor identity, real measurement, resize and composer ordering through the exported emoji picker. */
import {act, render} from '@testing-library/react-native';

import type {Emoji} from '@assets/emojis/types';

import EmojiPicker from '@components/EmojiPicker/EmojiPicker';
import EmojiPickerMenu from '@components/EmojiPicker/EmojiPickerMenu';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutMock from '@hooks/useResponsiveLayout/__mocks__';

import type {EmojiPickerRef, EmojiPopoverAnchor} from '@libs/actions/EmojiPickerAction';
import refocusComposerAfterPreventFirstResponder from '@libs/refocusComposerAfterPreventFirstResponder';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';

import {close} from '@userActions/Modal';

import CONST from '@src/CONST';

import type {TextInput, View} from 'react-native';

import React, {createRef} from 'react';
import {Dimensions} from 'react-native';

import createMock from '../utils/createMock';

jest.mock('@components/PopoverWithMeasuredContent', () => jest.fn(({children}: PopoverWithMeasuredContentProps) => children));
jest.mock('@components/EmojiPicker/EmojiPickerMenu', () => jest.fn(() => null));
jest.mock('@components/FocusTrap/FocusTrapForModal', () => ({__esModule: true, default: ({children}: {children: React.ReactNode}) => children}));
jest.mock('@components/ActionSheetAwareScrollView');
jest.mock('@hooks/useResponsiveLayout', () => {
    const createLayoutMock = jest.requireActual<{default: typeof createMock}>('../utils/createMock').default;
    const baseline = jest.requireActual<{default: typeof useResponsiveLayoutMock}>('@hooks/useResponsiveLayout/__mocks__');
    return {
        __esModule: true,
        default: jest.fn<ReturnType<typeof useResponsiveLayout>, Parameters<typeof useResponsiveLayout>>(() => createLayoutMock<ReturnType<typeof useResponsiveLayout>>(baseline.default())),
    };
});
jest.mock('@hooks/useKeyboardState', () => jest.fn(() => ({isKeyboardActive: false})));
jest.mock('@hooks/useBottomSafeSafeAreaPaddingStyle', () => jest.fn(() => ({})));
jest.mock('@src/utils/keyboard', () => ({__esModule: true, default: {dismiss: jest.fn(() => Promise.resolve())}}));
jest.mock('@userActions/Modal', () => ({close: jest.fn()}));
jest.mock('@libs/refocusComposerAfterPreventFirstResponder', () => jest.fn(() => Promise.resolve()));
jest.mock('@libs/ReportActionComposeFocusManager', () => ({
    __esModule: true,
    default: {
        preventComposerFocusOnFirstResponderOnce: jest.fn(),
        preventEditComposerFocusOnFirstResponderOnce: jest.fn(),
    },
}));

function getRenderedPopover() {
    const props = jest.mocked(PopoverWithMeasuredContent).mock.calls.at(-1)?.[0];
    expect(props).toBeDefined();
    if (!props) {
        throw new Error('Expected the real emoji picker to render its popover');
    }
    return props;
}

function renderEmojiPicker() {
    const ref = createRef<EmojiPickerRef>();
    const view = render(<EmojiPicker ref={ref} />);
    expect(ref.current).not.toBeNull();
    if (!ref.current) {
        throw new Error('Expected the exported picker imperative API');
    }
    return {ref, picker: ref.current, ...view};
}

describe('EmojiPicker anchors', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useResponsiveLayout).mockImplementation(() => createMock<ReturnType<typeof useResponsiveLayout>>(useResponsiveLayoutMock()));
        jest.mocked(close).mockImplementation((callback) => {
            callback?.();
        });
    });

    it.each(['view', 'input'])('preserves the supplied %s ref and measures before a closing menu destroys the anchor', async (kind) => {
        // Given a native anchor whose measurement is available only while its context menu exists
        const order: string[] = [];
        const measureInWindow = jest.fn((callback: Parameters<View['measureInWindow']>[0]) => {
            order.push('measure');
            callback(10, 20, 30, 40);
        });
        const blur = jest.fn(() => order.push('blur'));
        const anchor: EmojiPopoverAnchor = {current: kind === 'view' ? createMock<View>({blur, measureInWindow}) : createMock<TextInput>({blur, measureInWindow})};
        jest.mocked(close).mockImplementation((callback) => {
            order.push('close');
            anchor.current = null;
            callback?.();
        });
        const {picker} = renderEmojiPicker();

        // When the real picker opens at a shifted top-left origin
        await act(async () => {
            picker.showEmojiPicker({
                emojiPopoverAnchor: anchor,
                anchorOrigin: {horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, shiftVertical: 5},
                onModalHide: jest.fn(),
                onEmojiSelected: jest.fn(),
            });
        });

        // Then the supplied ref identity and measured geometry survive destruction of the original anchor
        expect(getRenderedPopover().anchorRef).toBe(anchor);
        expect(getRenderedPopover().anchorPosition).toEqual({horizontal: 10, vertical: 65});
        expect(getRenderedPopover().anchorDimensions).toEqual({width: 30, height: 40});
        expect(order).toEqual(['blur', 'measure', 'close']);
        expect(getRenderedPopover().isVisible).toBe(true);
    });

    it('uses the same null fallback before opening, after reset and after hide, and keeps DOM zero measurement real', async () => {
        // Given an actual DOM div, which has blur but no React Native measurement method
        const anchor: EmojiPopoverAnchor = {current: document.createElement('div')};
        const {ref, picker, rerender} = renderEmojiPicker();
        const emptyAnchor = getRenderedPopover().anchorRef;
        expect(emptyAnchor.current).toBeNull();
        rerender(<EmojiPicker ref={ref} />);
        expect(getRenderedPopover().anchorRef).toBe(emptyAnchor);

        // When the DOM anchor opens and the picker resets its holder
        await act(async () => {
            picker.showEmojiPicker({emojiPopoverAnchor: anchor, onModalHide: jest.fn(), onEmojiSelected: jest.fn()});
        });
        expect(getRenderedPopover().anchorRef).toBe(anchor);
        expect(getRenderedPopover().anchorPosition).toEqual({horizontal: 0, vertical: 0});
        expect(getRenderedPopover().anchorDimensions).toEqual({width: 0, height: 0});
        act(() => ref.current?.resetEmojiPopoverAnchor());
        rerender(<EmojiPicker ref={ref} />);
        expect(getRenderedPopover().anchorRef).toBe(emptyAnchor);
        act(() => ref.current?.hideEmojiPicker(true));
        await act(async () => {
            getRenderedPopover().onModalHide?.();
        });
        rerender(<EmojiPicker ref={ref} />);

        // Then the fallback remains the same object with a null current
        expect(getRenderedPopover().anchorRef).toBe(emptyAnchor);
        expect(emptyAnchor.current).toBeNull();
    });

    it('remeasures on resize, hides with no anchor on wide layout, and keeps narrow-layout keyboard resizes open', async () => {
        // Given a measurable anchor and the picker dimensions listener
        const dimensions = jest.spyOn(Dimensions, 'addEventListener');
        let x = 10;
        const anchor: EmojiPopoverAnchor = {current: createMock<View>({blur: jest.fn(), measureInWindow: (callback) => callback(x, 20, 30, 40)})};
        const {ref, picker, rerender} = renderEmojiPicker();
        await act(async () => {
            picker.showEmojiPicker({emojiPopoverAnchor: anchor, onModalHide: jest.fn(), onEmojiSelected: jest.fn()});
        });
        x = 50;
        const resize = dimensions.mock.calls.at(-1)?.[1];
        expect(resize).toBeDefined();
        if (!resize) {
            throw new Error('Expected an installed dimensions listener');
        }

        // When resize occurs with a live anchor, the real measurement updates the default bottom-right position
        await act(async () => resize({window: Dimensions.get('window'), screen: Dimensions.get('screen')}));
        expect(getRenderedPopover().anchorPosition).toEqual({horizontal: 80, vertical: 20});
        jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout: true}));
        rerender(<EmojiPicker ref={ref} />);
        const liveNarrowResize = dimensions.mock.calls.at(-1)?.[1];
        expect(liveNarrowResize).toBeDefined();
        if (!liveNarrowResize) {
            throw new Error('Expected an installed dimensions listener');
        }
        x = 90;
        await act(async () => liveNarrowResize({window: Dimensions.get('window'), screen: Dimensions.get('screen')}));
        expect(getRenderedPopover().anchorPosition).toEqual({horizontal: 120, vertical: 20});
        expect(getRenderedPopover().isVisible).toBe(true);
        act(() => ref.current?.resetEmojiPopoverAnchor());
        jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout: true}));
        rerender(<EmojiPicker ref={ref} />);
        const narrowResize = dimensions.mock.calls.at(-1)?.[1];
        expect(narrowResize).toBeDefined();
        if (!narrowResize) {
            throw new Error('Expected an installed dimensions listener');
        }
        act(() => narrowResize({window: Dimensions.get('window'), screen: Dimensions.get('screen')}));
        expect(getRenderedPopover().isVisible).toBe(true);
        jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout: false}));
        rerender(<EmojiPicker ref={ref} />);
        const wideResize = dimensions.mock.calls.at(-1)?.[1];
        expect(wideResize).toBeDefined();
        if (!wideResize) {
            throw new Error('Expected an installed dimensions listener');
        }
        act(() => wideResize({window: Dimensions.get('window'), screen: Dimensions.get('screen')}));

        // Then losing an anchor closes the wide picker, while the narrow picker survived the keyboard resize
        expect(getRenderedPopover().isVisible).toBe(false);
        dimensions.mockRestore();
    });

    it.each(['main', 'edit'] as const)('hides before selecting once and returns focus to the %s composer after hide', async (composer) => {
        // Given a real picker opened for one composer with a producer-shaped emoji
        const {picker, ref} = renderEmojiPicker();
        const hidden = jest.fn();

        const selected = jest.fn();
        await act(async () => {
            picker.showEmojiPicker({emojiPopoverAnchor: {current: null}, onModalHide: hidden, onEmojiSelected: selected, composerToRefocusOnClose: composer});
        });
        const menu = jest.mocked(EmojiPickerMenu).mock.calls.at(-1)?.[0];
        expect(menu).toBeDefined();
        if (!menu) {
            throw new Error('Expected the visible picker menu');
        }
        const emoji = createMock<Emoji>({code: '😀'});

        // When selection hides the picker, the owner callback runs and the next rendered handler rejects another selection
        act(() => menu.onEmojiSelected('😀', emoji, 0));
        const hiddenMenu = jest.mocked(EmojiPickerMenu).mock.calls.at(-1)?.[0];
        expect(hiddenMenu).toBeDefined();
        act(() => hiddenMenu?.onEmojiSelected('😀', emoji, 0));
        await act(async () => {
            getRenderedPopover().onModalHide?.();
        });

        // Then only one selection reaches the owner and focus returns after the hide callback
        expect(selected).toHaveBeenCalledTimes(1);
        expect(hidden).toHaveBeenCalledWith(false);
        expect(refocusComposerAfterPreventFirstResponder).toHaveBeenCalledWith(composer);
        expect(
            composer === 'main' ? ReportActionComposeFocusManager.preventComposerFocusOnFirstResponderOnce : ReportActionComposeFocusManager.preventEditComposerFocusOnFirstResponderOnce,
        ).toHaveBeenCalledTimes(1);
        expect(ref.current?.isEmojiPickerVisible).toBe(false);
    });
});
