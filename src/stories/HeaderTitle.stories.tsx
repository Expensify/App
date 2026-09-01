import HeaderTitle from '@components/HeaderTitle';
import type {HeaderProps} from '@components/HeaderTitle/HeaderTitle';

import type {Meta, StoryFn} from 'storybook-react-rsbuild';

import React from 'react';

type HeaderTitleStory = StoryFn<typeof HeaderTitle>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof HeaderTitle> = {
    title: 'Components/HeaderTitle',
    component: HeaderTitle,
};

function Template(props: HeaderProps) {
    return (
        <HeaderTitle {...props}>
            <HeaderTitle.Text>Chats</HeaderTitle.Text>
        </HeaderTitle>
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: HeaderTitleStory = Template.bind({});
Default.args = {};

export default story;
export {Default};
