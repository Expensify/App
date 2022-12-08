import React from 'react';
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
import Button from '../../../components/Button';
import BankAccount from '../../../libs/models/BankAccount';
import reimbursementAccountPropTypes from '../../ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccount from '../../../libs/actions/ReimbursementAccount';
import networkPropTypes from '../../../components/networkPropTypes';

const propTypes = {
    /** Policy values needed in the component */
    policy: PropTypes.shape({
        id: PropTypes.string,
    }).isRequired,

    /** Bank account attached to free plan */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** Returns translated string for given locale and phrase */
    translate: PropTypes.func.isRequired,
};

class WorkspaceReimburseSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shouldShowLoadingSpinner: false,
        };

        this.debounceSetShouldShowLoadingSpinner = _.debounce(this.setShouldShowLoadingSpinner.bind(this), 250);
    }

    componentDidUpdate() {
        this.debounceSetShouldShowLoadingSpinner();
    }

    setShouldShowLoadingSpinner() {
        this.setState({shouldShowLoadingSpinner: this.props.reimbursementAccount.isLoading || false});
    }

    render() {
        const achState = lodashGet(this.props.reimbursementAccount, 'achData.state', '');
        const hasVBA = achState === BankAccount.STATE.OPEN;

        if (this.props.network.isOffline) {
            return (
                <Section
                    title={this.props.translate('workspace.reimburse.reimburseReceipts')}
                    icon={Illustrations.MoneyWings}
                >
                    <View style={[styles.mv3]}>
                        <Text>{`${this.props.translate('common.youAppearToBeOffline')} ${this.props.translate('common.thisFeatureRequiresInternet')}`}</Text>
                    </View>
                </Section>
            );
        }

        // If the reimbursementAccount is loading but not enough time has passed to show a spinner, then render nothing.
        if (this.props.reimbursementAccount.isLoading && !this.state.shouldShowLoadingSpinner) {
            return null;
        }

        if (this.state.shouldShowLoadingSpinner) {
            return (
                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <ActivityIndicator color={themeColors.spinner} size="large" />
                </View>
            );
        }

        return (
            <>
                {hasVBA ? (
                    <Section
                        title={this.props.translate('workspace.reimburse.fastReimbursementsHappyMembers')}
                        icon={Illustrations.TreasureChest}
                        menuItems={[
                            {
                                title: this.props.translate('workspace.reimburse.reimburseReceipts'),
                                onPress: () => Link.openOldDotLink(`reports?policyID=${this.props.policy.id}&from=all&type=expense&showStates=Archived&isAdvancedFilterMode=true`),
                                icon: Expensicons.Bank,
                                shouldShowRightIcon: true,
                                iconRight: Expensicons.NewWindow,
                                iconFill: themeColors.success,
                                wrapperStyle: [styles.cardMenuItem],
                            },
                        ]}
                    >
                        <View style={[styles.mv3]}>
                            <Text>{this.props.translate('workspace.reimburse.fastReimbursementsVBACopy')}</Text>
                        </View>
                    </Section>
                ) : (
                    <Section
                        title={this.props.translate('workspace.reimburse.unlockNextDayReimbursements')}
                        icon={Illustrations.OpenSafe}
                    >
                        <View style={[styles.mv3]}>
                            <Text>{this.props.translate('workspace.reimburse.unlockNoVBACopy')}</Text>
                        </View>
                        <Button
                            text={this.props.translate('workspace.common.bankAccount')}
                            onPress={() => ReimbursementAccount.navigateToBankAccountRoute(this.props.policy.id)}
                            icon={Expensicons.Bank}
                            style={[styles.mt4]}
                            iconStyles={[styles.buttonCTAIcon]}
                            shouldShowRightIcon
                            large
                            success
                        />
                    </Section>
                )}
            </>
        );
    }
}

WorkspaceReimburseSection.propTypes = propTypes;

export default WorkspaceReimburseSection;
