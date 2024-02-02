import React, {useMemo, useEffect} from 'react';
import Onyx, {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {OnyxFormValuesFields} from '@components/Form/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import getPermittedDecimalSeparator from '@libs/getPermittedDecimalSeparator';
import Navigation from '@libs/Navigation/Navigation';
import * as NumberUtils from '@libs/NumberUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {WorkspaceRateAndUnit} from '@src/types/onyx';

type WorkspaceRatePageBaseProps = WithPolicyProps;

type WorkspaceRateAndUnitOnyxProps = {
    workspaceRateAndUnit: OnyxEntry<WorkspaceRateAndUnit>;
};

type WorkspaceRatePageProps = WorkspaceRatePageBaseProps & WorkspaceRateAndUnitOnyxProps;

function WorkspaceRatePage(props: WorkspaceRatePageProps) {
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();

    useEffect(() => {
        if (props.workspaceRateAndUnit?.policyID === props.policy?.id) {
            return;
        }
        // TODO: Move this to a action later.
        // eslint-disable-next-line rulesdir/prefer-actions-set-data
        Onyx.merge(ONYXKEYS.WORKSPACE_RATE_AND_UNIT, {policyID: props.policy?.id, rate: null, unit: null});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit = (values: OnyxFormValuesFields<typeof ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM>) => {
        const rate = values.rate as number;
        // TODO: Move this to a action later.
        // eslint-disable-next-line rulesdir/prefer-actions-set-data
        Onyx.merge(ONYXKEYS.WORKSPACE_RATE_AND_UNIT, {rate: (rate * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET).toString()});
        Navigation.navigate(ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(props.policy?.id ?? ''));
    };

    const validate = (values: OnyxFormValuesFields<typeof ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM>) => {
        const errors: {rate?: string} = {};
        const rate = values.rate as number;
        const parsedRate = PolicyUtils.getRateDisplayValue(rate, toLocaleDigit);
        const decimalSeparator = toLocaleDigit('.');
        const outputCurrency = props.policy?.outputCurrency ?? CONST.CURRENCY.USD;
        // Allow one more decimal place for accuracy
        const rateValueRegex = RegExp(String.raw`^-?\d{0,8}([${getPermittedDecimalSeparator(decimalSeparator)}]\d{1,${CurrencyUtils.getCurrencyDecimals(outputCurrency) + 1}})?$`, 'i');
        if (!rateValueRegex.test(parsedRate) || parsedRate === '') {
            errors.rate = 'workspace.reimburse.invalidRateError';
        } else if (NumberUtils.parseFloatAnyLocale(parsedRate) <= 0) {
            errors.rate = 'workspace.reimburse.lowRateError';
        }
        return errors;
    };

    const defaultValue = useMemo(() => {
        const defaultDistanceCustomUnit = Object.values(props.policy?.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
        const distanceCustomRate = Object.values(defaultDistanceCustomUnit?.rates ?? {}).find((rate) => rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);
        return distanceCustomRate?.rate ?? 0;
    }, [props.policy?.customUnits]);

    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.reimburse.trackDistanceRateTitle')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
            shouldSkipVBBACall
            backButtonRoute={ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(props.policy?.id ?? '')}
            shouldShowLoading={false}
        >
            {() => (
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM}
                    submitButtonText={translate('common.save')}
                    validate={validate}
                    onSubmit={submit}
                    enabledWhenOffline
                    style={[styles.flexGrow1, styles.mh5]}
                    shouldHideFixErrorsAlert
                    // @ts-expect-error TODO: fix this
                    submitFlexEnabled={false}
                >
                    <InputWrapperWithRef
                        InputComponent={AmountForm}
                        inputID="rate"
                        currency={props.policy?.outputCurrency ?? CONST.CURRENCY.USD}
                        defaultValue={
                            (typeof props.workspaceRateAndUnit?.rate === 'string' ? parseFloat(props.workspaceRateAndUnit.rate) : defaultValue) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET
                        }
                    />
                </FormProvider>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceRatePage.displayName = 'WorkspaceRatePage';

export default compose(
    withOnyx<WorkspaceRatePageProps, WorkspaceRateAndUnitOnyxProps>({
        workspaceRateAndUnit: {
            key: ONYXKEYS.WORKSPACE_RATE_AND_UNIT,
        },
    }),
    withPolicy,
)(WorkspaceRatePage);
