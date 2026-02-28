import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ConnectionLayout from '@components/ConnectionLayout';
import FixedFooter from '@components/FixedFooter';
import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import {openExternalLink} from '@userActions/Link';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SageIntacctUserDimensionsPage({policy}: WithPolicyProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['FolderWithPapers']);

    // eslint-disable-next-line rulesdir/no-default-id-values
    const policyID = policy?.id ?? '-1';
    const config = policy?.connections?.intacct?.config;
    const userDimensions = policy?.connections?.intacct?.config?.mappings?.dimensions ?? [];

    return (
        <ConnectionLayout
            displayName="SageIntacctUserDimensionsPage"
            headerTitle="workspace.intacct.userDefinedDimension"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            shouldUseScrollView={false}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT.getRoute(policyID))}
        >
            {userDimensions?.length === 0 ? (
                <View style={[styles.alignItemsCenter, styles.flex1, styles.justifyContentCenter]}>
                    <Icon
                        src={illustrations.FolderWithPapers}
                        width={160}
                        height={100}
                    />

                    <View style={[styles.w100, styles.pt5]}>
                        <View style={[styles.justifyContentCenter, styles.ph5]}>
                            <Text style={[styles.notFoundTextHeader]}>{translate('workspace.intacct.addAUserDefinedDimension')}</Text>
                        </View>

                        <View style={[styles.ph5]}>
                            <Text style={[styles.textAlignCenter]}>
                                <TextLink
                                    style={styles.link}
                                    onPress={() => {
                                        openExternalLink(CONST.SAGE_INTACCT_INSTRUCTIONS);
                                    }}
                                >
                                    {translate('workspace.intacct.detailedInstructionsLink')}
                                </TextLink>
                                <Text>{translate('workspace.intacct.detailedInstructionsRestOfSentence')}</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            ) : (
                <>
                    <View style={[styles.ph5]}>
                        <Text style={[styles.textAlignLeft]}>
                            <TextLink
                                style={styles.link}
                                onPress={() => {
                                    openExternalLink(CONST.SAGE_INTACCT_INSTRUCTIONS);
                                }}
                            >
                                {translate('workspace.intacct.detailedInstructionsLink')}
                            </TextLink>
                            <Text>{translate('workspace.intacct.detailedInstructionsRestOfSentence')}</Text>
                        </Text>
                    </View>
                    <ScrollView addBottomSafeAreaPadding>
                        {userDimensions.map((userDimension) => (
                            <OfflineWithFeedback
                                key={userDimension.dimension}
                                pendingAction={settingsPendingAction([`${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${userDimension.dimension}`], config?.pendingFields)}
                            >
                                <MenuItemWithTopDescription
                                    title={userDimension.dimension}
                                    description={translate('workspace.intacct.userDefinedDimension')}
                                    shouldShowRightIcon
                                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EDIT_USER_DIMENSION.getRoute(policyID, userDimension.dimension))}
                                    brickRoadIndicator={
                                        areSettingsInErrorFields([`${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${userDimension.dimension}`], config?.errorFields)
                                            ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                            : undefined
                                    }
                                />
                            </OfflineWithFeedback>
                        ))}
                    </ScrollView>
                </>
            )}
            <FixedFooter
                style={[styles.mt5]}
                addBottomSafeAreaPadding
            >
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

export default withPolicy(SageIntacctUserDimensionsPage);
