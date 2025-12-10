import React, {useCallback} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImageSVG from '@components/ImageSVG';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {findPolicyExpenseChatByPolicyID} from '@libs/ReportUtils';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';

type WorkspaceUserRestrictedActionProps = {
    policyID: string;
};

function WorkspaceUserRestrictedAction({policyID}: WorkspaceUserRestrictedActionProps) {
    const illustrations = useMemoizedLazyIllustrations(['LockClosedOrange'] as const);
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const styles = useThemeStyles();

    const openPolicyExpenseReport = useCallback(() => {
        // eslint-disable-next-line rulesdir/no-default-id-values
        const reportID = findPolicyExpenseChatByPolicyID(policyID)?.reportID ?? '-1';
        Navigation.closeRHPFlow();
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
    }, [policyID]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={WorkspaceUserRestrictedAction.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.restrictedAction.restricted')}
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView
                style={[styles.p5, styles.pt0]}
                contentContainerStyle={styles.flexGrow1}
            >
                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.mb15]}>
                    <ImageSVG
                        src={illustrations.LockClosedOrange}
                        width={variables.restrictedActionIllustrationHeight}
                        height={variables.restrictedActionIllustrationHeight}
                    />
                    <Text style={[styles.textHeadlineH1, styles.textAlignCenter]}>
                        {translate('workspace.restrictedAction.actionsAreCurrentlyRestricted', {workspaceName: policy?.name ?? ''})}
                    </Text>
                    <Text style={[styles.textLabelSupportingEmptyValue, styles.textAlignCenter, styles.lh20, styles.mt2]}>
                        {translate('workspace.restrictedAction.pleaseReachOutToYourWorkspaceAdmin')}
                    </Text>
                </View>
                <Button
                    text={translate('workspace.restrictedAction.chatWithYourAdmin')}
                    onPress={openPolicyExpenseReport}
                    success
                    large
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

WorkspaceUserRestrictedAction.displayName = 'WorkspaceUserRestrictedAction';

export default WorkspaceUserRestrictedAction;
