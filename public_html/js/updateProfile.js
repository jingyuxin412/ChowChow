function update() {
    $.ajax({
        url: '/web/islogin',
        method: 'GET',
        success: ((message) => {
            console.log(message);
            if(message=="-1"){
                alert("You haven't login yet")
                location.href="/login.html"
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
        url: "/web/islogin",
        method: 'GET',
        success: ((message) => {
            if(message=="-1") {
                alert("You haven't login yet")
                location.href="/login.html"
            } else {
                $("#username").val(sessionStorage.getItem("loginer"))
                $("#form").submit(function() {
                    $(this).ajaxSubmit({
                        url: "/user/updateUser",
                        type:'POST',
                        success:function (result){
                            console.log(result)
                            if(result=="1") {
                                alert("Success")
                                location.href="/homePage.html"
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