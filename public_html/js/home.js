$(function() {
    islogin(function (result,result2) {
        if(result==1){
            $(".avatar img").attr("src", "./"+ result2.avatar)
            console.log(result2.avatar)
            $(".post").show()
            var role=sessionStorage.getItem("loginRole");
            $("#member").show()
        } else {
            $(".avatar img").attr("src","./duck.jpeg")
            $(".post").hide();
            $("#tourist").show()
        }
    })
    var  url="http://localhost:8888/post/getAllPost?page=";

    //获取帖子总数
    getPostCount("http://localhost:8888/post/getAllPostCount",function (page) {
        var pageSize=parseInt(page)+1;

        for(var i=1;i<pageSize;i++){

            var page=$("<li></li>").html(i);
            $(".pageCount ul").append(page)
        }
    })

    //点击页数获取帖子
    $(".pageCount ul").on("click","li", function (e) {
        var  page=$(this).html();
        getpost(url,page)
    })

    //默认获取第一页帖子
    getpost(url,1);
    
    //管理员管理帖子
    $(".manager").on("click","a", function () {
        if(this.id=="showAllUser"){
            if($(this).hasClass("on")){
                $(this).removeClass("on")
            }else{
                $(this).addClass("on")
            }
        }else if(this.id=="managePost"){
            if($(this).hasClass("on")){
                $(".post-wrap").removeClass("del")
                $(this).removeClass("on")
            }else{
                $(".post-wrap").addClass("del")
                $(this).addClass("on")
            }
        }
    })


    //监听发帖事件
    $("#postSub").on("click", function() {
        var title=$("#postTitle").val()
        var val = $("#postContent").val();
        if(val&&title) {
            //内容不为空
            $.post("http://localhost:8888/post/setPost", $("#form").serialize(), function(result) {
                if(result == "1") {
                    //发表成功
                    alert("Success")
                    $("#form")[0].reset()
                    location.reload()

                } else {
                    //发表失败
                    alert("Faile")
                }
            })
        } else  {
            alert("Content or title cannot be NULL")
        }
    })

})