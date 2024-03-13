import React, { useState } from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import Button from '@components/Button';
import type {Policy, WorkspaceIntegrationImportStatus} from '@src/types/onyx';
import useLocalize from '@hooks/useLocalize';
import ONYXKEYS from '@src/ONYXKEYS';
import type { OnyxEntry} from 'react-native-onyx';
import { withOnyx } from 'react-native-onyx';
import Section from '@components/Section';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import useTheme from '@hooks/useTheme';
import { ActivityIndicator, View } from 'react-native';
import type { WithPolicyAndFullscreenLoadingProps } from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import ConnectToQuickbooksOnlineButton from './ConnectToQuickbooksOnlineButton';
import ConnectionThreeDotMenuItems from './ConnectionThreeDotMenuItems';

type WorkspaceAccountingPageOnyxProps = {
    /** From Onyx */
    /** Bank account attached to free plan */
    integrationImportStatus: OnyxEntry<WorkspaceIntegrationImportStatus>;
};

type WorkspaceAccountingPageProps = WithPolicyAndFullscreenLoadingProps & WorkspaceAccountingPageOnyxProps & {
    /** Policy values needed in the component */
    policy: OnyxEntry<Policy>;
};

function WorkspaceAccountingPage({
    policy,
    integrationImportStatus,
}: WorkspaceAccountingPageProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const isSyncInProgress = integrationImportStatus?.status === 'starting' || integrationImportStatus?.status === 'progress';

    let supportingText = 'Some supporting text...';
    if (isSyncInProgress) {
        if (integrationImportStatus.stageInProgress !== null) {
            supportingText = integrationImportStatus.stageInProgress;
        } else {
            supportingText = 'Importing data...';
        }
    }
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={WorkspaceAccountingPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.common.accounting')}
                onBackButtonPress={() => {}}
            />
            {policy !== null && (
                <>
                    <Section
                        subtitle={"Some subtitle..."} // translated, of course
                        title={"Connections"} // translated, of course
                        containerStyles={[styles.p0, styles.pv5]}
                        titleStyles={[styles.ph5]}
                        subtitleStyles={[styles.ph5]}
                        >
                        <View style={[styles.flexRow, styles.mt3]}> 
                            <Icon 
                                src={Expensicons.ExpensifyLogoNew}
                                width={variables.appModalAppIconSize}
                                height={variables.appModalAppIconSize}
                                fill={theme.success}
                            />
                            <View style={styles.p2}>
                                <Text>QuickBooks online</Text>
                                <Text style={[styles.textSupporting]}>{supportingText}</Text>
                            </View>
                            {isSyncInProgress && <ActivityIndicator
                                color={theme.success}
                                size="small"
                            />}
                            {!policy?.connections?.quickbooksOnline &&
                                <ConnectToQuickbooksOnlineButton policyID={policy.id}/>
                            }
                            {!isSyncInProgress && !!policy?.connections?.quickbooksOnline && (
                                <ConnectionThreeDotMenuItems policyID={policy.id} />
                            )}
                        </View>
                    </Section>
                    <>
                        
                        {Boolean(policy?.connections?.quickbooksOnline) && (
                            <>
                                <Button onPress={() => alert('ahh!')}>
                                    <Text>Import</Text>
                                </Button>
                                <Button onPress={() => alert('ahh!')}>
                                    <Text>Import</Text>
                                </Button>
                            </>
                        )}
                    </>
                </>
            )}
        </ScreenWrapper>
    );
}

WorkspaceAccountingPage.displayName = 'WorkspaceAccountingPage';

export default withPolicyAndFullscreenLoading(
    withOnyx<WorkspaceAccountingPageProps, WorkspaceAccountingPageOnyxProps>({
        integrationImportStatus: {
            key: (props) => `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_STATUS}${props.route.params.policyID}`,
        },
    })(WorkspaceAccountingPage),
);
