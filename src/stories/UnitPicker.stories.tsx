import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import UnitPicker from '@components/UnitPicker';
import CONST from '@src/CONST';

type UnitPickerStory = StoryFn<typeof UnitPicker>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof UnitPicker> = {
    title: 'Forms/UnitPicker',
    component: UnitPicker,
};

function Template(props: React.ComponentProps<typeof UnitPicker>) {
    return <UnitPicker {...props} />;
}

const Default: UnitPickerStory = Template.bind({});
Default.args = {
    onOptionSelected: () => {},
};

const Miles: UnitPickerStory = Template.bind({});
Miles.args = {
    defaultValue: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
    onOptionSelected: () => {},
};

export default story;
export {Default, Miles};
