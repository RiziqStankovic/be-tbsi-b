const bcrypt = require('bcryptjs');

const hashPassword = (password) => {
    const saltRound = 12;
    const salt = bcrypt.genSaltSync(saltRound);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
};

const comparePassword = (literal, hashed) => {
    return bcrypt.compareSync(literal, hashed);
};

module.exports = {
    hashPassword,
    comparePassword,
};
