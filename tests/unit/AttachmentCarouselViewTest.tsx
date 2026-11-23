/** Exercises the web carousel's viewability, focus, arrow bounds and shared gesture ref through its real component. */
import {act, render, screen} from '@testing-library/react-native';

import type AttachmentCarouselViewComponent from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView/index';
import type AttachmentCarouselViewProps from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView/types';
import CarouselButtons from '@components/Attachments/AttachmentCarousel/CarouselButtons';
import CarouselItem from '@components/Attachments/AttachmentCarousel/CarouselItem';
import {AttachmentCarouselPagerStateContext} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import type {AttachmentCarouselPagerStateContextType} from '@components/Attachments/AttachmentCarousel/Pager/types';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';
import Text from '@components/Text';
import {useFullScreenState} from '@components/VideoPlayerContexts/FullScreenContextProvider';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';

import type {FlatListProps, FlatList, LayoutChangeEvent, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
// eslint-disable-next-line no-restricted-imports -- This type-only import describes the real Gesture Handler module retained by the mock.
import type * as GestureHandler from 'react-native-gesture-handler';
import type * as Reanimated from 'react-native-reanimated';

import React, {useContext} from 'react';
import {Keyboard} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';

import createMock from '../utils/createMock';

jest.mock('@components/Attachments/AttachmentCarousel/CarouselButtons', () => jest.fn(() => null));
jest.mock('@components/Attachments/AttachmentCarousel/CarouselActions', () => jest.fn(() => null));
jest.mock('@components/Attachments/AttachmentCarousel/CarouselItem', () => jest.fn(() => null));
jest.mock('@components/VideoPlayerContexts/FullScreenContextProvider', () => ({useFullScreenState: jest.fn()}));
jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: jest.fn()}));
jest.mock('@hooks/useResponsiveLayout');
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('react-native-gesture-handler', () => ({
    ...jest.requireActual<typeof GestureHandler>('react-native-gesture-handler'),
    GestureDetector: jest.fn(({children}: React.ComponentProps<typeof GestureDetector>) => children),
}));

const AttachmentCarouselView = jest.requireActual<{default: typeof AttachmentCarouselViewComponent}>(
    '../../src/components/Attachments/AttachmentCarousel/AttachmentCarouselView/index.tsx',
).default;

const mockScrollToIndex = jest.fn();
const mockScrollNode = document.createElement('div');
let mockViewportWidth = 402;
let mockContentWidth = 1206;
mockScrollNode.getBoundingClientRect = jest.fn(() => createMock<DOMRect>({width: mockViewportWidth}));
Object.defineProperty(mockScrollNode, 'scrollWidth', {get: () => mockContentWidth});
const mockScrollToOffset = jest.fn(({offset}: {offset: number}) => {
    mockScrollNode.scrollLeft = Math.min(offset, Math.max(0, mockContentWidth - mockViewportWidth));
});
const mockScrollRef = Object.assign(jest.fn(), {
    current: createMock<FlatList<Attachment>>({scrollToIndex: mockScrollToIndex, scrollToOffset: mockScrollToOffset, getScrollableNode: () => mockScrollNode}),
});
let pagerState: AttachmentCarouselPagerStateContextType | null = null;
const mockFlatList = jest.fn(({data, renderItem}: FlatListProps<Attachment>) => {
    pagerState = useContext(AttachmentCarouselPagerStateContext);
    return (
        <>
            {Array.from(data ?? []).map((item, index) => (
                <React.Fragment key={item.attachmentID ?? index.toString()}>{renderItem?.(createMock<ListRenderItemInfo<Attachment>>({item, index}))}</React.Fragment>
            ))}
        </>
    );
});
jest.mock('react-native-reanimated', () => {
    const animated = jest.requireActual<typeof Reanimated>('react-native-reanimated/mock');
    return {
        ...animated,
        default: {...animated.default, FlatList: (props: FlatListProps<Attachment>) => mockFlatList(props)},
        useAnimatedRef: () => mockScrollRef,
    };
});

function createOnNavigateMock() {
    return jest.fn<ReturnType<NonNullable<AttachmentCarouselViewProps['onNavigate']>>, Parameters<NonNullable<AttachmentCarouselViewProps['onNavigate']>>>();
}

function createSvgAttachmentSourceMock() {
    return jest.fn<ReturnType<Extract<AttachmentSource, React.FunctionComponent>>, Parameters<Extract<AttachmentSource, React.FunctionComponent>>>(() => null);
}

function renderCarousel(overrides: Partial<AttachmentCarouselViewProps> = {}) {
    const props: AttachmentCarouselViewProps = {
        page: 0,
        attachments: [{source: 'first.png'}, {source: 'second.png'}],
        source: 'first.png',
        shouldShowArrows: true,
        autoHideArrows: jest.fn(),
        cancelAutoHideArrow: jest.fn(),
        setShouldShowArrows: jest.fn(),
        setPage: jest.fn(),
        onNavigate: jest.fn(),
        ...overrides,
    };
    const view = render(<AttachmentCarouselView {...props} />);
    return {props, ...view};
}

describe('AttachmentCarouselView web', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockViewportWidth = 402;
        mockContentWidth = 1206;
        mockScrollNode.scrollLeft = 0;
        pagerState = null;
        jest.mocked(canUseTouchScreen).mockReturnValue(true);
        jest.mocked(useFullScreenState).mockReturnValue(createMock<ReturnType<typeof useFullScreenState>>({isFullScreen: false, isFullScreenRef: {current: false}}));
        jest.mocked(CarouselItem).mockImplementation(({item, isFocused}) => {
            const sourceLabel = typeof item.source === 'object' ? JSON.stringify(item.source) : String(item.source);
            return <Text>{`${item.attachmentID ?? sourceLabel}:${String(isFocused)}`}</Text>;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each<Attachment>([{source: 'image.png', attachmentID: 'report_2'}, {source: 'image.png'}, {source: 123}])(
        'keeps attachment identity and focus for source $source and id $attachmentID',
        (attachment) => {
            // Given a typed attachment from the carousel producer, including supported source variants
            const other: Attachment = {source: attachment.source, attachmentID: 'different-id'};
            const onNavigate = createOnNavigateMock();
            const {props} = renderCarousel({attachments: [other, attachment], source: other.source, attachmentID: other.attachmentID, onNavigate});
            const viewability = mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged;
            expect(viewability).toBeDefined();
            if (!viewability) {
                throw new Error('Expected the web FlatList viewability callback');
            }

            // When FlatList reports the second attachment as visible
            mockScrollNode.scrollLeft = 402;
            act(() => viewability({viewableItems: [{item: attachment, key: 'selected', index: 1, isViewable: true}], changed: []}));

            // Then navigation receives the exact item and focus follows attachmentID before source
            expect(onNavigate.mock.calls.at(0)?.at(0)).toBe(attachment);
            expect(props.setPage).toHaveBeenCalledWith(1);
            expect(
                screen.getByText(`${attachment.attachmentID ?? (typeof attachment.source === 'object' ? JSON.stringify(attachment.source) : String(attachment.source))}:true`),
            ).toBeOnTheScreen();
            expect(screen.getByText('different-id:false')).toBeOnTheScreen();
        },
    );

    it('preserves a function source as the initial focus identity without invoking it', () => {
        // Given a supported SVG source without an attachment id
        const source = createSvgAttachmentSourceMock();
        const attachment: Attachment = {source};

        // When the carousel initializes its selection from that source
        renderCarousel({attachments: [attachment], source});

        // Then the source remains an identity value rather than being interpreted as a state initializer
        expect(source).not.toHaveBeenCalled();
        expect(screen.getByText(`${String(source)}:true`)).toBeOnTheScreen();
    });

    it('keeps a function source focused after navigation without invoking it as a state updater', () => {
        // Given a function source without an id and a carousel initialized from a string
        const source = createSvgAttachmentSourceMock();
        const attachment: Attachment = {source};
        const onNavigate = createOnNavigateMock();
        const {props} = renderCarousel({attachments: [{source: 'first.png'}, attachment], onNavigate});
        expect(source).not.toHaveBeenCalled();
        const viewability = mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged;
        expect(viewability).toBeDefined();
        if (!viewability) {
            throw new Error('Expected the web FlatList viewability callback');
        }

        // When viewability selects the attachment with that source
        mockScrollNode.scrollLeft = 402;
        act(() => viewability({viewableItems: [{item: attachment, key: 'function', index: 1, isViewable: true}], changed: []}));

        // Then focus and navigation retain the exact source without treating it as a state updater
        expect(source).not.toHaveBeenCalled();
        expect(screen.getByText(`${String(source)}:true`)).toBeOnTheScreen();
        expect(props.setPage).toHaveBeenCalledWith(1);
        expect(onNavigate).toHaveBeenCalledTimes(1);
        expect(onNavigate.mock.calls.at(0)?.at(0)).toBe(attachment);
    });

    it('prefers attachment ids over function sources during initialization and viewability', () => {
        // Given two SVG sources whose ids supply their focus identities
        const source = createSvgAttachmentSourceMock();
        const first: Attachment = {source, attachmentID: 'first-id'};
        const second: Attachment = {source, attachmentID: 'second-id'};
        const onNavigate = createOnNavigateMock();
        const {props} = renderCarousel({attachments: [first, second], source, attachmentID: first.attachmentID, onNavigate});
        expect(source).not.toHaveBeenCalled();
        expect(screen.getByText('first-id:true')).toBeOnTheScreen();
        const viewability = mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged;
        expect(viewability).toBeDefined();
        if (!viewability) {
            throw new Error('Expected the web FlatList viewability callback');
        }

        // When the second item becomes visible, its id also takes precedence over the function source
        mockScrollNode.scrollLeft = 402;
        act(() => viewability({viewableItems: [{item: second, key: 'second', index: 1, isViewable: true}], changed: []}));

        // Then neither state call invokes the source and exact navigation and focus follow the selected id
        expect(source).not.toHaveBeenCalled();
        expect(screen.getByText('first-id:false')).toBeOnTheScreen();
        expect(screen.getByText('second-id:true')).toBeOnTheScreen();
        expect(props.setPage).toHaveBeenCalledWith(1);
        expect(onNavigate).toHaveBeenCalledTimes(1);
        expect(onNavigate.mock.calls.at(0)?.at(0)).toBe(second);
    });

    it('preserves focus and the keyboard for empty, unchanged and null-index tokens', () => {
        // Given a real callback installed by the web target
        const {props} = renderCarousel();
        const dismiss = jest.spyOn(Keyboard, 'dismiss');
        const viewability = mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged;
        expect(viewability).toBeDefined();
        if (!viewability) {
            throw new Error('Expected viewability callback');
        }
        const attachment: Attachment = {source: 'second.png'};

        // When resize reports an invalid token, no token, or the already selected item
        act(() => viewability({viewableItems: [{item: attachment, key: 'second', index: null, isViewable: true}], changed: []}));
        act(() => viewability({viewableItems: [], changed: []}));
        act(() => viewability({viewableItems: [{item: props.attachments[0], key: 'first', index: 0, isViewable: true}], changed: []}));

        // Then the PDF remains focused without redundant keyboard dismissal or navigation
        expect(screen.getByText('first.png:true')).toBeOnTheScreen();
        expect(props.onNavigate).not.toHaveBeenCalled();
        expect(props.setPage).not.toHaveBeenCalled();
        expect(dismiss).not.toHaveBeenCalled();
        dismiss.mockRestore();
    });

    it('preserves a later PDF through stale resize samples and restores without another viewability event', () => {
        // Given a protected PDF between other attachments, selected in portrait
        let readBack: FrameRequestCallback | undefined;
        const frame = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
            readBack = callback;
            return 1;
        });
        const attachments = [{source: 'first.png'}, {source: 'protected.pdf'}, {source: 'last.png'}];
        const {props} = renderCarousel({attachments, page: 1, source: 'protected.pdf'});
        const dismiss = jest.spyOn(Keyboard, 'dismiss');
        const viewability = mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged;
        if (!viewability) {
            throw new Error('Expected viewability callback');
        }

        // When Safari widens the viewport before cells/content have caught up
        mockViewportWidth = 874;
        mockScrollNode.scrollLeft = 332;
        act(() => {
            viewability({
                viewableItems: [
                    {item: attachments[1], key: 'pdf', index: 1, isViewable: true},
                    {item: attachments[2], key: 'last', index: 2, isViewable: true},
                ],
                changed: [],
            });
            viewability({viewableItems: [], changed: []});
        });

        // Then neither transient sample removes PDF focus or navigates
        expect(screen.getByText('protected.pdf:true')).toBeOnTheScreen();
        expect(props.setPage).not.toHaveBeenCalled();
        expect(props.onNavigate).not.toHaveBeenCalled();
        expect(dismiss).not.toHaveBeenCalled();

        // When the content catches up, a scheduled check restores the page without any list callback
        mockContentWidth = 874 * attachments.length;
        expect(readBack).toBeDefined();
        act(() => readBack?.(0));
        expect(mockScrollToOffset).toHaveBeenLastCalledWith({offset: 874, animated: false});
        expect(mockScrollNode.scrollLeft).toBe(874);
        act(() => viewability({viewableItems: [{item: attachments[2], key: 'stale', index: 2, isViewable: true}], changed: []}));
        expect(props.onNavigate).not.toHaveBeenCalled();

        // Then a genuine later scroll still navigates, even if FlatList sends no further viewability callback
        mockScrollNode.scrollLeft = 874 * 2;
        act(() => mockFlatList.mock.calls.at(-1)?.[0].onScroll?.(createMock<NativeSyntheticEvent<NativeScrollEvent>>({})));
        expect(props.setPage).toHaveBeenCalledWith(2);
        expect(props.onNavigate).toHaveBeenCalledTimes(1);
        expect(props.onNavigate).toHaveBeenCalledWith(attachments[2]);
        expect(screen.getByText('last.png:true')).toBeOnTheScreen();
        dismiss.mockRestore();
        frame.mockRestore();
    });

    it('restores fractional viewport widths on repeated layout changes without locking navigation', () => {
        // Given a non-first selected attachment
        const {props} = renderCarousel({page: 1, source: 'second.png'});

        // When the list changes width repeatedly, including a subpixel change and a height-only layout
        for (const width of [873.5, 402.25, 402.25, 874]) {
            mockViewportWidth = width;
            mockContentWidth = width * 3;
            act(() => mockFlatList.mock.calls.at(-1)?.[0].onLayout?.(createMock<LayoutChangeEvent>({})));
            expect(mockScrollNode.scrollLeft).toBeCloseTo(width);
        }

        // Then layout restoration itself never navigates, and navigation remains usable afterward
        expect(props.onNavigate).not.toHaveBeenCalled();
        mockScrollNode.scrollLeft = 0;
        act(() => mockFlatList.mock.calls.at(-1)?.[0].onScroll?.(createMock<NativeSyntheticEvent<NativeScrollEvent>>({})));
        expect(props.onNavigate).toHaveBeenCalledTimes(1);
        expect(props.onNavigate).toHaveBeenCalledWith(props.attachments[0]);
    });

    it('keeps the FlatList callback identity while using the latest navigation handler', () => {
        // Given the original callback retained by RNW FlatList
        const {props, rerender} = renderCarousel();
        const viewability = mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged;
        const onNavigate = createOnNavigateMock();

        // When a new committed parent callback replaces the old one
        rerender(
            <AttachmentCarouselView
                {...props}
                onNavigate={onNavigate}
            />,
        );
        expect(mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged).toBe(viewability);
        mockScrollNode.scrollLeft = 402;
        act(() => {
            viewability?.({viewableItems: [{item: props.attachments[1], key: 'second', index: 1, isViewable: true}], changed: []});
            viewability?.({viewableItems: [{item: props.attachments[1], key: 'second', index: 1, isViewable: true}], changed: []});
        });

        // Then the retained callback uses fresh props and does not navigate twice before the parent rerenders
        expect(onNavigate).toHaveBeenCalledTimes(1);
        expect(onNavigate).toHaveBeenCalledWith(props.attachments[1]);
        expect(props.onNavigate).not.toHaveBeenCalled();
        expect(props.setPage).toHaveBeenCalledTimes(1);
    });

    it('focuses an externally replaced attachment at the same index without navigating again', () => {
        // Given the first attachment selected before the route replaces it
        const {props, rerender} = renderCarousel();
        const dismiss = jest.spyOn(Keyboard, 'dismiss');
        const replacement = {source: 'replacement.pdf', attachmentID: 'replacement'};

        // When the external selection changes but the page index stays zero
        rerender(
            <AttachmentCarouselView
                {...props}
                source={replacement.source}
                attachmentID={replacement.attachmentID}
                attachments={[replacement, props.attachments[1]]}
            />,
        );

        // Then focus follows the replacement without requiring a visibility callback or dismissing the keyboard
        expect(screen.getByText('replacement:true')).toBeOnTheScreen();
        expect(props.onNavigate).not.toHaveBeenCalled();
        expect(props.setPage).not.toHaveBeenCalled();
        expect(dismiss).not.toHaveBeenCalled();
    });

    it('retains local selection across page-only commits and follows a later external return to the original source', () => {
        // Given a local navigation whose page update can commit before the route source update
        const {props, rerender} = renderCarousel();
        const viewability = mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged;
        mockScrollNode.scrollLeft = 402;
        act(() => viewability?.({viewableItems: [{item: props.attachments[1], key: 'second', index: 1, isViewable: true}], changed: []}));

        // When the page commits first, another event must not repeat that navigation
        rerender(
            <AttachmentCarouselView
                {...props}
                page={1}
            />,
        );
        act(() => viewability?.({viewableItems: [{item: props.attachments[1], key: 'second', index: 1, isViewable: true}], changed: []}));
        expect(props.onNavigate).toHaveBeenCalledTimes(1);
        expect(screen.getByText('second.png:true')).toBeOnTheScreen();

        // Then after the route acknowledges it, an external return can select the original source again
        rerender(
            <AttachmentCarouselView
                {...props}
                page={1}
                source="second.png"
            />,
        );
        rerender(<AttachmentCarouselView {...props} />);
        expect(screen.getByText('first.png:true')).toBeOnTheScreen();
        expect(screen.getByText('second.png:false')).toBeOnTheScreen();
        expect(props.onNavigate).toHaveBeenCalledTimes(1);
    });

    it('restores a fullscreen resize on exit without waiting for another list callback', () => {
        // Given a selected later attachment and fullscreen state whose ref is updated only in a passive effect
        const {props, rerender} = renderCarousel({page: 1, source: 'second.png'});
        const fullscreenRef = {current: true};
        jest.mocked(useFullScreenState).mockReturnValue(createMock<ReturnType<typeof useFullScreenState>>({isFullScreen: true, isFullScreenRef: fullscreenRef}));
        rerender(<AttachmentCarouselView {...props} />);

        // When the viewport changes during fullscreen and the committed state then exits before its ref catches up
        mockViewportWidth = 874;
        mockContentWidth = 2622;
        act(() => mockFlatList.mock.calls.at(-1)?.[0].onLayout?.(createMock<LayoutChangeEvent>({})));
        jest.mocked(useFullScreenState).mockReturnValue(createMock<ReturnType<typeof useFullScreenState>>({isFullScreen: false, isFullScreenRef: fullscreenRef}));
        rerender(<AttachmentCarouselView {...props} />);

        // Then the exit layout effect restores immediately, without a later list callback or navigation
        expect(mockScrollNode.scrollLeft).toBe(874);
        expect(mockScrollToOffset).toHaveBeenLastCalledWith({offset: 874, animated: false});
        expect(props.onNavigate).not.toHaveBeenCalled();
    });

    it('returns before keyboard, page or navigation effects during fullscreen', () => {
        // Given a fullscreen media item
        jest.mocked(useFullScreenState).mockReturnValue(createMock<ReturnType<typeof useFullScreenState>>({isFullScreen: true, isFullScreenRef: {current: true}}));
        const dismiss = jest.spyOn(Keyboard, 'dismiss');
        const {props} = renderCarousel();
        const viewability = mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged;
        expect(viewability).toBeDefined();
        if (!viewability) {
            throw new Error('Expected viewability callback');
        }

        // When viewability changes behind fullscreen playback
        act(() => viewability({viewableItems: [{item: {source: 'second.png'}, key: 'second', index: 1, isViewable: true}], changed: []}));

        // Then none of the ordinary paging effects happen
        expect(dismiss).not.toHaveBeenCalled();
        expect(props.setPage).not.toHaveBeenCalled();
        expect(props.onNavigate).not.toHaveBeenCalled();
        dismiss.mockRestore();
    });

    it('shares the real pan gesture and the list ref with pager consumers and retains them on rerender', () => {
        // Given the production gesture passed to the detector, with only detector rendering replaced
        const {props, rerender} = renderCarousel();
        const detectorProps = jest.mocked(GestureDetector).mock.calls.at(-1)?.[0];
        expect(detectorProps).toBeDefined();
        const gesture = pagerState?.pagerGesture;
        if (!detectorProps || !pagerState || !gesture) {
            throw new Error('Expected the real detector gesture and pager context');
        }

        // Then pager consumers receive the exact enabled pan gesture given to the detector, and the list ref
        expect(detectorProps.gesture).toBe(gesture);
        expect(gesture.type).toBe('PanGestureHandler');
        expect(gesture.config.enabled).toBe(true);
        expect(pagerState.pagerRef).toBe(mockScrollRef);
        const handlerTag = gesture.handlerTag;

        // When the carousel rerenders with unrelated props
        rerender(
            <AttachmentCarouselView
                {...props}
                shouldShowArrows={false}
            />,
        );

        // Then the provider keeps the same list ref and the gesture keeps its native handler identity
        expect(pagerState.pagerRef).toBe(mockScrollRef);
        expect(pagerState.pagerGesture?.handlerTag).toBe(handlerTag);
        expect(jest.mocked(GestureDetector).mock.calls.at(-1)?.[0].gesture).toBe(pagerState.pagerGesture);
    });

    it('enforces arrow bounds and bypasses the detector on a mouse device', () => {
        // Given a non-touch device at the first page
        jest.mocked(canUseTouchScreen).mockReturnValue(false);
        const {props, rerender} = renderCarousel();
        mockScrollToIndex.mockClear();
        const buttons = jest.mocked(CarouselButtons).mock.calls.at(-1)?.[0];
        expect(buttons).toBeDefined();
        if (!buttons) {
            throw new Error('Expected carousel arrow controls');
        }

        // When the user cycles backward then forward and tries to pass the last page
        act(() => buttons.onBack());
        expect(mockScrollToIndex).not.toHaveBeenCalled();
        act(() => buttons.onForward());
        expect(mockScrollToIndex).toHaveBeenCalledWith({index: 1, animated: false});
        rerender(
            <AttachmentCarouselView
                {...props}
                page={1}
            />,
        );
        mockScrollToIndex.mockClear();
        const lastButtons = jest.mocked(CarouselButtons).mock.calls.at(-1)?.[0];
        expect(lastButtons).toBeDefined();
        act(() => lastButtons?.onForward());

        // Then out-of-range navigation does not scroll and pointer capture has no gesture detector
        expect(mockScrollToIndex).not.toHaveBeenCalled();
        expect(GestureDetector).not.toHaveBeenCalled();
    });
});
