var express = require('express');
var router = express.Router();
var userModule = require('../module/user');
var campModule = require('../module/campregistration');
var campUserModule = require('../module/camp_user');
var bloodbanksModule = require('../module/bloodbanks');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { matchedData, sanitizeBody } = require('express-validator');
const { check, validationResult } = require('express-validator');
var nodemailer = require('nodemailer');
var otpGenerator = require('otp-generator');
var getdonor = userModule.find({});
var getCamps = campModule.find({});
var getbloodbanks = bloodbanksModule.find({});
var ts = Date.now();
var date_ob = new Date(ts);
var date = date_ob.getDate();
var month = date_ob.getMonth() + 1;
var year = date_ob.getFullYear();
if (date <= 9 && month <= 9) {
    var mdate = year + "-0" + month + "-0" + date
} else if (date > 9 && month <= 9) {
    var mdate = year + "-0" + month + "-" + date;
} else if (date <= 9 && month > 9) {
    var mdate = year + "-" + month + "-0" + date;
} else {
    var mdate = year + "-" + month + "-" + date;
}

var getdonor = userModule.find({});
var getNonCheckedCamps = campModule.find({ $and: [{ date: { $gte: mdate } }, { status: 'NC' }] });
var getCamps = campModule.find({ $and: [{ date: { $gte: mdate } }, { status: 'checked' }] });

function checkLoginUser(req, res, next) {

    if (!req.session.user) {
        res.redirect('/');

    }
    next();
}

function checkEmail(req, res, next) {
    var email = req.body.email;
    var checkexistemail = userModule.findOne({ email: email });
    checkexistemail.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render('bloodbond', { title: 'Registration', msg: 'Email is already existed.', errors: '', user: '' });
        }
        next();
    });
}
router.get('/', function(req, res, next) {
    userModule.count({}, function(err, count) {
        console.log(count);
        var Count = count;
        res.render('index', { title: 'Home', msg: '', errors: '', user: '', count: Count });
    });
});
router.get('/platlet', function(req, res, next) {
    res.render('platlet', { title: 'platlet' });

});
router.get('/stemcell', function(req, res, next) {
    res.render('stemcell', { title: 'stemcell' });

});

router.post('/feedback', function(req, res, next) {
    var feedback = req.body.feedback;
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'jeevanpraday.official@gmail.com',
            pass: 'jeevanpraday5'
        }
    });

    var mailOptions = {
        from: 'jeevanpraday.official@gmail.com',
        to: 'jeevanpraday.official@gmail.com',
        subject: 'Feedaback form',
        text: feedback,
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            res.render('index', { title: 'Home', msg: ' ', errors: '', user: '', count: '' });
        }
    });
    res.render('index', { title: 'index', msg: '', errors: '', user: '', count: '' });

});

router.post('/', [
        check('lemail', '*Required').isString().isLength({ min: 1 }),
        check('lemail', '*enter email').isEmail(),
        check('lpass', '*Required').trim().isString().isLength({ min: 1 }),
    ],
    function(req, res, next) {
        var lemail = req.body.lemail;
        var lpassword = req.body.lpass;
        var loginUser = req.session.user;
        if (loginUser == lemail) {
            if (loginUser == "jeevanpraday.official@gmail.com") {
                res.redirect('/admin');
            } else {
                res.redirect('/user');

            }
        } else {
            const errors = validationResult(req);
            console.log(errors.mapped());
            if (!errors.isEmpty()) {
                const user = matchedData(req);
                res.render('index', { title: ' ', msg: '', errors: errors.mapped(), user: user, count: '' });
            } else {


                if (lemail == "jeevanpraday.official@gmail.com" && lpassword == "jeevanpraday5") {

                    // var token = jwt.sign({ userID: getUserID }, 'loginToken');
                    // localStorage.setItem('userToken', token);
                    // localStorage.setItem('loginUser', lemail);
                    req.session.user = lemail;
                    res.redirect('/admin');

                } else {

                    var checkuser = userModule.findOne({ email: lemail });
                    checkuser.exec((err, data) => {
                        console.log("data value is.......");
                        console.log(data);
                        if (data != null) {
                            if (err) throw err;

                            var getUserID = data._id;

                            if (bcrypt.compareSync(req.body.lpass, data.password)) {
                                //var token = jwt.sign({ userID: getUserID }, 'loginToken');
                                //localStorage.setItem('userToken', token);
                                //localStorage.setItem('loginUser', lemail);
                                req.session.user = lemail;
                                res.redirect('/user');
                            } else {
                                res.render('index', { title: 'Home', msg: 'Invalid Password or Username.', errors: '', user: '', count: '' });
                            }
                        } else {
                            res.render('index', { title: 'Home', msg: 'Not Registered E-mail.', errors: '', user: '', count: '' });
                        }

                    });

                }
            }
        }
    });

router.get('/user', checkLoginUser, function(req, res, next) {
    //var loginUser = localStorage.getItem('loginUser');

    res.render('user', { title: 'UserAccount', loginUser: req.session.user, msg: '' });


});

router.get('/camp', checkLoginUser, function(req, res, next) {

    var loginUser = req.session.user;
    var perPage = 10;
    var page = 1;
    getCamps.skip((perPage * page) - perPage)
        .limit(perPage).sort({ date: 1 }).exec(function(err, data) {
            if (err) throw err;
            campModule.countDocuments({}).exec((err, count) => {
                res.render('camp', {
                    title: 'camp',
                    loginUser: loginUser,
                    msg: '',
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            });
        });
});
router.get('/camp/:page', checkLoginUser, function(req, res, next) {

    var loginUser = req.session.user;
    var perPage = 10;
    var page = req.params.page || 1;
    getCamps.skip((perPage * page) - perPage)
        .limit(perPage).sort({ date: 1 }).exec(function(err, data) {
            if (err) throw err;
            campModule.countDocuments({}).exec((err, count) => {
                res.render('camp', {
                    title: 'camp',
                    loginUser: loginUser,
                    msg: '',
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            });
        });
});





router.post('/camp', checkLoginUser, function(req, res, next) {
    // var loginUser = localStorage.getItem('loginUser');

    var perPage = 10;
    var page = req.params.page || 1;

    var dist = req.body.dist.toLowerCase();
    if (dist != '') {
        var campparameter = { district: dist }

    } else {
        getCamps.skip((perPage * page) - perPage)
            .limit(perPage).sort({ date: 1 }).exec(function(err, data) {
                if (err) throw err;
                campModule.countDocuments({}).exec((err, count) => {

                    res.render('user', {
                        title: 'camp',
                        loginUser: req.session.user,
                        msg: '',
                        records: data,
                        current: page,
                        pages: Math.ceil(count / perPage)
                    });

                });

            });
    }
    var getcampsearch = campModule.find(campparameter);

    getcampsearch.skip((perPage * page) - perPage)
        .limit(perPage).sort({ date: 1 }).exec(function(err, data) {
            if (err) throw err;
            campModule.countDocuments({}).exec((err, count) => {

                res.render("camp", {
                    title: 'Search Camps',
                    msg: '',
                    loginUser: req.session.user,
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            });

        });
});




router.post('/camp/:page', checkLoginUser, function(req, res, next) {
    //  var loginUser = localStorage.getItem('loginUser');

    var perPage = 10;
    var page = req.params.page || 1;

    var dist = req.body.dist.toLowerCase();
    if (dist != '') {
        var campparameter = { venue: dist }

    } else {
        getCamps.skip((perPage * page) - perPage)
            .limit(perPage).sort({ date: 1 }).exec(function(err, data) {
                if (err) throw err;
                campModule.countDocuments({}).exec((err, count) => {

                    res.render('user', {
                        title: 'camp',
                        loginUser: req.session.user,
                        msg: '',
                        records: data,
                        current: page,
                        pages: Math.ceil(count / perPage)
                    });

                });

            });
    }
    var getcampsearch = campModule.find(campparameter);

    getcampsearch.skip((perPage * page) - perPage)
        .limit(perPage).sort({ date: 1 }).exec(function(err, data) {
            if (err) throw err;
            campModule.countDocuments({}).exec((err, count) => {

                res.render("camp", {
                    title: 'Search Camps',
                    msg: '',
                    loginUser: req.session.user,
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            });

        });
});




router.get('/yourcamp', checkLoginUser, function(req, res, next) {
    var loginUser = req.session.user;
    var getYourCamp = campModule.find({ email: loginUser });

    var perPage = 10;

    var page = req.params.page || 1;

    getYourCamp.skip((perPage * page) - perPage)
        .limit(perPage).exec(function(err, data) {
            if (err) throw err;
            campModule.countDocuments({}).exec((err, count) => {

                res.render('yourcamp', {
                    title: 'your camp',
                    loginUser: loginUser,
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            });
        });
});


router.get('/yourcamp/:page', checkLoginUser, function(req, res, next) {
    var loginUser = req.session.user;
    var getYourCamp = campModule.find({ email: loginUser });

    var perPage = 10;

    var page = req.params.page || 1;

    getYourCamp.skip((perPage * page) - perPage)
        .limit(perPage).exec(function(err, data) {
            if (err) throw err;
            campModule.countDocuments({}).exec((err, count) => {

                res.render('yourcamp', {
                    title: 'your camp',
                    loginUser: loginUser,
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            });
        });
});


router.get('/aboutcamps', function(req, res, next) {
    //var loginUser=localStorage.getItem('loginUser');

    var perPage = 10;

    var page = req.params.page || 1;

    getCamps.skip((perPage * page) - perPage)
        .limit(perPage).sort({ date: 1 }).exec(function(err, data) {
            if (err) throw err;
            campModule.countDocuments({}).exec((err, count) => {

                res.render('aboutcamps', {
                    title: 'Registration',
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            });

        });
});



router.get('/aboutcamps/:page', function(req, res, next) {
    //var loginUser=localStorage.getItem('loginUser');

    var perPage = 10;

    var page = req.params.page || 1;

    getCamps.skip((perPage * page) - perPage)
        .limit(perPage).sort({ date: 1 }).exec(function(err, data) {
            if (err) throw err;
            campModule.countDocuments({}).exec((err, count) => {

                res.render('aboutcamps', {
                    title: 'Registration',
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            });

        });
});


router.post('/aboutcamps', function(req, res, next) {
    //var loginUser=localStorage.getItem('loginUser');

    var perPage = 10;

    var page = req.params.page || 1;

    var dist = req.body.dist.toLowerCase();
    if (dist != '') {
        var campparameter = { venue: dist }

    } else {

        getCamps.skip((perPage * page) - perPage)
            .limit(perPage).sort({ date: 1 }).exec(function(err, data) {
                if (err) throw err;
                campModule.countDocuments({}).exec((err, count) => {

                    res.render('aboutcamps', {
                        title: 'Registration',
                        records: data,
                        current: page,
                        pages: Math.ceil(count / perPage)
                    });
                });

            });
    }
    var getcampsearch = campModule.find(campparameter);

    getcampsearch.skip((perPage * page) - perPage)
        .limit(perPage).sort({ date: 1 }).exec(function(err, data) {
            if (err) throw err;
            campModule.countDocuments({}).exec((err, count) => {

                res.render('aboutcamps', {
                    title: 'Search Camps',
                    msg: '',
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            });

        });
});


router.get('/campregistration', checkLoginUser, function(req, res, next) {
    var loginUser = req.session.user;
    res.render('campregistration', { title: 'Registration', msg: '', errors: '', user: '', loginUser: loginUser });
});


router.post('/campregistration', [
        check('organizer', '*Required').isString().isLength({ min: 1 }),
        check('state', '*Required').isString().isLength({ min: 1 }),
        check('venue', '*Required').isString().isLength({ min: 1 }),
        check('dist', '*Required').trim().isString().isLength({ min: 1 }),
        check('date', '*Required').isString().isLength({ min: 1 }),
        check('time', '*Required').trim().isString().isLength({ min: 1 }),
        check('contact', '*Enter Valid Mobile NO.').isMobilePhone(),
        check('email', '*Enter Valid E-Mail ID').isEmail(),
        check('details', '*Required').isString(),
    ],
    function(req, res, next) {
        var loginUser = req.session.user;
        const errors = validationResult(req);
        console.log(errors.mapped());
        if (!errors.isEmpty()) {
            const user = matchedData(req);
            res.render('campregistration', { title: ' Camp registration form', msg: '', errors: errors.mapped(), user: user, loginUser: loginUser });
        } else {
            var organizer = req.body.organizer;
            var venue = req.body.venue;
            var dist = req.body.dist.toLowerCase();
            var state = req.body.state;
            var date = req.body.date;
            var time = req.body.time;
            var contact = req.body.contact;
            var email = req.body.email;
            var details = req.body.details;
            var campDetails = new campModule({
                organizer: organizer,
                district: dist,
                state: state,
                venue: venue,
                date: date,
                time: time,
                contact: contact,
                email: email,
                status: "NC",
                details: details,
            });
            campDetails.save((err, doc) => {
                if (err) throw err;
                res.redirect('/user');
                //  res.render('campregistration', { title: 'Registration',msg:'CAMP REGISTERD SUCCESSFULLY' });
            });
        }
    });

router.get('/bloodbond', function(req, res, next) {
    var loginUser = req.session.user;
    if (loginUser) {
        res.redirect('/user');
    } else {

        res.render('bloodbond', { title: 'Registration', msg: '', errors: '', user: '' });

    }
});


router.post('/bloodbond', checkEmail, [

    check('fullname', '*Enter Your Name').isString().isLength({ min: 1 }),
    check('bloodgroup', '*Select Bloodgroup').isUppercase(),
    check('country', '*Select Country').isString().isLength({ min: 1 }),
    check('state', '*Enter your State').trim().isString().isLength({ min: 1 }),
    check('dist', '*Enter Your District').trim().isString().isLength({ min: 1 }),
    check('city', '*Enter your City').trim().isString().isLength({ min: 1 }),
    check('email', '*Enter Valid E-Mail ID').isEmail(),
    check('mno', '*Enter Valid Mobile NO.').isMobilePhone(),
    check('pass', '*Password must be of 5 to 12 Characters').trim().isLength({ min: 5, max: 12 }),
    check('cpass').custom((value, { req }) => {
        if (value != req.body.pass) {
            throw new Error('*Confirm password does not match Password');
        }
        return true;
    })

], function(req, res, next) {

    const errors = validationResult(req);
    console.log(errors.mapped());
    if (!errors.isEmpty()) {
        const user = matchedData(req);
        res.render('bloodbond', { title: ' user registration form', msg: '', errors: errors.mapped(), user: user });
    } else {

        var fullname = req.body.fullname;
        var bloodgroup = req.body.bloodgroup;
        var country = req.body.country;
        var state = req.body.state;
        var dist = req.body.dist.toLowerCase();
        var city = req.body.city;
        var email = req.body.email;
        var mobileno = req.body.mno;
        var password = req.body.pass;
        var cpass = req.body.pass;
        password = bcrypt.hashSync(req.body.pass, 10);
        var userDetails = new userModule({
            fullname: fullname,
            bloodgroup: bloodgroup,
            country: country,
            state: state,
            district: dist,
            city: city,
            email: email,
            mobileno: mobileno,
            password: password,
            cpass: cpass,

        });
        userDetails.save((err, doc) => {
            if (err) throw err;
            res.render('index', { title: 'home', msg: '', errors: '', user: '', count: '' });
        });
    }
});

router.get('/logout', function(req, res, next) {
    req.session.destroy(function(err) {
        if (err) {
            res.redirect('/');
        }
        res.redirect('/');
    });
});


router.get('/search', function(req, res, next) {
    getdonor.exec(function(err, data) {
        if (err) throw err;
        res.render('search', { title: 'search result', msg: '', records: data, details: '' });
    });
});


router.post('/search', function(req, res, next) {
    var Sname = req.body.firstname;
    var Contact = req.body.contact;
    var bloodgroup1 = req.body.bloodgroup;
    var location1 = req.body.location.toLowerCase();
    var searcher = {
        sname: Sname,
        contact: Contact,
        location: location1,
        bloodgroup: bloodgroup1
    }

    if (bloodgroup1 != '' && location1 != '') {
        var searchparameter = {
            $and: [{ bloodgroup: bloodgroup1 }, { district: location1 }]

        }
    } else if (bloodgroup1 == '' && location1 != '') {
        var searchparameter = { district: location1 }

    } else if (bloodgroup1 != '' && location1 == '') {
        var searchparameter = { bloodgroup: bloodgroup1 }

    } else if (bloodgroup1 == '' && location1 == '') {
        var searchparameter = {}
    }
    var getdonorsearch = userModule.find(searchparameter);

    getdonorsearch.exec(function(err, data) {
        if (err) throw err;
        res.render('search', { title: 'Search Result', msg: '', records: data, details: searcher });

    });


});




router.get('/profile_update', checkLoginUser, function(req, res, next) {
    var loginUser = req.session.user;
    var checkUser = userModule.findOne({ email: loginUser });
    checkUser.exec(function(err, data) {
        if (err) throw err;
        res.render('profile_update', { title: "update profile", loginUser: loginUser, msg: '', records: data, });

    });
});



router.post('/update', function(req, res, next) {

    var update = userModule.findByIdAndUpdate(req.body.id, {
        fullname: req.body.fullname,
        bloodgroup: req.body.bloodgroup,
        country: req.body.country,
        state: req.body.state,
        district: req.body.dist.toLowerCase(),
        city: req.body.city,
        email: req.body.email,
        mobileno: req.body.mno,

    });
    update.exec(function(err, data) {
        if (err) throw err;
        res.redirect('/user');
    });

});

router.post('/registrations/:campdate', checkLoginUser, function(req, res, next) {
    var loginUser = req.session.user;
    var campdate = req.params.campdate
    var email = ":" + loginUser

    console.log(email);
    var checkCamp = campUserModule.find({ $and: [{ campemail: email }, { campdate: campdate }] });
    checkCamp.exec(function(err, data) {
        if (err) throw err;
        console.log(data);
        res.render('registrations', { title: "registrations of camp", loginUser: loginUser, msg: '', records: data });
    });
});


router.post('/regForCamp/:campmail&:campdate', checkLoginUser, function(req, res, next) {
    var loginUser = req.session.user;
    var campmail = req.params.campmail
    var campdate = req.params.campdate
    var checkUser = userModule.findOne({ email: loginUser });
    checkUser.exec(function(err, data) {
        if (err) throw err;
        res.render('regForCamp', { title: "register for camp", loginUser: loginUser, msg: '', records: data, campmail: campmail, campdate: campdate });
    });
});

router.post('/campregi', function(req, res, next) {
    var campemail = req.body.campmail;
    var campdate = req.body.campdate;
    var fullname = req.body.fullname;
    var bloodgroup = req.body.bloodgroup;
    var country = req.body.country;
    var state = req.body.state;
    var dist = req.body.dist;
    var city = req.body.city;
    var useremail = req.body.useremail;
    var mobileno = req.body.mno;
    var lastdate = req.body.lastdate;
    var campuserDetails = new campUserModule({
        campemail: campemail,
        campdate: campdate,
        fullname: fullname,
        bloodgroup: bloodgroup,
        country: country,
        state: state,
        district: dist,
        city: city,
        useremail: useremail,
        mobileno: mobileno,
        lastdonationdate: lastdate,
    });
    console.log(campuserDetails);
    campuserDetails.save((err, doc) => {
        if (err) throw err;
        res.redirect('/user');
    });
});



router.get('/admin', checkLoginUser, function(req, res, next) {
    res.render('admin', { title: 'Admin', msg: '', errors: '', user: '' });

});


router.post('/admin', [
        check('bname', '*Required').isString().isLength({ min: 1 }),
        check('bdist', '*Required').isString().isLength({ min: 1 }),
        check('bcity', '*Required').trim().isString().isLength({ min: 1 }),
        check('bcontact', '*Enter Valid Mobile NO.').isNumeric({ min: 10, max: 13 }),
        check('bdetails', '*Required').trim().isString(),
    ],
    function(req, res, next) {
        const errors = validationResult(req);
        console.log(errors.mapped());
        if (!errors.isEmpty()) {
            const user = matchedData(req);
            res.render('admin', { title: ' Blood Banks registration form', msg: '', errors: errors.mapped(), user: user });
        } else {
            var bcordinate = req.body.bcordinate;
            var bname = req.body.bname;
            var bdist = req.body.bdist.toLowerCase();
            var bcity = req.body.bcity;
            var bcontact = req.body.bcontact;
            var bdetails = req.body.bdetails;
            var bloodbanksDetails = new bloodbanksModule({
                bcordinate: bcordinate,
                bname: bname,
                bdist: bdist,
                bcity: bcity,
                bcontact: bcontact,
                bdetails: bdetails,
            });
            bloodbanksDetails.save((err, doc) => {
                if (err) throw err;
                res.redirect('/admin');
            });
        }
    });


router.get('/linkedwith', function(req, res, next) {


    var perPage = 10;

    var page = req.params.page || 1;


    getbloodbanks.skip((perPage * page) - perPage)
        .limit(perPage).exec(function(err, data) {
            if (err) throw err;
            bloodbanksModule.countDocuments({}).exec((err, count) => {

                res.render('linkedwith', {
                    title: 'Linked with',
                    msg: '',
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            });

        });
});


router.get('/linkedwith/:page', function(req, res, next) {


    var perPage = 10;

    var page = req.params.page || 1;
    getbloodbanks.skip((perPage * page) - perPage)
        .limit(perPage).exec(function(err, data) {
            if (err) throw err;
            bloodbanksModule.countDocuments({}).exec((err, count) => {

                res.render('linkedwith', {
                    title: 'Linked with',
                    msg: '',
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            });

        });
});

router.post('/linkedwith', function(req, res, next) {
    //var loginUser=localStorage.getItem('loginUser');

    var perPage = 10;

    var page = req.params.page || 1;

    var dist = req.body.dist.toLowerCase();
    if (dist != '') {
        var campparameter = { bdist: dist }

    } else {
        getbloodbanks.skip((perPage * page) - perPage)
            .limit(perPage).exec(function(err, data) {
                if (err) throw err;
                bloodbanksModule.countDocuments({}).exec((err, count) => {

                    res.render('linkedwith', {
                        title: 'Bloodbanks',
                        records: data,
                        current: page,
                        pages: Math.ceil(count / perPage)
                    });
                });

            });
    }
    var getbanksearch = bloodbanksModule.find(campparameter);

    getbanksearch.skip((perPage * page) - perPage)
        .limit(perPage).exec(function(err, data) {
            if (err) throw err;
            bloodbanksModule.countDocuments({}).exec((err, count) => {

                res.render('linkedwith', {
                    title: 'Search bloodbanks',
                    msg: '',
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });
            });

        });
});


router.post('/linkedwith/:page', function(req, res, next) {
    //var loginUser=localStorage.getItem('loginUser');

    var perPage = 10;

    var page = req.params.page || 1;

    var dist = req.body.dist.toLowerCase();
    if (dist != '') {
        var campparameter = { bdist: dist }

    } else {
        getbloodbanks.skip((perPage * page) - perPage)
            .limit(perPage).exec(function(err, data) {
                if (err) throw err;
                bloodbanksModule.countDocuments({}).exec((err, count) => {

                    res.render('linkedwith', {
                        title: 'Bloodbanks',
                        records: data,
                        current: page,
                        pages: Math.ceil(count / perPage)
                    });
                });

            });
    }
    var getbanksearch = bloodbanksModule.find(campparameter);

    getbanksearch.skip((perPage * page) - perPage)
        .limit(perPage).exec(function(err, data) {
            if (err) throw err;
            bloodbanksModule.countDocuments({}).exec((err, count) => {

                res.render('linkedwith', {
                    title: 'Search bloodbanks',
                    msg: '',
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });
            });

        });
});

router.get('/alldonors', function(req, res, next) {
    //var loginUser=localStorage.getItem('loginUser');


    var perPage = 10;

    var page = req.params.page || 1;

    getdonor.skip((perPage * page) - perPage)
        .limit(perPage).exec(function(err, data) {
            if (err) throw err;
            userModule.countDocuments({}).exec((err, count) => {

                res.render('alldonors', {
                    title: 'All Donors List',
                    msg: '',
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            });

        });
});

router.get('/alldonors/:page', function(req, res, next) {
    //var loginUser=localStorage.getItem('loginUser');


    var perPage = 10;
    var page = req.params.page || 1;


    getdonor.skip((perPage * page) - perPage)
        .limit(perPage).exec(function(err, data) {
            if (err) throw err;
            userModule.countDocuments({}).exec((err, count) => {

                res.render('alldonors', {
                    title: 'All Donors List',
                    msg: '',
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            });

        });
});
router.get('/delete/:id', function(req, res, next) {
    var id = req.params.id;
    var del = campModule.findByIdAndDelete(id);
    del.exec(function(err, data) {
        if (err) throw err;
        res.redirect('/showvalidcamps');
    });
});

router.get('/edit/:id', function(req, res, next) {
    var id = req.params.id;
    var update = campModule.update({ _id: id }, {

        $set: { status: "checked" }
    });

    update.exec(function(err, data) {
        if (err) throw err;
        res.redirect('/showvalidcamps');
    });

});
router.get('/showvalidcamps', function(req, res, next) {


    var perPage = 10;
    var page = req.params.page || 1;

    getNonCheckedCamps.skip((perPage * page) - perPage)
        .limit(perPage).exec(function(err, data) {
            campModule.countDocuments({}).exec((err, count) => {

                if (err) throw err;
                res.render('showvalidcamps', {
                    title: 'Registration',
                    msg: '',
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            });

        });
});


router.get('/showvalidcamps/:page', function(req, res, next) {


    var perPage = 10;
    var page = req.params.page || 1;

    getNonCheckedCamps.skip((perPage * page) - perPage)
        .limit(perPage).exec(function(err, data) {
            campModule.countDocuments({}).exec((err, count) => {

                if (err) throw err;
                res.render('showvalidcamps', {
                    title: 'Registration',
                    msg: '',
                    records: data,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            });

        });
});



router.get('/forgotpass', function(req, res, next) {
    res.render('forgotpass', { title: "forgot", msg: '', otp: '', E_mail: '' });

});

router.post("/forgot", function(req, res, next) {
    var fmail = req.body.Fmail;
    var forgotpassemail = userModule.find({ email: fmail });
    forgotpassemail.exec((err, data) => {
        if (err) throw err;
        if (data != '') {
            console.log(data);
            var OTP = otpGenerator.generate(6, { upperCase: false, specialChars: false });

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'jeevanpraday.official@gmail.com',
                    pass: 'jeevanpraday5'
                }
            });

            var mailOptions = {
                from: 'jeevanpraday.official@gmail.com',
                to: fmail,
                subject: 'OTP for forgot Password',
                text: 'JEEVANPRDAY.com..... otp for your forgot password request on this account  is   ' + OTP + '   PLEASE do not share it with anyone',

            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    res.render('forgotpass', { title: 'forgot', msg: 'OTP send Successfully on email', otp: OTP, E_mail: fmail });
                }
            });
        } else {
            res.render('forgotpass', { title: 'forgot', msg: 'E-mail not registered', otp: '', E_mail: '' });
        }
    });
});




router.post('/password', function(req, res, next) {
    var otpenter = req.body.otpenter;
    var otpreal = req.body.otp;
    var E_mail = req.body.email;
    console.log(otpenter);
    console.log(otpreal);
    console.log(E_mail);
    if (otpenter != otpreal || E_mail == '') {
        return res.render('forgotpass', { title: 'forgot', msg: 'OTP not matched... send Otp Request Again', otp: '', E_mail: '' });
    } else {
        res.render('password', { title: 'Reset password', msg: ' ', E_mail: E_mail });
    }
});



router.post('/reset', function(req, res) {
    var email = req.body.email;
    var pass = req.body.pass;
    var cpass = req.body.cpass;
    if (pass != cpass) {
        res.render('password', { title: 'Reset password', msg: 'Confirm password not matched', E_mail: email });
    } else {
        password = bcrypt.hashSync(req.body.pass, 10);
        var reset = userModule.update({ email: email }, { $set: { password: password } });
        reset.exec(function(err, data) {
            if (err) throw err;
            res.render('forgotpass', { title: 'forgot', msg: 'password changed successfully', otp: '', E_mail: '' });
        });
    }
});



module.exports = router;