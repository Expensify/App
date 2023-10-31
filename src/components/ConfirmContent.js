import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import Button from './Button';
import Header from './Header';
import Icon from './Icon';
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

    /** Whether we should disable the confirm button when offline */
    shouldDisableConfirmButtonWhenOffline: PropTypes.bool,

    /** Whether we should show the cancel button */
    shouldShowCancelButton: PropTypes.bool,

    /** Icon to display above the title */
    iconSource: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /** Whether to center the icon / text content */
    shouldCenterContent: PropTypes.bool,

    /** Whether to stack the buttons */
    shouldStackButtons: PropTypes.bool,

    /** Styles for title */
    // eslint-disable-next-line react/forbid-prop-types
    titleStyles: PropTypes.arrayOf(PropTypes.object),

    /** Styles for prompt */
    // eslint-disable-next-line react/forbid-prop-types
    promptStyles: PropTypes.arrayOf(PropTypes.object),

    /** Styles for view */
    // eslint-disable-next-line react/forbid-prop-types
    contentStyles: PropTypes.arrayOf(PropTypes.object),

    /** Styles for icon */
    // eslint-disable-next-line react/forbid-prop-types
    iconAdditionalStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    confirmText: '',
    cancelText: '',
    prompt: '',
    success: true,
    danger: false,
    onCancel: () => {},
    shouldDisableConfirmButtonWhenOffline: false,
    shouldShowCancelButton: true,
    contentStyles: [],
    iconSource: null,
    shouldCenterContent: false,
    shouldStackButtons: true,
    titleStyles: [],
    promptStyles: [],
    iconAdditionalStyles: [],
};

function ConfirmContent(props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const isCentered = props.shouldCenterContent;

    return (
        <View style={[styles.m5, ...props.contentStyles]}>
            <View style={isCentered ? [styles.alignItemsCenter, styles.mb6] : []}>
                {!_.isEmpty(props.iconSource) ||
                    (_.isFunction(props.iconSource) && (
                        <View style={[styles.flexRow, styles.mb3]}>
                            <Icon
                                src={props.iconSource}
                                width={variables.appModalAppIconSize}
                                height={variables.appModalAppIconSize}
                                additionalStyles={[...props.iconAdditionalStyles]}
                            />
                        </View>
                    ))}

                <View style={[styles.flexRow, isCentered ? {} : styles.mb4]}>
                    <Header
                        title={props.title}
                        textStyles={[...props.titleStyles]}
                    />
                </View>

                {_.isString(props.prompt) ? <Text style={[...props.promptStyles, isCentered ? styles.textAlignCenter : {}]}>{props.prompt}</Text> : props.prompt}
            </View>

            {props.shouldStackButtons ? (
                <>
                    <Button
                        success={props.success}
                        danger={props.danger}
                        style={[styles.mt4]}
                        onPress={props.onConfirm}
                        pressOnEnter
                        text={props.confirmText || translate('common.yes')}
                        isDisabled={isOffline && props.shouldDisableConfirmButtonWhenOffline}
                    />
                    {props.shouldShowCancelButton && (
                        <Button
                            style={[styles.mt3, styles.noSelect]}
                            onPress={props.onCancel}
                            text={props.cancelText || translate('common.no')}
                        />
                    )}
                </>
            ) : (
                <View style={[styles.flexRow, styles.gap4]}>
                    {props.shouldShowCancelButton && (
                        <Button
                            style={[styles.noSelect, styles.flex1]}
                            onPress={props.onCancel}
                            text={props.cancelText || translate('common.no')}
                            medium
                        />
                    )}
                    <Button
                        success={props.success}
                        danger={props.danger}
                        style={[styles.flex1]}
                        onPress={props.onConfirm}
                        pressOnEnter
                        text={props.confirmText || translate('common.yes')}
                        isDisabled={isOffline && props.shouldDisableConfirmButtonWhenOffline}
                        medium
                    />
                </View>
            )}
        </View>
    );
}

ConfirmContent.propTypes = propTypes;
ConfirmContent.defaultProps = defaultProps;
ConfirmContent.displayName = 'ConfirmContent';
export default ConfirmContent;
