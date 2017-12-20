class Selections {

    constructor() {
        this.userLocation = undefined;
        this.time = undefined;
        this.guestNumber = '';
        this.vendors = [];
        this.info = '';

    }
    getUserLocation() {
        return this.userLocation;
    }
    getTime() {
        return this.time;
    }
    getGuestNumber() {
        return this.guestNumber;
    }
    getVendors() {
        return this.vendors;
    }
    getInfo() {
        return this.info;
    }

    setUserLocation(location) {
        this.userLocation = location;
    }
    setTime(time) {
        this.time = time;
    }
    setGuestNumber(guestNumber) {
        this.guestNumber = guestNumber;
    }
    addVendors(vendor) {
        this.vendors.push(vendor);
    }
    removeVendors(vendor) {
        this.vendors = this.vendors.filter(function(el) {
            return el.name != vendor.name;
        });
    }
    setInfo(info) {
        this.info = info;
    }


}
var selection = new Selections();
export default selection;