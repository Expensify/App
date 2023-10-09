type State = {
    details: {
        pan: string;
        expiration: string;
        cvv: string;
        privatePersonalDetails: {
            address: {
                street: string;
                street2: string;
                city: string;
                state: string;
                zip: string;
                country: string;
            };
        };
    };
    isLoading: boolean;
    error: string;
};

type Action = {type: 'START'} | {type: 'SUCCESS'; payload: State['details']} | {type: 'FAIL'; payload: string};

const initialState: State = {
    details: {
        pan: '',
        expiration: '',
        cvv: '',
        privatePersonalDetails: {
            address: {
                street: '',
                street2: '',
                city: '',
                state: '',
                zip: '',
                country: '',
            },
        },
    },
    isLoading: false,
    error: '',
};

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'START':
            return {...state, isLoading: true};
        case 'SUCCESS':
            return {details: action.payload, isLoading: false, error: ''};
        case 'FAIL': {
            return {...state, error: action.payload, isLoading: false};
        }
        default:
            return state;
    }
};

export {initialState, reducer};
