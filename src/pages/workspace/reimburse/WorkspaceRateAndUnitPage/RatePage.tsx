import type {RouteProp} from '@react-navigation/native';
import React, {useMemo} from 'react';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import getPermittedDecimalSeparator from '@libs/getPermittedDecimalSeparator';
import Navigation from '@libs/Navigation/Navigation';
import * as NumberUtils from '@libs/NumberUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type WorkspaceUnitPageProps = WithPolicyOnyxProps & {
    route: RouteProp<{params: {policyID: string; unit?: string; rate?: string}}>;
};

function WorkspaceUnitPage(props: WorkspaceUnitPageProps) {
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();

    const submit = (values: {rateEdit: number}) => {
        Navigation.navigate(
            ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(props.policy?.id ?? '', props.route.params.unit, (values.rateEdit * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET).toString()),
        );
    };

    const validate = (values: {rateEdit: number}) => {
        const errors: {rateEdit?: string} = {};
        const parsedRate = PolicyUtils.getRateDisplayValue(values.rateEdit, toLocaleDigit);
        const decimalSeparator = toLocaleDigit('.');
        const outputCurrency = props.policy?.outputCurrency ?? CONST.CURRENCY.USD;
        // Allow one more decimal place for accuracy
        const rateValueRegex = RegExp(String.raw`^-?\d{0,8}([${getPermittedDecimalSeparator(decimalSeparator)}]\d{1,${CurrencyUtils.getCurrencyDecimals(outputCurrency) + 1}})?$`, 'i');
        if (!rateValueRegex.test(parsedRate) || parsedRate === '') {
            errors.rateEdit = 'workspace.reimburse.invalidRateError';
        } else if (NumberUtils.parseFloatAnyLocale(parsedRate) <= 0) {
            errors.rateEdit = 'workspace.reimburse.lowRateError';
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
            headerText={translate('workspace.reimburse.trackDistance')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
            shouldSkipVBBACall
            backButtonRoute={ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(props.policy?.id ?? '')}
            shouldShowLoading={false}
        >
            {() => (
                // @ts-expect-error Migration Pending
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM}
                    submitButtonText={translate('common.save')}
                    validate={validate}
                    onSubmit={submit}
                    enabledWhenOffline
                    style={[styles.flexGrow1, styles.mh5]}
                    submitFlexEnabled={false}
                >
                    <InputWrapperWithRef
                        // @ts-expect-error Migration Pending
                        InputComponent={AmountForm}
                        inputID="rateEdit"
                        onCurrencyButtonPress={() => {}}
                        currency={props.policy?.outputCurrency ?? CONST.CURRENCY.USD}
                        defaultValue={(typeof props.route.params.rate === 'string' ? parseFloat(props.route.params.rate) : defaultValue) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET}
                    />
                </FormProvider>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceUnitPage.displayName = 'WorkspaceUnitPage';

export default withPolicy(WorkspaceUnitPage);
