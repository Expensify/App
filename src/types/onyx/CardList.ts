import Card from './Card';

type CardList = Record<number, Card> & {
    isLoading: boolean;
};

export default CardList;
