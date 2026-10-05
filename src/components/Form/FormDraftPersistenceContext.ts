import {createContext} from 'react';

/** Allows a flow to persist every registered form input without changing each input's default behavior. */
const FormDraftPersistenceContext = createContext(false);

export default FormDraftPersistenceContext;
