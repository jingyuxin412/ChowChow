

function islogin(callback){
    $.ajax({
        url: "/web/islogin",
        method: "GET",
        success: ((result) => {
            if (result == "-1") {
                if(callback){
                    callback(-1,result)
                }
                $(".user").hide();
                $(".login").show();
                $(".text-box").hide();
                $(".post-clearfix").hide();
                sessionStorage.removeItem("login");
                sessionStorage.removeItem("loginer");
                sessionStorage.removeItem("loginAvatar");
                sessionStorage.removeItem("loginRole")
                sessionStorage.removeItem("newComment");
                $(".avatar img").attr("src","./duck.jpeg")
                $(".post").hide();
                $("#tourist").show()
            } else {
                $(".user").show();
                $(".post-clearfix").show();
                $(".login").hide();
                sessionStorage.setItem("login",1);
                sessionStorage.setItem("loginer",result.username);
                sessionStorage.setItem("loginAvatar",result.avatar);
                sessionStorage.setItem("loginRole",result.role);
                sessionStorage.setItem("newComment",JSON.stringify(result.newComment));
                $("#username").html(result.username)
    
                if(parseInt(result.newcommentCount)){
                    $(".commentPrompt").fadeIn(500);
                    $(".commentPrompt .comment-inner").html("You have new comment(s)!");
                } else {
                    $(".commentPrompt").hide(500);
                }
                if(callback){
                    callback(1,result)
                }
                $("#personPage").attr("href","/personPage.html?name="+result.username)

                $(".avatar img").attr("src", "./"+ result.avatar)
                $(".post").show()
                $("#member").show()
            }
        })
    })
}

function getpost(url,page){
    $.ajax ({
        url: url + page,
        method: "GET",
        success: ((result) => {

            $(".post-wrap").empty()
            $(".search-post-wrap").hide();
            if (result.length != 0) {
                result.forEach(function(item) {
                    console.log(item);
                    var date=FormatDate(item.postDate)
                    var article = [
                        '<article class="thread"><div class="thread_info"><div class="info_avatar"><a  target="_blank"><img class=\'authorAvatar\' src=',item.avatar ,'></a></div>',
                        '<div class="info_text"><p class="author">',item.author ,'</p><p>', date, '</p></div>',
                        '</div><div class="talk_content"><div class="title"><p><a href="/detailPage.html?postid=',
                        item._id,'" target="_blank">',
                        item.postTitle,
                        '</a></p></div><div class="content"><p>', item.postContent, '</p>',
                        '</div></div></article>'
                    ].join("");
                    $(".post-wrap").append($(article));
                })
            } else {
                $(".post-wrap").html("<h1>No posts! You can post a thread after login.</h1>");
            }
        })
    })
}

function getUser(name,callback){
    $.ajax({
        url: "/user/findUser?name=" + name,
        method: "GET",
        success: ((result) => {
            callback(result)
        })
    })
}

function FormatDate(date) {
    var date=new Date(date)
    return date.toLocaleDateString()+" "+date.toLocaleTimeString();
}

function getPostCount(url,callback){
    $.ajax({
        url: url,
        method: "GET",
        success: ((result) => {
            callback(result[0],result[1])
        })
    })
}

function logout() {
    $.ajax({
        url: "./user/logout",
        method: "GET", 
        success: ((retVal) => {
            if (retVal == "1") {
                console.log("Logout success!");
                alert("Logout success!");                
            }
        })
    })
}