import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import Tooltip from '../Tooltip';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
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

    ...withLocalizePropTypes,
};

class CategoryShortcutButton extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isHighlighted: false,
        };
    }

    render() {
        return (
            <Tooltip
                text={this.props.translate(`emojiPicker.headers.${this.props.code}`)}
                shiftVertical={-4}
            >
                <PressableWithoutFeedback
                    shouldUseAutoHitSlop={false}
                    onPress={this.props.onPress}
                    onHoverIn={() => this.setState({isHighlighted: true})}
                    onHoverOut={() => this.setState({isHighlighted: false})}
                    style={({pressed}) => [
                        StyleUtils.getButtonBackgroundColorStyle(getButtonState(false, pressed)),
                        styles.categoryShortcutButton,
                        this.state.isHighlighted && styles.emojiItemHighlighted,
                    ]}
                    accessibilityLabel={`emojiPicker.headers.${this.props.code}`}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                >
                    <Icon
                        fill={themeColors.icon}
                        src={this.props.icon}
                        height={variables.iconSizeNormal}
                        width={variables.iconSizeNormal}
                    />
                </PressableWithoutFeedback>
            </Tooltip>
        );
    }
}
CategoryShortcutButton.propTypes = propTypes;

export default withLocalize(CategoryShortcutButton);
