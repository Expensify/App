import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import ROUTES from '@src/ROUTES';

function QuickbooksCompanyCardExpenseConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {exportCompanyCard} = policy?.connections?.quickbooksOnline?.config ?? {};

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksCompanyCardExpenseConfigurationPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.exportCompany')} />
            <ScrollView contentContainerStyle={styles.pb2}>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportCompanyCardsDescription')}</Text>
                <OfflineWithFeedback>
                    <MenuItemWithTopDescription
                        title={exportCompanyCard}
                        description={translate('workspace.qbo.exportAs')}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT.getRoute(policyID))}
                        brickRoadIndicator={undefined}
                        shouldShowRightIcon
                    />
                </OfflineWithFeedback>
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksCompanyCardExpenseConfigurationPage.displayName = 'QuickbooksCompanyCardExpenseConfigurationPage';

export default withPolicy(QuickbooksCompanyCardExpenseConfigurationPage);
