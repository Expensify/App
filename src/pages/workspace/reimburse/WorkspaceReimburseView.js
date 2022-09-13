import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import TextInput from '../../../components/TextInput';
import Picker from '../../../components/Picker';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Section from '../../../components/Section';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import * as Link from '../../../libs/actions/Link';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import * as Policy from '../../../libs/actions/Policy';
import withPolicy from '../withPolicy';
import CONST from '../../../CONST';
import Button from '../../../components/Button';
import {withNetwork} from '../../../components/OnyxProvider';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import * as ReimbursementAccount from '../../../libs/actions/ReimbursementAccount';
import networkPropTypes from '../../../components/networkPropTypes';
import Log from '../../../libs/Log';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    /** Policy values needed in the component */
    policy: PropTypes.shape({
        customUnits: PropTypes.objectOf(
            PropTypes.shape({
                customUnitID: PropTypes.string,
                name: PropTypes.string,
                attributes: PropTypes.shape({
                    unit: PropTypes.string,
                }),
                onyxRates: PropTypes.objectOf(
                    PropTypes.shape({
                        customUnitRateID: PropTypes.string,
                        name: PropTypes.string,
                        rate: PropTypes.number,
                    }),
                ),
            }),
        ),
        outputCurrency: PropTypes.string,
        hasVBA: PropTypes.bool,
    }).isRequired,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

class WorkspaceReimburseView extends React.Component {
    constructor(props) {
        super(props);
        const distanceCustomUnit = _.find(lodashGet(props, 'policy.customUnits', {}), unit => unit.name === 'Distance');
        const customUnitRate = _.find(lodashGet(distanceCustomUnit, 'onyxRates', {}), rate => rate.name === 'Default Rate');

        this.state = {
            unitID: lodashGet(distanceCustomUnit, 'customUnitID', ''),
            unitName: lodashGet(distanceCustomUnit, 'name', ''),
            unitValue: lodashGet(distanceCustomUnit, 'attributes.unit', 'mi'),
            unitRateID: lodashGet(customUnitRate, 'customUnitRateID', ''),
            unitRateValue: this.getRateDisplayValue(lodashGet(customUnitRate, 'rate', 0) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET),
            outputCurrency: lodashGet(props, 'policy.outputCurrency', ''),
        };

        this.unitItems = [
            {
                label: this.props.translate('workspace.reimburse.kilometers'),
                value: 'km',
            },
            {
                label: this.props.translate('workspace.reimburse.miles'),
                value: 'mi',
            },
        ];

        this.debounceUpdateOnCursorMove = this.debounceUpdateOnCursorMove.bind(this);
        this.updateRateValueDebounced = _.debounce(this.updateRateValue.bind(this), 1000);
    }

    componentDidMount() {
        Policy.openWorkspaceReimburseView(this.props.policyID);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.policy.customUnits !== this.props.policy.customUnits) {
            const distanceCustomUnit = _.chain(lodashGet(this.props, 'policy.customUnits', []))
                .values()
                .findWhere({name: CONST.CUSTOM_UNITS.NAME_DISTANCE})
                .value();
            const customUnitRate = _.find(lodashGet(distanceCustomUnit, 'onyxRates', {}), rate => rate.name === 'Default Rate');
            this.setState({
                unitID: lodashGet(distanceCustomUnit, 'customUnitID', ''),
                unitName: lodashGet(distanceCustomUnit, 'name', ''),
                unitValue: lodashGet(distanceCustomUnit, 'attributes.unit', 'mi'),
                unitRateID: lodashGet(customUnitRate, 'customUnitRateID'),
                unitRateValue: this.getRateDisplayValue(lodashGet(customUnitRate, 'rate', 0) / 100),
            });
        }

        const reconnecting = prevProps.network.isOffline && !this.props.network.isOffline;
        if (!reconnecting) {
            return;
        }

        Policy.openWorkspaceReimburseView(this.props.policyID);
    }

    getRateDisplayValue(value) {
        const numValue = parseFloat(value);
        if (Number.isNaN(numValue)) {
            return '';
        }

        return numValue.toFixed(3);
    }

    setRate(value) {
        const isInvalidRateValue = value !== '' && !CONST.REGEX.RATE_VALUE.test(value);

        this.setState(prevState => ({
            unitRateValue: !isInvalidRateValue ? value : prevState.unitRateValue,
        }), () => {
            // Set the corrected value with a delay and sync to the server
            this.updateRateValueDebounced(this.state.unitRateValue);
        });
    }

    setUnit(value) {
        if (value === this.state.unitValue) {
            return;
        }

        const distanceCustomUnit = _.find(lodashGet(this.props, 'policy.customUnits', {}), unit => unit.name === 'Distance');
        if (!distanceCustomUnit) {
            Log.warn('Policy has no customUnits, returning early.', {
                policyID: this.props.policyID,
            });
            return;
        }

        Policy.updateWorkspaceCustomUnit(this.props.policyID, distanceCustomUnit, {
            customUnitID: this.state.unitID,
            name: this.state.unitName,
            attributes: {unit: value},
        });
    }

    debounceUpdateOnCursorMove(event) {
        if (!_.contains(['ArrowLeft', 'ArrowRight'], event.key)) {
            return;
        }

        this.updateRateValueDebounced(this.state.unitRateValue);
    }

    updateRateValue(value) {
        const numValue = parseFloat(value);

        if (_.isNaN(numValue)) {
            return;
        }

        this.setState({
            unitRateValue: numValue.toFixed(3),
        });

        const distanceCustomUnit = _.find(lodashGet(this.props, 'policy.customUnits', {}), unit => unit.name === 'Distance');
        const currentCustomUnitRate = lodashGet(distanceCustomUnit, ['onyxRates', this.state.unitRateID], {});
        Policy.updateCustomUnitRate(this.props.policyID, currentCustomUnitRate, this.state.unitID, {
            ...currentCustomUnitRate,
            rate: numValue.toFixed(3) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET,
        });
    }

    render() {
        return (
            <>
                <FullPageNotFoundView shouldShow={_.isEmpty(this.props.policy)}>
                    <Section
                        title={this.props.translate('workspace.reimburse.captureReceipts')}
                        icon={Illustrations.ReceiptYellow}
                        menuItems={[
                            {
                                title: this.props.translate('workspace.reimburse.viewAllReceipts'),
                                onPress: () => Link.openOldDotLink(`expenses?policyIDList=${this.props.policyID}&billableReimbursable=reimbursable&submitterEmail=%2B%2B`),
                                icon: Expensicons.Receipt,
                                shouldShowRightIcon: true,
                                iconRight: Expensicons.NewWindow,
                            },
                        ]}
                    >
                        <View style={[styles.mv4, styles.flexRow, styles.flexWrap]}>
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
                        icon={Illustrations.GpsTrackOrange}
                    >
                        <View style={[styles.mv4]}>
                            <Text>{this.props.translate('workspace.reimburse.trackDistanceCopy')}</Text>
                        </View>
                        <OfflineWithFeedback
                            errors={{
                                ...lodashGet(this.props, ['policy', 'customUnits', this.state.unitID, 'errors'], {}),
                                ...lodashGet(this.props, ['policy', 'customUnits', this.state.unitID, 'onyxRates', this.state.unitRateID, 'errors'], {}),
                            }}
                            pendingAction={lodashGet(this.props, ['policy', 'customUnits', this.state.unitID, 'pendingAction'])
                                || lodashGet(this.props, ['policy', 'customUnits', this.state.unitID, 'onyxRates', this.state.unitRateID, 'pendingAction'])}
                            onClose={() => Policy.clearCustomUnitErrors(this.props.policyID, this.state.unitID, this.state.unitRateID)}
                        >
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mv2]}>
                                <View style={[styles.rateCol]}>
                                    <TextInput
                                        label={this.props.translate('workspace.reimburse.trackDistanceRate')}
                                        placeholder={this.state.outputCurrency}
                                        onChangeText={value => this.setRate(value)}
                                        value={this.state.unitRateValue}
                                        autoCompleteType="off"
                                        autoCorrect={false}
                                        keyboardType={CONST.KEYBOARD_TYPE.DECIMAL_PAD}
                                        onKeyPress={this.debounceUpdateOnCursorMove}
                                    />
                                </View>
                                <View style={[styles.unitCol]}>
                                    <Picker
                                        label={this.props.translate('workspace.reimburse.trackDistanceUnit')}
                                        items={this.unitItems}
                                        value={this.state.unitValue}
                                        onInputChange={value => this.setUnit(value)}
                                    />
                                </View>
                            </View>
                        </OfflineWithFeedback>
                    </Section>

                    {!this.props.hasVBA && (
                        <Section
                            title={this.props.translate('workspace.reimburse.unlockNextDayReimbursements')}
                            icon={Illustrations.JewelBoxGreen}
                        >
                            <View style={[styles.mv4]}>
                                <Text>{this.props.translate('workspace.reimburse.unlockNoVBACopy')}</Text>
                            </View>
                            <Button
                                text={this.props.translate('workspace.common.bankAccount')}
                                onPress={() => ReimbursementAccount.navigateToBankAccountRoute(this.props.policyID)}
                                icon={Expensicons.Bank}
                                style={[styles.mt4]}
                                iconStyles={[styles.buttonCTAIcon]}
                                shouldShowRightIcon
                                large
                                success
                            />
                        </Section>
                    )}
                    {this.props.hasVBA && (
                        <Section
                            title={this.props.translate('workspace.reimburse.fastReimbursementsHappyMembers')}
                            icon={Illustrations.BankUserGreen}
                            menuItems={[
                                {
                                    title: this.props.translate('workspace.reimburse.reimburseReceipts'),
                                    onPress: () => Link.openOldDotLink(`reports?policyID=${this.props.policyID}&from=all&type=expense&showStates=Archived&isAdvancedFilterMode=true`),
                                    icon: Expensicons.Bank,
                                    shouldShowRightIcon: true,
                                    iconRight: Expensicons.NewWindow,
                                },
                            ]}
                        >
                            <View style={[styles.mv4]}>
                                <Text>{this.props.translate('workspace.reimburse.fastReimbursementsVBACopy')}</Text>
                            </View>
                        </Section>
                    )}
                </FullPageNotFoundView>
            </>
        );
    }
}

WorkspaceReimburseView.propTypes = propTypes;

export default compose(
    withPolicy,
    withLocalize,
    withNetwork(),
    withOnyx({
        policy: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        },
    }),
)(WorkspaceReimburseView);
