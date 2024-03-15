import type {ComponentMeta, ComponentStory} from '@storybook/react';
import React from 'react';
import type {HeaderProps} from '@components/Header';
import Header from '@components/Header';

type HeaderStory = ComponentStory<typeof Header>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: ComponentMeta<typeof Header> = {
    title: 'Components/Header',
    component: Header,
};

function Template(props: HeaderProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Header {...props} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: HeaderStory = Template.bind({});
Default.args = {
    title: 'Chats',
    shouldShowEnvironmentBadge: true,
};

export default story;
export {Default};
