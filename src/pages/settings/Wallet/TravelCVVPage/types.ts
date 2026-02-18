import type {Errors} from '@src/types/onyx/OnyxCommon';

type TravelCVVContextType = {
    cvv: string | null;
    isLoading: boolean;
    validateError: Errors;
    setCvv: React.Dispatch<React.SetStateAction<string | null>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setValidateError: React.Dispatch<React.SetStateAction<Errors>>;
};

export default TravelCVVContextType;
