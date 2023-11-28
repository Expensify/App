import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import Text from '@components/Text';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    ...withCurrentUserPersonalDetailsPropTypes,

    /** Indicates whether the app is loading initial data */
    isLoadingApp: PropTypes.bool,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
    isLoadingApp: true,
};

function PronounsPage({currentUserPersonalDetails, isLoadingApp}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentPronouns = lodashGet(currentUserPersonalDetails, 'pronouns', '');
    const currentPronounsKey = currentPronouns.substring(CONST.PRONOUNS.PREFIX.length);
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        if (isLoadingApp && _.isUndefined(currentUserPersonalDetails.pronouns)) {
            return;
        }
        const currentPronounsText = _.chain(CONST.PRONOUNS_LIST)
            .find((_value) => _value === currentPronounsKey)
            .value();

        setSearchValue(currentPronounsText ? translate(`pronouns.${currentPronounsText}`) : '');

        // Only need to update search value when the first time the data is loaded
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoadingApp]);

    const filteredPronounsList = useMemo(() => {
        const pronouns = _.chain(CONST.PRONOUNS_LIST)
            .map((value) => {
                const fullPronounKey = `${CONST.PRONOUNS.PREFIX}${value}`;
                const isCurrentPronouns = fullPronounKey === currentPronouns;

                return {
                    text: translate(`pronouns.${value}`),
                    value: fullPronounKey,
                    keyForList: value,
                    isSelected: isCurrentPronouns,
                };
            })
            .sortBy((pronoun) => pronoun.text.toLowerCase())
            .value();

        const trimmedSearch = searchValue.trim();

        if (trimmedSearch.length === 0) {
            return [];
        }
        return _.filter(pronouns, (pronoun) => pronoun.text.toLowerCase().indexOf(trimmedSearch.toLowerCase()) >= 0);
    }, [searchValue, currentPronouns, translate]);

    const headerMessage = searchValue.trim() && filteredPronounsList.length === 0 ? translate('common.noResultsFound') : '';

    const updatePronouns = (selectedPronouns) => {
        PersonalDetails.updatePronouns(selectedPronouns.keyForList === currentPronounsKey ? '' : lodashGet(selectedPronouns, 'value', ''));
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={PronounsPage.displayName}
        >
            {isLoadingApp && _.isUndefined(currentUserPersonalDetails.pronouns) ? (
                <FullScreenLoadingIndicator />
            ) : (
                <>
                    <HeaderWithBackButton
                        title={translate('pronounsPage.pronouns')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PROFILE)}
                    />
                    <Text style={[styles.ph5, styles.mb3]}>{translate('pronounsPage.isShownOnProfile')}</Text>
                    <SelectionList
                        headerMessage={headerMessage}
                        textInputLabel={translate('pronounsPage.pronouns')}
                        textInputPlaceholder={translate('pronounsPage.placeholderText')}
                        textInputValue={searchValue}
                        sections={[{data: filteredPronounsList, indexOffset: 0}]}
                        onSelectRow={updatePronouns}
                        onChangeText={setSearchValue}
                        initiallyFocusedOptionKey={currentPronounsKey}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

PronounsPage.propTypes = propTypes;
PronounsPage.defaultProps = defaultProps;
PronounsPage.displayName = 'PronounsPage';

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        isLoadingApp: {
            key: ONYXKEYS.IS_LOADING_APP,
        },
    }),
)(PronounsPage);
