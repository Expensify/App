import React from 'react';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

function WorkspaceProfilePlanTypePage({policy}: WithPolicyProps) {
    const policyID = policy?.id ?? '-1';
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
        >
            <ScreenWrapper
                testID={WorkspaceProfilePlanTypePage.displayName}
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton title={translate('workspace.planTypePage.title')} />
            </ScreenWrapper>
            <FixedFooter>
                <Button
                    success
                    large
                    text={translate('common.buttonConfirm')}
                    style={styles.mt6}
                    pressOnEnter
                    onPress={() => {
                        Navigation.goBack();
                    }}
                />
            </FixedFooter>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceProfilePlanTypePage.displayName = 'WorkspaceProfilePlanTypePage';

export default withPolicy(WorkspaceProfilePlanTypePage);
