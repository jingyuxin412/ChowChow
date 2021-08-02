var  express=require("express");
var  app=express();
var  cookieParser=require("cookie-parser")
var  session=require("express-session");

var routers=require("./routers/route.js")

app.use(cookieParser())
app.use(session({
    name:'hohoID',
    secret:'keyboard cat',
    maxAge:1000,
    resave:true,//每次请求是否重写设置一份新的session
    saveUninitialized:false//无论有没有session cookie，每次请求都设置个session cookie
}))

app.use(express.static('./public_html'));
app.use(express.static('./avatar'));

app.all("*",function(req,res,next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    next()
})
app.get('/',routers.index);
app.get("/web/islogin",routers.islogin);

app.post("/user/login",routers.login)
app.post("/user/regist",routers.regist);
app.get("/user/logout",routers.logout);
app.get("/user/findUser",routers.findUser)
app.get("/user/getAllUser",routers.getAllUser);
app.post("/user/updateUser",routers.updateUser);
app.get("/user/delUser",routers.delUser);

app.post("/post/setPost",routers.setPost)
app.get("/post/getAllPost",routers.getAllPost)
app.get("/post/getAllPostCount",routers.getAllPostCount);
app.get("/post/updatePost",routers.updatePost)
app.get("/post/delPost",routers.delPost)
app.get("/post/getPersonPost",routers.getPersonPost)
app.get("/post/getPostByTitle",routers.getPostByTitle)
app.get("/post/getDetailPost",routers.getDetailPost);
app.get("/post/setComment",routers.setComment);
app.get("/post/showUserAllComment",routers.showUserAllComment);
app.get("/post/showUserNewComment",routers.showUserNewComment);
app.get("/post/readComment",routers.readComment);

app.listen(8888);