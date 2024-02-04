import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {withNetwork} from '@components/OnyxProvider';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import withPolicy, {policyDefaultProps, policyPropTypes} from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    workspaceRateAndUnit: PropTypes.shape({
        policyID: PropTypes.string,
        unit: PropTypes.string,
        rate: PropTypes.string,
    }),
    ...policyPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    workspaceRateAndUnit: {
        policyID: '',
    },
    reimbursementAccount: {},
    ...policyDefaultProps,
};

function WorkspaceRateAndUnitPage(props) {
    const styles = useThemeStyles();
    useEffect(() => {
        if (!props.workspaceRateAndUnit.policyID || props.workspaceRateAndUnit.policyID !== props.policy.id) {
            Policy.setPolicyIDForReimburseView(props.policy.id);
        }
        if (lodashGet(props, 'policy.customUnits', []).length !== 0) {
            return;
        }

        BankAccounts.setReimbursementAccountLoading(true);
        Policy.openWorkspaceReimburseView(props.policy.id);
    }, [props]);

    const unitItems = {
        [CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS]: props.translate('workspace.reimburse.kilometers'),
        [CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES]: props.translate('workspace.reimburse.miles'),
    };

    const saveUnitAndRate = (unit, rate) => {
        const distanceCustomUnit = _.find(lodashGet(props, 'policy.customUnits', {}), (customUnit) => customUnit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
        if (!distanceCustomUnit) {
            return;
        }
        const currentCustomUnitRate = _.find(lodashGet(distanceCustomUnit, 'rates', {}), (r) => r.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);
        const unitID = lodashGet(distanceCustomUnit, 'customUnitID', '');
        const unitName = lodashGet(distanceCustomUnit, 'name', '');

        const newCustomUnit = {
            customUnitID: unitID,
            name: unitName,
            attributes: {unit},
            rates: {
                ...currentCustomUnitRate,
                rate: parseFloat(rate),
            },
        };
        Policy.updateWorkspaceCustomUnitAndRate(props.policy.id, distanceCustomUnit, newCustomUnit, props.policy.lastModified);
    };

    const distanceCustomUnit = _.find(lodashGet(props, 'policy.customUnits', {}), (unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
    const distanceCustomRate = _.find(lodashGet(distanceCustomUnit, 'rates', {}), (rate) => rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);

    const unitValue = props.workspaceRateAndUnit.unit || lodashGet(distanceCustomUnit, 'attributes.unit', CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
    const rateValue = props.workspaceRateAndUnit.rate || distanceCustomRate.rate.toString();

    const submit = () => {
        saveUnitAndRate(unitValue, rateValue);
        Policy.clearOnyxDataForReimburseView();
        Navigation.goBack();
    };

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
                <ScrollView
                    contentContainerStyle={styles.flexGrow1}
                    // on iOS, navigation animation sometimes cause the scrollbar to appear
                    // on middle/left side of scrollview. scrollIndicatorInsets with right
                    // to closest value to 0 fixes this issue, 0 (default) doesn't work
                    // See: https://github.com/Expensify/App/issues/31441
                    scrollIndicatorInsets={{right: Number.MIN_VALUE}}
                >
                    <View style={[styles.flex1]}>
                        <View style={styles.mb5}>
                            <OfflineWithFeedback
                                errors={{
                                    ...lodashGet(distanceCustomUnit, 'errors', {}),
                                    ...lodashGet(distanceCustomRate, 'errors', {}),
                                }}
                                errorRowStyles={styles.mh5}
                                pendingAction={lodashGet(distanceCustomUnit, 'pendingAction') || lodashGet(distanceCustomRate, 'pendingAction')}
                                onClose={() =>
                                    Policy.clearCustomUnitErrors(props.policy.id, lodashGet(distanceCustomUnit, 'customUnitID', ''), lodashGet(distanceCustomRate, 'customUnitRateID', ''))
                                }
                            >
                                <MenuItemWithTopDescription
                                    description={props.translate('workspace.reimburse.trackDistanceRate')}
                                    title={CurrencyUtils.convertAmountToDisplayString(parseFloat(rateValue), lodashGet(props, 'policy.outputCurrency', CONST.CURRENCY.USD))}
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_RATE_AND_UNIT_RATE.getRoute(props.policy.id))}
                                    shouldShowRightIcon
                                />
                                <MenuItemWithTopDescription
                                    description={props.translate('workspace.reimburse.trackDistanceUnit')}
                                    title={unitItems[unitValue]}
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_RATE_AND_UNIT_UNIT.getRoute(props.policy.id))}
                                    shouldShowRightIcon
                                />
                            </OfflineWithFeedback>
                        </View>
                    </View>
                    <View style={[styles.flexShrink0]}>
                        <FormAlertWithSubmitButton
                            onSubmit={() => submit()}
                            enabledWhenOffline
                            buttonText={props.translate('common.save')}
                            containerStyles={[styles.mh0, styles.mt5, styles.flex1, styles.ph5]}
                        />
                    </View>
                </ScrollView>
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
        workspaceRateAndUnit: {
            key: ONYXKEYS.WORKSPACE_RATE_AND_UNIT,
        },
    }),
)(WorkspaceRateAndUnitPage);
