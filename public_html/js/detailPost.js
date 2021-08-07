$(function() {
	islogin(function(result) {
		if(result == 1) {
			$(".comment-list").addClass("canComment")
			$(".tips").hide();
			$(".setComment").show();
		} else {
			$(".comment-list").removeClass("canComment")
			$(".tips").show();
			$(".setComment").hide()
		}
	})

	var postid = location.search.slice(8);

	getNewPost()

	$("#commentBtn").on("click", function() {
		var url = "/post/setComment";
		$.get(url, {
			postid: postid,
			commentContent: $("#commentConet").val()
		}, function(result) {
			console.log(result)
			if(result == "1") {
				alert("Success")
				$("#form")[0].reset()
				location.reload()
			} else {
				alert("Failed")

			}
		})
	})

	function getNewPost() {
		$.get("/post/getDetailPost?postid=" + postid, function(result) {
			if (result == "-1") {
				alert("No such post")
				location.href="./homePage.html";
			}
			$(".talk_info .info_avatar img").attr("src", result.avatar);
			$(".talk_info .info_text .author").html(result.author)
			$(".talk_content .title p").html(result.postTitle);
			$(".talk_content .content p").html(result.postContent);
			$(".talk_content").height($(".talk_detail").height())
			$(".talk_info").height($(".talk_detail").outerHeight())
			$("#commentCount span").html(result.commentcount)
			var commentColletion = []
			result.comment.forEach(function(item, index) {
					if(item.commentLastId == "0"||!item.commentLastId) {
						commentColletion.push({
							"parent": item,
							"child": []
						});
					}
				})
			commentColletion.forEach(function(item1, index1) {
					var commentChild = [];
					result.comment.forEach(function(item2, index2) {
						if(item2.commentHeaderId == item1.parent._id) {
							item1.child.push(item2)
						}
					})
				})
			commentColletion.forEach(function(item, index) {
					item.child.sort(function(v1, v2) {
						v1 = new Date(v1.commentDate);
						v2 = new Date(v2.commentDate);
						if(v1 > v2) {
							return 1;
						} else if(v1 < v2) {
							return -1;
						} else {
							return 0;
						}
					})
				})

			commentColletion.forEach(function(item, index) {
				var p = item.parent;
				var c = item.child;
				var date = FormatDate(p.commentDate)
				var cmtParent = $(
					'<article class="comment" >' +
					'<div class="comment-list-inner clearfix">' +
					'<div class="comment-author">' +
					'<div class="info_avatar">' +
					'<a href=""><img src=' +
					p.avatar + '></a>' +
					'</div>' +
					'<div class="info_text">' +
					'<p class="author">' +
					p.author + '</p>' +
					'</div>' +
					'</div>' +
					'<div class="comment-content">' +
					'<p  class="nestcommentContent">' + p.commentContent + '</p>' +
					'</div>' +
					'<p class="commentDate">Post Date ' + date + '</p>' +
					'</div>' +
					'</article>');
				c.forEach(function(item, index) {
					var cmtChild = $(
						'<div class="nestComment clearfix">' +
						'<div><span class="currentAuthor authorname">' +
						item.author +
						'</span><span> &nbsp;Reply &nbsp;</span><span class="lastAuthor authorname">' +
						item.lastAuthor +
						'</span><span>&nbsp; :&nbsp; </span></div>' +
						'<div  class="nestcommentContent">' + item.commentContent + '</div>' +
						'<div class="comment-opt">'+
						'<a commentId="' + item._id + '" class="commentfor" href="javascript:;">Reply</a>' +
						'<a commentId="' + item._id + '" class="commentDel" href="javascript:;">Delete</a>' +
						'</div>'+
						'</div>');
					cmtParent.append(cmtChild)
				})
				$(".comment-list").append(cmtParent)

			})

		})

	}
})