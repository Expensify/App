import {useFocusEffect} from '@react-navigation/native';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import withLocalize from '@components/withLocalize';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import updateMultilineInputRange from '@libs/UpdateMultilineInputRange';
import withReportAndPrivateNotesOrNotFound from '@pages/home/report/withReportAndPrivateNotesOrNotFound';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

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
};

const defaultProps = {
    report: {},
    personalDetailsList: {},
};

function PrivateNotesEditPage({route, personalDetailsList, report}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // We need to edit the note in markdown format, but display it in HTML format
    const parser = new ExpensiMark();
    const [privateNote, setPrivateNote] = useState(
        () => Report.getDraftPrivateNote(report.reportID).trim() || parser.htmlToMarkdown(lodashGet(report, ['privateNotes', route.params.accountID, 'note'], '')).trim(),
    );

    /**
     * Save the draft of the private note. This debounced so that we're not ceaselessly saving your edit. Saving the draft
     * allows one to navigate somewhere else and come back to the private note and still have it in edit mode.
     * @param {String} newDraft
     */
    const debouncedSavePrivateNote = useMemo(
        () =>
            _.debounce((text) => {
                Report.savePrivateNotesDraft(report.reportID, text);
            }, 1000),
        [report.reportID],
    );

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
        const originalNote = lodashGet(report, ['privateNotes', route.params.accountID, 'note'], '');

        if (privateNote.trim() !== originalNote.trim()) {
            const editedNote = Report.handleUserDeletedLinksInHtml(privateNote.trim(), parser.htmlToMarkdown(originalNote).trim());
            Report.updatePrivateNotes(report.reportID, route.params.accountID, editedNote);
        }

        // We want to delete saved private note draft after saving the note
        debouncedSavePrivateNote('');

        Keyboard.dismiss();

        // Take user back to the PrivateNotesView page
        Navigation.goBack(ROUTES.PRIVATE_NOTES_VIEW.getRoute(report.reportID, route.params.accountID));
    };

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom={false}
            testID={PrivateNotesEditPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('privateNotes.title')}
                subtitle={translate('privateNotes.myNote')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.PRIVATE_NOTES_VIEW.getRoute(report.reportID, route.params.accountID))}
                shouldShowBackButton
                onCloseButtonPress={() => Navigation.dismissModal()}
            />
            <FormProvider
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
                    <InputWrapper
                        InputComponent={TextInput}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        inputID="privateNotes"
                        label={translate('privateNotes.composerLabel')}
                        accessibilityLabel={translate('privateNotes.title')}
                        autoCompleteType="off"
                        maxLength={CONST.MAX_COMMENT_LENGTH}
                        autoCorrect={false}
                        autoGrowHeight
                        containerStyles={[styles.autoGrowHeightMultilineInput]}
                        defaultValue={privateNote}
                        value={privateNote}
                        onChangeText={(text) => {
                            debouncedSavePrivateNote(text);
                            setPrivateNote(text);
                        }}
                        ref={(el) => {
                            if (!el) {
                                return;
                            }
                            privateNotesInput.current = el;
                            updateMultilineInputRange(privateNotesInput.current);
                        }}
                    />
                </OfflineWithFeedback>
            </FormProvider>
        </ScreenWrapper>
    );
}

PrivateNotesEditPage.displayName = 'PrivateNotesEditPage';
PrivateNotesEditPage.propTypes = propTypes;
PrivateNotesEditPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withReportAndPrivateNotesOrNotFound,
    withOnyx({
        personalDetailsList: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
)(PrivateNotesEditPage);
