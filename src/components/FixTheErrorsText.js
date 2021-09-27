import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';
import TextLink from './TextLink';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** Fired when link is tapped */
    onLinkPress: PropTypes.func.isRequired,
    ...withLocalizePropTypes,
};

const FixTheErrorsText = props => (
    <>
        <Text style={styles.mutedTextLabel}>
            {`${props.translate('common.please')} `}
        </Text>
        <TextLink
            style={styles.label}
            onPress={props.onLinkPress}
        >
            {props.translate('common.fixTheErrors')}
        </TextLink>
        <Text style={styles.mutedTextLabel}>
            {` ${props.translate('common.inTheFormBeforeContinuing')}.`}
        </Text>
    </>
);

FixTheErrorsText.propTypes = propTypes;
export default withLocalize(FixTheErrorsText);
