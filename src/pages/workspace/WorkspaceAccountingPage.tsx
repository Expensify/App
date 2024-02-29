import React, { useState } from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import * as Link from '@userActions/Link';
import Button from '@components/Button';
import type {Policy, WorkspaceIntegrationImportStatus} from '@src/types/onyx';
import { getQuickBooksOnlineSetupLink } from '@libs/actions/Integrations/QuickBooksOnline';
import useLocalize from '@hooks/useLocalize';
import useEnvironment from '@hooks/useEnvironment';
import { removeWorkspaceIntegration } from '@libs/actions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type { OnyxEntry} from 'react-native-onyx';
import { withOnyx } from 'react-native-onyx';
import Section from '@components/Section';
import useThemeStyles from '@hooks/useThemeStyles';
import { View } from 'react-native';
import variables from '@styles/variables';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import useTheme from '@hooks/useTheme';
import { ActivityIndicator } from 'react-native';
import type { WithPolicyAndFullscreenLoadingProps } from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import IntegrationSyncProgress from './integrations/IntegrationSyncProgress';

// type QBOResponse = {
//     oauthToken: {
//         // eslint-disable-next-line @typescript-eslint/naming-convention
//         access_token: string;
//         companyID: string;
//         companyName: string;
//         expires: number;
//         realmId: string;
//         // eslint-disable-next-line @typescript-eslint/naming-convention
//         refresh_token: string;
//         scope: string;
//         // eslint-disable-next-line @typescript-eslint/naming-convention
//         token_type: string;
//     },
//     responseCode: number;
// };

type WorkspaceAccountingPageOnyxProps = {
    /** From Onyx */
    /** Bank account attached to free plan */
    integrationImportStatus: OnyxEntry<WorkspaceIntegrationImportStatus>;
};

type WorkspaceAccountingPageProps = WithPolicyAndFullscreenLoadingProps & WorkspaceAccountingPageOnyxProps & {
        /** Policy values needed in the component */
        policy: OnyxEntry<Policy>;
    };

// Sample route
// https://dev.new.expensify.com:8082/workspace/ED2B31F545CCC013?qbo_response=%7B%22oauthToken%22%3A%7B%22access_token%22%3A%22WHqfg7C1fGcg1ZUJyUakCDXk%2BHw1GGyQrrSAXMyOag7oIS1upWvHsKjsk7wrGgBw5tD4rPJUXZTUcbptgKe%5C%2FXn%5C%2FhLfM99KpYsKZTzu7V%5C%2FJz%5C%2FjUupHOHUAIpg07qZLbOsui0TtYr6QY8tqqUKpEmW21Va38EfSh4eySiTijaSeEtjiD76yWdxKWPWc0vRORqknyyRYGYdYsWbJGgkr6wKxCH3liFdoHM666lrXa81qdnJ1vDB8UVQlf2Wcb923HuLXbhXBFKKZt%5C%2FJTXTC6pUhGtHgTjvxBPAiHBLUR%5C%2Fco7P3SQrV0wuMb4pM1NQePqhWYmg37gtSVio8Og6ye0Sk6hGByK%2Bg6I1iGdkSxG%5C%2F0SjX0FsqZX0hse6Gv1%2Bgz7tDVHnL5vazqyxWEaNwC2DrZ%2BoqnNXPGECID2sGCexHXQv6eL2QVJRI1YKYYH6UNimvILDNkyXkQUVS0lum73F5xCpCnJdFOH4Yvl2H9s8zYjxquHDElA0YFhoD7zszDacXEjDfqImIO%5C%2FUSmQ13alE2y1eeoeZMc86r21wtXsd6o9GCtOQ0IPPr6LBTxh4Z87qRnFXj6%5C%2F%2Bduore3wetatZiihQMjAXpbSVuevsKPK5LjV3ozxMoTpZ8uA%2BdOep8rRfnsOcVTltD5%5C%2FOzHjWkIY%5C%2F90c1x%2B4uNxuc4OhLZ59PyaWcMuMgorUsLwmdD0%2BcyhnkFFPt9jZELAA27%5C%2FwxY5b1t7i0fm7HqFcJK0SjpIIQVy97C63NsFrs%5C%2F2bU%2BOcO3LLD9AoBSiYcYSIBRvPtPJsBJ93q6V4ddcDGrIOdQpOZWkti7xd%2B7yIG%5C%2FqT7cf8DqFsGQlpQg5lhRRnatJa%2BLxPQ36dyXDI1Q3iAx5ynXfxRs8YfAsOJ1BIm%5C%2FOL5jixbeS6eemVZOT4nAyLkftVmviGHnkzyIazrHi2VAekJmL9UmXM26MhpYAEOglIXdEXjVY8bfpXZjP42ZMn9K7xZCf%2B3PVcD1%5C%2F%2BL0xpxEiA4puKXsgroMj2nia8dHDMkDOo8gxhdPEpgUMkTz%5C%2FIFq%5C%2FHD27zCWdO1t74ixI0RwBwD3tquigh4wU%3D%3BT7TWITZacuRtYCB0RL9O%5C%2FQ%3D%3D%3BWKSNgTZ27bqa7OM%2B1qTdZdRSPY4IxbUKc7fvfGa5YrfvXUC3uSbQaMl1J6MaYXGtbo8IeI1LiJR%5C%2FN%5C%2FI%2BvS%5C%2FAAw%3D%3D%22%2C%22refresh_token%22%3A%22O%5C%2Fby0XaqkcaKiuIaSeEuzHoi3G%5C%2FpLWuSzHCMeCgKWHRwo2G3jzX8EjB5fvEhb7jMtNaRjPE4nB9gXd5harGahQ%3D%3D%3BnhSjDjlrCpczH%2BZzczE6pg%3D%3D%3BX4z3M8gWLNc6fZHxNckmvCQrJlaAKlO%5C%2FFsuHhPZCrjQ7aIHRPslRgC1Fqy7CxVy04pkk6Jbf8aOOwkh6uezLpA%3D%3D%22%2C%22expires%22%3A1706575744%2C%22companyID%22%3A%221423559500%22%2C%22realmId%22%3A%221423559500%22%2C%22scope%22%3A%22Accounting%22%2C%22companyName%22%3A%22Expensify%22%2C%22token_type%22%3A%22bearer%22%7D%2C%22responseCode%22%3A200%7D

function WorkspaceAccountingPage({
    policy,
    integrationImportStatus,
}: WorkspaceAccountingPageProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {environmentURL} = useEnvironment();
    const {translate} = useLocalize();
    const [triggeredSyncManually, setTriggeredSyncManually] = useState<boolean>(false);

    const quickbooksOnlineSyncStatus = integrationImportStatus?.quickbooksOnline ?? null;
    
    // const qboResponse = useMemo(() : QBOResponse | null => {
    //     if (!route?.params.qbo_response) {
    //         return null;
    //     }
    //     return JSON.parse(route.params.qbo_response) as QBOResponse;
    // }, [route?.params.qbo_response]);
    // console.log('qboResponse', qboResponse);
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
                        subtitle={"Connect to your accounting..."} // translated, of course
                        title={"Connections"} // translated, of course
                        containerStyles={[styles.p0, styles.pv5]}
                        titleStyles={[styles.ph5]}
                        subtitleStyles={[styles.ph5]}
                        >
                        <View style={[styles.flexRow]}> 
                            <Icon 
                                src={Expensicons.ExpensifyLogoNew}
                                width={variables.appModalAppIconSize}
                                height={variables.appModalAppIconSize}
                                fill={theme.success}
                            />
                            <View>
                                <Text>QuickBooks online</Text>
                                <Text style={[styles.textSupporting]}>Syncing connections</Text>
                            </View>
                            <ActivityIndicator
                                color={theme.success}
                                size="small"
                            />
                        </View>
                    </Section>
                    <>
                        {!policy?.connections?.quickbooksOnline &&
                            <Button
                                onPress={() => {
                                    setTriggeredSyncManually(true);
                                    Link.openLink(getQuickBooksOnlineSetupLink(policy.id), environmentURL, false);
                                }}
                            >
                                <Text>Quickbooks Online Setup</Text>
                            </Button>
                        }
                        {Boolean(policy?.connections?.quickbooksOnline) && (
                            <>
                                <Button onPress={() => alert('ahh!')}>
                                    <Text>Import</Text>
                                </Button>
                                <Button onPress={() => alert('ahh!')}>
                                    <Text>Import</Text>
                                </Button>
                                <Button onPress={() => removeWorkspaceIntegration(policy.id, 'quickbooksOnline')}>
                                    <Text>Disconnect</Text>
                                </Button>
                            </>
                        )}
                    </>
                </>
            )}
            {quickbooksOnlineSyncStatus !== null && quickbooksOnlineSyncStatus.status !== 'finished' && triggeredSyncManually && (
                <IntegrationSyncProgress
                    syncStatus={quickbooksOnlineSyncStatus}
                    onClose={() => setTriggeredSyncManually(true)}
                />
            )}
        </ScreenWrapper>
    );
}

WorkspaceAccountingPage.displayName = 'WorkspaceAccountingPage';

export default withPolicyAndFullscreenLoading(
    withOnyx<WorkspaceAccountingPageProps, WorkspaceAccountingPageOnyxProps>({
        integrationImportStatus: {
            key: (props) => `${ONYXKEYS.COLLECTION.POLICY_INTEGRATION_IMPORT_STATUS}${props.route.params.policyID}`,
        },
    })(WorkspaceAccountingPage),
);
