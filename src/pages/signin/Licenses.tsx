import React from 'react';
import {View} from 'react-native';
import RenderHtml, {defaultSystemFonts} from 'react-native-render-html';
import LocalePicker from '@components/LocalePicker';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

const currentYear = new Date().getFullYear();

function Licenses() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const systemFonts = [...defaultSystemFonts, 'CustomFontName'];
    return (
        <>
            <Text style={[styles.textExtraSmallSupporting, styles.mb4]}>{`© ${currentYear} Expensify`}</Text>
            <RenderHtml
                contentWidth={windowWidth}
                systemFonts={systemFonts}
                source={{
                    html: translate('termsOfUse.licenses'),
                }}
                tagsStyles={{
                    a: {
                        ...styles.textExtraSmallSupporting,
                        ...styles.link,
                        textDecorationLine: 'none',
                    },
                    body: {
                        ...styles.textExtraSmallSupporting,
                    },
                }}
            />
            <View style={[styles.mt4, styles.alignItemsCenter, styles.mb2, styles.flexRow, styles.justifyContentBetween]}>
                <LocalePicker size="small" />
            </View>
        </>
    );
}

Licenses.displayName = 'Licenses';

export default Licenses;
