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
                console.log(checklist);
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

    static updateName(connection, user, callback) {
        connection.query("update `users` set `name` = '" + user.name + "' where( `email` = '" + user.user + "' )",
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

    static updateEmail(connection, user, callback) {
        connection.query("update `users` set `email` = '" + user.email + "' where( `token` = '" + user.token + "' )",
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

    static updatePhone(connection, user, callback) {
        connection.query("update `users` set `phone` = '" + user.phone + "' where( `token` = '" + user.token + "' )",
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

    static updateLocation(connection, user, callback) {
        connection.query("update `orders` set `location` = '" + user.location + "' where( `user` = '" + user.user + "' )",
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
        connection.query("update `users` set `token` = '" + null + "', `online` = 'N'  where `email` = '" + user + "'",
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

    static getUserOrderandDetails(email, callback, connection) {
        connection.query("SELECT `orders`.info as info,`orders`.budgetMin as min,`orders`.budget as budget,`orders`.timeOfWedding as timeOfWedding,`orders`.time as orderTime,`orders`.location as location,`orders`.status as orderStatus, `users`.name as name,`users`.email as email,`users`.phone as phone from `orders` inner join `users` on `orders`.user = `users`.email where `email` = '" + email + "'",
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

    static getUserProfile(email, callback, connection) {
        connection.query("SELECT `users`.name as name, `users`.email as email,`users`.phone as phone,`users`.photo as photo,`orders`.timeOfWedding as time,`orders`.location as location  from `users`  inner join `orders` on `users`.email = `orders`.user where `email` = '" + email + "'",
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
    static getLastConversationId(connection, callback) {
        connection.query("SELECT MAX(con_id) as ID FROM conversation'",
            function(error, results, fields) {
                if (error) {
                    return;
                }
                if (results.length === 0) {
                    return callback({ ID: 0 });
                } else {
                    if (results[0].ID != null) {
                        var conversationid = parseInt(result[0].ID);
                        conversationid++;
                        return callback({ ID: conversationid });
                    } else {
                        return callback({ ID: 0 });
                    }
                }
            });
    }

    static isConversationPresent(data, connection, callback) {
        var is_present = false;
        var con_id = "";
        var is_present_data = {
            query: "select * from conversation where to_id='" + data.to_id + "' and from_id='" + data.from_id + "' or to_id='" + data.from_id + "' and from_id='" + data.to_id + "' limit 1",
            connection: connection
        }
        connection.query(is_present_data.query, function(error, result) {

            if (result.length > 0) {
                /* data for callback starts*/
                is_present = true;
                con_id = result[0].con_id;

            } else {
                //data for callback 
                is_present = false;
                con_id = 0
            }
            callback({
                is_present: is_present,
                con_id: con_id
            });
        });
    }
    static insertConversation(data, time, connection, callback) {
        /*
        	Function to insert consersation.
        */
        var insert_conversation = {
            query: "INSERT INTO conversation SET ?",
            connection: connection,
            insert_data: {
                id: '',
                from_id: data.from_id,
                to_id: data.to_id,
                timestamp: time,
                con_id: data.con_id
            }
        };
        connection.query("INSERT INTO conversation SET ?", insert_conversation.insert_data, function(err, result) {
            callback(result.insertId);
        });
    }

    static insertMsg(data, time, connection, callback) {
        /*
        	Function to insert messages.
        */
        var data_insert = {
            query: "INSERT INTO conversation_reply SET ?",
            connection: connection,
            insert_data: {
                id: '',
                reply: data.msg,
                from_id: data.from_id,
                to_id: data.to_id,
                timestamp: time,
                con_id: data.con_id
            }
        };
        connection.query("INSERT INTO conversation_reply SET ?", data_insert.insert_data, function(err, result) {
            callback(result)
        });
    }

    static callMsgAfterConversation(data, time, connection, callback) {
        /*
        	Separate Function to insert message and conversation in DB ( Just to make our code short ).
        */
        var conversation_data = {
            to_id: data.to_id,
            from_id: data.from_id,
            con_id: data.conversation_id
        }
        Util.insertConversation(conversation_data, time, connection, function(is_insert_conversation) {

            /* 
            	call 'self.insert_msg' to insert messages 
            */
            var insert_msg = {
                id: '',
                msg: data.msg,
                from_id: data.from_id,
                to_id: data.to_id,
                timestamp: time,
                con_id: data.conversation_id
            }
            Util.insertMsg(insert_msg, time, connection, function(is_insert_msg) {
                callback({
                    msg: data.msg,
                    from_id: data.from_id,
                    to_id: data.to_id,
                    timestamp: time
                });
            });
        });
    }

    static saveMsgs(data, time, connection, callback) {

        /*	Calling "self.isConversationPresent" function,
        	to check is conversation is already present or not.
        */
        var check_data = {
                to_id: data.to_id,
                from_id: data.from_id
            }
            /* 
            	checking 'conversation' is present in Database conversation table
            */
        Util.isConversationPresent(check_data, connection, function(is_present) {


            if (is_present.is_present) {

                var msg_after_conversation = {
                    to_id: data.to_id,
                    from_id: data.from_id,
                    msg: data.msg,
                    conversation_id: is_present.con_id
                };

                /* 
                	caling 'self.callMsgAfterConversation' to insert message and conversation
                */
                Util.callMsgAfterConversation(msg_after_conversation, time, connection, function(insert_con_msg) {
                    Util.getUserInfo(data.from_id, connection, function(UserInfo) {
                        insert_con_msg.name = UserInfo.data.name;
                        callback(insert_con_msg);
                    });
                });


            } else {
                /* 
                	call 'self.getLastConversationId' to get last conversation ID 
                */
                Util.getLastConversationId(connection, function(con_id) {

                    var msg_after_conversation = {
                        to_id: data.to_id,
                        from_id: data.from_id,
                        msg: data.msg,
                        conversation_id: con_id.ID
                    };

                    /* 
                    	caling 'self.callMsgAfterConversation' to insert message and conversation
                    */
                    Util.callMsgAfterConversation(msg_after_conversation, time, connection, function(insert_con_msg) {
                        Util.getUserInfo(data.from_id, connection, function(UserInfo) {
                            insert_con_msg.name = UserInfo.data.name;
                            callback(insert_con_msg);
                        });
                    });
                });
            }

        });
    }

    static getMsgs(data, connection, callback) {
        /*
        	Function to get messages.
        */
        var data = {
            query: "select reply as msg,from_id,to_id,timestamp from conversation_reply where from_id='" + data.from_id + "' and to_id='" + data.uid + "' or  from_id='" + data.uid + "' and to_id='" + data.from_id + "' order by timestamp asc",
            connection: connection
        }
        connection.query(data.query, function(err, result) {
            if (result.length > 0) {
                callback(result)
            } else {
                callback(null);
            }
        });
    }

    static getUserInfo(email, connection, callback) {
        /*
        	Function to get user information.
        */
        var data = {
            query: "select id,name,photo,online from users where email='" + email + "'",
            connection: connection
        }
        connection.query(data.query, function(err, result) {
            if (result.length > 0) {
                var user_info = "";
                result.forEach(function(element, index, array) {
                    user_info = {
                        name: element.name,
                        p_photo: element.photo,
                        online: element.online
                    };
                });
                result_send = {
                    data: user_info,
                    msg: "OK"
                };
            } else {
                result_send = {
                    data: null,
                    msg: "BAD"
                };
            }
            callback(result_send);
        });
    }

    static getUserChatList(uid, connection, callback) {
        var data = {
            query: "select DISTINCT con_id from conversation where to_id='" + uid + "' or from_id='" + uid + "' order by timestamp desc ",
            connection: connection
        }
        connection.query(data.query, function(err, result) {
            var dbUsers = [];
            if (result.length > 0) {
                return;
                result.forEach(function(element, index, array) {
                    var data = {
                        query: "select u.* from conversation as c left join users as u on \
								  u.id =case when (con_id='" + element.con_id + "' and to_id='" + uid + "') \
								THEN \
								  c.from_id \
								ELSE \
								  c.to_id \
								END \
								where con_id='" + element.con_id + "' and to_id='" + uid + "' or con_id='" + element.con_id + "' and from_id='" + uid + "' limit 1",
                        connection: connection
                    }
                    connection.query(data.query, function(err, usersData) {
                        if (usersData.length > 0) {
                            dbUsers.push(usersData[0]);
                        }
                        if (index >= (result.length - 1)) {
                            callback(dbUsers);
                        }
                    });

                });
            } else {
                callback(null);
            }
        });
    }

    static getUsersToChat(email, connection, callback) {
        var data = {
            query: "SELECT  to_id, from_id FROM conversation WHERE to_id='" + email + "' OR from_id='" + email + "' GROUP BY con_id DESC  ",
            connection: connection
        }
        connection.query(data.query, function(err, result) {
            var dbUsers = [];
            if (result.length > 0) {
                var filter = [];
                result.forEach(function(element, index, array) {
                    if (element.to_id != email) {
                        filter.push("'" + element['to_id'] + "'");
                        filter.push("'" + element['from_id'] + "'");
                    }
                });
                filter = filter.join();
                data.query = "SELECT * FROM users WHERE email NOT IN (" + filter + ")";
            } else {
                data.query = "SELECT * FROM users WHERE email NOT IN (" + email + ")";
            }
            connection.query(data.query, function(err, usersData) {
                callback(usersData);
            });
        });
    }

    static mergeUsers(socketUsers, dbUsers, newUsers, callback) {
        /*
        	Function Merge online and offline users.
        */
        var tempUsers = [];
        for (var i in socketUsers) {
            var shouldAdd = false;
            for (var j in dbUsers) {
                if (newUsers == 'yes') {
                    if (dbUsers[j].id == socketUsers[i].id) {
                        shouldAdd = false;
                        dbUsers.splice(j, 1); //Removing single user						
                        break;
                    }
                } else {
                    if (dbUsers[j].id == socketUsers[i].id) {
                        dbUsers[j].socketId = socketUsers[i].socketId;
                        shouldAdd = true;
                        break;
                    }
                }
            }
            if (!shouldAdd) {
                tempUsers.push(socketUsers[i]);
            }
        }
        if (newUsers == 'no') {
            tempUsers = tempUsers.concat(dbUsers);
        } else {
            tempUsers = dbUsers;
        }
        callback(tempUsers);
    }
}

module.exports = Util;