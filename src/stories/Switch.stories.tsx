import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import Switch from '@components/Switch';

type SwitchStory = StoryFn<typeof Switch>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof Switch> = {
    title: 'Forms/Switch',
    component: Switch,
};

function Template(props: React.ComponentProps<typeof Switch>) {
    const [isOn, setIsOn] = useState(props.isOn);
    return (
        <Switch
            {...props}
            isOn={isOn}
            onToggle={setIsOn}
        />
    );
}

const Default: SwitchStory = Template.bind({});
Default.args = {
    isOn: true,
    accessibilityLabel: 'Toggle setting',
};

export default story;
export {Default};
