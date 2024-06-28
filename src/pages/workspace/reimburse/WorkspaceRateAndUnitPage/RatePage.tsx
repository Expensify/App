import React, {useCallback, useEffect, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {validateRateValue} from '@libs/PolicyDistanceRatesUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as Policy from '@userActions/Policy/Policy';
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
    const outputCurrency = props.policy?.outputCurrency ?? CONST.CURRENCY.USD;

    useEffect(() => {
        if (props.workspaceRateAndUnit?.policyID === props.policy?.id) {
            return;
        }
        Policy.setPolicyIDForReimburseView(props.policy?.id ?? '-1');
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM>) => {
        const rate = values.rate;
        Policy.setRateForReimburseView((parseFloat(rate) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET).toFixed(1));
        Navigation.goBack(ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(props.policy?.id ?? '-1'));
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM>) => validateRateValue(values, outputCurrency, toLocaleDigit),
        [outputCurrency, toLocaleDigit],
    );

    const defaultValue = useMemo(() => {
        const defaultDistanceCustomUnit = PolicyUtils.getCustomUnit(props.policy);
        const distanceCustomRate = Object.values(defaultDistanceCustomUnit?.rates ?? {}).find((rate) => rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);
        return distanceCustomRate?.rate ?? 0;
    }, [props.policy]);

    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.reimburse.trackDistanceRate')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_REIMBURSE}
            backButtonRoute={ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(props.policy?.id ?? '-1')}
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

export default withPolicy(
    withOnyx<WorkspaceRatePageProps, WorkspaceRateAndUnitOnyxProps>({
        workspaceRateAndUnit: {
            key: ONYXKEYS.WORKSPACE_RATE_AND_UNIT,
        },
    })(WorkspaceRatePage),
);
