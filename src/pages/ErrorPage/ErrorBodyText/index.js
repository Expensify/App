import React from 'react';
import Text from '../../../components/Text';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import TextLink from '../../../components/TextLink';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';

const propTypes = {
    ...withLocalizePropTypes,
};

const ErrorBodyText = props => (
    <Text>
        {`${props.translate('genericErrorPage.body.helpTextMobile')} `}
        <TextLink href={CONST.ACTIVE_EXPENSIFY_URL} style={[styles.link]}>
            {props.translate('genericErrorPage.body.helpTextWeb')}
        </TextLink>
    </Text>
);

ErrorBodyText.displayName = 'ErrorBodyText';
ErrorBodyText.propTypes = propTypes;
export default withLocalize(ErrorBodyText);
