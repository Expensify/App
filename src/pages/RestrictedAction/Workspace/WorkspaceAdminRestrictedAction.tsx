import React, {useCallback} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ImageSVG from '@components/ImageSVG';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';

type WorkspaceAdminRestrictedActionProps = {
    policyID: string;
};

function WorkspaceAdminRestrictedAction({policyID}: WorkspaceAdminRestrictedActionProps) {
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const styles = useThemeStyles();

    const openAdminsReport = useCallback(() => {
        const reportID = `${PolicyUtils.getPolicy(policyID)?.chatReportIDAdmins}`;
        Navigation.closeRHPFlow();
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
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
                        src={Illustrations.LockClosedOrange}
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
