const form = require('express-form');
const isValid = require('mongoose').Types.ObjectId.isValid;

module.exports = form(
  form.field('page').required().toInt().isInt('Invalid pagination params'),
  form.field('limit').required().toInt().isInt('Invalid pagination params'),
  form.field('sortOrder').is(/^(asc|desc)+$/, '%s is not valid, Only asc or desc for sorting param'),
  form.field('searchStr').trim(),
  form.field('gameTimeFilter').isInt('Invalid filter time format'),
  form.field('gameIdFilter').isAlphanumeric(),
  form.field('txIdFilter').isAlphanumeric(),
  form.field('txTypeFilter').isAlpha(),
  form.validate('id').custom((id, source, cb) => {

    if (id && !isValid(id)) return cb('Invalid id');

    cb();
  })
);
