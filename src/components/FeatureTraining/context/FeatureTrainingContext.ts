import {createContext, useContext} from 'react';

import type {FeatureTrainingActionsValue, FeatureTrainingStateValue} from './types';

const defaultState: FeatureTrainingStateValue = {
    willShowAgain: true,
    shouldShowLoadingImmediatelyOnPress: undefined,
    isCarousel: false,
    confirmSentryLabel: undefined,
    currentPage: undefined,
    pageCount: undefined,
    isLastPage: undefined,
    contentMinHeight: undefined,
};

const defaultActions: FeatureTrainingActionsValue = {
    toggleWillShowAgain: () => {},
    handleConfirm: () => {},
    handleClose: () => {},
    advance: undefined,
    goBack: undefined,
};

const FeatureTrainingStateContext = createContext<FeatureTrainingStateValue>(defaultState);
const FeatureTrainingActionsContext = createContext<FeatureTrainingActionsValue>(defaultActions);

function useFeatureTrainingState(): FeatureTrainingStateValue {
    return useContext(FeatureTrainingStateContext);
}

function useFeatureTrainingActions(): FeatureTrainingActionsValue {
    return useContext(FeatureTrainingActionsContext);
}

export {FeatureTrainingStateContext, FeatureTrainingActionsContext, useFeatureTrainingState, useFeatureTrainingActions};
