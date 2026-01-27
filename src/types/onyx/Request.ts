import type {CustomTypeOptions, OnyxKey, OnyxUpdate} from 'react-native-onyx';
import type OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import type {Merge} from 'type-fest';
import type Response from './Response';

/**
 * Represents type options to configure all Onyx methods.
 * It's a combination of predefined options with user-provided options (CustomTypeOptions).
 *
 * The user-defined options (CustomTypeOptions) are merged into these predefined options.
 * In case of conflicting properties, the ones from CustomTypeOptions are prioritized.
 */
type TypeOptions = Merge<
    {
        /** Represents a string union of all Onyx normal keys. */
        keys: string;
        /** Represents a string union of all Onyx collection keys. */
        collectionKeys: string;
        /** Represents a Record where each key is an Onyx key and each value is its corresponding Onyx value type. */
        values: Record<string, unknown>;
    },
    CustomTypeOptions
>;

/**
 *
 */
type CollectionKeyBase = TypeOptions['collectionKeys'];

/**
 *
 */
type ExpandOnyxKeys<TKey extends OnyxKey> = TKey extends CollectionKeyBase ? NoInfer<`${TKey}${string}`> : TKey;

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericOnyxUpdate<TKey extends OnyxKey = any> = {
    /**
     *
     */
    onyxMethod:
        | typeof OnyxUtils.METHOD.SET
        | typeof OnyxUtils.METHOD.MULTI_SET
        | typeof OnyxUtils.METHOD.MERGE
        | typeof OnyxUtils.METHOD.CLEAR
        | typeof OnyxUtils.METHOD.MERGE_COLLECTION
        | typeof OnyxUtils.METHOD.SET_COLLECTION;
    /**
     *
     */
    key: ExpandOnyxKeys<TKey>;
    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any;
};

/** Model of onyx requests sent to the API */
type OnyxDataBase<TOnyxUpdate> = {
    /** Onyx instructions that are executed after getting response from server with jsonCode === 200 */
    successData?: TOnyxUpdate[];

    /** Onyx instructions that are executed after getting response from server with jsonCode !== 200 */
    failureData?: TOnyxUpdate[];

    /** Onyx instructions that are executed after getting any response from server */
    finallyData?: TOnyxUpdate[];

    /** Onyx instructions that are executed before request is made to the server */
    optimisticData?: TOnyxUpdate[];

    /** Onyx instructions that are executed when Onyx queue is flushed */
    queueFlushedData?: TOnyxUpdate[];
};

/** Model of onyx requests sent to the API */
type OnyxData<TKey extends OnyxKey> = OnyxDataBase<OnyxUpdate<TKey>>;

/** Model of onyx requests sent to the API */
type GenericOnyxData = OnyxDataBase<GenericOnyxUpdate>;

/** HTTP request method names */
type RequestType = 'get' | 'post';

/** Model of overall requests sent to the API */
type RequestDataBase<TKey extends OnyxKey = OnyxKey> = {
    /** Name of the API command */
    command: string;

    /** Command name for logging purposes */
    commandName?: string;

    /** Additional parameters that can be sent with the request */
    data?: Record<string, unknown>;

    /** The HTTP request method name */
    type?: RequestType;

    /** Whether the app should connect to the secure API endpoints */
    shouldUseSecure?: boolean;

    /** Promise resolve handler */
    resolve?: (value: Response<TKey>) => void;

    /** Promise reject handler */
    reject?: (value?: unknown) => void;

    /** Whether the app should skip the web proxy to connect to API endpoints */
    shouldSkipWebProxy?: boolean;

    /**
     * Whether the request is initiated offline.
     *
     * This field is used to indicate if the app initiates the request while offline.
     * It is particularly useful for scenarios such as receipts recreating, where
     * the app needs to regenerate a blob once the user gets back online.
     * More info https://github.com/Expensify/App/issues/51761
     */
    initiatedOffline?: boolean;

    /** The unique ID of the request */
    requestID?: number;
};

/** Model of overall requests sent to the API */
type RequestData<TKey extends OnyxKey> = RequestDataBase<TKey> & OnyxData<TKey>;

/** Model of overall requests sent to the API */
type GenericRequestData = RequestDataBase & GenericOnyxData;

/**
 * Represents the possible actions to take in case of a conflict in the request queue.
 */
type ConflictData = ConflictRequestReplace | ConflictRequestDelete | ConflictRequestPush | ConflictRequestNoAction;

/**
 * Model of a conflict request that has to be replaced in the request queue.
 */
type ConflictRequestReplace = {
    /**
     * The action to take in case of a conflict.
     */
    type: 'replace';

    /**
     * The index of the request in the queue to update.
     */
    index: number;

    /**
     * The new request to replace the existing request in the queue.
     */
    request?: GenericRequest;
};

/**
 * Model of a conflict request that needs to be deleted from the request queue.
 */
type ConflictRequestDelete = {
    /**
     * The action to take in case of a conflict.
     */
    type: 'delete';

    /**
     * The indices of the requests in the queue that are to be deleted.
     */
    indices: number[];

    /**
     * A flag to mark if the new request should be pushed into the queue after deleting the conflicting requests.
     */
    pushNewRequest: boolean;

    /**
     * The next action to execute after the current conflict is resolved.
     */
    nextAction?: ConflictData;
};

/**
 * Model of a conflict request that has to be enqueued at the end of request queue.
 */
type ConflictRequestPush = {
    /**
     * The action to take in case of a conflict.
     */
    type: 'push';
};

/**
 * Model of a conflict request that does not need to be updated or saved in the request queue.
 */
type ConflictRequestNoAction = {
    /**
     * The action to take in case of a conflict.
     */
    type: 'noAction';
};

/**
 * An object that has the request and the action to take in case of a conflict.
 */
type ConflictActionData = {
    /**
     * The action to take in case of a conflict.
     */
    conflictAction: ConflictData;
};

/**
 * An object that describes how a new write request can identify any queued requests that may conflict with or be undone by the new request,
 * and how to resolve those conflicts.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface RequestConflictResolverBase<TRequest> {
    /**
     * A function that checks if a new request conflicts with any existing requests in the queue.
     */
    checkAndFixConflictingRequest?(persistedRequest: TRequest[]): ConflictActionData;

    /**
     * A boolean flag to mark a request as persisting into Onyx, if set to true it means when Onyx loads
     * the ongoing request, it will be removed from the persisted request queue.
     */
    persistWhenOngoing?: boolean;

    /**
     * A boolean flag to mark a request as rollback, if set to true it means the request failed and was added back into the queue.
     */
    isRollback?: boolean;
}

/**
 * An object that describes how a new write request can identify any queued requests that may conflict with or be undone by the new request,
 * and how to resolve those conflicts.
 */
type RequestConflictResolver<TKey extends OnyxKey> = RequestConflictResolverBase<Request<TKey>>;

/**
 * An object that describes how a new write request can identify any queued requests that may conflict with or be undone by the new request,
 * and how to resolve those conflicts.
 */
type GenericRequestConflictResolver = RequestConflictResolverBase<GenericRequest>;

/** Model of requests sent to the API */
type GenericRequest = GenericRequestData & GenericOnyxData & GenericRequestConflictResolver;

/** Model of requests sent to the API */
type Request<TKey extends OnyxKey> = RequestData<TKey> & OnyxData<TKey> & RequestConflictResolver<TKey>;

/**
 * An object used to describe how a request can be paginated.
 */
type PaginationConfig = {
    /**
     * The ID of the resource we're trying to paginate (i.e: the reportID in the case of paginating reportActions).
     */
    resourceID: string;

    /**
     * The ID used as a cursor/offset when making a paginated request.
     */
    cursorID?: string | null;
};

/**
 * A paginated request object.
 */
type PaginatedRequest<TKey extends OnyxKey> = Request<TKey> &
    PaginationConfig & {
        /**
         * A boolean flag to mark a request as Paginated.
         */
        isPaginated: true;
    };

export default Request;
export type {
    GenericOnyxUpdate,
    OnyxData,
    RequestType,
    PaginationConfig,
    PaginatedRequest,
    RequestConflictResolver,
    GenericRequestConflictResolver,
    ConflictActionData,
    ConflictData,
    GenericRequest,
};
