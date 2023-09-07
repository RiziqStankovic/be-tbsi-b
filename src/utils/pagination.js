const mongoose = require('mongoose');
const { responsePagination, responseOnly } = require('./httpResponse');

const pagination = async (req, res, modelName, restrictFind, populate) => {
    try {
        const Model = mongoose.connection.models[modelName];

        let {
            page,
            limit,
            sort_by,
            sort_dir,
            search_by,
            search_val,
            use_paginate,
        } = req.query;

        let resp;

        let filter = {};

        if (search_by && search_val) {
            filter = { [search_by]: search_val };
        }

        let sort = {};

        if (sort_by && sort_dir) {
            sort = { [sort_by]: sort_dir.toLowerCase() == 'asc' ? 1 : -1 };
        }

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        if (use_paginate) {
            resp = await Model.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate(populate ?? '')
                .lean();
        } else {
            resp = await Model.find(restrictFind ? filter : {})
                .sort(sort)
                .populate(populate ?? '');
        }

        const totalData = await Model.countDocuments(
            restrictFind ? filter : {}
        );
        const totalPages = Math.ceil(totalData / limit);

        const paginateInfo = {
            currentPage: page,
            dataEachPage: limit,
            totalPages,
            totalData,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };

        return responsePagination(res, resp, paginateInfo);
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }
};

module.exports = pagination;
