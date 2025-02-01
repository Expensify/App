import type {ReactNode} from 'react';
import React from 'react';
import FloatingActionButtonAndPopover from '@pages/home/sidebar/SidebarScreen/FloatingActionButtonAndPopover';

type CustomEmojiWithDefaultPressableActionProps = {
    /* Key name identifying the emoji */
    emojiKey: string;

    /* Emoji content to render */
    children: ReactNode;
};

function CustomEmojiWithDefaultPressableAction({emojiKey, children}: CustomEmojiWithDefaultPressableActionProps) {
    if (emojiKey === 'actionMenuIcon') {
        return <FloatingActionButtonAndPopover isEmoji>{children}</FloatingActionButtonAndPopover>;
    }

    return children;
}

export default CustomEmojiWithDefaultPressableAction;
