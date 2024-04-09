import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SpacerView from '@components/SpacerView';
import useThemeStyles from '@hooks/useThemeStyles';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

function QuickbooksAdvancedPage({policy}: WithPolicyProps) {
    const styles = useThemeStyles();
    const qboSyncToggleSettings = [
        {
            title: 'Auto-Sync',
            subTitle: 'Changes made in Quickbooks will automatically be reflected in Expensify.',
            isActive: true,
            onToggle: () => {},
        },
        {
            title: 'Invite Employees',
            subTitle: 'Import Quickbooks Online employee records and invite them to this workspace.',
            isActive: true,
            onToggle: () => {},
        },
        {
            title: 'Automatically Create Entities',
            subTitle: 'Expensify will automatically create a vendor in Quickbooks, if one does not exist. Expensify will also automatically create a customer when exporting invoices.',
            isActive: true,
            onToggle: () => {},
        },
    ];

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksAdvancedPage.displayName}
        >
            <HeaderWithBackButton title="Advanced" />

            <ScrollView contentContainerStyle={[styles.pb2, styles.ph5]}>
                {qboSyncToggleSettings.map((item) => (
                    <View
                        style={styles.mv3}
                        key={item.title}
                    >
                        <ToggleSettingOptionRow
                            title={item.title}
                            subtitle={item.subTitle}
                            isActive={item.isActive}
                            onToggle={item.onToggle}
                        />
                    </View>
                ))}

                <View style={styles.mv3}>
                    <SpacerView
                        shouldShow
                        style={[styles.chatItemComposeBoxColor]}
                    />
                </View>

                <View style={styles.mv3}>
                    <ToggleSettingOptionRow
                        title="Sync Reimbursed Reports"
                        subtitle="Any time report is reimbursed using Expensify ACH, the corresponding bill payment will be created in the Quickbooks accounts below."
                        isActive
                        onToggle={() => {}}
                    />
                </View>
                <OfflineWithFeedback>
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        title="Croissant Co payroll Account"
                        description="Quickbooks Account"
                        wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    />
                </OfflineWithFeedback>

                <View style={styles.mv3}>
                    <SpacerView
                        shouldShow
                        style={[styles.chatItemComposeBoxColor]}
                    />
                </View>

                <MenuItem
                    title="Invoice Collection Account"
                    description="Once invoices have been Paid, the payment will appear in the account configured below."
                    descriptionTextStyle={[styles.pr9]}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    interactive={false}
                />

                <MenuItem
                    title="Croissant Co payroll Account"
                    shouldShowRightIcon
                    shouldShowBasicTitle
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksAdvancedPage.displayName = 'QuickbooksAdvancedPage';

export default withPolicy(QuickbooksAdvancedPage);
