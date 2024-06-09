import React from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import Confirmation from './substeps/Confirmation';
import Size from './substeps/Size';

const bodyContent: Array<React.ComponentType<SubStepProps>> = [Size, Confirmation];

function SubscriptionSizePage() {
    const [subscriptionSizeFormDraft] = useOnyx(ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM_DRAFT);
    const {translate} = useLocalize();
    // TODO startFrom variable will get it's value based on ONYX data, it will be implemented in next phase (account?.canDowngrade field)
    const CAN_DOWNGRADE = true;
    const startFrom = CAN_DOWNGRADE ? 0 : 1;

    const onFinished = () => {
        if (CAN_DOWNGRADE) {
            // TODO this is temporary solution for the time being, API call will be implemented in next phase
            // eslint-disable-next-line no-console
            console.log(subscriptionSizeFormDraft);
            return;
        }

        Navigation.goBack();
    };

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep<SubStepProps>({bodyContent, startFrom, onFinished});

    const onBackButtonPress = () => {
        if (screenIndex !== 0 && startFrom === 0) {
            prevScreen();
            return;
        }

        Navigation.goBack();
    };

    const SubStepComponent = SubStep ?? function () { return null };

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
            <SubStepComponent
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
}

SubscriptionSizePage.displayName = 'SubscriptionSizePage';

export default SubscriptionSizePage;
