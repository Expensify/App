import Button from '@components/Button';
import ConnectionLayout from '@components/ConnectionLayout';
import FixedFooter from '@components/FixedFooter';
import Text from '@components/Text';

import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {isAuthenticationError} from '@libs/actions/connections';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

import connectToZohoBooksOAuth from './connectToZohoBooksOAuth';

type ZohoBooksSetupPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.ZOHO_BOOKS_SETUP>;

function ZohoBooksSetupPage({route}: ZohoBooksSetupPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const policyID = route.params.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const config = policy?.connections?.zohoBooks?.config;
    const shouldBeBlocked = !!config?.isConfigured && !isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS);

    return (
        <ConnectionLayout
            displayName="ZohoBooksSetupPage"
            headerTitle="workspace.zohoBooks.zohoBooksSetup"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS}
            shouldBeBlocked={shouldBeBlocked}
            shouldLoadForEmptyConnection
            shouldUseScrollView={false}
        >
            <View style={styles.flex1}>
                <Text style={[styles.textHeadlineH1, styles.ph5, styles.pt3]}>{translate('workspace.zohoBooks.connectTitle')}</Text>
                <Text style={[styles.ph5, styles.pv3, styles.flex1]}>{translate('workspace.zohoBooks.connectDescription')}</Text>
                <FixedFooter>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        onPress={() => connectToZohoBooksOAuth(policyID, environmentURL)}
                    >
                        <Button.Text>{translate('workspace.zohoBooks.connect')}</Button.Text>
                    </Button>
                </FixedFooter>
            </View>
        </ConnectionLayout>
    );
}

export default ZohoBooksSetupPage;
