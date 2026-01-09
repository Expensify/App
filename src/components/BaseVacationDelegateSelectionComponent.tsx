import React, { useEffect } from 'react';
import { View } from 'react-native';
import type { OnyxEntry } from 'react-native-onyx';
import { useMemoizedLazyExpensifyIcons } from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import { formatPhoneNumber } from '@libs/LocalePhoneNumber';
import { getHeaderMessage } from '@libs/OptionsListUtils';
import { getPersonalDetailByEmail } from '@libs/PersonalDetailsUtils';
import { searchInServer } from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type VacationDelegate from '@src/types/onyx/VacationDelegate';
import HeaderWithBackButton from './HeaderWithBackButton';
import ScreenWrapper from './ScreenWrapper';
// eslint-disable-next-line no-restricted-imports
import SelectionList from './SelectionListWithSections';
import UserListItem from './SelectionListWithSections/UserListItem';


type BaseVacationDelegateSelectionComponentProps = {
    vacationDelegate: OnyxEntry<VacationDelegate>;
};

function BaseVacationDelegateSelectionComponent({vacationDelegate}: BaseVacationDelegateSelectionComponentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: false});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const delegatePersonalDetails = getPersonalDetailByEmail(vacationDelegate?.delegate ?? '');

    const excludeLogins = {
        ...CONST.EXPENSIFY_EMAILS_OBJECT,
        ...(vacationDelegate?.delegate && {[vacationDelegate.delegate]: true}),
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

    const sectionsList = [];
    if (vacationDelegate && delegatePersonalDetails) {
        sectionsList.push({
            title: undefined,
            data: [
                {
                    ...delegatePersonalDetails,
                    text: delegatePersonalDetails?.displayName ?? vacationDelegate.delegate,
                    alternateText: delegatePersonalDetails?.login ?? vacationDelegate.delegate,
                    login: delegatePersonalDetails.login ?? vacationDelegate.delegate,
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
        shouldShow: availableOptions.recentReports?.length > 0,
    });

    sectionsList.push({
        title: translate('common.contacts'),
        data: availableOptions.personalDetails,
        shouldShow: availableOptions.personalDetails?.length > 0,
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
        data: section.data.map((option) => ({
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

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    return (
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID={BaseVacationDelegateSelectionComponent.displayName}
            >
                <HeaderWithBackButton title={translate('domain.common.vacationDelegate')} />

                <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                    <SelectionList
                        sections={areOptionsInitialized ? sections : []}
                        ListItem={UserListItem}
                        onSelectRow={() => {}}
                        shouldSingleExecuteRowSelect
                        onChangeText={setSearchTerm}
                        textInputValue={searchTerm}
                        headerMessage={getHeaderMessage(
                            (availableOptions.recentReports?.length || 0) + (availableOptions.personalDetails?.length || 0) !== 0,
                            !!availableOptions.userToInvite,
                            debouncedSearchTerm.trim(),
                            countryCode,
                            false,
                        )}
                        textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                        showLoadingPlaceholder={!areOptionsInitialized}
                        isLoadingNewOptions={!!isSearchingForReports}
                        onEndReached={onListEndReached}
                    />
                </View>
            </ScreenWrapper>
    );
}

BaseVacationDelegateSelectionComponent.displayName = 'BaseVacationDelegateSelectionComponent';

export default BaseVacationDelegateSelectionComponent;
