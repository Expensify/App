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
    loading: boolean;
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
    loading: false,
    error: '',
};

const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case 'START':
            return {...state, loading: true};
        case 'SUCCESS':
            return {details: action.payload, loading: false, error: ''};
        case 'FAIL': {
            return {...state, error: action.payload, loading: false};
        }
        default:
            return state;
    }
};

export {initialState, reducer};
