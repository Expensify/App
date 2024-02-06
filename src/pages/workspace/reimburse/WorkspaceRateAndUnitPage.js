import lodashGet from 'lodash/get';
import React, {useEffect} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {withNetwork} from '@components/OnyxProvider';
import Picker from '@components/Picker';
import TextInput from '@components/TextInput';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import getPermittedDecimalSeparator from '@libs/getPermittedDecimalSeparator';
import Navigation from '@libs/Navigation/Navigation';
import * as NumberUtils from '@libs/NumberUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import withPolicy, {policyDefaultProps, policyPropTypes} from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    ...policyPropTypes,
    ...withLocalizePropTypes,
    ...withThemeStylesPropTypes,
};

const defaultProps = {
    reimbursementAccount: {},
    ...policyDefaultProps,
};

function WorkspaceRateAndUnitPage(props) {
    useEffect(() => {
        if (lodashGet(props, 'policy.customUnits', []).length !== 0) {
            return;
        }

        BankAccounts.setReimbursementAccountLoading(true);
        Policy.openWorkspaceReimburseView(props.policy.id);
    }, [props]);

    const unitItems = [
        {label: props.translate('common.kilometers'), value: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS},
        {label: props.translate('common.miles'), value: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
    ];

    const saveUnitAndRate = (unit, rate) => {
        const distanceCustomUnit = _.find(lodashGet(props, 'policy.customUnits', {}), (customUnit) => customUnit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
        if (!distanceCustomUnit) {
            return;
        }
        const currentCustomUnitRate = _.find(lodashGet(distanceCustomUnit, 'rates', {}), (r) => r.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);
        const unitID = lodashGet(distanceCustomUnit, 'customUnitID', '');
        const unitName = lodashGet(distanceCustomUnit, 'name', '');
        const rateNumValue = PolicyUtils.getNumericValue(rate, props.toLocaleDigit);

        const newCustomUnit = {
            customUnitID: unitID,
            name: unitName,
            attributes: {unit},
            rates: {
                ...currentCustomUnitRate,
                rate: rateNumValue * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET,
            },
        };
        Policy.updateWorkspaceCustomUnitAndRate(props.policy.id, distanceCustomUnit, newCustomUnit, props.policy.lastModified);
    };

    const submit = (values) => {
        saveUnitAndRate(values.unit, values.rate);
        Keyboard.dismiss();
        Navigation.goBack();
    };

    const validate = (values) => {
        const errors = {};
        const decimalSeparator = props.toLocaleDigit('.');
        const outputCurrency = lodashGet(props, 'policy.outputCurrency', CONST.CURRENCY.USD);
        // Allow one more decimal place for accuracy
        const rateValueRegex = RegExp(String.raw`^-?\d{0,8}([${getPermittedDecimalSeparator(decimalSeparator)}]\d{1,${CurrencyUtils.getCurrencyDecimals(outputCurrency) + 1}})?$`, 'i');
        if (!rateValueRegex.test(values.rate) || values.rate === '') {
            errors.rate = 'workspace.reimburse.invalidRateError';
        } else if (NumberUtils.parseFloatAnyLocale(values.rate) <= 0) {
            errors.rate = 'workspace.reimburse.lowRateError';
        }
        return errors;
    };

    const distanceCustomUnit = _.find(lodashGet(props, 'policy.customUnits', {}), (unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
    const distanceCustomRate = _.find(lodashGet(distanceCustomUnit, 'rates', {}), (rate) => rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);

    return (
        <WorkspacePageWithSections
            headerText={props.translate('workspace.reimburse.trackDistance')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
            shouldSkipVBBACall
            shouldShowLoading={false}
            shouldShowBackButton
        >
            {() => (
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM}
                    submitButtonText={props.translate('common.save')}
                    style={[props.themeStyles.mh5, props.themeStyles.flexGrow1]}
                    scrollContextEnabled
                    validate={validate}
                    onSubmit={submit}
                    enabledWhenOffline
                >
                    <OfflineWithFeedback
                        errors={{
                            ...lodashGet(distanceCustomUnit, 'errors', {}),
                            ...lodashGet(distanceCustomRate, 'errors', {}),
                        }}
                        pendingAction={lodashGet(distanceCustomUnit, 'pendingAction') || lodashGet(distanceCustomRate, 'pendingAction')}
                        onClose={() =>
                            Policy.clearCustomUnitErrors(props.policy.id, lodashGet(distanceCustomUnit, 'customUnitID', ''), lodashGet(distanceCustomRate, 'customUnitRateID', ''))
                        }
                    >
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID="rate"
                            containerStyles={[props.themeStyles.mt4]}
                            defaultValue={PolicyUtils.getUnitRateValue(distanceCustomRate, props.toLocaleDigit)}
                            label={props.translate('workspace.reimburse.trackDistanceRate')}
                            aria-label={props.translate('workspace.reimburse.trackDistanceRate')}
                            placeholder={lodashGet(props, 'policy.outputCurrency', CONST.CURRENCY.USD)}
                            autoCompleteType="off"
                            autoCorrect={false}
                            inputMode={CONST.INPUT_MODE.DECIMAL}
                            maxLength={12}
                        />

                        <View style={[props.themeStyles.mt4]}>
                            <InputWrapper
                                InputComponent={Picker}
                                inputID="unit"
                                label={props.translate('workspace.reimburse.trackDistanceUnit')}
                                items={unitItems}
                                defaultValue={lodashGet(distanceCustomUnit, 'attributes.unit', CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES)}
                            />
                        </View>
                    </OfflineWithFeedback>
                </FormProvider>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceRateAndUnitPage.propTypes = propTypes;
WorkspaceRateAndUnitPage.defaultProps = defaultProps;
WorkspaceRateAndUnitPage.displayName = 'WorkspaceRateAndUnitPage';

export default compose(
    withPolicy,
    withLocalize,
    withNetwork(),
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
    withThemeStyles,
)(WorkspaceRateAndUnitPage);
