const toLocal = (val) => {
    const date = new Date(val);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('id-ID', options).format(date);
};

module.exports = {
    toLocal,
};
