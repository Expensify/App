import React, {useCallback} from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Report from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import ROUTES from '@src/ROUTES';

type WorkspaceUserRestrictedActionProps = {
    policyID: string;
};

function WorkspaceUserRestrictedAction({policyID}: WorkspaceUserRestrictedActionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const onPress = useCallback(() => {
        const reportID = `${PolicyUtils.getPolicy(policyID)?.chatReportIDAdmins}` ?? '-1';
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
            <View style={[styles.cardSectionContainer, styles.p5]}>
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsStart, styles.mb3]}>
                    <Icon
                        src={Illustrations.LockClosedOrange}
                        height={48}
                        width={48}
                    />
                    <Badge
                        icon={Expensicons.Unlock}
                        success
                        text={translate('workspace.restrictedAction.addPaymentCardToUnlock')}
                        badgeStyles={styles.alignSelfStart}
                    />
                </View>
                <Text style={[styles.textHeadlineH1, styles.mb4]}>{translate('workspace.restrictedAction.addPaymentCardToContinueUsingWorkspace')}</Text>
                <Text style={[styles.textLabelSupportingEmptyValue, styles.mb5]}>{translate('workspace.restrictedAction.youWillNeedToAddOrUpdatePaymentCard')}</Text>
                <Button
                    text={translate('workspace.restrictedAction.addPaymentCard')}
                    onPress={onPress}
                    success
                />
            </View>
        </ScreenWrapper>
    );
}

WorkspaceUserRestrictedAction.displayName = 'WorkspaceUserRestrictedAction';

export default WorkspaceUserRestrictedAction;
