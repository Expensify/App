import type {AnyRequest} from '@src/types/onyx/Request';

type CanPersistRequest = (request: AnyRequest | null) => boolean;

export default CanPersistRequest;
