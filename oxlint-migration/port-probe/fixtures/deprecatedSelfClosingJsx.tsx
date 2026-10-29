import Card from './deprecatedSelfClosingJsxCard';

const RowCard = Card;

const plain = <Card title="plain" />;
const aliased = <RowCard title="aliased" />;
const compound = <Card.Root />;

export {aliased, compound, plain};
