import React, {useEffect} from 'react';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useSubPage from '@hooks/useSubPage';
import {clearDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isSubscriptionTypeOfInvoicing} from '@libs/SubscriptionUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {updateSubscriptionSize} from '@userActions/Subscription';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/SubscriptionSizeForm';
import Confirmation from './substeps/Confirmation';
import Size from './substeps/Size';

type SubscriptionSizePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.SUBSCRIPTION.SIZE>;

const pages = [
    {pageName: CONST.SUBSCRIPTION_SIZE.PAGE_NAME.SIZE, component: Size},
    {pageName: CONST.SUBSCRIPTION_SIZE.PAGE_NAME.CONFIRM, component: Confirmation},
];

function SubscriptionSizePage({route}: SubscriptionSizePageProps) {
    const privateSubscription = usePrivateSubscription();
    const [subscriptionSizeFormDraft] = useOnyx(ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM_DRAFT, {canBeMissing: false});
    const {translate} = useLocalize();
    const canChangeSubscriptionSize = !!(route.params?.canChangeSize ?? 1);
    const startFrom = canChangeSubscriptionSize ? 0 : 1;

    const onFinished = () => {
        updateSubscriptionSize(subscriptionSizeFormDraft ? Number(subscriptionSizeFormDraft[INPUT_IDS.SUBSCRIPTION_SIZE]) : 0, privateSubscription?.userCount ?? 0);
        Navigation.goBack(ROUTES.SETTINGS_SUBSCRIPTION_SETTINGS_DETAILS);
    };

    const {CurrentPage, pageIndex, prevPage, nextPage, moveTo} = useSubPage({
        pages,
        onFinished,
        startFrom,
        buildRoute: (pageName) => ROUTES.SETTINGS_SUBSCRIPTION_SIZE.getRoute(route.params?.canChangeSize, pageName),
    });

    const onBackButtonPress = () => {
        if (pageIndex !== 0 && startFrom === 0) {
            prevPage();
            return;
        }

        Navigation.goBack();
    };

    useEffect(
        () => () => {
            clearDraftValues(ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM);
        },
        [],
    );

    if (isSubscriptionTypeOfInvoicing(privateSubscription?.type)) {
        return <NotFoundPage />;
    }

    if (!privateSubscription) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            testID="SubscriptionSizePage"
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            shouldShowOfflineIndicatorInWideScreen
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('subscription.subscriptionSize.title')}
                    onBackButtonPress={onBackButtonPress}
                />
                <CurrentPage
                    isEditing={canChangeSubscriptionSize}
                    onNext={nextPage}
                    onMove={moveTo}
                />
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

export default SubscriptionSizePage;
