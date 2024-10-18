import {fireEvent} from '@testing-library/react-native';
import type {RenderResult} from '@testing-library/react-native';
import React, {useState} from 'react';
import {measureRenders} from 'reassure';
import BaseOptionsList from '@components/OptionsList/BaseOptionsList';
import type {OptionData} from '@libs/ReportUtils';
import variables from '@styles/variables';
import wrapInAct from '../utils/wrapInActHelper';

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

    test('Should render 1 section and a thousand items', async () => {
        await measureRenders(<BaseOptionsListWrapper />);
    });

    test('Should press a list item', async () => {
        // eslint-disable-next-line @typescript-eslint/require-await
        const scenario = async (screen: RenderResult) => {
            // use act to ensure that any state updates caused by interactions are processed correctly before we proceed with any further logic,
            // otherwise the error "An update to BaseOptionsList inside a test was not wrapped in act(...)" will be thrown
            // eslint-disable-next-line testing-library/no-unnecessary-act
            await wrapInAct(async () => {
                fireEvent.press(await screen.findByText('Item 5'));
            });
        };

        await measureRenders(<BaseOptionsListWrapper />, {scenario});
    });

    test('Should render multiple selection and select 4 items', async () => {
        // eslint-disable-next-line @typescript-eslint/require-await
        const scenario = async (screen: RenderResult) => {
            // use act to ensure that any state updates caused by interactions are processed correctly before we proceed with any further logic,
            // otherwise the error "An update to BaseOptionsList inside a test was not wrapped in act(...)" will be thrown
            await wrapInAct(async () => {
                fireEvent.press(await screen.findByText('Item 1'));
                fireEvent.press(screen.getByText('Item 2'));
                fireEvent.press(screen.getByText('Item 3'));
                fireEvent.press(screen.getByText('Item 4'));
            });
        };

        await measureRenders(<BaseOptionsListWrapper canSelectMultipleOptions />, {scenario});
    });

    test('Should scroll and select a few items', async () => {
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
            // use act to ensure that any state updates caused by interactions are processed correctly before we proceed with any further logic,
            // otherwise the error "An update to BaseOptionsList inside a test was not wrapped in act(...)" will be thrown
            await wrapInAct(async () => {
                fireEvent.press(await screen.findByText('Item 1'));
                // see https://github.com/callstack/react-native-testing-library/issues/1540
                fireEvent(await screen.findByTestId('options-list'), 'onContentSizeChange', eventData.nativeEvent.contentSize.width, eventData.nativeEvent.contentSize.height);
                fireEvent.scroll(await screen.findByTestId('options-list'), eventData);
                fireEvent.press(await screen.findByText('Item 7'));
                fireEvent.press(await screen.findByText('Item 15'));
            });
        };

        await measureRenders(<BaseOptionsListWrapper canSelectMultipleOptions />, {scenario});
    });
});
