const mongoose = require('mongoose');
const { responseData, responseOnly } = require('./httpResponse');
const pagination = require('./pagination');

const save = async (res, modelName, data) => {
    try {
        const Model = mongoose.connection.models[modelName];

        await Model.create(data);

        return responseOnly(res, 201, 'Data has been created');
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }
};

const get = async (
    req,
    res,
    modelName,
    populate,
    filter,
    select,
    countFilter
) => {
    if (req.query.use_paginate) {
        return await pagination(
            req,
            res,
            modelName,
            populate,
            filter,
            select,
            countFilter
        );
    }

    try {
        const Model = mongoose.connection.models[modelName];

        const getall = await Model.find(filter ?? {})
            .select(select ?? '-password')
            .populate(populate ?? '')
            .lean();

        const message =
            getall.length > 0
                ? 'Data ditemukan.'
                : 'Tidak ada data yang tersedia.';

        return responseData(res, 200, getall, message);
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }
};

const show = async (
    res,
    modelName,
    findbyField,
    findbyValue,
    populate,
    select
) => {
    try {
        const Model = mongoose.connection.models[modelName];

        const getone = await Model.findOne({
            [findbyField]: findbyValue,
        })
            .select(select ?? '-password')
            .populate(populate ?? '')
            .lean();

        return responseData(res, 200, getone, 'Data found.');
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }
};

const update = async (res, modelName, data, id) => {
    try {
        const Model = mongoose.connection.models[modelName];

        await Model.findByIdAndUpdate(id, { ...data });

        return responseOnly(res, 200, 'Data has been updated.');
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }
};

const remove = async (res, modelName, id) => {
    try {
        const Model = mongoose.connection.models[modelName];

        await Model.findByIdAndDelete(id);

        return responseOnly(res, 200, 'Data has been removed.');
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }
};

module.exports = {
    save,
    get,
    show,
    update,
    remove,
};
