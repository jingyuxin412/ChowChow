
var  mongodb=require("mongoose");
var  db=require("./db.js");

var  PAGESIZE=5;
var postSchema=new mongodb.Schema({
    authorId:{type:String},
    postTitle:{type:String},
    postContent:{type:String},
    postDate:{type:Date},
    hasnewComment:{type:Number,default:0}
})

postSchema.statics.setPost= function (json,callback) {
    this.model("post").create(json, function (err,result) {
        if(err){
            console.log(err);
            return
        }
        callback(result)
    })
}

postSchema.statics.getDetailPost= function (json,callback) {
    this.model("post").findOne(json).exec(function (err,result) {
        if(err){
            console.log(err);
            return
        }
        callback(result)
    })
}

postSchema.statics.getPagePost= function (json,page,callback) {
    var skipCount=(page-1)*PAGESIZE;
    this.model("post").find(json).limit(PAGESIZE).skip(skipCount).sort({postDate:-1}).exec(function (err,result) {
        if(err){
            console.log(err);
            return
        }
        callback(result)
    })
}

postSchema.statics.getPostCount= function (json,callback) {
    this.model("post").find(json).count().exec(function (err,result) {
        if(err){
            console.log(err);
            return
        }
        var page=Math.ceil(result/PAGESIZE)
        callback(page,result)
    })
}

postSchema.statics.getAllPost= function (json,callback) {
    this.model("post").find(json).sort({postDate:-1}).exec(function (err,result) {
        if(err){
            console.log(err);
            return
        }
        callback(result)
    })
}

postSchema.statics.updatePost= function (json,condition, callback) {
    this.model("post").update(json,condition,function(err,result){
        if(err){
            console.log(err);
            return
        }
        callback(result)
    })
}

postSchema.statics.delPost= function (json,callback) {
    this.model("post").remove(json,function(err,result){
        if(err){
            console.log(err)
            return
        }
        callback(result)
    })
}

var  postModel=db.model("post",postSchema)

module.exports=postModel