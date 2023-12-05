import PropTypes from 'prop-types';
import React from 'react';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** Transaction defailt created value */
    defaultCreated: PropTypes.string.isRequired,

    /** Callback to fire when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,
    /** Params object to get the value */
    // eslint-disable-next-line react/forbid-prop-types
    params: PropTypes.object.isRequired,

    /** Report ID of the money request */
    reportID: PropTypes.string.isRequired,

    /** Type of Money Request */
    iouType: PropTypes.string.isRequired,
};

function EditRequestCreatedPage({defaultCreated, onSubmit, params, reportID, iouType}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EditRequestCreatedPage.displayName}
        >
            <HeaderWithBackButton title={translate('common.date')} />
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM}
                onSubmit={onSubmit}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <DatePicker
                    inputID="created"
                    label={translate('common.date')}
                    defaultValue={defaultCreated}
                    maxDate={new Date()}
                    params={params}
                    onClickYear={() => {
                        Navigation.navigate(ROUTES.MONEY_REQUEST_DATE_YEAR.getRoute(iouType, reportID));
                    }}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

EditRequestCreatedPage.propTypes = propTypes;
EditRequestCreatedPage.displayName = 'EditRequestCreatedPage';

export default EditRequestCreatedPage;
