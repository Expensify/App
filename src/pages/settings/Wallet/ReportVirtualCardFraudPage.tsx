import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Card from '@userActions/Card';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReportVirtualCardFraudPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD>;

function ReportVirtualCardFraudPage({
    route: {
        params: {cardID = ''},
    },
}: ReportVirtualCardFraudPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [formData] = useOnyx(ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD);

    const virtualCard = cardList?.[cardID];
    const virtualCardError = ErrorUtils.getLatestErrorMessage(virtualCard);

    const prevIsLoading = usePrevious(formData?.isLoading);

    useEffect(() => {
        if (!prevIsLoading || formData?.isLoading) {
            return;
        }
        if (!isEmptyObject(virtualCard?.errors)) {
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(cardID));
    }, [cardID, formData?.isLoading, prevIsLoading, virtualCard?.errors]);

    if (isEmptyObject(virtualCard)) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper testID={ReportVirtualCardFraudPage.displayName}>
            <HeaderWithBackButton
                title={translate('reportFraudPage.title')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(cardID))}
            />
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <Text style={[styles.webViewStyles.baseFontStyle, styles.mh5]}>{translate('reportFraudPage.description')}</Text>
                <FormAlertWithSubmitButton
                    isAlertVisible={!!virtualCardError}
                    onSubmit={() => Card.reportVirtualExpensifyCardFraud(virtualCard.cardID)}
                    message={virtualCardError}
                    isLoading={formData?.isLoading}
                    buttonText={translate('reportFraudPage.deactivateCard')}
                    containerStyles={[styles.m5]}
                />
            </View>
        </ScreenWrapper>
    );
}

ReportVirtualCardFraudPage.displayName = 'ReportVirtualCardFraudPage';

export default ReportVirtualCardFraudPage;
