/** Verifies that carousel resize samples preserve PDF focus without suppressing real navigation. */
import {act, render, screen} from '@testing-library/react-native';

import type AttachmentCarouselViewComponent from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView/index';
import type AttachmentCarouselViewProps from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView/types';
import CarouselItem from '@components/Attachments/AttachmentCarousel/CarouselItem';
import type {Attachment} from '@components/Attachments/types';
import Text from '@components/Text';
import {useFullScreenState} from '@components/VideoPlayerContexts/FullScreenContextProvider';

import type {FlatListProps, FlatList, ListRenderItemInfo} from 'react-native';
import type * as Reanimated from 'react-native-reanimated';

import React from 'react';
import {Keyboard} from 'react-native';

import createMock from '../utils/createMock';

jest.mock('@components/Attachments/AttachmentCarousel/CarouselButtons', () => jest.fn(() => null));
jest.mock('@components/Attachments/AttachmentCarousel/CarouselActions', () => jest.fn(() => null));
jest.mock('@components/Attachments/AttachmentCarousel/CarouselItem', () => jest.fn(() => null));
jest.mock('@components/VideoPlayerContexts/FullScreenContextProvider', () => ({useFullScreenState: jest.fn()}));
jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: () => false}));
jest.mock('@hooks/useResponsiveLayout');
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const AttachmentCarouselView = jest.requireActual<{default: typeof AttachmentCarouselViewComponent}>(
    '../../src/components/Attachments/AttachmentCarousel/AttachmentCarouselView/index.tsx',
).default;

const mockScrollRef = Object.assign(jest.fn(), {
    current: createMock<FlatList<Attachment>>({scrollToIndex: jest.fn()}),
});
const mockFlatList = jest.fn(({data, renderItem}: FlatListProps<Attachment>) => (
    <>
        {Array.from(data ?? []).map((item, index) => (
            <React.Fragment key={item.attachmentID ?? JSON.stringify(item.source)}>{renderItem?.(createMock<ListRenderItemInfo<Attachment>>({item, index}))}</React.Fragment>
        ))}
    </>
));
jest.mock('react-native-reanimated', () => {
    const animated = jest.requireActual<typeof Reanimated>('react-native-reanimated/mock');
    return {
        ...animated,
        default: {...animated.default, FlatList: (props: FlatListProps<Attachment>) => mockFlatList(props)},
        useAnimatedRef: () => mockScrollRef,
    };
});

function renderCarousel(overrides: Partial<AttachmentCarouselViewProps> = {}) {
    const props: AttachmentCarouselViewProps = {
        page: 1,
        attachments: [{source: 'first.png'}, {source: 'protected.pdf'}, {source: 'last.png'}],
        source: 'protected.pdf',
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

describe('AttachmentCarouselView viewability guards', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useFullScreenState).mockReturnValue(createMock<ReturnType<typeof useFullScreenState>>({isFullScreen: false, isFullScreenRef: {current: false}}));
        jest.mocked(CarouselItem).mockImplementation(({item, isFocused}) => {
            const sourceLabel = typeof item.source === 'object' ? JSON.stringify(item.source) : String(item.source);
            return <Text>{`${sourceLabel}:${String(isFocused)}`}</Text>;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each(['empty', 'multiple', 'unchanged'])('preserves PDF focus for %s viewability samples', (sample) => {
        // Given a selected PDF whose password input must not lose focus during resize
        const {props} = renderCarousel();
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
        const {props, rerender} = renderCarousel();
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
        const replacementLabel = typeof replacement.source === 'object' ? JSON.stringify(replacement.source) : String(replacement.source);
        const {props, rerender} = renderCarousel({attachments, source: selected.source, attachmentID: selected.attachmentID});
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
        const {props} = renderCarousel();
        const dismiss = jest.spyOn(Keyboard, 'dismiss');

        // When another attachment is reported as viewable behind the fullscreen player
        act(() => mockFlatList.mock.calls.at(-1)?.[0].onViewableItemsChanged?.({viewableItems: [{item: props.attachments[2], key: 'last', index: 2, isViewable: true}], changed: []}));

        // Then the keyboard and focused PDF remain untouched without page or navigation updates
        expect(dismiss).not.toHaveBeenCalled();
        expect(props.setPage).not.toHaveBeenCalled();
        expect(props.onNavigate).not.toHaveBeenCalled();
        expect(screen.getByText('protected.pdf:true')).toBeOnTheScreen();
    });
});
