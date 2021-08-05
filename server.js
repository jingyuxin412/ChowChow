var  express=require("express");
var  app=express();
var  cookieParser=require("cookie-parser")
var  session=require("express-session");
var routers=require("./routers/route.js")

app.use(cookieParser())
app.use(session({
    name: 'chowchow',
    secret: 'keyboard cat',
    maxAge: 10000,
    resave: true,
    saveUninitialized: false
}))

app.use(express.static('./public_html'));
app.use(express.static('./avatar'));

var  formidable=require("formidable");
var  path=require("path");
var  fs=require("fs");
var  userservice=require("../database/users.js");
var  postservice=require("../database/posts.js");
var  commentservice=require("../database/comments.js")

var  usersOnLogin=[];

app.all("*",function(req,res,next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    next()
})

app.get('/', (req, res) => {
    res.redirect("homePage.html")
});


app.get('/web/islogin', (req, res) => {
    if(req.session.login=="1"){
        var commentsNum = 0;
        commentservice.findComment({lastAuthorId: req.session.userID}, function (result) {
            result.forEach(function (item) {
                if(item.newCom=="1"){
                    commentsNum++;
                }
            })
            var retVal = {
                username:req.session.username,
                avatar:req.session.avatar,
                role:req.session.role,
                newcommentCount:commentsNum
            }
            res.send(retVal)
        })
    } else {
        res.send("-1")
    }
});

app.post("/user/login", (req, res) => {
    var form=new formidable.IncomingForm();
    form.parse(req,function (err,fields,file) {
        var username=fields.username;
        var psd=fields.password;
        userservice.findOneUser({username:username}, function (result) {
            if(!result){
                res.send("-2")
            }else{
                var psd2=result.password;
                if(psd2===psd){
                    //登录成功
                    usersOnLogin.push(result);
                    req.session.login="1";
                    req.session.userID=result._id;
                    req.session.username=username;
                    req.session.avatar=result.avatar;
                    req.session.role=result.role;
                    res.send("1")
                }else if(psd2!==psd){
                    res.send("-1")
                }
            }
        })
    })
});

app.post('/user/regist', (req, res) => {
    var form=new formidable.IncomingForm();
    form.parse(req,function (err,fields,file) {
        var username=fields.username;
        var password=fields.password;
        var avatar="duck.jpeg";
        var json={
            username:username,
            password:password,
            avatar:avatar,
            registDate:new Date(),
            role:"1"
        }
        userservice.findOneUser({username:username}, function (result) {
            if(!result){
                userservice.insertUser(json, function (result) {
                    if(result){
                        usersOnLogin.push(result);
                        req.session.login="1";
                        req.session.userID=result._id;
                        req.session.username=username;
                        req.session.avatar="duck.png";
                        req.session.role="1";
                        res.send("1")
                    }else{
                        res.send("-2");
                    }
                })
            }else{
                res.send("-1")
            }
        })
    })
});

app.get('/user/logout', (req, res) => {
    var id=req.session.userID
    usersOnLogin.forEach(function (item,index) {
        if(item._id==id){
            usersOnLogin.splice(index,1)
        }
    })
    req.session.destroy();
    res.send("1");
});

app.get("//user/findUser", (req, res) => {
    var username=req.query.name;
    userservice.findOneUser({username:username}, function (result) {
        if(!result){
            res.send("-1")
        }else{
            res.json(result)
        }
    })
});

app.get("/user/getAllUser", (req, res) => {
    var page=req.query.page;
    userservice.findAllUser(page, function (result,count) {
        usersOnLogin.forEach(function (item2) {
            result.forEach(function (item1) {
                if(item2.username==item1.username){
                    item1._doc.islogin=1;
                }
            })
        })
        res.json({user:result,count:count})
    })
});

app.post("/user/updateUser", (req, res) => {
    var  form=new formidable.IncomingForm()
    form.uploadDir= path.normalize(__dirname+'/../avatar/') ;
    form.parse(req, function (err,field,file) {
        var username=req.session.username;
        var oldpassword=field.oldPassword;
        var newpassword=field.newPassword;
        var newusername=field.username;
        var json={}

        if(file.avatar){
            var imgType=file.avatar.type.slice(6);
            var imgName=username+"."+imgType;
            var oldPath=file.avatar.path;
            var newPath=__dirname+"/../avatar/"+imgName;
            json.avatar=imgName
        }
        userservice.findOneUser({username:username}, function (result) {
            var psd2=result.password;
            if(psd2===oldpassword){
                json.username=newusername;
                json.password=newpassword
                if(file.avatar){
                    fs.rename(oldPath,newPath, function (err) {
                        if(err){
                            res.send("-1")
                            return ;
                        }
                        userservice.updateUser({username:username},{$set:json}, function (result) {
                            if(result.ok==1){
                                req.session.avatar=imgName
                                req.session.username=newusername
                                res.json("1")
                            }else{
                                res.json("-1")
                            }
                        })
                    })

                }else{
                    userservice.updateUser({username:username},{$set:json}, function (result) {
                        if(result.ok==1){
                            req.session.username=newusername
                            res.json("1")
                        }else{
                            res.json("-1")
                        }
                    })
                }
            }else if(psd2!==oldpassword){
                res.send("psderror")
            }
        })
    })
});

app.post("/post/setPost", (req, res) => {
    if(req.session.username){
        var form=new formidable.IncomingForm();
        form.parse(req,function(err,field,file){
            var  content=field.postContent.split("\n").join("<br\>");
            var  title=field.postTitle;
            var  username=req.session.username;
            if(!username){
                res.send("nologin")
                return ;
            }
            userservice.findOneUser({username:username}, function (result) {

                var  json={
                    authorId: result._id,//用户id
                    postContent:content,//文章内容
                    postTitle:title,//文章标题
                    postDate:new Date()//发表时间
                }
                postservice.setPost(json, function (result) {
                    if(!result) {
                        res.send("-1")
                    } else {
                        res.send("1")
                    }
                })
            })
        })
    }else{
        res.send("nologin")
    }
});

app.get("/post/getAllPost", (req, res) => {
    var postArr=[];
    var page=req.query.page;
    postservice.getPagePost({},page,function (posts) {
        if(!posts.length) {
            res.send("-1")
            return;
        }
        iterator(0)
        function iterator(index){
            if(index==posts.length){
                res.json(posts)
                return;
            }
            var post=posts[index]._doc;
            var  authorId=post.authorId;
            userservice.findOneUser({_id:authorId}, function (result2) {
                post.avatar=result2.avatar;
                post.author=result2.username;
                iterator(index+1)
            })
        }
    })
});

app.get("/post/getAllPostCount", (req, res) => {
    var username=req.query.name,json;
    //如果查找的是个别用户，那么就要查找他的id，来找他的帖子

    if(username){
        // console.log(username)
        userservice.findOneUser({username:username}, function (result) {
            // console.log(result)
            postservice.getPostCount({"authorId":result._id}, function (result,count) {
               // console.log(result,count)
                res.json([result,count])
            })
        })
    }else{
        //没有名字查找全部
        postservice.getPostCount({}, function (result,count) {
            //console.log(result,count)
            res.json([result,count])
        })
    }
});

app.get("/post/delPost", (req, res) => {
    var  id=req.query.postid;
    postservice.delPost({_id:id}, function (result) {
        //console.log(result)
        commentservice.delComment({postId:id}, function (result2) {
            //console.log(result2)
            res.json(result2)
        })
    })
});

app.get("/post/getPersonPost", (req, res) => {
    var username=req.query.name;
    var page=req.query.page;
   // console.log(111,username);
    userservice.findOneUser({username:username}, function (result) {
        var  authorId=result._id
        var  avatar=result.avatar;
        var  author=result.username;

        postservice.getPagePost({"authorId":authorId},page, function (posts) {
            //如果找不到帖子
            if(!posts.length) {
                //为空
                res.send("-1")
                return;
            }
            //添加属性,首先posts是一个数组
            posts.forEach(function (item,index) {
                var post=item._doc;
                post.avatar=avatar;
                post.author=author
            })
            //console.log(2222,posts)
            res.json(posts)
        })
    })
});

app.get("/post/getPostByTitle", (req, res) => {
    var title=req.query.title;
    postservice.getPost({postTitle:title}, function (result) {
        if(!result.length){
            //为空
            res.send("-1")
        }else{
            res.json(result)
        }
    })
});

app.get("/post/getDetailPost", (req, res) => {
    var postId=req.query.postid;//帖子id
    //首先有两点要注意
    //1.查找出来的不只是数据
    //2.异步添加属性
    //根据帖子id查找详情信息
    postservice.getDetailPost({_id:postId}, function (post) {
        var authorId=post.authorId;
        var post=post._doc
        if(!post) {
            //为空
            res.send("-1")
        }
        userservice.findOneUser({_id:authorId}, function (user) {
            //先找到这篇帖子的主人，为帖子增加属性
            //再找评论
            //查找评论总数
            commentservice.findAllCommentCount({postId:postId}, function (commentcount) {
                //根据帖子id查找评论
               // console.log(123456,commentcount)
                commentservice.findComment({postId:postId}, function (comments) {
                    //还要找用户的头像和姓名
                    //遍历所有的评论，添加作者和头像
                    iterator(0);
                    function iterator(index){
                        if(index==comments.length){
                            post.avatar=user.avatar;
                            post.author=user.username;
                            post.comment=comments;
                            post.commentcount=commentcount
                            //console.log(post)
                            res.json(post)
                            return ;
                        }
                        var comment=comments[index]._doc;
                        var authorId=comment.authorId;

                        //因为一开始没有给评论设置commentLastId字段，所以他们是undefined
                        //而undefined不等于字符串0，然后就进第一个条件了，最后找不到这个评论而出错
                        if(comment.commentLastId!="0"&&comment.commentLastId!=undefined){
                            commentservice.findOneComment({_id:comment.commentLastId}, function (result) {
                                //console.log(1111,result)
                                userservice.findOneUser({_id:result.authorId}, function (result) {
                                    comment.lastAuthor=result.username;
                                    findCommentLastAuthor()
                                })
                            })
                        }else{
                            findCommentLastAuthor()
                        }
                        function  findCommentLastAuthor(){
                            //遍历为评论找主人
                            userservice.findOneUser({_id:authorId}, function (user) {
                                comment.avatar=user.avatar;
                                comment.author=user.username;
                                iterator(index+1)
                            })
                        }


                    }
                })
            })

        });
    })
});

app.get("/post/setComment", (req, res) => {
    //帖子id，因为我是给每个标题加上帖子的id，所以可以在url知道网址
    var  postid=req.query.postid;

    if(!postid) {
        // console.log("postid 为空")
        res.send("-1")
        return ;
    }
    //评论的内容
    var  comment=req.query.commentContent;
    //上一个评论，可能有可能没有,有就是你点击回复的那个人的评论id
    var  commentLastId=req.query.commentLastId||0;
    //发评论的人就是登录的人
    var  authorId=req.session.userID;
    if(!authorId) {
        // console.log("authorId 为空")
        res.send("-1")
        return ;
    }
    //评论时间
    var  date=new Date();
    //可能有可能没有，需要查
    var  commentHeaderId=0;
    //你评论的是谁,如果是自己回复自己，仍然要给帖子的主人评论+1
    //那么lastAuthorId应该是这篇帖子的主人id
    var  lastAuthorId=0;

    var  newCom=1 ;//默认是新评论，但是自己评论自己不是新评论

    // console.log(postid,comment,commentLastId,authorId)
    //如果上一个评论的commentLastId存在，
    // 我就去寻找上一个评论的commentHeaderId；
    //如果回复的是评论
    if(commentLastId){
        commentservice.findOneComment({_id:commentLastId},function(result){
            //如果上一个评论的commentHeaderId不存在
            //因为如果是第一个次评论，我的commentHeaderId是没有办法设置的
            //console.log(result.commentHeaderId)
            if(!parseInt(result.commentHeaderId)){
                commentHeaderId= result._id;
               // console.log(1111,commentHeaderId)
            }else{
                //找到回复的那个评论的commentHeaderId
                commentHeaderId= result.commentHeaderId;
                //console.log(222,commentHeaderId)
            }
            //_id是commentLastId的人就是被评论的人，我评论的人
            //这里要判断是不是评论自己
            //自己评论自己,lastAuthorId不为0，为这篇帖子的主人id
            if(result.authorId!=req.session.userID){
                lastAuthorId=result.authorId;
                addComment()
            }else{
                //找到帖子主人的id
                postservice.getDetailPost({_id:postid}, function (result) {
                    lastAuthorId=result.authorId;
                    addComment()
                })
            }
        })
    } else {
        //如果是第一次评论，那么我就找到这篇文章是谁的
        postservice.getDetailPost({_id:postid}, function (result) {
            //评论自己的文章也不行
            //自己评论自己,lastAuthorId为文章主人id
            lastAuthorId=result.authorId;
            //但是自己也会评论自己
            if(result.authorId==req.session.userID){
                newCom=0
            }
            addComment()
        })

    }
});

function addComment(){
    var json={
        authorId:authorId,
        postId:postid,
        commentContent:comment,
        commentDate:date,
        commentLastId:commentLastId,
        commentHeaderId:commentHeaderId,
        newCom:newCom,//当然是默认都是新评论
        lastAuthorId:lastAuthorId
    }
    //console.log(json)
    commentservice.addComment(json, function (result) {
       // console.log(666666666666,result)
        if(!result){
            res.send("-1")
        }else{
            res.send("1")

        }
    })
}

app.get("/post/showUserAllComment", (req, res) => {
    //登录人的id
    var id=req.session.userID;
    var userPosts={
        author:req.session.username,
        avatar:req.session.avatar,
        post:[]
    }

    //他所有的帖子
    postservice.getAllPost({authorId:id}, function (posts) {
        //这个人没有发过帖子，直接不用遍历
        if(!posts.length){
            res.send("nopost")
            return;
        }
        iterator1(0);
        //第一个迭代器，为每个帖子增加评论
        function iterator1(index1){
            if(index1==posts.length){

                res.json(userPosts)
                return ;
            }
            var  post=posts[index1]._doc;
            var  postid=post._id;
            commentservice.findComment({postId:postid}, function (comments) {

               // console.log(1111,comments)
                //这篇帖子没有评论,直接执行下一篇帖子
                if(!comments.length){
                    //console.log(comments)
                    iterator1(index1+1)
                    return;
                }
                var commentsarr=[]
                iterator2(0);
                //第二个迭代器,为每个评论添加姓名
                function iterator2(index2){
                    if(index2==comments.length){
                        post.comments=commentsarr;
                        userPosts.post.push(post)
                        iterator1(index1+1)
                        return ;
                    }
                    //console.log(444,comments)
                    var  comment=comments[index2]._doc;
                    var  authorId=comment.authorId;
                    //console.log(444,comment)
                   // console.log(111,comment.commentLastId)
                    //如果commentLastId存在，就找到上一个人的名字
                    if(comment.commentLastId!="0"&&comment.commentLastId!=undefined){
                       // console.log(22222,result)
                        commentservice.findOneComment({_id:comment.commentLastId}, function (result) {
                            // console.log(22222,result)
                            userservice.findOneUser({_id:result.authorId}, function (result) {
                                comment.lastAuthor=result.username;
                                findCommentAuthor()
                            })
                        })
                    }else{
                        findCommentAuthor()
                    }
                    function findCommentAuthor(){
                        userservice.findOneUser({_id:authorId}, function (user) {
                            comment.author=user.username;
                            //console.log(comment)
                            commentsarr.push(comment)
                            iterator2(index2+1)
                        })
                    }

                }

            })
        }
    })
});
app.get("/post/showUserNewComment", (req, res) => {
    var  userId=req.session.userID;
    if( !userId){
        // console.log("用户没登录")
        res.send("-1")
        return ;
    }
    commentservice.findComment({lastAuthorId:userId}, function (comments) {
        //找到所有关于你的评论
        if(!comments.length){
            //没有新评论
            res.send("-1")
            return ;
        }
        var myComment=[];
        iterator(0);
        function iterator(index1){
            if(comments.length==index1){
                //评论遍历完了
                //console.log(myComment)
                res.json(myComment)
                return ;
            }
            var comment=comments[index1]._doc;
            var postid=comment.postId;
            //如果是回复我的，就保存起来
            //评论所属文章
            if(comment.newCom=="1"){
                postservice.getDetailPost({_id:postid}, function (post) {
                    //文章主人
                    userservice.findOneUser({_id:post.authorId}, function (user) {
                        //这里还要做多一步，就是把新评论置为旧评论
                        commentservice.updateComment({_id:comment._id},{$set:{"newCom":0}}, function (result){
                            //评论主人
                            userservice.findOneUser({_id:comment.authorId}, function (result){
                                comment.postTitle=post.postTitle;//所属文章标题
                                comment.authorAvatar=result.avatar//评论人头像
                                comment.authorName=result.username//评论人名字
                                comment.postAuthor=user.username;//所属文章作者
                                comment.postAvatar=user.avatar;//所属文章作者
                                //存在回复的上一条说说
                                //console.log(1111,comment.commentLastId)
                                if(comment.commentLastId!="0"){
                                    commentservice.findOneComment({_id:comment.commentLastId}, function (lastComment){
                                        comment.lastCommentContent=lastComment.commentContent//上一条回复内容
                                        //上一条说说人的名字
                                        userservice.findOneUser({_id:lastComment.authorId}, function (lastAuthor){
                                            comment.lastAuthor=lastAuthor.username//上一条说说名字
                                            myComment.push(comment)//评论组装完毕，可以放进来了
                                            iterator(index1+1)
                                        })
                                    })
                                }else{
                                    myComment.push(comment)//评论组装完毕，可以放进来了
                                    iterator(index1+1)
                                }
                            })
                        })

                    })
                })
            }else{
                iterator(index1+1)
            }

        }
    })
});

app.listen(8888);