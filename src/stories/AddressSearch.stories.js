import React from 'react';
import AddressSearch from '../components/AddressSearch';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
export default {
    title: 'Components/AddressSearch',
    component: AddressSearch,
    args: {
        label: 'Enter street',
        errorText: '',
    },
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <AddressSearch {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});

const ErrorStory = Template.bind({});
ErrorStory.args = {
    errorText: 'The street you looking for is not exist',
};

export {
    Default,
    ErrorStory,
};
