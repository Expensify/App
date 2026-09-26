import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';

import type {AccessVariant} from '@pages/workspace/AccessOrNotFoundWrapper';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {ConnectionName, PolicyFeatureName} from '@src/types/onyx/Policy';
import type {ReceiptErrors} from '@src/types/onyx/Transaction';

import type {StyleProp, ViewStyle} from 'react-native';

import isEmpty from 'lodash/isEmpty';
import React from 'react';

import type SingleSelectWithAvatarListItem from './SelectionList/ListItem/SingleSelectWithAvatarListItem';
import type {ConfirmButtonOptions, ListItem} from './SelectionList/types';

import ErrorMessageRow from './ErrorMessageRow';
import HeaderWithBackButton from './HeaderWithBackButton';
import OfflineWithFeedback from './OfflineWithFeedback';
import ScreenWrapper from './ScreenWrapper';
import SelectionList from './SelectionList';
import SingleSelectListItem from './SelectionList/ListItem/SingleSelectListItem';

type SelectorType<T = string> = ListItem & {
    value: T;

    onPress?: () => void;
};

type SelectionScreenProps<T = string> = {
    /** Used to set the testID for tests */
    displayName: string;

    title?: TranslationPaths;
    headerContent?: React.ReactNode;
    listEmptyContent?: React.JSX.Element | null;

    /** Skip listEmptyContent when the list is empty because of search, not a missing dataset. */
    shouldShowListEmptyContent?: boolean;
    listFooterContent?: React.JSX.Element | null;

    /** Sections for the section list */
    data: Array<SelectorType<T>>;

    /** Renderer for every item in the list. Defaults to SingleSelectListItem. */
    ListItem?: typeof SingleSelectListItem | typeof SingleSelectWithAvatarListItem;

    listItemWrapperStyle?: StyleProp<ViewStyle>;

    /** Item `keyForList` to focus initially */
    initiallyFocusedOptionKey?: string | undefined;

    onSelectRow: (item: SelectorType<T>) => void;
    onBackButtonPress?: () => void;
    policyID?: string;

    /** Defines which types of access should be verified */
    accessVariants?: AccessVariant[];

    /** The current feature name that the user tries to get access to */
    featureName?: PolicyFeatureName;

    /** Whether or not to block user from accessing the page */
    shouldBeBlocked?: boolean;

    connectionName: ConnectionName;

    /** The type of action that's pending  */
    pendingAction?: OnyxCommon.PendingAction | null;

    errors?: OnyxCommon.Errors | ReceiptErrors | null;
    errorRowStyles?: StyleProp<ViewStyle>;

    /** A function to run when the X button next to the error is clicked */
    onClose?: () => void;

    /** Whether to single execute `onRowSelect` - this prevents bugs related to double interactions */
    shouldSingleExecuteRowSelect?: boolean;

    /** Used for dynamic header title translation with parameters */
    headerTitleAlreadyTranslated?: string;

    /** Whether to update the focused index on a row select */
    shouldUpdateFocusedIndex?: boolean;

    shouldShowTextInput?: boolean;

    /** Whether to allow each row's title to wrap onto multiple lines instead of truncating */
    isRowMultilineSupported?: boolean;

    textInputOptions?: {
        /** Label for the text input */
        label?: string;

        /** Value for the text input */
        value?: string;

        /** Callback to fire when the text input changes */
        onChangeText?: (text: string) => void;
    };

    /** Footer save button. When omitted, tapping a row still commits immediately. */
    confirmButtonOptions?: ConfirmButtonOptions<SelectorType<T>>;
};

function SelectionScreen<T = string>({
    displayName,
    title,
    headerContent,
    listEmptyContent,
    shouldShowListEmptyContent,
    listFooterContent,
    data,
    ListItem = SingleSelectListItem,
    listItemWrapperStyle,
    initiallyFocusedOptionKey,
    onSelectRow,
    onBackButtonPress,
    policyID,
    accessVariants,
    featureName,
    shouldBeBlocked,
    connectionName,
    pendingAction,
    errors,
    errorRowStyles,
    onClose,
    shouldSingleExecuteRowSelect,
    headerTitleAlreadyTranslated,
    shouldShowTextInput,
    textInputOptions,
    shouldUpdateFocusedIndex = false,
    isRowMultilineSupported = false,
    confirmButtonOptions,
}: SelectionScreenProps<T>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const isConnectionEmpty = isEmpty(policy?.connections?.[connectionName]);

    // Pin the pre-selected option to the top of searchable lists so it's visible without scrolling for its whole open cycle.
    // Gated on textInputOptions so only searchable selectors are reordered, and moveInitialSelectionToTop itself no-ops for
    // lists under the item-limit threshold. These selectors commit-and-navigate on select, so the pre-selection never changes
    // in place while the screen is open — no snapshot freeze is needed here.
    const shouldPinInitialSelection = !!textInputOptions;
    const orderedData = shouldPinInitialSelection
        ? moveInitialSelectionToTop(data, initiallyFocusedOptionKey ? [initiallyFocusedOptionKey] : [], (item: SelectorType<T>) => item.keyForList)
        : data;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={accessVariants}
            featureName={featureName}
            shouldBeBlocked={isConnectionEmpty || shouldBeBlocked}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID={displayName}
            >
                <HeaderWithBackButton
                    title={headerTitleAlreadyTranslated ?? (title ? translate(title) : '')}
                    onBackButtonPress={onBackButtonPress}
                />
                {headerContent}
                <OfflineWithFeedback
                    pendingAction={pendingAction}
                    style={[styles.flex1]}
                    contentContainerStyle={[styles.flex1]}
                    shouldDisableOpacity={!data.length}
                >
                    <SelectionList
                        data={orderedData}
                        ListItem={ListItem}
                        onSelectRow={onSelectRow}
                        showScrollIndicator
                        shouldShowTooltips={false}
                        initiallyFocusedItemKey={initiallyFocusedOptionKey}
                        textInputOptions={textInputOptions}
                        listEmptyContent={listEmptyContent}
                        shouldShowListEmptyContent={shouldShowListEmptyContent}
                        shouldShowTextInput={shouldShowTextInput}
                        listFooterContent={listFooterContent}
                        style={{listItemWrapperStyle}}
                        shouldSingleExecuteRowSelect={shouldSingleExecuteRowSelect}
                        shouldUpdateFocusedIndex={shouldPinInitialSelection || shouldUpdateFocusedIndex}
                        shouldScrollToFocusedIndexOnMount={!shouldPinInitialSelection}
                        disableMaintainingScrollPosition={shouldPinInitialSelection}
                        alternateNumberOfSupportedLines={2}
                        isRowMultilineSupported={isRowMultilineSupported}
                        addBottomSafeAreaPadding
                        confirmButtonOptions={confirmButtonOptions}
                    >
                        <ErrorMessageRow
                            errors={errors}
                            errorRowStyles={errorRowStyles}
                            onDismiss={onClose}
                        />
                    </SelectionList>
                </OfflineWithFeedback>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export type {SelectorType};

export default SelectionScreen;
