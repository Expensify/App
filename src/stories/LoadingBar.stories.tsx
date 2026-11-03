import Button from '@components/Button';
import LoadingBar from '@components/LoadingBar';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {Meta, StoryFn} from 'storybook-react-rsbuild';

import React, {useState} from 'react';
import {View} from 'react-native';

type LoadingBarStory = StoryFn<typeof LoadingBar>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof LoadingBar> = {
    title: 'Components/LoadingBar',
    component: LoadingBar,
};

function Template() {
    const styles = useThemeStyles();
    const [isLoading, setIsLoading] = useState(true);

    return (
        <View style={[styles.gap5, styles.p5]}>
            {/* The loading bar runs along the bottom edge of a header */}
            <View style={[styles.headerBarHeight, styles.justifyContentCenter, styles.ph5, styles.borderBottom]}>
                <Text>Header</Text>
                {isLoading && <LoadingBar />}
            </View>
            <Button onPress={() => setIsLoading((value) => !value)}>
                <Button.Text>{isLoading ? 'Hide loading bar' : 'Show loading bar'}</Button.Text>
            </Button>
        </View>
    );
}

const Default: LoadingBarStory = Template.bind({});

export default story;
export {Default};
