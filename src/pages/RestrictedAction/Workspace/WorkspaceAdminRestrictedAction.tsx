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
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';

type WorkspaceAdminRestrictedActionProps = {
    policyID: string;
};

function WorkspaceAdminRestrictedAction({policyID}: WorkspaceAdminRestrictedActionProps) {
    const illustrations = useMemoizedLazyIllustrations(['LockClosedOrange']);
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const styles = useThemeStyles();

    const openAdminsReport = useCallback(() => {
        const reportID = policy?.chatReportIDAdmins?.toString();
        Navigation.closeRHPFlow();
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
    }, [policy?.chatReportIDAdmins]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="WorkspaceAdminRestrictedAction"
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
                    <Text style={[styles.textHeadlineH1, styles.textAlignCenter]}>{translate('workspace.restrictedAction.actionsAreCurrentlyRestricted', policy?.name ?? '')}</Text>
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

export default WorkspaceAdminRestrictedAction;
