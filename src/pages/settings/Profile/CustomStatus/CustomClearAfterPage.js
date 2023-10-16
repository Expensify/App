import React, {useCallback} from 'react';
import moment from 'moment';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import NewDatePicker from '../../../../components/NewDatePicker';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import FormProvider from '../../../../components/Form/FormProvider';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as User from '../../../../libs/actions/User';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import DateUtils from '../../../../libs/DateUtils';
import compose from '../../../../libs/compose';
import styles from '../../../../styles/styles';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';

const propTypes = {
    ...withLocalizePropTypes,
};

function CustomClearAfterPage({translate, customStatus}) {
    const customClearAfter = lodashGet(customStatus, 'clearAfter', '');

    const onSubmit = (v) => {
        User.updateDraftCustomStatus({clearAfter: DateUtils.combineDateAndTime(customClearAfter, v.dob)});
        Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER);
    };

    const validate = useCallback((values) => {
        const requiredFields = ['dob'];
        const errors = ValidationUtils.getFieldRequiredErrors(values, requiredFields);
        const dateError = ValidationUtils.getDatePassedError(values.dob);

        if (values.dob && dateError) {
            errors.dob = dateError;
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
                    inputID="dob"
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
