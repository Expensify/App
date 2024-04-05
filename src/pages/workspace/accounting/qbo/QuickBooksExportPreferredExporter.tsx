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

function QuickBooksExportPreferredExporterPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const policyOwner = policy?.owner ?? '';
    const {exporter} = policy?.connections?.quickbooksOnline?.config?.export ?? {};

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickBooksExportPreferredExporterPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.preferredExporter')} />
            <ScrollView contentContainerStyle={styles.pb2}>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportPreferredExporterNote')}</Text>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportPreferredExporterSubNote')}</Text>
                <OfflineWithFeedback>
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        title={exporter ?? policyOwner}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_PREFERRED_EXPORTER_LIST.getRoute(policyID))}
                        brickRoadIndicator={undefined}
                    />
                </OfflineWithFeedback>
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickBooksExportPreferredExporterPage.displayName = 'QuickBooksExportPreferredExporterPage';

export default withPolicy(QuickBooksExportPreferredExporterPage);
