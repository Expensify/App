import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {View, Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
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
import ROUTES from '../../ROUTES';
import Form from '../../components/Form';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import reportPropTypes from '../reportPropTypes';
import personalDetailsPropType from '../personalDetailsPropType';
import RenderHTML from '../../components/RenderHTML';
import PressableWithoutFeedback from '../../components/Pressable/PressableWithoutFeedback';
import * as Report from '../../libs/actions/Report';
import useLocalize from '../../hooks/useLocalize';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';

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
    const [privateNote, setPrivateNote] = useState(lodashGet(report, ['privateNotes', route.params.accountID, 'note'], ''));
    const isCurrentUserNote = Number(session.accountID) === Number(route.params.accountID);

    const savePrivateNote = () => {
        if (_.isEmpty(privateNote)) {
            return;
        }
        const parser = new ExpensiMark();
        const editedNote = parser.replace(privateNote);
        Report.updatePrivateNotes(report.reportID, route.params.accountID, editedNote);
        Keyboard.dismiss();

        // Enable the view mode once we have saved the updated note
        setPrivateNote(editedNote);
        setEditMode(false);
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <FullPageNotFoundView
                shouldShow={_.isEmpty(report) || _.isEmpty(report.privateNotes) || !_.has(report, ['privateNotes', route.params.accountID, 'note'])}
                subtitleKey="privateNotes.notesUnavailable"
                onBackButtonPress={() => Navigation.goBack(ROUTES.PRIVATE_NOTES_VIEW)}
            >
                <HeaderWithBackButton
                    title={translate('privateNotes.title')}
                    subtitle="My note"
                    shouldShowBackButton
                    onCloseButtonPress={() => Navigation.dismissModal()}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.PRIVATE_NOTES_VIEW)}
                />
                <View style={[styles.flexGrow1, styles.ph5]}>
                    <View style={[styles.mb5]}>
                        <Text>
                            {translate(
                                Str.extractEmailDomain(lodashGet(personalDetailsList, [route.params.accountID, 'login'], '')) === CONST.EMAIL.GUIDES_DOMAIN
                                    ? 'privateNotes.sharedNoteMessage'
                                    : 'privateNotes.personalNoteMessage',
                            )}
                        </Text>
                    </View>
                    <Form
                        formID={ONYXKEYS.FORMS.PRIVATE_NOTES_FORM}
                        onSubmit={savePrivateNote}
                        submitButtonText={translate('common.save')}
                        enabledWhenOffline
                    >
                        <View style={[styles.mb3]}>
                            <TextInput
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                                inputID="privateNotes"
                                label={translate('privateNotes.composerLabel')}
                                accessibilityLabel={translate('privateNotes.title')}
                                autoCompleteType="off"
                                autoCorrect={false}
                                autoGrowHeight
                                textAlignVertical="top"
                                containerStyles={[styles.autoGrowHeightMultilineInput]}
                                defaultValue={privateNote}
                                value={privateNote}
                                onChangeText={(text) => setPrivateNote(text)}
                            />
                        </View>
                    </Form>
                </View>
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
