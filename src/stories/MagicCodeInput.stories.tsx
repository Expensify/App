import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import MagicCodeInput from '@components/MagicCodeInput';
import type {MagicCodeInputProps} from '@components/MagicCodeInput';

type MagicCodeInputStory = StoryFn<typeof MagicCodeInput>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof MagicCodeInput> = {
    title: 'Components/MagicCodeInput',
    component: MagicCodeInput,
};

function Template(props: MagicCodeInputProps) {
    const [value, setValue] = useState('');
    return (
        <MagicCodeInput
            value={value}
            onChangeText={setValue}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args

const AutoFocus: MagicCodeInputStory = Template.bind({});
AutoFocus.args = {
    name: 'AutoFocus',
    autoFocus: true,
    autoComplete: 'one-time-code',
};

const SubmitOnComplete: MagicCodeInputStory = Template.bind({});
SubmitOnComplete.args = {
    name: 'SubmitOnComplete',
    autoComplete: 'one-time-code',
    shouldSubmitOnComplete: true,
    onFulfill: () => console.debug('Submitted!'),
};

export default story;
export {AutoFocus, SubmitOnComplete};
