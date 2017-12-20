    import angular from 'angular';
    import Util from './classes/Util';
    import Vendors from './classes/Vendors';
    import selection from './classes/Selections';
    import User from './classes/User';
    import CheckList from './classes/CheckList';
    import config from '../../config';

    var app = angular.module('mainApp', ['dynamicNumber', 'angucomplete-alt', 'ngTagsInput']);

    app.controller('mainController', ['$scope', '$filter', '$http', '$interval', function($scope, $filter, $http, $interval) {
        var vendors = new Vendors();
        var step = 0;
        $scope.maxBudgetInput = false;
        $scope.vendors = vendors.getVendors();
        $scope.others = false;
        $scope.pencil = false;
        $scope.dontRunDigest = false;
        $scope.minInputDisabled = false;
        $scope.next = true;
        $scope.prev = false;
        $scope.weddingDate = '';
        $scope.info = '';
        $scope.spinner = true;
        $scope.vendorsList = vendors.getVendorsForUserInput();
        $scope.states = Util.geListOfStates();
        $scope.tags = [];
        $scope.recommendedVendors = vendors.getVendors();

        $('.getStarted').click(function() {
            $('#start').trigger('click');
        });

        $('#start').click(function() {
            $scope.$apply(function() {
                $scope.vendors = $scope.tags;
            });
        });
        $scope.useRec = function() {
            $scope.vendors = $scope.recommendedVendors;
            $('#next').trigger('click');
        };
        $('a.cd-modal-close').click(function() {
            $scope.$apply(function() {
                $scope.vendors = vendors.getVendors();
            });
        });

        $scope.loadTags = function(query) {
            var vendor = vendors.getVendorsForUserInput().filter(function(el) {
                var bool = el.name.trim().toLowerCase().search(query.trim().toLowerCase());
                if (bool != -1) {
                    return el;
                }
            });
            return vendor;
        };
        $scope.tagAdded = function($tag) {
            // $scope.vendors.push($tag);
        };

        $scope.tagRemoved = function($tag) {
            Vendors.removeVendor($, $scope.vendors, $tag.name);
            Vendors.updateTotalMax($scope, $);
        };

        $scope.$watch('min', function() {
            if ($scope.dontRunDigest === true) {
                $scope.dontRunDigest = false;
                return;
            }
            if (typeof $scope.min != 'undefined' && ($.isNumeric($scope.min) && parseFloat($scope.min) > 0)) {
                $scope.others = true;
                $scope.pencil = true;
                Vendors.calculateDefaultBudget($scope.vendors, $, $scope.min);
                Vendors.calculateRecommendedBudget($scope.recommendedVendors, $, $scope.min);
                Vendors.updateTotalMax($scope, $);
                Vendors.updateRecTotalMax($scope, $);
            } else {
                Vendors.resetVendorAmount($scope.vendors, $);
                Vendors.resetRecommendedVendorAmount($scope.recommendedVendors, $);
                Vendors.updateRecTotalMax($scope, $);
            }
        });

        $scope.otherHanler = function() {
            if ($scope.addRow) {

            } else if (!$scope.addRow) {
                $scope.addRow = true;
            }
        };

        $scope.selectedVendors = function() {
            if (typeof arguments[0] != "undefined") {
                var valueSelected = arguments[0].originalObject.value;
                $('#ex2').focus();
                Util.hidePopOver('#ex1_value', $);
                Util.hidePopOver('#ex2', $);
            }
        };

        $scope.removeRow = function() {
            $scope.addRow = false;
            $('#ex1_value').val('');
            $('#ex2').val('');
            Util.hidePopOver('#ex1_value', $);
            Util.hidePopOver('#ex2', $);
        };

        $scope.addRowHandler = function() {
            var vendor = { name: $('#ex1_value').val(), amount: $('#ex2').val(), edited: true };
            var vendors = Vendors.addNewVendor({ name: $('#ex1_value').val(), amount: $('#ex2').val(), edited: true }, $, $scope.min, $scope.vendors);
            if (typeof vendors != "undefined" && vendors.length > 0) {
                Vendors.updateTotalMax($scope, $);
                $scope.addRow = false;
                $scope.minInputDisabled = true;
                Util.hidePopOver('#ex1_value', $);
                Util.hidePopOver('#ex2', $);
            }
        };
        $scope.editAmount = function($event) {
            var element = $event.target;
            $('#editAmountModal').modal('show');
            var amount = parseFloat($(element).attr('data-amount').replace(/\,/g, ''), 10);
            var type = $(element).attr('data-type');
            $scope.vendorType = type;
            $scope.editItem = amount;
        };
        $scope.removeVendor = function($event) {
            var element = $event.target;
            var type = $(element).attr('data-type');
            $scope.tagRemoved(Vendors.getVendor($scope.vendors, type, $));
            $.each($scope.tags, function(index, element) {
                if (typeof element == "undefined") {
                    return;
                }
                if (element.name.trim().toLowerCase() == type.trim().toLowerCase()) {
                    $scope.tags.splice(index, 1);
                    return true;
                }
            });
            Vendors.removeVendor($, $scope.vendors, type);
            $scope.minInputDisabled = true;
            Vendors.updateTotalMax($scope, $);
        };
        $scope.minClicked = function() {
            if ($scope.minInputDisabled === true) {
                Util.showPopOver('#minInput', "Vendor list have been modified. Do you wish to change budget amount?", $);
            } else {
                $scope.minInputDisabled = false;
            }
        }
        $scope.no = function($event) {
            var element = $event.target;
            var selector = $(element).attr('data-selector');
            Util.hidePopOver(selector, $);
        };
        $scope.yes = function($event) {
            $scope.errorMin = '';
            var element = $event.target;
            var type = $(element).attr('data-type');
            if (type == 1) {
                $('#editMinModal').modal('show');
            } else if (type == 2) {
                $('#editMinModal').modal('show');
                $scope.updateMinInput = true;
            }
        };
        $scope.updateMin = function() {
            $scope.errorMinDiv = false;
            if (typeof $scope.minNew != 'undefined' && ($.isNumeric($scope.minNew) && parseFloat($scope.minNew) > 0)) {
                if (parseFloat($scope.minNew) < parseFloat($('#ex2').val().trim())) {
                    $scope.errorMin = "The new budget amount is smaller than the vendor amount you are trying to add";
                    $scope.errorMinDiv = true;
                } else if ((parseFloat(Vendors.getTotalVendorsAmount($scope.vendors, $)) + parseFloat($('#ex2').val().trim())) > parseFloat($scope.minNew)) {
                    $scope.errorMin = "The total budget amount is greater than the new budget amount";
                    $scope.errorMinDiv = true;
                } else if (parseFloat($scope.minNew) < parseFloat($scope.min)) {
                    $scope.errorMin = "The new budget amount is smaller than the previous one";
                    $scope.errorMinDiv = true;
                } else {
                    if ($scope.updateMinInput === true) {
                        $scope.dontRunDigest = true;
                        $scope.errorMinDiv = false;
                        $scope.min = parseFloat($scope.minNew);
                        Util.hidePopOver('#ex2', $);
                        $('#editMinModal').modal('hide');
                        $scope.updateMinInput = undefined;
                    } else {
                        $scope.dontRunDigest = true;
                        $scope.errorMinDiv = false;
                        $scope.min = parseFloat($scope.minNew);
                        $scope.addRowHandler();
                        Util.hidePopOver('#ex2', $);
                        $('#editMinModal').modal('hide');
                    }
                }
            } else {
                Util.animateFlash('minNew', $, 'shake');
            }
        };
        $scope.saveItem = function() {
            var amount = parseFloat($scope.editItem);
            var type = $scope.vendorType;
            var vendor = Vendors.getVendor($scope.vendors, type, $);
            if ($.isNumeric(amount) && amount >= 0) {
                if (amount > parseFloat($scope.min)) {
                    $scope.errorEdit = "The amount is greater than budget. Consider editing budget amount";
                } else if (((parseFloat(Vendors.getTotalVendorsAmount($scope.vendors, $)) - vendor.amount) + amount) > parseFloat($scope.min)) {
                    $scope.errorEdit = "This will make the total vendor amount greater than budget. Consider editing budget amount";
                } else {
                    $scope.errorEdit = undefined;
                    Vendors.editVendorAmount($, amount, type, $scope.vendors);
                    $scope.minInputDisabled = true;
                    Vendors.updateTotalMax($scope, $);
                    $('#editAmountModal').modal('hide');
                }
            } else {
                Util.animateFlash('updateBox', $, 'shake');
            }
        };
        $('#location-input').change(function() {
            $('#location-input option').each(function(index, element) {
                if ($(this).is(':selected')) {
                    if (this.value != 'none') {
                        selection.setUserLocation(this.value);
                    } else {
                        selection.setUserLocation(undefined);
                    }
                }
            });
        });
        $('#guest-input').change(function() {
            $('#guest-input option').each(function(index, element) {
                if ($(this).is(':selected')) {
                    if (this.value != 'none') {
                        selection.setGuestNumber(this.value);
                    } else {
                        selection.setGuestNumber(undefined);
                    }
                }
            });
        });
        $scope.$watch('info', function() {
            selection.setInfo($scope.info);
        });
        $('#next').click(function() {
            if (step == 0) {
                if (selection.getInfo().trim() == '') {
                    Util.animateFlash('info1', $, 'shake');
                } else if ($scope.vendors.length == 0) {
                    Util.animateFlash('info2', $, 'shake');
                } else {
                    $("#step1").animate({
                        'opacity': '0',
                    }, function() {
                        $('#step1').css('display', 'none');
                        $("#budgetArea").animate({
                            'opacity': '1'
                        }, function() {
                            $('#budgetArea').css('display', 'block');
                            step++;
                            $scope.$apply(function() {
                                $scope.prev = true;
                            });
                        });
                    });
                }
            } else if (step == 1) {
                if (typeof $scope.min == 'undefined' || (!$.isNumeric($scope.min) || parseFloat($scope.min) <= 0)) {
                    Util.animateFlash('budgetArea', $, 'shake');
                    alert('Enter a budget amount');
                    return;
                } else {
                    $("#budgetArea").animate({
                        'opacity': '0',
                    }, function() {
                        $('#budgetArea').css('display', 'none');
                        $("#step2").animate({
                            'opacity': '1'
                        }, function() {
                            $('#step2').css('display', 'block');
                            step++;
                            $scope.$apply(function() {
                                $scope.prev = true;
                            });
                        });
                    });
                }
            } else if (step == 2) {
                if ($scope.weddingDate == '' && typeof selection.getTime() == 'undefined') {
                    selection.setTime(undefined);
                    Util.animateFlash('step2', $, 'shake');
                } else {
                    $("#step2").animate({
                        'opacity': '0'
                    }, function() {
                        $('#step2').css('display', 'none');
                        $("#step3").animate({
                            'opacity': '1'
                        }, function() {
                            $('#step3').css('display', 'block');
                            step++;
                        });
                    });
                }

            } else if (step == 3) {
                if (typeof selection.getUserLocation() == 'undefined') {
                    Util.animateFlash('step3', $, 'shake');
                } else {
                    $("#step3").animate({
                        'opacity': '0'
                    }, function() {
                        $('#step3').css('display', 'none');
                        $('#process').css('display', 'none');
                        $('#loginModal').modal('show');
                        $("#loginModal").on("hidden.bs.modal", function() {
                            step = 0;
                            $('#step1').css('display', 'block');
                            $('#step1').css('opacity', '1');
                            $('#process').css('display', 'block');
                            $('a.cd-modal-close').trigger('click');
                            $scope.$apply(function() {
                                $scope.prev = false;
                                $scope.codeMessage = undefined;
                            });
                        });
                        $('#name').focus();
                    });
                }
            }
        });
        $('#prev').click(function() {
            if (step == 1) {
                $("#budgetArea").animate({
                    'opacity': '0'
                }, function() {
                    $('#budgetArea').css('display', 'none');
                    $("#step1").animate({
                        'opacity': '1'
                    }, function() {
                        $('#step1').css('display', 'block');
                        step--;
                        $scope.$apply(function() {
                            $scope.prev = false;
                        });
                    });
                });
            } else if (step == 2) {
                $("#step2").animate({
                    'opacity': '0'
                }, function() {
                    $('#step2').css('display', 'none');
                    $("#budgetArea").animate({
                        'opacity': '1'
                    }, function() {
                        $('#budgetArea').css('display', 'block');
                        step--;
                    });
                });
            } else if (step == 3) {
                $("#step3").animate({
                    'opacity': '0'
                }, function() {
                    $('#step3').css('display', 'none');
                    $("#step2").animate({
                        'opacity': '1'
                    }, function() {
                        $('#step2').css('display', 'block');
                        step--;
                    });
                });
            }
        });
        $('#date-input').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY', minDate: new Date(), time: false });
        $('#date-input').bootstrapMaterialDatePicker({ weekStart: 0 }).on('change', function(e, date) {
            $scope.$apply(function() {
                $scope.weddingDate = date;
                selection.setTime(date.toDate().getTime());
            });
        });


        $scope.save = function() {
            if ($scope.loginForm.$valid) {
                var name = $('#name').val();
                var email = $('#email').val();
                var phone = $('#phone').val();
                $scope.codeError = undefined;
                $scope.codeMessage = undefined;
                $scope.enablePhone = false;
                $scope.editNumber = false;
                $scope.spinner = false;
                var data = {
                    name: $('#name').val(),
                    email: $('#email').val(),
                    phone: $('#phone').val()
                };
                if ($scope.sending) {
                    return;
                }
                $scope.sending = true;
                $scope.resend = function() {
                    if (typeof $scope.timer == "undefined" && $scope.vCode) {
                        $scope.vCode = false;
                        $scope.sending = false;
                        $scope.spinner = true;
                        $scope.smsSent = false;
                        $scope.resendCode = true;
                        $('#phone').focus();
                    }

                };

                if ($scope.smsSent) {
                    $scope.spinner = false;
                    var code = $('#code').val().trim();
                    $scope.sending = true;
                    $http({
                        method: 'POST',
                        url: '/verify-code/',
                        data: { code: code, email: data.email, order: selection, min: $scope.min, vendors: $scope.vendors }
                    }).then(function(success) {
                        var data = success.data;
                        if (data.status == "done") {
                            $('#loginDialog').modal('hide');
                            $scope.codeMessage = "Thank you so much. We will get back to you";
                            $scope.smsSent = false;
                            window.location.href = '/user/home/';
                        } else {
                            $scope.codeError = data.error;
                            $scope.vCode = true;
                            $scope.smsSent = true;
                        }
                        $scope.sending = false;
                        $scope.spinner = true;
                    }, function(err) {
                        $scope.vCode = false;
                        $scope.codeError = "An internal error occured. Please Retry";
                        $scope.sending = false;
                        $scope.spinner = true;
                        $scope.smsSent = false;
                    });
                } else {
                    if ($scope.resendCode) {
                        var datum = data;
                        datum.resend = true;
                        var promise = Util.sendVerificationCode($http, datum);
                        $scope.promiseHandler(promise);
                        $scope.resendCode = undefined;
                    } else {
                        var promise = Util.sendVerificationCode($http, data);
                        $scope.promiseHandler(promise);
                        $scope.resendCode = undefined;
                    }
                }
            }
        };

        $scope.promiseHandler = function(promise) {
            promise.then(function(success) {
                var data = success.data;
                if (data.status == "sent") {
                    $scope.vCode = true;
                    $scope.smsSent = true;
                    if ($scope.vCode) {
                        $scope.timer = config.TIMER_DEFAULT;
                        $interval(function() {
                            $scope.timer--;
                        }, 1000, config.TIMER_DEFAULT).then(function(done) {
                            $scope.timer = undefined;
                        });
                    } else {
                        $scope.timer = undefined;
                    }
                    $scope.disableInput = true;
                } else {
                    $scope.vCode = false;
                    $scope.codeError = data.error;
                    $scope.smsSent = false;
                }
                $scope.sending = false;
                $scope.spinner = true;

            }, function(error) {
                $scope.vCode = false;
                $scope.codeError = "An internal error occured. Please retry";
                $scope.sending = false;
                $scope.spinner = true;
                $scope.smsSent = false;
            });
        };
    }]).controller('loginCtrl', ['$scope', '$http', '$interval', function($scope, $http, $interval) {
        $scope.login = function() {
            if ($scope.loginForm.$valid) {
                var email = $('#emailLog').val();
                var password = $('#password').val();
                var user = new User();
                user.setEmail(email).setPassword(password);
                $scope.spin = true;
                if ($scope.logging) {
                    return;
                }
                $scope.logging = true;
                if ($scope.vCode) {
                    var promise = Util.verifyCode($http, { email: email, code: $('#vCode').val() });
                    promise.then(function(success) {
                        console.log(success.data);
                    }, function(error) {

                    });
                    return;
                }
                $scope.codeError = undefined;
                var promise = User.loginUser(user, $http);
                promise.then(function(success) {
                    var data = success.data;
                    if (data.status == "success") {
                        $scope.codeMessage = "Login successful. Redirecting...";
                        window.location.href = data.url;
                        return;
                    } else if (data.error == config.UN_VERIFIED) {
                        $scope.codeError = "Please verify your phone number";
                        $scope.vCode = true;
                        $scope.data = data;
                        if ($scope.vCode) {
                            $scope.timer = config.TIMER_DEFAULT;
                            $interval(function() {
                                $scope.timer--;
                            }, 1000, config.TIMER_DEFAULT).then(function(done) {
                                $scope.timer = undefined;
                            });

                        } else {
                            $scope.timer = undefined;
                        }
                    } else {
                        $scope.codeError = data.error;
                        $scope.vCode = undefined;
                    }
                    $scope.logging = false;
                    $scope.spin = false;
                }, function(err) {
                    $scope.codeError = err;
                    $scope.logging = false;
                    $scope.spin = false;
                });
                $scope.resend = function() {
                    if (typeof $scope.timer == "undefined" && $scope.vCode) {
                        var promise = Util.sendSmsCode($http, data.phone);
                        promise.then(function(success) {
                            if (success.data == config.SENT) {
                                $scope.timer = config.TIMER_DEFAULT;
                                $interval(function() {
                                    $scope.timer--;
                                }, 1000, config.TIMER_DEFAULT).then(function(done) {
                                    $scope.timer = undefined;
                                });
                            }
                        }, function(error) {
                            //log error
                        });
                    }

                };
            }
        };
    }]);
    var app2 = angular.module('userApp', ['as.sortable']);
    app2.controller('UserCtrl', ['$scope', '$http', function($scope, $http) {
        //
    }]).controller('CheckListCtrl', ['$scope', '$http', function($scope, $http) {
        $scope.filterText = "FILTER";
        $scope.dropdown = function($event) {
            $event.stopPropagation();
            // Toggle dropdown if not already visible:
            if ($($event.target).children('.dropdown-menu').is(":hidden")) {
                $($event.target).children('.dropdown-toggle').dropdown('toggle');
            } else {
                $($event.target).children('.dropdown-toggle').dropdown('toggle');
            }
        };
        $scope.completedTask = function() {
            if (angular.isDefined($scope.items)) {
                $scope.items = [];
                $('#spinner-wrapper').show();
                $scope.checklistErrorMsg = undefined;
                var spinner = Util.startSpinner(document.getElementById('spinner'));
                var promise = CheckList.getUserCheckListCompleted($http, { user: $scope.user });
                promise.then(function(success) {
                    spinner.stop();
                    $('#spinner-wrapper').hide();
                    var data = success.data;
                    if (data.status == config.DONE) {
                        $scope.items = data.checklist;
                        $scope.$broadcast('done', $scope.items);
                        $scope.filterText = "Completed Task";
                    } else {
                        $scope.items = [];
                        $scope.checklistErrorMsg = data.error;
                    }
                }, function(error) {
                    $scope.checklistErrorMsg = "Could not connect to our server.";
                    spinner.stop();
                    $('#spinner-wrapper').hide();
                });

            }
        };
        $scope.uncompletedTask = function() {
            if (angular.isDefined($scope.items)) {
                $scope.items = [];
                $('#spinner-wrapper').show();
                $scope.checklistErrorMsg = undefined;
                var spinner = Util.startSpinner(document.getElementById('spinner'));
                var promise = CheckList.getUserCheckListUnCompleted($http, { user: $scope.user });
                promise.then(function(success) {
                    spinner.stop();
                    $('#spinner-wrapper').hide();
                    var data = success.data;
                    if (data.status == config.DONE) {
                        $scope.items = data.checklist;
                        $scope.$broadcast('done', $scope.items);
                        $scope.filterText = "Uncompleted Task";
                    } else {
                        $scope.items = [];
                        $scope.checklistErrorMsg = data.error;
                    }
                }, function(error) {
                    $scope.checklistErrorMsg = "Could not connect to our server.";
                    spinner.stop();
                    $('#spinner-wrapper').hide();
                });

            }
        };
        $scope.allTask = function() {
            if (angular.isDefined($scope.items)) {
                $scope.items = [];
                $('#spinner-wrapper').show();
                $scope.checklistErrorMsg = undefined;
                var spinner = Util.startSpinner(document.getElementById('spinner'));
                var promise = CheckList.getUserCheckList($http, { user: $scope.user });
                promise.then(function(success) {
                    spinner.stop();
                    $('#spinner-wrapper').hide();
                    var data = success.data;
                    if (data.status == config.DONE) {
                        $scope.items = data.checklist;
                        $scope.filterText = "ALL";
                        $scope.$broadcast('done', $scope.items);
                    } else {
                        $scope.items = [];
                        $scope.checklistErrorMsg = data.error;
                    }
                }, function(error) {
                    $scope.checklistErrorMsg = "Could not connect to our server.";
                    spinner.stop();
                    $('#spinner-wrapper').hide();
                });

            }
        };
        $("#accordion").on("hide.bs.collapse", function(e) {
            var element = e.target;
            $(element).prev().toggleClass('expand');
            $(element).prev().children('span.ellipse').toggleClass('white');
            //$(element).prev().children('div.p-default').children('div.toggle-div').children('label').toggleClass('white');
        });
        $("#accordion").on("show.bs.collapse", function(e) {
            var element = e.target;
            $(element).prev().toggleClass('expand');
            $(element).prev().children('span.ellipse').toggleClass('white');
            //  $(element).prev().children('div.p-default').children('div.toggle-div').children('label').toggleClass('white');
        });
        $scope.open = function($event) {
            var element = $event.currentTarget;
            $(element).parent().next().collapse('toggle');
        };
        $scope.menuOption = function($event, menu, item) {
            $event.stopPropagation();
            if (menu.name.trim().toLowerCase() == config.DELETE) {
                if (confirm('Are you sure. This action cant be undone')) {
                    var checklist = new CheckList($scope.user);
                    checklist.setId(item.id);
                    $scope.deleting = true;
                    var promise = CheckList.deleteListItem($http, checklist);
                    promise.then(function(success) {
                        var data = success.data;
                        $scope.deleting = false;
                        if (data.status == config.DONE) {
                            $($scope.items).each(function(index, element) {
                                if (element.id == item.id) {
                                    $scope.items.splice(index, 1);
                                    return;
                                }
                            });
                            $scope.$broadcast('done', $scope.items);
                        } else {
                            $scope.deleteItemError = data.error;
                        }
                    }, function(error) {
                        $scope.deleting = false;
                        $scope.deleteItemError = 'Network error. Try again';
                    });
                }
            } else if (menu.name.trim().toLowerCase() == config.EDIT) {
                $scope.nameEdit = item.name;
                $scope.noteEdit = item.note;
                $('#editModal').modal('show');
                $('#editModal').on('hidden.bs.modal', function() {
                    $scope.$apply(function() {
                        $scope.errorEdit = undefined;
                    });
                });
                $scope.updateCheckList = function() {
                    if ($scope.editForm.$valid) {
                        var checklist = new CheckList($scope.user);
                        checklist.setId(item.id);
                        checklist.setName($scope.nameEdit);
                        checklist.setNote($scope.noteEdit);
                        $scope.spinning = true;
                        var promise = CheckList.editUserCheckListCompleted($http, checklist);
                        promise.then(function(success) {
                            var data = success.data;
                            $scope.spinning = false;
                            if (data.status == config.DONE) {
                                $($scope.items).each(function(index, element) {
                                    if (element.id == item.id) {
                                        $scope.items[index].note = checklist.getNote();
                                        $scope.items[index].name = checklist.getName();
                                    }
                                });
                                $('#editModal').modal('hide');
                            } else {
                                $scope.errorEdit = data.error;
                            }
                        }, function(error) {
                            $scope.spinning = false;
                            $scope.errorEdit = 'Network error. Try again';
                        });
                    }
                };
            } else if (menu.name.trim().toLowerCase() == config.SET_REMINDER) {
                $('#date-edit-input').bootstrapMaterialDatePicker({ format: 'YYYY-MM-DD HH:mm', minDate: new Date(), time: true, triggerEvent: 'calendar', weekStart: 0 });
                $('#date-edit-input').on('change', function(e, date) {
                    $scope.saving = true;
                    $scope.addItemError = undefined;
                    var checklist = new CheckList($scope.user);
                    checklist.setReminder($('#date-edit-input').val());
                    checklist.setId(item.id);
                    $('#date-edit-input').off('change');
                    var promise = CheckList.setReminderCheckListItem($http, checklist);
                    promise.then(function(success) {
                        var data = success.data;
                        $scope.saving = false;
                        if (data.status == config.DONE) {
                            $($scope.items).each(function(index, element) {
                                if (element.id == item.id) {
                                    $scope.items[index].reminder = data.checklist.reminder;
                                }
                            });

                            $scope.$broadcast('done', $scope.items);
                            menu.name = config.VIEW_REMINDER;
                        } else {
                            $scope.addItemError = data.error;
                        }
                    }, function(error) {
                        $scope.saving = false;
                        $scope.addItemError = 'Network error. Try again';
                    });
                });
                $('#date-edit-input').trigger('calendar');

            }
        };
        $scope.doneItem = function($event, item) {
            $event.stopPropagation();
            var element = $event.target;
            var id = item.id;
            var checklist = new CheckList($scope.user);
            checklist.setId(id);
            $scope.addItemError = undefined;
            if (item.completed == "false") {
                var promise = CheckList.markListItem($http, checklist);
                promise.then(function(success) {
                    var data = success.data;
                    $scope.saving = false;
                    if (data.status == config.DONE) {
                        $(element).attr('checked', true);
                        item.completed = "true";
                        item.reminder = data.checklist.reminder;
                        $($scope.items).each(function(index, element) {
                            if (element.id == item.id) {
                                $scope.items[index].menu = data.menu;
                                $scope.items[index] = item;
                            }
                        });
                        $scope.$broadcast('done', $scope.items);

                    } else {
                        $(element).attr('checked', false);
                        item.completed = "false";
                        $scope.addItemError = data.error;
                    }
                }, function(error) {
                    $scope.saving = false;
                    item.completed = "false";
                    $(element).attr('checked', false);
                    $scope.addItemError = 'Network error. Try again';
                });
            } else {
                var promise = CheckList.unmarkListItem($http, checklist);
                promise.then(function(success) {
                    var data = success.data;
                    $scope.saving = false;
                    if (data.status == config.DONE) {
                        $(element).prop('checked', false);
                        item.completed = "false";
                        item.reminder = data.checklist.reminder;
                        $($scope.items).each(function(index, element) {
                            if (element.id == item.id) {
                                $scope.items[index].menu = data.menu;
                                $scope.items[index] = item;

                            }
                        });
                        $scope.$broadcast('done', $scope.items);

                    } else {
                        $(element).prop('checked', true);
                        item.completed = "true";
                        $scope.addItemError = data.error;
                    }
                }, function(error) {
                    $scope.saving = false;
                    item.completed = "true";
                    $(element).prop('checked', true);
                    $scope.addItemError = 'Network error. Try again';
                });
            }
        }
        $scope.addItem = function() {
            if ($scope.AddItem.$valid) {
                $scope.saving = true;
                $scope.addItemError = undefined;
                var checklist = new CheckList($scope.user);
                checklist.setName($scope.name);
                checklist.setNote($scope.note);
                checklist.setReminder($scope.reminderDate);

                var promise = CheckList.addCheckListItem($http, checklist);
                promise.then(function(success) {
                    var data = success.data;
                    $scope.saving = false;
                    if (data.status == config.DONE) {
                        $scope.items.push(data.checklist);
                        $('div.add-todo').toggle('hide');
                        $scope.$broadcast('done', $scope.items);

                    } else {
                        $scope.addItemError = data.error;
                    }
                }, function(error) {
                    $scope.saving = false;
                    $scope.addItemError = 'Network error. Try again';
                });
            }
        }
        $('#date-input').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY HH:MM', minDate: new Date(), time: true });
        $('#date-input').bootstrapMaterialDatePicker({ weekStart: 0 }).on('change', function(e, date) {
            $scope.reminderDate = date;
        });
        $('#dateLabel').click(function(e) {
            $('#date-input').focus();
        });
        $('#add, i.testing-cancel-item').click(function() {
            $('div.add-todo').toggle('hide');
        });
        var spinner = Util.startSpinner(document.getElementById('spinner'));
        var promise = CheckList.getUserCheckList($http, { user: $scope.user });
        promise.then(function(success) {
            spinner.stop();
            $('#spinner-wrapper').hide();
            var data = success.data;
            if (data.status == config.DONE) {
                $scope.items = data.checklist;
                $scope.newItems = $scope.items.filter(function(element) {
                    if (angular.isString(element.reminder)) {
                        return element;
                    }
                });
                if ($scope.newItems.length > 0) {
                    $scope.sortByKey($scope.newItems, 'reminder');
                    $scope.nextItem = $scope.newItems[0].name;
                    $scope.nextDate = moment.unix($scope.newItems[0].reminder).format("MMM") + " " + moment.unix($scope.newItems[0].reminder).format("DD");
                }
            } else {
                $scope.items = [];
                $scope.checklistErrorMsg = data.error;
                $scope.menus = [];
            }
        }, function(error) {
            $scope.checklistErrorMsg = "Could not connect to our server.";
            spinner.stop();
        });

        $scope.sortByKey = function(array, key) {
            return array.sort(function(a, b) {
                var x = a[key];
                var y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }
    }]).controller('ReminderCtrl', ['$scope', '$http', function($scope, $http) {
        $scope.$on('done', function(e, items) {
            $scope.items = items;
            if (angular.isDefined($scope.items)) {
                var i = 0;
                $($scope.items).each(function(index, element) {
                    if (element.completed == "true") {
                        i++;
                    }
                });
                $scope.count = i;

                $scope.newItems = $scope.items.filter(function(element) {
                    if (element.reminder != null) {
                        return element;
                    }

                });
                if ($scope.newItems.length > 0) {
                    $scope.sortByKey($scope.newItems, 'reminder');
                    $scope.nextItem = $scope.newItems[0].name;
                    $scope.nextDate = moment.unix($scope.newItems[0].reminder).format("MMM") + " " + moment.unix($scope.newItems[0].reminder).format("DD");
                } else {
                    $scope.nextDate = undefined;
                    $scope.nextItem = undefined;
                }
            }
        });
        var promise = CheckList.getUserCheckList($http, { user: $scope.user });
        promise.then(function(success) {
            var data = success.data;
            if (data.status == config.DONE) {
                $scope.items = data.checklist;
                $scope.$emit('done', $scope.items);

            }
        }, function(error) {

        });
        $scope.sortByKey = function(array, key) {
            return array.sort(function(a, b) {
                var x = a[key];
                var y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }
    }]);