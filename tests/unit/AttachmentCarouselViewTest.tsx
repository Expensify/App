/** Exercises the web carousel's viewability, focus, arrow bounds and shared gesture ref through its real component. */
import {act, fireEvent, render, screen} from '@testing-library/react-native';

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

import type {FlatListProps, FlatList, ListRenderItemInfo} from 'react-native';
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
const mockScrollRef = Object.assign(jest.fn(), {current: createMock<FlatList<Attachment>>({scrollToIndex: mockScrollToIndex})});
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
        default: {
            ...animated.default,
            FlatList: (props: FlatListProps<Attachment>) => mockFlatList(props),
            // eslint-disable-next-line @typescript-eslint/no-deprecated -- Mirror the carousel wrapper so its list props can be inspected.
            createAnimatedComponent: (...args: Parameters<typeof animated.default.createAnimatedComponent>) => {
                if (args[0] === jest.requireActual<{FlatList: typeof FlatList}>('react-native').FlatList) {
                    return (props: FlatListProps<Attachment>) => mockFlatList(props);
                }
                // eslint-disable-next-line @typescript-eslint/no-deprecated -- Preserve the mock factory for components other than the carousel.
                return animated.default.createAnimatedComponent(...args);
            },
        },
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
    fireEvent(screen.getByTestId('attachment-carousel'), 'layout', {nativeEvent: {layout: {width: 390, height: 700, x: 0, y: 0}}});
    return {props, ...view};
}

describe('AttachmentCarouselView web', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        pagerState = null;
        jest.mocked(canUseTouchScreen).mockReturnValue(true);
        jest.mocked(useFullScreenState).mockReturnValue(createMock<ReturnType<typeof useFullScreenState>>({isFullScreen: false, isFullScreenRef: {current: false}}));
        jest.mocked(CarouselItem).mockImplementation(({item, isFocused}) => {
            const sourceLabel = typeof item.source === 'object' ? JSON.stringify(item.source) : String(item.source);
            return <Text>{`${item.attachmentID ?? sourceLabel}:${String(isFocused)}`}</Text>;
        });
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

    it('invokes a function source as the initial state value and renders it unfocused without an id', () => {
        // Given a supported SVG source without an attachment id
        const source = createSvgAttachmentSourceMock();
        const attachment: Attachment = {source};

        // When the unchanged useState initializer receives that function
        renderCarousel({attachments: [attachment], source});

        // Then React invokes it and stores its null return rather than the source function
        expect(source).toHaveBeenCalled();
        expect(screen.getByText(`${String(source)}:false`)).toBeOnTheScreen();
    });

    it('invokes a function source as a state updater while retaining exact navigation and page effects', () => {
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

        // When the unchanged state setter receives that function from viewability
        act(() => viewability({viewableItems: [{item: attachment, key: 'function', index: 1, isViewable: true}], changed: []}));

        // Then React invokes the updater, leaves the item unfocused and still navigates to the original attachment
        expect(source).toHaveBeenCalled();
        expect(screen.getByText(`${String(source)}:false`)).toBeOnTheScreen();
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

        // When the second item becomes visible, its id also takes precedence over the function updater
        act(() => viewability({viewableItems: [{item: second, key: 'second', index: 1, isViewable: true}], changed: []}));

        // Then neither state call invokes the source and exact navigation and focus follow the selected id
        expect(source).not.toHaveBeenCalled();
        expect(screen.getByText('first-id:false')).toBeOnTheScreen();
        expect(screen.getByText('second-id:true')).toBeOnTheScreen();
        expect(props.setPage).toHaveBeenCalledWith(1);
        expect(onNavigate).toHaveBeenCalledTimes(1);
        expect(onNavigate.mock.calls.at(0)?.at(0)).toBe(second);
    });

    it('preserves focus when viewability has no indexed attachment during a resize', () => {
        // Given a focused attachment and the web FlatList viewability callback
        const dismiss = jest.spyOn(Keyboard, 'dismiss');
        const {props} = renderCarousel();
        const viewability = mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged;
        expect(viewability).toBeDefined();
        if (!viewability) {
            throw new Error('Expected viewability callback');
        }
        const attachment: Attachment = {source: 'second.png'};

        // When resizing temporarily reports an attachment without an index or no visible attachments
        act(() => viewability({viewableItems: [{item: attachment, key: 'second', index: null, isViewable: true}], changed: []}));
        act(() => viewability({viewableItems: [], changed: []}));

        // Then the selected attachment stays focused without dismissing the keyboard or navigating
        expect(screen.getByText('first.png:true')).toBeOnTheScreen();
        expect(dismiss).not.toHaveBeenCalled();
        expect(props.setPage).not.toHaveBeenCalled();
        expect(props.onNavigate).not.toHaveBeenCalled();
        dismiss.mockRestore();
    });

    it('sizes cells and realigns to the measured carousel width, including landscape safe areas', () => {
        // Given a carousel whose window is wider than the space available inside the modal
        renderCarousel({page: 1});
        mockScrollToIndex.mockClear();

        // When the actual carousel becomes 748px wide during rotation
        fireEvent(screen.getByTestId('attachment-carousel'), 'layout', {nativeEvent: {layout: {width: 748, height: 214, x: 0, y: 0}}});
        const list = mockFlatList.mock.calls.at(-1)?.[0];

        // Then page offsets use that width and the same selected page is realigned without animation
        expect(list?.getItemLayout?.(null, 1)).toEqual({length: 748, offset: 748, index: 1});
        expect(mockScrollToIndex).toHaveBeenCalledWith({index: 1, animated: false});
    });

    it('retains the list and selected attachment through a transient zero-width layout', () => {
        // Given a measured carousel with an active PDF
        const {props} = renderCarousel({source: 'protected.pdf', attachments: [{source: 'protected.pdf'}]});
        const calls = mockFlatList.mock.calls.length;
        mockScrollToIndex.mockClear();

        // When a temporary layout reports no available width
        fireEvent(screen.getByTestId('attachment-carousel'), 'layout', {nativeEvent: {layout: {width: 0, height: 214, x: 0, y: 0}}});

        // Then the list is retained without losing PDF focus or resetting scroll position
        expect(screen.getByText('protected.pdf:true')).toBeOnTheScreen();
        expect(mockFlatList.mock.calls).toHaveLength(calls);
        expect(mockScrollToIndex).not.toHaveBeenCalled();
        expect(props.onNavigate).not.toHaveBeenCalled();
    });

    it('retains the selected attachment when Safari exposes two old-width cells during rotation', () => {
        // Given the protected PDF is selected after another attachment
        const previous: Attachment = {source: 'previous.png'};
        const pdf: Attachment = {source: 'protected.pdf'};
        const dismiss = jest.spyOn(Keyboard, 'dismiss');
        const {props} = renderCarousel({page: 1, source: pdf.source, attachments: [previous, pdf]});
        const viewability = mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged;

        // When Safari widens the viewport before updating cell widths, both items are fully visible
        act(() =>
            viewability?.({
                viewableItems: [
                    {item: previous, key: 'previous', index: 0, isViewable: true},
                    {item: pdf, key: 'pdf', index: 1, isViewable: true},
                ],
                changed: [],
            }),
        );

        // Then the selected PDF keeps focus and its keyboard is not dismissed
        expect(screen.getByText('protected.pdf:true')).toBeOnTheScreen();
        expect(dismiss).not.toHaveBeenCalled();
        expect(props.setPage).not.toHaveBeenCalled();
        expect(props.onNavigate).not.toHaveBeenCalled();
        dismiss.mockRestore();
    });

    it('navigates from a middle PDF to either neighbor and restores its focus on return', () => {
        // Given a protected PDF between two attachments, with cells sized to the carousel
        const previous: Attachment = {source: 'previous.png'};
        const pdf: Attachment = {source: 'protected.pdf'};
        const next: Attachment = {source: 'next.png'};
        const dismiss = jest.spyOn(Keyboard, 'dismiss');
        const {props} = renderCarousel({page: 1, source: pdf.source, attachments: [previous, pdf, next]});
        const viewability = mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged;
        if (!viewability) {
            throw new Error('Expected the carousel viewability callback');
        }

        // When genuine swipes cross empty visibility intervals to each neighbor and back
        for (const [index, item] of [
            [0, previous],
            [1, pdf],
            [2, next],
            [1, pdf],
        ] as const) {
            act(() => viewability({viewableItems: [], changed: []}));
            act(() => viewability({viewableItems: [{item, index, key: String(index), isViewable: true}], changed: []}));
        }

        // Then every actual page change navigates, and returning restores the PDF's focused viewer
        expect(jest.mocked(props.setPage).mock.calls).toEqual([[0], [1], [2], [1]]);
        expect(props.onNavigate).toHaveBeenCalledTimes(4);
        expect(dismiss).toHaveBeenCalledTimes(4);
        expect(screen.getByText('protected.pdf:true')).toBeOnTheScreen();
        dismiss.mockRestore();
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
