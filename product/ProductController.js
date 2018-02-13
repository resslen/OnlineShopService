var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const val = require('express-validator/check');
const check = val.check;
const validationResult = val.validationResult;
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var Product = require('./product');
var VerifyToken = require('../auth/VerifyToken');
const validators = [
    check('productName')
        .isLength({min: 3, max: 100})
        .trim(),
    check('productCode')
        .isLength({min: 3, max: 30})
        .trim(),
    check('releaseDate')
        .exists(),
    check('price')
        .toFloat(),
    check('description')
        .isLength({min: 3, max: 10000})
        .trim(),
    check('starRating')
        .toInt(),
    check('imageUrl')
        .trim()
        .isURL(),
    check('amount')
        .toInt()
];

// CREATES A NEW PRODUCT
router.post('/', [ VerifyToken, validators ], function (req, res, next) {
    if(!req.isAdmin){
        return res.status(403).send("Forbidden");
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const mapped = errors.mapped();
        console.log(mapped);
        return res.status(400).send("Bad request");
    }

    Product.create({
            productName: req.body.productName,
            productCode: req.body.productCode,
            releaseDate: req.body.releaseDate,
            price: req.body.price,
            description: req.body.description,
            starRating: req.body.starRating,
            imageUrl: req.body.imageUrl,
            amount: req.body.amount
        },
        function (err, product) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(product);
        });
});

// RETURNS ALL THE PRODUCTS IN THE DATABASE
router.get('/', function (req, res) {

    Product.find({}, function (err, products) {
        if (err) return res.status(500).send("There was a problem finding the products.");
        res.status(200).send(products);
    });
});

// GETS A PRODUCT USER FROM THE DATABASE
router.get('/:id', VerifyToken, function (req, res, next) {

    Product.findById(req.params.id, function (err, product) {
        if (err) return res.status(500).send("There was a problem finding the product.");
        if (!product) return res.status(404).send("No product found.");
        res.status(200).send(product);
    });
});

// DELETES A PRODUCT FROM THE DATABASE
router.delete('/:id', VerifyToken, function (req, res, next) {
    if(!req.isAdmin){
        return res.status(403).send("Forbidden");
    }
    Product.findByIdAndRemove(req.params.id, function (err, product) {
        if (err) return res.status(500).send("There was a problem deleting the product.");
        res.status(200).send("{}");
    });
});

// UPDATES A SINGLE PRODUCT IN THE DATABASE
router.put('/:id', [ VerifyToken, validators], function (req, res, next) {
    if(!req.isAdmin){
        return res.status(403).send("Forbidden");
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const mapped = errors.mapped();
        console.log(mapped);
        return res.status(400).send("Bad request");
    }
    Product.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, product) {
        if (err) return res.status(500).send("There was a problem updating the product.");
        res.status(200).send(product);
    });
});

// RETURNS 6 PRODUCTS FROM THE DATABASE
router.get('/home/promoted' , function (req, res) {
    var q = Product.find({}).sort({'_id': +1}).limit(6);
    q.exec(function (err, products) {
        if (err) return res.status(500).send(err);
        res.status(200).send(products);
    });
});

// BUY ONE PRODUCT (UPDATE)
router.get('/buy/:id', VerifyToken, function (req, res, next) {
    Product.findById(req.params.id, function (err, product) {
        if (err) return res.status(500).send("There was a problem getting the product.");
        if (!product) return res.status(404).send("No product found.");
        product.amount--;
        Product.findByIdAndUpdate(req.params.id, product, {new: true}, function (err, product2) {
            if (err) return res.status(500).send("There was a problem updating the product.");
            res.status(200).send(product2);
        });
    });
});
module.exports = router;