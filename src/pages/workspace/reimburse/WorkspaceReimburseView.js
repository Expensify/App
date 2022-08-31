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
import withFullPolicy from '../withFullPolicy';
import CONST from '../../../CONST';
import Button from '../../../components/Button';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import * as ReimbursementAccount from '../../../libs/actions/ReimbursementAccount';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    /** Does the user have a VBA in their account? */
    hasVBA: PropTypes.bool.isRequired,

    /** Policy values needed in the component */
    policy: PropTypes.shape({
        customUnits: PropTypes.objectOf(
            PropTypes.shape({
                customUnitID: PropTypes.string,
                name: PropTypes.string,
                attributes: PropTypes.shape({
                    unit: PropTypes.string,
                }),
                rates: PropTypes.arrayOf(
                    PropTypes.shape({
                        customUnitRateID: PropTypes.string,
                        name: PropTypes.string,
                        rate: PropTypes.number,
                    }),
                ),
            }),
        ),
        outputCurrency: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

class WorkspaceReimburseView extends React.Component {
    constructor(props) {
        super(props);
        const distanceCustomUnit = _.find(lodashGet(props, 'policy.customUnits', {}), unit => unit.name === 'Distance');

        this.state = {
            unitID: lodashGet(distanceCustomUnit, 'customUnitID', ''),
            unitName: lodashGet(distanceCustomUnit, 'name', ''),
            unitValue: lodashGet(distanceCustomUnit, 'attributes.unit', 'mi'),
            rateID: lodashGet(distanceCustomUnit, 'rates[0].customUnitRateID', ''),
            rateName: lodashGet(distanceCustomUnit, 'rates[0].name', ''),
            rateValue: this.getRateDisplayValue(lodashGet(distanceCustomUnit, 'rates[0].rate', 0) / 100),
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
            rateValue: !isInvalidRateValue ? value : prevState.rateValue,
        }), () => {
            // Set the corrected value with a delay and sync to the server
            this.updateRateValueDebounced(this.state.rateValue);
        });
    }

    static getDerivedStateFromProps(props, state) {
        const distanceCustomUnit = _.find(lodashGet(props, 'policy.customUnits', {}), unit => unit.name === 'Distance');
        const unitValue = lodashGet(distanceCustomUnit, 'attributes.unit', 'mi');

        if (unitValue !== state.unitValue) {
            return {
                unitValue,
            };
        }

        return null;
    }

    setUnit(value) {
        if (value === this.state.unitValue) {
            return;
        }

        const distanceCustomUnit = _.find(lodashGet(this.props, 'policy.customUnits', {}), unit => unit.name === 'Distance');

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

        this.updateRateValueDebounced(this.state.rateValue);
    }

    updateRateValue(value) {
        const numValue = parseFloat(value);

        if (_.isNaN(numValue)) {
            return;
        }

        this.setState({
            rateValue: numValue.toFixed(3),
        });

        Policy.setCustomUnitRate(this.props.policyID, this.state.unitID, {
            customUnitRateID: this.state.rateID,
            name: this.state.rateName,
            rate: numValue.toFixed(3) * 100,
        }, null);
    }

    render() {
        return (
            <>
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
                        errors={lodashGet(this.props, ['policy', 'customUnits', this.state.unitID, 'errors'])}
                        pendingAction={lodashGet(this.props, ['policy', 'customUnits', this.state.unitID, 'pendingAction'])}
                        onClose={() => Policy.removeUnitError(this.props.policyID, this.state.unitID)}
                    >
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mv2]}>
                            <View style={[styles.rateCol]}>
                                <TextInput
                                    label={this.props.translate('workspace.reimburse.trackDistanceRate')}
                                    placeholder={this.state.outputCurrency}
                                    onChangeText={value => this.setRate(value)}
                                    value={this.state.rateValue}
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
            </>
        );
    }
}

WorkspaceReimburseView.propTypes = propTypes;
WorkspaceReimburseView.displayName = 'WorkspaceReimburseView';

export default compose(
    withFullPolicy,
    withLocalize,
    withOnyx({
        policy: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        },
    }),
)(WorkspaceReimburseView);
