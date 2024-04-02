import {fireEvent} from '@testing-library/react-native';
import type {RenderResult} from '@testing-library/react-native';
import React, {useState} from 'react';
import {measurePerformance} from 'reassure';
import BaseOptionsList from '@components/OptionsList/BaseOptionsList';
import type {OptionData} from '@libs/ReportUtils';
import variables from '@styles/variables';

type BaseOptionsListWrapperProps = {
    /** Whether this is a multi-select list */
    canSelectMultipleOptions?: boolean;
};

describe('[BaseOptionsList]', () => {
    function BaseOptionsListWrapper({canSelectMultipleOptions = false}: BaseOptionsListWrapperProps) {
        const [selectedIds, setSelectedIds] = useState<string[]>([]);

        const sections = [
            {
                data: Array.from({length: 10000}, (_, index) => ({
                    text: `Item ${index}`,
                    keyForList: `item-${index}`,
                    isSelected: selectedIds.includes(`item-${index}`),
                    reportID: `report-${index}`,
                })),
                isDisabled: false,
                shouldShow: true,
                title: 'Section 1',
            },
            {
                data: Array.from({length: 10000}, (_, index) => ({
                    text: `Item ${index}`,
                    keyForList: `item-${index}`,
                    isSelected: selectedIds.includes(`item-${index}`),
                    reportID: `report-${index}`,
                })),
                isDisabled: false,
                shouldShow: true,
                title: 'Section 2',
            },
        ];

        const onSelectRow = (item: OptionData) => {
            if (!item.keyForList) {
                return;
            }

            if (canSelectMultipleOptions) {
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
                canSelectMultipleOptions={canSelectMultipleOptions}
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

        measurePerformance(<BaseOptionsListWrapper canSelectMultipleOptions />, {scenario});
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

        measurePerformance(<BaseOptionsListWrapper canSelectMultipleOptions />, {scenario});
    });
});
