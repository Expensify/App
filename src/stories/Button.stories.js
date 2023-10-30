/* eslint-disable react/jsx-props-no-spreading */
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Text from '@components/Text';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/Button',
    component: Button,
};

function Template(args) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Button {...args} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
const Loading = Template.bind({});
function PressOnEnter(props) {
    const [text, setText] = useState('');
    const onPress = useCallback(() => {
        setText('Button Pressed!');
        setTimeout(() => setText(''), 500);
    }, []);
    return (
        <Button
            {...props}
            // eslint-disable-next-line react/prop-types
            text={text || props.text}
            onPress={onPress}
        />
    );
}

function PressOnEnterWithBubbling(props) {
    return (
        <>
            <Text>Both buttons will trigger on press of Enter as the Enter event will bubble across all instances of button.</Text>
            <View style={{flexDirection: 'row', padding: 10}}>
                <PressOnEnter
                    {...props}
                    text="Button A"
                />
                <PressOnEnter
                    {...props}
                    text="Button B"
                />
            </View>
        </>
    );
}

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

PressOnEnterWithBubbling.args = {
    pressOnEnter: true,
    success: true,
    medium: true,
    allowBubble: true,
};

export default story;
export {Default, Loading, PressOnEnter, PressOnEnterWithBubbling};
