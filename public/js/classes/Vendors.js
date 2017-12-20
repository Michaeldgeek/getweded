import Util from './Util';
class Vendors {

    constructor() {
        this.vendors = [
            { name: 'Food', amount: 0.00, edited: false },
            { name: 'Cakes', amount: 0.00, edited: false },
            { name: 'Dress', amount: 0.00, edited: false },
            { name: 'Dj', amount: 0.00, edited: false },
            { name: 'Photographer', amount: 0.00, edited: false }
        ];
        this.vendorsListExtra = [
            { name: 'Band', value: 'Band', amount: 0.00, id: "1", edited: false },
            { name: 'Beauty & Health', value: 'Beauty & Health', amount: 0.00, id: "2", edited: false },
            { name: 'Food', value: 'Food', amount: 0.00, id: "3", edited: false },
            { name: 'Ceremony & Reception Venue', value: 'Ceremony & Reception Venue', amount: 0.00, id: "4", edited: false },
            { name: 'Ceremony Music', value: 'Ceremony Music', amount: 0.00, id: "5", edited: false },
            { name: 'Dj', value: 'Dj', amount: 0.00, id: "6", edited: false },
            { name: 'Dress', value: 'Dress', amount: 0.00, id: "7", edited: false },
            { name: 'Event Rentals & Photobooths', value: 'Event Rentals & Photobooths', amount: 0.00, id: "8", edited: false },
            { name: 'Favors & Gifts', value: 'Favors & Gifts', amount: 0.00, id: "9", edited: false },
            { name: 'Flowers', value: 'Flowers', amount: 0.00, id: "10", edited: false },
            { name: 'Guest Accommodations', value: 'Guest Accommodations', amount: 0.00, id: "11", edited: false },
            { name: 'Invitations', value: 'Invitations', amount: 0.00, id: "12", edited: false },
            { name: 'Jewelry', value: 'Jewelry', amount: 0.00, id: "13", edited: false },
            { name: 'Lighting & Decor', value: 'Lighting & Decor', amount: 0.00, id: "14", edited: false },
            { name: 'Name Change Service', value: 'Name Change Service', amount: 0.00, id: "15", edited: false },
            { name: 'Officiant', value: 'Officiant', amount: 0.00, id: "16", edited: false },
            { name: 'Photographer', value: 'Photographer', amount: 0.00, id: "17", edited: false },
            { name: 'Rehearsal Dinner Location', value: 'Rehearsal Dinner Location', amount: 0.00, id: "18", edited: false },
            { name: 'Transportation', value: 'Transportation', amount: 0.00, id: "19", edited: false },
            { name: 'Travel', value: 'Travel', amount: 0.00, id: "20", edited: false },
            { name: 'Tuxedos and Suits', value: 'Tuxedos and Suits', amount: 0.00, id: "21", edited: false },
            { name: 'Videography', value: 'Videography', amount: 0.00, id: "22", edited: false },
            { name: 'Cakes', value: 'Cakes', amount: 0.00, id: "23", edited: false },
            { name: 'Wedding Planning', value: 'Wedding Planning', amount: 0.00, id: "24", edited: false }
        ]
    }

    getVendors() {
        return this.vendors;
    }

    setVendors(vendors) {
        this.vendors = vendors;
    }

    getVendorsForUserInput() {
        return this.vendorsListExtra;
    }


    setVendorsForUserInput(vendors) {
        this.vendorsListExtra = vendors;
    }

    static calculateDefaultBudget(vendors, jQuery, min) {
        var totalVendorAmount = Vendors.getTotalVendorsAmount(vendors, jQuery);
        var defaultBudget = 0.00;
        jQuery.each(vendors, function(index, vendor) {
            if (vendor.edited === false) {
                if (totalVendorAmount > min) {
                    vendor.amount = min * Util.generateRandomNumberWithinRange(0.19, 0.09);
                } else {
                    vendor.amount = min * Util.generateRandomNumberWithinRange(0.19, 0.09);

                }
            }
        });
        return vendors;
    }

    static calculateRecommendedBudget(vendors, jQuery, min) {
        var totalVendorAmount = Vendors.getTotalRecommendedVendorsAmount(vendors, jQuery);
        var defaultBudget = 0.00;
        jQuery.each(vendors, function(index, vendor) {
            if (vendor.edited === false) {
                if (totalVendorAmount > min) {
                    vendor.amount = min * Util.generateRandomNumberWithinRange(0.19, 0.09);
                } else {
                    vendor.amount = min * Util.generateRandomNumberWithinRange(0.19, 0.09);

                }
            }
        });
        return vendors;
    }

    static resetVendorAmount(vendors, jQuery) {
        if (typeof vendors != "undefined") {
            jQuery.each(vendors, function(index, vendor) {
                vendor.amount = 0.00;
            });
        }
    }

    static resetRecommendedVendorAmount(vendors, jQuery) {
        if (typeof vendors != "undefined") {
            jQuery.each(vendors, function(index, vendor) {
                vendor.amount = 0.00;
            });
        }
    }

    static editVendorAmount($, amount, type, vendors) {
        $.each(vendors, function(index, element) {
            if (element.name.trim().toLowerCase() == type.trim().toLowerCase()) {
                element.amount = parseFloat(amount);
                element.edited = true;
                return true;
            }
        });

    }

    static lockMinInput() {

    }

    static updateTotalMax($scope, $) {
        $scope.totalMax = Vendors.getTotalVendorsAmount($scope.vendors, $);
    }

    static updateRecTotalMax($scope, $) {
        $scope.totalRecMax = Vendors.getTotalRecommendedVendorsAmount($scope.recommendedVendors, $);
    }


    static hasVendorListBeenTampered(vendors, jQuery) {
        var ans = false;
        if (typeof vendors != "undefined") {
            jQuery.each(vendors, function(index, vendor) {
                if (vendors.edited == true) {
                    ans = true;
                }
            });
            return ans;
        }
    }

    static removeVendor($, vendors, type) {
        $.each(vendors, function(index, element) {
            if (typeof element == "undefined") {
                return;
            }
            if (element.name.trim().toLowerCase() == type.trim().toLowerCase()) {
                vendors.splice(index, 1);
                return true;
            }
        });
    }

    static getTotalVendorsAmount(vendors, jQuery) {
        var sum = 0.0;
        jQuery.each(vendors, function(index, vendor) {
            sum += parseFloat(vendor.amount);
        });
        return parseFloat(sum);
    }

    static getTotalRecommendedVendorsAmount(vendors, jQuery) {
        var sum = 0.0;
        jQuery.each(vendors, function(index, vendor) {
            sum += parseFloat(vendor.amount);
        });
        return parseFloat(sum);
    }

    static getVendor(vendors, type, $) {
        var vendor = undefined;
        $.each(vendors, function(index, element) {
            if (typeof element == "undefined") {
                console.log(element + ",,,");
                return;
            }
            if (element.name.trim().toLowerCase() == type.trim().toLowerCase()) {
                console.log('found');
                vendor = element;
                return;
            }
        });
        return vendor;
    }

    static addNewVendor(vendor, jQuery, min, vendors) {
        var $ = jQuery;
        var amount = parseFloat(vendor.amount);
        var name = vendor.name.trim();
        if (($.isNumeric(amount) && amount > 0)) {
            if (amount > min) {
                Util.showPopOver('#ex2', "Amount exceeds budget amount. Do you wish to increase budget", $);
                Util.animateFlash('ex2', $, 'shake');
                return;
            }
            if ((Vendors.getTotalVendorsAmount(vendors, $) + amount) > min) {
                var sum = Vendors.getTotalVendorsAmount(vendors, $) + amount;
                Util.showPopOver('#ex2', "Total vendor amount exceeds budget amount. Do you wish to increase budget", $);
                Util.animateFlash('ex2', $, 'shake');
                return;
            }
            if (name <= 0) {
                Util.animateFlash('ex1_value', $, 'shake');
            } else if (name.length > 0) {
                var matchFound = false;
                $.each(vendors, function(index, element) {
                    if (element.name.toLowerCase().trim() == name.toLowerCase()) {
                        matchFound = true;
                        Util.hidePopOver('#ex2', $);
                        Util.showPopOverNoFooter('#ex1_value', $, 'Vendor already exist. Consider editing');
                        Util.animateFlash('ex1_value', $, 'shake');
                        return;
                    }
                });
                if (!matchFound) {
                    $('#ex1_value').val('');
                    $('#ex2').val('');
                    vendors.push(vendor);
                    Util.hidePopOver('#ex1_value', $);
                    Util.hidePopOver('#ex2', $);
                    return vendors;
                }
            }
        } else {
            Util.animateFlash('ex2', $, "shake");
        }
    }

}

export default Vendors;