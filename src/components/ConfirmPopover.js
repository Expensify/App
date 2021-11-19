import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import Header from './Header';
import styles from '../styles/styles';
import Popover from './Popover';
import CONST from '../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import Button from './Button';
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
                styles.m2,
                styles.deletePopover,
            ]}
        >
            <Text
                style={[
                    styles.h1,
                    styles.mv2,
                    styles.alignSelfCenter,
                ]}
            >
                {props.title}
            </Text>
            <Button
                success
                danger={props.danger}
                style={[
                    styles.button,
                    styles.mv2,
                    styles.defaultOrDeleteButton,
                ]}
                onPress={props.onConfirm}
                pressOnEnter
                text={props.confirmText || props.translate('common.yes')}
            />
            {props.shouldShowCancelButton
            && (
                <Button
                    style={[
                        styles.button,
                        styles.mv2,
                        styles.defaultOrDeleteButton,
                    ]}
                    onPress={props.onCancel}
                    text={props.cancelText || props.translate('common.no')}
                />
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
