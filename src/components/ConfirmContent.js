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

    /** Whether we should use the danger button color. Use if the action is destructive */
    danger: PropTypes.bool,

    /** Whether we should show the cancel button */
    shouldShowCancelButton: PropTypes.bool,

    /** Styles for view */
    // eslint-disable-next-line react/forbid-prop-types
    contentStyles: PropTypes.arrayOf(PropTypes.object),

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
    contentStyles: [],
};

const ConfirmContent = props => (
    <View style={[styles.m5, ...props.contentStyles]}>
        <View style={[styles.flexRow, styles.mb4]}>
            <Header title={props.title} />
        </View>

        {_.isString(props.prompt)
            ? (
                <Text>
                    {props.prompt}
                </Text>
            ) : props.prompt}

        <Button
            success={props.success}
            danger={props.danger}
            style={[styles.mt4]}
            onPress={props.onConfirm}
            pressOnEnter
            text={props.confirmText || props.translate('common.yes')}
        />
        {props.shouldShowCancelButton && (
            <Button
                style={[styles.mt3, styles.noSelect]}
                onPress={props.onCancel}
                text={props.cancelText || props.translate('common.no')}
            />
        )}
    </View>
);

ConfirmContent.propTypes = propTypes;
ConfirmContent.defaultProps = defaultProps;
ConfirmContent.displayName = 'ConfirmContent';
export default withLocalize(ConfirmContent);
