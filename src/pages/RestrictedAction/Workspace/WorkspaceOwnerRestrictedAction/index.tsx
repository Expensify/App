import Badge from '@components/Badge';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getActiveTabName from '@libs/Navigation/helpers/getActiveTabName';
import getTopmostFullScreenRoute from '@libs/Navigation/helpers/getTopmostFullScreenRoute';
import runAfterClosingScreenUnmount from '@libs/Navigation/helpers/runAfterClosingScreenUnmount';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function WorkspaceOwnerRestrictedAction() {
    const illustrations = useMemoizedLazyIllustrations(['LockClosedOrange']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Unlock']);

    const openPaymentCardForm = () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ADD_PAYMENT_CARD.path, ROUTES.SETTINGS_SUBSCRIPTION.route));

    const addPaymentCard = () => {
        Navigation.dismissModal({
            // The transition ends a moment before React removes this screen. Opening the card form in that gap shows
            // this screen again for a frame, so wait until it is gone.
            afterTransition: () =>
                runAfterClosingScreenUnmount(() => {
                    // Opening the form from another tab switches to Subscription underneath it on its own. Opening
                    // Subscription first from there would push a second tab navigator and make the form stutter.
                    // Only another Settings page, such as Profile, would stay under the form, so open Subscription first there.
                    const isOnSettingsTab = getActiveTabName(getTopmostFullScreenRoute()) === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR;
                    const shouldOpenSubscriptionFirst = isOnSettingsTab && !Navigation.isActiveRoute(ROUTES.SETTINGS_SUBSCRIPTION.route);
                    if (!shouldOpenSubscriptionFirst) {
                        openPaymentCardForm();
                        return;
                    }

                    Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.route, {afterTransition: openPaymentCardForm});
                }),
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
                        sentryLabel={CONST.SENTRY_LABEL.RESTRICTED_ACTION.OWNER_ADD_PAYMENT_CARD}
                        onPress={addPaymentCard}
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
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
