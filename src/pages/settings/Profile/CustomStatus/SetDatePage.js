import React from 'react';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import ROUTES from '../../../../ROUTES';
import Navigation from '../../../../libs/Navigation/Navigation';
import styles from '../../../../styles/styles';
import Form from '../../../../components/Form';
import NewDatePicker from '../../../../components/NewDatePicker';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';

// TODO: connect to onyx for existing data, or use the form id
function SetDatePage(props) {
    const onSubmit = () => {
        // TODO: save to onyx draft state
        Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER);
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title="Clear after"
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS)}
            />
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID="doesthishavetobeset"
                validate={() => ({})}
                onSubmit={onSubmit}
                submitButtonText={props.translate('common.save')}
                enabledWhenOffline
            >
                <NewDatePicker
                    inputID="clearaftertime"
                    minDate={new Date()}
                    label={props.translate('common.date')}
                />
            </Form>
        </ScreenWrapper>
    );
}

SetDatePage.displayName = 'SetDatePage';
SetDatePage.propTypes = withLocalizePropTypes;

export default withLocalize(SetDatePage);
