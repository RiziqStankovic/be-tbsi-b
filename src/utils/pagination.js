const mongoose = require('mongoose');
const { responsePagination, responseOnly } = require('./httpResponse');

const pagination = async (
    req,
    res,
    modelName,
    populate,
    filter,
    select,
    countFilter
) => {
    try {
        const Model = mongoose.connection.models[modelName];

        let { page, limit, sort_by, sort_dir, search_by, search_val } =
            req.query;

        let resp;

        if (search_by && search_val) {
            filter = {
                ...filter,
                [search_by]: { $regex: new RegExp(search_val, 'i') },
            };
        }

        let sort = {};

        if (
            sort_by &&
            sort_dir &&
            (sort_dir.toLowerCase() == 'asc' ||
                sort_dir.toLowerCase() == 'desc')
        ) {
            sort = { [sort_by]: sort_dir.toLowerCase() == 'asc' ? 1 : -1 };
        }

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        console.log(filter);

        resp = await Model.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select(select ?? '-password')
            .populate(populate ?? '')
            .lean();

        const totalData = await Model.countDocuments(countFilter ?? {});
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
