import React from 'react';
import {View} from 'react-native';
import {useWindowDimensions} from 'react-native';
import RenderHtml from 'react-native-render-html';
import LocalePicker from '@components/LocalePicker';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

const currentYear = new Date().getFullYear();

function Licenses() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {width} = useWindowDimensions();
    const termsHTML = translate('termsOfUse.full');

    return (
        <>
            <Text style={[styles.textExtraSmallSupporting, styles.mb4]}>{`© ${currentYear} Expensify`}</Text>
            <RenderHtml
                contentWidth={width}
                source={{html: termsHTML}}
                tagsStyles={{
                    a: [styles.textExtraSmallSupporting, styles.link],
                    p: styles.textExtraSmallSupporting,
                    body: styles.textExtraSmallSupporting,
                }}
                defaultTextProps={{style: styles.textExtraSmallSupporting}}
                renderersProps={{
                    a: {
                        onPress: (_, href) => {
                            if (href.includes('licenses')) {
                                window.open(CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL, '_blank');
                            }
                        },
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
