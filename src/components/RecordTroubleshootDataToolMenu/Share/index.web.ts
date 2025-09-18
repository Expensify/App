import type ShareModule from './types';

const Share: ShareModule = {
    open: () => Promise.resolve({message: '', success: true}),
};

export default Share;
