var angular = require('angular');
var $ = require('jquery');
jQuery = $;
window.$ = $;
var app = angular.module('mainApp', ['dynamicNumber', 'angucomplete-alt']);
app.controller('mainController', ['$scope', '$http', '$filter', function($scope, $http, $filter) {
    var step = 0;
    $scope.next = true;
    $scope.prev = false;
    $scope.weddingDate = '';
    $scope.info = '';
    $scope.addRow = false;
    $scope.others = [];
    $scope.hideOthers = true;
    $scope.otherIsAdded = false;
    $scope.spinner = true;
    $scope.extras = [
        { vendor: 'Food', amount: 0.00, max: { amount: undefined } },
        { vendor: 'Cakes', amount: 0.00, max: { amount: undefined } },
        { vendor: 'Dress', amount: 0.00, max: { amount: undefined } },
        { vendor: 'Dj', amount: 0.00, max: { amount: undefined } },
        { vendor: 'Photographer', amount: 0.00, max: { amount: undefined } }
    ];

    $scope.vendors = [
        { name: 'Wedding Planner', value: 'Wedding Planner' },
        { name: 'Makeup', value: 'Makeup' },
        { name: 'Dj', value: 'Dj' },
        { name: 'Cake', value: 'Cake' },
        { name: 'Photographer', value: 'Photographer' },
        { name: 'Mc', value: 'Mc' }
    ];
    $scope.vendorsList = [
        { name: 'Band', value: 'Band' },
        { name: 'Beauty & Health', value: 'Beauty & Health' },
        { name: 'Food', value: 'Food' },
        { name: 'Ceremony & Reception Venue', value: 'Ceremony & Reception Venue' },
        { name: 'Ceremony Music', value: 'Ceremony Music' },
        { name: 'DJ', value: 'DJ' },
        { name: 'Dress', value: 'Dress' },
        { name: 'Event Rentals & Photobooths', value: 'Event Rentals & Photobooths' },
        { name: 'Favors & Gifts', value: 'Favors & Gifts' },
        { name: 'Flowers', value: 'Flowers' },
        { name: 'Guest Accommodations', value: 'Guest Accommodations' },
        { name: 'Invitations', value: 'Invitations' },
        { name: 'Jewelry', value: 'Jewelry' },
        { name: 'Lighting & Decor', value: 'Lighting & Decor' },
        { name: 'Name Change Service', value: 'Name Change Service' },
        { name: 'Officiant', value: 'Officiant' },
        { name: 'Photographer', value: 'Photographer' },
        { name: 'Rehearsal Dinner Location', value: 'Rehearsal Dinner Location' },
        { name: 'Transportation', value: 'Transportation' },
        { name: 'Travel', value: 'Travel' },
        { name: 'Tuxedos and Suits', value: 'Tuxedos and Suits' },
        { name: 'Videography', value: 'Videography' },
        { name: 'Cakes', value: 'Cakes' },
        { name: 'Wedding Planning', value: 'Wedding Planning' }
    ]

    function Selections() {

    }
    var selection = new Selections();

    $scope.serviceHandler = function($event) {
        var element = $event.target;
        if ($(element).is(':checked')) {
            selection.addVendors({ name: element.value });
        } else {
            selection.removeVendors({ name: element.value });
        }
    };
    $scope.$watch('info', function() {
        selection.setInfo($scope.info);
    });


    function showToolTip(id) {
        $('#' + id).tooltip();
        $('#' + id).tooltip("show");
        $('#' + id).find(".tooltip.fade.top").removeClass("in");
        setTimeout(function() {
            $('#' + id).tooltip("hide");
            $('#' + id).tooltip("destroy");
        }, 4000);
    }
    var count = 0;
    $scope.$watch('min', function(old, newV) {
        if (typeof $scope.min != 'undefined' && ($.isNumeric($scope.min) && +$scope.min > 0)) {
            if (+$scope.min >= +$scope.max) {
                animate('minInput');
                showToolTip('minInput');
                return;
            }
            if (typeof $scope.extras != "undefined") {
                $scope.hideOthers = false;
                if (count == 0) {
                    animateFlash('hideOthers');
                }
                count++;
                $.each($scope.extras, function(index, extra) {
                    if (typeof extra != "undefined" && (extra.vendor == "Food" || extra.vendor == "food")) {
                        $scope.extras[index].amount = 0.3 * $scope.min;
                    } else if (typeof extra != "undefined" && (extra.vendor == "Cakes" || extra.vendor == "cakes")) {
                        $scope.extras[index].amount = 0.2 * $scope.min;

                    } else if (typeof extra != "undefined" && (extra.vendor == "Dress" || extra.vendor == "dress")) {
                        $scope.extras[index].amount = 0.3 * $scope.min;
                    } else if (typeof extra != "undefined" && (extra.vendor == "Dj" || extra.vendor == "dj")) {
                        $scope.extras[index].amount = 0.1 * $scope.min;
                    } else if (typeof extra != "undefined" && (extra.vendor == "Photographer" || extra.vendor == "photographer")) {
                        $scope.extras[index].amount = 0.1 * $scope.min;
                    }
                });
                $scope.totalPane2 = 0.00;
                $.each($scope.extras, function() {
                    $scope.totalPane2 += parseFloat(this.amount) || 0;
                });
            }
        } else {
            if (typeof $scope.extras != "undefined") {
                $.each($scope.extras, function(index, extra) {
                    if (typeof extra != "undefined" && (extra.vendor == "Food" || extra.vendor == "food")) {
                        $scope.extras[index].amount = 0.00;
                    } else if (typeof extra != "undefined" && (extra.vendor == "Cakes" || extra.vendor == "cakes")) {
                        $scope.extras[index].amount = 0.00;
                    } else if (typeof extra != "undefined" && (extra.vendor == "Dress" || extra.vendor == "dress")) {
                        $scope.extras[index].amount = 0.00;
                    } else if (typeof extra != "undefined" && (extra.vendor == "Dj" || extra.vendor == "dj")) {
                        $scope.extras[index].amount = 0.00;
                    } else if (typeof extra != "undefined" && (extra.vendor == "Photographer" || extra.vendor == "photographer")) {
                        $scope.extras[index].amount = 0.00;
                    }
                });
                $scope.totalPane2 = 0.00;
                count = 0;
                $scope.hideOthers = true;
            }
        }
    });

    $scope.$watch('max', function() {
        if (typeof $scope.max != 'undefined' && ($.isNumeric($scope.max) && (+$scope.max > 0 && (+$scope.max > +$scope.min)))) {
            if (typeof $scope.extras != "undefined") {
                if ($scope.otherIsAdded) {
                    $scope.otherIsAdded = true;
                    return;
                }
                $.each($scope.extras, function(index, extra) {
                    if (typeof extra != "undefined" && (extra.vendor == "Food" || extra.vendor == "food")) {
                        if (typeof $scope.extras[index].max.amount == "undefined") {
                            $scope.extras[index].max.amount = 0.00;
                            $scope.extras[index].max.amount = 0.3 * $scope.max;
                            $scope.boundary = true;
                        } else {
                            $scope.boundary = true;
                            $scope.extras[index].max.amount = 0.3 * $scope.max;
                        }
                    } else if (typeof extra != "undefined" && (extra.vendor == "Cakes" || extra.vendor == "cakes")) {
                        if (typeof $scope.extras[index].max.amount == "undefined") {
                            $scope.extras[index].max.amount = 0.00;
                            $scope.extras[index].max.amount = 0.2 * $scope.max;
                            $scope.boundary = true;
                        } else {
                            $scope.boundary = true;
                            $scope.extras[index].max.amount = 0.2 * $scope.max;
                        }

                    } else if (typeof extra != "undefined" && (extra.vendor == "Dress" || extra.vendor == "dress")) {
                        if (typeof $scope.extras[index].max.amount == "undefined") {
                            $scope.extras[index].max.amount = 0.00;
                            $scope.extras[index].max.amount = 0.3 * $scope.max;
                            $scope.boundary = true;
                        } else {
                            $scope.boundary = true;
                            $scope.extras[index].max.amount = 0.3 * $scope.max;
                        }
                    } else if (typeof extra != "undefined" && (extra.vendor == "Dj" || extra.vendor == "dj")) {
                        if (typeof $scope.extras[index].max.amount == "undefined") {
                            $scope.extras[index].max.amount = 0.00;
                            $scope.extras[index].max.amount = 0.1 * $scope.max;
                            $scope.boundary = true;
                        } else {
                            $scope.boundary = true;
                            $scope.extras[index].max.amount = 0.1 * $scope.max;
                        }
                    } else if (typeof extra != "undefined" && (extra.vendor == "Photographer" || extra.vendor == "photographer")) {
                        if (typeof $scope.extras[index].max.amount == "undefined") {
                            $scope.extras[index].max.amount = 0.00;
                            $scope.extras[index].max.amount = 0.1 * $scope.max;
                            $scope.boundary = true;
                        } else {
                            $scope.boundary = true;
                            $scope.extras[index].max.amount = 0.1 * $scope.max;
                        }
                    }
                });
                $scope.totalMax = 0.00;
                $.each($scope.extras, function() {
                    $scope.totalMax += parseFloat(this.max.amount) || 0;
                });
            }
        } else {
            if (typeof $scope.extras != "undefined") {
                $.each($scope.extras, function(index, extra) {
                    if (typeof extra != "undefined" && (extra.vendor == "Food" || extra.vendor == "food")) {
                        $scope.extras[index].max.amount = undefined;
                    } else if (typeof extra != "undefined" && (extra.vendor == "Cakes" || extra.vendor == "cakes")) {
                        $scope.extras[index].max.amount = undefined;
                    } else if (typeof extra != "undefined" && (extra.vendor == "Dress" || extra.vendor == "dress")) {
                        $scope.extras[index].max.amount = undefined;
                    } else if (typeof extra != "undefined" && (extra.vendor == "Dj" || extra.vendor == "dj")) {
                        $scope.extras[index].max.amount = undefined;
                    } else if (typeof extra != "undefined" && (extra.vendor == "Photographer" || extra.vendor == "photographer")) {
                        $scope.extras[index].max.amount = undefined;
                    }
                });
                $scope.boundary = false;
                $scope.totalMax = undefined;
            }
        }
    });
    $scope.otherHanler = function() {
        if ($scope.addRow) {

        } else if (!$scope.addRow) {
            $scope.addRow = true;
        }
    };
    $scope.removeRow = function() {
        $scope.addRow = false;
        $('#ex1_value').val('');
        $('#ex2').val('');
    };
    $scope.addRowHandler = function() {
        var amount = $('#ex2').val();
        if (($.isNumeric(amount) && +amount > 0)) {
            if (amount > $scope.min) {
                $('#ex2').addClass('animated shake');
                $('#ex2').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                    $('#ex2').removeClass('animated shake');
                    $('#ex2').off('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend');
                });
                return;
            }
            if ($('#ex1_value').val().length <= 0) {
                $('#ex1_value').addClass('animated shake');
                $('#ex1_value').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                    $('#ex1_value').removeClass('animated shake');
                    $('#ex1_value').off('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend');
                });
            } else if ($('#ex1_value').val().trim().length > 0) {
                var value = $('#ex1_value').val();
                if (typeof $scope.extras != "undefined" && $scope.extras.length > 0) {
                    var there = false;
                    $.each($scope.extras, function(index, extra) {
                        if (extra.vendor.toLowerCase().trim() == value.toLowerCase().trim()) {
                            there = true;
                            $('#ex1_value').addClass('animated shake');
                            $('#ex1_value').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                                $('#ex1_value').removeClass('animated shake');
                                $('#ex1_value').off('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend');
                            });
                            $('#toolTip').tooltip();
                            $('#toolTip').tooltip("show");
                            $('#toolTip').find(".tooltip.fade.top").removeClass("in");
                            setTimeout(function() {
                                $('#toolTip').tooltip("hide");
                                $('#toolTip').tooltip("destroy");
                            }, 2000);
                        }
                    });
                    if (!there) {
                        $scope.addRow = false;
                        var other = {
                            name: $('#ex1_value').val(),
                            amount: amount
                        };
                        $('#ex1_value').val('');
                        $('#ex2').val('');
                        $scope.others.push(other);
                        if (typeof $scope.max == "undefined" || $scope.max == 0) {
                            $scope.max = 0.00;
                            $scope.max = $scope.min + (+other.amount);
                            $scope.totalMax = 0.00;
                            $scope.totalMax = $scope.max;
                        } else {

                            $scope.max = $scope.max + (+other.amount);

                        }
                        if (typeof $scope.min == "undefined" || $scope.min == 0) {
                            $scope.min = 0.00;
                            $scope.min = $scope.min + (+other.amount);
                            $scope.totalPane2 = 0.00;
                            $scope.totalPane2 = $scope.min;
                        } else {

                            $scope.min = $scope.min + (+other.amount);

                        }
                        $scope.totalBoundary = true;

                    }
                }
            }
        } else {
            $('#ex2').addClass('animated shake');
            $('#ex2').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                $('#ex2').removeClass('animated shake');
                $('#ex2').off('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend');
            });
        }
    };
    $scope.selectedVendors = function() {
        if (typeof arguments[0] != "undefined") {
            var valueSelected = arguments[0].originalObject.value;
            $('#ex2').focus();
        }

    };
    var type = "";
    $('.editAmount').click(function() {
        $('#editAmountModal').modal('show');
        var amount = $(this).attr('data-amount');
        amount = amount.replace(/\,/g, '');
        amount = parseInt(amount, 10);
        type = $(this).attr('data-type');
        $scope.$apply(function() {
            $scope.editItem = amount;
        });
        $('#save').click(function() {
            var amount = $('#editItem').val();
            if ($.isNumeric(amount) && +amount >= 0) {
                if (type == "food") {
                    $scope.$apply(function() {
                        $scope.foodPane2 = amount;
                        sumTotalPane2($scope);
                        $('#editAmountModal').modal('hide');
                    });
                } else if (type == "cakes") {
                    $scope.$apply(function() {
                        $scope.cakesPane2 = amount;
                        sumTotalPane2($scope);
                        $('#editAmountModal').modal('hide');
                    });
                } else if (type == "dress") {
                    $scope.$apply(function() {
                        $scope.dressPane2 = amount;
                        sumTotalPane2($scope);
                        $('#editAmountModal').modal('hide');
                    });
                } else if (type == "dj") {
                    $scope.$apply(function() {
                        $scope.djPane2 = amount;
                        sumTotalPane2($scope);
                        $('#editAmountModal').modal('hide');
                    });
                } else if (type == "photo") {
                    $scope.$apply(function() {
                        $scope.photographerPane2 = amount;
                        sumTotalPane2($scope);
                        $('#editAmountModal').modal('hide');
                    });
                }
            } else {
                $('#updateBox').addClass('animated shake');
                $('#updateBox').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                    $('#updateBox').removeClass('animated shake');
                    $('#updateBox').off('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend');
                });
            }
        });
    });
}]);
var app2 = angular.module('userApp', []);