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
    //跳转到这个页面，我要根据url上的参数去取相应的数据
    //如果name的值为空，则不让你跳转到这个页面
    var author = decodeURIComponent(location.search.slice(6));
    var login = parseInt(sessionStorage.getItem("login"));
    var loginer=sessionStorage.getItem("loginer")

    //console.log( typeof  login)
    //console.log(login)
    //没有参数，而且没有登录是不能进来的
    
    console.log(loginer);

    if(!author&&!login){
        alert("You haven't login yet");
        location.href="http://localhost:8888/login.html";
    }
    var  url1="http://localhost:8888/post/getAllPostCount?name="+author+"&page=";
    var  url2="http://localhost:8888/post/getPersonPost?name="+author+"&page=";
    if(author) {
        // $(".setPersonData").hide()
        $("#myComment").hide()
        if(author==loginer){
            $(".post-wrap").addClass("del")
            $("#myComment").show()
        }
        
        //没有登录，可以访问空间
        //获取用户
        //获取相应的用户发的帖子总数

        getPostCount(url1,function (page,count) {
            var pageSize=parseInt(page)+1;
            for(var i=1;i<pageSize;i++){
                var page=$("<li></li>").html(i);
                $(".pageCount ul").append(page)
            }
            $(".text-box span").html(count)
        })

        //获取相应的用户及他发的帖子
        getUser(author, function (result) {
            //console.log(result)
            $(".person_avatar img").attr("src",result.avatar);
            $(".person_name").html(result.username)
            //获取用户所有帖子
            getpost(url2, 1)
        })

    } else if(login){
        //已经登录,跳转到自己的个人主页
        //只是进的是自己的主页才能显示删除
        $(".post-wrap").addClass("del")
        $("#myComment").show()
        var username=sessionStorage.getItem("loginer");
        var avatar=sessionStorage.getItem("loginAvatar");
        $(".person_name").html(username);
        $(".person_avatar img").attr("src",avatar);
        console.log(avatar)
        //获取用户帖子总数
        getPostCount(url1,function (page,count) {
            var pageSize=parseInt(page)+1;
            for(var i=1;i<pageSize;i++){
                var page=$("<li></li>").html(i);
                $(".pageCount ul").append(page)
                //console.log(count)
                $(".text-box span").html(count)
            }
        })

        //获取用户所有帖子
        getpost(url2,1)
    }
    //点击获取相应的页数帖子
    $(".pageCount ul").on("click","li", function (e) {
        var  page=$(this).html();
        getpost(url2,page)
    })
})