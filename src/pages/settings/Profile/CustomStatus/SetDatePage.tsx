import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as User from '@libs/actions/User';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/SettingsStatusClearDateForm';
import type * as OnyxTypes from '@src/types/onyx';

type DateTime = {
    dateTime: string;
};

type SetDatePageOnyxProps = {
    customStatus: OnyxEntry<OnyxTypes.CustomStatusDraft>;
};

type SetDatePageProps = SetDatePageOnyxProps;

function SetDatePage({customStatus}: SetDatePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const customClearAfter = customStatus?.clearAfter ?? '';

    const onSubmit = (value: DateTime) => {
        User.updateDraftCustomStatus({clearAfter: DateUtils.combineDateAndTime(customClearAfter, value.dateTime)});
        Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER);
    };

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.SETTINGS_STATUS_CLEAR_DATE_FORM>) => {
        const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.DATE_TIME]);
        const dateError = ValidationUtils.getDatePassedError(values.dateTime);

        if (values.dateTime && dateError) {
            errors.dateTime = dateError;
        }

        return errors;
    }, []);

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
            >
                <InputWrapper
                    InputComponent={DatePicker}
                    inputID={INPUT_IDS.DATE_TIME}
                    label={translate('statusPage.date')}
                    defaultValue={DateUtils.extractDate(customClearAfter)}
                    minDate={new Date()}
                    shouldUseDefaultValue
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

SetDatePage.displayName = 'SetDatePage';

export default withOnyx<SetDatePageProps, SetDatePageOnyxProps>({
    customStatus: {
        key: ONYXKEYS.CUSTOM_STATUS_DRAFT,
    },
})(SetDatePage);
