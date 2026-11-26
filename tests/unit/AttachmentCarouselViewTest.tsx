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

    it('preserves focus for empty tokens and navigates a null-index token without changing page or focus', () => {
        // Given a real callback installed by the web target
        const {props} = renderCarousel();
        const viewability = mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged;
        expect(viewability).toBeDefined();
        if (!viewability) {
            throw new Error('Expected viewability callback');
        }
        const attachment: Attachment = {source: 'second.png'};

        // When a token has no index, navigation still receives it, then an empty token set preserves focus
        const tokenWithoutIndex = Object.assign(createMock<Parameters<typeof viewability>[0]['viewableItems'][number]>({item: attachment, key: 'second', isViewable: true}), {index: null});
        act(() => viewability({viewableItems: [tokenWithoutIndex], changed: []}));
        expect(props.onNavigate).toHaveBeenCalledWith(attachment);
        expect(props.setPage).not.toHaveBeenCalled();
        expect(screen.getByText('first.png:true')).toBeOnTheScreen();
        act(() => viewability({viewableItems: [], changed: []}));

        // Then the resize guard preserves focus without another navigation
        expect(screen.getByText('first.png:true')).toBeOnTheScreen();
        expect(props.onNavigate).toHaveBeenCalledTimes(1);
    });

    it.each(['empty', 'multiple', 'unchanged'])('preserves PDF focus for %s viewability samples', (sample) => {
        // Given a selected PDF whose password input must not lose focus during resize
        const {props} = renderCarousel({page: 1, attachments: [{source: 'first.png'}, {source: 'protected.pdf'}, {source: 'last.png'}], source: 'protected.pdf'});
        const dismiss = jest.spyOn(Keyboard, 'dismiss');
        const pdf = {item: props.attachments[1], key: 'pdf', index: 1, isViewable: true};
        const first = {item: props.attachments[0], key: 'first', index: 0, isViewable: true};
        let viewableItems = [pdf];
        if (sample === 'empty') {
            viewableItems = [];
        } else if (sample === 'multiple') {
            viewableItems = [first, pdf];
        }

        // When FlatList reports an ambiguous sample or the page that is already selected
        act(() => mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged?.({viewableItems, changed: []}));

        // Then no keyboard, page, navigation, or focus side effect can close the password form
        expect(dismiss).not.toHaveBeenCalled();
        expect(props.setPage).not.toHaveBeenCalled();
        expect(props.onNavigate).not.toHaveBeenCalled();
        expect(screen.getByText('protected.pdf:true')).toBeOnTheScreen();
    });

    it('updates selection for a genuine page change and ignores its later acknowledgement', () => {
        // Given a PDF selected before the user navigates to another attachment
        const {props, rerender} = renderCarousel({page: 1, attachments: [{source: 'first.png'}, {source: 'protected.pdf'}, {source: 'last.png'}], source: 'protected.pdf'});
        const dismiss = jest.spyOn(Keyboard, 'dismiss');
        const last = {item: props.attachments[2], key: 'last', index: 2, isViewable: true};

        // When the list reports a different page and the parent commits that selection
        act(() => mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged?.({viewableItems: [last], changed: []}));
        rerender(
            <AttachmentCarouselView
                {...props}
                page={2}
            />,
        );
        act(() => mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged?.({viewableItems: [last], changed: []}));

        // Then the ref tracks the committed page, so acknowledgement does not repeat navigation
        expect(dismiss).toHaveBeenCalledTimes(1);
        expect(props.setPage).toHaveBeenCalledTimes(1);
        expect(props.setPage).toHaveBeenCalledWith(2);
        expect(props.onNavigate).toHaveBeenCalledTimes(1);
        expect(props.onNavigate).toHaveBeenCalledWith(props.attachments[2]);
        expect(screen.getByText('last.png:true')).toBeOnTheScreen();
        expect(screen.getByText('protected.pdf:false')).toBeOnTheScreen();
    });

    it.each<{name: string; attachments: Attachment[]}>([
        {name: 'source', attachments: [{source: 'first.png'}, {source: 'protected.pdf'}, {source: 'replacement.pdf'}]},
        {
            name: 'attachment ID with a shared source',
            attachments: [
                {source: 'first.png', attachmentID: 'A'},
                {source: 'protected.pdf', attachmentID: 'B'},
                {source: 'protected.pdf', attachmentID: 'C'},
            ],
        },
    ])('focuses a replacement PDF at the same index using its $name', ({attachments}) => {
        // Given B selected between A and C, with identity supplied by either source or attachment ID
        const selected = attachments[1];
        const replacement = attachments[2];
        const replacementLabel = replacement.attachmentID ?? (typeof replacement.source === 'object' ? JSON.stringify(replacement.source) : String(replacement.source));
        const {props, rerender} = renderCarousel({page: 1, attachments, source: selected.source, attachmentID: selected.attachmentID});
        const dismiss = jest.spyOn(Keyboard, 'dismiss');
        const viewability = mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged;
        if (!viewability) {
            throw new Error('Expected viewability callback');
        }

        // When deletion removes B, the parent selects C at the same index without remounting the carousel
        rerender(
            <AttachmentCarouselView
                {...props}
                attachments={[attachments[0], replacement]}
                source={replacement.source}
                attachmentID={replacement.attachmentID}
            />,
        );
        expect(mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged).toBe(viewability);
        const sample = {viewableItems: [{item: replacement, key: 'replacement', index: 1, isViewable: true}], changed: []};
        act(() => viewability(sample));

        // Then the original callback focuses C instead of leaving its PDF loading as an unfocused attachment
        expect(screen.getByText(`${replacementLabel}:true`)).toBeOnTheScreen();
        expect(props.setPage).toHaveBeenCalledWith(1);
        expect(props.onNavigate).toHaveBeenCalledWith(replacement);
        expect(dismiss).toHaveBeenCalledTimes(1);

        // When C is reported again, the unchanged attachment must not dismiss the keyboard or navigate again
        act(() => viewability(sample));
        expect(props.setPage).toHaveBeenCalledTimes(1);
        expect(props.onNavigate).toHaveBeenCalledTimes(1);
        expect(dismiss).toHaveBeenCalledTimes(1);
    });

    it('ignores viewability while the fullscreen ref is set', () => {
        // Given fullscreen playback whose imperative ref suppresses background paging
        jest.mocked(useFullScreenState).mockReturnValue(createMock<ReturnType<typeof useFullScreenState>>({isFullScreen: false, isFullScreenRef: {current: true}}));
        const {props} = renderCarousel({page: 1, attachments: [{source: 'first.png'}, {source: 'protected.pdf'}, {source: 'last.png'}], source: 'protected.pdf'});
        const dismiss = jest.spyOn(Keyboard, 'dismiss');

        // When another attachment is reported as viewable behind the fullscreen player
        act(() => mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged?.({viewableItems: [{item: props.attachments[2], key: 'last', index: 2, isViewable: true}], changed: []}));

        // Then the keyboard and focused PDF remain untouched without page or navigation updates
        expect(dismiss).not.toHaveBeenCalled();
        expect(props.setPage).not.toHaveBeenCalled();
        expect(props.onNavigate).not.toHaveBeenCalled();
        expect(screen.getByText('protected.pdf:true')).toBeOnTheScreen();
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
