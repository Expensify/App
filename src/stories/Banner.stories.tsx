import type {StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import type {BannerProps} from '@components/Banner';
import Banner from '@components/Banner';

type BannerStory = StoryFn<typeof Banner>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/Banner',
    component: Banner,
};

function Template(props: BannerProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Banner {...props} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const InfoBanner: BannerStory = Template.bind({});
InfoBanner.args = {
    text: 'This is an informational banner',
};

const HTMLBanner: BannerStory = Template.bind({});
HTMLBanner.args = {
    text: 'This is a informational banner containing <strong><em>HTML</em></strong>',
    shouldRenderHTML: true,
};

const BannerWithLink: BannerStory = Template.bind({});
BannerWithLink.args = {
    text: 'This is a informational banner containing <a href="https://new.expensify.com/settings">internal Link</a> and <a href=" https://google.com">public link</a>',
    shouldRenderHTML: true,
};

export default story;
export {InfoBanner, HTMLBanner, BannerWithLink};
