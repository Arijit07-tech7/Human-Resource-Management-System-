/**
 * Pagination helper utility
 * @param {Model} model - Mongoose model
 * @param {Object} query - Filter query
 * @param {Object} options - Pagination options
 * @returns {Object} Paginated results
 */
const paginate = async (model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    populate = null,
    select = null,
  } = options;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  let queryBuilder = model.find(query).skip(skip).limit(parseInt(limit)).sort(sort);

  if (populate) queryBuilder = queryBuilder.populate(populate);
  if (select) queryBuilder = queryBuilder.select(select);

  const [results, total] = await Promise.all([
    queryBuilder.exec(),
    model.countDocuments(query),
  ]);

  return {
    results,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
    hasPrev: parseInt(page) > 1,
  };
};

module.exports = paginate;
