var  express=require("express");
var  app=express();
var  cookieParser=require("cookie-parser");
var  session=require("express-session");
const iterations = 1000;
const crypto = require('crypto');

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
var  userservice=require("./database/users.js");
var  postservice=require("./database/posts.js");
var  commentservice=require("./database/comments.js")

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
        var psd = fields.password;
        userservice.findOneUser({username:username}, function (result) {
            if(!result){
                res.send("-1")
            } else {
                var psd2 = result.password;
                var salt = result.salt;
                crypto.pbkdf2(psd, salt, iterations, 64, 'sha512', (err, hash) => {
                    if (err) throw err;
                    let hStr = hash.toString('base64');
                    if (hStr == psd2) {
                        usersOnLogin.push(result);
                        req.session.login="1";
                        req.session.userID=result._id;
                        req.session.username=username;
                        req.session.avatar=result.avatar;
                        req.session.role=result.role;
                        res.send("1");
                    } else {
                        res.send("-1");
                    }
                })
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
        var salt = crypto.randomBytes(64).toString('base64');
        crypto.pbkdf2(password, salt, iterations, 64, 'sha512', (err, hash) =>{
            if (err) throw err;
            var json={
                username: username,
                password: hash.toString('base64'),
                salt: salt,
                avatar: avatar,
                registDate: new Date(),
            }
            userservice.findOneUser({username:username}, function (result) {
                if(!result){
                    userservice.insertUser(json, function (result) {
                        if(result) {
                            usersOnLogin.push(result);
                            req.session.login="1";
                            req.session.userID=result._id;
                            req.session.username=username;
                            req.session.avatar="duck.png";
                            req.session.role="1";
                            res.send("1")
                        } else {
                            res.send("-1");
                        }
                    })
                } else {
                    res.send("-1")
                }
            })
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

app.get("/user/findUser", (req, res) => {
    var username=req.query.name;
    userservice.findOne({username: username})
    .exec((error, result) => {
        res.json(result)
    });
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
    form.uploadDir= path.normalize(__dirname+'/avatar/') ;
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
            var newPath=__dirname+"/avatar/"+imgName;
            json.avatar=imgName
        }
        userservice.findOneUser({username:username}, function (result) {
            var psd2 = result.password;
            var salt = result.salt;
                crypto.pbkdf2(oldpassword, salt, iterations, 64, 'sha512', (err, hash2) => {
                    let oldpasswordString = hash2.toString('base64');
                    console.log(psd2)
                    console.log(oldpasswordString)
                    if(psd2 == oldpasswordString) {
                        crypto.pbkdf2(newpassword, salt, iterations, 64, 'sha512', (err, newHash) => {
                            json.username = newusername;
                            json.password = newHash.toString('base64');
                            if(file.avatar){
                                fs.rename(oldPath,newPath, function (err) {
                                    if(err) {
                                        res.send("-1")
                                        return ;
                                    }
                                    userservice.updateUser({username:username},{$set:json}, function (result) {
                                        if(result.ok==1){
                                            req.session.avatar=imgName
                                            req.session.username=newusername
                                            res.json("1")
                                        } else {
                                            res.json("-1")
                                        }
                                    })
                                })
                            } else {
                                userservice.updateUser({username:username},{$set:json}, function (result) {
                                    if(result.ok==1){
                                        req.session.username=newusername
                                        res.json("1")
                                    }else{
                                        res.json("-1")
                                    }
                                })
                            }
                        })
                    } else {
                        res.send("psderror")
                    }
                })
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
                    authorId: result._id,
                    postContent:content,
                    postTitle:title,
                    postDate:new Date()
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

    if(username){
        userservice.findOneUser({username:username}, function (result) {
            postservice.getPostCount({"authorId":result._id}, function (result,count) {
                res.json([result,count])
            })
        })
    }else{
        postservice.getPostCount({}, function (result,count) {
            res.json([result,count])
        })
    }
});

app.get("/post/delPost", (req, res) => {
    var  id=req.query.postid;
    postservice.delPost({_id:id}, function (result) {
        commentservice.delComment({postId:id}, function (result2) {
            res.json(result2)
        })
    })
});

app.get("/post/getPersonPost", (req, res) => {
    var username=req.query.name;
    var page=req.query.page;
    userservice.findOneUser({username:username}, function (result) {
        var  authorId=result._id
        var  avatar=result.avatar;
        var  author=result.username;

        postservice.getPagePost({"authorId":authorId},page, function (posts) {
            if(!posts.length) {
                res.send("-1")
                return;
            }
            posts.forEach(function (item,index) {
                var post=item._doc;
                post.avatar=avatar;
                post.author=author
            })
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
    postservice.findOne({_id:postId})
    .exec((err, post) => {
        console.log(post)
        if (post == null) {
            res.send("-1");
        } else {
            var authorId=post.authorId;
            var post=post._doc
            userservice.findOneUser({_id:authorId}, function (user) {
                commentservice.findAllCommentCount({postId:postId}, function (commentcount) {
                    commentservice.findComment({postId:postId}, function (comments) {
                        iterator(0);
                        function iterator(index){
                            if(index==comments.length){
                                post.avatar=user.avatar;
                                post.author=user.username;
                                post.comment=comments;
                                post.commentcount=commentcount
                                res.json(post)
                                return ;
                            }
                            var comment=comments[index]._doc;
                            var authorId=comment.authorId;
                            if(comment.commentLastId!="0"&&comment.commentLastId!=undefined){
                                commentservice.findOneComment({_id:comment.commentLastId}, function (result) {
                                    userservice.findOneUser({_id:result.authorId}, function (result) {
                                        comment.lastAuthor=result.username;
                                        findCommentLastAuthor()
                                    })
                                })
                            }else{
                                findCommentLastAuthor()
                            }
                            function  findCommentLastAuthor(){
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
        }
    })
});

app.get("/post/setComment", (req, res) => {
    var  postid=req.query.postid;

    if(!postid) {
        res.send("-1")
        return ;
    }
    var  comment=req.query.commentContent;
    var  commentLastId=req.query.commentLastId||0;
    var  authorId=req.session.userID;

    console.log(authorId);
    if(!authorId) {
        res.send("-1")
        return ;
    }
    var  date=new Date();
    var  commentHeaderId=0;
    var  lastAuthorId=0;

    var  newCom=1 ;
    if(commentLastId){
        commentservice.findOneComment({_id:commentLastId},function(result){
            if(!parseInt(result.commentHeaderId)){
                commentHeaderId= result._id;
            }else{
                commentHeaderId= result.commentHeaderId;
            }
            if(result.authorId!=req.session.userID){
                lastAuthorId=result.authorId;
                var json= {
                    authorId:authorId,
                    postId:postid,
                    commentContent:comment,
                    commentDate:date,
                    commentLastId:commentLastId,
                    commentHeaderId:commentHeaderId,
                    newCom:newCom,
                    lastAuthorId:lastAuthorId
                }
                commentservice.addComment(json, function (result) {
                    if(!result){
                        res.send("-1")
                    }else{
                        res.send("1")
            
                    }
                })
            }else{
                postservice.getDetailPost({_id:postid}, function (result) {
                    lastAuthorId=result.authorId;
                    var json= {
                        authorId:authorId,
                        postId:postid,
                        commentContent:comment,
                        commentDate:date,
                        commentLastId:commentLastId,
                        commentHeaderId:commentHeaderId,
                        newCom:newCom,
                        lastAuthorId:lastAuthorId
                    }
                    commentservice.addComment(json, function (result) {
                        if(!result){
                            res.send("-1")
                        }else{
                            res.send("1")
                
                        }
                    })
                })
            }
        })
    } else {
        postservice.getDetailPost({_id:postid}, function (result) {
            lastAuthorId=result.authorId;
            if(result.authorId==req.session.userID){
                newCom=0
            }
            var json= {
                authorId:authorId,
                postId:postid,
                commentContent:comment,
                commentDate:date,
                commentLastId:commentLastId,
                commentHeaderId:commentHeaderId,
                newCom:newCom,
                lastAuthorId:lastAuthorId
            }
            commentservice.addComment(json, function (result) {
                if(!result){
                    res.send("-1")
                }else{
                    res.send("1")
        
                }
            })
        })

    }
});

app.get("/post/showUserNewComment", (req, res) => {
    var  userId=req.session.userID;
    if( !userId){
        res.send("-1")
        return ;
    }
    commentservice.findComment({lastAuthorId:userId}, function (comments) {
        if(!comments.length){
            res.send("-1")
            return ;
        }
        var myComment=[];
        iterator(0);
        function iterator(index1){
            if(comments.length==index1){
                res.json(myComment)
                return ;
            }
            var comment=comments[index1]._doc;
            var postid=comment.postId;
            if(comment.newCom=="1"){
                postservice.getDetailPost({_id:postid}, function (post) {
                    userservice.findOneUser({_id:post.authorId}, function (user) {
                        commentservice.updateComment({_id:comment._id},{$set:{"newCom":0}}, function (result){
                            userservice.findOneUser({_id:comment.authorId}, function (result){
                                comment.postTitle=post.postTitle;
                                comment.authorAvatar=result.avatar;
                                comment.authorName=result.username;
                                comment.postAuthor=user.username;
                                comment.postAvatar=user.avatar;
                                if(comment.commentLastId!="0"){
                                    commentservice.findOneComment({_id:comment.commentLastId}, function (lastComment){
                                        comment.lastCommentContent=lastComment.commentContent
                                        userservice.findOneUser({_id:lastComment.authorId}, function (lastAuthor){
                                            comment.lastAuthor=lastAuthor.username
                                            myComment.push(comment)
                                            iterator(index1+1)
                                        })
                                    })
                                }else{
                                    myComment.push(comment)
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

app.get('/post/searchPost/', (req, res) => {
    let keyword = req.query.keyword;
    postservice.getAllPost({postTitle: keyword}, function(posts) {
        if(!posts.length) {
            res.send("-1");
            return;
        } else {
            iterator(0)
            function iterator(index) {
                if(index==posts.length) {
                    res.json(posts);
                    return;
                }
                var post=posts[index]._doc;
                var  authorId=post.authorId;
                userservice.findOneUser({_id:authorId}, function (result2) {
                    post.avatar=result2.avatar;
                    post.author=result2.username;
                    iterator(index+1)
                });
            }
        }
    });
});

app.listen(3000);

console.log("listen at 3000")