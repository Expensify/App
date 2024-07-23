import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import * as FormActions from '@userActions/FormActions';
import * as Subscription from '@userActions/Subscription';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/SubscriptionSizeForm';
import Confirmation from './substeps/Confirmation';
import Size from './substeps/Size';

const bodyContent: Array<React.ComponentType<SubStepProps>> = [Size, Confirmation];

type SubscriptionSizePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.SUBSCRIPTION.SIZE>;

function SubscriptionSizePage({route}: SubscriptionSizePageProps) {
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const [subscriptionSizeFormDraft] = useOnyx(ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM_DRAFT);
    const {translate} = useLocalize();
    const canChangeSubscriptionSize = !!(route.params?.canChangeSize ?? 1);
    const startFrom = canChangeSubscriptionSize ? 0 : 1;

    const onFinished = () => {
        Subscription.updateSubscriptionSize(subscriptionSizeFormDraft ? Number(subscriptionSizeFormDraft[INPUT_IDS.SUBSCRIPTION_SIZE]) : 0, privateSubscription?.userCount ?? 0);
        Navigation.goBack();
        FormActions.clearDraftValues(ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM);
    };

    const {componentToRender: SubStep, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom, onFinished});

    const onBackButtonPress = () => {
        if (screenIndex !== 0 && startFrom === 0) {
            prevScreen();
            return;
        }

        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            testID={SubscriptionSizePage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('subscription.subscriptionSize.title')}
                onBackButtonPress={onBackButtonPress}
            />
            <SubStep
                isEditing={canChangeSubscriptionSize}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
}

SubscriptionSizePage.displayName = 'SubscriptionSizePage';

export default SubscriptionSizePage;
