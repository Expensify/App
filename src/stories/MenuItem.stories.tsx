import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import Chase from '@assets/images/bank-icons/chase.svg';
import MenuItem from '@components/MenuItem';
import type {MenuItemProps} from '@components/MenuItem';
import variables from '@styles/variables';

type MenuItemStory = StoryFn<typeof MenuItem>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof MenuItem> = {
    title: 'Components/MenuItem',
    component: MenuItem,
    args: {
        interactive: true,
    },
};

function Template(props: MenuItemProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MenuItem {...props} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: MenuItemStory = Template.bind({});
Default.args = {
    title: 'Alberta Bobbeth Charleson',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
};

const Description: MenuItemStory = Template.bind({});
Description.args = {
    title: 'Alberta Bobbeth Charleson',
    description: 'Account ending in 1111',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
};

const RightIcon: MenuItemStory = Template.bind({});
RightIcon.args = {
    title: 'Alberta Bobbeth Charleson',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
};

const RightIconAndDescription: MenuItemStory = Template.bind({});
RightIconAndDescription.args = {
    title: 'Alberta Bobbeth Charleson',
    description: 'Account ending in 1111',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
};

const RightIconAndDescriptionWithLabel: MenuItemStory = Template.bind({});
RightIconAndDescriptionWithLabel.args = {
    label: 'Account number',
    title: 'Alberta Bobbeth Charleson',
    description: 'Account ending in 1111',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
};

const Selected: MenuItemStory = Template.bind({});
Selected.args = {
    title: 'Alberta Bobbeth Charleson',
    description: 'Account ending in 1111',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowSelectedState: true,
    isSelected: true,
};

const BadgeText: MenuItemStory = Template.bind({});
BadgeText.args = {
    title: 'Alberta Bobbeth Charleson',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
    badgeText: '$0.00',
};

const Focused: MenuItemStory = Template.bind({});
Focused.args = {
    title: 'Alberta Bobbeth Charleson',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
    focused: true,
};

const Disabled: MenuItemStory = Template.bind({});
Disabled.args = {
    title: 'Alberta Bobbeth Charleson',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
    disabled: true,
};

const BrickRoadIndicatorInfo: MenuItemStory = Template.bind({});
BrickRoadIndicatorInfo.args = {
    title: 'Alberta Bobbeth Charleson',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
    brickRoadIndicator: 'info',
};

const BrickRoadIndicatorFailure: MenuItemStory = Template.bind({});
BrickRoadIndicatorFailure.args = {
    title: 'Alberta Bobbeth Charleson',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
    brickRoadIndicator: 'error',
};

const ErrorMessage: MenuItemStory = Template.bind({});
ErrorMessage.args = {
    title: 'Alberta Bobbeth Charleson',
    icon: Chase,
    iconHeight: variables.iconSizeExtraLarge,
    iconWidth: variables.iconSizeExtraLarge,
    shouldShowRightIcon: true,
    errorText: 'Error text which describes the error',
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
    BrickRoadIndicatorInfo,
    BrickRoadIndicatorFailure,
    RightIconAndDescriptionWithLabel,
    ErrorMessage,
};
