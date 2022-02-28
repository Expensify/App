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
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import * as Link from '../../../libs/actions/Link';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import * as Policy from '../../../libs/actions/Policy';
import withFullPolicy from '../withFullPolicy';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    /** Policy values needed in the component */
    policy: PropTypes.shape({
        customUnit: PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string,
            value: PropTypes.string,
            rate: PropTypes.shape({
                id: PropTypes.string,
                name: PropTypes.string,
                value: PropTypes.number,
                currency: PropTypes.string,
            }),
        }),
    }).isRequired,

    ...withLocalizePropTypes,
};


class WorkspaceReimburseNoVBAView extends React.Component {
    unitItems = [
        {
            label: this.props.translate('workspace.reimburse.kilometers'),
            value: 'km',
        },
        {
            label: this.props.translate('workspace.reimburse.miles'),
            value: 'mi',
        },
    ];

    updateRateValueDebounced = _.debounce((value) => {
        const numValue = parseFloat(value).toFixed(2);

        if (numValue === 'NaN') {
            return;
        }

        this.setState({
            rateValue: numValue.toString(),
        });

        Policy.setCustomUnitRate(this.props.policyID, this.state.unitID, {
            customUnitRateID: this.state.rateID,
            name: this.state.rateName,
            rate: numValue * 100,
        }, null);
    }, 1000);

    constructor(props) {
        super(props);
        this.state = {
            unitID: lodashGet(props, 'policy.customUnit.id', ''),
            unitName: lodashGet(props, 'policy.customUnit.name', ''),
            unitValue: lodashGet(props, 'policy.customUnit.value', 'mi'),
            rateID: lodashGet(props, 'policy.customUnit.rate.id', ''),
            rateName: lodashGet(props, 'policy.customUnit.rate.name', ''),
            rateValue: this.getRateDisplayValue(lodashGet(props, 'policy.customUnit.rate.value', 0) / 100),
            rateCurrency: lodashGet(props, 'policy.customUnit.rate.currency', ''),
        };
    }

    getRateDisplayValue(value) {
        const numValue = parseFloat(value);
        if (Number.isNaN(numValue)) {
            return '';
        }
        const fraction = numValue.toString().split('.')[1];
        return !fraction || fraction.length < 2
            ? numValue.toFixed(2)
            : numValue.toString();
    }

    setRate(value) {
        // allow only numbers and dot
        const numValue = value.replace(/[^0-9/.]/g, '');

        this.setState({
            rateValue: numValue,
        });

        // Set the corrected value with a delay and sync to the server
        this.updateRateValueDebounced(numValue);
    }

    setUnit(value) {
        this.setState({unitValue: value});

        Policy.setCustomUnit(this.props.policyID, {
            customUnitID: this.state.unitID,
            customUnitName: this.state.unitName,
            attributes: {unit: value},
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
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <View style={[styles.rateCol]}>
                            <TextInput
                                label={this.props.translate('workspace.reimburse.trackDistanceRate')}
                                placeholder={this.state.rateCurrency}
                                onChangeText={value => this.setRate(value)}
                                value={this.state.rateValue}
                                autoCompleteType="off"
                                autoCorrect={false}
                                keyboardType="decimal-pad"
                            />
                        </View>
                        <View style={[styles.unitCol]}>
                            <Picker
                                label={this.props.translate('workspace.reimburse.trackDistanceUnit')}
                                items={this.unitItems}
                                value={this.state.unitValue}
                                onChange={value => this.setUnit(value)}
                            />
                        </View>
                    </View>
                </Section>

                <Section
                    title={this.props.translate('workspace.reimburse.unlockNextDayReimbursements')}
                    icon={Illustrations.JewelBoxGreen}
                    menuItems={[
                        {
                            title: this.props.translate('workspace.common.bankAccount'),
                            onPress: () => Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(this.props.policyID)),
                            icon: Expensicons.Bank,
                            shouldShowRightIcon: true,
                        },
                    ]}
                >
                    <View style={[styles.mv4]}>
                        <Text>{this.props.translate('workspace.reimburse.unlockNoVBACopy')}</Text>
                    </View>
                </Section>
            </>
        );
    }
}

WorkspaceReimburseNoVBAView.propTypes = propTypes;
WorkspaceReimburseNoVBAView.displayName = 'WorkspaceReimburseNoVBAView';

export default compose(
    withFullPolicy,
    withLocalize,
    withOnyx({
        policy: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        },
    }),
)(WorkspaceReimburseNoVBAView);
