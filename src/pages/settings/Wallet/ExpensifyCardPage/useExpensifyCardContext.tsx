import {useContext} from 'react';
import {ExpensifyCardContext} from './ExpensifyCardContextProvider';

/**
 * Hook to display revealed expensify card data and pass it between screens.

 */
const useExpensifyCardContext = () => useContext(ExpensifyCardContext);

export default useExpensifyCardContext;
