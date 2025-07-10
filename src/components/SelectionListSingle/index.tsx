import {FlashList} from '@shopify/flash-list';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import lodashDebounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {
    GestureResponderEvent,
    InputModeOptions,
    LayoutChangeEvent,
    NativeSyntheticEvent,
    SectionList as RNSectionList,
    TextInput as RNTextInput,
    SectionListData,
    SectionListRenderItemInfo,
    StyleProp,
    TextInputKeyPressEventData,
    ViewStyle,
} from 'react-native';
import {View} from 'react-native';
import Button from '@components/Button';
import Checkbox from '@components/Checkbox';
import FixedFooter from '@components/FixedFooter';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import {PressableWithFeedback} from '@components/Pressable';
import SectionList from '@components/SectionList';
import ShowMoreButton from '@components/ShowMoreButton';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useActiveElementRole from '@hooks/useActiveElementRole';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useScrollEnabled from '@hooks/useScrollEnabled';
import useSingleExecution from '@hooks/useSingleExecution';
import {focusedItemRef} from '@hooks/useSyncFocus/useSyncFocusImplementation';
import useThemeStyles from '@hooks/useThemeStyles';
import getSectionsWithIndexOffset from '@libs/getSectionsWithIndexOffset';
import {addKeyDownPressListener, removeKeyDownPressListener} from '@libs/KeyboardShortcut/KeyDownPressListener';
import Log from '@libs/Log';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import arraysEqual from '@src/utils/arraysEqual';
import BaseSelectionListItemRenderer from './BaseSelectionListItemRenderer';
import FocusAwareCellRendererComponent from './FocusAwareCellRendererComponent';
import type {ButtonOrCheckBoxRoles, FlattenedSectionsReturn, ListItem, SectionListDataType, SectionWithIndexOffset, SelectionListHandle, SelectionListProps} from './types';


type SelectionListSingleProps<TItem extends ListItem> = {
    data: TItem[] | typeof CONST.EMPTY_ARRAY;
    onSelectRow: (item: TItem) => void;
    showLoadingPlaceholder: boolean;
    showListEmptyContent?: boolean;
    shouldUseUserSkeletonView?: boolean;
    listEmptyContent?: React.JSX.Element | null | undefined;
    addBottomSafeAreaPadding?: boolean;
    footerContent?: React.ReactNode;
    onConfirm: ((e?: GestureResponderEvent | KeyboardEvent | undefined, option?: TItem | undefined) => void) | undefined;
    confirmButtonStyle: StyleProp<ViewStyle>;
    confirmButtonText: string;
    isConfirmButtonDisabled?: boolean;
    listFooterContent?: React.JSX.Element | null | undefined;
    showScrollIndicator?: boolean;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    listStyle?: StyleProp<ViewStyle>;
    shouldUseDynamicMaxToRenderPerBatch?: boolean;
    isLoadingNewOptions?: boolean;
    textInputLabel?: string;
    textInputValue?: string;
    onChangeText?: ((text: string) => void);
    shouldShowTextInput?: boolean;
    // rzadko uywane, moze jakies options?
    textInputHint?: string;
    textInputPlaceholder?: string;
    textInputMaxLength?: number;
    inputMode?: InputModeOptions;
    textInputErrorText?: string;
    ///
};

function SelectionListSingle<TItem extends ListItem>({
    data,
    onConfirm,
    confirmButtonText,
    confirmButtonStyle,
    isConfirmButtonDisabled,
    footerContent,
    shouldUseUserSkeletonView,
    showLoadingPlaceholder,
    showListEmptyContent,
    listEmptyContent,
    addBottomSafeAreaPadding,
    listFooterContent,
    showScrollIndicator = true,
    onEndReached,
    onEndReachedThreshold,
    listStyle,
    shouldUseDynamicMaxToRenderPerBatch,
    isLoadingNewOptions,
    textInputLabel,
    textInputValue,
    textInputHint,
    textInputPlaceholder,
    textInputMaxLength,
    onChangeText,
    inputMode,
shouldShowTextInput = !!textInputLabel,
textInputErrorText,
onSelectRow,


}: SelectionListSingleProps<TItem>) {
    const styles = useThemeStyles();
    const [currentPage, setCurrentPage] = useState(1);
    const incrementPage = () => setCurrentPage((prev) => prev + 1);
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const scrollEnabled = useScrollEnabled();
    const [maxToRenderPerBatch, setMaxToRenderPerBatch] = useState(shouldUseDynamicMaxToRenderPerBatch ? 0 : CONST.MAX_TO_RENDER_PER_BATCH.DEFAULT);
    // REF
    const innerTextInputRef = useRef<RNTextInput | null>(null);
        const isTextInputFocusedRef = useRef<boolean>(false);

    const showConfirmButton = useMemo(() => !!confirmButtonText, [confirmButtonText]);

        const textInputKeyPress = useCallback((event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
            const key = event.nativeEvent.key;
            if (key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) {
                focusedItemRef?.focus();
            }
        }, []);

    const selectFocusedOption = () => {
        const focusedOption = getFocusedOption();

        if (!focusedOption) {
            return;
        }

        selectRow(focusedOption);
    };


    const renderInput = () => {
        return (
            <View style={[styles.ph5, styles.pb3]}>
                <TextInput
                    onKeyPress={textInputKeyPress}
                    ref={(element) => {
                        innerTextInputRef.current = element as RNTextInput;
                    }}
                    onFocus={() => (isTextInputFocusedRef.current = true)}
                    onBlur={() => (isTextInputFocusedRef.current = false)}
                    label={textInputLabel}
                    accessibilityLabel={textInputLabel}
                    hint={textInputHint}
                    role={CONST.ROLE.PRESENTATION}
                    value={textInputValue}
                    placeholder={textInputPlaceholder}
                    maxLength={textInputMaxLength}
                    onChangeText={onChangeText}
                    inputMode={inputMode}
                    selectTextOnFocus
                    spellCheck={false}
                    onSubmitEditing={selectFocusedOption}
                    submitBehavior={
    data.length ? 'blurAndSubmit' : 'submit'
}
                    isLoading={isLoadingNewOptions}
                    testID="selection-list-text-input"
                    errorText={textInputErrorText}
                shouldInterceptSwipe={false}

                />
            </View>
        );
    };

    const [slicedData, ShowMoreButtonInstance] = useMemo(() => {
        const pageSize = CONST.MAX_SELECTION_LIST_PAGE_LENGTH * currentPage;
        const partData = data.slice(0, pageSize);

        const shouldShowMoreButton = data.length > pageSize;
        const showMoreButton = shouldShowMoreButton ? (
            <ShowMoreButton
                containerStyle={[styles.mt2, styles.mb5]}
                currentCount={pageSize}
                totalCount={data.length}
                onPress={incrementPage}
            />
        ) : null;

        return [partData, showMoreButton];
    }, [currentPage, data, styles.mb5, styles.mt2]);

    const renderListEmptyContent = () => {
        if (showLoadingPlaceholder) {
            return <OptionsListSkeletonView shouldStyleAsTable={shouldUseUserSkeletonView} />;
        }
        if (showListEmptyContent) {
            return listEmptyContent;
        }
        return null;
    };

    return (
        <View>
             {shouldShowTextInput && renderInput()}
            {data.length === 0 ? (
                renderListEmptyContent()
            ) : (
                <FlashList
                    data={slicedData}
                    renderItem={}
                    keyExtractor={(item, index) => item.keyForList ?? `${index}`}
                    estimatedItemSize={60}
                    ListFooterComponent={listFooterContent ?? ShowMoreButtonInstance}
                    scrollEnabled={scrollEnabled}
                    indicatorStyle="white"
                    keyboardShouldPersistTaps="always"
                    showsVerticalScrollIndicator={showScrollIndicator}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={onEndReachedThreshold}
                    style={[listStyle]}
                />
            )}

            {showConfirmButton && (
                <FixedFooter
                    style={styles.mtAuto}
                    addBottomSafeAreaPadding={addBottomSafeAreaPadding}
                >
                    <Button
                        success
                        large
                        style={[styles.w100, confirmButtonStyle]}
                        text={confirmButtonText}
                        onPress={onConfirm}
                        pressOnEnter
                        enterKeyEventListenerPriority={1}
                        isDisabled={isConfirmButtonDisabled}
                    />
                </FixedFooter>
            )}
            {!!footerContent && (
                <FixedFooter
                    style={styles.mtAuto}
                    addBottomSafeAreaPadding={addBottomSafeAreaPadding}
                >
                    {footerContent}
                </FixedFooter>
            )}
        </View>
    );
}
