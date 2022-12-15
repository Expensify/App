import BaseLocaleListener from './BaseLocaleListener';

const listenForLocaleChanges = () => {
    BaseLocaleListener.connect(() => {});
};

const LocaleListener = {
    listenForLocaleChanges,
};

export default LocaleListener;
