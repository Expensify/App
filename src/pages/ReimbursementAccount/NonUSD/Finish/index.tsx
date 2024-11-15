import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function Finish() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const policyID = reimbursementAccount?.achData?.policyID ?? '-1';

    const handleBackButtonPress = () => {
        Navigation.goBack();
    };
    const handleNavigateToConciergeChat = () => Report.navigateToConciergeChat(true);

    return (
        <ScreenWrapper
            testID={Finish.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('finishStep.connect')}
                onBackButtonPress={handleBackButtonPress}
            />
            <ScrollView style={[styles.flex1]}>
                <Section
                    title={translate('finishStep.letsFinish')}
                    icon={Illustrations.ConciergeBubble}
                    containerStyles={[styles.mb8, styles.mh5]}
                    titleStyles={[styles.mb3, styles.textHeadline]}
                >
                    <Text style={[styles.mb6, styles.mt3, styles.textLabelSupportingEmptyValue]}>{translate('finishStep.thanksFor')}</Text>
                    <Button
                        iconStyles={[styles.customMarginButtonWithMenuItem]}
                        text={translate('finishStep.iHaveA')}
                        onPress={handleNavigateToConciergeChat}
                        icon={Expensicons.ChatBubble}
                        success
                        innerStyles={[styles.h13]}
                    />
                </Section>
                <Section
                    title={translate('finishStep.enable2FA')}
                    icon={Illustrations.ShieldYellow}
                    titleStyles={[styles.mb4, styles.textHeadline]}
                    containerStyles={[styles.mh5]}
                    menuItems={[
                        {
                            title: translate('finishStep.secure'),
                            onPress: () => {
                                Navigation.navigate(ROUTES.SETTINGS_2FA.getRoute(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute('', policyID)));
                            },
                            icon: Expensicons.Shield,
                            shouldShowRightIcon: true,
                            iconRight: Expensicons.NewWindow,
                            wrapperStyle: [styles.cardMenuItem],
                        },
                    ]}
                >
                    <View style={styles.mb6}>
                        <Text style={[styles.mt3, styles.textLabelSupportingEmptyValue]}>{translate('finishStep.weTake')}</Text>
                    </View>
                </Section>
            </ScrollView>
        </ScreenWrapper>
    );
}

Finish.displayName = 'Finish';

export default Finish;
