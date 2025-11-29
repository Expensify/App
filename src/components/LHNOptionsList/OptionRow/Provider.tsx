import {createContext, useState} from 'react';

type Context = {
    state: {
        reportID: string;
        isFocused: boolean;
        isHovered: boolean;
    };
    actions: {
        onPress: () => void;
        setIsFocused: (value: boolean) => void;
        setIsHovered: (value: boolean) => void;
    };
};

const initialState: Context = {
    state: {
        reportID: '',
        isFocused: false,
        isHovered: false,
    },
    actions: {
        onPress: () => {},
        setIsFocused: () => {},
        setIsHovered: () => {},
    },
};

const OptionRowContext = createContext<Context>(initialState);

type Props = {
    children: React.ReactNode;
    reportID: string;
};

function Provider({children, reportID}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  function onPress() {
      // Implement onPress logic here
      console.log('Pressed', reportID);
  }

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  // The below code is safe for the compiler to handler
  const context = {
      state: {reportID, isFocused, isHovered},
      actions: {onPress, setIsFocused, setIsHovered},
  };


  return <OptionRowContext value={context}>{children}</OptionRowContext>;
}

export {OptionRowContext};

export default Provider;
