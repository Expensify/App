import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {useState, useMemo} from 'react';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import CONST from '../../../CONST';
import ROUTES from '../../../ROUTES';
import Navigation from '../../../libs/Navigation/Navigation';
import SelectionList from '../../../components/SelectionList';
import useLocalize from '../../../hooks/useLocalize';

const propTypes = {
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function PronounsPage({currentUserPersonalDetails}) {
    const {translate} = useLocalize();
    const currentPronouns = lodashGet(currentUserPersonalDetails, 'pronouns', '');
    const currentPronounsKey = currentPronouns.substring(CONST.PRONOUNS.PREFIX.length);

    const [searchValue, setSearchValue] = useState(() => {
        const currentPronounsText = _.chain(CONST.PRONOUNS_LIST)
            .find((_value) => _value === currentPronounsKey)
            .value();

        return currentPronounsText ? translate(`pronouns.${currentPronounsText}`) : '';
    });

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
        </ScreenWrapper>
    );
}

PronounsPage.propTypes = propTypes;
PronounsPage.defaultProps = defaultProps;
PronounsPage.displayName = 'PronounsPage';

export default withCurrentUserPersonalDetails(PronounsPage);
