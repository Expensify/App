import React, {useEffect} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftRule} from '@libs/actions/User';
import AddRule from './AddRule';

function AddRulePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    useEffect(() => () => clearDraftRule(), []);

    return (
        <ScreenWrapper
            testID="AddRulePage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('expenseRulesPage.addRule.title')} />
            <AddRule />
        </ScreenWrapper>
    );
}

export default AddRulePage;
