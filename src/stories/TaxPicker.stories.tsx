import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import TaxPicker from '@components/TaxPicker';

type TaxPickerStory = StoryFn<typeof TaxPicker>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof TaxPicker> = {
    title: 'Forms/TaxPicker',
    component: TaxPicker,
};

function Template(props: React.ComponentProps<typeof TaxPicker>) {
    return <TaxPicker {...props} />;
}

// Note: TaxPicker reads policy/transaction data from Onyx. Without Onyx data populated,
// the list renders empty. This story shows the empty-state UI.
const Default: TaxPickerStory = Template.bind({});
Default.args = {
    onSubmit: () => {},
    onDismiss: () => {},
};

export default story;
export {Default};
