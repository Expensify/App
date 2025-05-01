import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDatePassedError, getFieldRequiredErrors} from '@libs/ValidationUtils';
import {updateDraftCustomStatus} from '@userActions/User';
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
    const [customStatus, customStatusMetadata] = useOnyx(ONYXKEYS.CUSTOM_STATUS_DRAFT);
    const customClearAfter = customStatus?.clearAfter ?? '';

    const onSubmit = (value: DateTime) => {
        updateDraftCustomStatus({clearAfter: DateUtils.combineDateAndTime(customClearAfter, value.dateTime)});
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

    if (isLoadingOnyxValue(customStatusMetadata)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={SetDatePage.displayName}
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
                    defaultValue={DateUtils.extractDate(customClearAfter)}
                    minDate={new Date()}
                    shouldUseDefaultValue
                    autoFocus
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

SetDatePage.displayName = 'SetDatePage';

export default SetDatePage;
