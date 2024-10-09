import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceCardSettingsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS>;

function WorkspaceCardSettingsPage({route}: WorkspaceCardSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID;
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);

    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`);

    const paymentBankAccountID = cardSettings?.paymentBankAccountID;
    const isMonthlySettlementAllowed = cardSettings?.isMonthlySettlementAllowed ?? false;
    const settlementFrequency = cardSettings?.monthlySettlementDate ? CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY : CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
    const isSettlementFrequencyBlocked = !isMonthlySettlementAllowed && settlementFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
    const bankAccountNumber = bankAccountList?.[paymentBankAccountID.toString()]?.accountData?.accountNumber ?? '';

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceCardSettingsPage.displayName}
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton title={translate('workspace.common.settings')} />
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <View>
                        <OfflineWithFeedback errorRowStyles={styles.mh5}>
                            <MenuItemWithTopDescription
                                description={translate('workspace.expensifyCard.settlementAccount')}
                                title={bankAccountNumber ? `${CONST.MASKED_PAN_PREFIX}${getLastFourDigits(bankAccountNumber)}` : ''}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT.getRoute(policyID))}
                            />
                        </OfflineWithFeedback>
                        <OfflineWithFeedback errorRowStyles={styles.mh5}>
                            <MenuItemWithTopDescription
                                description={translate('workspace.expensifyCard.settlementFrequency')}
                                title={translate(`workspace.expensifyCard.frequency.${settlementFrequency}`)}
                                shouldShowRightIcon={settlementFrequency !== CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY}
                                interactive={!isSettlementFrequencyBlocked}
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS_FREQUENCY.getRoute(policyID))}
                                hintText={
                                    isSettlementFrequencyBlocked ? (
                                        <>
                                            {translate('workspace.expensifyCard.settlementFrequencyInfo')}{' '}
                                            <TextLink
                                                href=""
                                                style={styles.label}
                                            >
                                                {translate('common.learnMore')}
                                            </TextLink>
                                        </>
                                    ) : undefined
                                }
                            />
                        </OfflineWithFeedback>
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCardSettingsPage.displayName = 'WorkspaceCardSettingsPage';

export default WorkspaceCardSettingsPage;
