import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {clearBetaOverrides, setBetaOverride} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

import Badge from './Badge';
import Button from './ButtonComposed';
import HeaderWithBackButton from './HeaderWithBackButton';
import Modal from './Modal';
import SafeAreaConsumer from './SafeAreaConsumer';
import ScrollView from './ScrollView';
import Switch from './Switch';
import Text from './Text';

type BetaOverridesModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Closes the modal */
    onClose: () => void;
};

// The 'all' beta is excluded because it is a blanket switch rather than an individual feature, and overriding it would behave unpredictably against the per-feature switches.
const betasList = Object.values(CONST.BETAS).filter((beta) => beta !== CONST.BETAS.ALL);

function BetaOverridesModal({isVisible, onClose}: BetaOverridesModalProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const sortedBetas = [...betasList].sort(localeCompare);
    const {windowHeight} = useWindowDimensions();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to be consistent with BaseModal component
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const [betasOverride] = useOnyx(ONYXKEYS.BETAS_OVERRIDE);

    const maxHeight = isSmallScreenWidth ? undefined : windowHeight - 40;

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <Modal
                    isVisible={isVisible}
                    type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT : CONST.MODAL.MODAL_TYPE.CENTERED_SMALL}
                    onClose={onClose}
                    innerContainerStyle={isSmallScreenWidth ? {...safeAreaPaddingBottomStyle, maxHeight} : {...styles.workspaceSection, ...safeAreaPaddingBottomStyle, maxHeight}}
                >
                    <HeaderWithBackButton
                        title={translate('initialSettingsPage.troubleshoot.betaOverrides')}
                        shouldShowCloseButton={!isSmallScreenWidth}
                        onCloseButtonPress={onClose}
                        shouldShowBackButton={isSmallScreenWidth}
                        onBackButtonPress={onClose}
                        shouldDisplayHelpButton={false}
                    />
                    <ScrollView contentContainerStyle={[styles.ph5, styles.pb5]}>
                        <Text style={[styles.textLabelSupporting, styles.mb4]}>{translate('initialSettingsPage.troubleshoot.betaOverridesDescription')}</Text>
                        {sortedBetas.map((beta) => (
                            <View
                                key={beta}
                                style={styles.testRowContainer}
                            >
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.flexGrow1, styles.flexShrink1]}>
                                    <Text>{beta}</Text>
                                    {betasOverride?.[beta] !== undefined && (
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
                </Modal>
            )}
        </SafeAreaConsumer>
    );
}

export default BetaOverridesModal;
