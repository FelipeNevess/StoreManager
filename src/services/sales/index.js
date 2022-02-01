const models = require('../../models/sales/index');
const modelsProduct = require('../../models/products/index');

const ferifyingProductAround = async (id) => {
  const result = await modelsProduct.getById(id);

  return result;
};

const salesProduct = async (array) => Promise.all(
  array.map(async (item) => {
    const [result] = await ferifyingProductAround(item.product_id);

    return result;
  }),
);

const create = async (array) => {
  const response = await salesProduct(array);
  const filteredItemId = response.some((item) => item === undefined);

  if (filteredItemId) {
    return { code: 404, message: 'Product_id not found' };
  }

  const rep = await models.verifyProducts(array);

  const filteredItemQuantity = rep
    .some((arr, i) => arr
      .some(({ quantity }) => array[i].quantity > quantity));

  if (filteredItemQuantity) {
    return { code: 422, message: 'Such amount is not permitted to sell' };
  }

  const result = await models.create(array);

  await models.update(result);

  return result;
};

const getAll = async () => {
  const result = await models.getAll();

  return result;
};

const getById = async (id) => {
  const result = await models.getById(id);

  if (result.length === 0) {
    return { code: 404, message: 'Sale not found' };
  }

  return result;
};

module.exports = {
  create,
  getAll,
  getById,
};