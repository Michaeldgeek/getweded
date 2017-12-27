// rememner to write codes for the initialization of the checklist tables and adding to the reminder table
// when a new checklist is created
var express = require('express');
var config = require('./config');
var connection = require('./db');
var compression = require('compression');
var Util = require('./util');
var minify = require('express-minify');
var redirect = require('express-simple-redirect');
var bodyParser = require('body-parser');
var port = process.env.PORT || config.PORT;
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var redirect = require('express-simple-redirect');
var checkMobile = require('connect-mobile-detection');
var Jusibe = require('jusibe');
var util = require('util');
var moment = require('moment-timezone');
var session = require('express-session');
var LokiStore = require('connect-loki')(session);
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(256);
var jusibe = new Jusibe("08d3f2931fc4e993f0bd3f79e381e23f", "9b5631452bdad9c0741400801cd70e5c");

app.use(compression());
/**
 * Dont minify already minified files
 */
app.use(session({
    store: new LokiStore({ ttl: 0 }),
    resave: true,
    saveUninitialized: true,
    secret: 'keyboard cat'
}));

app.use(bodyParser.json());

app.use(function(req, res, next) {
    if (/\.min\.(css|js)$/.test(req.url)) {
        res.minifyOptions = res.minifyOptions || {};
        res.minifyOptions.minify = false;
    }
    if (req.url.includes("/user/")) {
        if (util.isNullOrUndefined(req.session.user)) {
            if (req.method == "GET") {
                res.redirect('/');
                return;
            } else {
                res.send({ error: "Session expired. Login again" });
                return;
            }
        } else {
            Util.verifyToken(req.session.user, function(response) {
                if (response == false) {
                    if (req.method == "GET") {
                        res.redirect('/');
                        return;
                    } else {
                        res.send({ error: "Session expired. Login again" });
                        return;
                    }
                } else {
                    req.body.user = response.email;
                    req.body.user_name_ = response.name;
                    next();
                }
            }, connection);
        }
    } else {
        next();
    }

});
app.use(function(req, res, next) {
    next();
});

//app.use(minify()); 
app.use('/', express.static(__dirname + '/public'));
app.use(redirect({
    "/login": "/login/",
    "/register": "/register/",
    "/user/home": "/user/home/",
    "/user/checklist": "/user/checklist/",
    "/logout": "/logout/"
}, 301));
app.use(checkMobile());

app.set('view engine', 'ejs');
var jsonParser = bodyParser.json();

app.get('/', function(req, res) {
    var mobile = req.mobile;
    if (mobile) {
        res.send('Please view from a laptop');
    } else {
        res.render('home-page', { isMobile: mobile });
    }
});

app.get('/register/', function(req, res) {
    res.render('register');
});
app.get('/user/home/', function(req, res) {
    var data = {};
    data.user = req.session.user;
    data.name = req.body.user_name_;
    res.render('user-home', data);
});
app.get('/user/checklist/', function(req, res) {
    var data = {};
    data.user = req.session.user;
    data.name = req.body.user_name_;
    res.render('checklist', data);
});
app.post('/user/checklist/add/', jsonParser, function(req, res) {
    var checklist = req.body;
    checklist.dateCreated = moment().tz('Africa/Lagos').unix();
    var data = {};
    if (checklist.name.trim().length < 5) {
        data.error = "Please give this checklist a name";
    } else if (checklist.note.trim().length < 10) {
        data.error = "Write something that can help you understand this checklist.";
    }
    if (util.isNullOrUndefined(data.error)) {
        if (!util.isNullOrUndefined(checklist.reminder)) {
            checklist.reminder = moment(checklist.reminder).tz('Africa/Lagos').unix();
        }
        Util.addChecklist(connection, checklist, function(response) {
            if (!util.isNullOrUndefined(checklist.reminder)) {
                checklist.menu = Util.getViewReminderMenu();
            } else {
                checklist.menu = Util.getReminderMenu();
            }
            if (util.isObject(response)) {
                checklist.id = response.id;
                checklist.completed = "false";
                data.status = config.DONE;
                data.checklist = checklist;
            } else {
                data.error = "An unexpected error has occured";
            }
            res.send(data);
        });
    } else {
        res.send(data);
    }
});

app.post('/user/checklist/mark/', jsonParser, function(req, res) {
    var checklist = req.body;
    var data = {};
    if (!util.isNumber(checklist.id) && util.isNullOrUndefined(checklist.user)) {
        data.error = "Token missing in request.";
    }
    if (util.isNullOrUndefined(data.error)) {
        checklist.id = parseInt(checklist.id);
        checklist.reminder = null;
        Util.markCheckList(connection, checklist, function(response) {
            if (util.isObject(response)) {
                data.status = config.DONE;
                data.checklist = checklist;
                data.menu = Util.getDefaultMenu();
            } else {
                data.error = "An unexpected error has occured";
            }
            res.send(data);
        });
    } else {
        res.send(data);
    }
});
app.post('/user/checklist/delete/', jsonParser, function(req, res) {
    var checklist = req.body;
    var data = {};
    if (!util.isNumber(checklist.id) && util.isNullOrUndefined(checklist.user)) {
        data.error = "Token missing in request.";
    }
    if (util.isNullOrUndefined(data.error)) {
        checklist.id = parseInt(checklist.id);
        Util.deleteCheckList(connection, checklist, function(response) {
            if (util.isObject(response)) {
                data.status = config.DONE;
            } else {
                data.error = "An unexpected error has occured";
            }
            res.send(data);
        });
    } else {
        res.send(data);
    }
});

app.post('/user/checklist/edit/', jsonParser, function(req, res) {
    var checklist = req.body;
    var data = {};
    if (!util.isNumber(checklist.id) && util.isNullOrUndefined(checklist.user)) {
        data.error = "Token missing in request.";
    }
    if (checklist.name.trim().length < 5) {
        data.error = "Please give this checklist a name";
    } else if (checklist.note.trim().length < 10) {
        data.error = "Write something that can help you understand this checklist.";
    }
    if (util.isNullOrUndefined(data.error)) {
        if (util.isNullOrUndefined(data.error)) {
            checklist.id = parseInt(checklist.id);
            Util.updateCheckList(connection, checklist, function(response) {
                if (util.isObject(response)) {
                    data.status = config.DONE;
                } else {
                    data.error = "An unexpected error has occured";
                }
                res.send(data);
            });
        }
    } else {
        res.send(data);
    }
});

app.post('/user/checklist/unmark/', jsonParser, function(req, res) {
    var checklist = req.body;
    var data = {};
    if (!util.isNumber(checklist.id) && util.isNullOrUndefined(checklist.user)) {
        data.error = "Token missing in request.";
    }
    if (util.isNullOrUndefined(data.error)) {
        checklist.id = parseInt(checklist.id);
        checklist.reminder = null;
        Util.unmarkCheckList(connection, checklist, function(response) {
            if (util.isObject(response)) {
                data.status = config.DONE;
                data.menu = Util.getReminderMenu();
                data.checklist = checklist;
            } else {
                data.error = "An unexpected error has occured";
            }
            res.send(data);
        });
    } else {
        res.send(data);
    }
});

app.post('/user/checklist/setreminder/', jsonParser, function(req, res) {
    var checklist = req.body;
    var data = {};
    if (!util.isNumber(checklist.id) && (util.isNullOrUndefined(checklist.user) && util.isNullOrUndefined(checklist.reminder))) {
        data.error = "Token missing in request.";
    }

    if (util.isNullOrUndefined(data.error)) {
        checklist.id = parseInt(checklist.id);
        checklist.reminder = moment(checklist.reminder).tz('Africa/Lagos').unix();
        data.checklist = checklist;
        Util.setCheckListReminder(connection, checklist, function(response) {
            if (util.isObject(response)) {
                data.status = config.DONE;

            } else {
                data.error = "An unexpected error has occured";
            }
            res.send(data);
        });
    } else {
        res.send(data);
    }
});

app.post('/user/checklist/', jsonParser, function(req, res) {
    var user = req.body.user;
    var data = {};
    Util.fetchUserChecklist(connection, user, function(response) {
        if (!util.isNullOrUndefined(response)) {
            data.status = config.DONE;
            if (util.isBoolean(response)) {
                data.checklist = [];
            } else {
                data.checklist = response;
            }
        } else {
            data.status = "A server error has occured and we are working on it.";
        }
        res.send(data);
    });

});

app.post('/user/checklist/completed/', jsonParser, function(req, res) {
    var user = req.body.user;
    var data = {};
    if (util.isNullOrUndefined(user)) {
        data.error = "Token missing in request.";
    }
    if (util.isNullOrUndefined(data.error)) {
        Util.fetchUserChecklistCompleted(connection, user, function(response) {
            if (!util.isNullOrUndefined(response)) {
                data.status = config.DONE;
                if (util.isBoolean(response)) {
                    data.checklist = [];
                } else {
                    data.checklist = response;
                }
            } else {
                data.status = "A server error has occured and we are working on it.";
            }
            res.send(data);
        });
    } else {
        res.send(data);
    }
});

app.post('/user/checklist/uncompleted/', jsonParser, function(req, res) {
    var user = req.body.user;
    var data = {};
    if (util.isNullOrUndefined(user)) {
        data.error = "Token missing in request.";
    }
    if (util.isNullOrUndefined(data.error)) {
        Util.fetchUserChecklistUnCompleted(connection, user, function(response) {
            if (!util.isNullOrUndefined(response)) {
                data.status = config.DONE;
                if (util.isBoolean(response)) {
                    data.checklist = [];
                } else {
                    data.checklist = response;
                }
            } else {
                data.status = "A server error has occured and we are working on it.";
            }
            res.send(data);
        });
    } else {
        res.send(data);
    }
});
app.post('/send-sms-code/', jsonParser, function(req, res) {
    var phone = req.body.phone;
    Util.sendSmsCode(connection, phone, jusibe, function(response) {
        if (response.status == config.SENT) {
            res.send({ status: config.SENT });
        } else {
            res.send({ status: config.ERROR });
        }
    });
});
app.post('/verify-sms-code/', jsonParser, function(req, res) {
    var email = req.body.email;
    var code = req.body.code;
    Util.verifyCode(connection, { email: email, code: code }, function(response) {
        if (util.isObject(response)) {
            Util.updateSmsStatus(email, function(response) {
                var token = uidgen.generateSync();
                Util.issueNewToken(connection, token, email, function(response) {
                    req.session.user = token;
                    res.send({ status: config.DONE, url: "/user/home/" });
                });
            }, connection);

        } else {
            res.send({ error: "Verification code does not match" });
        }
    });
});

app.post('/logout/', jsonParser, function(req, res) {
    var data = req.body;
    req.session.user = undefined;
    Util.logout(connection, data.email, function(response) {
        res.send({ status: config.DONE, url: '/' });
    });

});


app.post('/login/', jsonParser, function(req, res) {
    var data = req.body;
    var email = data.email;
    Util.loginUser(connection, { email: data.email, password: data.password }, function(response) {
        var data = {};
        if (util.isObject(response)) {
            if (response.isPhoneVerified == config.NO) {
                data.error = config.UN_VERIFIED;
                data.phone = response.phone;
                data.email = response.email;
                Util.sendVerificationCodes(data.phone, data.email, function(response) {
                    if (util.isObject(response) && response.status == config.SENT) {
                        res.send(data);
                    }
                }, connection);
            } else {
                var token = uidgen.generateSync();
                Util.issueNewToken(connection, token, email, function(response) {
                    req.session.user = token;
                    res.send({ status: config.DONE, url: '/user/home/' });
                });

            }

        } else {
            data.error = "Invalid login details";
            res.send(data);
        }
    });

});


var jsonParser = bodyParser.json();
app.post('/verify-phone/', jsonParser, function(req, res) {
    var data = req.body;
    if (data.resend == true) {
        Util.updatePhoneNumber(data.email, data.phone, function(reponse) {
            Util.isUserVerified(data.email, function(response) {
                if (response === false) {
                    // not verified. code has not been sent before
                    Util.sendVerificationCodes(data.phone, data.email, function(response) {
                        res.send(response);
                    }, connection);
                } else {
                    var obj = {
                        error: "User already exist"
                    };
                    res.send(obj);
                }
            }, connection);
        }, connection);

    } else {
        Util.isNewUser(data.email, function(response) {
            if (response === true) {
                // new user.  save user
                Util.saveNewUser({ name: data.name, email: data.email, phone: data.phone, password: data.password, token: uidgen.generateSync() }, function(response) {
                    if (response) {
                        Util.sendVerificationCodes(data.phone, data.email, function(response) {
                            res.send(response);
                        }, connection);
                    }

                }, connection);
            } else {
                // not a new user. is phone number verified?
                Util.isUserVerified(data.email, function(response) {
                    if (response === false) {
                        // not verified. code has not been sent before
                        Util.sendVerificationCodes(data.phone, data.email, function(response) {
                            res.send(response);
                        }, connection);
                    } else {
                        var obj = {
                            error: "User already exist"
                        };
                        res.send(obj);
                    }
                }, connection);
            }
        }, connection);
    }
});
var jsonParser = bodyParser.json();
app.post('/verify-code/', jsonParser, function(req, res) {
    var code = req.body.code;
    var email = req.body.email;
    Util.isUserVerified(email, function(response) {
        if (response == false) {
            Util.getUnusedCodes(email, function(response) {
                if (code == response.code) {
                    Util.updateSmsStatus(email, function(response) {
                        if (response) {
                            var order = {};
                            var selection = req.body.order;
                            order.info = selection.info;
                            order.location = selection.userLocation;
                            order.timeOfWedding = moment(selection.time).tz('Africa/Lagos').unix();
                            order.budgetMin = req.body.min;
                            order.budget = JSON.stringify(req.body.vendors);
                            order.user = email;
                            order.time = moment().tz('Africa/Lagos').unix();
                            Util.createOrder(connection, order, function(response) {
                                if (typeof response == "undefined") {
                                    var obj = {
                                        status: "done",
                                        url: "/user/home/"
                                    };
                                    Util.getToken(email, function(token) {
                                        if (util.isBoolean(token)) {
                                            //log error;
                                        } else {
                                            req.session.user = token;
                                        }
                                        console.log(token);
                                        res.send(obj);
                                    }, connection);

                                } else {
                                    var obj = {
                                        error: "An internal error occured."
                                    };
                                    res.send(obj);
                                }

                            }, connection);

                        } else {
                            var obj = {
                                error: "Details alredy existing"
                            };
                            res.send(obj);
                        }
                    }, connection);
                } else {
                    var obj = {
                        error: "Verification code does not match"
                    };
                    res.send(obj);
                }
            }, connection);

        } else {
            var obj = {
                error: "Tis account has been blocked. Contact suport"
            };
            res.send(obj);
        }
    }, connection);
});


io.on('connection', function(socket) {
    // socket.emit('news', { hello: 'world' });
    //socket.on('my other event', function(data) {
    //  console.log(data);
    // });
});

server.listen(port)