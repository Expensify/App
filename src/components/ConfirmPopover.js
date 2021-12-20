import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import Header from './Header';
import styles from '../styles/styles';
import Popover from './Popover';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import ExpensifyText from './ExpensifyText';

const propTypes = {
    /** Title of the modal */
    title: PropTypes.string.isRequired,

    /** A callback to call when the form has been submitted */
    onConfirm: PropTypes.func.isRequired,

    /** A callback to call when the form has been closed */
    onCancel: PropTypes.func,

    /** Modal visibility */
    isVisible: PropTypes.bool.isRequired,

    /** Confirm button text */
    confirmText: PropTypes.string,

    /** Cancel button text */
    cancelText: PropTypes.string,

    /** Is the action destructive */
    danger: PropTypes.bool,

    /** Whether we should show the cancel button */
    shouldShowCancelButton: PropTypes.bool,

    /** Where the popover should be positioned */
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        left: PropTypes.number,
    }).isRequired,

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    confirmText: '',
    cancelText: '',
    danger: false,
    onCancel: () => {},
    shouldShowCancelButton: true,
};

const ConfirmPopover = props => (
    <Popover
        onSubmit={props.onConfirm}
        onClose={props.onCancel}
        isVisible={props.isVisible}
        anchorPosition={props.anchorPosition}
    >
        <View
            style={[
                styles.m2,
                styles.alignItemsCenter,
                !props.isSmallScreenWidth ? styles.defaultDeletePopover : '',
            ]}
        >
            <Header
                style={[
                    styles.mv2,
                    styles.alignSelfCenter,
                ]}
                title={props.title}
            />
            <TouchableOpacity
                danger={props.danger}
                style={[
                    styles.button,
                    styles.mv2,
                    styles.defaultOrDeleteButton,
                    props.danger ? styles.buttonDanger : styles.buttonSuccess,
                    styles.alignSelfCenter,
                ]}
                onPress={props.onConfirm}
            >
                <ExpensifyText style={[styles.buttonText]}>
                    {props.confirmText || props.translate('common.yes')}
                </ExpensifyText>
            </TouchableOpacity>
            {props.shouldShowCancelButton
            && (
                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.mv2,
                        styles.defaultOrDeleteButton,
                        styles.alignSelfCenter,
                    ]}
                    onPress={props.onCancel}
                >
                    <ExpensifyText style={[styles.buttonText]}>
                        {props.cancelText || props.translate('common.no')}
                    </ExpensifyText>
                </TouchableOpacity>
            )}
        </View>
    </Popover>
);

ConfirmPopover.propTypes = propTypes;
ConfirmPopover.defaultProps = defaultProps;
ConfirmPopover.displayName = 'ConfirmPopover';
export default compose(
    withWindowDimensions,
    withLocalize,
)(ConfirmPopover);
