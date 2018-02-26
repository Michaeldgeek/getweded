class User {

    constructor() {

    }

    getEmail() {
        return this.email;
    }

    getPassword() {
        return this.password;
    }

    getToken() {
        return this.token;
    }

    setEmail(email) {
        this.email = email;
        return this;
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
        return this;
    }

    getPhone() {
        return this.phone;
    }

    setPhone(phone) {
        this.phone = phone;
        return this;
    }

    getLocation() {
        return this.location;
    }

    setLocation(location) {
        this.location = location;
        return this;
    }

    setToken(token) {
        this.token = token;
        return this;
    }

    setPassword(password) {
        this.password = password;
        return this;
    }

    static loginUser(user, $http) {
        var email = user.getEmail();
        var password = user.getPassword();
        var promise = $http({
            url: '/login/',
            method: 'POST',
            data: { email: email, password: password }
        });
        return promise;
    }
}
export default User;