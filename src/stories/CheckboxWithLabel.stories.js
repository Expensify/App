import React from 'react';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import Text from '@components/Text';
import styles from '@styles/styles';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/CheckboxWithLabel',
    component: CheckboxWithLabel,
};

function Template(args) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <CheckboxWithLabel {...args} />;
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
const WithLabelComponent = Template.bind({});
const WithErrors = Template.bind({});
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
            <Text style={[styles.textLarge]}>Test</Text>
            <Text style={[styles.textMicroBold]}> Test </Text>
            <Text style={[styles.textMicroSupporting]}>Test</Text>
        </>
    ),
};

WithErrors.args = {
    isChecked: false,
    hasError: true,
    errorText: 'Please accept Terms before continuing.',
    onInputChange: () => {},
    label: 'I accept the Terms & Conditions',
};

export default story;
export {Default, WithLabelComponent, WithErrors};
