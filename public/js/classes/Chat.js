class Chat {

    constructor() {

    }

    static getRecentChatList(user, $http) {
        var promise = $http({
            url: "/user/get_recent_chats",
            method: "POST",
            data: user
        });
        return promise;
    }
}