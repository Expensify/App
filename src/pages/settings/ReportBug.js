import React from 'react';
import { Text } from 'react-native';
import { withOnyx } from 'react-native-onyx';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, { withLocalizePropTypes } from '../../components/withLocalize';
import compose from '../../libs/compose';
import styles from '../../styles/styles';
import withWindowDimensions, { windowDimensionsPropTypes } from '../../components/withWindowDimensions';
import Form from '../../components/Form';
import ONYXKEYS from '../../ONYXKEYS';
import TextInput from '../../components/TextInput';
import AttachmentPicker from '../../components/AttachmentPicker';

const propTypes = {
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const validate = (formData) => {
    const errors = {};

    if (!formData.actionTried) {
        errors.actionTried = true;
    }

    if (!formData.expectedBehavior) {
        errors.expectedBehavior = true;
    }

    if (!formData.actualBehavior) {
        errors.actualBehavior = true;
    }

    return errors;
}

const submitBugReport = (formData) => {
    console.log('bug report is submitted', formData);
}

const BugReport = ({
    translate,
}) => {
    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={translate('bugReportForm.reportABug')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <Form
                formID={ONYXKEYS.FORMS.BUG_REPORT_FORM}
                validate={validate}
                onSubmit={submitBugReport}
                submitButtonText={translate('bugReportForm.submitBug')}
                style={[styles.mh5, styles.flexGrow1]}
            >
                <TextInput
                    inputID="actionTried"
                    label={translate('bugReportForm.actionTried')}
                    containerStyles={[{ height: 150 }]}
                    multiline
                />
                <TextInput
                    inputID="expectedBehavior"
                    label={translate('bugReportForm.expectedBehavior')}
                    containerStyles={[{ height: 150 }]}
                    multiline
                />
                <TextInput
                    inputID="actualBehavior"
                    label={translate('bugReportForm.actualBehavior')}
                    containerStyles={[{ height: 150 }]}
                    multiline
                />
                <AttachmentPicker type={CONST.ATTACHMENT_PICKER_TYPE.IMAGE}>
                    {({ openPicker }) => (
                        <Text>Hello</Text>
                    )}
                </AttachmentPicker>
                {/* <FlatList data={imageUrls} renderItem={({item: url}) => <ImageItem url={url} />} /> */}
            </Form>
        </ScreenWrapper>
    );
};

BugReport.propTypes = propTypes;
BugReport.displayName = 'BugReport';

export default compose(withWindowDimensions, withLocalize, withOnyx({
    formData: {
        key: ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM,
    },
}),)(BugReport);
