import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import Header from './Header';
import styles from '../styles/styles';
import Button from './Button';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Text from './Text';

const propTypes = {
    /** Title of the modal */
    title: PropTypes.string.isRequired,

    /** A callback to call when the form has been submitted */
    onConfirm: PropTypes.func.isRequired,

    /** A callback to call when the form has been closed */
    onCancel: PropTypes.func,

    /** Confirm button text */
    confirmText: PropTypes.string,

    /** Cancel button text */
    cancelText: PropTypes.string,

    /** Modal content text/element */
    prompt: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

    /** Whether we should use the success button color */
    success: PropTypes.bool,

    /** Is the action destructive */
    danger: PropTypes.bool,

    /** Whether we should show the cancel button */
    shouldShowCancelButton: PropTypes.bool,

    /** Styles for view */
    viewStyles: PropTypes.arrayOf(PropTypes.object),

    ...withLocalizePropTypes,

};

const defaultProps = {
    confirmText: '',
    cancelText: '',
    prompt: '',
    success: true,
    danger: false,
    onCancel: () => {},
    shouldShowCancelButton: true,
    viewStyles: [],
};

const ConfirmView = props => (
    <View style={[styles.m5, ...props.viewStyles]}>
        <View style={[styles.flexRow, styles.mb4]}>
            <Header title={props.title} />
        </View>

        {_.isString(props.prompt)
            ? (
                <Text>
                    {props.prompt}
                </Text>
            ) : (props.prompt)}

        <Button
            success={props.success}
            danger={props.danger}
            style={[styles.mt4]}
            onPress={props.onConfirm}
            pressOnEnter
            text={props.confirmText || props.translate('common.yes')}
        />
        {props.shouldShowCancelButton
    && (
        <Button
            style={[styles.mt3]}
            onPress={props.onCancel}
            text={props.cancelText || props.translate('common.no')}
        />
    )}
    </View>
);

ConfirmView.propTypes = propTypes;
ConfirmView.defaultProps = defaultProps;
ConfirmView.displayName = 'ConfirmView';
export default withLocalize(ConfirmView);
