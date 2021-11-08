import React, {Component} from 'react';
import {
    View, Pressable, Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import PopoverMenu from '../PopoverMenu';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';
import Tooltip from '../Tooltip';
import {ThreeDots} from '../Icon/Expensicons';
import ThreeDotsMenuItemPropTypes from './ThreeDotsMenuItemPropTypes';

const propTypes = {
    ...withLocalizePropTypes,

    /** Tooltip for the popup icon */
    iconTooltip: PropTypes.string,

    /** icon for the popup trigger */
    icon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string]),

    /** Any additional styles to pass to the icon container. */
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
    icon: ThreeDots,
    onIconPress: () => {},
};


class ThreeDotsMenu extends Component {
    constructor(props) {
        super(props);

        this.togglePopupMenu = this.togglePopupMenu.bind(this);
        this.measurePopupMenuIconPosition = this.measurePopupMenuIconPosition.bind(this);
        this.popupMenuIconWrapper = null;
        this.state = {
            isPopupMenuActive: false,
            popupMenuIconPosition: {x: 0, y: 0},
        };
    }

    componentDidMount() {
        Dimensions.addEventListener('change', this.measurePopupMenuIconPosition);
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.measurePopupMenuIconPosition);
    }

    /**
     * Toggles the state variable isPopupMenuActive
     */
    togglePopupMenu() {
        this.setState(prevState => ({
            isPopupMenuActive: !prevState.isPopupMenuActive,
        }));
    }

    /**
     * This gets called onLayout to find the cooridnates of the wrapper for the pop up menu button
     */
    measurePopupMenuIconPosition() {
        if (this.popupMenuIconWrapper) {
            this.popupMenuIconWrapper.measureInWindow((x, y) => this.setState({
                popupMenuIconPosition: {x, y},
            }));
        }
    }

    render() {
        return (
            <>
                <View
                    ref={el => this.popupMenuIconWrapper = el}
                    onLayout={this.measurePopupMenuIconPosition}
                >
                    <Tooltip text={this.props.translate(this.props.iconTooltip)}>
                        <Pressable
                            onPress={() => {
                                // Add a prop here?
                                this.togglePopupMenu();
                                if (this.props.onIconPress) {
                                    this.props.onIconPress();
                                }
                            }}
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
                    onClose={this.togglePopupMenu}
                    isVisible={this.state.isPopupMenuActive}
                    anchorPosition={this.props.anchorPosition}
                    onItemSelected={() => this.togglePopupMenu()}
                    animationIn="fadeInDown"
                    animationOut="fadeOutUp"
                    menuItems={this.props.menuItems}
                />
            </>
        );
    }
}

ThreeDotsMenu.propTypes = propTypes;
ThreeDotsMenu.defaultProps = defaultProps;
ThreeDotsMenu.displayName = 'ThreeDotsMenu';
export default compose(
    withLocalize,
)(ThreeDotsMenu);

export {ThreeDotsMenuItemPropTypes};
