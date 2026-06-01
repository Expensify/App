import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import AnimatedCollapsible from '@components/AnimatedCollapsible';
import Button from '@components/Button';
import Text from '@components/Text';
import CONST from '@src/CONST';

type AnimatedCollapsibleStory = StoryFn<typeof AnimatedCollapsible>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof AnimatedCollapsible> = {
    title: 'Layout/AnimatedCollapsible',
    component: AnimatedCollapsible,
};

function DefaultTemplate() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <AnimatedCollapsible
            isExpanded={isExpanded}
            onPress={() => setIsExpanded((prev) => !prev)}
            header={<Text style={{fontWeight: 'bold'}}>Advanced options</Text>}
            sentryLabel={CONST.SENTRY_LABEL.ACCORDION_SECTION.TOGGLE}
        >
            <Button
                text="Action inside collapsible"
                onPress={() => {}}
            />
        </AnimatedCollapsible>
    );
}

function WithDescriptionTemplate() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <AnimatedCollapsible
            isExpanded={isExpanded}
            onPress={() => setIsExpanded((prev) => !prev)}
            header={<Text style={{fontWeight: 'bold'}}>Workspace settings</Text>}
            description={<Text>Manage members, categories, and more.</Text>}
            sentryLabel={CONST.SENTRY_LABEL.ACCORDION_SECTION.TOGGLE}
        >
            <Text>These settings control the workspace behavior.</Text>
        </AnimatedCollapsible>
    );
}

const Default: AnimatedCollapsibleStory = DefaultTemplate.bind({});
const WithDescription: AnimatedCollapsibleStory = WithDescriptionTemplate.bind({});

export default story;
export {Default, WithDescription};
