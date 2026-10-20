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

    it('clears focus for empty tokens and navigates a null-index token without changing page or focus', () => {
        // Given a real callback installed by the web target
        const {props} = renderCarousel();
        const viewability = mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged;
        expect(viewability).toBeDefined();
        if (!viewability) {
            throw new Error('Expected viewability callback');
        }
        const attachment: Attachment = {source: 'second.png'};

        // When a token has no index, navigation still receives it, then an empty token set clears focus
        act(() => viewability({viewableItems: [{item: attachment, key: 'second', index: null, isViewable: true}], changed: []}));
        expect(props.onNavigate).toHaveBeenCalledWith(attachment);
        expect(props.setPage).not.toHaveBeenCalled();
        expect(screen.getByText('first.png:true')).toBeOnTheScreen();
        act(() => viewability({viewableItems: [], changed: []}));

        // Then empty input removes active focus without another navigation
        expect(screen.getByText('first.png:false')).toBeOnTheScreen();
        expect(props.onNavigate).toHaveBeenCalledTimes(1);
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

    it('shares the exact undefined-initialized ref with the real pan gesture and retains it on rerender', () => {
        // Given the production gesture passed to the detector, with only detector rendering replaced
        const {props, rerender} = renderCarousel();
        const detectorProps = jest.mocked(GestureDetector).mock.calls.at(-1)?.[0];
        expect(detectorProps).toBeDefined();
        if (!detectorProps || !pagerState || !('toGestureArray' in detectorProps.gesture)) {
            throw new Error('Expected the real detector gesture and pager context');
        }
        const gestures = detectorProps.gesture.toGestureArray();
        expect(gestures).toHaveLength(1);
        const gesture = gestures.at(0);
        expect(gesture).toBeDefined();
        if (!gesture) {
            throw new Error('Expected the single pan gesture');
        }
        expect(gesture.handlerName).toBe('PanGestureHandler');
        const contextRef = pagerState.pagerRef;
        expect(gesture.config.ref).toBe(contextRef);
        expect(gesture.config.ref?.current).toBeUndefined();

        // When Gesture Handler initializes the real gesture it writes the same ref exposed to pager consumers
        gesture.initialize();
        expect(gesture.config.ref?.current).toBe(gesture);
        rerender(
            <AttachmentCarouselView
                {...props}
                shouldShowArrows={false}
            />,
        );

        // Then the provider keeps the original ref object rather than a snapshot or a second ref
        expect(pagerState.pagerRef).toBe(contextRef);
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
