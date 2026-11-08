import {render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import BaseSelectionListWithSections from '@components/SelectionList/SelectionListWithSections/BaseSelectionListWithSections';
import type {FlattenedItem, ListItem} from '@components/SelectionList/SelectionListWithSections/types';

import type Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

import type * as FlashListModule from '@shopify/flash-list';

import * as NativeNavigation from '@react-navigation/native';
import React, {Activity} from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// FlashList's RecyclerViewManager looks items up by index (data[index]), so an index past the end of the data yields undefined
type MaybeFlattenedItem = FlattenedItem<ListItem> | undefined;

// Records the keyExtractor that BaseSelectionListWithSections hands to FlashList so it can be unit tested,
// while still rendering the real FlashList so its render stack / engaged-indices logic runs.
let mockLastKeyExtractor: FlashListModule.FlashListProps<MaybeFlattenedItem>['keyExtractor'];

jest.mock('@shopify/flash-list', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const actual = jest.requireActual<typeof FlashListModule>('@shopify/flash-list');

    function RecordingFlashList(props: FlashListModule.FlashListProps<MaybeFlattenedItem>) {
        mockLastKeyExtractor = props.keyExtractor;
        return ReactLocal.createElement(actual.FlashList<MaybeFlattenedItem>, props);
    }

    return {...actual, FlashList: RecordingFlashList};
});

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(),
        useFocusEffect: jest.fn(),
        useNavigation: jest.fn(() => ({
            isFocused: jest.fn(() => true),
        })),
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
    })),
);

jest.mock('@hooks/useKeyboardShortcut', () => jest.fn());

const LONG_LIST_LENGTH = 30;
const SHORT_LIST_LENGTH = 2;

function buildItems(length: number) {
    return Array.from({length}, (_, index) => ({
        text: `Item ${index}`,
        keyForList: `${index}`,
        isSelected: false,
    }));
}

type CaptureErrorBoundaryProps = {
    children: React.ReactNode;
    onError: (error: Error) => void;
};

type CaptureErrorBoundaryState = {
    error: Error | null;
};

/** Captures render errors (including ones thrown while the list is hidden by Activity) so the test can assert on them */
class CaptureErrorBoundary extends React.Component<CaptureErrorBoundaryProps, CaptureErrorBoundaryState> {
    constructor(props: CaptureErrorBoundaryProps) {
        super(props);
        this.state = {error: null};
    }

    static getDerivedStateFromError(error: Error): CaptureErrorBoundaryState {
        return {error};
    }

    componentDidCatch(error: Error) {
        this.props.onError(error);
    }

    render() {
        if (this.state.error) {
            return null;
        }
        return this.props.children;
    }
}

type ListUnderTestProps = {
    itemCount: number;
    isVisible: boolean;
    onError: (error: Error) => void;
};

/** Mirrors MoneyRequestParticipantsSelector, which wraps its sections list in <Activity> */
function ListUnderTest({itemCount, isVisible, onError}: ListUnderTestProps) {
    return (
        <CaptureErrorBoundary onError={onError}>
            <Activity mode={isVisible ? 'visible' : 'hidden'}>
                <OnyxListItemProvider>
                    <BaseSelectionListWithSections
                        sections={[{data: buildItems(itemCount), sectionIndex: 0}]}
                        ListItem={SingleSelectListItem}
                        onSelectRow={() => {}}
                    />
                </OnyxListItemProvider>
            </Activity>
        </CaptureErrorBoundary>
    );
}

function getRenderedRowKeys() {
    return screen
        .queryAllByTestId(new RegExp(`^${CONST.BASE_LIST_ITEM_TEST_ID}\\d+$`), {includeHiddenElements: true})
        .map((element) => String(element.props.testID).replace(CONST.BASE_LIST_ITEM_TEST_ID, ''))
        .sort((a, b) => Number(a) - Number(b));
}

describe('BaseSelectionListWithSections inside Activity', () => {
    beforeEach(() => {
        jest.mocked(NativeNavigation.useIsFocused).mockReturnValue(true);
        mockLastKeyExtractor = undefined;
    });

    it('does not crash when the data shrinks while the list is hidden by Activity and is then revealed', async () => {
        const errors: Error[] = [];
        const onError = (error: Error) => errors.push(error);

        // Given a visible list with enough rows that FlashList engages indices well past the future data length
        const {rerender} = render(
            <ListUnderTest
                itemCount={LONG_LIST_LENGTH}
                isVisible
                onError={onError}
            />,
        );
        await waitForBatchedUpdatesWithAct();
        expect(getRenderedRowKeys().length).toBeGreaterThan(SHORT_LIST_LENGTH);

        // When Activity hides the list, React runs FlashList's effect cleanups, which dispose its RecyclerViewManager
        rerender(
            <ListUnderTest
                itemCount={LONG_LIST_LENGTH}
                isVisible={false}
                onError={onError}
            />,
        );
        expect(errors).toEqual([]);

        // When the data shrinks while hidden, the disposed manager can't recompute its engaged indices, so FlashList
        // syncs its render stack with the stale ones and asks keyExtractor for keys of indices past the end of the data
        rerender(
            <ListUnderTest
                itemCount={SHORT_LIST_LENGTH}
                isVisible={false}
                onError={onError}
            />,
        );

        // Then the hidden re-render does not throw
        expect(errors).toEqual([]);

        // When the list is revealed again
        rerender(
            <ListUnderTest
                itemCount={SHORT_LIST_LENGTH}
                isVisible
                onError={onError}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // Then nothing throws and only the remaining rows are rendered, with no stale rows left behind
        expect(errors).toEqual([]);
        expect(getRenderedRowKeys()).toEqual(['0', '1']);
    });

    it('does not crash when the data shrinks while the list stays visible', async () => {
        const errors: Error[] = [];
        const onError = (error: Error) => errors.push(error);

        // Given a visible list with enough rows that FlashList engages indices well past the future data length
        const {rerender} = render(
            <ListUnderTest
                itemCount={LONG_LIST_LENGTH}
                isVisible
                onError={onError}
            />,
        );
        await waitForBatchedUpdatesWithAct();
        expect(getRenderedRowKeys().length).toBeGreaterThan(SHORT_LIST_LENGTH);

        // When the data shrinks without Activity ever hiding the list
        rerender(
            <ListUnderTest
                itemCount={SHORT_LIST_LENGTH}
                isVisible
                onError={onError}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // Then FlashList recomputes its engaged indices and renders only the remaining rows
        expect(errors).toEqual([]);
        expect(getRenderedRowKeys()).toEqual(['0', '1']);
    });

    it('falls back to the index when FlashList passes a missing item to keyExtractor', () => {
        // Given the list has rendered and handed its keyExtractor to FlashList
        render(
            <ListUnderTest
                itemCount={SHORT_LIST_LENGTH}
                isVisible
                onError={() => {}}
            />,
        );
        expect(mockLastKeyExtractor).toBeDefined();

        // When FlashList asks for the key of an index past the end of the shrunk data, where data[index] is undefined
        // Then the key falls back to the index instead of throwing
        expect(mockLastKeyExtractor?.(undefined, 5)).toBe('5');
    });
});
