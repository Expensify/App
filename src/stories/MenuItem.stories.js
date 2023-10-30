import React from 'react';
import Chase from '@assets/images/bankicons/chase.svg';
import MenuItem from '@components/MenuItem';
import variables from '@styles/variables';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/MenuItem',
    component: MenuItem,
};

function Template(args) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MenuItem {...args} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
Default.args = {
    title: 'Alberta Bobbeth Charleson',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
};

const Description = Template.bind({});
Description.args = {
    title: 'Alberta Bobbeth Charleson',
    description: 'Account ending in 1111',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
};

const RightIcon = Template.bind({});
RightIcon.args = {
    title: 'Alberta Bobbeth Charleson',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
};

const RightIconAndDescription = Template.bind({});
RightIconAndDescription.args = {
    title: 'Alberta Bobbeth Charleson',
    description: 'Account ending in 1111',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
};

const RightIconAndDescriptionWithLabel = Template.bind({});
RightIconAndDescriptionWithLabel.args = {
    label: 'Account number',
    title: 'Alberta Bobbeth Charleson',
    description: 'Account ending in 1111',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
};

const Selected = Template.bind({});
Selected.args = {
    title: 'Alberta Bobbeth Charleson',
    description: 'Account ending in 1111',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowSelectedState: true,
    isSelected: true,
};

const BadgeText = Template.bind({});
BadgeText.args = {
    title: 'Alberta Bobbeth Charleson',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
    badgeText: '$0.00',
};

const Focused = Template.bind({});
Focused.args = {
    title: 'Alberta Bobbeth Charleson',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
    focused: true,
};

const Disabled = Template.bind({});
Disabled.args = {
    title: 'Alberta Bobbeth Charleson',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
    disabled: true,
};

const BrickRoadIndicatorSuccess = Template.bind({});
BrickRoadIndicatorSuccess.args = {
    title: 'Alberta Bobbeth Charleson',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
    brickRoadIndicator: 'success',
};

const BrickRoadIndicatorFailure = Template.bind({});
BrickRoadIndicatorFailure.args = {
    title: 'Alberta Bobbeth Charleson',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
    brickRoadIndicator: 'error',
};

export default story;
export {
    Default,
    Description,
    RightIcon,
    RightIconAndDescription,
    Selected,
    BadgeText,
    Focused,
    Disabled,
    BrickRoadIndicatorSuccess,
    BrickRoadIndicatorFailure,
    RightIconAndDescriptionWithLabel,
};
