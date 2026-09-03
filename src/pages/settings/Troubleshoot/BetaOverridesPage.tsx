import Badge from '@components/Badge';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/ButtonComposed';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';

import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearBetaOverrides, setBetaOverride} from '@userActions/User';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

// The 'all' beta is excluded because it is a blanket switch rather than an individual feature, and overriding it would behave unpredictably against the per-feature switches.
const sortedBetas = Object.values(CONST.BETAS)
    .filter((beta) => beta !== CONST.BETAS.ALL)
    .sort();

function BetaOverridesPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // The environment context starts on production and resolves later, so the build config must agree to avoid a flash
    // TestFlight is compiled as production, so it still shows the not found view until the native beta check resolves
    const {isProduction: isResolvedProduction} = useEnvironment();
    const isProduction = isResolvedProduction && CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.PRODUCTION;
    const {isBetaEnabled} = usePermissions();
    const [betaOverrides] = useOnyx(ONYXKEYS.BETA_OVERRIDES);

    return (
        <ScreenWrapper
            testID={BetaOverridesPage.displayName}
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView shouldShow={isProduction}>
                <HeaderWithBackButton title={translate('initialSettingsPage.troubleshoot.betaOverrides')} />
                <ScrollView contentContainerStyle={[styles.ph5, styles.pb5]}>
                    <Text style={[styles.textLabelSupporting, styles.mb4]}>{translate('initialSettingsPage.troubleshoot.betaOverridesDescription')}</Text>
                    {sortedBetas.map((beta) => (
                        <View
                            key={beta}
                            style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap4, styles.mnw120, styles.mnh16]}
                        >
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.flexGrow1, styles.flexShrink1]}>
                                <Text>{beta}</Text>
                                {betaOverrides?.[beta] !== undefined && (
                                    <Badge
                                        text={translate('initialSettingsPage.troubleshoot.overridden')}
                                        isCondensed
                                        textStyles={styles.condensedBadgeTextDefaultSize}
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
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

BetaOverridesPage.displayName = 'BetaOverridesPage';

export default BetaOverridesPage;
