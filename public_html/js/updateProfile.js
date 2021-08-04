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

$(function() {
    $.ajax({
        url: "http://localhost:8888/web/islogin",
        method: 'GET',
        success: ((message) => {
            if(message=="-1") {
                alert("You haven't login yet")
                location.href="http://localhost:8888/login.html"
            } else {
                $("#username").val(sessionStorage.getItem("loginer"))
                $("#form").submit(function() {
                    $(this).ajaxSubmit({
                        url: "http://localhost:8888/user/updateUser",
                        type:'POST',
                        success:function (result){
                            console.log(result)
                            if(result=="1") {
                                alert("Success")
                                location.href="http://localhost:8888/homePage.html"
                            } else if(result=="-1"){
                                alert("Failed");
                                location.reload()
                            } else if (result=="psderror"){
                                $("#warnings").show();
                                $("#warnings").html("Wrong Password");
                            }
                        }
                    })
                })
            }
        })
    })
})