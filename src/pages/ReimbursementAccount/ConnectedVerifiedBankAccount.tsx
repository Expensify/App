import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import MenuItem from '@components/MenuItem';
import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';
import MenuItemNavigation from '@components/MenuItem/presets/MenuItemNavigation';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';

import useChangeBankAccount from '@hooks/useChangeBankAccount';
import {useMemoizedLazyAsset, useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResetBankAccountModal from '@hooks/useResetBankAccountModal';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {requestResetBankAccount, resetReimbursementAccount} from '@userActions/ReimbursementAccount';

import CONST from '@src/CONST';
import type {ReimbursementAccount} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type ConnectedVerifiedBankAccountProps = {
    /** Bank account currently in setup */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: () => void;

    /** Method to set the state of shouldShowConnectedVerifiedBankAccount */
    setShouldShowConnectedVerifiedBankAccount?: (shouldShowConnectedVerifiedBankAccount: boolean) => void;

    /** Method to set the state of USD bank account step */
    setUSDBankAccountStep?: (step: string | null) => void;

    /** Whether the workspace currency is set to non USD currency */
    isNonUSDWorkspace: boolean;
};

function ConnectedVerifiedBankAccount({
    reimbursementAccount,
    onBackButtonPress,
    setShouldShowConnectedVerifiedBankAccount,
    setUSDBankAccountStep,
    isNonUSDWorkspace,
}: ConnectedVerifiedBankAccountProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const {icon, iconSize, iconStyles} = getBankIcon({bankName: reimbursementAccount?.achData?.bankName, styles});

    const formattedBankAccountNumber = reimbursementAccount?.achData?.accountNumber
        ? `${translate('bankAccount.accountEnding')} ${reimbursementAccount?.achData?.accountNumber.slice(-4)}`
        : '';
    const bankAccountOwnerName = reimbursementAccount?.achData?.addressName;
    const errors = reimbursementAccount?.errors ?? {};
    const pendingAction = reimbursementAccount?.pendingAction;
    const {asset: ThumbsUpStars} = useMemoizedLazyAsset(() => loadIllustration('ThumbsUpStars' as IllustrationName));
    const icons = useMemoizedLazyExpensifyIcons(['Bank', 'Close']);
    const policyID = reimbursementAccount?.achData?.policyID;
    const currency = reimbursementAccount?.achData?.currency;
    const shouldShowChangeBankAccount = !!policyID && !!currency;
    const handleChangeBankAccount = useChangeBankAccount(policyID, currency, reimbursementAccount?.achData?.bankAccountID);

    useResetBankAccountModal({
        reimbursementAccount,
        isNonUSDWorkspace,
        setShouldShowConnectedVerifiedBankAccount,
        setUSDBankAccountStep,
    });

    return (
        <ScreenWrapper
            testID="ConnectedVerifiedBankAccount"
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            style={[styles.flex1, styles.justifyContentBetween, styles.mh2]}
        >
            <HeaderWithBackButton
                title={translate('bankAccount.addBankAccount')}
                onBackButtonPress={onBackButtonPress}
            />
            <ScrollView style={[styles.flex1]}>
                <Section
                    title={translate('workspace.bankAccount.allSet')}
                    icon={ThumbsUpStars}
                >
                    <OfflineWithFeedback
                        pendingAction={pendingAction}
                        errors={errors}
                        shouldShowErrorMessages
                        onClose={resetReimbursementAccount}
                    >
                        <View style={[styles.mt3, styles.justifyContentCenter, styles.mhn5]}>
                            <MenuItem.Root>
                                <MenuItem.Row>
                                    <MenuItem.Leading>
                                        <View style={[styles.popoverMenuIcon, iconStyles, StyleUtils.getAvatarWidthStyle(CONST.AVATAR_SIZE.DEFAULT)]}>
                                            <Icon
                                                src={icon}
                                                width={iconSize}
                                                height={iconSize}
                                            />
                                        </View>
                                    </MenuItem.Leading>
                                    <MenuItem.Content>
                                        <MenuItem.Title>{bankAccountOwnerName ?? ''}</MenuItem.Title>
                                        <MenuItem.Description>{formattedBankAccountNumber}</MenuItem.Description>
                                    </MenuItem.Content>
                                </MenuItem.Row>
                            </MenuItem.Root>
                        </View>
                        <Text style={[styles.mv3]}>{translate('workspace.bankAccount.accountDescriptionWithCards')}</Text>
                        <View style={styles.mhn5}>
                            {shouldShowChangeBankAccount && (
                                <MenuItemNavigation
                                    title={translate('workspace.bankAccount.changeBankAccount')}
                                    icon={icons.Bank}
                                    onPress={handleChangeBankAccount}
                                    isDisabled={!!pendingAction || !isEmptyObject(errors)}
                                />
                            )}
                            <MenuItemAction
                                title={translate('workspace.bankAccount.disconnectBankAccount')}
                                icon={icons.Close}
                                onPress={requestResetBankAccount}
                                isDisabled={!!pendingAction || !isEmptyObject(errors)}
                            />
                        </View>
                    </OfflineWithFeedback>
                </Section>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default ConnectedVerifiedBankAccount;
