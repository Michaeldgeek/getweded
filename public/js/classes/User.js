class User {

    constructor() {

    }

    getEmail() {
        return this.email;
    }

    getPassword() {
        return this.password;
    }

    setEmail(email) {
        this.email = email;
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