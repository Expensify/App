import React from 'react';
import SelectionListRadio from '../components/SelectionListRadio';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/SelectionListRadio',
    component: SelectionListRadio,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = (args) => <SelectionListRadio {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
const Loading = Template.bind({});
const PressOnEnter = (props) => {
    return (
        <SelectionListRadio
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
};

Default.args = {
    text: 'Save & Continue',
    success: true,
};
Loading.args = {
    text: 'Save & Continue',
    isLoading: true,
    success: true,
};

PressOnEnter.args = {
    text: 'Press Enter',
    pressOnEnter: true,
    success: true,
};

export default story;
export {Default, Loading, PressOnEnter};
