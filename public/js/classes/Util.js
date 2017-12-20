class Util {

    static generateRandomNumberWithinRange(max, min) {
        var number = Math.floor(Math.random() * (max - min + 1)) + min;
        if (number > max) {
            return 0.12;
        } else {
            return number;
        }
    }
    static sendVerificationCode($http, data) {
        var promise = $http({
            method: 'POST',
            url: '/verify-phone/',
            data: data
        });
        return promise;
    }
    static verifyCode($http, data) {
        var promise = $http({
            method: 'POST',
            url: '/verify-sms-code/',
            data: data
        });
        return promise;
    }
    static sendSmsCode($http, phone) {
        var promise = $http({
            method: 'POST',
            url: '/send-sms-code/',
            data: phone
        });
        return promise;
    }
    static startSpinner(target) {
        var opts = {
            lines: 13, // The number of lines to draw
            length: 28, // The length of each line
            width: 5, // The line thickness
            radius: 20, // The radius of the inner circle
            scale: 0.3, // Scales overall size of the spinner
            corners: 1, // Corner roundness (0..1)
            color: '#3387CC', // #rgb or #rrggbb or array of colors
            opacity: 0.25, // Opacity of the lines
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            speed: 2, // Rounds per second
            trail: 60, // Afterglow percentage
            fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
            zIndex: 100, // The z-index (defaults to 2000000000)
            className: 'spinner', // The CSS class to assign to the spinner
            top: '50%', // Top position relative to parent
            left: '50%', // Left position relative to parent
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            position: 'absolute', // Element positioning
        };
        var spinner = new Spinner(opts);
        spinner.spin(target);
        return spinner;
    }
    static animateFlash(id, $, type) {
        $('#' + id).addClass('animated ' + type);
        $('#' + id).on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $('#' + id).removeClass('animated ' + type);
            $('#' + id).off('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend');
        });
    }
    static showPopOver(selector, msg, $) {
        $(selector).webuiPopover({ trigger: 'manual', placement: 'top' });
        $(selector).webuiPopover('show', { placement: 'top' });
        $('.note').text(msg);
    }
    static showPopOverNoFooter(selector, $, msg) {
        $(selector).webuiPopover({ trigger: 'manual', placement: 'top', content: msg });
        $(selector).webuiPopover('show', { placement: 'top' });
    }
    static hidePopOver(selector, $) {
        WebuiPopovers.hideAll();
    }
    static geListOfStates() {
        return [
            { id: 'none', name: 'Select State' },
            { id: 'Abia', name: 'Abia' },
            { id: 'Abuja', name: 'Abuja' },
            { id: 'Adamawa', name: 'Adamawa' },
            { id: 'Anambra', name: 'Anambra' },
            { id: 'Akwa Ibom', name: 'Akwa Ibom' },
            { id: 'Bauchi', name: 'Bauchi' },
            { id: 'Bayelsa', name: 'Bayelsa' },
            { id: 'Benue', name: 'Benue' },
            { id: 'Borno', name: 'Borno' },
            { id: 'Cross River', name: 'Cross River' },
            { id: 'Delta', name: 'Delta' },
            { id: 'Ebonyi', name: 'Ebonyi' },
            { id: 'Enugu', name: 'Enugu' },
            { id: 'Edo', name: 'Edo' },
            { id: 'Ekiti', name: 'Ekiti' },
            { id: 'Gombe', name: 'Gombe' },
            { id: 'Imo', name: 'Imo' },
            { id: 'Jigawa', name: 'Jigawa' },
            { id: 'Kaduna', name: 'Kaduna' },
            { id: 'Kano', name: 'Kano' },
            { id: 'Katsina', name: 'Katsina' },
            { id: 'Kebbi', name: 'Kebbi' },
            { id: 'Kogi', name: 'Kogi' },
            { id: 'Kwara', name: 'Kwara' },
            { id: 'Lagos', name: 'Lagos' },
            { id: 'Nasarawa', name: 'Nasarawa' },
            { id: 'Niger', name: 'Niger' },
            { id: 'Ogun', name: 'Ogun' },
            { id: 'Ondo', name: 'Ondo' },
            { id: 'Osun', name: 'Osun' },
            { id: 'Oyo', name: 'Oyo' },
            { id: 'Plateau', name: 'Plateau' },
            { id: 'Rivers', name: 'Rivers' },
            { id: 'Sokoto', name: 'Sokoto' },
            { id: 'Taraba', name: 'Taraba' },
            { id: 'Yobe', name: 'Yobe' },
            { id: 'Zamfara', name: 'Zamfara' }
        ];
    }

}
export default Util;