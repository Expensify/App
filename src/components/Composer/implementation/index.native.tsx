import type {MarkdownStyle, MarkdownTextInput} from '@expensify/react-native-live-markdown';
import mimeDb from 'mime-db';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {NativeSyntheticEvent, TextInputChangeEvent, TextInputPasteEventData} from 'react-native';
import {StyleSheet} from 'react-native';
import type {ComposerProps, ComposerRef} from '@components/Composer/types';
import type {AnimatedMarkdownTextInputRef} from '@components/RNMarkdownTextInput';
import RNMarkdownTextInput from '@components/RNMarkdownTextInput';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useMarkdownStyle from '@hooks/useMarkdownStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {containsOnlyEmojis, convertEmojiShortcodesToUnicode} from '@libs/EmojiUtils';
import {splitExtensionFromFileName} from '@libs/fileDownload/FileUtils';
import getLandscapeTextInputRefProxy from '@libs/getLandscapeTextInputRefProxy';
import Parser from '@libs/Parser';
import getFileSize from '@pages/Share/getFileSize';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

const excludeNoStyles: Array<keyof MarkdownStyle> = [];
const excludeReportMentionStyle: Array<keyof MarkdownStyle> = ['mentionReport'];

function Composer({
    onClear: onClearProp = () => {},
    onPasteFile = () => {},
    isDisabled = false,
    maxLines,
    onChangeText = () => {},
    isComposerFullSize = false,
    style,
    // On native layers we like to have the Text Input not focused so the
    // user can read new chats without the keyboard in the way of the view.
    // On Android the selection prop is required on the TextInput but this prop has issues on IOS
    selection,
    value,
    isGroupPolicyReport = false,
    ref,
    ...props
}: ComposerProps) {
    const textInputRef = useRef<MarkdownTextInput | null>(null);
    // Native may still emit the raw text change after paste, so keep the converted value ready for that next change.
    const pendingPastedTextRef = useRef<{rawText: string; convertedText: string} | null>(null);
    const valueRef = useRef(value);
    const selectionRef = useRef(selection);
    const textContainsOnlyEmojis = useMemo(() => containsOnlyEmojis(Parser.htmlToText(Parser.replace(value ?? ''))), [value]);
    const theme = useTheme();
    const markdownStyle = useMarkdownStyle(textContainsOnlyEmojis, !isGroupPolicyReport ? excludeReportMentionStyle : excludeNoStyles);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const isInLandscapeMode = useIsInLandscapeMode();

    useEffect(() => {
        valueRef.current = value;
        selectionRef.current = selection;
    }, [selection, value]);

    useEffect(() => {
        if (!textInputRef.current?.setSelection || !selection || isComposerFullSize) {
            return;
        }

        // We need the delay for setSelection to properly work for IOS in bridgeless mode due to a react native
        // internal bug of dispatching the event before the component is ready for it.
        // (see https://github.com/Expensify/App/pull/50520#discussion_r1861960311 for more context)
        const timeoutID = setTimeout(() => {
            // We are setting selection twice to trigger a scroll to the cursor on toggling to smaller composer size.
            textInputRef.current?.setSelection((selection.start || 1) - 1, selection.start);
            textInputRef.current?.setSelection(selection.start, selection.start);
        }, 0);

        return () => clearTimeout(timeoutID);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isComposerFullSize]);

    /**
     * Set the TextInput Ref
     * @param {Element} el
     */
    const setTextInputRef = useCallback(
        (el: AnimatedMarkdownTextInputRef | null) => {
            textInputRef.current = isInLandscapeMode ? getLandscapeTextInputRefProxy(el) : el;

            if (typeof ref !== 'function' || textInputRef.current === null) {
                return;
            }

            // This callback prop is used by the parent component using the constructor to
            // get a ref to the inner textInput element e.g. if we do
            // <constructor ref={el => this.textInput = el} /> this will not
            // return a ref to the component, but rather the HTML element by default
            ref(textInputRef.current as ComposerRef);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isInLandscapeMode],
    );

    const onClear = useCallback(
        ({nativeEvent}: TextInputChangeEvent) => {
            onClearProp(nativeEvent.text);
        },
        [onClearProp],
    );

    const pasteFile = useCallback(
        (e: NativeSyntheticEvent<TextInputPasteEventData>) => {
            const clipboardContent = e.nativeEvent.items.at(0);
            if (clipboardContent?.type === 'text/plain') {
                // Native paste only provides plain text, so convert pasted emoji shortcodes before the composer stores them.
                const convertedText = convertEmojiShortcodesToUnicode(clipboardContent.data);

                if (convertedText === clipboardContent.data) {
                    return;
                }

                e.preventDefault();

                const currentValue = valueRef.current ?? '';
                const currentSelection = selectionRef.current;
                const selectionStart = currentSelection?.start ?? currentValue.length;
                const selectionEnd = currentSelection?.end ?? selectionStart;
                const textBeforeSelection = currentValue.slice(0, selectionStart);
                const textAfterSelection = currentValue.slice(selectionEnd);
                const rawPastedText = `${textBeforeSelection}${clipboardContent.data}${textAfterSelection}`;
                const convertedPastedText = `${textBeforeSelection}${convertedText}${textAfterSelection}`;

                pendingPastedTextRef.current = {rawText: rawPastedText, convertedText: convertedPastedText};
                onChangeText(convertedPastedText);
                return;
            }
            const mimeType = clipboardContent?.type ?? '';
            const fileURI = clipboardContent?.data;
            const baseFileName = fileURI?.split('/').pop() ?? 'file';
            const {fileName: stem, fileExtension: originalFileExtension} = splitExtensionFromFileName(baseFileName);
            const fileExtension = originalFileExtension || (mimeDb[mimeType].extensions?.[0] ?? 'bin');
            const fileName = `${stem}.${fileExtension}`;
            let file: FileObject = {uri: fileURI, name: fileName, type: mimeType, size: 0};
            getFileSize(file.uri ?? '')
                .then((size) => (file = {...file, size}))
                .finally(() => onPasteFile(file));
        },
        [onChangeText, onPasteFile],
    );

    const handleChangeText = useCallback(
        (text: string) => {
            if (pendingPastedTextRef.current?.rawText === text || pendingPastedTextRef.current?.convertedText === text) {
                pendingPastedTextRef.current = null;
                return;
            }

            pendingPastedTextRef.current = null;
            onChangeText(text);
        },
        [onChangeText],
    );

    const maxHeightStyle = useMemo(
        () => StyleUtils.getComposerMaxHeightStyle(isInLandscapeMode ? CONST.COMPOSER.MAX_LINES_LANDSCAPE_MODE : maxLines, isComposerFullSize),
        [StyleUtils, isComposerFullSize, maxLines, isInLandscapeMode],
    );
    const composerStyle = useMemo(() => StyleSheet.flatten([style, textContainsOnlyEmojis ? styles.onlyEmojisTextLineHeight : {}]), [style, textContainsOnlyEmojis, styles]);

    return (
        <RNMarkdownTextInput
            id={CONST.COMPOSER.NATIVE_ID}
            multiline
            autoComplete="off"
            placeholderTextColor={theme.placeholderText}
            ref={setTextInputRef}
            value={value}
            rejectResponderTermination={false}
            smartInsertDelete={false}
            textAlignVertical="center"
            style={[composerStyle, maxHeightStyle]}
            markdownStyle={markdownStyle}
            {...props}
            autoFocus={isInLandscapeMode ? false : props.autoFocus}
            readOnly={isDisabled}
            onPaste={pasteFile}
            onClear={onClear}
            onChangeText={handleChangeText}
            disableFullscreenUI
        />
    );
}

export default Composer;
