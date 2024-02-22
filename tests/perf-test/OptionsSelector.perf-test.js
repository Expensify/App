import {fireEvent} from '@testing-library/react-native';
import React from 'react';
import {measurePerformance} from 'reassure';
import _ from 'underscore';
import OptionsSelector from '@src/components/OptionsSelector';
import variables from '@src/styles/variables';

jest.mock('../../src/components/withLocalize', () => (Component) => {
    function WrappedComponent(props) {
        return (
            <Component
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                translate={() => ''}
            />
        );
    }
    WrappedComponent.displayName = `WrappedComponent`;
    return WrappedComponent;
});

jest.mock('../../src/components/withNavigationFocus', () => (Component) => {
    function WithNavigationFocus(props) {
        return (
            <Component
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                isFocused={false}
            />
        );
    }

    WithNavigationFocus.displayName = 'WithNavigationFocus';

    return WithNavigationFocus;
});

const generateSections = (sectionConfigs) =>
    _.map(sectionConfigs, ({numItems, indexOffset, shouldShow = true}) => ({
        data: Array.from({length: numItems}, (_v, i) => ({
            text: `Item ${i + indexOffset}`,
            keyForList: `item-${i + indexOffset}`,
        })),
        indexOffset,
        shouldShow,
    }));

const singleSectionSConfig = [{numItems: 1000, indexOffset: 0}];

const mutlipleSectionsConfig = [
    {numItems: 1000, indexOffset: 0},
    {numItems: 100, indexOffset: 70},
];

function OptionsSelectorWrapper(args) {
    const sections = generateSections(singleSectionSConfig);
    return (
        <OptionsSelector
            value="test"
            sections={sections}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
        />
    );
}

test('[OptionsSelector] should render text input with interactions', () => {
    const scenario = (screen) => {
        const textInput = screen.getByTestId('options-selector-input');
        fireEvent.changeText(textInput, 'test');
        fireEvent.changeText(textInput, 'test2');
        fireEvent.changeText(textInput, 'test3');
    };

    measurePerformance(<OptionsSelectorWrapper />, {scenario});
});

test('[OptionsSelector] should render 1 section', () => {
    measurePerformance(<OptionsSelectorWrapper />);
});

test('[OptionsSelector] should render multiple sections', () => {
    const sections = generateSections(mutlipleSectionsConfig);
    measurePerformance(<OptionsSelectorWrapper sections={sections} />);
});

test('[OptionsSelector] should press a list items', () => {
    const scenario = (screen) => {
        fireEvent.press(screen.getByText('Item 1'));
        fireEvent.press(screen.getByText('Item 5'));
        fireEvent.press(screen.getByText('Item 10'));
    };

    measurePerformance(<OptionsSelectorWrapper />, {scenario});
});

test('[OptionsSelector] should scroll and press few items', () => {
    const sections = generateSections(mutlipleSectionsConfig);

    const generateEventData = (numOptions, optionRowHeight) => ({
        nativeEvent: {
            contentOffset: {
                y: optionRowHeight * numOptions,
            },
            contentSize: {
                height: optionRowHeight * 10,
                width: 100,
            },
            layoutMeasurement: {
                height: optionRowHeight * 5,
                width: 100,
            },
        },
    });

    const eventData = generateEventData(100, variables.optionRowHeight);
    const eventData2 = generateEventData(200, variables.optionRowHeight);
    const scenario = async (screen) => {
        fireEvent.press(screen.getByText('Item 10'));
        fireEvent.scroll(screen.getByTestId('options-list'), eventData);
        fireEvent.press(await screen.findByText('Item 100'));
        fireEvent.scroll(screen.getByTestId('options-list'), eventData2);
        fireEvent.press(screen.getByText('Item 200'));
    };

    measurePerformance(<OptionsSelectorWrapper sections={sections} />, {scenario});
});
