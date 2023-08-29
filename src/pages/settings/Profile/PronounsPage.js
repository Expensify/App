import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {useState, useMemo} from 'react';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import compose from '../../../libs/compose';
import CONST from '../../../CONST';
import ROUTES from '../../../ROUTES';
import Navigation from '../../../libs/Navigation/Navigation';
import SelectionList from '../../../components/SelectionList';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function PronounsPage({currentUserPersonalDetails, translate}) {
    const currentPronouns = lodashGet(currentUserPersonalDetails, 'pronouns', '');
    const currentPronounsKey = currentPronouns.substring(CONST.PRONOUNS.PREFIX.length);
    const currentPronounsText = _.chain(translate('pronouns'))
        .find((_value, key) => key === currentPronounsKey)
        .value();

    const [searchValue, setSearchValue] = useState(currentPronounsText || '');

    const filteredPronounsList = useMemo(() => {
        const pronouns = _.chain(translate('pronouns'))
            .map((value, key) => {
                const fullPronounKey = `${CONST.PRONOUNS.PREFIX}${key}`;
                const isCurrentPronouns = fullPronounKey === currentPronouns;

                return {
                    text: value,
                    value: fullPronounKey,
                    keyForList: key,
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

    const headerMessage = searchValue.trim() && !filteredPronounsList.length ? translate('common.noResultsFound') : '';

    const updatePronouns = (selectedPronouns) => {
        PersonalDetails.updatePronouns(selectedPronouns.keyForList === currentPronouns.keyForList ? '' : lodashGet(selectedPronouns, 'value', ''));
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
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
                shouldDelayFocus
            />
        </ScreenWrapper>
    );
}

PronounsPage.propTypes = propTypes;
PronounsPage.defaultProps = defaultProps;
PronounsPage.displayName = 'PronounsPage';

export default compose(withLocalize, withCurrentUserPersonalDetails)(PronounsPage);
