import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {ActivityIndicator, View} from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Section from '../../../components/Section';
import * as Link from '../../../libs/actions/Link';
import BankAccount from '../../../libs/models/BankAccount';
import * as ReimbursementAccountProps from '../../ReimbursementAccount/reimbursementAccountPropTypes';
import networkPropTypes from '../../../components/networkPropTypes';
import CONST from '../../../CONST';
import ConnectBankAccountButton from '../../../components/ConnectBankAccountButton';

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
                    color={themeColors.spinner}
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
