class Profile {

    constructor() {

    }

    static updateName(user, $http) {
        var promise = $http({
            url: "/user/profile/update-name/",
            method: "POST",
            data: user
        });
        return promise;
    }

    static updateEmail(user, $http) {
        var promise = $http({
            url: "/user/profile/update-email/",
            method: "POST",
            data: user
        });
        return promise;
    }

    static updatePhone(user, $http) {
        var promise = $http({
            url: "/user/profile/update-phone/",
            method: "POST",
            data: user
        });
        return promise;
    }

    static updateLocation(user, $http) {
        var promise = $http({
            url: "/user/profile/update-location/",
            method: "POST",
            data: user
        });
        return promise;
    }
}
export default Profile;