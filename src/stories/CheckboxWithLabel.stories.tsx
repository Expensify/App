import type {ComponentMeta, ComponentStory} from '@storybook/react';
import React from 'react';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import type {CheckboxWithLabelProps} from '@components/CheckboxWithLabel';
import Text from '@components/Text';
// eslint-disable-next-line no-restricted-imports
import {defaultStyles} from '@styles/index';

type CheckboxWithLabelStory = ComponentStory<typeof CheckboxWithLabel>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: ComponentMeta<typeof CheckboxWithLabel> = {
    title: 'Components/CheckboxWithLabel',
    component: CheckboxWithLabel,
};

function Template(props: CheckboxWithLabelProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <CheckboxWithLabel {...props} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default: CheckboxWithLabelStory = Template.bind({});
const WithLabelComponent: CheckboxWithLabelStory = Template.bind({});
const WithErrors: CheckboxWithLabelStory = Template.bind({});
Default.args = {
    isChecked: true,
    label: 'Plain text label',
    onInputChange: () => {},
};

WithLabelComponent.args = {
    isChecked: true,
    onInputChange: () => {},
    LabelComponent: () => (
        <>
            <Text style={[defaultStyles.textLarge]}>Test</Text>
            <Text style={[defaultStyles.textMicroBold]}> Test </Text>
            <Text style={[defaultStyles.textMicroSupporting]}>Test</Text>
        </>
    ),
};

WithErrors.args = {
    isChecked: false,
    errorText: 'Please accept Terms before continuing.',
    onInputChange: () => {},
    label: 'I accept the Terms & Conditions',
};

export default story;
export {Default, WithLabelComponent, WithErrors};
