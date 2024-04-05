import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import * as PolicyActions from '@userActions/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceOwnerChangeSuccessPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.OWNER_CHANGE_ERROR>;

function WorkspaceOwnerChangeErrorPage({route}: WorkspaceOwnerChangeSuccessPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const accountID = Number(route.params.accountID) ?? 0;
    const policyID = route.params.policyID;

    const closePage = useCallback(() => {
        PolicyActions.clearWorkspaceOwnerChangeFlow(policyID);
        Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    }, [accountID, policyID]);

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <ScreenWrapper testID={WorkspaceOwnerChangeErrorPage.displayName}>
                    <HeaderWithBackButton
                        title={translate('workspace.changeOwner.changeOwnerPageTitle')}
                        onBackButtonPress={closePage}
                    />
                    <View style={[styles.screenCenteredContainer, styles.alignItemsCenter]}>
                        <Icon
                            src={Expensicons.MoneyWaving}
                            width={187}
                            height={173}
                            fill=""
                            additionalStyles={styles.mb3}
                        />
                        <Text style={[styles.textHeadline, styles.textAlignCenter, styles.mv2]}>{translate('workspace.changeOwner.errorTitle')}</Text>
                        <Text style={[styles.textAlignCenter, styles.textSupporting]}>
                            {translate('workspace.changeOwner.errorDescriptionPartOne')}{' '}
                            <TextLink href={`mailto:${CONST.EMAIL.CONCIERGE}`}>{translate('workspace.changeOwner.errorDescriptionPartTwo')}</TextLink>{' '}
                            {translate('workspace.changeOwner.errorDescriptionPartThree')}
                        </Text>
                    </View>
                    <FixedFooter>
                        <Button
                            success
                            large
                            text={translate('common.buttonConfirm')}
                            style={styles.mt6}
                            pressOnEnter
                            onPress={closePage}
                        />
                    </FixedFooter>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceOwnerChangeErrorPage.displayName = 'WorkspaceOwnerChangeErrorPage';

export default WorkspaceOwnerChangeErrorPage;
