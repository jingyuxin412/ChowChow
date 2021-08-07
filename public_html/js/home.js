$(function() {    
    var url="/post/getAllPost?page=";
    getPostCount("/getAllPostCount",function (page) {
        var pageSize=parseInt(page)+1;
        for(var i=1;i<pageSize;i++){
            var page=$("<li></li>").html(i);
            $(".pageCount ul").append(page)
        }
    })

    $(".pageCount ul").on("click","li", function (e) {
        var  page=$(this).html();
        getpost(url,page)
    })

    getpost(url,1);

    $("#postSub").on("click", function() {
        var title=$("#postTitle").val()
        var val = $("#postContent").val();
        if(val&&title) {
            $.post("/post/setPost", $("#form").serialize(), function(result) {
                if(result == "1") {
                    alert("Success")
                    $("#form")[0].reset()
                    location.reload()

                } else {
                    alert("Faile")
                }
            })
        } else  {
            alert("Content or title cannot be NULL")
        }
    });

    $('#searchPost').on("click", function() {
        var keyword = $('#searchPosts').val()
        console.log(keyword);
        $.ajax({
            url: "/post/searchPost/?keyword=" + keyword,
            method: "GET",
            success: ((posts) => {
                console.log(posts);
                if (posts == "-1") {
                    $('.pageCount').hide();
                    $('.post-wrap').hide();
                    $(".search-post-wrap").show()
                    $(".search-post-wrap").empty();
                    $(".search-post-wrap").html("No such post!");
                } else {
                    $('.pageCount').hide();
                    $('.post-wrap').hide();
                    $(".search-post-wrap").show()
                    $(".search-post-wrap").empty()
                    posts.forEach(function(post) {
                        var date=FormatDate(post.postDate)
                        var article = 
                            '<article class="thread">' + '<div class="thread_info">' +
                            '<div class="info_avatar">' + '<a  target="_blank" href="./personPage.html?name=' + post.author +
                             + '">' + '<img class=\'authorAvatar\' src='+ post.avatar + '></a>' + 
                            '</div>' + '<div class="info_text">'+ '<p class="author">' + post.author + '</p>' + '<p>'+ date+ '</p>'+
                            '</div>'+ '</div>'+'<div class="talk_content">'+
                            '<div class="title">'+'<p><a href="./detailPage.html?postid='+
                            post._id + '" target="_blank">'+post.postTitle+
                            '</a></p>'+'</div>'+'<div class="content">'+
                            '<p>' + post.postContent + '</p>'+'</div>'+
                            '</div>'+'</article>'
                        $(".search-post-wrap").append($(article));
                    })
                }
            })
        });
    });

    $(".iknow").children().click(function () {
        console.log($(this).html());
        if($(this).html()=="Cancel"){
            $(".commentPrompt").fadeOut();
            $(".webblog_main").show()
            return;
        }else{
            $(".shadeBg").show()
            $(".webblog_main").hide()
            $(".showNewComment").addClass("on")
            $.get("/post/showUserNewComment", function (result) {

                createNewComment(result)
                console.log(result)
                roller.init ({
                    rollClass: "roller",
                    orbitalClass:"orbital",
                    content:$(".showNewComment-content"),
                    outBox:$(".showNewComment-inner")
                })
            })
            $(".commentPrompt").fadeOut();
        }
    })
})

function createNewComment(result){
    $(".showNewComment-content").empty()
    console.log(result)
    result.forEach(function (item) {
        var  date=FormatDate(item.commentDate);
        var  comment=$(
            '<article class="newComment-wrap" postid="'+item.postId+'">'+
            '<div class="newComment-part">'+
            '<div class="newComment-info clearfix">'+
            '<div class="newCommentAvatar">'+
            '<img src="'+item.authorAvatar+'"/>'+
            '</div>'+
            '<div class="newCommenttext">'+
            '<p>'+item.authorName+'</p>'+
            '<p>'+date+'</p>'+
            '</div>'+
            '</div>'+
            '<div class="newComment-content"><p>'+
            item.commentContent+
            '</p><div class="newComment-opt">'+
            '<a href="./detailPage.html?postid='+item.postId+'">Detail</a>'+
            '</div></div></div>'+
            '</article>');
        if(item.lastAuthor){
            var lastComment=$(
                 '<div class="lastComment">'+
                    '<div class="lastAuthor">'+
                        '<span>You</span>'+
                        '<span>Reply </span>'+
                        '<span>'+item.authorName+'</span>'+
                        '<span> : </span>'+
                    '</div>'+
                    '<div class="lastContent">'+item.lastCommentContent+'</div>'+
                '</div>'
            )
            comment.append(lastComment)
        }
        $(".showNewComment-content").append(comment);
       
    })
}

function logout() {
    $.ajax({
        url: "/user/logout",
        method: "GET", 
        success: ((retVal) => {
            if (retVal == "1") {
                console.log("Logout success!");
                alert("Logout success!");                
            }
        })
    })
}