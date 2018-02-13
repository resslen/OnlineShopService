var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const val = require('express-validator/check');
const check = val.check;
const validationResult = val.validationResult;
var User = require('../user/user');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');
var VerifyToken = require('./VerifyToken');

const validators = [
    check('email')
        .exists()
        .trim(),
    check('username')
        .isLength({min: 3, max: 20}),
    check('password')
        .isLength({min: 6, max: 60})
];

router.post('/register', validators, function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const mapped = errors.mapped();
        console.log(mapped);
        return res.status(400).send("Bad request");
    }

    var hashedPassword = bcrypt.hashSync(req.body.password, 8);

    User.create({
            email : req.body.email,
            username : req.body.username,
            password : hashedPassword,
            admin : false,
        },
        function (err, user) {
            if (err) return res.status(500).send("There was a problem registering the user.")

            // create a token
            var token = jwt.sign({ id: user._id, admin: user.admin }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
            });

            res.status(200).send({ auth: true, token: token });
        });
});

router.get('/me', VerifyToken, function(req, res, next) {

    User.findById(req.verId, { password: 0, admin: 0 }, function (err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");

        res.status(200).send(user);
    });

});
//LOGIN
router.post('/login', function(req, res) {

    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

        var token = jwt.sign({ id: user._id, admin: user.admin }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).send({ auth: true, token: token });
    });
});

router.get('/logout', function(req, res) {
    res.status(200).send({ auth: false, token: null });
});

module.exports = router;