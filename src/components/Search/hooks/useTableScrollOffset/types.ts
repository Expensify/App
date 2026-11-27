/** Where the Spend table was last scrolled sideways, kept outside React so a new search can restore it before paint. */
type HorizontalScrollOffsetStore = {
    get: () => number;
    set: (offset: number) => void;
};

export default HorizontalScrollOffsetStore;
