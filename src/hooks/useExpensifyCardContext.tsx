import {useContext} from 'react';
import {ExpensifyCardContext} from '@pages/settings/Wallet/ExpensifyCardPage/ExpensifyCardContextProvider';

/**
 * Hook to display revealed data of expensify card and pass it between screens.
 */
const useExpensifyCardContext = () => useContext(ExpensifyCardContext);

export default useExpensifyCardContext;
