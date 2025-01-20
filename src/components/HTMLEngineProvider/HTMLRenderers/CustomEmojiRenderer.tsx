import React from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import FloatingActionEmoji from '@pages/home/sidebar/SidebarScreen/FloatingActionEmoji';

function CustomEmojiRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    if (tnode.attributes.emoji === 'action-menu-icon') {
        return <FloatingActionEmoji />;
    }

    return '';
}

export default CustomEmojiRenderer;
