const ACTION_TYPES = {
    START: 'START',
    SUCCESS: 'SUCCESS',
    FAIL: 'FAIL',
} as const;

type State = {
    details: {
        pan: string;
        expiration: string;
        cvv: string;
        address: {
            street: string;
            street2: string;
            city: string;
            state: string;
            zip: string;
            country: string;
        };
    };
    isLoading: boolean;
    error: string;
};

type Action = {type: typeof ACTION_TYPES.START} | {type: typeof ACTION_TYPES.SUCCESS; payload: State['details']} | {type: typeof ACTION_TYPES.FAIL; payload: string};

const initialState: State = {
    details: {
        pan: '',
        expiration: '',
        cvv: '',
        address: {
            street: '',
            street2: '',
            city: '',
            state: '',
            zip: '',
            country: '',
        },
    },
    isLoading: false,
    error: '',
};

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case ACTION_TYPES.START:
            return {...state, isLoading: true};
        case ACTION_TYPES.SUCCESS:
            return {details: action.payload, isLoading: false, error: ''};
        case ACTION_TYPES.FAIL: {
            return {...state, error: action.payload, isLoading: false};
        }
        default:
            return state;
    }
};

export {initialState, reducer, ACTION_TYPES};
