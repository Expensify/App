import React, {useEffect} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftRule} from '@libs/actions/User';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import AddRule from './AddRule';

type EditRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT>;

function EditRulePage({route}: EditRulePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    useEffect(() => () => clearDraftRule(), []);

    return (
        <ScreenWrapper
            testID="EditRulePage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('expenseRulesPage.editRule.title')} />
            <AddRule hash={route.params.hash} />
        </ScreenWrapper>
    );
}

export default EditRulePage;
