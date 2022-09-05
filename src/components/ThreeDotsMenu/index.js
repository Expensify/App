import React, {Component} from 'react';
import {
    View, Pressable,
} from 'react-native';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import PopoverMenu from '../PopoverMenu';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Tooltip from '../Tooltip';
import * as Expensicons from '../Icon/Expensicons';
import ThreeDotsMenuItemPropTypes from './ThreeDotsMenuItemPropTypes';

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
};

const defaultProps = {
    iconTooltip: 'common.more',
    iconFill: undefined,
    iconStyles: [],
    icon: Expensicons.ThreeDots,
    onIconPress: () => {},
};

class ThreeDotsMenu extends Component {
    constructor(props) {
        super(props);

        this.hidePopoverMenu = this.hidePopoverMenu.bind(this);
        this.showPopoverMenu = this.showPopoverMenu.bind(this);
        this.state = {
            isPopupMenuVisible: false,
        };
        this.button = null;
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
                        <Pressable
                            onPress={() => {
                                this.showPopoverMenu();
                                if (this.props.onIconPress) {
                                    this.props.onIconPress();
                                }
                            }}
                            ref={el => this.button = el}
                            style={[styles.touchableButtonImage, ...this.props.iconStyles]}
                        >
                            <Icon
                                src={this.props.icon}
                                fill={this.props.iconFill}
                            />
                        </Pressable>
                    </Tooltip>
                </View>
                <PopoverMenu
                    onClose={this.hidePopoverMenu}
                    isVisible={this.state.isPopupMenuVisible}
                    anchorPosition={this.props.anchorPosition}
                    onItemSelected={this.hidePopoverMenu}
                    menuItems={this.props.menuItems}
                />
            </>
        );
    }
}

ThreeDotsMenu.propTypes = propTypes;
ThreeDotsMenu.defaultProps = defaultProps;

export default withLocalize(ThreeDotsMenu);

export {ThreeDotsMenuItemPropTypes};
