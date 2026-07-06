import {fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import BaseSelectionList from '@components/SelectionList/BaseSelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type ReactNative from 'react-native';

import * as NativeNavigation from '@react-navigation/native';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import createRandomPolicy from '../utils/collections/policies';

jest.mock('@shopify/flash-list', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const RN = jest.requireActual<typeof ReactNative>('react-native');

    const FlashList = ReactLocal.forwardRef<
        {scrollToIndex: (params: {index: number}) => void},
        Omit<React.ComponentProps<typeof RN.ScrollView>, 'children'> & {
            data?: unknown[];
            renderItem?: (info: {item: unknown; index: number; target: string}) => React.ReactNode;
            keyExtractor?: (item: unknown, index: number) => string;
        }
    >(({data, renderItem, keyExtractor, ...scrollViewProps}, ref) => {
        ReactLocal.useImperativeHandle(ref, () => ({scrollToIndex: jest.fn()}));

        return ReactLocal.createElement(
            RN.ScrollView,
            scrollViewProps,
            ...(data ?? []).map((item, index) =>
                ReactLocal.createElement(ReactLocal.Fragment, {key: keyExtractor?.(item, index) ?? String(index)}, renderItem?.({item, index, target: 'Cell'})),
            ),
        );
    });

    return {FlashList};
});

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
    useFocusEffect: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
    })),
);

jest.mock('@hooks/useKeyboardShortcut', () => jest.fn());

function getTitleTextColor(itemKey: string): string | undefined {
    const row = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${itemKey}`);
    const textNodes = row.findAllByType(Text);
    const titleText = textNodes.at(0);
    expect(titleText).toBeTruthy();
    return StyleSheet.flatten(titleText?.props.style)?.color as string | undefined;
}

function getSelectionButtonOpacity(itemText: string): number | undefined {
    const button = screen.getByTestId(`${CONST.SELECTION_BUTTON_TEST_ID}${itemText}`);
    const pressableOpacity = StyleSheet.flatten(button.props.style)?.opacity;
    if (pressableOpacity !== undefined) {
        return pressableOpacity;
    }

    const innerViews = button.findAllByType(View);
    for (const view of innerViews) {
        const opacity = StyleSheet.flatten(view.props.style)?.opacity;
        if (opacity !== undefined) {
            return opacity;
        }
    }
    return undefined;
}

function renderSingleSelectList(data: ListItem[], onSelectRow = jest.fn()) {
    return render(
        <OnyxListItemProvider>
            <BaseSelectionList
                data={data}
                ListItem={SingleSelectListItem}
                onSelectRow={onSelectRow}
                shouldSingleExecuteRowSelect
            />
        </OnyxListItemProvider>,
    );
}

describe('BaseSelectListItem selected-disabled visual styling', () => {
    const onSelectRowMock = jest.fn();

    beforeEach(() => {
        onSelectRowMock.mockClear();
    });

    it('should render selected and disabled item title with muted color', () => {
        renderSingleSelectList([
            {keyForList: 'enabled', text: 'Enabled rate', isSelected: false, isDisabled: false},
            {keyForList: 'disabled-selected', text: 'Disabled rate', isSelected: true, isDisabled: true},
            {keyForList: 'disabled', text: 'Other disabled', isSelected: false, isDisabled: true},
        ]);

        const selectedDisabledColor = getTitleTextColor('disabled-selected');
        const nonSelectedDisabledColor = getTitleTextColor('disabled');
        expect(selectedDisabledColor).toBe(nonSelectedDisabledColor);
        expect(selectedDisabledColor).not.toBe(getTitleTextColor('enabled'));
    });

    it('should render selected and enabled item title without muted color', () => {
        renderSingleSelectList([
            {keyForList: 'enabled-selected', text: 'Enabled rate', isSelected: true, isDisabled: false},
            {keyForList: 'disabled', text: 'Disabled rate', isSelected: false, isDisabled: true},
        ]);

        const selectedEnabledColor = getTitleTextColor('enabled-selected');
        const mutedColor = getTitleTextColor('disabled');
        expect(selectedEnabledColor).not.toBe(mutedColor);
    });

    it('should render non-selected disabled item title with muted color', () => {
        renderSingleSelectList([
            {keyForList: 'disabled', text: 'Disabled rate', isSelected: false, isDisabled: true},
            {keyForList: 'enabled', text: 'Enabled rate', isSelected: true, isDisabled: false},
        ]);

        expect(getTitleTextColor('disabled')).not.toBe(getTitleTextColor('enabled'));
    });

    it('should keep selected disabled row pressable and dim the selection button while keeping it enabled', () => {
        renderSingleSelectList([{keyForList: 'disabled-selected', text: 'Disabled rate', isSelected: true, isDisabled: true}], onSelectRowMock);

        expect(getSelectionButtonOpacity('Disabled rate')).toBe(0.5);

        fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}disabled-selected`));
        expect(onSelectRowMock).toHaveBeenCalledTimes(1);
    });

    it('should disable selection button for non-selected disabled item', () => {
        renderSingleSelectList([{keyForList: 'disabled', text: 'Disabled rate', isSelected: false, isDisabled: true}]);

        expect(getSelectionButtonOpacity('Disabled rate')).toBe(0.5);
    });
});

describe('Distance rate list filtering with disabled selected rate', () => {
    it('should include only the selected disabled rate and exclude other disabled rates', () => {
        const disabledSelectedRateID = 'rate-disabled-selected';
        const disabledOtherRateID = 'rate-disabled-other';
        const enabledRateID = 'rate-enabled';
        const customUnitID = 'distance-unit';

        const policy: Policy = {
            ...createRandomPolicy(1),
            customUnits: {
                [customUnitID]: {
                    customUnitID,
                    name: 'Distance',
                    enabled: true,
                    defaultCategory: 'Car',
                    attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                    rates: {
                        [disabledSelectedRateID]: {
                            customUnitRateID: disabledSelectedRateID,
                            enabled: false,
                            name: 'Disabled selected',
                            rate: 50,
                            currency: 'USD',
                        },
                        [disabledOtherRateID]: {
                            customUnitRateID: disabledOtherRateID,
                            enabled: false,
                            name: 'Disabled other',
                            rate: 55,
                            currency: 'USD',
                        },
                        [enabledRateID]: {
                            customUnitRateID: enabledRateID,
                            enabled: true,
                            name: 'Enabled',
                            rate: 60,
                            currency: 'USD',
                        },
                    },
                },
            },
        };

        const ratesWithDisabledSelected = DistanceRequestUtils.getMileageRates(policy, false, disabledSelectedRateID);
        expect(Object.keys(ratesWithDisabledSelected).sort()).toEqual([disabledSelectedRateID, enabledRateID].sort());

        const ratesWithEnabledSelected = DistanceRequestUtils.getMileageRates(policy, false, enabledRateID);
        expect(Object.keys(ratesWithEnabledSelected).sort()).toEqual([enabledRateID].sort());
        expect(ratesWithEnabledSelected[disabledOtherRateID]).toBeUndefined();
    });
});
