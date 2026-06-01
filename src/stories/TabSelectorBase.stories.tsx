import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';

type TabSelectorBaseStory = StoryFn<typeof TabSelectorBase>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof TabSelectorBase> = {
    title: 'Layout/TabSelectorBase',
    component: TabSelectorBase,
};

const TABS: TabSelectorBaseItem[] = [
    {key: 'manual', title: 'Manual', sentryLabel: 'TabManual'},
    {key: 'scan', title: 'Scan', sentryLabel: 'TabScan'},
    {key: 'distance', title: 'Distance', sentryLabel: 'TabDistance'},
];

function Template(props: React.ComponentProps<typeof TabSelectorBase>) {
    const [activeTabKey, setActiveTabKey] = useState(props.activeTabKey);
    return (
        <TabSelectorContextProvider activeTabKey={activeTabKey}>
            <TabSelectorBase
                {...props}
                activeTabKey={activeTabKey}
                onTabPress={(key) => setActiveTabKey(key)}
            />
        </TabSelectorContextProvider>
    );
}

const Default: TabSelectorBaseStory = Template.bind({});
Default.args = {
    tabs: TABS,
    activeTabKey: 'manual',
};

export default story;
export {Default};
