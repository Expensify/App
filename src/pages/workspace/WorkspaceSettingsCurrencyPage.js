import React, {useState, useMemo, useCallback} from 'react';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import useLocalize from '../../hooks/useLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import SelectionList from '../../components/SelectionList';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import withPolicy, {policyDefaultProps, policyPropTypes} from './withPolicy';
import * as Policy from '../../libs/actions/Policy';

const propTypes = {
    /** Constant, list of available currencies */
    currencyList: PropTypes.objectOf(
        PropTypes.shape({
            /** Symbol of the currency */
            symbol: PropTypes.string,
        }),
    ),
    ...policyPropTypes,
};

const defaultProps = {
    currencyList: {},
    ...policyDefaultProps,
};

function WorkspaceSettingsCurrencyPage({currencyList, policy}) {
    const {translate} = useLocalize();
    const [searchText, setSearchText] = useState('');

    const getDisplayText = useCallback((currencyCode, currencySymbol) => `${currencyCode} - ${currencySymbol}`, []);

    const {sections, initiallyFocusedOptionKey} = useMemo(() => {
        const trimmedText = searchText.trim().toLowerCase();
        const currencyListKeys = _.keys(currencyList);

        const filteredItems = _.filter(currencyListKeys, (currencyCode) => {
            const currency = currencyList[currencyCode];
            return getDisplayText(currencyCode, currency.symbol).toLowerCase().includes(trimmedText);
        });

        let selectedCurrencyCode;

        const currencyItems = _.map(filteredItems, (currencyCode) => {
            const currency = currencyList[currencyCode];
            const isSelected = policy.outputCurrency === currencyCode;

            if (isSelected) {
                selectedCurrencyCode = currencyCode;
            }

            return {
                text: getDisplayText(currencyCode, currency.symbol),
                keyForList: currencyCode,
                isSelected,
            };
        });

        return {
            sections: [{data: currencyItems, indexOffset: 0}],
            initiallyFocusedOptionKey: selectedCurrencyCode,
        };
    }, [getDisplayText, currencyList, policy.outputCurrency, searchText]);

    const headerMessage = Boolean(searchText.trim()) && !sections[0].data.length ? translate('common.noResultsFound') : '';

    const onSelectCurrency = (item) => {
        Policy.updateGeneralSettings(policy.id, policy.name, item.keyForList);
        Navigation.goBack(ROUTES.getWorkspaceSettingsRoute(policy.id));
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={translate('workspace.editor.currencyInputLabel')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.getWorkspaceSettingsRoute(policy.id))}
            />

            <SelectionList
                sections={sections}
                textInputLabel={translate('workspace.editor.currencyInputLabel')}
                textInputValue={searchText}
                onChangeText={setSearchText}
                onSelectRow={onSelectCurrency}
                headerMessage={headerMessage}
                initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                showScrollIndicator
            />
        </ScreenWrapper>
    );
}

WorkspaceSettingsCurrencyPage.propTypes = propTypes;
WorkspaceSettingsCurrencyPage.defaultProps = defaultProps;

export default compose(
    withPolicy,
    withOnyx({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
    }),
)(WorkspaceSettingsCurrencyPage);
