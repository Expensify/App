import Badge from '@components/Badge';
import Button from '@components/ButtonComposed';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearBetaOverrides, setBetaOverride} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

// The 'all' beta is excluded because it is a blanket switch rather than an individual feature, and overriding it would behave unpredictably against the per-feature switches.
const betasList = Object.values(CONST.BETAS).filter((beta) => beta !== CONST.BETAS.ALL);

function BetaOverridesPage() {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const [betaOverrides] = useOnyx(ONYXKEYS.BETA_OVERRIDES);
    const sortedBetas = [...betasList].sort(localeCompare);

    return (
        <ScreenWrapper
            testID={BetaOverridesPage.displayName}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('initialSettingsPage.troubleshoot.betaOverrides')} />
            <ScrollView contentContainerStyle={[styles.ph5, styles.pb5]}>
                <Text style={[styles.textLabelSupporting, styles.mb4]}>{translate('initialSettingsPage.troubleshoot.betaOverridesDescription')}</Text>
                {sortedBetas.map((beta) => (
                    <View
                        key={beta}
                        style={styles.testRowContainer}
                    >
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.flexGrow1, styles.flexShrink1]}>
                            <Text>{beta}</Text>
                            {betaOverrides?.[beta] !== undefined && (
                                <Badge
                                    text={translate('initialSettingsPage.troubleshoot.overridden')}
                                    isCondensed
                                    textStyles={styles.condensedBadgeTextLarge}
                                    success
                                />
                            )}
                        </View>
                        <View style={[styles.flexGrow0, styles.flexShrink0, styles.alignItemsEnd]}>
                            <Switch
                                accessibilityLabel={beta}
                                isOn={isBetaEnabled(beta)}
                                onToggle={() => setBetaOverride(beta, !isBetaEnabled(beta))}
                            />
                        </View>
                    </View>
                ))}
                <View style={styles.mt4}>
                    <Button
                        size={CONST.BUTTON_SIZE.LARGE}
                        onPress={clearBetaOverrides}
                    >
                        <Button.Text>{translate('initialSettingsPage.troubleshoot.resetAllOverrides')}</Button.Text>
                    </Button>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

BetaOverridesPage.displayName = 'BetaOverridesPage';

export default BetaOverridesPage;
