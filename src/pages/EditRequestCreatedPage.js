import PropTypes from 'prop-types';
import React from 'react';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Transaction defailt created value */
    defaultCreated: PropTypes.string.isRequired,

    /** Callback to fire when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,
};

function EditRequestCreatedPage({defaultCreated, onSubmit}) {
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
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

EditRequestCreatedPage.propTypes = propTypes;
EditRequestCreatedPage.displayName = 'EditRequestCreatedPage';

export default EditRequestCreatedPage;
