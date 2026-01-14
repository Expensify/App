import React, {useEffect, useMemo, useRef, useState} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {updatePronouns as updatePronounsPersonalDetails} from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type PronounEntry = ListItem & {
    value: string;
};

type PronounsPageProps = WithCurrentUserPersonalDetailsProps;

function PronounsPage({currentUserPersonalDetails}: PronounsPageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const currentPronouns = currentUserPersonalDetails?.pronouns ?? '';
    const currentPronounsKey = currentPronouns.substring(CONST.PRONOUNS.PREFIX.length);
    const [searchValue, setSearchValue] = useState('');
    const isOptionSelected = useRef(false);
    const currentUserAccountID = currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID;

    useEffect(() => {
        if (isLoadingApp && !currentUserPersonalDetails.pronouns) {
            return;
        }
        const currentPronounsText = CONST.PRONOUNS_LIST.find((value) => value === currentPronounsKey);

        setSearchValue(currentPronounsText ? translate(`pronouns.${currentPronounsText}`) : '');

        // Only need to update search value when the first time the data is loaded
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        }).sort((a, b) => localeCompare(a.text.toLowerCase(), b.text.toLowerCase()));

        const trimmedSearch = searchValue.trim();

        if (trimmedSearch.length === 0) {
            return [];
        }
        return pronouns.filter((pronoun) => pronoun.text.toLowerCase().indexOf(trimmedSearch.toLowerCase()) >= 0);
    }, [searchValue, currentPronouns, translate, localeCompare]);

    const updatePronouns = (selectedPronouns: PronounEntry) => {
        if (isOptionSelected.current) {
            return;
        }
        isOptionSelected.current = true;
        updatePronounsPersonalDetails(selectedPronouns.keyForList === currentPronounsKey ? '' : (selectedPronouns?.value ?? ''), currentUserAccountID);
        Navigation.goBack();
    };

    const textInputOptions = useMemo(
        () => ({
            label: translate('pronounsPage.pronouns'),
            value: searchValue,
            onChangeText: setSearchValue,
            placeholder: translate('pronounsPage.placeholderText'),
            headerMessage: searchValue.trim() && filteredPronounsList?.length === 0 ? translate('common.noResultsFound') : '',
        }),
        [translate, searchValue, filteredPronounsList?.length],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="PronounsPage"
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
                        data={filteredPronounsList}
                        ListItem={RadioListItem}
                        onSelectRow={updatePronouns}
                        textInputOptions={textInputOptions}
                        initiallyFocusedItemKey={currentPronounsKey}
                        shouldSingleExecuteRowSelect
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

export default withCurrentUserPersonalDetails(PronounsPage);
