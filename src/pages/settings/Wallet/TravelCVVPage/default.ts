import type {TravelCVVActionsContextType, TravelCVVStateContextType} from './types';

const defaultTravelCVVStateContextValue: TravelCVVStateContextType = {
    cvv: null,
    isLoading: false,
    validateError: {},
};

const defaultTravelCVVActionsContextValue: TravelCVVActionsContextType = {
    setCvv: () => {},
    setIsLoading: () => {},
    setValidateError: () => {},
};

export {defaultTravelCVVStateContextValue, defaultTravelCVVActionsContextValue};
