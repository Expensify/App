import React, {useMemo, useState} from 'react';
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
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function ExitSurveyReasonPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    // FIXME: use the reason!
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [reason, setReason] = useState<string>();

    const reasons: Choice[] = useMemo(
        () => [
            {
                label: 'Choice A',
                value: 'choiceA',
            },
            {
                label: 'Choice B',
                value: 'choiceB',
            },
            {
                label: 'Choice C',
                value: 'choiceC',
            },
        ],
        [],
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
                // TODO: validation?
                validate={() => {}}
                onSubmit={() => Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_RESPONSE.getRoute(ROUTES.SETTINGS))}
                submitButtonText={translate('common.next')}
                shouldValidateOnBlur
                shouldValidateOnChange
            >
                <Text style={styles.headerAnonymousFooter}>Please tell us why you&apos;re leaving</Text>
                <Text style={styles.mt2}>Before you go, please tell us why you&apos;d like to switch to Expensify Classic</Text>
                <InputWrapper
                    // @ts-expect-error - InputWrapper is not yet migrated to TS
                    InputComponent={RadioButtons}
                    inputID="reason"
                    items={reasons}
                    onPress={(value: string) => setReason(value)}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

ExitSurveyReasonPage.displayName = 'ExitSurveyReasonPage';

export default ExitSurveyReasonPage;
