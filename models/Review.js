const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide review title"],
      maxLength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide review comment"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

// below the way where user can add only one review per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// creating the static  for schema
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  // product and $rating is proerty of Review model 
  // averageRating and numOfReviews is property of Product Model
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averagRating: {
          $avg: "$rating",
        },
        numOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);
  console.log(result);
  // update the Product model propertis averageRating and numOfReviews
  // if avergaeRating and numOfReviews is present then only we will set them else the will be set as zero
  try{
    await this.model('Product').findOneAndUpdate(
      {_id:productId},
      {
        averageRating:Math.ceil(result[0]?.averagRating || 0),
        numOfReviews:result[0]?.numOfReviews || 0 ,
      }
    )
  }
  catch(e){
    console.log(e);
  }
};

ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("Review", ReviewSchema);
