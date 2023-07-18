import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import Tooltip from '../Tooltip';
import useLocalize from '../../hooks/useLocalize';
import variables from '../../styles/variables';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import getButtonState from '../../libs/getButtonState';
import themeColors from '../../styles/themes/default';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';
import CONST from '../../CONST';

const propTypes = {
    /** The emoji code of the category header */
    code: PropTypes.string.isRequired,

    /** The icon representation of the category that this button links to */
    icon: PropTypes.func.isRequired,

    /** The function to call when an emoji is selected */
    onPress: PropTypes.func.isRequired,
};

function CategoryShortcutButton(props) {
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
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
            >
                <Icon
                    fill={themeColors.icon}
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
