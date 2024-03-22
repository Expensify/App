import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import variables from '@styles/variables';
import * as Policy from '@userActions/Policy';

function QuickbooksLocationsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const policyID = policy?.id ?? '';
    const {syncLocations, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isSwitchOn = syncLocations !== 'NONE' && syncLocations !== false;
    const isReportFieldsSelected = syncLocations === 'REPORT_FIELD';
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksLocationsPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.locations')} />
            <ScrollView contentContainerStyle={[styles.pb2, styles.ph5]}>
                <Text
                    fontSize={variables.fontSizeLabel}
                    style={[styles.pb5, styles.textSupporting]}
                >
                    {translate('workspace.qbo.locationsDescription')}
                </Text>
                <View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <View style={styles.flex1}>
                        <Text fontSize={variables.fontSizeNormal}>{translate('workspace.qbo.import')}</Text>
                    </View>
                    <OfflineWithFeedback pendingAction={pendingFields?.syncLocations}>
                        <View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                            <Switch
                                accessibilityLabel={translate('workspace.qbo.locations')}
                                isOn={isSwitchOn}
                                onToggle={() => Policy.updatePolicyConnectionConfig(policyID, 'quickbooksOnline', 'syncLocations', isSwitchOn ? 'NONE' : 'TAG')}
                            />
                        </View>
                    </OfflineWithFeedback>
                </View>
                {isSwitchOn && (
                    <OfflineWithFeedback>
                        <MenuItemWithTopDescription
                            interactive={false}
                            title={isReportFieldsSelected ? translate('workspace.common.reportFields') : translate('workspace.common.tags')}
                            description={translate('workspace.qbo.displayedAs')}
                            wrapperStyle={styles.sectionMenuItemTopDescription}
                        />
                    </OfflineWithFeedback>
                )}
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.mt1]}>
                    <Icon
                        small
                        src={Expensicons.Lock}
                        fill={theme.icon}
                    />
                    <Text style={[styles.textSupporting, styles.textNormal]}>{translate('workspace.qbo.locationsAdditionalDescription')}</Text>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksLocationsPage.displayName = 'QuickbooksLocationsPage';

export default withPolicy(QuickbooksLocationsPage);
