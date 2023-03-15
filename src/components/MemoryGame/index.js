import React, {useState} from 'react';
import {View} from 'react-native';
import styles from '../../styles/styles';
import Button from '../Button';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

function App(props) {
    const [shouldTheGameStart, setShouldTheGameStart] = useState(false);

    return (
      <div className="App">
        <header>
          <h3>Play the Flip card game</h3>
          <div>
            Select two cards with same content consecutively to make them vanish
          </div>
        </header>
        <View style={[styles.mt4]}>
            {shouldTheGameStart ? (
                <div className="container">
                {/* {cards.map((card, index) => {
                  return (
                    <Card
                      key={index}
                      card={card}
                      index={index}
                      onClick={handleCardClick}
                    />
                  );
                })} */}
                The Game
              </div>
            ) : (
                <Button onPress={() => setShouldTheGameStart(true)} text={props.translate('cardMemoryGame.startTheGame')} success large />
            )}
        </View>
     </div>
    )
};

App.propTypes = {
    ...withLocalizePropTypes,
};

export default withLocalize(App);