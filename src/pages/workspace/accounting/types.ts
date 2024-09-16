import type {OnyxEntry} from 'react-native-onyx';
import type {MenuItemProps} from '@components/MenuItem';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import type {Policy, PolicyConnectionSyncProgress} from '@src/types/onyx';
import type {ErrorFields, PendingFields} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';

type MenuItemData = MenuItemProps & {pendingAction?: OfflineWithFeedbackProps['pendingAction']; errors?: OfflineWithFeedbackProps['errors']};

type PolicyAccountingPageOnyxProps = {
    connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>;
};

type PolicyAccountingPageProps = WithPolicyConnectionsProps &
    PolicyAccountingPageOnyxProps & {
        policy: OnyxEntry<Policy>;
    };

type WorkspaceUpgradeNavigationDetails = {
    /** Integration alias for workspace upgrade navigation. If passed, and the user doesn't have control policy, they will be redirected to the upgrade page */
    integrationAlias: string;
    /** Route to redirect to after upgrading the workspace */
    backToAfterWorkspaceUpgradeRoute: string;
};

type AccountingIntegration = {
    title: string;
    icon: IconAsset;
    setupConnectionFlow: React.ReactNode;
    onImportPagePress: () => void;
    subscribedImportSettings?: string[];
    onExportPagePress: () => void;
    subscribedExportSettings?: string[];
    onAdvancedPagePress: () => void;
    subscribedAdvancedSettings?: string[];
    onCardReconciliationPagePress: () => void;
    pendingFields?: PendingFields<string>;
    errorFields?: ErrorFields;
    workspaceUpgradeNavigationDetails?: WorkspaceUpgradeNavigationDetails;
};

export type {MenuItemData, PolicyAccountingPageOnyxProps, PolicyAccountingPageProps, AccountingIntegration};
