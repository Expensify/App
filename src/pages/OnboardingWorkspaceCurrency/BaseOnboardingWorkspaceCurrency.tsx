import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {setWorkspaceCurrency} from '@libs/actions/Onboarding';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {BaseOnboardingWorkspaceCurrencyProps} from './types';

function BaseOnboardingWorkspaceCurrency({route, shouldUseNativeStyles}: BaseOnboardingWorkspaceCurrencyProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_WORKSPACE_DETAILS_FORM_DRAFT, {canBeMissing: true});

    const value = draftValues?.currency ?? currentUserPersonalDetails?.localCurrencyCode ?? CONST.CURRENCY.USD;

    const goBack = useCallback(() => {
        const backTo = route?.params?.backTo;
        if (backTo) {
            Navigation.goBack(backTo as Route);
            return;
        }
        Navigation.goBack();
    }, [route?.params?.backTo]);

    const updateInput = useCallback(
        (item: CurrencyListItem) => {
            setWorkspaceCurrency(item.currencyCode);
            goBack();
        },
        [goBack],
    );

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            testID={BaseOnboardingWorkspaceCurrency.displayName}
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
            shouldShowOfflineIndicator={!onboardingIsMediumOrLargerScreenWidth}
        >
            <HeaderWithBackButton
                progressBarPercentage={100}
                onBackButtonPress={goBack}
            />
            <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                <Text style={styles.textHeadlineH1}>{translate('common.currency')}</Text>
            </View>
            <CurrencySelectionList
                listItemWrapperStyle={onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8] : []}
                textInputStyle={onboardingIsMediumOrLargerScreenWidth ? styles.ph8 : styles.ph5}
                initiallySelectedCurrencyCode={value}
                onSelect={updateInput}
                searchInputLabel={translate('common.search')}
                addBottomSafeAreaPadding
            />
        </ScreenWrapper>
    );
}

BaseOnboardingWorkspaceCurrency.displayName = 'BaseOnboardingWorkspaceCurrency';

export default BaseOnboardingWorkspaceCurrency;
