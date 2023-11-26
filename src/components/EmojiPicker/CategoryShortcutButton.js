import PropTypes from 'prop-types';
import React, {useState} from 'react';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import getButtonState from '@libs/getButtonState';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

const propTypes = {
    /** The emoji code of the category header */
    code: PropTypes.string.isRequired,

    /** The icon representation of the category that this button links to */
    icon: PropTypes.func.isRequired,

    /** The function to call when an emoji is selected */
    onPress: PropTypes.func.isRequired,
};

function CategoryShortcutButton(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isHighlighted, setIsHighlighted] = useState(false);

    return (
        <Tooltip
            text={translate(`emojiPicker.headers.${props.code}`)}
            shiftVertical={-4}
        >
            <PressableWithoutFeedback
                shouldUseAutoHitSlop={false}
                onPress={props.onPress}
                onHoverIn={() => setIsHighlighted(true)}
                onHoverOut={() => setIsHighlighted(false)}
                style={({pressed}) => [StyleUtils.getButtonBackgroundColorStyle(getButtonState(false, pressed)), styles.categoryShortcutButton, isHighlighted && styles.emojiItemHighlighted]}
                accessibilityLabel={`emojiPicker.headers.${props.code}`}
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
            >
                <Icon
                    fill={theme.icon}
                    src={props.icon}
                    height={variables.iconSizeNormal}
                    width={variables.iconSizeNormal}
                />
            </PressableWithoutFeedback>
        </Tooltip>
    );
}
CategoryShortcutButton.propTypes = propTypes;
CategoryShortcutButton.displayName = 'CategoryShortcutButton';
export default React.memo(CategoryShortcutButton);
