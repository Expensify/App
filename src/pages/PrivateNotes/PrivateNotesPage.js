import React from 'react';
import PropTypes from 'prop-types';
import {View, Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import withLocalize from '../../components/withLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import TextInput from '../../components/TextInput';
import CONST from '../../CONST';
import Text from '../../components/Text';
import ROUTES from '../../ROUTES';
import Form from '../../components/Form';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import reportPropTypes from '../reportPropTypes';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes,
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** reportID and accountID passed via route: /r/:reportID/notes */
            reportID: PropTypes.string,
            accountID: PropTypes.string,
        }),
    }).isRequired,

    /** Returns translated string for given locale and phrase */
    translate: PropTypes.func.isRequired,
};

const defaultProps = {
    report: {},
};

class PrivateNotesPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            privateNote: lodashGet(this.props.report, `privateNotes.${this.props.route.params.accountID}.note`, ''),
        };
    }

    componentWillUnmount() {
        if (!this.focusTimeout) {
            return;
        }
        clearTimeout(this.focusTimeout);
    }

    savePrivateNote() {
        Keyboard.dismiss();
        
    }

    focusWelcomeMessageInput() {
        this.focusTimeout = setTimeout(() => {
            this.welcomeMessageInputRef.focus();
            // Below condition is needed for web, desktop and mweb only, for native cursor is set at end by default.
            if (this.welcomeMessageInputRef.value && this.welcomeMessageInputRef.setSelectionRange) {
                const length = this.welcomeMessageInputRef.value.length;
                this.welcomeMessageInputRef.setSelectionRange(length, length);
            }
        }, CONST.ANIMATED_TRANSITION);
    }

    render() {

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <FullPageNotFoundView
                    shouldShow={_.isEmpty(this.props.report) || _.isEmpty(this.props.report.privateNotes) || !_.has(this.props.report, `privateNotes.${this.props.route.params.accountID}.note`)}
                    subtitleKey='privateNotes.notesUnavailable'
                    onBackButtonPress={() => Navigation.goBack(ROUTES.PRIVATE_NOTES_LIST)}
                >
                    <HeaderWithBackButton
                        title={this.props.translate('privateNotes.title')}
                        subtitle='Users note'
                        shouldShowBackButton
                        onCloseButtonPress={() => Navigation.dismissModal()}
                        onBackButtonPress={() => Navigation.goBack()}
                    />
                    <Form
                        style={[styles.flexGrow1, styles.ph5]}
                        formID={ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM}
                        onSubmit={this.savePrivateNote}
                        submitButtonText={this.props.translate('common.save')}
                        enabledWhenOffline
                    >
                        <View style={[styles.mb5]}>
                            <Text>{this.props.translate('workspace.inviteMessage.inviteMessagePrompt')}</Text>
                        </View>
                        <View style={[styles.mb3]}>
                            <TextInput
                                ref={(el) => (this.welcomeMessageInputRef = el)}
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                                inputID="welcomeMessage"
                                label={this.props.translate('workspace.inviteMessage.personalMessagePrompt')}
                                accessibilityLabel={this.props.translate('workspace.inviteMessage.personalMessagePrompt')}
                                autoCompleteType="off"
                                autoCorrect={false}
                                autoGrowHeight
                                textAlignVertical="top"
                                containerStyles={[styles.autoGrowHeightMultilineInput]}
                                defaultValue={this.state.privateNote}
                                value={this.state.privateNote}
                                onChangeText={(text) => this.setState({privateNote: text})}
                            />
                        </View>
                    </Form>
                </FullPageNotFoundView>
            </ScreenWrapper>
        );
    }
}

PrivateNotesPage.propTypes = propTypes;
PrivateNotesPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID.toString()}`,
        },
    }),
)(PrivateNotesPage);
