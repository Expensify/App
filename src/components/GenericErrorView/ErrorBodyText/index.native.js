import React from 'react';
import ExpensifyText from '../../ExpensifyText';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import TextLink from '../../TextLink';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';

const propTypes = {
    ...withLocalizePropTypes,
};

const ErrorBodyText = props => (
    <ExpensifyText>
        {props.translate('genericErrorView.bodyText.helpTextWeb')}
        <TextLink href={CONST.PRIVACY_URL} style={[styles.link]}>
            {props.translate('genericErrorView.bodyText.helpTextWeb')}
        </TextLink>
    </ExpensifyText>
);

ErrorBodyText.propTypes = propTypes;
export default withLocalize(ErrorBodyText);
