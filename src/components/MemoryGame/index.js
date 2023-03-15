import {Component} from "react";

export default class MemoryGame extends Component {
    state = {
        current_selection: [],
        cardsInPlay: [],
    };

    constructor(props) {
        super(props);
        const cards = [
            {
                src: "fontawesome",
                id: 0,
            },
            {
                src: "fontawesome",
                id: 1,
            },
            {
                src: "fontawesome",
                id: 2,
            },
            {
                src: "fontawesome",
                id: 3,
            },
            {
                src: "fontawesome",
                id: 4,
            },
            {
                src: "fontawesome",
                id: 5,
            },
            {
                src: "fontawesome",
                id: 6,
            },
            {
                src: "fontawesome",
                id: 7,
            },
        ];

        const doubleCards = cards.concat(JSON.parse(JSON.stringify(cards)));
        this.setState({
            cards: shuffleCards(doubleCards),
        });
    }
    
    handleCardClick (id) {
        let current_selection = this.state.current_selection;
        let index = this.state.cards.findIndex(card => {
            return card.id === id;
        });

        let cards = [...this.state.cards];

        if (cards[index].is_open === false) {
            cards[index].is_open = true;
            current_selection.push(cards[index]);
        }

        if (current_selection.length === 2) {
            if (current_selection[0].id !== current_selection[1].id) {

            }
        }
    }
  
  render () {
      return (
          <div className="MemoryGame">
              <header>
                  <h3>Play the Flip card game</h3>
                  <div>
                      Select two cards with same content consecutively to make them vanish
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
  }