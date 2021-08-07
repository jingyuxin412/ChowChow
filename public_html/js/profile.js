$(function () {
    islogin(function (result) {
        if(result==1){
            //已经登录
            $(".setPersonData").show()//设置个人资料
        }else{
            //没有登录
            $(".setPersonData").hide()
        }
    })
    var author = decodeURIComponent(location.search.slice(6));
    var login = parseInt(sessionStorage.getItem("login"));
    var loginer=sessionStorage.getItem("loginer")
    
    console.log(loginer);

    if(!author&&!login){
        alert("You haven't login yet");
        location.href="http://localhost:8888/login.html";
    }
    var  url1="http://localhost:8888/post/getAllPostCount?name="+author+"&page=";
    var  url2="http://localhost:8888/post/getPersonPost?name="+author+"&page=";
    if(author) {
        $("#myComment").hide()
        if(author==loginer){
            $(".post-wrap").addClass("del")
            $("#myComment").show()
        }

        getPostCount(url1,function (page,count) {
            var pageSize=parseInt(page)+1;
            for(var i=1;i<pageSize;i++){
                var page=$("<li></li>").html(i);
                $(".pageCount ul").append(page)
            }
            $(".text-box span").html(count)
        })

        getUser(author, function (result) {
            $(".person_avatar img").attr("src",result.avatar);
            $(".person_name").html(result.username)
            getpost(url2, 1)
        })

    } else if(login){
        $(".post-wrap").addClass("del")
        $("#myComment").show()
        var username=sessionStorage.getItem("loginer");
        var avatar=sessionStorage.getItem("loginAvatar");
        $(".person_name").html(username);
        $(".person_avatar img").attr("src",avatar);
        console.log(avatar)
        getPostCount(url1,function (page,count) {
            var pageSize=parseInt(page)+1;
            for(var i=1;i<pageSize;i++){
                var page=$("<li></li>").html(i);
                $(".pageCount ul").append(page)
                $(".text-box span").html(count)
            }
        })
        getpost(url2,1)
    }
    $(".pageCount ul").on("click","li", function (e) {
        var  page=$(this).html();
        getpost(url2,page)
    })
})