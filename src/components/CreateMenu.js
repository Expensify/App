import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Popover from './Popover';
import styles from '../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import MenuItem from './MenuItem';
import CONST from '../CONST';
import {propTypes as ModalPropTypes} from './Modal/ModalPropTypes';

const propTypes = {
    // Callback to fire on request to modal close
    onClose: PropTypes.func.isRequired,

    // State that determines whether to display the create menu or not
    isVisible: PropTypes.bool.isRequired,

    // Callback to fire when a CreateMenu item is selected
    onItemSelected: PropTypes.func.isRequired,

    // Gives the type of the modal
    popOverType: ModalPropTypes.type,

    // Menu items to be rendered on the list
    menuItems: PropTypes.arrayOf(
        PropTypes.shape({
            icon: PropTypes.func.isRequired,
            text: PropTypes.string.isRequired,
            onSelected: PropTypes.func.isRequired,
        }),
    ).isRequired,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    popOverType: CONST.MODAL.MODAL_TYPE.POPOVER_LEFT_DOCKED,
};

class CreateMenu extends PureComponent {
    constructor(props) {
        super(props);
        this.onModalHide = () => {};
        this.setOnModalHide = this.setOnModalHide.bind(this);
        this.resetOnModalHide = this.resetOnModalHide.bind(this);
    }

    /**
     * Sets a new function to execute when the modal hides
     * @param {Function} callback The function to be called on modal hide
     */
    setOnModalHide(callback) {
        this.onModalHide = callback;
    }

    /**
     * Get the anchor position using the type of the modal into account
     * @param {String} type
     * @returns {Object}
     */
    getAnchorPosition(type) {
        switch (type) {
            case CONST.MODAL.MODAL_TYPE.POPOVER_LEFT_DOCKED:
                return styles.createMenuPositionSidebar;
            case CONST.MODAL.MODAL_TYPE.POPOVER_CENTER_BOTTOM:
                return styles.createMenuPositionReportCompose;
            case CONST.MODAL.MODAL_TYPE.POPOVER_RIGHT_DOCKED:
                return styles.createMenuPositionProfile;
            default:
                return styles.createMenuPositionSidebar;
        }
    }

    /**
     * After the modal hides, reset the onModalHide to an empty function
     */
    resetOnModalHide() {
        this.onModalHide = () => {};
    }

    render() {
        console.debug(this.props.popOverType, this.getAnchorPosition());
        return (
            <Popover
                onClose={this.props.onClose}
                isVisible={this.props.isVisible}
                onModalHide={() => {
                    this.onModalHide();
                    this.resetOnModalHide();
                }}
                anchorPosition={this.getAnchorPosition(this.props.popOverType)}
                popOverType={this.props.popOverType}
            >
                <View style={this.props.isSmallScreenWidth ? {} : styles.createMenuContainer}>
                    {this.props.menuItems.map(({
                        icon,
                        text,
                        onSelected = () => {},
                    }) => (
                        <MenuItem
                            key={text}
                            icon={icon}
                            title={text}
                            onPress={() => {
                                this.props.onItemSelected();
                                this.setOnModalHide(onSelected);
                            }}
                        />
                    ))}
                </View>
            </Popover>
        );
    }
}

CreateMenu.propTypes = propTypes;
CreateMenu.defaultProps = defaultProps;
CreateMenu.displayName = 'CreateMenu';
export default withWindowDimensions(CreateMenu);
