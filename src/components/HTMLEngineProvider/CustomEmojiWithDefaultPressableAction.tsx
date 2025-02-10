import type {ReactNode} from 'react';
import React, {useContext} from 'react';
import {FABPopoverContext} from '@components/FABPopoverProvider';
import {PressableWithoutFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';

type CustomEmojiWithDefaultPressableActionProps = {
    /* Key name identifying the emoji */
    emojiKey: string;

    /* Emoji content to render */
    children: ReactNode;
};

function CustomEmojiWithDefaultPressableAction({emojiKey, children}: CustomEmojiWithDefaultPressableActionProps) {
    const {isCreateMenuActive, setIsCreateMenuActive} = useContext(FABPopoverContext);
    const {translate} = useLocalize();

    if (emojiKey === 'actionMenuIcon') {
        return (
            <PressableWithoutFeedback
                onPress={() => setIsCreateMenuActive(!isCreateMenuActive)}
                onLongPress={() => {}}
                style={{verticalAlign: 'bottom'}}
                role={CONST.ROLE.BUTTON}
                shouldUseHapticsOnLongPress={false}
                accessibilityLabel={translate('sidebarScreen.fabNewChatExplained')}
            >
                {children}
            </PressableWithoutFeedback>
        );
    }

    return children;
}

export default CustomEmojiWithDefaultPressableAction;
