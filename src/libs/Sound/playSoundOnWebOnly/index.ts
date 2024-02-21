import playSound from '..';

const playSoundOnWebOnly: typeof playSound = (sound) => playSound(sound);

export default playSoundOnWebOnly;
