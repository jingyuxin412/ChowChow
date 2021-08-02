function update() {
    $.ajax({
        url: 'http://localhost:8888/web/islogin',
        method: 'GET',
        success: ((message) => {
            console.log(message);
            if(message=="-1"){
                alert("You haven't login yet")
                location.href="http://localhost:8888/login.html"
            } else {
                var username =sessionStorage.getItem("loginer");
                $("#username").val(username);
                return message;
            }
        })
    });
}