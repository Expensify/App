type AsyncOpenURL = <T>(promise: Promise<T>, url: string | ((params: T) => string), shouldSkipCustomSafariLogic?: boolean) => void;

export default AsyncOpenURL;
