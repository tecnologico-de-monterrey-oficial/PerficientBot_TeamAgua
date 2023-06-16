const dateAndHour = require('../functions/imports');

const dateTime = async(req, res) => {
    res.send({response: dateAndHour.getCurrentDateAndHour()});
}

module.exports = dateTime;