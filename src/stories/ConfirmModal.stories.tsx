/* eslint-disable @typescript-eslint/no-deprecated */
import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';

type ConfirmModalStory = StoryFn<typeof ConfirmModal>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof ConfirmModal> = {
    title: 'Overlays & Menus/ConfirmModal',
    component: ConfirmModal,
};

function Template(props: React.ComponentProps<typeof ConfirmModal>) {
    const [isVisible, setIsVisible] = useState(props.isVisible);
    return (
        <ConfirmModal
            {...props}
            isVisible={isVisible}
            onConfirm={() => setIsVisible(false)}
            onCancel={() => setIsVisible(false)}
        />
    );
}

const Default: ConfirmModalStory = Template.bind({});
Default.args = {
    isVisible: true,
    title: 'Are you sure?',
    prompt: 'This action cannot be undone.',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    success: true,
};

const Danger: ConfirmModalStory = Template.bind({});
Danger.args = {
    isVisible: true,
    title: 'Delete item',
    prompt: 'Are you sure you want to delete this item? This action is permanent.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    danger: true,
};

export default story;
export {Default, Danger};
