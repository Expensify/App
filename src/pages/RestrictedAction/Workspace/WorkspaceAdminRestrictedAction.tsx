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
import {getPolicy} from '@libs/PolicyUtils';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';

type WorkspaceAdminRestrictedActionProps = {
    policyID: string;
};

function WorkspaceAdminRestrictedAction({policyID}: WorkspaceAdminRestrictedActionProps) {
    const illustrations = useMemoizedLazyIllustrations(['LockClosedOrange'] as const);
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const styles = useThemeStyles();

    const openAdminsReport = useCallback(() => {
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const reportID = getPolicy(policyID)?.chatReportIDAdmins;
        Navigation.closeRHPFlow();
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID ? String(reportID) : undefined));
    }, [policyID]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={WorkspaceAdminRestrictedAction.displayName}
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
                        {translate('workspace.restrictedAction.workspaceOwnerWillNeedToAddOrUpdatePaymentCard', {workspaceOwnerName: policy?.owner ?? ''})}
                    </Text>
                </View>
                <Button
                    text={translate('workspace.restrictedAction.chatInAdmins')}
                    onPress={openAdminsReport}
                    success
                    large
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

WorkspaceAdminRestrictedAction.displayName = 'WorkspaceAdminRestrictedAction';

export default WorkspaceAdminRestrictedAction;
