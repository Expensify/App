import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SubscriptionSizeForm} from '@src/types/form';
import Confirmation from './substeps/Confirmation';
import Size from './substeps/Size';

type SubscriptionSizePageOnyxProps = {
    /** The draft values from subscription size form */
    subscriptionSizeForm: OnyxEntry<SubscriptionSizeForm>;
};

type SubscriptionSizePageProps = SubscriptionSizePageOnyxProps;

const bodyContent: Array<React.ComponentType<SubStepProps>> = [Size, Confirmation];

function SubscriptionSizePage({subscriptionSizeForm}: SubscriptionSizePageProps) {
    const {translate} = useLocalize();
    // TODO update logic to
    //  const startFrom = account?.canDowngrade ? 0 : 1;
    const CAN_DOWNGRADE = true;
    const startFrom = CAN_DOWNGRADE ? 0 : 1;

    const onFinished = () => {
        if (CAN_DOWNGRADE) {
            // TODO API call will be implemented in next phase
            // eslint-disable-next-line no-console
            console.log(subscriptionSizeForm);
            return;
        }

        Navigation.goBack();
    };

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom, onFinished});

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
                title={translate('subscriptionSize.title')}
                onBackButtonPress={onBackButtonPress}
            />
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
}

SubscriptionSizePage.displayName = 'SubscriptionSizePage';

export default withOnyx<SubscriptionSizePageProps, SubscriptionSizePageOnyxProps>({
    subscriptionSizeForm: {
        key: ONYXKEYS.FORMS.SUBSCRIPTION_SIZE_FORM_DRAFT,
    },
})(SubscriptionSizePage);
