import React from 'react';
import Banner from '../components/Banner';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/Banner',
    component: Banner,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <Banner {...args} />;

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const InfoBanner = Template.bind({});
InfoBanner.args = {
    text: 'This is an informational banner',
};

const HTMLBanner = Template.bind({});
HTMLBanner.args = {
    text: 'This is a informational banner containing <strong><em>HTML</em></strong>',
    shouldRenderHTML: true,
};

const BannerWithLink = Template.bind({});
BannerWithLink.args = {
    text: 'This is a informational banner containing <a href="https://new.expensify.com/settings">internal Link</a> and <a href=" https://google.com">public link</a>',
    shouldRenderHTML: true,
};

export default story;
export {
    InfoBanner,
    HTMLBanner,
    BannerWithLink,
};
