import React, {useState} from 'react';
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

const Template = (args) => {
    const [value, setValue] = useState('');
    return (
        <AddressSearch
            value={value}
            onChange={({street}) => setValue(street)}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
        />
    );
};

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});

const ErrorStory = Template.bind({});
ErrorStory.args = {
    errorText: 'The street you are looking for does not exist',
};

export {
    Default,
    ErrorStory,
};
