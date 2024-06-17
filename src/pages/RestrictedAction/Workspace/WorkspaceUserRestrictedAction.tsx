import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ImageSVG from '@components/ImageSVG';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Report from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type WorkspaceUserRestrictedActionProps = {
    policyID: string;
};

function WorkspaceUserRestrictedAction({policyID}: WorkspaceUserRestrictedActionProps) {
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const styles = useThemeStyles();

    const onPress = useCallback(() => {
        const reportID = ReportUtils.findPolicyExpenseChatByPolicyID(policyID)?.reportID ?? '-1';
        Report.openReport(reportID);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
    }, [policyID]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={WorkspaceUserRestrictedAction.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.restrictedAction.restricted')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={[styles.flex1, styles.p5, styles.pt0]}>
                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.mb15]}>
                    <ImageSVG
                        src={Illustrations.LockClosedOrange}
                        width={136}
                        height={136}
                    />
                    <Text style={[styles.textHeadlineH1, styles.textAlignCenter]}>
                        {translate('workspace.restrictedAction.expensesAreCurrentlyRestricted', {workspaceName: policy?.name})}
                    </Text>
                    <Text style={[styles.textLabelSupportingEmptyValue, styles.textAlignCenter, styles.lh20, styles.mt2]}>
                        {translate('workspace.restrictedAction.pleaseReachOutToYourWorkspaceAdmin')}
                    </Text>
                </View>
                <Button
                    text={translate('workspace.restrictedAction.chatWithYourAdmin')}
                    onPress={onPress}
                    success
                />
            </View>
        </ScreenWrapper>
    );
}

WorkspaceUserRestrictedAction.displayName = 'WorkspaceUserRestrictedAction';

export default WorkspaceUserRestrictedAction;
