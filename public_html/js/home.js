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
    var url="http://localhost:8888/post/getAllPost?page=";

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
    });

    $('#searchPost').on("click", function() {
        var keyword = $('#searchPosts').val()
        console.log(keyword);
        $.ajax({
            url: "http://localhost:8888/post/searchPost/?keyword=" + keyword,
            method: "GET",
            success: ((posts) => {
                if (posts == "-1") {
                    $('.pageCount').hide();
                    $('.post-wrap').hide();
                    $(".search-post-wrap").empty();
                    $(".search-post-wrap").html("No such post!");
                } else {
                    $('.pageCount').hide();
                    $('.post-wrap').hide();
                    $(".search-post-wrap").empty()
                    posts.forEach(function(post) {
                        var date=FormatDate(post.postDate)
                        var article = [
                            '<article class="thread">',
                            '<div class="thread_info">',
                            '<div class="info_avatar">',
                            '<a  target="_blank" href="http://localhost:8888/personPage.html?name=',post.author,
                            ,'">',
                            '<img class=\'authorAvatar\' src=',post.avatar ,'></a>',
                            '</div>',
                            '<div class="info_text">',
                                '<p class="author">',post.author ,'</p>',
                                '<p>', date, '</p>',
                            '</div>',
                            '<a class="delPost" postid="',
                            post._id,'">','Delete this Post</a>',
                            '</div>',
                            '<div class="talk_content">',
                            '<div class="title">',
                            '<p><a href="http://localhost:8888/detailPage.html?postid=',
                            post._id,'" target="_blank">',
                            post.postTitle,
                            '</a></p>',
                            '</div>',
                            '<div class="content">',
                            '<p>', post.postContent, '</p>',
                            '</div>',
                            '</div>',
                            '</article>'
                        ].join("");

                        $(".search-post-wrap").append($(article));
                    })
                }
            })
        });
    });
})