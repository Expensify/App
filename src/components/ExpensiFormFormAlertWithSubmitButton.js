import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import colors from '../styles/colors';
import Button from './Button';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import TextLink from './TextLink';
import Text from './Text';
import RenderHTML from './RenderHTML';

const propTypes = {
    /** Submit function */
    onSubmit: PropTypes.func.isRequired,

    /** Text for the button */
    buttonText: PropTypes.string.isRequired,

    /** Styles for container element */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Is the button in a loading state */
    isLoading: PropTypes.bool,

    /** Is the button in a loading state */
    alert: PropTypes.shape({
        firstErrorToFix: PropTypes.object,
        message: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    message: '',
    isDisabled: false,
    containerStyles: [],
    isLoading: false,
};

const ExpensiFormFormAlertWithSubmitButton = (props) => {
    /**
     * @returns {React.Component}
     */
    function getAlertPrompt() {
        let error = '';

        if (!_.isEmpty(props.alert.message)) {
            error = (
                <RenderHTML html={`<muted-text>${props.alert.message}</muted-text>`} />
            );
        } else {
            error = (
                <>
                    <Text style={styles.mutedTextLabel}>
                        {`${props.translate('common.please')} `}
                    </Text>
                    <TextLink
                        style={styles.label}
                        onPress={() => props.alert.firstErrorToFix.focus()}
                    >
                        {props.translate('common.fixTheErrors')}
                    </TextLink>
                    <Text style={styles.mutedTextLabel}>
                        {` ${props.translate('common.inTheFormBeforeContinuing')}.`}
                    </Text>
                </>
            );
        }

        return (
            <View style={[styles.flexRow, styles.ml2, styles.flexWrap, styles.flex1]}>
                {error}
            </View>
        );
    }

    return (
        <View style={[styles.mb5, styles.flex1, styles.justifyContentEnd, ...props.containerStyles]}>
            {!_.isEmpty(props.alert) && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                    <Icon src={Expensicons.Exclamation} fill={colors.red} />
                    {getAlertPrompt()}
                </View>
            )}
            <Button
                success
                pressOnEnter
                text={props.buttonText}
                onPress={props.onSubmit}
                isDisabled={props.isLoading}
                isLoading={props.isLoading}
            />
        </View>
    );
};

ExpensiFormFormAlertWithSubmitButton.propTypes = propTypes;
ExpensiFormFormAlertWithSubmitButton.defaultProps = defaultProps;
ExpensiFormFormAlertWithSubmitButton.displayName = 'ExpensiFormFormAlertWithSubmitButton';

export default withLocalize(ExpensiFormFormAlertWithSubmitButton);
