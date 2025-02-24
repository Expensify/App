import type {ReactNode} from 'react';
import React, {useContext, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text, View} from 'react-native';
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
    const {isCreateMenuActive, setIsCreateMenuActive, fabRef} = useContext(FABPopoverContext);
    const {translate} = useLocalize();
    const buttonRef = useRef<HTMLDivElement | View | Text | null>(fabRef.current);
    const fabPressable = useRef<HTMLDivElement | View | Text | null>(null);
    const toggleFabAction = () => {
        // Drop focus to avoid blue focus ring.
        if (fabPressable.current instanceof HTMLDivElement || fabPressable.current instanceof HTMLInputElement) {
            fabPressable.current.blur();
        }
        setIsCreateMenuActive(!isCreateMenuActive);
    };

    if (emojiKey === 'actionMenuIcon') {
        return (
            <PressableWithoutFeedback
                ref={(el) => {
                    fabPressable.current = el ?? null;
                    if (buttonRef && 'current' in buttonRef) {
                        buttonRef.current = el ?? null;
                    }
                }}
                onPress={toggleFabAction}
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
