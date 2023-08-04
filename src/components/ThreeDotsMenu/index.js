import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Icon from '../Icon';
import PopoverMenu from '../PopoverMenu';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Tooltip from '../Tooltip';
import * as Expensicons from '../Icon/Expensicons';
import ThreeDotsMenuItemPropTypes from './ThreeDotsMenuItemPropTypes';
import CONST from '../../CONST';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';

const propTypes = {
    ...withLocalizePropTypes,

    /** Tooltip for the popup icon */
    iconTooltip: PropTypes.string,

    /** icon for the popup trigger */
    icon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string]),

    /** Any additional styles to pass to the icon container. */
    // eslint-disable-next-line react/forbid-prop-types
    iconStyles: PropTypes.arrayOf(PropTypes.object),

    /** The fill color to pass into the icon. */
    iconFill: PropTypes.string,

    /** Function to call on icon press */
    onIconPress: PropTypes.func,

    /** menuItems that'll show up on toggle of the popup menu */
    menuItems: ThreeDotsMenuItemPropTypes.isRequired,

    /** The anchor position of the menu */
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }).isRequired,

    /** The anchor alignment of the menu */
    anchorAlignment: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),
};

const defaultProps = {
    iconTooltip: 'common.more',
    iconFill: undefined,
    iconStyles: [],
    icon: Expensicons.ThreeDots,
    onIconPress: () => {},
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
};

class ThreeDotsMenu extends Component {
    constructor(props) {
        super(props);

        this.hidePopoverMenu = this.hidePopoverMenu.bind(this);
        this.showPopoverMenu = this.showPopoverMenu.bind(this);
        this.state = {
            isPopupMenuVisible: false,
        };
        this.buttonRef = React.createRef(null);
    }

    showPopoverMenu() {
        this.setState({isPopupMenuVisible: true});
    }

    hidePopoverMenu() {
        this.setState({isPopupMenuVisible: false});
    }

    render() {
        return (
            <>
                <View>
                    <Tooltip text={this.props.translate(this.props.iconTooltip)}>
                        <PressableWithoutFeedback
                            onPress={() => {
                                this.showPopoverMenu();
                                if (this.props.onIconPress) {
                                    this.props.onIconPress();
                                }
                            }}
                            ref={this.buttonRef}
                            style={[styles.touchableButtonImage, ...this.props.iconStyles]}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                            accessibilityLabel={this.props.translate(this.props.iconTooltip)}
                        >
                            <Icon
                                src={this.props.icon}
                                fill={this.props.iconFill}
                            />
                        </PressableWithoutFeedback>
                    </Tooltip>
                </View>
                <PopoverMenu
                    onClose={this.hidePopoverMenu}
                    isVisible={this.state.isPopupMenuVisible}
                    anchorPosition={this.props.anchorPosition}
                    anchorAlignment={this.props.anchorAlignment}
                    onItemSelected={this.hidePopoverMenu}
                    menuItems={this.props.menuItems}
                    anchorRef={this.buttonRef}
                    withoutOverlay
                />
            </>
        );
    }
}

ThreeDotsMenu.propTypes = propTypes;
ThreeDotsMenu.defaultProps = defaultProps;

export default withLocalize(ThreeDotsMenu);

export {ThreeDotsMenuItemPropTypes};
