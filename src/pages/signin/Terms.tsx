import React, {useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {Linking, useWindowDimensions} from 'react-native';
import RenderHtml from 'react-native-render-html';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function Terms() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {width} = useWindowDimensions();
    const linkStyles = useMemo<StyleProp<TextStyle>>(() => [styles.textExtraSmallSupporting, styles.link], [styles]);
    const containerStyles = useMemo(
        () => ({
            ...styles.textExtraSmallSupporting,
            ...styles.mb4,
            // Ensure color is a string for RenderHtml
            color: (styles.textExtraSmallSupporting?.color as string) ?? undefined,
        }),
        [styles],
    );

    return (
        <RenderHtml
            contentWidth={width}
            source={{html: translate('termsOfUse.full')}}
            tagsStyles={{
                a: {...styles.link, textDecorationLine: 'none'},
                p: containerStyles,
                body: containerStyles,
            }}
            defaultTextProps={{style: styles.textExtraSmallSupporting}}
            renderersProps={{
                a: {
                    onPress: (_, href) => {
                        if (!href) return;

                        if (href.includes('Terms')) {
                            Linking.openURL(CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL);
                        } else if (href.includes('Privacy')) {
                            Linking.openURL(CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL);
                        } else if (href.includes('licenses')) {
                            Linking.openURL(CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL);
                        }
                    },
                },
            }}
        />
    );
}

Terms.displayName = 'Terms';

export default Terms;
