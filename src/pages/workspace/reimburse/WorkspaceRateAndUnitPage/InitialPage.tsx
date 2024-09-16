import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import {getUnitTranslationKey} from '@libs/WorkspacesSettingsUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReimbursementAccount, WorkspaceRateAndUnit} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceRateAndUnitPageBaseProps = WithPolicyProps;

type WorkspaceRateAndUnitOnyxProps = {
    workspaceRateAndUnit: OnyxEntry<WorkspaceRateAndUnit>;
    // eslint-disable-next-line react/no-unused-prop-types
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type WorkspaceRateAndUnitPageProps = WorkspaceRateAndUnitPageBaseProps & WorkspaceRateAndUnitOnyxProps;

function WorkspaceRateAndUnitPage(props: WorkspaceRateAndUnitPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useEffect(() => {
        if (props.workspaceRateAndUnit?.policyID === props.policy?.id) {
            return;
        }
        Policy.setPolicyIDForReimburseView(props.policy?.id ?? '-1');
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const customUnits = props.policy?.customUnits ?? {};
        if (!isEmptyObject(customUnits)) {
            return;
        }

        BankAccounts.setReimbursementAccountLoading(true);
        Policy.openWorkspaceReimburseView(props.policy?.id ?? '-1');
    }, [props]);

    const saveUnitAndRate = (newUnit: Unit, newRate: string) => {
        const distanceCustomUnit = PolicyUtils.getCustomUnit(props.policy);
        if (!distanceCustomUnit) {
            return;
        }
        const currentCustomUnitRate = Object.values(distanceCustomUnit?.rates ?? {}).find((rate) => rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);
        const unitID = distanceCustomUnit.customUnitID ?? '';
        const unitName = distanceCustomUnit.name ?? '';

        const newCustomUnit = {
            customUnitID: unitID,
            name: unitName,
            attributes: {unit: newUnit},
            rates: {
                ...currentCustomUnitRate,
                rate: parseFloat(newRate),
            },
        };
        Policy.updateWorkspaceCustomUnitAndRate(props.policy?.id ?? '-1', distanceCustomUnit, newCustomUnit, props.policy?.lastModified);
    };

    const distanceCustomUnit = PolicyUtils.getCustomUnit(props.policy);
    const distanceCustomRate = Object.values(distanceCustomUnit?.rates ?? {}).find((rate) => rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);

    const unitValue = props.workspaceRateAndUnit?.unit ?? distanceCustomUnit?.attributes.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    const rateValue = props.workspaceRateAndUnit?.rate ?? distanceCustomRate?.rate?.toString() ?? '';
    const unitTitle = Str.recapitalize(translate(getUnitTranslationKey(unitValue)));

    const submit = () => {
        saveUnitAndRate(unitValue, rateValue);
        Policy.clearOnyxDataForReimburseView();
        Navigation.goBack();
    };

    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.reimburse.trackDistance')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
            backButtonRoute=""
            shouldShowLoading={false}
            shouldShowBackButton
        >
            {() => (
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <View style={[styles.flex1]}>
                        <View style={styles.mb5}>
                            <OfflineWithFeedback
                                errors={{
                                    ...(distanceCustomUnit?.errors ?? {}),
                                    ...(distanceCustomRate?.errors ?? {}),
                                }}
                                errorRowStyles={styles.mh5}
                                pendingAction={distanceCustomUnit?.pendingAction ?? distanceCustomRate?.pendingAction}
                                onClose={() => Policy.clearCustomUnitErrors(props.policy?.id ?? '-1', distanceCustomUnit?.customUnitID ?? '-1', distanceCustomRate?.customUnitRateID ?? '-1')}
                            >
                                <MenuItemWithTopDescription
                                    description={translate('workspace.reimburse.trackDistanceRate')}
                                    title={CurrencyUtils.convertAmountToDisplayString(parseFloat(rateValue), props.policy?.outputCurrency ?? CONST.CURRENCY.USD)}
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_RATE_AND_UNIT_RATE.getRoute(props.policy?.id ?? '-1'))}
                                    shouldShowRightIcon
                                />
                                <MenuItemWithTopDescription
                                    description={translate('workspace.reimburse.trackDistanceUnit')}
                                    title={unitTitle}
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_RATE_AND_UNIT_UNIT.getRoute(props.policy?.id ?? '-1'))}
                                    shouldShowRightIcon
                                />
                            </OfflineWithFeedback>
                        </View>
                    </View>
                    <View style={[styles.flexShrink0]}>
                        <FormAlertWithSubmitButton
                            onSubmit={() => submit()}
                            enabledWhenOffline
                            buttonText={translate('common.save')}
                            containerStyles={[styles.mh0, styles.mt5, styles.flex1, styles.ph5]}
                            isAlertVisible={false}
                        />
                    </View>
                </ScrollView>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceRateAndUnitPage.displayName = 'WorkspaceRateAndUnitPage';

export default withPolicy(
    withOnyx<WorkspaceRateAndUnitPageProps, WorkspaceRateAndUnitOnyxProps>({
        // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        workspaceRateAndUnit: {
            key: ONYXKEYS.WORKSPACE_RATE_AND_UNIT,
        },
    })(WorkspaceRateAndUnitPage),
);
