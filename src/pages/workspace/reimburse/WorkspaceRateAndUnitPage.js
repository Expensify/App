import React from 'react';
import {Keyboard, View} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import styles from '../../../styles/styles';
import compose from '../../../libs/compose';
import * as Policy from '../../../libs/actions/Policy';
import CONST from '../../../CONST';
import Picker from '../../../components/Picker';
import TextInput from '../../../components/TextInput';
import WorkspacePageWithSections from '../WorkspacePageWithSections';
import withPolicy, {policyPropTypes, policyDefaultProps} from '../withPolicy';
import {withNetwork} from '../../../components/OnyxProvider';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import Form from '../../../components/Form';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import getPermittedDecimalSeparator from '../../../libs/getPermittedDecimalSeparator';

const propTypes = {
    ...policyPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    ...policyDefaultProps,
};

class WorkspaceRateAndUnitPage extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.validate = this.validate.bind(this);
    }

    getUnitRateValue(customUnitRate) {
        return this.getRateDisplayValue(lodashGet(customUnitRate, 'rate', 0) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET);
    }

    getUnitItems() {
        return [
            {label: this.props.translate('workspace.reimburse.kilometers'), value: 'km'},
            {label: this.props.translate('workspace.reimburse.miles'), value: 'mi'},
        ];
    }

    getRateDisplayValue(value) {
        const numValue = this.getNumericValue(value);
        if (Number.isNaN(numValue)) {
            return '';
        }
        return numValue.toString().replace('.', this.props.toLocaleDigit('.')).substring(0, value.length);
    }

    getNumericValue(value) {
        const numValue = parseFloat(value.toString().replace(',', '.'));
        if (Number.isNaN(numValue)) {
            return NaN;
        }
        return numValue.toFixed(3);
    }

    saveUnitAndRate(unit, rate) {
        const distanceCustomUnit = _.find(lodashGet(this.props, 'policy.customUnits', {}), (u) => u.name === 'Distance');
        if (!distanceCustomUnit) {
            return;
        }
        const currentCustomUnitRate = _.find(lodashGet(distanceCustomUnit, 'rates', {}), (r) => r.name === 'Default Rate');
        const unitID = lodashGet(distanceCustomUnit, 'customUnitID', '');
        const unitName = lodashGet(distanceCustomUnit, 'name', '');
        const rateNumValue = this.getNumericValue(rate);

        const newCustomUnit = {
            customUnitID: unitID,
            name: unitName,
            attributes: {unit},
            rates: {
                ...currentCustomUnitRate,
                rate: rateNumValue * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET,
            },
        };
        Policy.updateWorkspaceCustomUnitAndRate(this.props.policy.id, distanceCustomUnit, newCustomUnit, this.props.policy.lastModified);
    }

    submit(values) {
        this.saveUnitAndRate(values.unit, values.rate);
        Keyboard.dismiss();
        Navigation.goBack(ROUTES.getWorkspaceReimburseRoute(this.props.policy.id));
    }

    validate(values) {
        const errors = {};
        const decimalSeparator = this.props.toLocaleDigit('.');
        const rateValueRegex = RegExp(String.raw`^\d{1,8}([${getPermittedDecimalSeparator(decimalSeparator)}]\d{1,3})?$`, 'i');
        if (!rateValueRegex.test(values.rate)) {
            errors.rate = 'workspace.reimburse.invalidRateError';
        }
        return errors;
    }

    render() {
        const distanceCustomUnit = _.find(lodashGet(this.props, 'policy.customUnits', {}), (unit) => unit.name === 'Distance');
        const distanceCustomRate = _.find(lodashGet(distanceCustomUnit, 'rates', {}), (rate) => rate.name === 'Default Rate');
        return (
            <WorkspacePageWithSections
                headerText={this.props.translate('workspace.reimburse.trackDistance')}
                route={this.props.route}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
                shouldSkipVBBACall
                backButtonRoute={ROUTES.getWorkspaceReimburseRoute(this.props.policy.id)}
            >
                {() => (
                    <Form
                        formID={ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM}
                        submitButtonText={this.props.translate('common.save')}
                        style={[styles.mh5, styles.flexGrow1]}
                        scrollContextEnabled
                        validate={this.validate}
                        onSubmit={this.submit}
                        enabledWhenOffline
                    >
                        <OfflineWithFeedback
                            errors={{
                                ...lodashGet(distanceCustomUnit, 'errors', {}),
                                ...lodashGet(distanceCustomRate, 'errors', {}),
                            }}
                            pendingAction={lodashGet(distanceCustomUnit, 'pendingAction') || lodashGet(distanceCustomRate, 'pendingAction')}
                            onClose={() =>
                                Policy.clearCustomUnitErrors(this.props.policy.id, lodashGet(distanceCustomUnit, 'customUnitID', ''), lodashGet(distanceCustomRate, 'customUnitRateID', ''))
                            }
                        >
                            <TextInput
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                                inputID="rate"
                                containerStyles={[styles.mt4]}
                                defaultValue={this.getUnitRateValue(distanceCustomRate)}
                                label={this.props.translate('workspace.reimburse.trackDistanceRate')}
                                accessibilityLabel={this.props.translate('workspace.reimburse.trackDistanceRate')}
                                placeholder={lodashGet(this.props, 'policy.outputCurrency', CONST.CURRENCY.USD)}
                                autoCompleteType="off"
                                autoCorrect={false}
                                keyboardType={CONST.KEYBOARD_TYPE.DECIMAL_PAD}
                                maxLength={12}
                            />
                            <View style={[styles.mt4]}>
                                <Picker
                                    inputID="unit"
                                    defaultValue={lodashGet(distanceCustomUnit, 'attributes.unit', 'mi')}
                                    label={this.props.translate('workspace.reimburse.trackDistanceUnit')}
                                    items={this.getUnitItems()}
                                />
                            </View>
                        </OfflineWithFeedback>
                    </Form>
                )}
            </WorkspacePageWithSections>
        );
    }
}

WorkspaceRateAndUnitPage.propTypes = propTypes;
WorkspaceRateAndUnitPage.defaultProps = defaultProps;

export default compose(withPolicy, withLocalize, withNetwork())(WorkspaceRateAndUnitPage);
