import CONST from '../../CONST';

export default (vertical) => ({
    // On desktop app we are adding a header gap of 12px
    // which we need to add to vertical offset when setting
    // offset on desktop
    vertical: vertical + CONST.DESKTOP_HEADER_HEIGHT,
});
