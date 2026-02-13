/* eslint-disable react/jsx-props-no-spreading */
import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import type {ButtonProps} from '@components/Button';
import Button from '@components/Button';
import Text from '@components/Text';

type ButtonStory = StoryFn<typeof Button>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof Button> = {
    title: 'Components/Button',
    component: Button,
};

function Template(props: ButtonProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Button {...props} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: ButtonStory = Template.bind({});
const Loading: ButtonStory = Template.bind({});
function PressOnEnter(props: ButtonProps) {
    const [text, setText] = useState('');
    const onPress = useCallback(() => {
        setText('Button Pressed!');
        setTimeout(() => setText(''), 500);
    }, []);
    return (
        <Button
            {...props}
            // eslint-disable-next-line react/prop-types
            text={text}
            onPress={onPress}
        />
    );
}

function PressOnEnterWithBubbling(props: ButtonProps) {
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
