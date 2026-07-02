import React, {useEffect} from 'react';
import {View} from 'react-native';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftValues} from '@libs/actions/FormActions';
import {searchInServer} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessage, getUserToInviteOption} from '@libs/PersonalDetailOptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkspaceConfirmationForm';
import type {Participant} from '@src/types/onyx/IOU';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type WorkspaceConfirmationOwnerSelectorPageContentProps = {
    /** The currently selected workspace owner login (from the draft, falling back to the current user) */
    currentOwner: string;
};

function WorkspaceConfirmationOwnerSelectorPageContent({currentOwner}: WorkspaceConfirmationOwnerSelectorPageContentProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.OWNER_SELECTOR.path);

    const ownerPersonalDetails = getPersonalDetailByEmail(currentOwner);

    // When the current owner isn't in the personal details list (e.g. an external email), build an optimistic option to seed the selection
    const ownerExtraOption =
        !currentOwner || ownerPersonalDetails ? undefined : (getUserToInviteOption({searchValue: currentOwner, countryCode, formatPhoneNumber, loginList: {}}) ?? undefined);

    const ownerAccountID = ownerPersonalDetails?.accountID ?? ownerExtraOption?.accountID;
    const initialSelected = new Set(ownerAccountID ? [String(ownerAccountID)] : []);
    const initialExtraOptions = ownerExtraOption ? [{...ownerExtraOption, isSelected: true}] : [];

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, areOptionsInitialized} = usePersonalDetailSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        includeRecentReports: true,
        includeUserToInvite: true,
        initialSelected,
        initialExtraOptions,
    });

    const sections = (() => {
        const sectionsList = [];

        // Current owner (always pinned at the top) — sourced from the hook's selected option
        if (availableOptions.selectedOptions.length > 0) {
            sectionsList.push({
                data: availableOptions.selectedOptions,
                sectionIndex: 0,
            });
        }

        // "Switch back to me" quick-pick — only when the current user isn't already the owner
        if (availableOptions.currentUserOption) {
            sectionsList.push({
                data: [availableOptions.currentUserOption],
                sectionIndex: 1,
            });
        }

        if (availableOptions.recentOptions.length > 0) {
            sectionsList.push({
                title: translate('common.recents'),
                data: availableOptions.recentOptions,
                sectionIndex: 2,
            });
        }

        if (availableOptions.personalDetails.length > 0) {
            sectionsList.push({
                title: translate('common.contacts'),
                data: availableOptions.personalDetails,
                sectionIndex: 3,
            });
        }

        if (availableOptions.userToInvite) {
            sectionsList.push({
                data: [availableOptions.userToInvite],
                sectionIndex: 4,
            });
        }

        return sectionsList;
    })();

    const onSelectRow = (option: Participant) => {
        // Clear search to prevent "No results found" after selection
        setSearchTerm('');

        setDraftValues(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM, {
            [INPUT_IDS.OWNER]: option?.login,
        });

        // Navigate back to the confirmation form
        Navigation.goBack(backPath);
    };

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const searchValue = debouncedSearchTerm.trim().toLowerCase();
    const headerMessage = (() => {
        if (sections.length > 0) {
            return '';
        }
        return getHeaderMessage(translate, searchValue, countryCode);
    })();

    const textInputOptions = {
        onChangeText: setSearchTerm,
        value: searchTerm,
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        headerMessage,
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="WorkspaceConfirmationOwnerSelectorPage"
        >
            <HeaderWithBackButton
                title={translate('workspace.common.workspaceOwner')}
                onBackButtonPress={() => Navigation.goBack(backPath)}
            />
            <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                <SelectionListWithSections
                    sections={areOptionsInitialized ? sections : []}
                    ListItem={UserListItem}
                    onSelectRow={onSelectRow}
                    shouldShowTextInput
                    textInputOptions={textInputOptions}
                    shouldShowLoadingPlaceholder={!areOptionsInitialized}
                    isLoadingNewOptions={!!isSearchingForReports}
                    shouldSingleExecuteRowSelect
                />
            </View>
        </ScreenWrapper>
    );
}

function WorkspaceConfirmationOwnerSelectorPage() {
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM_DRAFT);

    // Wait for the draft to load so the initial owner selection is seeded correctly on mount
    if (isLoadingOnyxValue(draftValuesMetadata)) {
        return <FullscreenLoadingIndicator reasonAttributes={{context: 'WorkspaceConfirmationOwnerSelectorPage', isLoadingDraftValues: true}} />;
    }

    return <WorkspaceConfirmationOwnerSelectorPageContent currentOwner={draftValues?.owner ?? currentUserLogin ?? ''} />;
}

export default WorkspaceConfirmationOwnerSelectorPage;
