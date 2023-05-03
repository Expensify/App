import React from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../../ONYXKEYS';
import themeColors from '../../../styles/themes/default';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import styles from '../../../styles/styles';
import compose from '../../../libs/compose';
import * as Policy from '../../../libs/actions/Policy';
import * as Expensicons from '../../../components/Icon/Expensicons';
import AvatarWithImagePicker from '../../../components/AvatarWithImagePicker';
import CONST from '../../../CONST';
import Picker from '../../../components/Picker';
import TextInput from '../../../components/TextInput';
import WorkspacePageWithSections from '../WorkspacePageWithSections';
import withPolicy, {policyPropTypes, policyDefaultProps} from '../withPolicy';
import {withNetwork} from '../../../components/OnyxProvider';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import Form from '../../../components/Form';
import * as ReportUtils from '../../../libs/ReportUtils';
import Avatar from '../../../components/Avatar';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';

const propTypes = {
    // The currency list constant object from Onyx
    currencyList: PropTypes.objectOf(PropTypes.shape({
        // Symbol for the currency
        symbol: PropTypes.string,
    })),
    ...policyPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    currencyList: {},
    ...policyDefaultProps,
};

class WorkspaceRateAndUnitPage extends React.Component {
    constructor(props) {
        super(props);
        const distanceCustomUnit = _.find(lodashGet(props, 'policy.customUnits', {}), unit => unit.name === 'Distance');
        const customUnitRate = _.find(lodashGet(distanceCustomUnit, 'rates', {}), rate => rate.name === 'Default Rate');

        this.state = {
            unitID: lodashGet(distanceCustomUnit, 'customUnitID', ''),
            unitName: lodashGet(distanceCustomUnit, 'name', ''),
            unitValue: lodashGet(distanceCustomUnit, 'attributes.unit', 'mi'),
            unitRateID: lodashGet(customUnitRate, 'customUnitRateID', ''),
            unitRateValue: this.getUnitRateValue(customUnitRate),
            outputCurrency: lodashGet(props, 'policy.outputCurrency', ''),
        };
        this.getUnitItems = this.getUnitItems.bind(this);
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
    saveUnitAndRate(unit, rate){
        
        
        
        const distanceCustomUnit = _.find(lodashGet(this.props, 'policy.customUnits', {}), u => u.name === 'Distance');
        if (!distanceCustomUnit) {
            Log.warn('Policy has no customUnits, returning early.', {
                policyID: this.props.policy.id,
            });
            return;
        }
        
        //rate part
        const rateNumValue = this.getNumericValue(rate);
        const currentCustomUnitRate = lodashGet(distanceCustomUnit, ['rates', this.state.unitRateID], {});      
        
        //unit part
        const newCustomUnit = {
            customUnitID: this.state.unitID,
            name: this.state.unitName,
            attributes: {unit: unit},
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
        Navigation.navigate(ROUTES.getWorkspaceReimburseRoute(this.props.policy.id));
    }

    validate(values) {
        const errors = {};
        
        const decimalNumberRegex = new RegExp(/^\d+((,|\.)\d+)?$/);
        if(!decimalNumberRegex.test(values.rate)){
            errors.rate = this.props.translate('workspace.reimburse.invalidRateError');
        }

        return errors;
    }

    render() {
        return (
            <WorkspacePageWithSections
                shouldUseScrollView
                headerText={this.props.translate('workspace.reimburse.trackDistance')}
                route={this.props.route}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
                shouldSkipVBBACall
                backButtonRoute = {ROUTES.getWorkspaceReimburseRoute(this.props.policy.id)}
            >
                {() => (
                    <Form
                        formID={ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM}
                        submitButtonText={this.props.translate('workspace.editor.save')}
                        style={[styles.mh5, styles.flexGrow1]}
                        scrollContextEnabled
                        validate={this.validate}
                        onSubmit={this.submit}
                        enabledWhenOffline
                    >
                       
                            
                        <OfflineWithFeedback
                            pendingAction={lodashGet(this.props.policy, 'pendingFields.generalSettings')}
                        >
                            <TextInput
                                inputID="rate"
                                
                                containerStyles={[styles.mt4]}
                                defaultValue={this.state.unitRateValue}
                                label={this.props.translate('workspace.reimburse.trackDistanceRate')}
                                placeholder={this.state.outputCurrency}
                                
                                autoCompleteType="off"
                                autoCorrect={false}
                                keyboardType={CONST.KEYBOARD_TYPE.DECIMAL_PAD}
                                maxLength={12}
                            />
                            <View style={[styles.mt4]}>
                                <Picker
                                    inputID="unit"
                                    defaultValue={this.state.unitValue}
                                    label={this.props.translate('workspace.reimburse.trackDistanceUnit')}
                                    items={this.getUnitItems()}
                                    backgroundColor={themeColors.cardBG}
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

export default compose(
    withPolicy,
    withLocalize,
    withNetwork(),
)(WorkspaceRateAndUnitPage);
