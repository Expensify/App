import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import MenuItemWithTopDescription from '../../../components/MenuItemWithTopDescription';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Section from '../../../components/Section';
import Navigation from '../../../libs/Navigation/Navigation';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import * as Link from '../../../libs/actions/Link';
import compose from '../../../libs/compose';
import * as Policy from '../../../libs/actions/Policy';
import CONST from '../../../CONST';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import * as ReimbursementAccountProps from '../../ReimbursementAccount/reimbursementAccountPropTypes';
import {withNetwork} from '../../../components/OnyxProvider';
import networkPropTypes from '../../../components/networkPropTypes';
import WorkspaceReimburseSection from './WorkspaceReimburseSection';
import * as BankAccounts from '../../../libs/actions/BankAccounts';

const propTypes = {
    /** Policy values needed in the component */
    policy: PropTypes.shape({
        id: PropTypes.string,
        customUnits: PropTypes.objectOf(
            PropTypes.shape({
                customUnitID: PropTypes.string,
                name: PropTypes.string,
                attributes: PropTypes.shape({
                    unit: PropTypes.string,
                }),
                rates: PropTypes.objectOf(
                    PropTypes.shape({
                        customUnitRateID: PropTypes.string,
                        name: PropTypes.string,
                        rate: PropTypes.number,
                    }),
                ),
            }),
        ),
        outputCurrency: PropTypes.string,
        lastModified: PropTypes.number,
    }).isRequired,

    /** From Onyx */
    /** Bank account attached to free plan */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
};

class WorkspaceReimburseView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentRatePerUnit: this.getCurrentRatePerUnitLabel(),
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.policy.customUnits !== this.props.policy.customUnits || prevProps.preferredLocale !== this.props.preferredLocale) {
            this.setState({currentRatePerUnit: this.getCurrentRatePerUnitLabel()});
        }

        const reconnecting = prevProps.network.isOffline && !this.props.network.isOffline;
        if (!reconnecting) {
            return;
        }

        this.fetchData();
    }

    getCurrentRatePerUnitLabel() {
        const distanceCustomUnit = _.find(lodashGet(this.props, 'policy.customUnits', {}), (unit) => unit.name === 'Distance');
        const customUnitRate = _.find(lodashGet(distanceCustomUnit, 'rates', {}), (rate) => rate.name === 'Default Rate');
        const currentUnit = this.getUnitLabel(lodashGet(distanceCustomUnit, 'attributes.unit', 'mi'));
        const currentRate = this.getRateLabel(customUnitRate);
        const perWord = this.props.translate('common.per');
        return `${currentRate} ${perWord} ${currentUnit}`;
    }

    getRateLabel(customUnitRate) {
        return this.getRateDisplayValue(lodashGet(customUnitRate, 'rate', 0) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET);
    }

    getUnitLabel(value) {
        return this.props.translate(`common.${value}`);
    }

    getRateDisplayValue(value) {
        const numValue = this.getNumericValue(value);
        if (Number.isNaN(numValue)) {
            return '';
        }
        return numValue.toString().replace('.', this.props.toLocaleDigit('.')).substring(0, value.length);
    }

    getNumericValue(value) {
        const numValue = parseFloat(value.toString().replace(this.props.toLocaleDigit('.'), '.'));
        if (Number.isNaN(numValue)) {
            return NaN;
        }
        return numValue.toFixed(3);
    }

    fetchData() {
        // Instead of setting the reimbursement account loading within the optimistic data of the API command, use a separate action so that the Onyx value is updated right away.
        // openWorkspaceReimburseView uses API.read which will not make the request until all WRITE requests in the sequential queue have finished responding, so there would be a delay in
        // updating Onyx with the optimistic data.
        BankAccounts.setReimbursementAccountLoading(true);
        Policy.openWorkspaceReimburseView(this.props.policy.id);
    }

    render() {
        const viewAllReceiptsUrl = `expenses?policyIDList=${this.props.policy.id}&billableReimbursable=reimbursable&submitterEmail=%2B%2B`;
        return (
            <>
                <Section
                    title={this.props.translate('workspace.reimburse.captureReceipts')}
                    icon={Illustrations.MoneyReceipts}
                    menuItems={[
                        {
                            title: this.props.translate('workspace.reimburse.viewAllReceipts'),
                            onPress: () => Link.openOldDotLink(viewAllReceiptsUrl),
                            icon: Expensicons.Receipt,
                            shouldShowRightIcon: true,
                            iconRight: Expensicons.NewWindow,
                            wrapperStyle: [styles.cardMenuItem],
                            link: () => Link.buildOldDotURL(viewAllReceiptsUrl),
                        },
                    ]}
                >
                    <View style={[styles.mv3, styles.flexRow, styles.flexWrap]}>
                        <Text>
                            {this.props.translate('workspace.reimburse.captureNoVBACopyBeforeEmail')}
                            <CopyTextToClipboard
                                text="receipts@expensify.com"
                                textStyles={[styles.textBlue]}
                            />
                            <Text>{this.props.translate('workspace.reimburse.captureNoVBACopyAfterEmail')}</Text>
                        </Text>
                    </View>
                </Section>

                <Section
                    title={this.props.translate('workspace.reimburse.trackDistance')}
                    icon={Illustrations.TrackShoe}
                >
                    <View style={[styles.mv3]}>
                        <Text>{this.props.translate('workspace.reimburse.trackDistanceCopy')}</Text>
                    </View>
                    <MenuItemWithTopDescription
                        title={this.state.currentRatePerUnit}
                        description={this.props.translate('workspace.reimburse.trackDistanceRate')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.getWorkspaceRateAndUnitRoute(this.props.policy.id))}
                        wrapperStyle={[styles.mhn5, styles.wAuto]}
                    />
                </Section>

                <WorkspaceReimburseSection
                    policy={this.props.policy}
                    reimbursementAccount={this.props.reimbursementAccount}
                    network={this.props.network}
                    translate={this.props.translate}
                />
            </>
        );
    }
}

WorkspaceReimburseView.defaultProps = defaultProps;
WorkspaceReimburseView.propTypes = propTypes;

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(WorkspaceReimburseView);
