import {fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SelectableListItem from '@components/SelectionList/ListItem/SelectableListItem';
import type {ListItem, SelectableListItemProps} from '@components/SelectionList/ListItem/types';
import {useListItemContext, useListItemHovered} from '@components/SelectionList/ListItemContext';

import type * as DeviceCapabilitiesModule from '@libs/DeviceCapabilities';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const SELECTION_BUTTON_TEST_ID = `${CONST.SELECTION_BUTTON_TEST_ID}Test User`;
const ROW_TEST_ID = `${CONST.BASE_LIST_ITEM_TEST_ID}test-user`;
const ROW_CONTENT_TEST_ID = 'row-content';

// The hover render-prop tests need the device to report hover support, otherwise useHover ignores mouse events.
const mockHasHoverSupport = jest.fn(() => true);
jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<typeof DeviceCapabilitiesModule>('@libs/DeviceCapabilities'),
    hasHoverSupport: () => mockHasHoverSupport(),
}));

// Icons load lazily in production; resolve them synchronously so icon-based assertions (RBR dot) don't race the chunk load.
jest.mock('@hooks/useLazyAsset', () => ({
    ...jest.requireActual<Record<string, unknown>>('@hooks/useLazyAsset'),
    useMemoizedLazyExpensifyIcons: (names: string[]) => Object.fromEntries(names.map((name) => [name, name])),
}));

// Reads the hover state the row provides through context, so hover tests can assert it from plain children.
function HoverProbe() {
    const isHovered = useListItemHovered();
    return <View testID={`hovered-${isHovered}`} />;
}

// Reads the row state the pressable provides through ListItemContext.
function RowStateProbe() {
    const {isDisabled, isInteractive, shouldDisableAccessibleGrouping} = useListItemContext();
    return <View testID={`row-state-${isDisabled}-${isInteractive}-${shouldDisableAccessibleGrouping}`} />;
}

const buildItem = (extra: Partial<ListItem> = {}): ListItem => ({
    text: 'Test User',
    keyForList: 'test-user',
    isSelected: false,
    ...extra,
});

type RenderOptions = Partial<SelectableListItemProps<ListItem>>;

const renderItem = ({item = buildItem(), children = <View testID={ROW_CONTENT_TEST_ID} />, ...props}: RenderOptions = {}) =>
    render(
        <OnyxListItemProvider>
            <SelectableListItem
                item={item}
                showTooltip={false}
                onSelectRow={props.onSelectRow ?? jest.fn()}
                {...props}
            >
                {children}
            </SelectableListItem>
        </OnyxListItemProvider>,
    );

// The selection button pressable is accessible={false}, so read the disabled flag from its accessibility state directly.
const getSelectionButtonDisabledState = (): unknown => {
    const props: unknown = screen.getByTestId(SELECTION_BUTTON_TEST_ID).props;
    if (typeof props !== 'object' || props === null || !('accessibilityState' in props)) {
        return undefined;
    }
    const state = props.accessibilityState;
    if (typeof state !== 'object' || state === null || !('disabled' in state)) {
        return undefined;
    }
    return state.disabled;
};

// Order of appearance in the serialized tree mirrors render order inside the row.
const getRenderedOrder = (...testIDs: string[]): string[] => {
    const tree = JSON.stringify(screen.toJSON());
    return [...testIDs].sort((first, second) => tree.indexOf(`"${first}"`) - tree.indexOf(`"${second}"`));
};

describe('SelectableListItem', () => {
    it.each([
        [true, CONST.ROLE.CHECKBOX],
        [false, CONST.ROLE.RADIO],
    ])('renders the selection button with the role derived from canSelectMultiple=%s', (canSelectMultiple, expectedRole) => {
        renderItem({canSelectMultiple});

        expect(screen.getByTestId(SELECTION_BUTTON_TEST_ID).props.role).toBe(expectedRole);
    });

    it('removes the radio button from the tab order but not the checkbox', () => {
        renderItem({canSelectMultiple: false});
        expect(screen.getByTestId(SELECTION_BUTTON_TEST_ID).props.tabIndex).toBe(-1);

        screen.unmount();

        renderItem({canSelectMultiple: true});
        expect(screen.getByTestId(SELECTION_BUTTON_TEST_ID).props.tabIndex).not.toBe(-1);
    });

    it('hides the selection button when the item opts out', () => {
        renderItem({item: buildItem({shouldHideSelectionButton: true})});

        expect(screen.queryByTestId(SELECTION_BUTTON_TEST_ID)).toBeNull();
        expect(screen.getByTestId(ROW_CONTENT_TEST_ID)).toBeVisible();
    });

    it('routes the selection button press to onSelectionButtonPress when provided, otherwise to onSelectRow', () => {
        const onSelectRow = jest.fn();
        const onSelectionButtonPress = jest.fn();
        renderItem({onSelectRow, onSelectionButtonPress});

        fireEvent.press(screen.getByTestId(SELECTION_BUTTON_TEST_ID));
        expect(onSelectionButtonPress).toHaveBeenCalledTimes(1);
        expect(onSelectRow).not.toHaveBeenCalled();

        screen.unmount();

        const onSelectRowOnly = jest.fn();
        renderItem({onSelectRow: onSelectRowOnly});
        fireEvent.press(screen.getByTestId(SELECTION_BUTTON_TEST_ID));
        expect(onSelectRowOnly).toHaveBeenCalledTimes(1);
    });

    it.each([
        ['isDisabled prop', {isDisabled: true, item: buildItem()}],
        ['item.isDisabledCheckbox', {isDisabled: false, item: buildItem({isDisabledCheckbox: true})}],
    ])('disables the selection button via %s', (_label, props) => {
        renderItem(props);

        expect(getSelectionButtonDisabledState()).toBe(true);
    });

    it.each([
        [CONST.SELECTION_BUTTON_POSITION.LEFT, [SELECTION_BUTTON_TEST_ID, ROW_CONTENT_TEST_ID]],
        [CONST.SELECTION_BUTTON_POSITION.RIGHT, [ROW_CONTENT_TEST_ID, SELECTION_BUTTON_TEST_ID]],
    ])('renders the selection button on the %s side of the row content', (selectionButtonPosition, expectedOrder) => {
        renderItem({selectionButtonPosition});

        expect(getRenderedOrder(SELECTION_BUTTON_TEST_ID, ROW_CONTENT_TEST_ID)).toEqual(expectedOrder);
    });

    it.each([
        ['shows the RBR indicator for an unselected item with an error', buildItem({brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR}), true],
        ['hides the RBR indicator when the item is selected', buildItem({brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR, isSelected: true}), false],
        [
            'shows the RBR indicator on a selected item that can show several indicators',
            buildItem({brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR, isSelected: true, canShowSeveralIndicators: true}),
            true,
        ],
        ['renders no RBR indicator without a brickRoadIndicator', buildItem(), false],
    ])('%s', async (_label, item, isVisible) => {
        renderItem({item});
        // The indicator icon is loaded lazily, so let the icon chunk resolve before asserting.
        await waitForBatchedUpdatesWithAct();

        // The dot icon is accessibility-hidden, so it must be queried with includeHiddenElements.
        const indicator = screen.queryByTestId(CONST.DOT_INDICATOR_TEST_ID, {includeHiddenElements: true});
        if (isVisible) {
            expect(indicator).toBeTruthy();
        } else {
            expect(indicator).toBeNull();
        }
    });

    it('provides the live hover state to children through ListItemHoverContext', () => {
        renderItem({children: <HoverProbe />});

        expect(screen.getByTestId('hovered-false')).toBeVisible();

        fireEvent(screen.getByTestId(ROW_TEST_ID), 'mouseEnter');
        expect(screen.getByTestId('hovered-true')).toBeVisible();

        // The mouseLeave handler also clears the mouse-down state and stops propagation, so it needs a real event object.
        fireEvent(screen.getByTestId(ROW_TEST_ID), 'mouseLeave', {stopPropagation: () => {}});
        expect(screen.getByTestId('hovered-false')).toBeVisible();
    });

    it.each([
        ['the defaults for an enabled, interactive row', {}, 'row-state-false-true-false'],
        ['the disabled state', {isDisabled: true}, 'row-state-true-true-false'],
        ['the non-interactive state from the item', {item: buildItem({isInteractive: false})}, 'row-state-false-false-false'],
        ['the disabled accessible grouping when the row is not accessible as one unit', {accessible: false}, 'row-state-false-true-true'],
    ])('provides %s to children through ListItemContext', (_label, props, expectedTestID) => {
        renderItem({children: <RowStateProbe />, ...props});

        expect(screen.getByTestId(expectedTestID)).toBeVisible();
    });

    it('reports hover as false to children when shouldDisableHoverStyle is set', () => {
        renderItem({children: <HoverProbe />, shouldDisableHoverStyle: true});

        fireEvent(screen.getByTestId(ROW_TEST_ID), 'mouseEnter');
        expect(screen.getByTestId('hovered-false')).toBeVisible();
    });

    it('resolves a function-form rightHandSideComponent with the item and focus state', () => {
        const item = buildItem();
        const rightHandSideComponent = jest.fn(() => <View testID="rhs" />);
        renderItem({item, isFocused: true, rightHandSideComponent});

        expect(rightHandSideComponent).toHaveBeenCalledWith(item, true);
        expect(screen.getByTestId('rhs')).toBeVisible();
    });
});
