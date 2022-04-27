import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import Button from '../components/Button';
import Text from '../components/Text';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/Button',
    component: Button,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <Button {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
const Loading = Template.bind({});
const PressOnEnter = (props) => {
    const [text, setText] = useState('');
    const onPress = useCallback(() => {
        setText('Button Pressed!');
        setTimeout(() => setText(''), 500);
    });
    return (
        <Button
        // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        // eslint-disable-next-line react/prop-types
            text={text || props.text}
            onPress={onPress}
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
export {
    Default,
    Loading,
    PressOnEnter,
};
