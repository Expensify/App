import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import BaseSelectionList from '@components/SelectionList/BaseSelectionList';
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
});
