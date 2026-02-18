import React, {useState} from 'react';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';

type CategoryShortcutButtonProps = {
    /** The emoji code of the category header */
    code: string;

    /** The icon representation of the category that this button links to */
    icon: IconAsset;

    /** The function to call when an emoji is selected */
    onPress: () => void;
};

function CategoryShortcutButton({code, icon, onPress}: CategoryShortcutButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const [isHighlighted, setIsHighlighted] = useState(false);

    return (
        <Tooltip
            text={translate(`emojiPicker.headers.${code}` as TranslationPaths)}
            shiftVertical={-4}
        >
            <PressableWithoutFeedback
                shouldUseAutoHitSlop={false}
                onPress={onPress}
                onHoverIn={() => setIsHighlighted(true)}
                onHoverOut={() => setIsHighlighted(false)}
                style={({pressed}) => [StyleUtils.getButtonBackgroundColorStyle(getButtonState(false, pressed)), styles.categoryShortcutButton, isHighlighted && styles.emojiItemHighlighted]}
                accessibilityLabel={translate(`emojiPicker.headers.${code}` as TranslationPaths)}
                role={CONST.ROLE.BUTTON}
                sentryLabel={CONST.SENTRY_LABEL.EMOJI_PICKER.CATEGORY_SHORTCUT}
            >
                <Icon
                    fill={theme.icon}
                    src={icon}
                    height={variables.iconSizeNormal}
                    width={variables.iconSizeNormal}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

CategoryShortcutButton.displayName = 'CategoryShortcutButton';

export default React.memo(CategoryShortcutButton);
