import React, {useMemo, useState} from 'react';
import type {ValueOf} from 'type-fest';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {Choice} from '@components/RadioButtons';
import RadioButtons from '@components/RadioButtons';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const REASON_INPUT_ID = 'reason';

function ExitSurveyReasonPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reason, setReason] = useState<ValueOf<typeof CONST.EXIT_SURVEY_REASONS>>();
    const reasons: Choice[] = useMemo(
        () =>
            Object.values(CONST.EXIT_SURVEY_REASONS).map((value) => ({
                value,
                label: translate(`exitSurvey.reasons.${value}`),
                style: styles.mt6,
            })),
        [styles, translate],
    );

    return (
        <ScreenWrapper testID={ExitSurveyReasonPage.displayName}>
            <HeaderWithBackButton
                title="Before you go"
                onBackButtonPress={() => Navigation.goBack()}
            />
            {/* @ts-expect-error - FormProvider is not yet migrated to TS */}
            <FormProvider
                formID={ONYXKEYS.FORMS.EXIT_SURVEY_REASON_FORM}
                style={[styles.flex1, styles.mt3, styles.mh5]}
                validate={() => {
                    if (reason) {
                        return {};
                    }
                    return {
                        [REASON_INPUT_ID]: translate('common.error.fieldRequired'),
                    };
                }}
                onSubmit={() => {
                    if (!reason) {
                        return;
                    }
                    Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_RESPONSE.getRoute(reason, ROUTES.SETTINGS));
                }}
                submitButtonText={translate('common.next')}
                shouldValidateOnBlur
                shouldValidateOnChange
            >
                <Text style={styles.headerAnonymousFooter}>Please tell us why you&apos;re leaving</Text>
                <Text style={styles.mt2}>Before you go, please tell us why you&apos;d like to switch to Expensify Classic</Text>
                <InputWrapper
                    // @ts-expect-error - InputWrapper is not yet migrated to TS
                    InputComponent={RadioButtons}
                    inputID={REASON_INPUT_ID}
                    items={reasons}
                    onPress={(value: ValueOf<typeof CONST.EXIT_SURVEY_REASONS>) => setReason(value)}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

ExitSurveyReasonPage.displayName = 'ExitSurveyReasonPage';

export default ExitSurveyReasonPage;
