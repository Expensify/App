import React from 'react';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/ButtonWithDropdownMenu',
    component: ButtonWithDropdownMenu,
};

function Template(args) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ButtonWithDropdownMenu {...args} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
Default.args = {
    buttonText: 'Pay using Expensify',
    onPress: (e, item) => {
        alert(`Button ${item} is pressed.`);
    },
    pressOnEnter: true,
    options: [
        {value: 'One', text: 'One'},
        {value: 'Two', text: 'Two'},
    ],
};

export default story;
export {Default};
