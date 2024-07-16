import {isEmpty} from 'lodash';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {AccessVariant} from '@pages/workspace/AccessOrNotFoundWrapper';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {ConnectionName, PolicyFeatureName} from '@src/types/onyx/Policy';
import type {ReceiptErrors} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ErrorMessageRow from './ErrorMessageRow';
import HeaderWithBackButton from './HeaderWithBackButton';
import OfflineWithFeedback from './OfflineWithFeedback';
import ScreenWrapper from './ScreenWrapper';
import SelectionList from './SelectionList';
import type RadioListItem from './SelectionList/RadioListItem';
import type TableListItem from './SelectionList/TableListItem';
import type {ListItem, SectionListDataType} from './SelectionList/types';
import type UserListItem from './SelectionList/UserListItem';

type SelectorType<T = string> = ListItem & {
    value: T;

    onPress?: () => void;
};

type SelectionScreenProps<T = string> = {
    /** Used to set the testID for tests */
    displayName: string;

    /** Title of the selection component */
    title: TranslationPaths;

    /** Custom content to display in the header */
    headerContent?: React.ReactNode;

    /** Content to display if the list is empty */
    listEmptyContent?: React.JSX.Element | null;

    /** Custom content to display in the footer of list component. */
    listFooterContent?: React.JSX.Element | null;

    /** Sections for the section list */
    sections: Array<SectionListDataType<SelectorType<T>>>;

    /** Default renderer for every item in the list */
    listItem: typeof RadioListItem | typeof UserListItem | typeof TableListItem;

    /** Item `keyForList` to focus initially */
    initiallyFocusedOptionKey?: string | null | undefined;

    /** Callback to fire when a row is pressed */
    onSelectRow: (selection: SelectorType<T>) => void;

    /** Callback to fire when back button is pressed */
    onBackButtonPress: () => void;

    /** The current policyID */
    policyID: string;

    /** Defines which types of access should be verified */
    accessVariants?: AccessVariant[];

    /** The current feature name that the user tries to get access to */
    featureName?: PolicyFeatureName;

    /** Whether or not to block user from accessing the page */
    shouldBeBlocked?: boolean;

    /** Name of the current connection */
    connectionName: ConnectionName;

    /** The type of action that's pending  */
    pendingAction?: OnyxCommon.PendingAction | null;

    /** The errors to display  */
    errors?: OnyxCommon.Errors | ReceiptErrors | null;

    /** Additional style object for the error row */
    errorRowStyles?: StyleProp<ViewStyle>;

    /** A function to run when the X button next to the error is clicked */
    onClose?: () => void;
};

function SelectionScreen<T = string>({
    displayName,
    title,
    headerContent,
    listEmptyContent,
    listFooterContent,
    sections,
    listItem,
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
}: SelectionScreenProps<T>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policy = PolicyUtils.getPolicy(policyID);
    const isConnectionEmpty = isEmpty(policy?.connections?.[connectionName]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={accessVariants}
            featureName={featureName}
            shouldBeBlocked={isConnectionEmpty || shouldBeBlocked}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={!!errors && !isEmptyObject(errors)}
                testID={displayName}
            >
                <HeaderWithBackButton
                    title={translate(title)}
                    onBackButtonPress={onBackButtonPress}
                />
                {headerContent}
                <OfflineWithFeedback
                    pendingAction={pendingAction}
                    style={[styles.flex1]}
                    contentContainerStyle={[styles.flex1]}
                >
                    <SelectionList
                        onSelectRow={onSelectRow}
                        sections={sections}
                        ListItem={listItem}
                        showScrollIndicator
                        shouldShowTooltips={false}
                        initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                        listEmptyContent={listEmptyContent}
                        listFooterContent={listFooterContent}
                        sectionListStyle={[styles.flexGrow0]}
                    >
                        <ErrorMessageRow
                            errors={errors}
                            errorRowStyles={errorRowStyles}
                            onClose={onClose}
                        />
                    </SelectionList>
                </OfflineWithFeedback>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export type {SelectorType};

SelectionScreen.displayName = 'SelectionScreen';
export default SelectionScreen;
