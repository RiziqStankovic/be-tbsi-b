const toLocal = (val) => {
    const date = new Date(val);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('id-ID', options).format(date);
};

const toLocalNumeric = (val) => {
    val = val.toString();

    const date = new Date(val);

    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1; // Months are zero-based, so we add 1
    const year = date.getUTCFullYear();

    return `${day < 10 ? '0' : ''}${day}-${
        month < 10 ? '0' : ''
    }${month}-${year}`;
};

module.exports = {
    toLocal,
    toLocalNumeric,
};
