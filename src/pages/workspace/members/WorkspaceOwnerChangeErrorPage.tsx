import React, {useCallback} from 'react';
import {InteractionManager, View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {clearWorkspaceOwnerChangeFlow} from '@userActions/Policy/Member';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceOwnerChangeSuccessPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.OWNER_CHANGE_ERROR>;

function WorkspaceOwnerChangeErrorPage({route}: WorkspaceOwnerChangeSuccessPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const accountID = Number(route.params.accountID) ?? -1;
    const policyID = route.params.policyID;
    const backTo = route.params.backTo;

    const closePage = useCallback(() => {
        if (backTo) {
            Navigation.goBack(backTo);
        } else {
            Navigation.goBack();
            Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
        }
        InteractionManager.runAfterInteractions(() => {
            clearWorkspaceOwnerChangeFlow(policyID);
        });
    }, [accountID, backTo, policyID]);

    const policy = usePolicy(policyID);
    const shouldShow = !policy?.errorFields && policy?.isChangeOwnerFailed;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            shouldBeBlocked={!shouldShow}
        >
            <ScreenWrapper
                testID={WorkspaceOwnerChangeErrorPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
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
                    <View style={[styles.renderHTML, styles.flexRow]}>
                        <RenderHTML html={translate('workspace.changeOwner.errorDescription')} />
                    </View>
                </View>
                <FixedFooter addBottomSafeAreaPadding>
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
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceOwnerChangeErrorPage.displayName = 'WorkspaceOwnerChangeErrorPage';

export default WorkspaceOwnerChangeErrorPage;
