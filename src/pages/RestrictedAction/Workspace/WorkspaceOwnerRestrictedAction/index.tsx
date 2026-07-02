import Badge from '@components/Badge';
import Button from '@components/ButtonComposed';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function WorkspaceOwnerRestrictedAction() {
    const illustrations = useMemoizedLazyIllustrations(['LockClosedOrange']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Unlock']);

    const addPaymentCard = () => {
        Navigation.dismissModal({
            afterTransition: () => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD),
        });
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="WorkspaceOwnerRestrictedAction"
        >
            <HeaderWithBackButton
                title={translate('workspace.restrictedAction.restricted')}
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView contentContainerStyle={[styles.ph5, styles.pt3]}>
                <View style={[styles.cardSectionContainer, styles.p5, styles.mb0, styles.mh0]}>
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsStart, styles.mb3]}>
                        <Icon
                            src={illustrations.LockClosedOrange}
                            height={variables.iconHeader}
                            width={variables.iconHeader}
                        />
                        <Badge
                            icon={expensifyIcons.Unlock}
                            success
                            text={translate('workspace.restrictedAction.addPaymentCardToUnlock')}
                            badgeStyles={styles.alignSelfStart}
                        />
                    </View>
                    <Text style={[styles.textHeadlineH1, styles.mb4]}>{translate('workspace.restrictedAction.addPaymentCardToContinueUsingWorkspace')}</Text>
                    <Text style={[styles.textLabelSupportingEmptyValue, styles.mb5]}>{translate('workspace.restrictedAction.youWillNeedToAddOrUpdatePaymentCard')}</Text>
                    <Button
                        onPress={addPaymentCard}
                        variant="success"
                        size={CONST.BUTTON_SIZE.LARGE}
                    >
                        <Button.Text>{translate('workspace.restrictedAction.addPaymentCard')}</Button.Text>
                    </Button>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default WorkspaceOwnerRestrictedAction;
