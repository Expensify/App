import React, {useEffect, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import getPermittedDecimalSeparator from '@libs/getPermittedDecimalSeparator';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as NumberUtils from '@libs/NumberUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkspaceRateAndUnitForm';
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
        Policy.setPolicyIDForReimburseView(props.policy?.id ?? '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM>) => {
        const rate = values.rate;
        Policy.setRateForReimburseView((parseFloat(rate) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET).toFixed(1));
        Navigation.navigate(ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(props.policy?.id ?? ''));
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM> = {};
        const rate = values.rate;
        const parsedRate = MoneyRequestUtils.replaceAllDigits(rate, toLocaleDigit);
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
            headerText={translate('workspace.reimburse.trackDistanceRate')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
            shouldSkipVBBACall
            backButtonRoute={ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(props.policy?.id ?? '')}
            shouldShowLoading={false}
            shouldShowBackButton
        >
            {() => (
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM}
                    submitButtonText={translate('common.save')}
                    validate={validate}
                    onSubmit={submit}
                    enabledWhenOffline
                    style={[styles.flexGrow1]}
                    shouldHideFixErrorsAlert
                    submitFlexEnabled={false}
                    submitButtonStyles={[styles.mh5, styles.mt0]}
                    disablePressOnEnter={false}
                >
                    <InputWrapperWithRef
                        InputComponent={AmountForm}
                        inputID={INPUT_IDS.RATE}
                        currency={props.policy?.outputCurrency ?? CONST.CURRENCY.USD}
                        extraDecimals={1}
                        defaultValue={(
                            (typeof props.workspaceRateAndUnit?.rate === 'string' ? parseFloat(props.workspaceRateAndUnit.rate) : defaultValue) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET
                        ).toFixed(3)}
                        isCurrencyPressable={false}
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
