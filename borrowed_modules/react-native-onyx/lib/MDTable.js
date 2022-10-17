import AsciTable from 'ascii-table';

class MDTable extends AsciTable {
    /**
     * Create a CSV string from the table data
     * @returns {string}
     */
    toCSV() {
        return [this.getTitle(), this.getHeading(), ...this.getRows()].join('\n');
    }

    /**
     * Create a JSON string from the table data
     * @returns {string}
     */
    toJSON() {
        return JSON.stringify(super.toJSON());
    }

    /**
     * Create a MD string from the table data
     * @returns {string}
     */
    toString() {
        // Ignore modifying the first |---| for titled tables
        let idx = this.getTitle() ? -2 : -1;
        const ascii = super.toString()
            .replace(/-\|/g, () => {
                /* we replace "----|" with "---:|" to align the data to the right in MD */
                idx++;

                if (idx < 0 || this.leftAlignedCols.includes(idx)) {
                    return '-|';
                }

                return ':|';
            });

        // strip the top and the bottom row (----) to make an MD table
        const md = ascii.split('\n').slice(1, -1).join('\n');
        return md;
    }
}

/**
 * Table Factory helper
 * @param {Object} options
 * @param {string} [options.title] - optional title center above the table
 * @param {string[]} options.heading - table column names
 * @param {number[]} [options.leftAlignedCols=[]] - indexes of columns that should be left aligned
 * Pass the columns that are non numeric here - the rest will be aligned to the right
 * @param {Array} [options.rows] The table can be initialized with row. Rows can also be added by `addRow`
 * @returns {MDTable}
 */
MDTable.factory = ({
    title, heading, leftAlignedCols = [], rows = [],
}) => {
    const table = new MDTable({title, heading, rows});
    table.leftAlignedCols = leftAlignedCols;

    /* By default we want everything aligned to the right as most values are numbers
         * we just override the columns that are not right aligned */
    heading.forEach((name, idx) => table.setAlign(idx, AsciTable.RIGHT));
    leftAlignedCols.forEach(idx => table.setAlign(idx, AsciTable.LEFT));

    return table;
};

export default MDTable;
