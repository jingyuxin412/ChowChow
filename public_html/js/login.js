function login() {
    let username = $('#username').val();
    let password = $('#password').val();
    $.ajax({
        url: '/user/login',
        method: 'POST',
        data: {
            username: username,
            password: password
        },
        success: ((message) => {
            if (message == '1') {
                alert("Login Success!");
                window.location.href="/homePage.html";
            } else {
                $("#warnings").show().html("Wrong Username/Password!");
            }
        })
    });
}