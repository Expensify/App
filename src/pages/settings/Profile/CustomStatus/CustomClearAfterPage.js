import lodashGet from 'lodash/get';
import moment from 'moment';
import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import NewDatePicker from '@components/NewDatePicker';
import ScreenWrapper from '@components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import * as User from '@libs/actions/User';
import compose from '@libs/compose';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import styles from '@styles/styles';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    ...withLocalizePropTypes,
};

function CustomClearAfterPage({translate, customStatus}) {
    const customClearAfter = lodashGet(customStatus, 'clearAfter', '');

    const onSubmit = (v) => {
        User.updateDraftCustomStatus({clearAfter: DateUtils.combineDateAndTime(customClearAfter, v.dataTime)});
        Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER);
    };

    const validate = useCallback((values) => {
        const requiredFields = ['dataTime'];
        const errors = ValidationUtils.getFieldRequiredErrors(values, requiredFields);
        const dateError = ValidationUtils.getDatePassedError(values.dataTime);

        if (values.dataTime && dateError) {
            errors.dataTime = dateError;
        }

        return errors;
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={CustomClearAfterPage.displayName}
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
                <NewDatePicker
                    inputID="dataTime"
                    label={translate('statusPage.date')}
                    defaultValue={DateUtils.extractDate(customClearAfter)}
                    minDate={moment().toDate()}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

CustomClearAfterPage.propTypes = propTypes;
CustomClearAfterPage.displayName = 'CustomClearAfterPage';

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
)(CustomClearAfterPage);
