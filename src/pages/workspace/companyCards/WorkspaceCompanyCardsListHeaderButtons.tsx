import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

type WorkspaceCompanyCardsListHeaderButtonsProps = {
    policyID: string;
};

function WorkspaceCompanyCardsListHeaderButtons({policyID}: WorkspaceCompanyCardsListHeaderButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <View style={[styles.ph5, styles.pv5]}>
            <View style={[styles.w100, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
                <Button
                    medium
                    success
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID))}
                    icon={Expensicons.Plus}
                    text={translate('workspace.expensifyCard.issueCard')}
                    style={shouldUseNarrowLayout && styles.flex1}
                />
                <Button
                    medium
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS.getRoute(policyID))}
                    icon={Expensicons.Gear}
                    text={translate('common.settings')}
                    style={shouldUseNarrowLayout && styles.flex1}
                />
            </View>
        </View>
    );
}

WorkspaceCompanyCardsListHeaderButtons.displayName = 'WorkspaceCompanyCardsListHeaderButtons';

export default WorkspaceCompanyCardsListHeaderButtons;
