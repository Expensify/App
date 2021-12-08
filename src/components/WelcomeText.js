import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import ExpensifyText from './ExpensifyText';

const propTypes = {

    /** Fontsize */
    smallFontSize: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    smallFontSize: false,
};

const WelcomeText = (props) => {
    const textSize = props.smallFontSize ? styles.textLabel : undefined;
    return (
        <>
            <ExpensifyText style={[textSize, styles.textStrong, styles.mb1]}>
                {props.translate('welcomeText.phrase1')}
            </ExpensifyText>
            <ExpensifyText style={[textSize]}>
                {props.translate('welcomeText.phrase2')}
                {' '}
                {props.translate('welcomeText.phrase3')}
            </ExpensifyText>
        </>
    );
};

WelcomeText.displayName = 'WelcomeText';
WelcomeText.propTypes = propTypes;
WelcomeText.defaultProps = defaultProps;

export default withLocalize(WelcomeText);
