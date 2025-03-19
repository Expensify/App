import {useFocusEffect} from '@react-navigation/native';
import {Str} from 'expensify-common';
import lodashDebounce from 'lodash/debounce';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Keyboard} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PrivateNotesNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import {goBackFromPrivateNotes, goBackToDetailsPage} from '@libs/ReportUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import type {WithReportAndPrivateNotesOrNotFoundProps} from '@pages/home/report/withReportAndPrivateNotesOrNotFound';
import withReportAndPrivateNotesOrNotFound from '@pages/home/report/withReportAndPrivateNotesOrNotFound';
import variables from '@styles/variables';
import {clearPrivateNotesError, getDraftPrivateNote, handleUserDeletedLinksInHtml, savePrivateNotesDraft, updatePrivateNotes} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PrivateNotesForm';
import type {Report} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {Note} from '@src/types/onyx/Report';

type PrivateNotesEditPageProps = WithReportAndPrivateNotesOrNotFoundProps &
    PlatformStackScreenProps<PrivateNotesNavigatorParamList, typeof SCREENS.PRIVATE_NOTES.EDIT> & {
        /** The report currently being looked at */
        report: Report;
    };

function PrivateNotesEditPage({route, report, accountID}: PrivateNotesEditPageProps) {
    const backTo = route.params.backTo;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    // We need to edit the note in markdown format, but display it in HTML format
    const [privateNote, setPrivateNote] = useState(
        () => getDraftPrivateNote(report.reportID).trim() || Parser.htmlToMarkdown(report?.privateNotes?.[Number(route.params.accountID)]?.note ?? '').trim(),
    );

    /**
     * Save the draft of the private note. This debounced so that we're not ceaselessly saving your edit. Saving the draft
     * allows one to navigate somewhere else and come back to the private note and still have it in edit mode.
     */
    const debouncedSavePrivateNote = useMemo(
        () =>
            lodashDebounce((text: string) => {
                savePrivateNotesDraft(report.reportID, text);
            }, 1000),
        [report.reportID],
    );

    // To focus on the input field when the page loads
    const privateNotesInput = useRef<AnimatedTextInputRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
            editedNote = handleUserDeletedLinksInHtml(privateNote.trim(), Parser.htmlToMarkdown(originalNote).trim());
            updatePrivateNotes(report.reportID, Number(route.params.accountID), editedNote);
        }

        // We want to delete saved private note draft after saving the note
        debouncedSavePrivateNote('');

        Keyboard.dismiss();

        const hasNewNoteBeenAdded = !originalNote && editedNote;
        if (!Object.values<Note>({...report.privateNotes, [route.params.accountID]: {note: editedNote}}).some((item) => item.note) || hasNewNoteBeenAdded) {
            goBackToDetailsPage(report, backTo, true);
        } else {
            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(ROUTES.PRIVATE_NOTES_LIST.getRoute(report.reportID, backTo)));
        }
    };

    const validate = useCallback((): Errors => {
        const errors: Errors = {};
        const privateNoteLength = privateNote.trim().length;
        if (privateNoteLength > CONST.MAX_COMMENT_LENGTH) {
            errors.privateNotes = translate('common.error.characterLimitExceedCounter', {
                length: privateNoteLength,
                limit: CONST.MAX_COMMENT_LENGTH,
            });
        }

        return errors;
    }, [privateNote, translate]);

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
            testID={PrivateNotesEditPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('privateNotes.title')}
                onBackButtonPress={() => goBackFromPrivateNotes(report, accountID, backTo)}
                shouldShowBackButton
                onCloseButtonPress={() => Navigation.dismissModal()}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.PRIVATE_NOTES_FORM}
                onSubmit={savePrivateNote}
                validate={validate}
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
                    onClose={() => clearPrivateNotesError(report.reportID, Number(route.params.accountID))}
                    style={[styles.mb3]}
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        role={CONST.ROLE.PRESENTATION}
                        inputID={INPUT_IDS.PRIVATE_NOTES}
                        label={translate('privateNotes.composerLabel')}
                        accessibilityLabel={translate('privateNotes.title')}
                        autoCompleteType="off"
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
                        type="markdown"
                    />
                </OfflineWithFeedback>
            </FormProvider>
        </ScreenWrapper>
    );
}

PrivateNotesEditPage.displayName = 'PrivateNotesEditPage';

export default withReportAndPrivateNotesOrNotFound('privateNotes.title')(PrivateNotesEditPage);
