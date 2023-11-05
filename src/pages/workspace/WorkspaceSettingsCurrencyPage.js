import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import CurrencySelectionList from '@components/CurrencySelectionList';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as Policy from '@userActions/Policy';
import ROUTES from '@src/ROUTES';
import {policyDefaultProps, policyPropTypes} from './withPolicy';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

const propTypes = {
    isLoadingReportData: PropTypes.bool,
    ...policyPropTypes,
};

const defaultProps = {
    isLoadingReportData: true,
    ...policyDefaultProps,
};

function WorkspaceSettingsCurrencyPage({policy, isLoadingReportData}) {
    const {translate} = useLocalize();
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

                <CurrencySelectionList
                    textInputLabel={translate('workspace.editor.currencyInputLabel')}
                    onSelect={onSelectCurrency}
                    initiallySelectedCurrencyCode={policy.outputCurrency}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspaceSettingsCurrencyPage.displayName = 'WorkspaceSettingsCurrencyPage';
WorkspaceSettingsCurrencyPage.propTypes = propTypes;
WorkspaceSettingsCurrencyPage.defaultProps = defaultProps;

export default withPolicyAndFullscreenLoading(WorkspaceSettingsCurrencyPage);
