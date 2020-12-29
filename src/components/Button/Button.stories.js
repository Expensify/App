import Button from './Button';

export default {
    title: 'Components/Button',
    component: Button,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <Button {...args} />;

export const Default = Template.bind({});

Default.args = {
    size: 'large',
    isLoading: false,
    text: 'Submit',
};
