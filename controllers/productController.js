const Product = require('../models/Product');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');


const createProduct = async(req,res)=>{
    // just attaching  the user to req.body;
    // to know which user has created which product
    // the (user) name should be same which we are attaching to req.body because in product modle we have used user 
    req.body.user = req.user.userId;

    const product = await Product.create(req.body)

    res.status(StatusCodes.CREATED).json({product});

}

const getAllProducts = async(req,res)=>{
    const products = await Product.find({}).populate('reviews');
    res.status(StatusCodes.OK).json({products,count:products.length});
}

const getSingleProduct = async(req,res)=>{

    const {id:productId}=req.params;
    
    // here we will get product with all the review
    const product = await Product.findOne({_id:productId}).populate('reviews');

    if(!product){
        throw new CustomError.NotFoundError(`No product with id:${productId}`);
    }

    res.status(StatusCodes.OK).json({product});

}

const updateProduct = async(req,res)=>{

    const {id:productId}=req.params;

    const product = await Product.findByIdAndUpdate({_id:productId},req.body,{
        new:true,
        runValidators:true,
    });

    if(!product){
        throw new CustomError.NotFoundError(`No product with id:${productId}`);
    }

    res.status(StatusCodes.OK).json({product});
}

const deleteProduct = async(req,res)=>{

    const {id:productId}=req.params;

    const product = await Product.findOne({_id:productId});

    if(!product){
        throw new CustomError.NotFoundError(`No product with id:${productId}`);
    }

    // this will trigger the hook i.e ProductScheme.pre
    await product.remove();

    res.status(StatusCodes.OK).json({msg:"Successfully! Product Removed"});
}

const uploadImage = async(req,res)=>{
    // console.log(req.files)

    if(!req.files){
        throw new CustomError.BadRequestError('No file Uploaded');
    }

    const productImage =  req.files.image ;

    if(!productImage.mimetype.startsWith('image')){
        throw new CustomError.BadRequestError('No  Upload image');
    }

    const maxSize = 1024 * 1024 ;

    if(productImage.size > maxSize){ 

        throw new CustomError.BadRequestError('Please upload smaller than 1MB');
    }

    const imagePath = path.join(__dirname,'../public/uploads/'+`${productImage.name}`);

    await productImage.mv(imagePath);

    res.status(StatusCodes.OK).json({image:`uploads/${productImage.name}`});
}

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
};
