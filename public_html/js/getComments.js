$(function() {
    islogin(function(result) {
        if(result != 1) {
            alert("You haven't login yet!")
            $(".comment-list").removeClass("canComment")
            location.href='./login.html'
            return ;
        }
        $(".comment-list").addClass("canComment")
    })
})