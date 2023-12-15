import lodashGet from 'lodash/get';
import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as User from '@libs/actions/User';
import compose from '@libs/compose';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    ...withLocalizePropTypes,
};

function SetDatePage({translate, customStatus}) {
    const styles = useThemeStyles();
    const customClearAfter = lodashGet(customStatus, 'clearAfter', '');

    const onSubmit = (v) => {
        User.updateDraftCustomStatus({clearAfter: DateUtils.combineDateAndTime(customClearAfter, v.dateTime)});
        Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER);
    };

    const validate = useCallback((values) => {
        const requiredFields = ['dateTime'];
        const errors = ValidationUtils.getFieldRequiredErrors(values, requiredFields);
        const dateError = ValidationUtils.getDatePassedError(values.dateTime);

        if (values.dateTime && dateError) {
            errors.dateTime = dateError;
        }

        return errors;
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
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
                shouldUseDefaultValue
            >
                <DatePicker
                    inputID="dateTime"
                    label={translate('statusPage.date')}
                    defaultValue={DateUtils.extractDate(customClearAfter)}
                    minDate={new Date()}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

SetDatePage.propTypes = propTypes;
SetDatePage.displayName = 'SetDatePage';

export default compose(
    withLocalize,
    withOnyx({
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
        customStatus: {
            key: ONYXKEYS.CUSTOM_STATUS_DRAFT,
        },
        clearDateForm: {
            key: `${ONYXKEYS.FORMS.SETTINGS_STATUS_CLEAR_DATE_FORM}Draft`,
        },
    }),
)(SetDatePage);
