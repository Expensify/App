import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Participant} from '@src/types/onyx/IOU';
import HeaderWithBackButton from './HeaderWithBackButton';
// eslint-disable-next-line no-restricted-imports
import SelectionList from './SelectionListWithSections';
import UserListItem from './SelectionListWithSections/UserListItem';

type BaseVacationDelegateSelectionComponentProps = {
    /** Current vacation delegate login */
    currentVacationDelegate?: string;

    /** Callback when a row is selected */
    onSelectRow: (option: Participant) => void;

    /** Title for the header */
    headerTitle: string;

    /** Function to call when back button is pressed */
    onBackButtonPress?: () => void;
};

function BaseVacationDelegateSelectionComponent({currentVacationDelegate, onSelectRow, headerTitle, onBackButtonPress}: BaseVacationDelegateSelectionComponentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: false});

    const delegatePersonalDetails = getPersonalDetailByEmail(currentVacationDelegate ?? '');

    const excludeLogins = {
        ...CONST.EXPENSIFY_EMAILS_OBJECT,
        ...(currentVacationDelegate && {[currentVacationDelegate]: true}),
    };

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, areOptionsInitialized, onListEndReached} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
        excludeLogins,
        includeRecentReports: true,
        getValidOptionsConfig: {
            excludeLogins,
        },
    });

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const sectionsList = [];

    if (currentVacationDelegate && delegatePersonalDetails) {
        sectionsList.push({
            title: undefined,
            data: [
                {
                    ...delegatePersonalDetails,
                    text: delegatePersonalDetails?.displayName ?? currentVacationDelegate,
                    alternateText: delegatePersonalDetails?.login ?? currentVacationDelegate,
                    login: delegatePersonalDetails.login ?? currentVacationDelegate,
                    keyForList: `vacationDelegate-${delegatePersonalDetails.login}`,
                    isDisabled: false,
                    isSelected: true,
                    shouldShowSubscript: undefined,
                    icons: [
                        {
                            source: delegatePersonalDetails?.avatar ?? icons.FallbackAvatar,
                            name: formatPhoneNumber(delegatePersonalDetails?.login ?? ''),
                            type: CONST.ICON_TYPE_AVATAR,
                            id: delegatePersonalDetails?.accountID,
                        },
                    ],
                },
            ],
            shouldShow: true,
        });
    }

    sectionsList.push({
        title: translate('common.recents'),
        data: availableOptions.recentReports,
        shouldShow: (availableOptions.recentReports?.length ?? 0) > 0,
    });
    sectionsList.push({
        title: translate('common.contacts'),
        data: availableOptions.personalDetails,
        shouldShow: (availableOptions.personalDetails?.length ?? 0) > 0,
    });

    if (availableOptions.userToInvite) {
        sectionsList.push({
            title: undefined,
            data: [availableOptions.userToInvite],
            shouldShow: true,
        });
    }

    const sections = sectionsList.map((section) => ({
        ...section,
        data: (section.data ?? []).map((option) => ({
            ...option,
            text: option.text ?? option.displayName ?? '',
            alternateText: option.alternateText ?? option.login ?? undefined,
            keyForList: option.keyForList ?? '',
            isDisabled: option.isDisabled ?? undefined,
            isSelected: option.isSelected ?? undefined,
            login: option.login ?? undefined,
            shouldShowSubscript: option.shouldShowSubscript ?? undefined,
        })),
    }));

    const headerMessage = getHeaderMessage(
        (availableOptions.recentReports?.length || 0) + (availableOptions.personalDetails?.length || 0) !== 0,
        !!availableOptions.userToInvite,
        debouncedSearchTerm.trim(),
        countryCode,
        false,
    );

    return (
        <>
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={onBackButtonPress}
            />
            <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                <SelectionList
                    sections={areOptionsInitialized ? sections : []}
                    ListItem={UserListItem}
                    onSelectRow={onSelectRow}
                    shouldSingleExecuteRowSelect
                    onChangeText={setSearchTerm}
                    textInputValue={searchTerm}
                    headerMessage={headerMessage}
                    textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                    showLoadingPlaceholder={!areOptionsInitialized}
                    isLoadingNewOptions={!!isSearchingForReports}
                    onEndReached={onListEndReached}
                />
            </View>
        </>
    );
}

export default BaseVacationDelegateSelectionComponent;
