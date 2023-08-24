import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {useState, useEffect, useMemo, useCallback} from 'react';
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

function PronounsPage(props) {
    const [initiallyFocusedOption, setInitiallyFocusedOption] = useState({});
    const [searchValue, setSearchValue] = useState('');
    const [pronounsList, setPronounsList] = useState([]);

    /**
     * Loads the pronouns list from the translations and adds the green checkmark icon to the currently selected value.
     *
     * @returns {void}
     */
    const loadPronouns = useCallback(() => {
        const currentPronouns = lodashGet(props.currentUserPersonalDetails, 'pronouns', '');

        const pronouns = _.chain(props.translate('pronouns'))
            .map((value, key) => {
                const fullPronounKey = `${CONST.PRONOUNS.PREFIX}${key}`;
                const isCurrentPronouns = fullPronounKey === currentPronouns;

                if (isCurrentPronouns) {
                    setInitiallyFocusedOption({
                        text: value,
                        keyForList: key,
                    });
                }

                return {
                    text: value,
                    value: fullPronounKey,
                    keyForList: key,
                    isSelected: isCurrentPronouns,
                };
            })
            .sortBy((pronoun) => pronoun.text.toLowerCase())
            .value();

        setPronounsList(pronouns);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.currentUserPersonalDetails.pronouns]);

    const onChangeText = (value = '') => {
        setSearchValue(value);
    };

    /**
     * @param {Object} selectedPronouns
     */
    const updatePronouns = (selectedPronouns) => {
        PersonalDetails.updatePronouns(selectedPronouns.keyForList === initiallyFocusedOption.keyForList ? '' : lodashGet(selectedPronouns, 'value', ''));
    };

    /**
     * Pronouns list filtered by searchValue needed for the OptionsSelector.
     * Empty array if the searchValue is empty.
     */
    const filteredPronounsList = useMemo(() => {
        const searchedValue = searchValue.trim();
        if (searchedValue.length === 0) {
            return [];
        }
        return _.filter(pronounsList, (pronous) => pronous.text.toLowerCase().indexOf(searchedValue.toLowerCase()) >= 0);
    }, [pronounsList, searchValue]);

    const headerMessage = searchValue.trim() && !filteredPronounsList.length ? props.translate('common.noResultsFound') : '';

    useEffect(() => {
        setSearchValue(initiallyFocusedOption.text);
    }, [initiallyFocusedOption]);

    useEffect(() => {
        onChangeText();
        loadPronouns();
    }, [loadPronouns]);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={props.translate('pronounsPage.pronouns')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PROFILE)}
            />
            <Text style={[styles.ph5, styles.mb3]}>{props.translate('pronounsPage.isShownOnProfile')}</Text>
            <SelectionList
                headerMessage={headerMessage}
                textInputLabel={props.translate('pronounsPage.pronouns')}
                textInputPlaceholder={props.translate('pronounsPage.placeholderText')}
                textInputValue={searchValue}
                sections={[{data: filteredPronounsList, indexOffset: 0}]}
                onSelectRow={updatePronouns}
                onChangeText={onChangeText}
                initiallyFocusedOptionKey={initiallyFocusedOption.keyForList}
            />
        </ScreenWrapper>
    );
}

PronounsPage.propTypes = propTypes;
PronounsPage.defaultProps = defaultProps;
PronounsPage.displayName = 'PronounsPage';

export default compose(withLocalize, withCurrentUserPersonalDetails)(PronounsPage);
