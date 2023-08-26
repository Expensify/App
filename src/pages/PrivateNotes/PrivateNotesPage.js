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
import personalDetailsPropType from '../personalDetailsPropType';
import Str from 'expensify-common/lib/str';
import RenderHTML from '../../components/RenderHTML';
import { PressableWithoutFeedback } from '../../components/Pressable';
import * as Report from '../../libs/actions/Report';

const propTypes = {
     /** All of the personal details for everyone */
     personalDetailsList: PropTypes.objectOf(personalDetailsPropType),

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

    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** Currently logged in user authToken */
        authToken: PropTypes.string,
    }),

    /** Returns translated string for given locale and phrase */
    translate: PropTypes.func.isRequired,
};

const defaultProps = {
    report: {},
    session: {
        accountID: null,
    }
};

class PrivateNotesPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            privateNote: lodashGet(this.props.report, `privateNotes.${this.props.route.params.accountID}.note`, ''),
            editMode: false,
        };
    }

    componentWillUnmount() {
        if (!this.focusTimeout) {
            return;
        }
        clearTimeout(this.focusTimeout);
    }

    savePrivateNote() {
        Report.updatePrivateNotes(this.props.reportID, this.props.route.params.accountID, this.state.privateNote);
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
                    shouldShow={false}
                    subtitleKey='privateNotes.notesUnavailable'
                    onBackButtonPress={() => Navigation.goBack(ROUTES.PRIVATE_NOTES_LIST)}
                >
                    <HeaderWithBackButton
                        title={this.props.translate('privateNotes.title')}
                        subtitle= {Number(lodashGet(this.props.session, 'accountID', null)) === Number(this.props.route.params.accountID) ? 'Your note' : `${lodashGet(this.props.personalDetailsList, `${accountID}.login`, '')} note`}
                        shouldShowBackButton
                        onCloseButtonPress={() => Navigation.dismissModal()}
                        onBackButtonPress={() => Navigation.goBack()}
                    />
                    <Form
                        style={[styles.flexGrow1, styles.ph5]}
                        formID={ONYXKEYS.FORMS.PRIVATE_NOTES_FORM}
                        onSubmit={this.savePrivateNote}
                        submitButtonText={this.props.translate('common.save')}
                        enabledWhenOffline
                    >
                        <View style={[styles.mb5]}>
                            <Text>{this.props.translate(Str.extractEmailDomain(lodashGet(this.props.personalDetailsList, [this.props.route.params.accountID, 'login'], '')) === CONST.EMAIL.GUIDES_DOMAIN ? 'privateNotes.sharedNoteMessage' : 'privateNotes.personalNoteMessage')}</Text>
                        </View>
                        {
                            this.state.editMode ? <View style={[styles.mb3]}>
                            <TextInput
                                ref={(el) => (this.welcomeMessageInputRef = el)}
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                                inputID="privateNotes"
                                label={this.props.translate('privateNotes.composerLabel')}
                                accessibilityLabel={this.props.translate('privateNotes.title')}
                                autoCompleteType="off"
                                autoCorrect={false}
                                autoGrowHeight
                                textAlignVertical="top"
                                containerStyles={[styles.autoGrowHeightMultilineInput]}
                                defaultValue={this.state.privateNote}
                                value={this.state.privateNote}
                                onChangeText={(text) => this.setState({privateNote: text})}
                            />
                        </View> : <PressableWithoutFeedback>
                        <RenderHTML html={this.state.privateNote} />
                        </PressableWithoutFeedback>
                        }
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
        session: {
            key: ONYXKEYS.SESSION,
        },
        personalDetailsList: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
)(PrivateNotesPage);
