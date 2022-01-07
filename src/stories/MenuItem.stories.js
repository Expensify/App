import React from 'react';
import MenuItem from '../components/MenuItem';
import Chase from '../../assets/images/bankicons/chase.svg';
import variables from '../styles/variables';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/MenuItem',
    component: MenuItem,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <MenuItem {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
Default.args = {
    title: 'Alberta Bobbeth Charleson',
    description: 'Account ending in 1111',
    shouldShowSelectedState: true,
    isSelected: true,
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
};

export default story;
export {
    Default,
};
