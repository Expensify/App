import React, {useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {useWindowDimensions} from 'react-native';
import RenderHtml from 'react-native-render-html';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function Terms() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {width} = useWindowDimensions();
    const [containerStyles] = useMemo<Array<StyleProp<TextStyle>>>(
        () => [
            [styles.textExtraSmallSupporting, styles.link],
            [styles.textExtraSmallSupporting, styles.mb4],
        ],
        [styles],
    );
    const termsHTML = translate('termsOfUse.full');

    return (
        <RenderHtml
            contentWidth={width}
            source={{html: termsHTML}}
            tagsStyles={{
                a: styles.link,
                p: containerStyles,
                body: containerStyles,
            }}
            renderersProps={{
                a: {
                    onPress: (_, href) => {
                        if (href === undefined) return;
                        if (href.includes('Terms')) {
                            window.open(CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL, '_blank');
                        } else if (href.includes('Privacy')) {
                            window.open(CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL, '_blank');
                        }
                    },
                },
            }}
        />
    );
}

Terms.displayName = 'Terms';

export default Terms;
