import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ConnectBankAccountButton from '@components/ConnectBankAccountButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import BankAccount from '@libs/models/BankAccount';
import * as Link from '@userActions/Link';
import type * as OnyxTypes from '@src/types/onyx';

type WorkspaceReimburseSectionProps = {
    /** Policy values needed in the component */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Bank account attached to free plan */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;
};

function WorkspaceReimburseSection({policy, reimbursementAccount}: WorkspaceReimburseSectionProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [shouldShowLoadingSpinner, setShouldShowLoadingSpinner] = useState(true);
    const achState = reimbursementAccount?.achData?.state ?? '';
    const hasVBA = achState === BankAccount.STATE.OPEN;
    const policyId = policy?.id ?? '';
    const reimburseReceiptsUrl = `reports?policyID=${policyId}&from=all&type=expense&showStates=Archived&isAdvancedFilterMode=true`;
    const isLoading = reimbursementAccount?.isLoading ?? false;
    const prevIsLoading = usePrevious(isLoading);
    const {isOffline} = useNetwork();

    useEffect(() => {
        if (prevIsLoading === isLoading) {
            return;
        }
        setShouldShowLoadingSpinner(isLoading);
    }, [prevIsLoading, isLoading]);

    if (isOffline) {
        return (
            <Section
                title={translate('workspace.reimburse.reimburseReceipts')}
                icon={Illustrations.MoneyWings}
                isCentralPane
            >
                <View style={[styles.mv3]}>
                    <Text>{`${translate('common.youAppearToBeOffline')} ${translate('common.thisFeatureRequiresInternet')}`}</Text>
                </View>
            </Section>
        );
    }

    if (shouldShowLoadingSpinner) {
        return (
            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <ActivityIndicator
                    color={theme.spinner}
                    size="large"
                />
            </View>
        );
    }

    return hasVBA ? (
        <Section
            title={translate('workspace.reimburse.fastReimbursementsHappyMembers')}
            icon={Illustrations.TreasureChest}
            isCentralPane
            menuItems={[
                {
                    title: translate('workspace.reimburse.reimburseReceipts'),
                    onPress: () => Link.openOldDotLink(reimburseReceiptsUrl),
                    icon: Expensicons.Bank,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                    wrapperStyle: [styles.cardMenuItem],
                    link: () => Link.buildOldDotURL(reimburseReceiptsUrl),
                },
            ]}
        >
            <View style={[styles.mv3]}>
                <Text>{translate('workspace.reimburse.fastReimbursementsVBACopy')}</Text>
            </View>
        </Section>
    ) : (
        <Section
            title={translate('workspace.reimburse.unlockNextDayReimbursements')}
            icon={Illustrations.OpenSafe}
            isCentralPane
        >
            <View style={[styles.mv3]}>
                <Text>{translate('workspace.reimburse.unlockNoVBACopy')}</Text>
            </View>
            <ConnectBankAccountButton
                policyID={policy?.id ?? ''}
                style={[styles.mt4]}
            />
        </Section>
    );
}

WorkspaceReimburseSection.displayName = 'WorkspaceReimburseSection';

export default WorkspaceReimburseSection;
