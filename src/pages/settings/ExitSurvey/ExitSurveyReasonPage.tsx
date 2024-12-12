import React, {useEffect, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {Choice} from '@components/RadioButtons';
import RadioButtons from '@components/RadioButtons';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import * as ExitSurvey from '@userActions/ExitSurvey';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ExitReason, ExitSurveyReasonForm} from '@src/types/form/ExitSurveyReasonForm';
import INPUT_IDS from '@src/types/form/ExitSurveyReasonForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import ExitSurveyOffline from './ExitSurveyOffline';

function ExitSurveyReasonPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [draftReason] = useOnyx(ONYXKEYS.FORMS.EXIT_SURVEY_REASON_FORM_DRAFT, {selector: (value: OnyxEntry<ExitSurveyReasonForm>) => value?.[INPUT_IDS.REASON] ?? null});

    const [reason, setReason] = useState<ExitReason | null>(draftReason ?? null);
    useEffect(() => {
        // disabling lint because || is fine to use as a logical operator (as opposed to being used to define a default value)
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (reason || !draftReason) {
            return;
        }
        setReason(draftReason);
    }, [reason, draftReason]);
    const reasons: Choice[] = useMemo(
        () =>
            Object.values(CONST.EXIT_SURVEY.REASONS).map((value) => ({
                value,
                label: translate(`exitSurvey.reasons.${value}`),
                style: styles.mt6,
            })),
        [styles, translate],
    );

    return (
        <ScreenWrapper testID={ExitSurveyReasonPage.displayName}>
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('exitSurvey.header')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.EXIT_SURVEY_REASON_FORM}
                    style={[styles.flex1, styles.mt3, styles.mh5]}
                    validate={() => {
                        const errors: Errors = {};
                        if (!reason) {
                            errors[INPUT_IDS.REASON] = translate('common.error.fieldRequired');
                        }
                        return errors;
                    }}
                    onSubmit={() => {
                        if (!reason) {
                            return;
                        }
                        ExitSurvey.saveExitReason(reason);
                        Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_RESPONSE.getRoute(reason, ROUTES.SETTINGS_EXIT_SURVEY_REASON.route));
                    }}
                    submitButtonText={translate('common.next')}
                    shouldValidateOnBlur
                    shouldValidateOnChange
                >
                    {isOffline && <ExitSurveyOffline />}
                    {!isOffline && (
                        <>
                            <Text style={styles.headerAnonymousFooter}>{translate('exitSurvey.reasonPage.title')}</Text>
                            <Text style={styles.mt2}>{translate('exitSurvey.reasonPage.subtitle')}</Text>
                            <InputWrapper
                                InputComponent={RadioButtons}
                                inputID={INPUT_IDS.REASON}
                                value={reason as string}
                                items={reasons}
                                onPress={setReason as (value: string) => void}
                                shouldSaveDraft
                            />
                        </>
                    )}
                </FormProvider>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

ExitSurveyReasonPage.displayName = 'ExitSurveyReasonPage';

export default ExitSurveyReasonPage;
