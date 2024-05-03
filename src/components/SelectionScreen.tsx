import React from 'react';
import useLocalize from '@hooks/useLocalize';
import type {PolicyAccessVariant} from '@pages/workspace/AccessOrNotFoundWrapper';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {TranslationPaths} from '@src/languages/types';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import HeaderWithBackButton from './HeaderWithBackButton';
import ScreenWrapper from './ScreenWrapper';
import SelectionList from './SelectionList';
import type RadioListItem from './SelectionList/RadioListItem';
import type TableListItem from './SelectionList/TableListItem';
import type {ListItem, SectionListDataType} from './SelectionList/types';
import type UserListItem from './SelectionList/UserListItem';

type SelectorType = ListItem & {
    value: string;
};

type SelectionScreenProps = {
    /** Used to set the testID for tests */
    displayName: string;
    /** Title of the selection component */
    title: TranslationPaths;
    /** Custom content to display in the header */
    headerContent?: React.ReactNode;
    /** Sections for the section list */
    sections: Array<SectionListDataType<SelectorType>>;
    /** Default renderer for every item in the list */
    listItem: typeof RadioListItem | typeof UserListItem | typeof TableListItem;
    /** Item `keyForList` to focus initially */
    initiallyFocusedOptionKey?: string | null | undefined;
    /** Callback to fire when a row is pressed */
    onSelectRow: (selection: SelectorType) => void;
    /** Callback to fire when back button is pressed */
    onBackButtonPress: () => void;
    /** The current policyID */
    policyID: string;
    /** Defines which types of access should be verified */
    accessVariants?: PolicyAccessVariant[];
    /** The current feature name that the user tries to get access to */
    featureName?: PolicyFeatureName;
};

function SelectionScreen({
    displayName,
    title,
    headerContent,
    sections,
    listItem,
    initiallyFocusedOptionKey,
    onSelectRow,
    onBackButtonPress,
    policyID,
    accessVariants,
    featureName,
}: SelectionScreenProps) {
    const {translate} = useLocalize();
    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={accessVariants}
            featureName={featureName}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={displayName}
            >
                <HeaderWithBackButton
                    title={translate(title)}
                    onBackButtonPress={onBackButtonPress}
                />
                <SelectionList
                    onSelectRow={onSelectRow}
                    headerContent={headerContent}
                    sections={sections}
                    ListItem={listItem}
                    showScrollIndicator
                    shouldShowTooltips={false}
                    initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export type {SelectorType};

SelectionScreen.displayName = 'SelectionScreen';
export default SelectionScreen;
