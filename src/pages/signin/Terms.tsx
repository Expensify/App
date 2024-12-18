import React, {useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function Terms() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [linkStyles, containerStyles] = useMemo<Array<StyleProp<TextStyle>>>(
        () => [
            [styles.textExtraSmallSupporting, styles.link],
            [styles.textExtraSmallSupporting, styles.mb4],
        ],
        [styles],
    );

    return (
        <Text style={containerStyles}>
            {translate('termsOfUse.phrase1')}
            <TextLink
                style={linkStyles}
                href={CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}
            >
                {' '}
                {translate('termsOfUse.phrase2')}{' '}
            </TextLink>
            {translate('termsOfUse.phrase3')}
            <TextLink
                style={linkStyles}
                href={CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}
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
