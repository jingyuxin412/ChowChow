function register() {
    let username = $('#username').val();
    let password = $('#password').val();
    let comfirm_password = $('#comfirm_password').val();

    if (comfirm_password != password) {
        $("#warnings").show().html("Password did not match!")
    } else {
        $.ajax({
            url: '/user/regist',
            method: 'POST',
            data: {
                username: username,
                password: password
            },
            success: ((message) => {
                if (message == "1") {
                    alert("Register Success!");
                    location.href="/homePage.html";
                    sessionStorage.setItem("login",1);
                } else {
                    $("#warnings").show().html("Username is already exit!");
                }
            })
        });
    }
}