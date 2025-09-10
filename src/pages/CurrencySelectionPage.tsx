import React from 'react';
import {View} from 'react-native';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setWorkspaceConfirmationCurrency} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';

type CurrencySelectionPageProps = {
    route: {
        params: undefined;
    };
};

function CurrencySelectionPage({route}: CurrencySelectionPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [workspaceConfirmationFormDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM_DRAFT);

    const onSelect = (option: CurrencyListItem) => {
        setWorkspaceConfirmationCurrency(option.currencyCode);
        Navigation.goBack();
    };

    return (
        <ScreenWrapper testID={CurrencySelectionPage.displayName}>
            <HeaderWithBackButton
                title={translate('common.currency')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={styles.flex1}>
                <Text style={[styles.ph5, styles.pv3, styles.textSupporting]}>{translate('workspace.editor.currencyInputLabel')}</Text>
                <CurrencySelectionList
                    onSelect={onSelect}
                    searchInputLabel={translate('common.search')}
                    initiallySelectedCurrencyCode={workspaceConfirmationFormDraft?.currency}
                />
            </View>
        </ScreenWrapper>
    );
}

CurrencySelectionPage.displayName = 'CurrencySelectionPage';

export default CurrencySelectionPage;
