/* eslint-disable react/jsx-props-no-spreading */
import React, {useRef} from 'react';
import type {ForwardedRef} from 'react';
import {Button, View} from 'react-native';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import type {InteractiveStepSubHeaderHandle, InteractiveStepSubHeaderProps} from '@components/InteractiveStepSubHeader';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/InteractiveStepSubHeader',
    component: InteractiveStepSubHeader,
};

type StoryType = typeof Template & {args?: Partial<InteractiveStepSubHeaderProps>};

function Template(args: InteractiveStepSubHeaderProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <InteractiveStepSubHeader {...args} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
function BaseInteractiveStepSubHeader(props: InteractiveStepSubHeaderProps) {
    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);

    return (
        <View>
            <InteractiveStepSubHeader
                {...props}
                ref={ref}
            />
            <Button
                onPress={() => ref.current?.moveNext()}
                title="Next"
            />
        </View>
    );
}

const Default: StoryType = Template.bind({});
Default.args = {
    stepNames: ['Initial', 'Step 1', 'Step 2', 'Step 3'],
    startStepIndex: 1,
    onStepSelected: () => {},
};

BaseInteractiveStepSubHeader.args = {
    stepNames: ['Initial', 'Step 1', 'Step 2', 'Step 3', 'Confirmation'],
    startStepIndex: 0,
    onStepSelected: () => {},
};

export default story;
export {Default, BaseInteractiveStepSubHeader};
