import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Popover from './Popover';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import Text from './Text';

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
                styles.m5,
                styles.alignItemsCenter,
                !props.isSmallScreenWidth ? styles.sidebarPopover : '',
            ]}
        >
            <Text
                style={[
                    styles.mb5,
                ]}
            >
                {props.title}
            </Text>
            <TouchableOpacity
                style={[
                    styles.button,
                    styles.mt2,
                    styles.w100,
                    props.danger ? styles.buttonDanger : styles.buttonSuccess,
                    styles.alignSelfCenter,
                ]}
                onPress={props.onConfirm}
            >
                <Text style={[styles.buttonText, props.danger && styles.textWhite]}>
                    {props.confirmText || props.translate('common.yes')}
                </Text>
            </TouchableOpacity>
            {props.shouldShowCancelButton
            && (
                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.mt4,
                        styles.w100,
                        styles.alignSelfCenter,
                    ]}
                    onPress={props.onCancel}
                >
                    <Text style={[styles.buttonText]}>
                        {props.cancelText || props.translate('common.no')}
                    </Text>
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
