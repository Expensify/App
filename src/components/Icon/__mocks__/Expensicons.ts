const Expensicons = jest.requireActual('../Expensicons');

module.exports = Object.entries(Expensicons).reduce((prev, curr, key) => {
    // We set the name of the anonymous mock function here so we can dynamically build the list of mocks and access the
    // "name" property to use in accessibility hints for element querying
    const fn = () => '';
    Object.defineProperty(fn, 'name', {value: key});
    return {...prev, [key]: fn};
}, {});
