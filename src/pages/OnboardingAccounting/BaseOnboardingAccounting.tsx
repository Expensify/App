import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineIndicator from '@components/OfflineIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import OnboardingListItem from '@components/SelectionList/OnboardingListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OnboardingFlow from '@userActions/Welcome/OnboardingFlow';
import CONST from '@src/CONST';
import type {} from '@src/types/onyx/Bank';
import type {OnboardingIcon} from '@src/types/onyx/Onboarding';
import type {BaseOnboardingAccountingProps} from './types';

type OnboardingListItemData = ListItem & {
    onboardingIcon: OnboardingIcon;
};

function BaseOnboardingAccounting({shouldUseNativeStyles}: BaseOnboardingAccountingProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {onboardingIsMediumOrLargerScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const [userReportedIntegration, setUserReportedIntegration] = useState<string | null | undefined>(undefined);
    const [error, setError] = useState('');

    const accountingOptions: OnboardingListItemData[] = useMemo(() => {
        const policyAccountingOptions: OnboardingListItemData[] = Object.values(CONST.POLICY.CONNECTIONS.NAME).map((connectionName): OnboardingListItemData => {
            let text;
            let onboardingIcon: OnboardingIcon;
            switch (connectionName) {
                case CONST.POLICY.CONNECTIONS.NAME.QBO: {
                    text = translate('workspace.accounting.qbo');
                    onboardingIcon = {
                        icon: Expensicons.QBOCircle,
                        iconWidth: 40,
                        iconHeight: 40,
                    };
                    break;
                }
                case CONST.POLICY.CONNECTIONS.NAME.XERO: {
                    text = translate('workspace.accounting.xero');
                    onboardingIcon = {
                        icon: Expensicons.XeroCircle,
                        iconWidth: 40,
                        iconHeight: 40,
                    };
                    break;
                }
                case CONST.POLICY.CONNECTIONS.NAME.NETSUITE: {
                    text = translate('workspace.accounting.netsuite');
                    onboardingIcon = {
                        icon: Expensicons.NetSuiteSquare,
                        iconWidth: 40,
                        iconHeight: 40,
                        iconStyles: [StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR)],
                    };
                    break;
                }
                default: {
                    text = translate('workspace.accounting.intacct');
                    onboardingIcon = {
                        icon: Expensicons.IntacctSquare,
                        iconWidth: 40,
                        iconHeight: 40,
                        iconStyles: [StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR)],
                    };
                    break;
                }
            }
            return {
                keyForList: connectionName,
                text,
                onboardingIcon,
                isSelected: userReportedIntegration === connectionName,
            };
        });
        const noneAccountingOption: OnboardingListItemData = {
            text: translate('onboarding.accounting.noneOfAbove'),
            keyForList: null,
            onboardingIcon: {
                icon: Expensicons.Clear,
                iconFill: theme.success,
            },
            isSelected: userReportedIntegration === null,
        };
        return [...policyAccountingOptions, noneAccountingOption];
    }, [StyleUtils, theme.success, translate, userReportedIntegration]);

    const footerContent = (
        <>
            {!!error && (
                <FormHelpMessage
                    style={[styles.ph1, styles.mb2]}
                    isError
                    message={error}
                />
            )}
            <Button
                success
                large
                text={translate('common.confirm')}
                // eslint-disable-next-line rulesdir/prefer-early-return
                onPress={() => {
                    if (!userReportedIntegration) {
                        setError(translate('onboarding.purpose.errorSelection'));
                        // eslint-disable-next-line no-useless-return
                        return;
                    }

                    // TODO: call CompleOnboarding API after the back-end PR is complete
                }}
                pressOnEnter
            />
        </>
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            shouldEnableKeyboardAvoidingView
            testID="BaseOnboardingAccounting"
        >
            <View style={[styles.h100, styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}>
                <HeaderWithBackButton
                    shouldShowBackButton
                    progressBarPercentage={75}
                    onBackButtonPress={OnboardingFlow.goBack}
                />
                <View style={[onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                    <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                        <Text style={[styles.textHeadlineH1, styles.textXXLarge]}>{translate('onboarding.accounting.title')}</Text>
                    </View>
                </View>
                <SelectionList
                    sections={[{data: accountingOptions}]}
                    onSelectRow={(item) => {
                        setUserReportedIntegration(item.keyForList);
                    }}
                    shouldUpdateFocusedIndex
                    ListItem={OnboardingListItem}
                    footerContent={footerContent}
                    shouldShowTooltips={false}
                    headerMessage={translate('onboarding.accounting.description')}
                    headerMessageStyle={[onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}
                />
                {shouldUseNarrowLayout && <OfflineIndicator />}
            </View>
        </ScreenWrapper>
    );
}

BaseOnboardingAccounting.displayName = 'BaseOnboardingAccounting';

export default BaseOnboardingAccounting;
