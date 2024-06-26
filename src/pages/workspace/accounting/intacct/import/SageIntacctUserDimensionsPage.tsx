import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ConnectionLayout from '@components/ConnectionLayout';
import FixedFooter from '@components/FixedFooter';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SageIntacctUserDimensionsPage({policy}: WithPolicyProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';

    return (
        <ConnectionLayout
            displayName={SageIntacctUserDimensionsPage.displayName}
            headerTitle="User-defined dimensions"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            {true && ( // jak puste
                <View style={[styles.alignItemsCenter, styles.flex1, styles.justifyContentCenter]}>
                    <Icon
                        src={Illustrations.FolderWithPapers}
                        width={160}
                        height={100}
                    />

                    <View style={[styles.w100, styles.pt5]}>
                        <View style={[styles.justifyContentCenter]}>
                            <Text style={[styles.textHeadline, styles.emptyCardSectionTitle]}>Add a user-defined dimension</Text>
                        </View>

                        <View style={[styles.justifyContentCenter]}>
                            <Text style={[styles.textNormal, styles.emptyCardSectionSubtitle]}>View detailed instructions on adding user-defined dimensions.</Text>
                        </View>
                    </View>
                </View>
            )}
            <FixedFooter style={[styles.mtAuto]}>
                <Button
                    success
                    text={translate('workspace.intacct.addUserDefinedDimension')}
                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADD_USER_DIMENSION.getRoute(policyID))}
                    pressOnEnter
                    large
                />
            </FixedFooter>
        </ConnectionLayout>
    );
}

SageIntacctUserDimensionsPage.displayName = 'PolicySageIntacctUserDimensionsPage';

export default withPolicy(SageIntacctUserDimensionsPage);
