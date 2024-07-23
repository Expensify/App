import React, {useEffect, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type PronounEntry = ListItem & {
    value: string;
};

type PronounsPageOnyxProps = {
    isLoadingApp: OnyxEntry<boolean>;
};
type PronounsPageProps = PronounsPageOnyxProps & WithCurrentUserPersonalDetailsProps;

function PronounsPage({currentUserPersonalDetails, isLoadingApp = true}: PronounsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentPronouns = currentUserPersonalDetails?.pronouns ?? '';
    const currentPronounsKey = currentPronouns.substring(CONST.PRONOUNS.PREFIX.length);
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        if (isLoadingApp && !currentUserPersonalDetails.pronouns) {
            return;
        }
        const currentPronounsText = CONST.PRONOUNS_LIST.find((value) => value === currentPronounsKey);

        setSearchValue(currentPronounsText ? translate(`pronouns.${currentPronounsText}`) : '');

        // Only need to update search value when the first time the data is loaded
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isLoadingApp]);

    const filteredPronounsList = useMemo((): PronounEntry[] => {
        const pronouns = CONST.PRONOUNS_LIST.map((value) => {
            const fullPronounKey = `${CONST.PRONOUNS.PREFIX}${value}`;
            const isCurrentPronouns = fullPronounKey === currentPronouns;

            return {
                text: translate(`pronouns.${value}`),
                value: fullPronounKey,
                keyForList: value,
                isSelected: isCurrentPronouns,
            };
        }).sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));

        const trimmedSearch = searchValue.trim();

        if (trimmedSearch.length === 0) {
            return [];
        }
        return pronouns.filter((pronoun) => pronoun.text.toLowerCase().indexOf(trimmedSearch.toLowerCase()) >= 0);
    }, [searchValue, currentPronouns, translate]);

    const headerMessage = searchValue.trim() && filteredPronounsList?.length === 0 ? translate('common.noResultsFound') : '';

    const updatePronouns = (selectedPronouns: PronounEntry) => {
        PersonalDetails.updatePronouns(selectedPronouns.keyForList === currentPronounsKey ? '' : selectedPronouns?.value ?? '');
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={PronounsPage.displayName}
        >
            {isLoadingApp && !currentUserPersonalDetails.pronouns ? (
                <FullScreenLoadingIndicator />
            ) : (
                <>
                    <HeaderWithBackButton
                        title={translate('pronounsPage.pronouns')}
                        onBackButtonPress={() => Navigation.goBack()}
                    />
                    <Text style={[styles.ph5, styles.mb3]}>{translate('pronounsPage.isShownOnProfile')}</Text>
                    <SelectionList
                        headerMessage={headerMessage}
                        textInputLabel={translate('pronounsPage.pronouns')}
                        textInputPlaceholder={translate('pronounsPage.placeholderText')}
                        textInputValue={searchValue}
                        sections={[{data: filteredPronounsList}]}
                        ListItem={RadioListItem}
                        onSelectRow={updatePronouns}
                        shouldDebounceRowSelect
                        onChangeText={setSearchValue}
                        initiallyFocusedOptionKey={currentPronounsKey}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

PronounsPage.displayName = 'PronounsPage';

export default withCurrentUserPersonalDetails(
    withOnyx<PronounsPageProps, PronounsPageOnyxProps>({
        isLoadingApp: {
            key: ONYXKEYS.IS_LOADING_APP,
        },
    })(PronounsPage),
);
