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
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import Confirmation from './substeps/Confirmation';
import Size from './substeps/Size';

const bodyContent: Array<React.ComponentType<SubStepProps>> = [Size, Confirmation];

type SubscriptionSizePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.SUBSCRIPTION.SIZE>;

function SubscriptionSizePage({route}: SubscriptionSizePageProps) {
    const [subscriptionSizeFormDraft] = useOnyx(ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM_DRAFT);
    const {translate} = useLocalize();
    const CAN_CHANGE_SUBSCRIPTION_SIZE = !!route.params.canChangeSize;
    const startFrom = CAN_CHANGE_SUBSCRIPTION_SIZE ? 0 : 1;

    const onFinished = () => {
        if (CAN_CHANGE_SUBSCRIPTION_SIZE) {
            // TODO this is temporary solution for the time being, API call will be implemented in next phase
            // eslint-disable-next-line no-console
            console.log(subscriptionSizeFormDraft);
            return;
        }

        Navigation.goBack();
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
        >
            <HeaderWithBackButton
                title={translate('subscription.subscriptionSize.title')}
                onBackButtonPress={onBackButtonPress}
            />
            <SubStep
                isEditing={CAN_CHANGE_SUBSCRIPTION_SIZE}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
}

SubscriptionSizePage.displayName = 'SubscriptionSizePage';

export default SubscriptionSizePage;
