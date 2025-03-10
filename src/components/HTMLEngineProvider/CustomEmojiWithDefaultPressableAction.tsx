import type {ReactNode} from 'react';
import React, {useContext, useRef} from 'react';
import {FABPopoverContext} from '@components/FABPopoverProvider';
import {PressableWithoutFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type CustomEmojiWithDefaultPressableActionProps = {
    /* Key name identifying the emoji */
    emojiKey: string;

    /* Emoji content to render */
    children: ReactNode;
};

function CustomEmojiWithDefaultPressableAction({emojiKey, children}: CustomEmojiWithDefaultPressableActionProps) {
    const styles = useThemeStyles();

    const {toggleCreateMenu} = useContext(FABPopoverContext);
    const localFabRef = useRef<HTMLDivElement>(null);

    const {translate} = useLocalize();

    if (emojiKey === 'actionMenuIcon') {
        return (
            <PressableWithoutFeedback
                onPress={() => toggleCreateMenu(localFabRef)}
                onLongPress={() => {}}
                ref={localFabRef}
                style={[styles.verticalAlignBottom, styles.userSelectNone]}
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
