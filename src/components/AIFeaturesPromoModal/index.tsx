import React from 'react';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import {dismissProductTraining} from '@libs/actions/Welcome';
import Log from '@libs/Log';
import CONST from '@src/CONST';

function AIFeaturesPromoModal() {
    const {translate} = useLocalize();

    const onClose = () => {
        Log.hmmm('[AIFeaturesPromoModal] onClose called, dismissing product training');
        dismissProductTraining(CONST.AI_FEATURES_PROMO_MODAL, true);
    };

    const onConfirm = () => {
        Log.hmmm('[AIFeaturesPromoModal] onConfirm called, dismissing product training');
        dismissProductTraining(CONST.AI_FEATURES_PROMO_MODAL);
    };

    return (
        <FeatureTrainingModal
            animation={LottieAnimations.Hands}
            title={translate('aiFeaturesPromoModal.title')}
            description={translate('aiFeaturesPromoModal.description')}
            confirmText={translate('aiFeaturesPromoModal.letsGo')}
            onConfirm={onConfirm}
            onClose={onClose}
        />
    );
}

export default AIFeaturesPromoModal;
