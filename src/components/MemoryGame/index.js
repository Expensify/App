export default function App({ uniqueCardsArray }) {
    const [cards, setCards] = useState(
      () => shuffleCards(uniqueCardsArray.concat(uniqueCardsArray))
    );
    
    const handleCardClick = (index) => {
      // We will handle it later
    };
  
  
    return (
      <div className="App">
        <header>
          <h3>Play the Flip card game</h3>
          <div>
            Select two cards with same content consequtively to make them vanish
          </div>
        </header>
        <div className="container">
          {cards.map((card, index) => {
            return (
              <Card
                key={index}
                card={card}
                index={index}
                onClick={handleCardClick}
              />
            );
          })}
        </div>
     </div>
    )
  }