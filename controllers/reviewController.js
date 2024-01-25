const { checkPermissions } = require("../utils");
const Review = require("../models/Review.js");
const Product = require("../models/Product.js");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const createReview = async (req, res) => {
  const { product: productId } = req.body;

  // is product present check it before
  const isValidProduct = await Product.findOne({ _id: productId });

  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No product with id :${productId}`);
  }

  // each user can give only one review so

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      "Already submitted review for this product"
    );
  }

  // attaching userId to the req.body
  req.body.user = req.user.userId;

  const review = await Review.create(req.body);

  res.status(StatusCodes.CREATED).json({ review });
  
};

const getAllReviews = async (req, res) => {
  // populate method is used to get details about the reference here we are refering to product and user so we can get more details about product and user
  // product and user is not schema names it is property of review schema

  const reviews = await Review.find({})
    .populate({ path: "product", select: "name price company" })
    .populate({ path: "user", select: "name email" });

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(
      `No review find with the id : ${reviewId}`
    );
  }

  res.status(StatusCodes.OK).json({ review: review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(
      `No review find with the id : ${reviewId}`
    );
  }

  checkPermissions(req.user, review.user);

  (review.rating = rating),
    (review.title = title),
    (review.comment = comment),
    await review.save();

  res.status(StatusCodes.OK).json({ msg: "Succeesss ! review updated" });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(
      `No review find with the id : ${reviewId}`
    );
  }

  // if user id matches the review users id then only we can delete the review
  // if the user is is admin then only he can delete the review
  checkPermissions(req.user, review.user);

  await review.remove();

  res.status(StatusCodes.OK).json({ msg: "Succeesss ! review removed" });
};

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;

  const reviews = await Review.find({ product: productId });

  res.status(StatusCodes.OK).json({ reviews, length: reviews.length });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
