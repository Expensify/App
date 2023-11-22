import React from 'react';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

function Terms(props) {
    const styles = useThemeStyles();
    const linkStyles = [styles.textExtraSmallSupporting, styles.link];

    return (
        <Text style={[styles.textExtraSmallSupporting, styles.mb4]}>
            {props.translate('termsOfUse.phrase1')}
            <TextLink
                style={linkStyles}
                href={CONST.TERMS_URL}
            >
                {' '}
                {props.translate('termsOfUse.phrase2')}{' '}
            </TextLink>
            {props.translate('termsOfUse.phrase3')}
            <TextLink
                style={linkStyles}
                href={CONST.PRIVACY_URL}
            >
                {' '}
                {props.translate('termsOfUse.phrase4')}
            </TextLink>
            {'. '}
        </Text>
    );
}

Terms.propTypes = {...withLocalizePropTypes};
Terms.displayName = 'Terms';

export default withLocalize(Terms);
