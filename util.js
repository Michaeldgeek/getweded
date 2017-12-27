var config = require('./config');
var util = require('util');
class Util {

    static createOrder(connection, order, callback) {
        connection.query("insert into `orders` SET ?", order, function(err, results) {
            if (err) {
                callback(err);
                return;
            }
            if (results.affectedRows === 1) {
                callback(undefined);
                return;
            }
        });
    }

    static getRandomInt() {
        return Math.floor(Math.random() * 89999 + 10000);
    }



    static addChecklist(connection, checklist, callback) {
        connection.query("insert into `checklist` SET ?", checklist, function(err, results) {
            if (err) {
                callback(undefined);
                return;
            }
            if (results.affectedRows == 0) {
                callback(true);
                return;
            } else {
                callback({ id: results.insertId, });
                return;
            }
        });
    }

    static getRandomInt() {
        return Math.floor(Math.random() * 89999 + 10000);
    }

    static getDefaultMenu() {
        return [{
            url: '',
            name: 'Edit'
        }, {
            url: '',
            name: 'Delete'
        }];
    }
    static getReminderMenu() {
        return [{
            url: '',
            name: 'Edit'
        }, {
            url: '',
            name: 'Delete'
        }, {
            url: '',
            name: 'Set Reminder'
        }];
    }

    static getViewReminderMenu() {
        return [{
            url: '',
            name: 'Edit'
        }, {
            url: '',
            name: 'Delete'
        }, {
            url: '',
            name: 'View Reminder'
        }];
    }


    static sendSmsCode(connection, phone, jusibe, callback) {
        var code = Util.getRandomInt();
        var payload = {
            to: phone,
            from: 'GetWeded',
            message: 'Verification code: ' + code
        };
        jusibe.sendSMS(payload)
            .then(resp => {
                if (resp.body.status == "Sent") {
                    var obj = {
                        status: config.SENT,
                        code: code
                    };
                    callback(obj);
                }
            }).catch(err => {
                var obj = {
                    status: "error"
                };
                callback(obj);
                console.log(err);
            });
    }

    static loginUser(connection, user, callback) {
        connection.query("SELECT * from `users` where `email` = '" + user.email + "' and `password` = '" + user.password + "'",
            function(error, results, fields) {
                if (error) {
                    callback(undefined);
                    return;
                }
                if (results.length === 0) {
                    console.log(user);
                    return callback(true);
                } else {
                    return callback(results[0]);
                }
            });
    }
    static getUserOrder(connection, email, callback) {
        connection.query("SELECT * from `orders` where `user` = '" + email + "'",
            function(error, results, fields) {
                if (error) {
                    callback(undefined);
                    return;
                }
                if (results.length === 0) {
                    return callback(true);
                } else {
                    return callback(results[0]);
                }
            });
    }

    static fetchUserChecklist(connection, user, callback) {
        connection.query("SELECT * from `checklist` where `user` = '" + user + "'",
            function(error, results, fields) {
                if (error) {
                    callback(undefined);
                    return;
                }
                if (results.length === 0) {
                    return callback(true);
                } else {
                    var response = results.filter(function(el) {
                        if (el.completed == 'true') {
                            var menu = Util.getDefaultMenu();
                            el.menu = menu;
                            return el;

                        } else {
                            if (util.isNullOrUndefined(el.reminder)) {
                                var menu = Util.getReminderMenu();
                                el.menu = menu;
                                return el;
                            } else {
                                var menu = Util.getViewReminderMenu();
                                el.menu = menu;
                                return el;
                            }
                        }

                    });
                    return callback(response);
                }
            });
    }

    static fetchUserChecklistCompleted(connection, user, callback) {
        connection.query("SELECT * from `checklist` where `user` = '" + user + "' and `completed` = '" + config.TRUE + "'",
            function(error, results, fields) {
                if (error) {
                    callback(undefined);
                    return;
                }
                if (results.length === 0) {
                    return callback(true);
                } else {
                    var response = results.filter(function(el) {
                        if (el.completed == 'true') {
                            var menu = Util.getDefaultMenu();
                            el.menu = menu;
                            return el;

                        } else {
                            if (util.isNullOrUndefined(el.reminder)) {
                                var menu = Util.getReminderMenu();
                                el.menu = menu;
                                return el;
                            } else {
                                var menu = Util.getViewReminderMenu();
                                el.menu = menu;
                                return el;
                            }
                        }

                    });
                    return callback(response);
                }
            });
    }
    static fetchUserChecklistUnCompleted(connection, user, callback) {
        connection.query("SELECT * from `checklist` where `user` = '" + user + "' and `completed` = '" + config.FALSE + "'",
            function(error, results, fields) {
                if (error) {
                    callback(undefined);
                    return;
                }
                if (results.length === 0) {
                    return callback(true);
                } else {
                    var response = results.filter(function(el) {
                        if (el.completed == 'true') {
                            var menu = Util.getDefaultMenu();
                            el.menu = menu;
                            return el;

                        } else {
                            if (util.isNullOrUndefined(el.reminder)) {
                                var menu = Util.getReminderMenu();
                                el.menu = menu;
                                return el;
                            } else {
                                var menu = Util.getViewReminderMenu();
                                el.menu = menu;
                                return el;
                            }
                        }

                    });
                    return callback(response);
                }
            });
    }


    static verifyCode(connection, data, callback) {
        connection.query("SELECT * from `smscodes` where `user` = '" + data.email + "' and (`code` = '" + data.code + "' and `status` = '" + config.UN_VERIFIED + "')",
            function(error, results, fields) {
                if (error) {
                    callback(undefined);
                    return;
                }
                if (results.length === 0) {
                    return callback(true);
                } else {
                    return callback(results[0]);
                }
            });
    }

    static updatePhoneStatus(connection, email, callback) {
        connection.query("update `users` set `isPhoneVerified` = '" + config.YES + "' where `email` = '" + email + "'",
            function(err, results) {
                if (err) {
                    callback(undefined);
                    return;
                }
                if (results.affectedRows > 0) {
                    callback(true);
                } else {
                    // log error
                    callback(false);
                }
            });
    }

    static markCheckList(connection, checklist, callback) {
        connection.query("update `checklist` set `completed` = '" + config.TRUE + "', reminder =  " + null + " where( `user` = '" + checklist.user + "' and `id` = '" + checklist.id + "')",
            function(err, results) {
                if (err) {
                    callback(undefined);
                    return;
                }
                if (results.affectedRows <= 0) {
                    callback(true);
                } else {
                    callback({ status: config.DONE });
                }
            });
    }

    static updateCheckList(connection, checklist, callback) {
        connection.query("update `checklist` set `name` = '" + checklist.name + "', `note` = '" + checklist.note + "' where( `user` = '" + checklist.user + "' and `id` = '" + checklist.id + "')",
            function(err, results) {
                if (err) {
                    callback(undefined);
                    return;
                }
                if (results.affectedRows <= 0) {
                    callback(true);
                } else {
                    callback({ status: config.DONE });
                }
            });
    }


    static deleteCheckList(connection, checklist, callback) {
        connection.query(" delete from `checklist` where( `user` = '" + checklist.user + "' and `id` = '" + checklist.id + "')",
            function(err, results) {
                if (err) {
                    callback(undefined);
                    return;
                }
                if (results.affectedRows <= 0) {
                    callback(true);
                } else {
                    callback({ status: config.DONE });
                }
            });
    }

    static unmarkCheckList(connection, checklist, callback) {
        connection.query("update `checklist` set `completed` = '" + config.FALSE + "' where (`user` = '" + checklist.user + "'and `id` = '" + checklist.id + "')",
            function(err, results) {
                if (err) {
                    callback(undefined);
                    return;
                }
                if (results.affectedRows <= 0) {
                    callback(true);
                } else {
                    callback({ status: config.DONE });
                }
            });
    }

    static issueNewToken(connection, token, user, callback) {
        connection.query("update `users` set `token` = '" + token + "' where (`email` = '" + user + "')",
            function(err, results) {
                if (err) {
                    callback(undefined);
                    return;
                }
                if (results.affectedRows <= 0) {
                    callback(true);
                } else {
                    callback({ status: config.DONE });
                }
            });
    }

    static logout(connection, user, callback) {
        connection.query("update `users` set `token` = '" + null + "' where `email` = '" + user + "'",
            function(err, results) {
                if (err) {
                    console.log(err);
                    callback(undefined);
                    return;
                }
                if (results.affectedRows <= 0) {
                    callback(true);
                } else {
                    callback({ status: config.DONE });
                }
            });
    }

    static setCheckListReminder(connection, checklist, callback) {
        connection.query("update `checklist` set `reminder` = '" + checklist.reminder + "' where (`user` = '" + checklist.user + "'and `id` = '" + checklist.id + "')",
            function(err, results) {
                if (err) {
                    callback(undefined);
                    return;
                }
                if (results.affectedRows <= 0) {
                    callback(true);
                } else {
                    callback({ status: config.DONE });
                }
            });
    }
    static isNewUser(email, callback, connection) {
        connection.query("SELECT * from `users` where `email` = '" + email + "'",
            function(error, results, fields) {
                if (error) {
                    return callback(undefined);
                }
                if (results.length === 0) {
                    return callback(true);
                } else {
                    return callback(results[0]);
                }
            });
    }

    static verifyToken(token, callback, connection) {
        connection.query("SELECT * from `users` where `token` = '" + token + "'",
            function(error, results, fields) {
                if (error) {
                    return callback(undefined);
                }
                if (results.length === 0) {
                    return callback(false);
                } else {
                    return callback(results[0]);
                }
            });
    }

    static saveNewUser(user, callback, connection) {
        connection.query("insert into `users` SET ?", user, function(err, results) {
            if (results.affectedRows === 1) {
                callback(true);
            } else {
                callback(false);
            }
        });
    }
    static getUnusedCodes(email, callback, connection) {
        connection.query("SELECT * from `smscodes` where `user` = '" + email + "'",
            function(error, results, fields) {
                if (error) {
                    return callback(undefined);
                }
                if (results.length === 0) {
                    return callback(true);
                } else {
                    return callback(results[0]);
                }
            });
    }
    static getToken(email, callback, connection) {
        connection.query("SELECT * from `users` where `email` = '" + email + "'",
            function(error, results, fields) {
                if (error) {
                    return callback(undefined);
                }
                if (results.length === 0) {
                    return callback(true);
                } else {
                    return callback(results[0].token);
                }
            });
    }

    static isUserVerified(email, callback, connection) {
        connection.query("SELECT * from `users` where `email` = '" + email + "'",
            function(error, results, fields) {
                if (error) {
                    return;
                }
                if (results.length === 0) {
                    return callback(false);
                } else {
                    if (results[0].isPhoneVerified == config.YES) {
                        return callback(true);
                    } else {
                        return callback(false);
                    }
                }
            });
    }
    static updateSmsStatus(email, callback, connection) {
        connection.query("delete from `smscodes`  where `user` = '" + email + "'",
            function(err, results) {
                if (results.affectedRows > 0) {
                    Util.updatePhoneStatus(connection, email, function(response) {
                        if (response) {
                            callback(true);
                        } else {
                            callback(false);
                        }
                    });

                } else {
                    // log error
                    callback(false);
                }
            });
    }
    static sendVerificationCodes(phone, email, callback, connection) {
        Util.getUnusedCodes(email, function(response) {
            if (util.isBoolean(response)) {
                var code = Util.getRandomInt();
            } else {
                var code = response.code;
            }
            var payload = {
                to: phone,
                from: 'GetWeded',
                message: 'Verification code: ' + code
            };
            var obj = {
                code: code,
                status: "sent"
            };
            //tweak
            if (!util.isBoolean(response)) {
                callback(obj);
            } else {
                Util.saveSmsCodes({ code: code, user: email, status: config.UN_VERIFIED }, function(response) {
                    if (true) {
                        callback(obj);
                    }
                }, connection);
            }
            //tweak
            /** jusibe.sendSMS(payload)
                .then(resp => {
                    if (resp.body.status == "Sent") {
                        var obj = {
                            status: "sent",
                            code: code
                        };
                        if (!util.isBoolean(response)) {
                            callback(obj);
                        } else {
                            saveSmsCodes({ code: code, user: email, status: config.UN_VERIFIED }, function(response) {
                                if (true) {
                                    callback(obj);
                                }
                            }, connection);
                        }
                    }
                })
                .catch(err => {
                    var obj = {
                        status: "error"
                    };
                    callback(obj);
                    console.log(err);
                });

**/
        }, connection);


    }
    static saveSmsCodes(smscodes, callback, connection) {
        connection.query("insert into `smscodes` SET ?", smscodes, function(err, results) {
            if (results.affectedRows === 1) {
                callback(true);
            } else {
                callback(false);
            }
        });
    }
    static updatePhoneNumber(email, phone, callback, connection) {
        connection.query("update `users` set `phone` = '" + phone + "' where `user` = '" + email + "'",
            function(err, results) {
                if (err) {
                    callback(undefined);
                    return;
                }
                if (results.affectedRows > 0) {
                    callback(true);
                } else {
                    // log error
                    callback(false);
                }
            });
    }
}

module.exports = Util;