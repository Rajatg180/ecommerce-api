const express = require("express");
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controllers/productController");

const {getSingleProductReviews} = require('../controllers/reviewController');

// only admin can create the product
// getAllProducts is accessible to public
router
  .route("/")
  .post([authenticateUser, authorizePermissions("admin")], createProduct)
  .get(getAllProducts);

// only admin can upload the image
router.route('/uploadImage').post([authenticateUser, authorizePermissions("admin")], uploadImage);

// only admin can update/delete the product
// getSingleProduct is accessible to public
router
  .route("/:id")
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermissions("admin")], updateProduct)
  .delete([authenticateUser, authorizePermissions("admin")], deleteProduct);

// all can access the reviews
router.route('/:id/reviews').get(getSingleProductReviews);

module.exports = router;