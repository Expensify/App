import md5 from '../../libs/md5';
import Avatar from './Avatar';
import CONST from '../../CONST';

export default {
    title: 'Components/Avatar',
    component: Avatar,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = args => <Avatar {...args} />;

export const Default = Template.bind({});

const loginHashBucket = (parseInt(md5('test@test.com').substring(0, 4), 16) % 8) + 1;
const avatarUrl = `${CONST.CLOUDFRONT_URL}/images/avatars/avatar_${loginHashBucket}.png`;

Default.args = {
    source: avatarUrl,
    showIndicator: true,
    isIndicatorActive: true,
};
