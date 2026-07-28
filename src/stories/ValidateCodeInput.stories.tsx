import ValidateCodeInput from '@components/ValidateCodeInput';
import type {ValidateCodeInputProps} from '@components/ValidateCodeInput';

import CONST from '@src/CONST';

import type {Meta, StoryFn} from 'storybook-react-rsbuild';

import React, {useState} from 'react';

type ValidateCodeInputStory = StoryFn<typeof ValidateCodeInput>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof ValidateCodeInput> = {
    title: 'Components/ValidateCodeInput',
    component: ValidateCodeInput,
};

function Template(props: ValidateCodeInputProps) {
    const [value, setValue] = useState('');
    return (
        <ValidateCodeInput
            value={value}
            onChangeText={setValue}
            {...props}
        />
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args

const AutoFocus: ValidateCodeInputStory = Template.bind({});
AutoFocus.args = {
    name: 'AutoFocus',
    autoFocus: true,
    autoComplete: CONST.AUTO_COMPLETE_VARIANTS.ONE_TIME_CODE,
};

const SubmitOnComplete: ValidateCodeInputStory = Template.bind({});
SubmitOnComplete.args = {
    name: 'SubmitOnComplete',
    autoComplete: CONST.AUTO_COMPLETE_VARIANTS.ONE_TIME_CODE,
    shouldSubmitOnComplete: true,
    onFulfill: () => console.debug('Submitted!'),
};

export default story;
export {AutoFocus, SubmitOnComplete};
