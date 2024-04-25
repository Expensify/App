import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PublicScreensParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Card from '@userActions/Card';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ReportVirtualCardFraudForm} from '@src/types/form';
import type {Card as OnyxCard} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReportVirtualCardFraudPageOnyxProps = {
    /** Form data propTypes */
    formData: OnyxEntry<ReportVirtualCardFraudForm>;

    /** Card list propTypes */
    cardList: OnyxEntry<Record<string, OnyxCard>>;
};

type ReportVirtualCardFraudPageProps = ReportVirtualCardFraudPageOnyxProps & StackScreenProps<PublicScreensParamList, typeof SCREENS.TRANSITION_BETWEEN_APPS>;

function ReportVirtualCardFraudPage({
    route: {
        params: {domain = ''},
    },
    cardList,
    formData,
}: ReportVirtualCardFraudPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const domainCards = CardUtils.getDomainCards(cardList)[domain];
    const virtualCard = domainCards?.find((card) => card.nameValuePairs?.isVirtual);
    const virtualCardError = ErrorUtils.getLatestErrorMessage(virtualCard?.errors ?? {});

    const prevIsLoading = usePrevious(formData?.isLoading);

    useEffect(() => {
        if (!prevIsLoading || formData?.isLoading) {
            return;
        }
        if (!isEmptyObject(virtualCard?.errors)) {
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(domain));
    }, [domain, formData?.isLoading, prevIsLoading, virtualCard?.errors]);

    if (isEmptyObject(virtualCard)) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper testID={ReportVirtualCardFraudPage.displayName}>
            <HeaderWithBackButton
                title={translate('reportFraudPage.title')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(domain))}
            />
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <Text style={[styles.webViewStyles.baseFontStyle, styles.mh5]}>{translate('reportFraudPage.description')}</Text>
                <FormAlertWithSubmitButton
                    isAlertVisible={Boolean(virtualCardError)}
                    onSubmit={() => Card.reportVirtualExpensifyCardFraud(virtualCard.cardID)}
                    message={virtualCardError}
                    isLoading={formData?.isLoading}
                    buttonText={translate('reportFraudPage.deactivateCard')}
                />
            </View>
        </ScreenWrapper>
    );
}

ReportVirtualCardFraudPage.displayName = 'ReportVirtualCardFraudPage';

export default withOnyx<ReportVirtualCardFraudPageProps, ReportVirtualCardFraudPageOnyxProps>({
    cardList: {
        key: ONYXKEYS.CARD_LIST,
    },
    formData: {
        key: ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD,
    },
})(ReportVirtualCardFraudPage);
