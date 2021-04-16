import React from 'react';
import {propTypes, defaultProps} from './PopoverPropTypes';
import CONST from '../../CONST';
import Modal from '../Modal';
import withWindowDimensions from '../withWindowDimensions';
import styles from '../../styles/styles';

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
const Popover = (props) => {
    /**
     * Get the anchor position using the type of the modal into account
     * @param {String} type
     * @returns {Object}
     */
    function getAnchorPosition(type) {
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

    return (
        <Modal
            type={props.isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : props.popOverType}
            popoverAnchorPosition={getAnchorPosition(props.popOverType)}
        // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            animationIn={props.isSmallScreenWidth ? undefined : props.animationIn}
            animationOut={props.isSmallScreenWidth ? undefined : props.animationOut}
        />
    );
};

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default withWindowDimensions(Popover);
