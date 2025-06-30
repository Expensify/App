import type {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import NumberWithUnitForm from '@components/NumberWithUnitForm';
import type {NumberWithUnitFormProps} from '@components/NumberWithUnitForm';
import withNavigationFallback from '@components/withNavigationFallback';
import CONST from '@src/CONST';

type NumberWithUnitFormStory = StoryFn<typeof NumberWithUnitForm>;

const NumberWithUnitFormWithNavigation = withNavigationFallback(NumberWithUnitForm);

const story: Meta<typeof NumberWithUnitForm> = {
    title: 'Components/NumberWithUnitForm',
    component: NumberWithUnitFormWithNavigation,
};

function Template(props: NumberWithUnitFormProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <NumberWithUnitFormWithNavigation {...props} />;
}

const Default: NumberWithUnitFormStory = Template.bind({});
Default.args = {
    unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
};

export default story;
export {Default};
