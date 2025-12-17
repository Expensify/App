import React, {useCallback} from 'react';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDatePassedError, getFieldRequiredErrors} from '@libs/ValidationUtils';
import {updateStatusDraftCustomClearAfterDate} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/SettingsStatusClearDateForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DateTime = {
    dateTime: string;
};
function SetDatePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [statusDraftCustomClearAfterDate, statusDraftCustomClearAfterDateMetaData] = useOnyx(ONYXKEYS.STATUS_DRAFT_CUSTOM_CLEAR_AFTER_DATE, {canBeMissing: true});
    const customStatusClearAfterDate = statusDraftCustomClearAfterDate ?? '';

    const onSubmit = (value: DateTime) => {
        updateStatusDraftCustomClearAfterDate(DateUtils.combineDateAndTime(customStatusClearAfterDate, value.dateTime));
        Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER);
    };

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.SETTINGS_STATUS_CLEAR_DATE_FORM>) => {
        const errors = getFieldRequiredErrors(values, [INPUT_IDS.DATE_TIME]);
        const dateError = getDatePassedError(values.dateTime);

        if (values.dateTime && dateError) {
            errors.dateTime = dateError;
        }

        return errors;
    }, []);

    if (isLoadingOnyxValue(statusDraftCustomClearAfterDateMetaData)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="SetDatePage"
        >
            <HeaderWithBackButton
                title={translate('statusPage.date')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER)}
            />
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.SETTINGS_STATUS_CLEAR_DATE_FORM}
                onSubmit={onSubmit}
                submitButtonText={translate('common.save')}
                validate={validate}
                enabledWhenOffline
                shouldHideFixErrorsAlert
            >
                <InputWrapper
                    InputComponent={DatePicker}
                    inputID={INPUT_IDS.DATE_TIME}
                    label={translate('statusPage.date')}
                    defaultValue={DateUtils.extractDate(customStatusClearAfterDate)}
                    minDate={new Date()}
                    shouldUseDefaultValue
                    autoFocus
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

export default SetDatePage;
