import React, {useCallback} from 'react';
import {View} from 'react-native';
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
import {findPolicyExpenseChatByPolicyID} from '@libs/ReportUtils';

import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useCallback} from 'react';
import {View} from 'react-native';

type WorkspaceUserRestrictedActionProps = {
    policyID: string;
};

function WorkspaceUserRestrictedAction({policyID}: WorkspaceUserRestrictedActionProps) {
    const illustrations = useMemoizedLazyIllustrations(['LockClosedOrange']);
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
            testID="WorkspaceUserRestrictedAction"
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
                        {translate('workspace.restrictedAction.pleaseReachOutToYourWorkspaceAdmin')}
                    </Text>
                </View>
                <Button
                    onPress={openPolicyExpenseReport}
                    variant="success"
                    size={CONST.BUTTON_SIZE.LARGE}
                >
                    <Button.Text>{translate('workspace.restrictedAction.chatWithYourAdmin')}</Button.Text>
                </Button>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default WorkspaceUserRestrictedAction;
