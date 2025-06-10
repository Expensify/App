import React from 'react';
import RenderHtml, {defaultSystemFonts} from 'react-native-render-html';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

function Terms() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const systemFonts = [...defaultSystemFonts, 'CustomFontName'];

    return (
        <RenderHtml
            source={{html: translate('termsOfUse.terms')}}
            contentWidth={windowWidth}
            systemFonts={systemFonts}
            tagsStyles={{
                a: {
                    ...styles.textExtraSmallSupporting,
                    ...styles.link,
                    textDecorationLine: 'none',
                },
                body: {
                    ...styles.textExtraSmallSupporting,
                    ...styles.mb4,
                },
            }}
        />
    );
}

Terms.displayName = 'Terms';

export default Terms;
