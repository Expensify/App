/* eslint-disable react/jsx-props-no-spreading */
import React, {useRef} from 'react';
import {Button, View} from 'react-native';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/InteractiveStepSubHeader',
    component: InteractiveStepSubHeader,
};

function Template(args) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <InteractiveStepSubHeader {...args} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});

function BaseInteractiveStepSubHeader(props) {
    const ref = useRef(null);
    return (
        <View>
            <InteractiveStepSubHeader
                {...props}
                ref={ref}
            />
            <Button
                onPress={() => ref.current.moveNext()}
                title="Next"
            />
        </View>
    );
}

Default.args = {
    stepNames: ['Initial', 'Step 1', 'Step 2', 'Step 3'],
    startStep: 1,
    onStepSelected: () => {},
};
BaseInteractiveStepSubHeader.args = {
    stepNames: ['Initial', 'Step 1', 'Step 2', 'Step 3', 'Confirmation'],
    startStep: 0,
    onStepSelected: () => {},
};

export default story;
export {Default, BaseInteractiveStepSubHeader};
