import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import BaseSelectionList from '@components/SelectionList/BaseSelectionList';
import type BaseListItem from '@components/SelectionList/ListItem/BaseListItem';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import type Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';

type BaseSelectionListSections<TItem extends ListItem> = {
    data: TItem[];
    canSelectMultiple?: boolean;
};

const mockSections = Array.from({length: 10}, (_, index) => ({
    text: `Item ${index}`,
    keyForList: `${index}`,
    isSelected: index === 0,
}));

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(),
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
    })),
);

let arrowUpCallback = () => {};
let arrowDownCallback = () => {};
jest.mock('@hooks/useKeyboardShortcut', () => (key: {shortcutKey: string}, callback: () => void) => {
    if (key.shortcutKey === 'ArrowUp') {
        arrowUpCallback = callback;
    } else if (key.shortcutKey === 'ArrowDown') {
        arrowDownCallback = callback;
    }
});

let mockShouldStopMouseLeavePropagation = false;
jest.mock('@components/SelectionList/ListItem/BaseListItem', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const ActualBaseListItem = jest.requireActual('@components/SelectionList/ListItem/BaseListItem').default;

    return ((props) => (
        <ActualBaseListItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            shouldStopMouseLeavePropagation={mockShouldStopMouseLeavePropagation}
        >
            {props.children}
        </ActualBaseListItem>
    )) as typeof BaseListItem;
});

describe('BaseSelectionList', () => {
    const onSelectRowMock = jest.fn();

    function BaseListItemRenderer<TItem extends ListItem>(props: BaseSelectionListSections<TItem>) {
        const {data, canSelectMultiple} = props;
        const focusedKey = data.find((item) => item.isSelected)?.keyForList ?? undefined;
        return (
            <OnyxListItemProvider>
                <BaseSelectionList
                    data={data}
                    ListItem={RadioListItem}
                    onSelectRow={onSelectRowMock}
                    shouldSingleExecuteRowSelect
                    canSelectMultiple={canSelectMultiple}
                    initiallyFocusedItemKey={focusedKey}
                />
            </OnyxListItemProvider>
        );
    }

    it('should focus next/previous item relative to hovered item when arrow keys are pressed', async () => {
        render(
            <BaseListItemRenderer
                data={mockSections}
                canSelectMultiple={false}
            />,
        );

        expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}0`)).toHaveStyle({backgroundColor: colors.productDark400});

        // Trigger a mouse move event to hover the item
        fireEvent(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}8`), 'mouseMove', {stopPropagation: () => {}});

        // eslint-disable-next-line testing-library/no-unnecessary-act
        act(() => {
            arrowDownCallback();
        });

        // The item that gets focused will be the one following the hovered item
        await waitFor(() => {
            expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}9`)).toHaveStyle({backgroundColor: colors.productDark300});
        });

        act(() => {
            arrowUpCallback();
            arrowUpCallback();
        });

        await waitFor(() => {
            expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}7`)).toHaveStyle({backgroundColor: colors.productDark300});
        });

        act(() => {
            arrowDownCallback();
        });

        await waitFor(() => {
            expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}8`)).toHaveStyle({backgroundColor: colors.productDark300});
        });
    });

    it("the stopPropagation from the BaseListItem's mouseLeave event does not trigger if shouldStopMouseLeavePropagation === false", () => {
        mockShouldStopMouseLeavePropagation = false;
        render(
            <BaseListItemRenderer
                data={mockSections}
                canSelectMultiple={false}
            />,
        );

        const mockStopPropagation = jest.fn();
        fireEvent(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}3`), 'mouseLeave', {stopPropagation: mockStopPropagation});

        expect(mockStopPropagation).toHaveBeenCalledTimes(0);

        mockShouldStopMouseLeavePropagation = true;
        render(
            <BaseListItemRenderer
                data={mockSections}
                canSelectMultiple={false}
            />,
        );

        fireEvent(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}3`), 'mouseLeave', {stopPropagation: mockStopPropagation});

        expect(mockStopPropagation).toHaveBeenCalledTimes(1);
    });
});
