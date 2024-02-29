import playSound from '..';

const playSoundExcludingMobile: typeof playSound = (sound) => playSound(sound);

export default playSoundExcludingMobile;
