/** Exercises web carousel selection independently of layout and visibility. */
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type AttachmentCarouselViewComponent from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView/index';
import type AttachmentCarouselViewProps from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView/types';
import CarouselActions from '@components/Attachments/AttachmentCarousel/CarouselActions';
import CarouselButtons from '@components/Attachments/AttachmentCarousel/CarouselButtons';
import CarouselItem from '@components/Attachments/AttachmentCarousel/CarouselItem';
import {AttachmentCarouselPagerStateContext} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import type {AttachmentCarouselPagerStateContextType} from '@components/Attachments/AttachmentCarousel/Pager/types';
import type {Attachment} from '@components/Attachments/types';
import Text from '@components/Text';
import {useFullScreenState} from '@components/VideoPlayerContexts/FullScreenContextProvider';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';

import type {FlatList, FlatListProps, ListRenderItemInfo} from 'react-native';
// eslint-disable-next-line no-restricted-imports -- Retain the real gesture hook while observing its callbacks.
import type * as GestureHandler from 'react-native-gesture-handler';
import type * as Reanimated from 'react-native-reanimated';
import type * as Worklets from 'react-native-worklets';

import React, {useContext, useState} from 'react';
import {Keyboard} from 'react-native';
import {GestureDetector, usePanGesture} from 'react-native-gesture-handler';
import {scrollTo} from 'react-native-reanimated';

import createMock from '../utils/createMock';

jest.mock('@components/Attachments/AttachmentCarousel/CarouselButtons', () => jest.fn(() => null));
jest.mock('@components/Attachments/AttachmentCarousel/CarouselActions', () => jest.fn(() => null));
jest.mock('@components/Attachments/AttachmentCarousel/CarouselItem', () => jest.fn(() => null));
jest.mock('@components/VideoPlayerContexts/FullScreenContextProvider', () => ({useFullScreenState: jest.fn()}));
jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: jest.fn()}));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('react-native-gesture-handler', () => {
    const actual = jest.requireActual<typeof GestureHandler>('react-native-gesture-handler');
    return {
        ...actual,
        usePanGesture: jest.fn(actual.usePanGesture),
        GestureDetector: jest.fn(({children}: React.ComponentProps<typeof GestureDetector>) => children),
    };
});
jest.mock('react-native-worklets', () => ({
    ...jest.requireActual<typeof Worklets>('react-native-worklets/src/mock'),
    scheduleOnRN: <Args extends unknown[], Result>(callback: (...args: Args) => Result, ...args: Args) => callback(...args),
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
jest.mock('react-native/Libraries/Lists/FlatList', () => ({__esModule: true, default: (props: FlatListProps<Attachment>) => mockFlatList(props)}));
jest.mock('react-native-reanimated', () => {
    const animated = jest.requireActual<typeof Reanimated>('react-native-reanimated/mock');
    return {
        ...animated,
        useAnimatedRef: () => mockScrollRef,
        scrollTo: jest.fn(),
    };
});

function CarouselHost(props: AttachmentCarouselViewProps) {
    const [page, setPage] = useState(props.page);
    return (
        <AttachmentCarouselView
            {...props}
            page={page}
            setPage={(nextPage) => {
                props.setPage(nextPage);
                setPage(nextPage);
            }}
        />
    );
}

function resize(width: number) {
    fireEvent(screen.getByTestId('attachment-carousel'), 'layout', {nativeEvent: {layout: {width, height: 300, x: 0, y: 0}}});
}

function renderCarousel(overrides: Partial<AttachmentCarouselViewProps> = {}, Component: React.ComponentType<AttachmentCarouselViewProps> = CarouselHost) {
    const props: AttachmentCarouselViewProps = {
        page: 0,
        attachments: [{source: 'first.png'}, {source: 'protected.pdf'}, {source: 'last.png'}],
        source: 'first.png',
        shouldShowArrows: true,
        autoHideArrows: jest.fn(),
        cancelAutoHideArrow: jest.fn(),
        setShouldShowArrows: jest.fn(),
        setPage: jest.fn(),
        onNavigate: jest.fn(),
        ...overrides,
    };
    const view = render(<Component {...props} />);
    resize(390);
    return {props, ...view};
}

function getPanCallbacks() {
    const config = jest.mocked(usePanGesture).mock.calls.at(-1)?.[0];
    if (!config?.onActivate || !config.onDeactivate) {
        throw new Error('Expected carousel pan callbacks');
    }
    return config;
}

function swipe(translationX: number, velocityX = 0, canceled = false) {
    const config = getPanCallbacks();
    act(() => {
        config.onActivate?.(createMock<Parameters<NonNullable<typeof config.onActivate>>[0]>({translationX: 0}));
        config.onDeactivate?.(createMock<Parameters<NonNullable<typeof config.onDeactivate>>[0]>({translationX, velocityX, canceled}));
    });
}

describe('AttachmentCarouselView web', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        pagerState = null;
        jest.mocked(canUseTouchScreen).mockReturnValue(true);
        jest.mocked(useFullScreenState).mockReturnValue(createMock<ReturnType<typeof useFullScreenState>>({isFullScreen: false}));
        jest.mocked(CarouselItem).mockImplementation(({item, isFocused}) => {
            const sourceLabel = typeof item.source === 'object' ? JSON.stringify(item.source) : String(item.source);
            return <Text>{`${item.attachmentID ?? sourceLabel}:${String(isFocused)}`}</Text>;
        });
    });

    it('preserves PDF focus through rotation and a transient zero-width layout', () => {
        // Given a selected PDF between two attachments
        const dismiss = jest.spyOn(Keyboard, 'dismiss');
        const {props} = renderCarousel({page: 1});

        // When layout changes without a navigation action
        resize(748);
        expect(mockFlatList.mock.calls.at(-1)?.[0].getItemLayout?.(null, 1)).toEqual({length: 748, offset: 748, index: 1});
        resize(0);
        resize(390);

        // Then the PDF stays focused and realigns without navigation or keyboard dismissal
        expect(screen.getByText('protected.pdf:true')).toBeOnTheScreen();
        expect(mockScrollToIndex).toHaveBeenLastCalledWith({index: 1, animated: false});
        expect(props.setPage).not.toHaveBeenCalled();
        expect(props.onNavigate).not.toHaveBeenCalled();
        expect(dismiss).not.toHaveBeenCalled();
        dismiss.mockRestore();
    });

    it('navigates to both neighbors and restores PDF focus on return', () => {
        // Given a PDF between two attachments
        const dismiss = jest.spyOn(Keyboard, 'dismiss');
        const {props} = renderCarousel({page: 1});

        // When completed swipes move left, back, right, and back
        swipe(300);
        swipe(-300);
        swipe(-300);
        swipe(300);

        // Then each destination is selected once and the PDF becomes active again
        expect(jest.mocked(props.setPage).mock.calls).toEqual([[0], [1], [2], [1]]);
        expect(props.onNavigate).toHaveBeenCalledTimes(4);
        expect(dismiss).toHaveBeenCalledTimes(4);
        expect(screen.getByText('protected.pdf:true')).toBeOnTheScreen();
        expect(mockScrollToIndex).toHaveBeenLastCalledWith({index: 1, animated: true});
        dismiss.mockRestore();
    });

    it.each([
        {translationX: -20, velocityX: 0, canceled: false},
        {translationX: -300, velocityX: -600, canceled: true},
    ])('keeps selection for a short or canceled swipe: %o', ({translationX, velocityX, canceled}) => {
        // Given a selected PDF
        const {props} = renderCarousel({page: 1});

        // When the swipe snaps back or is canceled
        swipe(translationX, velocityX, canceled);

        // Then selection is unchanged and the list returns to its selected page
        expect(props.onNavigate).not.toHaveBeenCalled();
        expect(props.setPage).not.toHaveBeenCalled();
        expect(scrollTo).toHaveBeenLastCalledWith(mockScrollRef, 390, 0, !canceled);
        expect(screen.getByText('protected.pdf:true')).toBeOnTheScreen();
    });

    it('discards a gesture destination calculated before rotation', () => {
        // Given a gesture that starts in portrait on the selected PDF
        const {props} = renderCarousel({page: 1});
        const initial = getPanCallbacks();
        act(() => initial.onActivate?.(createMock<Parameters<NonNullable<typeof initial.onActivate>>[0]>({translationX: 0})));

        // When rotation changes the geometry before the gesture ends
        resize(748);
        const current = getPanCallbacks();
        act(() => current.onDeactivate?.(createMock<Parameters<NonNullable<typeof current.onDeactivate>>[0]>({translationX: -300, velocityX: -600, canceled: false})));

        // Then the gesture realigns the current page without selecting a neighbor
        expect(props.onNavigate).not.toHaveBeenCalled();
        expect(scrollTo).toHaveBeenLastCalledWith(mockScrollRef, 748, 0, false);
    });

    it('uses fling velocity to select a neighboring page', () => {
        // Given a PDF selected in the middle of the carousel
        const {props} = renderCarousel({page: 1});

        // When a short fast fling points toward the next page
        swipe(-10, -600);

        // Then the destination is selected despite the small translation
        expect(props.setPage).toHaveBeenCalledWith(2);
        expect(props.onNavigate).toHaveBeenCalledWith(props.attachments.at(2));
    });

    it('shares navigation across arrow buttons and keyboard shortcuts with bounds', () => {
        // Given a desktop carousel at its first page
        jest.mocked(canUseTouchScreen).mockReturnValue(false);
        const {props} = renderCarousel();

        // When navigation hits the first boundary, then buttons and keyboard move to the last page
        act(() => jest.mocked(CarouselButtons).mock.calls.at(-1)?.[0].onBack());
        expect(props.setPage).not.toHaveBeenCalled();
        act(() => jest.mocked(CarouselButtons).mock.calls.at(-1)?.[0].onForward());
        act(() => jest.mocked(CarouselActions).mock.calls.at(-1)?.[0].onCycleThroughAttachments(1));
        act(() => jest.mocked(CarouselButtons).mock.calls.at(-1)?.[0].onForward());

        // Then only valid navigation changes selection, without touch animation or a detector
        expect(jest.mocked(props.setPage).mock.calls).toEqual([[1], [2]]);
        expect(mockScrollToIndex).toHaveBeenLastCalledWith({index: 2, animated: false});
        expect(screen.getByText('last.png:true')).toBeOnTheScreen();
        expect(GestureDetector).not.toHaveBeenCalled();
    });

    it('blocks navigation during fullscreen and zoom-disabled swiping', () => {
        // Given zoom has disabled the carousel pan
        const {props, rerender} = renderCarousel({page: 1});
        act(() => pagerState?.isScrollEnabled.set(false));

        // When a swipe is released and fullscreen then receives an arrow action
        swipe(-300);
        jest.mocked(useFullScreenState).mockReturnValue(createMock<ReturnType<typeof useFullScreenState>>({isFullScreen: true}));
        rerender(<CarouselHost {...props} />);
        act(() => jest.mocked(CarouselButtons).mock.calls.at(-1)?.[0].onForward());

        // Then neither interaction changes the selected attachment
        expect(props.setPage).not.toHaveBeenCalled();
        expect(props.onNavigate).not.toHaveBeenCalled();
        expect(getPanCallbacks().enabled).toBe(false);
    });

    it('follows parent selection through replacement and reordering without duplicate navigation', () => {
        // Given a parent-controlled selected page
        const {props, rerender} = renderCarousel({page: 1}, AttachmentCarouselView);
        const replacement: Attachment = {source: 'uploaded.pdf', attachmentID: 'uploaded'};
        const neighbor: Attachment = {source: 'neighbor.png'};

        // When the parent replaces the selected upload, then moves it to a new index
        rerender(
            <AttachmentCarouselView
                {...props}
                attachments={[neighbor, replacement]}
            />,
        );
        expect(screen.getByText('uploaded:true')).toBeOnTheScreen();
        rerender(
            <AttachmentCarouselView
                {...props}
                page={0}
                attachments={[replacement, neighbor]}
            />,
        );

        // Then focus and scroll follow the supplied page without another navigation event
        expect(screen.getByText('uploaded:true')).toBeOnTheScreen();
        expect(mockScrollToIndex).toHaveBeenLastCalledWith({index: 0, animated: false});
        expect(props.onNavigate).not.toHaveBeenCalled();
    });

    it('focuses only the selected index when attachments share a source', () => {
        // Given separate attachments with the same underlying file
        const attachments: Attachment[] = [
            {source: 'same.pdf', attachmentID: 'first'},
            {source: 'same.pdf', attachmentID: 'second'},
        ];
        renderCarousel({attachments, page: 1});

        // When rendering the selected page
        const list = mockFlatList.mock.calls.at(-1)?.[0];

        // Then only one PDF is focused and the list receives selection as extra data
        expect(screen.getByText('first:false')).toBeOnTheScreen();
        expect(screen.getByText('second:true')).toBeOnTheScreen();
        expect(list?.extraData).toBe(1);
    });

    it('treats a function attachment source as data during selection', () => {
        // Given an SVG attachment source that must only be invoked by its renderer
        const source = jest.fn(() => null);
        const attachment: Attachment = {source};
        const {props} = renderCarousel({attachments: [{source: 'first.png'}, attachment]});

        // When navigating to the function source
        act(() => jest.mocked(CarouselButtons).mock.calls.at(-1)?.[0].onForward());

        // Then selection does not invoke it as a state updater and focuses the destination
        expect(source).not.toHaveBeenCalled();
        expect(props.onNavigate).toHaveBeenCalledWith(attachment);
        expect(jest.mocked(CarouselItem).mock.calls.some(([itemProps]) => itemProps.item === attachment && itemProps.isFocused)).toBe(true);
    });

    it('shares the pan gesture and list ref with attachment gesture consumers', () => {
        // Given the carousel's real pan gesture and shared pager context
        const {props, rerender} = renderCarousel();
        const gesture = pagerState?.pagerGesture;

        // When unrelated presentation props change
        rerender(
            <CarouselHost
                {...props}
                shouldShowArrows={false}
            />,
        );

        // Then attachment zoom and carousel paging still share the same gesture and list
        expect(gesture).toBeDefined();
        expect(pagerState?.pagerGesture?.handlerTag).toBe(gesture?.handlerTag);
        expect(pagerState?.pagerRef).toBe(mockScrollRef);
        expect(jest.mocked(GestureDetector).mock.calls.at(-1)?.[0].gesture).toBe(pagerState?.pagerGesture);
    });
});
