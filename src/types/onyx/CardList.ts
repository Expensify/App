import Card from './Card';
import {Errors} from './OnyxCommon';

type CardList = Record<string, {errors?: Errors}> & {
    physical: Card;
    virtual: Card;
    isLoading: boolean;
};

export default CardList;
