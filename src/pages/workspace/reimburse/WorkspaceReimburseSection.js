import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import ConnectBankAccountButton from '@components/ConnectBankAccountButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import networkPropTypes from '@components/networkPropTypes';
import Section from '@components/Section';
import Text from '@components/Text';
import usePrevious from '@hooks/usePrevious';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import BankAccount from '@libs/models/BankAccount';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as Link from '@userActions/Link';

const propTypes = {
    /** Policy values needed in the component */
    policy: PropTypes.shape({
        id: PropTypes.string,
    }).isRequired,

    /** Bank account attached to free plan */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** Returns translated string for given locale and phrase */
    translate: PropTypes.func.isRequired,
};

function WorkspaceReimburseSection(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [shouldShowLoadingSpinner, setShouldShowLoadingSpinner] = useState(true);
    const achState = lodashGet(props.reimbursementAccount, 'achData.state', '');
    const hasVBA = achState === BankAccount.STATE.OPEN;
    const reimburseReceiptsUrl = `reports?policyID=${props.policy.id}&from=all&type=expense&showStates=Archived&isAdvancedFilterMode=true`;
    const isLoading = lodashGet(props.reimbursementAccount, 'isLoading', false);
    const prevIsLoading = usePrevious(isLoading);

    useEffect(() => {
        if (prevIsLoading === isLoading) {
            return;
        }
        setShouldShowLoadingSpinner(isLoading);
    }, [prevIsLoading, isLoading]);

    if (props.network.isOffline) {
        return (
            <Section
                title={props.translate('workspace.reimburse.reimburseReceipts')}
                icon={Illustrations.MoneyWings}
                isCentralPane
            >
                <View style={[styles.mv3]}>
                    <Text>{`${props.translate('common.youAppearToBeOffline')} ${props.translate('common.thisFeatureRequiresInternet')}`}</Text>
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
            title={props.translate('workspace.reimburse.fastReimbursementsHappyMembers')}
            icon={Illustrations.TreasureChest}
            isCentralPane
            menuItems={[
                {
                    title: props.translate('workspace.reimburse.reimburseReceipts'),
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
                <Text>{props.translate('workspace.reimburse.fastReimbursementsVBACopy')}</Text>
            </View>
        </Section>
    ) : (
        <Section
            title={props.translate('workspace.reimburse.unlockNextDayReimbursements')}
            icon={Illustrations.OpenSafe}
            isCentralPane
        >
            <View style={[styles.mv3]}>
                <Text>{props.translate('workspace.reimburse.unlockNoVBACopy')}</Text>
            </View>
            <ConnectBankAccountButton
                policyID={props.policy.id}
                style={[styles.mt4]}
            />
        </Section>
    );
}

WorkspaceReimburseSection.propTypes = propTypes;
WorkspaceReimburseSection.displayName = 'WorkspaceReimburseSection';

export default WorkspaceReimburseSection;
