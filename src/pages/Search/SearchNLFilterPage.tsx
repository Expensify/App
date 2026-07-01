import React, {useState} from 'react';
import {View} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {parseExpenseFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchNLFilterPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
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
        const queryPolicyID = Array.isArray(currentSearchQueryJSON?.policyID) ? currentSearchQueryJSON.policyID.at(0) : currentSearchQueryJSON?.policyID;
        const policyID = queryPolicyID ?? activePolicyID;
        parseExpenseFilters(trimmedQuery, policyID).then((result) => {
            setIsLoading(false);
            if (!result) {
                return;
            }
            if (result.success) {
                const searchQuery = new URL(result.searchURL).searchParams.get('q') ?? '';
                const route = ROUTES.SEARCH_ROOT.getRoute({query: searchQuery});
                Navigation.dismissModal({afterTransition: () => Navigation.navigate(route)});
            } else {
                setErrorMessage(result.message);
            }
        });
    };

    return (
        <ScreenWrapper
            testID="SearchNLFilterPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.filters.describeSearch.title')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS)}
            />
            <View style={[styles.flex1, styles.ph5]}>
                <Text style={styles.mb5}>{translate('search.filters.describeSearch.description')}</Text>
                <TextInput
                    label={translate('search.filters.describeSearch.inputLabel')}
                    accessibilityLabel={translate('search.filters.describeSearch.inputLabel')}
                    role={CONST.ROLE.PRESENTATION}
                    value={nlQuery}
                    onChangeText={setNlQuery}
                    ref={inputCallbackRef}
                />
            </View>
            <FormAlertWithSubmitButton
                buttonText={translate('search.filters.describeSearch.buttonText')}
                containerStyles={[styles.m4, styles.mb5]}
                isLoading={isLoading}
                isAlertVisible={!!errorMessage}
                message={errorMessage}
                onSubmit={handleSubmit}
                isDisabled={!nlQuery.trim() || isLoading}
            />
        </ScreenWrapper>
    );
}

export default SearchNLFilterPage;
