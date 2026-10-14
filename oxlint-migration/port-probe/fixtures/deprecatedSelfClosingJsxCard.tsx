/** @deprecated Compose `Card.Root` instead. */
function LegacyCard({title}: {title: string}) {
    return <div>{title}</div>;
}

function CardRoot() {
    return null;
}

const Card = Object.assign(LegacyCard, {Root: CardRoot});

export default Card;
