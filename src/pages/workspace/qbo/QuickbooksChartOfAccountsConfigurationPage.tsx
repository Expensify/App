import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import variables from '@styles/variables';
import * as Policy from '@userActions/Policy';

function QuickbooksChartOfAccountsConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {enableNewCategories} = policy?.connections?.quickbooksOnline?.config ?? {};

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksChartOfAccountsConfigurationPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.qbo.accounts')}
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView contentContainerStyle={[styles.pb2, styles.ph5]}>
                <Text
                    fontSize={variables.fontSizeLabel}
                    style={[styles.pb5, styles.textSupporting]}
                >
                    {translate('workspace.qbo.accountsDescription')}
                </Text>
                <View style={[styles.flexRow, styles.mb6, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <View style={styles.flex1}>
                        <Text fontSize={variables.fontSizeNormal}>{translate('workspace.qbo.accountsSwitchTitle')}</Text>
                        <Text
                            fontSize={variables.fontSizeLabel}
                            style={styles.textSupporting}
                        >
                            {translate('workspace.qbo.accountsSwitchDescription')}
                        </Text>
                    </View>
                    <OfflineWithFeedback>
                        <View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                            <Switch
                                accessibilityLabel={translate('workspace.qbo.accounts')}
                                isOn={Boolean(enableNewCategories)}
                                onToggle={() => Policy.updatePolicyConnectionConfig(
                                    policyID,
                                    'quickbooksOnline',
                                    'enableNewCategories',
                                    !enableNewCategories,
                                )}
                            />
                        </View>
                    </OfflineWithFeedback>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksChartOfAccountsConfigurationPage.displayName = 'QuickbooksChartOfAccountsConfigurationPage';

export default withPolicy(QuickbooksChartOfAccountsConfigurationPage);
