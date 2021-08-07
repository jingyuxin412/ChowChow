$(function () {
	$.ajax({
		url: "http://localhost:8888/post/showUserAllComment",
		method: "GET",
		success: ((result) => {
			console.log("1")
			console.log(result)
			console.log("1")
			if(result == "nopost"){
				alert("You haven't comment yet")
			} else {
				result.post.forEach(function(item) {
					console.log(item)
					console.log("1111")
					var post =$(
						'<div class="comment-wrap" postid="'+item._id+'">'+
						'<div class="comment-inner">'+
						'<div class="post_Comment">'+
						'<span class="userAvatar">'+
						'<img src="'+ result.avatar+'"/>'+
						'</span>'+
						'<span class="author">'+ result.author+ '</span>'+
						'<span>：</span>'+
						'<span class="postTitle">'+item.postTitle+'</span>'+
						'</div>'+
						'<div class="commentIncomment"></div>'+
						'</div>'+
						'</div>');
					var commentColletion = []
					item.comments.forEach(function(item, index) {
							if(item.commentLastId == "0"||!item.commentLastId) {
								commentColletion.push({
									"parent": item,
									"child": []
								});
							}
						})
					commentColletion.forEach(function(item1, index1) {
							var commentChild = [];
							item.comments.forEach(function(item2, index2) {
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
						console.log(p)
						var cmtParent = $(
							'<div class="nestComment clearfix">' +
								'<div><span class="currentAuthor authorname">' +
									p.author +
								'</span>'+
								'<span>&nbsp; : &nbsp; </span></div>' +
								'<a href=\"http://localhost:8888/detailPage.html?postid=' + p.postId +  '\"> <div ' + 
								'  class="nestcommentContent">' + p.commentContent + '</div></a>' +
								'</div>');
						post.find(".commentIncomment").append(cmtParent)
					})
					$(".comment-list").append(post);
					console.log("111")
					console.log(post)
				})
			}
		})
    })
})

