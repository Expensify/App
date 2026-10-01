import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import {navigateToConciergeChat} from '@userActions/Report';
import {requestEmailUnblock} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useEffect} from 'react';
import {View} from 'react-native';

function EmailIssuePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();

    const [account, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT);
    const {login, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});

    const hasEmailDeliveryFailure = !!account?.hasEmailDeliveryFailure;
    const isUnblockingEmail = !!account?.isUnblockingEmail;
    const prevIsUnblockingEmail = usePrevious(isUnblockingEmail);

    // Leave whenever the flag is false while this page is mounted. This covers both a successful unblock
    // (the flag clears, so we dismiss) and landing here via a stale deep link when there was never a failure.
    // Wait for the account to finish loading first, otherwise a still-loading `false` triggers a spurious redirect.
    useEffect(() => {
        if (isLoadingOnyxValue(accountMetadata) || hasEmailDeliveryFailure) {
            return;
        }
        Navigation.goBack();
    }, [accountMetadata, hasEmailDeliveryFailure]);

    // The request has finished once isUnblockingEmail falls from true to false. A backend failure still
    // returns 200, so if the flag is still set the unblock did not take. Surface the single generic retry modal.
    useEffect(() => {
        if (!prevIsUnblockingEmail || isUnblockingEmail || !hasEmailDeliveryFailure) {
            return;
        }
        showConfirmModal({
            title: translate('emailIssuePage.errorTitle'),
            prompt: translate('emailIssuePage.errorPrompt'),
            confirmText: translate('common.tryAgain'),
            cancelText: translate('common.dismiss'),
            shouldShowCancelButton: true,
            shouldDisableConfirmButtonWhenOffline: true,
        }).then((result) => {
            if (result?.action !== ModalActions.CONFIRM) {
                return;
            }
            requestEmailUnblock();
        });
    }, [prevIsUnblockingEmail, isUnblockingEmail, hasEmailDeliveryFailure, showConfirmModal, translate]);

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
            testID="EmailIssuePage"
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton title={translate('emailIssuePage.title')} />
            <ScrollView
                style={styles.flex1}
                contentContainerStyle={[styles.flexGrow1, styles.ph5]}
            >
                <View style={[styles.pt3, styles.gap5]}>
                    <View style={[styles.renderHTML, styles.webViewStyles.baseFontStyle]}>
                        <RenderHTML html={translate('emailIssuePage.intro', login ?? '')} />
                    </View>
                    <View style={styles.gap1}>
                        <Text style={styles.textHeadlineH2}>{`1. ${translate('emailIssuePage.confirmEmailTitle')}`}</Text>
                        <View style={[styles.renderHTML, styles.webViewStyles.baseFontStyle]}>
                            <RenderHTML html={translate('emailIssuePage.confirmEmailDescription', login ?? '')} />
                        </View>
                    </View>
                    <View style={styles.gap1}>
                        <Text style={styles.textHeadlineH2}>{`2. ${translate('emailIssuePage.allowlistTitle')}`}</Text>
                        <View style={[styles.renderHTML, styles.webViewStyles.baseFontStyle]}>
                            <RenderHTML html={translate('emailIssuePage.allowlistDescription')} />
                        </View>
                    </View>
                </View>
            </ScrollView>
            <FixedFooter style={styles.gap2}>
                <Button
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={() => {
                        navigateToConciergeChat({conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, shouldDismissModal: false});
                    }}
                >
                    <Button.Text>{translate('emailIssuePage.getHelpFromConcierge')}</Button.Text>
                </Button>
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    isLoading={isUnblockingEmail}
                    isDisabled={isOffline}
                    onPress={() => requestEmailUnblock()}
                >
                    <Button.Text>{translate('emailIssuePage.completedSteps')}</Button.Text>
                </Button>
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default EmailIssuePage;
