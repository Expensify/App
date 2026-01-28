import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import WidgetContainer from '@components/WidgetContainer';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {accountIDSelector} from '@src/selectors/Session';

/**
 * This is a placeholder component for the For You section.
 * The actual implementation will be added in upcoming PRs.
 */
function ForYouSection() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: accountIDSelector});

    const handleGoToSearch = () => {
        Navigation.navigate(
            ROUTES.SEARCH_ROOT.getRoute({
                query: buildQueryStringFromFilterFormValues({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    action: CONST.SEARCH.ACTION_FILTERS.SUBMIT,
                    from: [`${accountID}`],
                }),
            }),
        );
    };

    const handleGoToApproveSearch = () => {
        Navigation.navigate(
            ROUTES.SEARCH_ROOT.getRoute({
                query: buildQueryStringFromFilterFormValues({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    action: CONST.SEARCH.ACTION_FILTERS.APPROVE,
                    to: [`${accountID}`],
                }),
            }),
        );
    };

    const handleGoToPaySearch = () => {
        Navigation.navigate(
            ROUTES.SEARCH_ROOT.getRoute({
                query: buildQueryStringFromFilterFormValues({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    action: CONST.SEARCH.ACTION_FILTERS.PAY,
                    reimbursable: CONST.SEARCH.BOOLEAN.YES,
                    payer: accountID?.toString(),
                }),
            }),
        );
    };

    const handleGoToExportSearch = () => {
        Navigation.navigate(
            ROUTES.SEARCH_ROOT.getRoute({
                query: buildQueryStringFromFilterFormValues({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    action: CONST.SEARCH.ACTION_FILTERS.EXPORT,
                    exporter: [`${accountID}`],
                    exportedOn: CONST.SEARCH.DATE_PRESETS.NEVER,
                }),
            }),
        );
    };

    return (
        <WidgetContainer title={translate('homePage.forYou')}>
            <View style={[styles.flexColumn, styles.gap3]}>
                <Button
                    text="Go to submitted expense reports"
                    onPress={handleGoToSearch}
                />
                <Button
                    text="Go to expense reports to approve"
                    onPress={handleGoToApproveSearch}
                />
                <Button
                    text="Go to expense reports to pay"
                    onPress={handleGoToPaySearch}
                />
                <Button
                    text="Go to expense reports to export"
                    onPress={handleGoToExportSearch}
                />
            </View>
        </WidgetContainer>
    );
}

export default ForYouSection;
