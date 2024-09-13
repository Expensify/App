import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as OnboardingFlow from '@userActions/Welcome/OnboardingFlow';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import type {BaseOnboardingAccountingProps} from './types';

function BaseOnboardingAccounting({shouldUseNativeStyles, route}: BaseOnboardingAccountingProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const [userReportedIntegration, setUserReportedIntegration] = useState<string | null | undefined>(null);
    const [error, setError] = useState('');

    const accountingOptions: ListItem[] = useMemo(() => {
        const policyAccountingOptions: ListItem[] = Object.values(CONST.POLICY.CONNECTIONS.NAME).map((connectionName): ListItem => {
            let text;
            let icons: Icon[];
            switch (connectionName) {
                case CONST.POLICY.CONNECTIONS.NAME.QBO: {
                    text = translate('workspace.accounting.qbo');
                    icons = [
                        {
                            source: Expensicons.QBOCircle,
                            type: 'avatar',
                        },
                    ];
                    break;
                }
                case CONST.POLICY.CONNECTIONS.NAME.XERO: {
                    text = translate('workspace.accounting.xero');
                    icons = [
                        {
                            source: Expensicons.XeroCircle,
                            type: 'avatar',
                        },
                    ];
                    break;
                }
                case CONST.POLICY.CONNECTIONS.NAME.NETSUITE: {
                    text = translate('workspace.accounting.netsuite');
                    icons = [
                        {
                            source: Expensicons.NetSuiteSquare,
                            type: 'avatar',
                        },
                    ];
                    break;
                }
                default: {
                    text = translate('workspace.accounting.intacct');
                    icons = [
                        {
                            source: Expensicons.IntacctSquare,
                            type: 'avatar',
                        },
                    ];
                    break;
                }
            }
            return {
                keyForList: connectionName,
                text,
                icons,
            };
        });
        const noneAccountingOption: ListItem = {
            text: translate('onboarding.accounting.noneOfAbove'),
            keyForList: null,
            icons: [
                {
                    source: Expensicons.Close,
                    type: 'avatar',
                },
            ],
        };
        return [...policyAccountingOptions, noneAccountingOption];
    }, [translate]);

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
                onPress={() => {
                    if (!userReportedIntegration) {
                        setError(translate('onboarding.purpose.errorSelection'));
                        return;
                    }
                    // Welcome.setOnboardingCompanySize(userReportedIntegration);
                    Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(route.params?.backTo));
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
                <View style={[onboardingIsMediumOrLargerScreenWidth && styles.mt5, styles.mh5]}>
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
                    ListItem={UserListItem}
                    footerContent={footerContent}
                    shouldShowTooltips={false}
                    headerMessage={translate('onboarding.accounting.description')}
                />
            </View>
        </ScreenWrapper>
    );
}

BaseOnboardingAccounting.displayName = 'BaseOnboardingAccounting';

export default BaseOnboardingAccounting;
