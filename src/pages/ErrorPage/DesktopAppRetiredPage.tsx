import React from 'react';
import {Linking, View} from 'react-native';
import Button from '@components/Button';
import HeaderGap from '@components/HeaderGap';
import Icon from '@components/Icon';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function DesktopAppRetiredPage() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['LaptopOnDeskDeprecated'] as const);
    const insets = useSafeAreaInsets();
    const {environmentURL} = useEnvironment();

    return (
        <View style={[styles.appBG, styles.h100, StyleUtils.getPlatformSafeAreaPadding(insets)]}>
            <HeaderGap />
            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <Icon
                    src={illustrations.LaptopOnDeskDeprecated}
                    height={variables.desktopAppRetiredIllustrationH}
                    width={variables.desktopAppRetiredIllustrationW}
                />
                <View style={[styles.ph5, styles.alignItemsCenter, styles.mt5]}>
                    <View style={styles.updateRequiredViewTextContainer}>
                        <View style={[styles.mb3]}>
                            <Text style={[styles.newKansasLarge, styles.textAlignCenter]}>{translate('desktopAppRetiredPage.title')}</Text>
                        </View>
                        <View style={styles.mb5}>
                            <Text style={[styles.textAlignCenter, styles.textSupporting]}>{`${translate('desktopAppRetiredPage.body')} `}</Text>
                        </View>
                    </View>
                </View>
                <Button
                    success
                    large
                    onPress={() => {
                        Linking.openURL(environmentURL ?? CONST.NEW_EXPENSIFY_URL);
                    }}
                    text={translate('desktopAppRetiredPage.goToWeb')}
                    style={styles.desktopAppRetiredViewTextContainer}
                />
            </View>
        </View>
    );
}

DesktopAppRetiredPage.displayName = 'DesktopAppRetiredPage';

export default DesktopAppRetiredPage;
