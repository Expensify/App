import React, {useState, useCallback} from 'react';
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
import {policyDefaultProps, policyPropTypes} from './withPolicy';
import * as Policy from '../../libs/actions/Policy';
import * as PolicyUtils from '../../libs/PolicyUtils';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

const propTypes = {
    /** Constant, list of available currencies */
    currencyList: PropTypes.objectOf(
        PropTypes.shape({
            /** Symbol of the currency */
            symbol: PropTypes.string.isRequired,
        }),
    ),
    isLoadingReportData: PropTypes.bool,
    ...policyPropTypes,
};

const defaultProps = {
    currencyList: {},
    isLoadingReportData: true,
    ...policyDefaultProps,
};

const getDisplayText = (currencyCode, currencySymbol) => `${currencyCode} - ${currencySymbol}`;

function WorkspaceSettingsCurrencyPage({currencyList, policy, isLoadingReportData}) {
    const {translate} = useLocalize();
    const [searchText, setSearchText] = useState('');
    const trimmedText = searchText.trim().toLowerCase();
    const currencyListKeys = _.keys(currencyList);

    const filteredItems = _.filter(currencyListKeys, (currencyCode) => {
        const currency = currencyList[currencyCode];
        return getDisplayText(currencyCode, currency.symbol).toLowerCase().includes(trimmedText);
    });

    let initiallyFocusedOptionKey;

    const currencyItems = _.map(filteredItems, (currencyCode) => {
        const currency = currencyList[currencyCode];
        const isSelected = policy.outputCurrency === currencyCode;

        if (isSelected) {
            initiallyFocusedOptionKey = currencyCode;
        }

        return {
            text: getDisplayText(currencyCode, currency.symbol),
            keyForList: currencyCode,
            isSelected,
        };
    });

    const sections = [{data: currencyItems, indexOffset: 0}];

    const headerMessage = searchText.trim() && !currencyItems.length ? translate('common.noResultsFound') : '';

    const onBackButtonPress = useCallback(() => Navigation.goBack(ROUTES.WORKSPACE_SETTINGS.getRoute(policy.id)), [policy.id]);

    const onSelectCurrency = (item) => {
        Policy.updateGeneralSettings(policy.id, policy.name, item.keyForList);
        Navigation.goBack(ROUTES.WORKSPACE_SETTINGS.getRoute(policy.id));
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={WorkspaceSettingsCurrencyPage.displayName}
        >
            <FullPageNotFoundView
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                shouldShow={(_.isEmpty(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy)}
                subtitleKey={_.isEmpty(policy) ? undefined : 'workspace.common.notAuthorized'}
            >
                <HeaderWithBackButton
                    title={translate('workspace.editor.currencyInputLabel')}
                    onBackButtonPress={onBackButtonPress}
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
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspaceSettingsCurrencyPage.displayName = 'WorkspaceSettingsCurrencyPage';
WorkspaceSettingsCurrencyPage.propTypes = propTypes;
WorkspaceSettingsCurrencyPage.defaultProps = defaultProps;

export default compose(
    withPolicyAndFullscreenLoading,
    withOnyx({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
    }),
)(WorkspaceSettingsCurrencyPage);
