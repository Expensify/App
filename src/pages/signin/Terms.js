import React from 'react';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

function Terms() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const linkStyles = [styles.textExtraSmallSupporting, styles.link];
    return (
        <Text style={[styles.textExtraSmallSupporting, styles.mb4]}>
            {translate('termsOfUse.phrase1')}
            <TextLink
                style={linkStyles}
                href={CONST.TERMS_URL}
            >
                {' '}
                {translate('termsOfUse.phrase2')}{' '}
            </TextLink>
            {translate('termsOfUse.phrase3')}
            <TextLink
                style={linkStyles}
                href={CONST.PRIVACY_URL}
            >
                {' '}
                {translate('termsOfUse.phrase4')}
            </TextLink>
            {'. '}
        </Text>
    );
}

Terms.displayName = 'Terms';

export default Terms;
