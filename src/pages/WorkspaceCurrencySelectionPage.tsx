import React, {useCallback} from 'react';
import {View} from 'react-native';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setWorkspaceConfirmationCurrency} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import {skipNextFocusRestore} from '@libs/NavigationFocusReturn';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';

type WorkspaceCurrencySelectionPageProps = {
    route: {
        params: {
            backTo?: Route;
        };
    };
};

function WorkspaceCurrencySelectionPage({route}: WorkspaceCurrencySelectionPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [workspaceConfirmationFormDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM_DRAFT);

    const value = workspaceConfirmationFormDraft?.currency ?? currentUserPersonalDetails?.localCurrencyCode ?? CONST.CURRENCY.USD;

    const goBack = useCallback(() => {
        const backTo = route?.params?.backTo;
        Navigation.goBack(backTo);
    }, [route?.params?.backTo]);

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
        <ScreenWrapper testID="WorkspaceCurrencySelectionPage">
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

export default WorkspaceCurrencySelectionPage;
