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

function QuickbooksExportCompanyCardsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksExportCompanyCardsPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.exportCompany')} />
            <ScrollView contentContainerStyle={styles.pb2}>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportCompanyCardsDescription')}</Text>
                <OfflineWithFeedback>
                    <MenuItemWithTopDescription
                        title="Debit Card"
                        description={translate('workspace.qbo.exportAs')}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKSONLINE_COMPANY_CARD.getRoute(policyID))}
                        brickRoadIndicator={undefined}
                    />
                </OfflineWithFeedback>
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksExportCompanyCardsPage.displayName = 'QuickbooksExportCompanyCardsPage';

export default withPolicy(QuickbooksExportCompanyCardsPage);
