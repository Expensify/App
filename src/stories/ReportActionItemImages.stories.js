import React from 'react';
import ReportActionItemImages from '../components/ReportActionItem/ReportActionItemImages';
import PressableWithoutFeedback from '../components/Pressable/PressableWithoutFeedback';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/ReportActionItemImages',
    component: ReportActionItemImages,
};

function Template(args) {
    return (
        <PressableWithoutFeedback
            accessibilityLabel="ReportActionItemImages Story"
            style={{flex: 1}}
        >
            {({hovered}) => (
                <ReportActionItemImages
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...args}
                    isHovered={hovered}
                />
            )}
        </PressableWithoutFeedback>
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});
Default.args = {
    images: [{image: 'https://c02.purpledshub.com/uploads/sites/41/2021/05/sleeping-cat-27126ee.jpg', thumbnail: ''}],
    size: 1,
    total: 1,
};

const TwoImages = Template.bind({});
TwoImages.args = {
    images: [
        {
            image: 'https://c02.purpledshub.com/uploads/sites/41/2021/05/sleeping-cat-27126ee.jpg',
            thumbnail: '',
        },
        {
            image: 'https://i.guim.co.uk/img/media/7d04c4cb7510a4bd9a8bec449f53425aeccee895/298_266_1150_690/master/1150.jpg?width=1200&quality=85&auto=format&fit=max&s=4ae508ecb99c15ec04610b617efb3fa7',
            thumbnail: '',
        },
    ],
    size: 2,
    total: 2,
};

const ThreeImages = Template.bind({});
ThreeImages.args = {
    images: [
        {
            image: 'https://c02.purpledshub.com/uploads/sites/41/2021/05/sleeping-cat-27126ee.jpg',
            thumbnail: '',
        },
        {
            image: 'https://i.guim.co.uk/img/media/7d04c4cb7510a4bd9a8bec449f53425aeccee895/298_266_1150_690/master/1150.jpg?width=1200&quality=85&auto=format&fit=max&s=4ae508ecb99c15ec04610b617efb3fa7',
            thumbnail: '',
        },
        {
            image: 'https://cdn.theatlantic.com/thumbor/d8lh_KAZuOgBYslMOP4T0iu9Fks=/0x62:2000x1187/1600x900/media/img/mt/2018/03/AP_325360162607/original.jpg',
            thumbnail: '',
        },
    ],
    size: 3,
    total: 3,
};

const FourImages = Template.bind({});
FourImages.args = {
    images: [
        {
            image: 'https://c02.purpledshub.com/uploads/sites/41/2021/05/sleeping-cat-27126ee.jpg',
            thumbnail: '',
        },
        {
            image: 'https://i.guim.co.uk/img/media/7d04c4cb7510a4bd9a8bec449f53425aeccee895/298_266_1150_690/master/1150.jpg?width=1200&quality=85&auto=format&fit=max&s=4ae508ecb99c15ec04610b617efb3fa7',
            thumbnail: '',
        },
        {
            image: 'https://cdn.theatlantic.com/thumbor/d8lh_KAZuOgBYslMOP4T0iu9Fks=/0x62:2000x1187/1600x900/media/img/mt/2018/03/AP_325360162607/original.jpg',
            thumbnail: '',
        },
        {
            image: 'https://www.alleycat.org/wp-content/uploads/2019/03/FELV-cat.jpg',
            thumbnail: '',
        },
    ],
    size: 4,
    total: 4,
};

const ThreePlusTwoImages = Template.bind({});
ThreePlusTwoImages.args = {
    images: [
        {
            image: 'https://c02.purpledshub.com/uploads/sites/41/2021/05/sleeping-cat-27126ee.jpg',
            thumbnail: '',
        },
        {
            image: 'https://i.guim.co.uk/img/media/7d04c4cb7510a4bd9a8bec449f53425aeccee895/298_266_1150_690/master/1150.jpg?width=1200&quality=85&auto=format&fit=max&s=4ae508ecb99c15ec04610b617efb3fa7',
            thumbnail: '',
        },
        {
            image: 'https://cdn.theatlantic.com/thumbor/d8lh_KAZuOgBYslMOP4T0iu9Fks=/0x62:2000x1187/1600x900/media/img/mt/2018/03/AP_325360162607/original.jpg',
            thumbnail: '',
        },
    ],
    size: 3,
    total: 5,
};

const ThreePlusTenImages = Template.bind({});
ThreePlusTenImages.args = {
    images: [
        {
            image: 'https://c02.purpledshub.com/uploads/sites/41/2021/05/sleeping-cat-27126ee.jpg',
            thumbnail: '',
        },
        {
            image: 'https://i.guim.co.uk/img/media/7d04c4cb7510a4bd9a8bec449f53425aeccee895/298_266_1150_690/master/1150.jpg?width=1200&quality=85&auto=format&fit=max&s=4ae508ecb99c15ec04610b617efb3fa7',
            thumbnail: '',
        },
        {
            image: 'https://cdn.theatlantic.com/thumbor/d8lh_KAZuOgBYslMOP4T0iu9Fks=/0x62:2000x1187/1600x900/media/img/mt/2018/03/AP_325360162607/original.jpg',
            thumbnail: '',
        },
    ],
    size: 3,
    total: 13,
};

export default story;
export {Default, TwoImages, ThreeImages, FourImages, ThreePlusTwoImages, ThreePlusTenImages};
