import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import Button from '@components/Button';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {NumberWithSymbolFormProps} from '@components/NumberWithSymbolForm';
import ScrollView from '@components/ScrollView';
import withNavigationFallback from '@components/withNavigationFallback';
// eslint-disable-next-line no-restricted-imports
import {defaultStyles} from '@styles/index';
import CONST from '@src/CONST';

type NumberWithSymbolFormStory = StoryFn<typeof NumberWithSymbolForm>;

const NumberWithSymbolFormWithNavigation = withNavigationFallback(NumberWithSymbolForm);

const story: Meta<typeof NumberWithSymbolForm> = {
    title: 'Components/NumberWithSymbolForm',
    component: NumberWithSymbolFormWithNavigation,
};

function Template(props: NumberWithSymbolFormProps) {
    return (
        <ScrollView contentContainerStyle={defaultStyles.flexGrow1}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <NumberWithSymbolFormWithNavigation {...props} />
        </ScrollView>
    );
}

const Default: NumberWithSymbolFormStory = Template.bind({});
Default.args = {
    value: '',
    symbol: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
    symbolPosition: CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX,
    isSymbolPressable: false,
    symbolTextStyle: defaultStyles.textSupporting,
    style: defaultStyles.iouAmountTextInput,
    containerStyle: defaultStyles.iouAmountTextInputContainer,
    footer: (
        <Button
            success
            large
            text="Submit"
            onPress={() => {
                alert('Submitted');
            }}
        />
    ),
};

export default story;
export {Default};
