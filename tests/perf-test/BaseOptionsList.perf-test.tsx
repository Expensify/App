import {fireEvent, RenderResult} from '@testing-library/react-native';
import React, {useState} from 'react';
import {measurePerformance} from 'reassure';
import BaseOptionsList from '@components/OptionsList/BaseOptionsList';
import type {ListItem} from '@components/SelectionList/types';
import variables from '@styles/variables';

type BaseOptionsListWrapperProps = {
    /** Whether this is a multi-select list */
    canSelectMultiple?: boolean;
};

describe('[BaseOptionsList] Performance tests for BaseOptionsList', () => {
    function BaseOptionsListWrapper({canSelectMultiple}: BaseOptionsListWrapperProps) {
        const [selectedIds, setSelectedIds] = useState<string[]>([]);

        const sections = [
            {
                data: Array.from({length: 1000}, (element, index) => ({
                    text: `Item ${index}`,
                    keyForList: `item-${index}`,
                    isSelected: selectedIds.includes(`item-${index}`),
                })),
                indexOffset: 0,
                isDisabled: false,
            },
        ];

        const onSelectRow = (item: ListItem) => {
            if (!item.keyForList) {
                return;
            }

            if (canSelectMultiple) {
                if (selectedIds.includes(item.keyForList)) {
                    setSelectedIds(selectedIds.filter((selectedId) => selectedId === item.keyForList));
                } else {
                    setSelectedIds([...selectedIds, item.keyForList]);
                }
            } else {
                setSelectedIds([item.keyForList]);
            }
        };

        return (
            <BaseOptionsList
                sections={sections}
                headerMessage="Base Options List Header"
                onSelectRow={onSelectRow}
                canSelectMultiple={canSelectMultiple}
            />
        );
    }

    test('Should render 1 section and a thousand items', () => {
        measurePerformance(<BaseOptionsListWrapper />);
    });

    test('Should press a list item', () => {
        // eslint-disable-next-line @typescript-eslint/require-await
        const scenario = async (screen: RenderResult) => {
            fireEvent.press(screen.getByText('Item 5'));
        };

        measurePerformance(<BaseOptionsListWrapper />, {scenario});
    });

    test('Should render multiple selection and select 4 items', () => {
        // eslint-disable-next-line @typescript-eslint/require-await
        const scenario = async (screen: RenderResult) => {
            fireEvent.press(screen.getByText('Item 1'));
            fireEvent.press(screen.getByText('Item 2'));
            fireEvent.press(screen.getByText('Item 3'));
            fireEvent.press(screen.getByText('Item 4'));
        };

        measurePerformance(<BaseOptionsListWrapper canSelectMultiple />, {scenario});
    });

    test('Should scroll and select a few items', () => {
        const eventData = {
            nativeEvent: {
                contentOffset: {
                    y: variables.optionRowHeight * 5,
                },
                contentSize: {
                    // Dimensions of the scrollable content
                    height: variables.optionRowHeight * 10,
                    width: 100,
                },
                layoutMeasurement: {
                    // Dimensions of the device
                    height: variables.optionRowHeight * 5,
                    width: 100,
                },
            },
        };

        // eslint-disable-next-line @typescript-eslint/require-await
        const scenario = async (screen: RenderResult) => {
            fireEvent.press(screen.getByText('Item 1'));
            // see https://github.com/callstack/react-native-testing-library/issues/1540
            fireEvent(screen.getByTestId('options-list'), 'onContentSizeChange', eventData.nativeEvent.contentSize.width, eventData.nativeEvent.contentSize.height);
            fireEvent.scroll(screen.getByTestId('options-list'), eventData);
            fireEvent.press(screen.getByText('Item 7'));
            fireEvent.press(screen.getByText('Item 15'));
        };

        measurePerformance(<BaseOptionsListWrapper canSelectMultiple />, {scenario});
    });
});
