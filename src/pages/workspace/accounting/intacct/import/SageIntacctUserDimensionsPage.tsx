import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ConnectionLayout from '@components/ConnectionLayout';
import FixedFooter from '@components/FixedFooter';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SageIntacctUserDimensionsPage({policy}: WithPolicyProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';
    const userDimensions = policy?.connections?.intacct?.config?.mappings?.dimensions ?? [];

    return (
        <ConnectionLayout
            displayName={SageIntacctUserDimensionsPage.displayName}
            headerTitle="workspace.intacct.userDefinedDimension"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            shouldIncludeSafeAreaPaddingBottom
        >
            {userDimensions?.length === 0 ? (
                <View style={[styles.alignItemsCenter, styles.flex1, styles.justifyContentCenter]}>
                    <Icon
                        src={Illustrations.FolderWithPapers}
                        width={160}
                        height={100}
                    />

                    <View style={[styles.w100, styles.pt5]}>
                        <View style={[styles.justifyContentCenter]}>
                            <Text style={[styles.textHeadline, styles.emptyCardSectionTitle]}>{translate('workspace.intacct.addAUserDefinedDimension')}</Text>
                        </View>

                        <View style={[styles.ph5]}>
                            <Text>
                                <TextLink
                                    style={styles.link}
                                    onPress={() => {}}
                                >
                                    {translate('workspace.intacct.detailedInstructionsLink')}
                                </TextLink>
                                <Text style={[styles.textNormal, styles.emptySageIntacctUserDimensionsSubtitle]}>{translate('workspace.intacct.detailedInstructionsRestOfSentence')}</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View>
                    <View style={[styles.ph5]}>
                        <Text>
                            <TextLink
                                style={styles.link}
                                onPress={() => {
                                    Link.openExternalLink(CONST.SAGE_INTACCT_INSTRUCTIONS);
                                }}
                            >
                                {translate('workspace.intacct.detailedInstructionsLink')}
                            </TextLink>
                            <Text style={[styles.textNormal, styles.sageIntacctUserDimensionsSubtitle]}>{translate('workspace.intacct.detailedInstructionsRestOfSentence')}</Text>
                        </Text>
                    </View>

                    {userDimensions.map((userDimension) => (
                        <OfflineWithFeedback
                            key={userDimension.name}
                            pendingAction={userDimension.pendingAction}
                        >
                            <MenuItemWithTopDescription
                                title={userDimension.name}
                                description="User-defined dimension"
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EDIT_USER_DIMENSION.getRoute(policyID, userDimension.name))}
                                brickRoadIndicator={userDimension.errors ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            />
                        </OfflineWithFeedback>
                    ))}
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
