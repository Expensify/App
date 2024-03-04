import type UpdateGlobalBackgroundColor from './types';

const updateGlobalBackgroundColor: UpdateGlobalBackgroundColor = (theme) => {
    const htmlElement = document.getElementsByTagName('html')[0];
    htmlElement.style.setProperty('background-color', theme.appBG);
};

export default updateGlobalBackgroundColor;
