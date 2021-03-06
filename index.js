// rememner to write codes for the initialization of the checklist tables and adding to the reminder table
// when a new checklist is created. and in production dont work with Loki.js
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
var checkMobile = require('connect-mobile-detection');
var Jusibe = require('jusibe');
var util = require('util');
var moment = require('moment-timezone');
var session = require('express-session');
var LokiStore = require('connect-loki')(session);
var cookieParser = require('cookie-parser');
var fs = require('fs');
var api_key = 'key-b3c24520d9eeb2b81482db527bab65c8';
var domain = 'sandbox11b641cb5caa45d0a47243b8b0e9b615.mailgun.org';
var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

const UIDGenerator = require('uid-generator');


const uidgen = new UIDGenerator(256);
var jusibe = new Jusibe("08d3f2931fc4e993f0bd3f79e381e23f", "9b5631452bdad9c0741400801cd70e5c");

app.use(compression());
/**
 * Dont minify already minified files
 */
//app.use(minify()); 
app.use('/', express.static(__dirname + '/public'));

app.use(redirect({
    "/login": "/login/",
    "/register": "/register/",
    "/user/home": "/user/home/",
    "/user/checklist": "/user/checklist/",
    "/user/messages": "/user/messages/",
    "/logout": "/logout/",
    "/user/profile": "/user/profile/",
    "/planner/home": "/planner/home/",
    "/planner/register": "/planner/register/"
}, 301));

app.use(cookieParser());

var Session = session({
    store: new LokiStore({ ttl: 0 }),
    resave: true,
    saveUninitialized: true,
    secret: 'keyboard cat'
});

io.use(function(socket, next) {
    Session(socket.request, socket.request.res, next);
});

app.use(Session);

app.use(bodyParser.json());

var users = [];

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
                    if (response.type == config.PLANNER) {
                        if (req.method == "GET") {
                            res.redirect('/');
                            return;
                        } else {
                            res.send({ error: "Session expired. Login again" });
                            return;
                        }
                        return;
                    }
                    req.body.user = response.email;
                    req.user_name_ = response.name;
                    var uid = response.email;
                    // req.body.uid = uid;
                    next();
                }
            }, connection);
        }
    } else if (req.url.includes("/planner/") && !req.url.includes("/planner/register/")) {
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
                    if (response.type == config.COUPLE) {
                        if (req.method == "GET") {
                            res.redirect('/');
                            return;
                        } else {
                            res.send({ error: "Session expired. Login again" });
                            return;
                        }
                        return;
                    }
                    req.body.user = response.email;
                    req.user_name_ = response.name;
                    var uid = response.email;
                    // req.body.uid = uid;
                    next();
                }
            }, connection);
        }
    } else {
        next();
    }

});
app.use(function(req, res, next) {
    if (req.url.includes("/user/") && req.method == "GET") {
        Util.getUserOrderandDetails(req.body.user, function(response) {
            if (util.isObject(response)) {
                if (response.timeOfWedding > moment().tz("Africa/Lagos").unix()) {
                    req._timeOfWedding_ = moment.unix(response.timeOfWedding).fromNow(true);
                } else {
                    req._timeOfWedding_ = false;
                }
            }
            next();
        }, connection);
    } else {
        next();
    }

});

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

app.get('/planner/register/', function(req, res) {
    res.render('planner/register');
});

app.get('/planner/home/', function(req, res) {
    var data = {};
    data.user = req.session.user;
    data.name = req.user_name_;
    res.render('planner/home', data);
});

app.get('/user/home/', function(req, res) {
    var data = {};
    data.user = req.session.user;
    data.name = req.user_name_;
    data._timeOfWedding_ = req._timeOfWedding_;
    res.render('user-home', data);
});
app.get('/user/checklist/', function(req, res) {
    var data = {};
    data.user = req.session.user;
    data.name = req.user_name_;
    data._timeOfWedding_ = req._timeOfWedding_;
    res.render('checklist', data);
});
app.get('/user/profile/', function(req, res) {
    var data = {};
    data.user = req.session.user;
    data.name = req.user_name_;
    data._timeOfWedding_ = req._timeOfWedding_;
    Util.getUserProfile(req.body.user, function(response) {
        response.time = moment.unix(response.time).format("MMMM DD, YYYY");
        data.profile = response;
        res.render('profile', data);
    }, connection);

});
app.get('/user/messages/', function(req, res) {
    var data = {};
    data.user = req.session.user;
    data.name = req.user_name_;
    data._timeOfWedding_ = req._timeOfWedding_;
    res.render('messages', data);
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
app.post('/user/profile/update-name/', jsonParser, function(req, res) {
    var user = req.body;
    var data = {};
    if (user.name < 1) {
        data.error = "Please provide your name";
    }
    if (util.isNullOrUndefined(data.error)) {
        Util.updateName(connection, user, function(response) {
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
app.post('/user/profile/update-email/', jsonParser, function(req, res) {
    var user = req.body;
    var data = {};
    if (util.isNullOrUndefined(data.error)) {
        Util.updateEmail(connection, user, function(response) {
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
app.post('/user/profile/update-phone/', jsonParser, function(req, res) {
    var user = req.body;
    var data = {};
    if (util.isNullOrUndefined(data.error)) {
        Util.updatePhone(connection, user, function(response) {
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
app.post('/user/profile/update-location/', jsonParser, function(req, res) {
    var user = req.body;
    var data = {};
    if (util.isNullOrUndefined(data.error)) {
        Util.updateLocation(connection, user, function(response) {
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
app.post('/planner/register/', jsonParser, function(req, res) {
    var data = req.body;
    Util.isNewUser(data.email, function(response) {
        var datum = {};
        if (util.isObject(response)) {
            datum.error = "Email already exist";
            res.send(datum);
        } else {
            var contents = fs.readFileSync('./email.tpl', 'utf8');
            contents = contents.replace("##name##", data.name);
            contents = contents.replace("##link##", "http://localhost:30/planner/home/");
            var obj = {
                from: 'GetWeded <no-reply@sandbox11b641cb5caa45d0a47243b8b0e9b615.mailgun.org>',
                to: data.email,
                subject: 'Email Verification',
                html: contents
            };
            mailgun.messages().send(obj, function(error, body) {
                if (error) {
                    datum.error = "Could not verify email";
                    res.send(datum);
                    return;
                }
                var token = uidgen.generateSync();
                var user = {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    password: data.password,
                    token: token,
                    type: config.PLANNER
                }
                Util.saveNewUser(user, function(response) {
                    datum.status = config.DONE;
                    datum.msg = "Please check your inbox for further instructions";
                    req.session.user = token;
                    res.send(datum);
                }, connection);

            });
        }
    }, connection);

});
app.get('/user/logout/:user_id', jsonParser, function(req, res) {
    Util.verifyToken(req.params.user_id, function(response) {
        req.session.user = undefined;
        Util.logout(connection, response.email, function(response) {
            res.redirect('/');
        });
    }, connection);

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
                Util.issueNewToken(connection, token, email, function(result) {
                    req.session.user = token;
                    var set_online = {
                        query: "update users set online='Y' where token='" + token + "'",
                        connection: connection
                    };

                    connection.query(set_online.query, function(err, result_online) {
                        if (response.type == config.PLANNER) {
                            res.send({ status: config.DONE, url: '/planner/home/' });
                            return;
                        }
                        res.send({ status: config.DONE, url: '/user/home/' });
                    });

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
                error: "This account has been blocked. Contact suport"
            };
            res.send(obj);
        }
    }, connection);
});

app.post('/user/get_msgs', function(req, res) {
    /*
        Calling 'getMsgs' to get messages
    */
    Util.getMsgs(req.body, connection, function(result) {
        res.send(result);
    });
});

/*
    post to handle get_recent_chats request
*/
app.post('/user/get_recent_chats', function(req, res) {
    /*
        Calling 'getUserChatList' to get user chat list
    */
    Util.getUsersToChat(req.body.user, connection, function(dbUsers) {
        Util.mergeUsers(users, dbUsers, 'yes', function(mergedUsers) {
            res.send(mergedUsers);
        });
    });
});

/*
    post to handle get_users_to_chats request
*/
app.post('/user/get_users_to_chats', function(req, res) {
    /*
        Calling 'getUsersToChat' to get user chat list
    */
    Util.getUsersToChat(req.body.uid, connection, function(dbUsers) {
        /*
            Calling 'mergeUsers' to merge online and offline users
        */
        Util.mergeUsers(users, dbUsers, 'yes', function(mergedUsers) {
            res.send(mergedUsers);
        });
    });
});

app.post('/user/get_userinfo', function(req, res) {
    var data = {
        query: "select `token`,`name`, `photo`,`online` from `users` where `email`='" + req.body.uid + "'"
    };
    connection.query(data.query, function(err, result) {
        if (result.length > 0) {
            var user_info = "";
            result.forEach(function(element, index, array) {
                user_info = element;
            });
            result_send = {
                is_logged: true,
                data: user_info,
                msg: "OK"
            };
        } else {
            result_send = {
                is_logged: false,
                data: null,
                msg: "BAD"
            };
        }
        res.send(result_send);
    });
});

io.on('connection', function(socket) {

    var uIdSocket = socket.request.session.uid;

    //Storing users into array as an object
    socket.on('userInfo', function(userinfo) {
        /*
            Adding Single socket user into 'uesrs' array
        */
        var should_add = true;
        if (users.length == 0) {
            userinfo.socketId = socket.id;
            users.push(userinfo);
        } else {
            users.forEach(function(element, index, array) {
                if (element.token == userinfo.token) {
                    should_add = false;
                }
            });
            if (should_add) {
                userinfo.socketId = socket.id;
                users.push(userinfo);
            };
        }

        var data = {
            query: "update users set online='Y' where token='" + userinfo.token + "'",
            connection: connection
        }
        connection.query(data.query, function(err, result) {
            /*
                Sending list of users to all users
            */
            users.forEach(function(element, index, array) {
                if (element.token == userinfo.token) {
                    users[index].online = 'Y';
                }
                Util.getUserChatList(element.id, connection, function(dbUsers) {
                    if (dbUsers === null) {
                        io.to(element.socketId).emit('userEntrance', users);
                    } else {
                        Util.mergeUsers(users, dbUsers, 'no', function(mergedUsers) {
                            io.to(element.socketId).emit('userEntrance', mergedUsers);
                        });
                    }
                });
            });
        });
        should_add = true;
    });

    /*
     'sendMsg' will save the messages into DB.
    */
    socket.on('sendMsg', function(data_server) {

        /*
            calling saveMsgs to save messages into DB.
        */
        Util.saveMsgs(data_server, moment().tz('Africa/Lagos').unix(), connection, function(result) {

            /*
                Chechking users is offline or not
            */
            if (data_server.socket_id == null) {

                /*
                    If offline update the Chat list of Sender. 
                */
                var singleUser = users.find(function(element) {
                    return element.id == data_server.from_id;
                });
                /*
                    Calling 'getUserChatList' to get user chat list
                */
                Util.getUserChatList(singleUser.id, connection, function(dbUsers) {
                    if (dbUsers === null) {
                        io.to(singleUser.socketId).emit('userEntrance', users);
                    } else {
                        /*
                            Calling 'mergeUsers' to merge online and offline users
                        */
                        Util.mergeUsers(users, dbUsers, 'no', function(mergedUsers) {
                            io.to(singleUser.socketId).emit('userEntrance', mergedUsers);
                        });
                    }
                });
            } else {
                /*
                    If Online send message to receiver.
                */
                io.to(data_server.socket_id).emit('getMsg', result);
            }
        });
    });


    /*
        Sending Typing notification to user.
    */
    socket.on('setTypingNotification', function(data_server) {
        io.to(data_server.data_socket_fromid).emit('getTypingNotification', data_server);
    });

    /*
        Removig user when user logs out
    */
    socket.on('disconnect', function() {
        var spliceId = "";
        if (users.length > 0) {
            for (var i = 0; i < users.length; i++) {
                if (users[i].id == uIdSocket) {
                    if (users[i].socketId == socket.id) {
                        var data = {
                            query: "update users set online='N' where token='" + users[i].token + "'",
                            connection: connection
                        }
                        spliceId = i;
                        connection.query(data.query, function(err, result) {
                            users.splice(spliceId, 1); //Removing single user
                            io.emit('exit', users[spliceId]);
                        });
                    }
                }
            }
        }
    });
});



server.listen(port)