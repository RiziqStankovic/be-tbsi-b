const mongoose = require('mongoose');

const compareObjectId = (id1, id2) => {
    id1 = new mongoose.Types.ObjectId(id1);
    id2 = new mongoose.Types.ObjectId(id2);

    return id1.equals(id2);
};

module.exports = compareObjectId;
