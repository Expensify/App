import Card from './Card';

type CardList = Record<string, Card> & {
    isLoading: boolean;
};

export default CardList;
