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

const getOneMonthAgo = () => {
    const today = new Date();
    const oneMonthAgo = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate()
    );
    return oneMonthAgo;
};

const getTimeRange = (from, to) => {
    const startdate = new Date(from);
    const enddate = new Date(to);

    const timediff = Math.abs(enddate.getTime() - startdate.getTime());
    const daydiff = Math.ceil(timediff / (1000 * 3600 * 24));
    const timerange = [];

    for (let i = 0; i <= daydiff; i++) {
        const startDay = new Date(startdate.getTime() + i * (1000 * 3600 * 24));
        const endDay = new Date(startDay.getTime() + 1000 * 3600 * 24);
        timerange.push({ startDay, endDay });
    }

    return timerange;
};

const getDateAndMonthOnly = (dateStr) => {
    const date = new Date(dateStr);
    const formattedDate = date
        .toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
        })
        .replace(/(\w+)\s(\d+)/, '$2 $1');
    let splitted = formattedDate.split(' ');
    let dateNum = splitted[0];
    if (parseInt(dateNum) < 10) {
        dateNum = '0' + dateNum;
    }

    let monthStr = splitted[1].slice(0, 3);
    return dateNum + ' ' + monthStr;
};

module.exports = {
    toLocal,
    toLocalNumeric,
    getOneMonthAgo,
    getTimeRange,
    getDateAndMonthOnly,
};
