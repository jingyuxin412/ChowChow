$(function () {
    // $.get("http://localhost:8888/post/showUserAllComment", function(result) {
	$.ajax({
		url: "http://localhost:8888/post/showUserAllComment",
		method: "GET",
		success: ((result) => {
			if(!result.post.length){
				alert("You haven't comment yet")
			}
			result.post.forEach(function(item) {
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
				//加载评论------------------------------------------------
					//console.log(result)
					//存储分类父子评论
				var commentColletion = []
					//选出没有lastid的评论
				item.comments.forEach(function(item, index) {
						if(item.commentLastId == "0"||!item.commentLastId) {
							commentColletion.push({
								"parent": item,
								"child": []
							});
						}
					})
					//把子评论组合存进相应的父评论
				commentColletion.forEach(function(item1, index1) {
						var commentChild = [];
						item.comments.forEach(function(item2, index2) {
							if(item2.commentHeaderId == item1.parent._id) {
								item1.child.push(item2)
							}
						})
					})
					//把评论根据时间排序
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
				//遍历嵌套评论
				commentColletion.forEach(function(item, index) {
					var p = item.parent;
					var c = item.child;
					var date = FormatDate(p.commentDate)
						//item---parent,child
						//加载父评论-------------------------------------------
					var cmtParent = $(
						'<div class="nestComment clearfix">' +
							'<div><span class="currentAuthor authorname">' +
								p.author +
							'</span>'+
							'<span>&nbsp; : &nbsp; </span></div>' +
							'<div class="nestcommentContent">' + p.commentContent + '</div>' +
							'<div class="comment-opt">'+
							'<a commentId="' + p._id + '" class="commentfor" href="javascript:;">Reply</a>' +
							'<a commentId="' + p._id + '" class="commentDel" href="javascript:;">Delete</a>' +
							'</div>'+
							'</div>');
					post.find(".commentIncomment").append(cmtParent)
					//加载子评论----------------------------------------
					c.forEach(function(item) {
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
						post.find(".commentIncomment").append(cmtChild)
					})
				})
				$(".comment-list").append(post);
			})
		})
    })
})

