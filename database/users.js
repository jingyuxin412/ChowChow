var  mongodb=require("mongoose");
var  db=require("./db.js");

var  USERPAGESIZE=8;

var userSchema=new mongodb.Schema({
    username: String ,
    password: String, 
    avatar: String, 
    registDate:{type:Date},
    salt: String
})

userSchema.statics.insertUser= function (json,callback) {
    this.model("user").create(json, function (err,result) {
        if(err){
            console.log(err);
            return
        }
        callback(result)
    })
}


userSchema.statics.findAllUser= function (page,callback) {
    var skip=(page-1)*USERPAGESIZE;
    var that=this
    this.model("user").find({}).limit(USERPAGESIZE).skip(skip).sort({registDate:-1}).exec(function (err,result) {
        if(err){
            console.log("查找错误")
            return
        }
        that.model("user").find({}).count().exec(function (err,result2) {

            callback(result,result2)
        })
    })
}

userSchema.statics.findOneUser= function (json,callback) {
    this.model("user").findOne(json).sort({registDate:-1}).exec(function (err,result) {
        if(err){
            console.log("查找错误")
            return
        }
        callback(result)
    })
}

userSchema.statics.updateUser= function (json,condition,callback) {
    this.model("user").update(json,condition, function (err,result) {
        if(err){
            console.log(err)
            return
        }
      callback(result)
    })
}

var userModel=db.model("user",userSchema);

module.exports=userModel



