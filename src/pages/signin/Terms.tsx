import React, {useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function Terms() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const termsURL = CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL;
    const privacyURL = CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL;
    const [containerStyles] = useMemo<Array<StyleProp<TextStyle>>>(
        () => [
            [styles.textExtraSmallSupporting, styles.link],
            [styles.textExtraSmallSupporting, styles.mb4],
        ],
        [styles],
    );

    return (
        <Text style={containerStyles}>
            <RenderHTML html={translate('termsOfUse.terms', {termsURL, privacyURL})} />
        </Text>
    );
}

Terms.displayName = 'Terms';

export default Terms;
