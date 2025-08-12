import React from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import type SCREENS from '@src/SCREENS';

type ConfirmInviteReceiptPartnerPolicyPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS_INVITE_CONFIRM>;

function ConfirmInviteReceiptPartnerPolicyPage({route}: ConfirmInviteReceiptPartnerPolicyPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    const handleGotIt = () => {
        Navigation.dismissModal();
    };

    return (
        <ScreenWrapper testID={ConfirmInviteReceiptPartnerPolicyPage.displayName}>
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton
                    title={translate('workspace.receiptPartners.allSet')}
                    onBackButtonPress={() => Navigation.dismissModal()}
                />
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.ph5]}>
                    <View style={[styles.alignItemsCenter, styles.mv5]}>
                        <Text style={[styles.textHeadline, styles.textAlignCenter, styles.mv3]}>{translate('workspace.receiptPartners.readyToRoll')}</Text>
                        <Text style={[styles.textSupporting, styles.textAlignCenter, styles.mb5]}>{translate('workspace.receiptPartners.takeBusinessRideMessage')}</Text>
                    </View>

                    <View style={[styles.w100, styles.pb5]}>
                        <Button
                            success
                            large
                            text={translate('common.buttonConfirm')}
                            onPress={handleGotIt}
                            style={[styles.w100]}
                        />
                    </View>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ConfirmInviteReceiptPartnerPolicyPage.displayName = 'ConfirmInviteReceiptPartnerPolicyPage';

export default ConfirmInviteReceiptPartnerPolicyPage;
