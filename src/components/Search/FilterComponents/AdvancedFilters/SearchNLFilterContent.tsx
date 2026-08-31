/**
 * Renders the natural-language ("Describe your search") input that parses a plain-English
 * query into a structured search URL and navigates the user to the results.
 */
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {parseExpenseFilters} from '@libs/actions/Search';
import {getFilterFromQuery} from '@libs/SearchQueryUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

type SearchNLFilterContentProps = {
    /** Called with the destination route once the query is successfully parsed */
    onSuccess: (route: Route) => void;

    /** Optional style override for the input container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Optional style override for the submit button container */
    buttonContainerStyle?: StyleProp<ViewStyle>;
};

function SearchNLFilterContent({onSuccess, containerStyle, buttonContainerStyle}: SearchNLFilterContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [nlQuery, setNlQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const {currentSearchQueryJSON} = useSearchQueryContext();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);

    const handleSubmit = () => {
        const trimmedQuery = nlQuery.trim();
        if (!trimmedQuery) {
            return;
        }
        setIsLoading(true);
        setErrorMessage('');
        const queryPolicyID = getFilterFromQuery(currentSearchQueryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID).value?.at(0);
        const policyID = queryPolicyID ?? activePolicyID;
        parseExpenseFilters(trimmedQuery, policyID)
            .then((result) => {
                setIsLoading(false);
                if (!result) {
                    return;
                }
                if (result.success) {
                    const searchQuery = new URL(result.searchURL).searchParams.get('q') ?? '';
                    onSuccess(ROUTES.SEARCH_ROOT.getRoute({query: searchQuery}));
                } else {
                    setErrorMessage(result.message);
                }
            })
            .catch(() => {
                setIsLoading(false);
                setErrorMessage(translate('common.genericErrorMessage'));
            });
    };

    return (
        <View style={[styles.flex1]}>
            <View style={[styles.ph5, styles.pt4, containerStyle]}>
                <Text style={styles.mb5}>{translate('search.filters.describeSearch.description')}</Text>
                <TextInput
                    label={translate('search.filters.describeSearch.inputLabel')}
                    accessibilityLabel={translate('search.filters.describeSearch.inputLabel')}
                    role={CONST.ROLE.PRESENTATION}
                    value={nlQuery}
                    onChangeText={setNlQuery}
                    autoFocus
                    autoGrowHeight
                    maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                />
            </View>
            <FormAlertWithSubmitButton
                buttonText={translate('search.filters.describeSearch.buttonText')}
                containerStyles={buttonContainerStyle ?? [styles.mtAuto, styles.m4, styles.mb5]}
                isLoading={isLoading}
                isAlertVisible={!!errorMessage}
                message={errorMessage}
                onSubmit={handleSubmit}
                isDisabled={!nlQuery.trim() || isLoading}
            />
        </View>
    );
}

export default SearchNLFilterContent;
