import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import CurrencySelectionList from '@components/CurrencySelectionList';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import ROUTES from '@src/ROUTES';
import {policyDefaultProps, policyPropTypes} from './withPolicy';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

const propTypes = {
    isLoadingReportData: PropTypes.bool,
    ...policyPropTypes,
};

const defaultProps = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** Focused currency code */
            currency: PropTypes.string,

            /** ID of a policy */
            policyID: PropTypes.string,
        }),
    }).isRequired,
    isLoadingReportData: true,
    ...policyDefaultProps,
};

function WorkspaceSettingsCurrencyPage({route, policy, isLoadingReportData}) {
    const {translate} = useLocalize();
    const currencyParam = lodashGet(route, 'params.currency', '').toUpperCase();
    const selectedCurrencyCode = CurrencyUtils.isValidCurrencyCode(currencyParam) ? currencyParam : policy.outputCurrency;
    const onBackButtonPress = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_SETTINGS.getRoute(policy.id, selectedCurrencyCode)), [policy.id, selectedCurrencyCode]);

    const onSelectCurrency = (item) => {
        Navigation.navigate(ROUTES.WORKSPACE_SETTINGS.getRoute(policy.id, item.currencyCode));
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

                <CurrencySelectionList
                    textInputLabel={translate('workspace.editor.currencyInputLabel')}
                    onSelect={onSelectCurrency}
                    initiallySelectedCurrencyCode={selectedCurrencyCode}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspaceSettingsCurrencyPage.displayName = 'WorkspaceSettingsCurrencyPage';
WorkspaceSettingsCurrencyPage.propTypes = propTypes;
WorkspaceSettingsCurrencyPage.defaultProps = defaultProps;

export default withPolicyAndFullscreenLoading(WorkspaceSettingsCurrencyPage);
