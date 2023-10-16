import React from 'react';
import PropTypes from 'prop-types';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import useLocalize from '../hooks/useLocalize';
import NewDatePicker from '../components/NewDatePicker';
import FormProvider from '../components/Form/FormProvider';

const propTypes = {
    /** Transaction defailt created value */
    defaultCreated: PropTypes.string.isRequired,

    /** Callback to fire when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,
};

function EditRequestCreatedPage({defaultCreated, onSubmit}) {
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
                <NewDatePicker
                    inputID="created"
                    label={translate('common.date')}
                    defaultValue={defaultCreated}
                    maxDate={new Date()}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

EditRequestCreatedPage.propTypes = propTypes;
EditRequestCreatedPage.displayName = 'EditRequestCreatedPage';

export default EditRequestCreatedPage;
