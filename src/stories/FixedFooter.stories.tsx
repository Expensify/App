import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';

type FixedFooterStory = StoryFn<typeof FixedFooter>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof FixedFooter> = {
    title: 'Layout/FixedFooter',
    component: FixedFooter,
};

function Template(props: React.ComponentProps<typeof FixedFooter>) {
    return (
        <FixedFooter {...props}>
            <Button
                text="Save & Continue"
                success
            />
        </FixedFooter>
    );
}

const Default: FixedFooterStory = Template.bind({});
Default.args = {};

const WithBottomPadding: FixedFooterStory = Template.bind({});
WithBottomPadding.args = {
    addBottomSafeAreaPadding: true,
};

export default story;
export {Default, WithBottomPadding};
