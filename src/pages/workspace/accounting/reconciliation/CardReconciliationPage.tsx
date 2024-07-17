import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';

function CardReconciliationPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';

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
                <ScrollView contentContainerStyle={[styles.ph5, styles.pb5]} />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CardReconciliationPage.displayName = 'CardReconciliationPage';

export default withPolicyConnections(CardReconciliationPage);
