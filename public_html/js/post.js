function islogin(callback){
    $.ajax({
        url: "http://localhost:8888/web/islogin",
        method: "GET",
        success: ((result) => {
            if (result == "-1") {
                if(callback){
                    callback(-1,result)
                }
                $(".user").hide();
                $(".login").show();
                sessionStorage.removeItem("login");
                sessionStorage.removeItem("loginer");
                sessionStorage.removeItem("loginAvatar");
                sessionStorage.removeItem("loginRole")
                sessionStorage.removeItem("newComment");
            } else {
                $(".user").show();
                $(".login").hide();
                sessionStorage.setItem("login",1);
                sessionStorage.setItem("loginer",result.username);
                sessionStorage.setItem("loginAvatar",result.avatar);
                sessionStorage.setItem("loginRole",result.role);
                sessionStorage.setItem("newComment",JSON.stringify(result.newComment));
                $("#username").html(result.username)
    
                //只有新评论不为0的时候，才显示提示框
                if(parseInt(result.newcommentCount)){
                    $(".commentPrompt").fadeIn(500);
                    $(".commentPrompt .comment-inner").html("你有新评论哦");
                    $(".newCount").html(result.newcommentCount)
                }else{
                    $(".commentPrompt").hide(500);
                }
                if(callback){
                    callback(1,result)
                }
                $("#personPage").attr("href","http://localhost:8888/personPage.html?name="+result.username)
            }
        })
    })
}

//获取帖子
function getpost(url,page){
    $.ajax({
        url: url + page,
        method: "GET",
        success: ((result) => {
            $(".post-wrap").empty()
            result.forEach(function(item) {
                var date=FormatDate(item.postDate)
                var article = [
                    '<article class="talk">',
                    '<div class="talk_info">',
                    '<div class="info_avatar">',
                    '<a  target="_blank" href="http://localhost:8888/personPage.html?name=',item.author,
                    ,'">',
                    '<img src=',item.avatar ,'></a>',
                    '</div>',
                    '<div class="info_text">',
                        '<p class="author">',item.author ,'</p>',
                        '<p>', date, '</p>',
                    '</div>',
                    '<a class="delPost" postid="',
                    item._id,'">','Delete this Post</a>',
                    '</div>',
                    '<div class="talk_content">',
                    '<div class="title">',
                    '<p><a href="http://localhost:8888/detailPage.html?postid=',
                    item._id,'" target="_blank">',
                    item.postTitle,
                    '</a></p>',
                    '</div>',
                    '<div class="content">',
                    '<p>', item.postContent, '</p>',
                    '</div>',
                    '</div>',
                    '</article>'
                ].join("");
                $(".post-wrap").append($(article));
            })
        })
    })
    $(".post-wrap").on("click",".delPost",function(){
        var url= "http://localhost:8888/post/delPost?postid=";
         var postid=$(this).attr("postid");
 
         if(confirm("You sure?")){
             $.get(url+postid, function (result) {
                 console.log(result)
                 if(result.ok==1){
                     alert("Success")
                     location.reload()
                 }
                 console.log(result)
             })
         }
     })
}

//获取用户
function getUser(name,callback){
    $.ajax({
        url: "http://localhost:8888/user/findUser?name=" + name,
        methor: "GET",
        success: ((result) => {
            callback(result)
        })
    })
}

//时间格式化
function FormatDate (date) {
    var date=new Date(date)
    return date.toLocaleDateString()+" "+date.toLocaleTimeString();
}

//获取帖子总数
function getPostCount(url,callback){
    $.ajax({
        url: url,
        methor: "GET",
        success: ((result) => {
            callback(result[0],result[1])
        })
    })
}