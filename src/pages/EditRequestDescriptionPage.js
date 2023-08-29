import React, {useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import TextInput from '../components/TextInput';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Form from '../components/Form';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import CONST from '../CONST';
import useLocalize from '../hooks/useLocalize';

const propTypes = {
    /** Transaction default description value */
    defaultDescription: PropTypes.string.isRequired,

    /** Callback to fire when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,
};

function EditRequestDescriptionPage({defaultDescription, onSubmit}) {
    const {translate} = useLocalize();
    const descriptionInputRef = useRef(null);
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            onEntryTransitionEnd={() => descriptionInputRef.current && descriptionInputRef.current.focus()}
        >
            <HeaderWithBackButton
                title={translate('common.description')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM}
                onSubmit={onSubmit}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <TextInput
                        // Comment field does not have its modified counterpart
                        inputID="comment"
                        name="comment"
                        defaultValue={defaultDescription}
                        label={translate('moneyRequestConfirmationList.whatsItFor')}
                        accessibilityLabel={translate('moneyRequestConfirmationList.whatsItFor')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        ref={(e) => (descriptionInputRef.current = e)}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

EditRequestDescriptionPage.propTypes = propTypes;
EditRequestDescriptionPage.displayName = 'EditRequestDescriptionPage';

export default EditRequestDescriptionPage;
