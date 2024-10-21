import {useFocusEffect} from '@react-navigation/native';
import {Str} from 'expensify-common';
import lodashDebounce from 'lodash/debounce';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Keyboard} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useHtmlPaste from '@hooks/useHtmlPaste';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PrivateNotesNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import * as ReportUtils from '@libs/ReportUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import type {WithReportAndPrivateNotesOrNotFoundProps} from '@pages/home/report/withReportAndPrivateNotesOrNotFound';
import withReportAndPrivateNotesOrNotFound from '@pages/home/report/withReportAndPrivateNotesOrNotFound';
import variables from '@styles/variables';
import * as ReportActions from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PrivateNotesForm';
import type {PersonalDetailsList, Report} from '@src/types/onyx';
import type {Note} from '@src/types/onyx/Report';

type PrivateNotesEditPageOnyxProps = {
    /** All of the personal details for everyone */
    personalDetailsList: OnyxEntry<PersonalDetailsList>;
};

type PrivateNotesEditPageProps = WithReportAndPrivateNotesOrNotFoundProps &
    PrivateNotesEditPageOnyxProps &
    PlatformStackScreenProps<PrivateNotesNavigatorParamList, typeof SCREENS.PRIVATE_NOTES.EDIT> & {
        /** The report currently being looked at */
        report: Report;
    };

function PrivateNotesEditPage({route, personalDetailsList, report, session}: PrivateNotesEditPageProps) {
    const backTo = route.params.backTo;
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // We need to edit the note in markdown format, but display it in HTML format
    const [privateNote, setPrivateNote] = useState(
        () => ReportActions.getDraftPrivateNote(report.reportID).trim() || Parser.htmlToMarkdown(report?.privateNotes?.[Number(route.params.accountID)]?.note ?? '').trim(),
    );

    /**
     * Save the draft of the private note. This debounced so that we're not ceaselessly saving your edit. Saving the draft
     * allows one to navigate somewhere else and come back to the private note and still have it in edit mode.
     */
    const debouncedSavePrivateNote = useMemo(
        () =>
            lodashDebounce((text: string) => {
                ReportActions.savePrivateNotesDraft(report.reportID, text);
            }, 1000),
        [report.reportID],
    );

    // To focus on the input field when the page loads
    const privateNotesInput = useRef<AnimatedTextInputRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useHtmlPaste(privateNotesInput);

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
        const originalNote = report?.privateNotes?.[Number(route.params.accountID)]?.note ?? '';
        let editedNote = '';
        if (privateNote.trim() !== originalNote.trim()) {
            editedNote = ReportActions.handleUserDeletedLinksInHtml(privateNote.trim(), Parser.htmlToMarkdown(originalNote).trim());
            ReportActions.updatePrivateNotes(report.reportID, Number(route.params.accountID), editedNote);
        }

        // We want to delete saved private note draft after saving the note
        debouncedSavePrivateNote('');

        Keyboard.dismiss();
        if (!Object.values<Note>({...report.privateNotes, [route.params.accountID]: {note: editedNote}}).some((item) => item.note)) {
            ReportUtils.navigateToDetailsPage(report, backTo);
        } else {
            Navigation.goBack(ROUTES.PRIVATE_NOTES_LIST.getRoute(report.reportID, backTo));
        }
    };

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom={false}
            testID={PrivateNotesEditPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('privateNotes.title')}
                onBackButtonPress={() => ReportUtils.goBackFromPrivateNotes(report, session, backTo)}
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
                        Str.extractEmailDomain(personalDetailsList?.[route.params.accountID]?.login ?? '') === CONST.EMAIL.GUIDES_DOMAIN
                            ? 'privateNotes.sharedNoteMessage'
                            : 'privateNotes.personalNoteMessage',
                    )}
                </Text>
                <OfflineWithFeedback
                    errors={{
                        ...(report?.privateNotes?.[Number(route.params.accountID)]?.errors ?? ''),
                    }}
                    onClose={() => ReportActions.clearPrivateNotesError(report.reportID, Number(route.params.accountID))}
                    style={[styles.mb3]}
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        role={CONST.ROLE.PRESENTATION}
                        inputID={INPUT_IDS.PRIVATE_NOTES}
                        label={translate('privateNotes.composerLabel')}
                        accessibilityLabel={translate('privateNotes.title')}
                        autoCompleteType="off"
                        maxLength={CONST.MAX_COMMENT_LENGTH}
                        autoCorrect={false}
                        autoGrowHeight
                        maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                        defaultValue={privateNote}
                        value={privateNote}
                        onChangeText={(text: string) => {
                            debouncedSavePrivateNote(text);
                            setPrivateNote(text);
                        }}
                        ref={(el: AnimatedTextInputRef) => {
                            if (!el) {
                                return;
                            }
                            if (!privateNotesInput.current) {
                                updateMultilineInputRange(el);
                            }
                            privateNotesInput.current = el;
                        }}
                        isMarkdownEnabled
                    />
                </OfflineWithFeedback>
            </FormProvider>
        </ScreenWrapper>
    );
}

PrivateNotesEditPage.displayName = 'PrivateNotesEditPage';

export default withReportAndPrivateNotesOrNotFound('privateNotes.title')(
    withOnyx<PrivateNotesEditPageProps, PrivateNotesEditPageOnyxProps>({
        personalDetailsList: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    })(PrivateNotesEditPage),
);
