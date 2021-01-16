import Header from '../components/Header';

export default {
    title: 'Components/Header',
    component: Header,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <Header {...args} />;

export const Default = Template.bind({});

Default.args = {
    textSize: 'large',
    title: 'Chats',
};
