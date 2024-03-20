import {fireEvent} from '@testing-library/react-native';
import type {RenderResult} from '@testing-library/react-native';
import React from 'react';
import type {ComponentType} from 'react';
import {measurePerformance} from 'reassure';
import type {WithLocalizeProps} from '@components/withLocalize';
import type {WithNavigationFocusProps} from '@components/withNavigationFocus';
import OptionsSelector from '@src/components/OptionsSelector';
import variables from '@src/styles/variables';

jest.mock('@src/components/withLocalize', () => (Component: ComponentType<WithLocalizeProps>) => {
    function WrappedComponent(props: WithLocalizeProps) {
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

jest.mock('@src/components/withNavigationFocus', () => (Component: ComponentType<WithNavigationFocusProps>) => {
    function WithNavigationFocus(props: WithNavigationFocusProps) {
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

type GenerateSectionsProps = Array<{numberOfItems: number; indexOffset: number; shouldShow?: boolean}>;

const generateSections = (sections: GenerateSectionsProps) =>
    sections.map(({numberOfItems, indexOffset, shouldShow = true}) => ({
        data: Array.from({length: numberOfItems}, (v, i) => ({
            text: `Item ${i + indexOffset}`,
            keyForList: `item-${i + indexOffset}`,
        })),
        indexOffset,
        shouldShow,
    }));

const singleSectionsConfig = [{numberOfItems: 1000, indexOffset: 0}];

const mutlipleSectionsConfig = [
    {numberOfItems: 1000, indexOffset: 0},
    {numberOfItems: 100, indexOffset: 70},
];
// @ts-expect-error TODO: Remove this once OptionsSelector is migrated to TypeScript.
function OptionsSelectorWrapper(args) {
    const sections = generateSections(singleSectionsConfig);
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
    const scenario = ((screen: RenderResult) => {
        const textInput = screen.getByTestId('options-selector-input');
        fireEvent.changeText(textInput, 'test');
        fireEvent.changeText(textInput, 'test2');
        fireEvent.changeText(textInput, 'test3');
    }) as Awaited<(screen: RenderResult) => Promise<void>>;

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
    const scenario = ((screen: RenderResult) => {
        fireEvent.press(screen.getByText('Item 1'));
        fireEvent.press(screen.getByText('Item 5'));
        fireEvent.press(screen.getByText('Item 10'));
    }) as Awaited<(screen: RenderResult) => Promise<void>>;

    measurePerformance(<OptionsSelectorWrapper />, {scenario});
});

test('[OptionsSelector] should scroll and press few items', () => {
    const sections = generateSections(mutlipleSectionsConfig);

    const generateEventData = (numberOfOptions: number, optionRowHeight: number) => ({
        nativeEvent: {
            contentOffset: {
                y: optionRowHeight * numberOfOptions,
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
    const scenario = async (screen: RenderResult) => {
        fireEvent.press(screen.getByText('Item 10'));
        fireEvent.scroll(screen.getByTestId('options-list'), eventData);
        fireEvent.press(await screen.findByText('Item 100'));
        fireEvent.scroll(screen.getByTestId('options-list'), eventData2);
        fireEvent.press(screen.getByText('Item 200'));
    };

    measurePerformance(<OptionsSelectorWrapper sections={sections} />, {scenario});
});
