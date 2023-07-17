import React, {useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import TextInput from '../components/TextInput';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Form from '../components/Form';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import CONST from '../CONST';

const propTypes = {
    ...withLocalizePropTypes,

    /** Transaction description default value */
    defaultDescription: PropTypes.string.isRequired,

    /** Callback to fire when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,
};

function EditRequestDescriptionPage(props) {
    const descriptionInputRef = useRef(null);
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            onEntryTransitionEnd={() => descriptionInputRef.current && descriptionInputRef.current.focus()}
        >
            <HeaderWithBackButton
                title={props.translate('common.description')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM}
                onSubmit={props.onSubmit}
                submitButtonText={props.translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <TextInput
                        inputID="modifiedComment"
                        name="modifiedComment"
                        defaultValue={props.defaultDescription}
                        label={props.translate('moneyRequestConfirmationList.whatsItFor')}
                        accessibilityLabel={props.translate('moneyRequestConfirmationList.whatsItFor')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        ref={descriptionInputRef}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

EditRequestDescriptionPage.propTypes = propTypes;
EditRequestDescriptionPage.displayName = 'EditRequestDescriptionPage';

export default withLocalize(EditRequestDescriptionPage);
