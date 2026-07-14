import Button from '@components/ButtonComposed';
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

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useCallback} from 'react';
import {View} from 'react-native';

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
                    <Text style={[styles.textHeadlineH1, styles.textAlignCenter, styles.breakWord]}>
                        {translate('workspace.restrictedAction.actionsAreCurrentlyRestricted', policy?.name ?? '')}
                    </Text>
                    <Text style={[styles.textLabelSupportingEmptyValue, styles.textAlignCenter, styles.lh20, styles.mt2]}>
                        {translate('workspace.restrictedAction.workspaceOwnerWillNeedToAddOrUpdatePaymentCard', policy?.owner ?? '')}
                    </Text>
                </View>
                <Button
                    onPress={openAdminsReport}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                >
                    <Button.Text>{translate('workspace.restrictedAction.chatInAdmins')}</Button.Text>
                </Button>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default WorkspaceAdminRestrictedAction;
