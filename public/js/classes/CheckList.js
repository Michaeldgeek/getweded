class CheckList {

    constructor(user) {
        this.user = user;
    }

    getId() {
        return this.id;
    }
    setId(id) {
        this.id = id;
    }

    getCompleted() {
        return this.completed;
    }
    setCompleted(completed) {
        this.completed = completed;
    }

    getUser() {
        return this.user;
    }

    setName(name) {
        this.name = name;
    }
    getName() {
        return this.name;
    }

    setNote(note) {
        this.note = note;
    }
    getNote() {
        return this.note;
    }

    setReminder(reminder) {
        this.reminder = reminder;
    }
    getReminder() {
        return this.reminder;
    }

    static getUserCheckList($http, user) {
        var promise = $http({
            method: 'POST',
            url: '/user/checklist/',
            data: user
        });
        return promise;
    }
    static getUserCheckListCompleted($http, user) {
        var promise = $http({
            method: 'POST',
            url: '/user/checklist/completed/',
            data: user
        });
        return promise;
    }
    static editUserCheckListCompleted($http, checklist) {
        var promise = $http({
            method: 'POST',
            url: '/user/checklist/edit/',
            data: checklist
        });
        return promise;
    }
    static getUserCheckListUnCompleted($http, user) {
        var promise = $http({
            method: 'POST',
            url: '/user/checklist/uncompleted/',
            data: user
        });
        return promise;
    }
    static addCheckListItem($http, checklist) {
        var promise = $http({
            method: 'POST',
            url: '/user/checklist/add/',
            data: checklist
        });
        return promise;
    }
    static setReminderCheckListItem($http, checklist) {
        var promise = $http({
            method: 'POST',
            url: '/user/checklist/setreminder/',
            data: checklist
        });
        return promise;
    }

    static markListItem($http, checklist) {
        var promise = $http({
            method: 'POST',
            url: '/user/checklist/mark/',
            data: checklist
        });
        return promise;
    }
    static unmarkListItem($http, checklist) {
        var promise = $http({
            method: 'POST',
            url: '/user/checklist/unmark/',
            data: checklist
        });
        return promise;
    }
    static deleteListItem($http, checklist) {
        var promise = $http({
            method: 'POST',
            url: '/user/checklist/delete/',
            data: checklist
        });
        return promise;
    }

    static removeItemFromChecklist($, checklist) {
        $(checklist).each(function(index, element, array) {

        })
    }

}
export default CheckList;