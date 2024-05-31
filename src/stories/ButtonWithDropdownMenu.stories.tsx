import type {StoryFn} from '@storybook/react';
import React from 'react';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {ButtonWithDropdownMenuProps} from '@components/ButtonWithDropdownMenu/types';
import * as Expensicons from '@components/Icon/Expensicons';

type ButtonWithDropdownMenuStory = StoryFn<typeof ButtonWithDropdownMenu>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/ButtonWithDropdownMenu',
    component: ButtonWithDropdownMenu,
};

function Template(props: ButtonWithDropdownMenuProps<unknown>) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ButtonWithDropdownMenu {...props} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: ButtonWithDropdownMenuStory = Template.bind({});
Default.args = {
    customText: 'Pay with Expensify',
    onPress: (e, item) => {
        alert(`Button ${item as string} is pressed.`);
    },
    pressOnEnter: true,
    options: [
        {value: 'One', text: 'One', icon: Expensicons.Wallet},
        {value: 'Two', text: 'Two', icon: Expensicons.Wallet},
    ],
};

export default story;
export {Default};
