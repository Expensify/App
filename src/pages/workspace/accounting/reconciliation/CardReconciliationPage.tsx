import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function CardReconciliationPage({policy, route}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';
    // @ts-expect-error connection doesn't exist on type ReadOnly<{policyID: string}>
    const connection = (route?.params?.connection as ValueOf<typeof CONST.POLICY.CONNECTIONS.NAME>) ?? '';

    const toggleOption = (isEnabled: boolean) => {
        Card.toggleCardReconciliation(isEnabled, policyID);
    };

    const [isUsedContinuousReconciliation] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${policyID}`);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={CardReconciliationPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.accounting.cardReconciliation')} />
                <View style={[styles.mh5, styles.mb3]}>
                    <ToggleSettingOptionRow
                        switchAccessibilityLabel={translate('workspace.accounting.continuousReconciliation')}
                        title={translate('workspace.accounting.continuousReconciliation')}
                        isActive={!!isUsedContinuousReconciliation}
                        onToggle={toggleOption}
                        subtitle={translate('workspace.accounting.continuousReconciliationDescription')}
                        shouldPlaceSubtitleBelowSwitch
                    />
                </View>
                <MenuItemWithTopDescription
                    // TODO: get a proper bank account title
                    title="Checking 1111"
                    description={translate('workspace.accounting.reconciliationAccount')}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.getRoute(policyID, connection))}
                    shouldShowRightIcon
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CardReconciliationPage.displayName = 'CardReconciliationPage';

export default withPolicyConnections(CardReconciliationPage);
