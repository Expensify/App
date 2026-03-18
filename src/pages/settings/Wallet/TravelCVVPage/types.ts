import type {Errors} from '@src/types/onyx/OnyxCommon';

type TravelCVVStateContextType = {
    cvv: string | null;
    isLoading: boolean;
    validateError: Errors;
};

type TravelCVVActionsContextType = {
    setCvv: React.Dispatch<React.SetStateAction<string | null>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setValidateError: React.Dispatch<React.SetStateAction<Errors>>;
};

export type {TravelCVVStateContextType, TravelCVVActionsContextType};
