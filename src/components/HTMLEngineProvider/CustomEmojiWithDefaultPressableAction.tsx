import type {ReactNode} from 'react';
import React, {useContext, useEffect, useState} from 'react';
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

    const {isCreateMenuActive, toggleCreateMenu} = useContext(FABPopoverContext);
    const [isFabActionActive, setIsFabActionActive] = useState(isCreateMenuActive);
    useEffect(() => {
        setIsFabActionActive(isCreateMenuActive);
    }, [isCreateMenuActive]);
    const {translate} = useLocalize();

    if (emojiKey === 'actionMenuIcon') {
        return (
            <PressableWithoutFeedback
                onPress={() => toggleCreateMenu(isFabActionActive)}
                onLongPress={() => {}}
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
