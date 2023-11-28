import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import _ from 'underscore';
import ConnectBankAccountButton from '@components/ConnectBankAccountButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import networkPropTypes from '@components/networkPropTypes';
import Section from '@components/Section';
import Text from '@components/Text';
import BankAccount from '@libs/models/BankAccount';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';

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
    const [shouldShowLoadingSpinner, setShouldShowLoadingSpinner] = useState(false);
    const achState = lodashGet(props.reimbursementAccount, 'achData.state', '');
    const hasVBA = achState === BankAccount.STATE.OPEN;
    const reimburseReceiptsUrl = `reports?policyID=${props.policy.id}&from=all&type=expense&showStates=Archived&isAdvancedFilterMode=true`;
    const debounceSetShouldShowLoadingSpinner = _.debounce(() => {
        const isLoading = props.reimbursementAccount.isLoading || false;
        if (isLoading !== shouldShowLoadingSpinner) {
            setShouldShowLoadingSpinner(isLoading);
        }
    }, CONST.TIMING.SHOW_LOADING_SPINNER_DEBOUNCE_TIME);
    useEffect(() => {
        debounceSetShouldShowLoadingSpinner();
    }, [debounceSetShouldShowLoadingSpinner]);

    if (props.network.isOffline) {
        return (
            <Section
                title={props.translate('workspace.reimburse.reimburseReceipts')}
                icon={Illustrations.MoneyWings}
            >
                <View style={[styles.mv3]}>
                    <Text>{`${props.translate('common.youAppearToBeOffline')} ${props.translate('common.thisFeatureRequiresInternet')}`}</Text>
                </View>
            </Section>
        );
    }

    // If the reimbursementAccount is loading but not enough time has passed to show a spinner, then render nothing.
    if (props.reimbursementAccount.isLoading && !shouldShowLoadingSpinner) {
        return null;
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

    return (
        <>
            {hasVBA ? (
                <Section
                    title={props.translate('workspace.reimburse.fastReimbursementsHappyMembers')}
                    icon={Illustrations.TreasureChest}
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
                >
                    <View style={[styles.mv3]}>
                        <Text>{props.translate('workspace.reimburse.unlockNoVBACopy')}</Text>
                    </View>
                    <ConnectBankAccountButton
                        policyID={props.policy.id}
                        style={[styles.mt4]}
                    />
                </Section>
            )}
        </>
    );
}

WorkspaceReimburseSection.propTypes = propTypes;
WorkspaceReimburseSection.displayName = 'WorkspaceReimburseSection';

export default WorkspaceReimburseSection;
