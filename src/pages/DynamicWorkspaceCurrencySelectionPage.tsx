import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setWorkspaceConfirmationCurrency} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import {skipNextFocusRestore} from '@libs/NavigationFocusReturn';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React, {useCallback} from 'react';
import {View} from 'react-native';

function DynamicWorkspaceCurrencySelectionPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_CONFIRMATION_CURRENCY.path);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [workspaceConfirmationFormDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM_DRAFT);

    const value = workspaceConfirmationFormDraft?.currency ?? currentUserPersonalDetails?.localCurrencyCode ?? CONST.CURRENCY.USD;

    const goBack = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);

    const onSelect = useCallback(
        (option: CurrencyListItem) => {
            setWorkspaceConfirmationCurrency(option.currencyCode);
            // After selecting, don't restore focus to the currency menu item on the confirmation page —
            // a focused button suppresses the form's submit-on-Enter, so the next Enter would re-open this
            // page instead of creating the workspace. The header Back button keeps the default focus restore.
            skipNextFocusRestore();
            goBack();
        },
        [goBack],
    );

    return (
        <ScreenWrapper testID="DynamicWorkspaceCurrencySelectionPage">
            <HeaderWithBackButton
                title={translate('workspace.editor.currencyInputLabel')}
                onBackButtonPress={goBack}
            />
            <View style={styles.flex1}>
                <CurrencySelectionList
                    onSelect={onSelect}
                    searchInputLabel={translate('common.search')}
                    initiallySelectedCurrencyCode={value}
                />
            </View>
        </ScreenWrapper>
    );
}

export default DynamicWorkspaceCurrencySelectionPage;
