function login() {
    let username = $('#username').val();
    let password = $('#password').val();
    $.ajax({
        url: 'http://localhost:8888/user/login',
        method: 'POST',
        data: {
            username: username,
            password: password
        },
        success: ((message) => {
            if (message == '1') {
                alert("Login Success!");
                window.location.href="http://localhost:8888/homePage.html";
            } else {
                $("#warnings").show().html("Wrong Username/Password!");
            }
        })
    });
}