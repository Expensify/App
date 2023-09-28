import React, {useState, useRef, useCallback} from 'react';
import PropTypes from 'prop-types';
import {Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {useFocusEffect} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import _ from 'underscore';
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
import Form from '../../components/Form';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import reportPropTypes from '../reportPropTypes';
import personalDetailsPropType from '../personalDetailsPropType';
import * as Report from '../../libs/actions/Report';
import useLocalize from '../../hooks/useLocalize';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import updateMultilineInputRange from '../../libs/UpdateMultilineInputRange';
import ROUTES from '../../ROUTES';
import * as ReportUtils from '../../libs/ReportUtils';

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
        /** Currently logged in user accountID */
        accountID: PropTypes.number,
    }),
};

const defaultProps = {
    report: {},
    session: {
        accountID: null,
    },
    personalDetailsList: {},
};

function PrivateNotesEditPage({route, personalDetailsList, session, report}) {
    const {translate} = useLocalize();

    // We need to edit the note in markdown format, but display it in HTML format
    const parser = new ExpensiMark();
    const [privateNote, setPrivateNote] = useState(parser.htmlToMarkdown(lodashGet(report, ['privateNotes', route.params.accountID, 'note'], '')).trim());
    const isCurrentUserNote = Number(session.accountID) === Number(route.params.accountID);

    // To focus on the input field when the page loads
    const privateNotesInput = useRef(null);
    const focusTimeoutRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                if (privateNotesInput.current) {
                    privateNotesInput.current.focus();
                }
                return () => {
                    if (!focusTimeoutRef.current) {
                        return;
                    }
                    clearTimeout(focusTimeoutRef.current);
                };
            }, CONST.ANIMATED_TRANSITION);
        }, []),
    );

    const savePrivateNote = () => {
        const editedNote = parser.replace(privateNote.trim());
        Report.updatePrivateNotes(report.reportID, route.params.accountID, editedNote);
        Keyboard.dismiss();

        // Take user back to the PrivateNotesView page
        Navigation.goBack(ROUTES.HOME);
    };

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom={false}
            testID={PrivateNotesEditPage.displayName}
        >
            <FullPageNotFoundView
                shouldShow={
                    _.isEmpty(report) ||
                    _.isEmpty(report.privateNotes) ||
                    !_.has(report, ['privateNotes', route.params.accountID, 'note']) ||
                    !isCurrentUserNote ||
                    ReportUtils.isArchivedRoom(report)
                }
                subtitleKey="privateNotes.notesUnavailable"
            >
                <HeaderWithBackButton
                    title={translate('privateNotes.title')}
                    subtitle={translate('privateNotes.myNote')}
                    shouldShowBackButton
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <Form
                    formID={ONYXKEYS.FORMS.PRIVATE_NOTES_FORM}
                    onSubmit={savePrivateNote}
                    style={[styles.flexGrow1, styles.ph5]}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <Text style={[styles.mb5]}>
                        {translate(
                            Str.extractEmailDomain(lodashGet(personalDetailsList, [route.params.accountID, 'login'], '')) === CONST.EMAIL.GUIDES_DOMAIN
                                ? 'privateNotes.sharedNoteMessage'
                                : 'privateNotes.personalNoteMessage',
                        )}
                    </Text>
                    <OfflineWithFeedback
                        errors={{
                            ...lodashGet(report, ['privateNotes', route.params.accountID, 'errors'], ''),
                        }}
                        onClose={() => Report.clearPrivateNotesError(report.reportID, route.params.accountID)}
                        style={[styles.mb3]}
                    >
                        <TextInput
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            inputID="privateNotes"
                            label={translate('privateNotes.composerLabel')}
                            accessibilityLabel={translate('privateNotes.title')}
                            autoCompleteType="off"
                            maxLength={CONST.MAX_COMMENT_LENGTH}
                            autoCorrect={false}
                            autoGrowHeight
                            textAlignVertical="top"
                            containerStyles={[styles.autoGrowHeightMultilineInput]}
                            defaultValue={privateNote}
                            value={privateNote}
                            onChangeText={(text) => setPrivateNote(text)}
                            ref={(el) => {
                                if (!el) {
                                    return;
                                }
                                privateNotesInput.current = el;
                                updateMultilineInputRange(privateNotesInput.current);
                            }}
                        />
                    </OfflineWithFeedback>
                </Form>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

PrivateNotesEditPage.displayName = 'PrivateNotesEditPage';
PrivateNotesEditPage.propTypes = propTypes;
PrivateNotesEditPage.defaultProps = defaultProps;

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
)(PrivateNotesEditPage);
