var  mongodb=require("mongoose");
var mongoose=require("mongoose");
var db=mongoose.createConnection("mongodb://127.0.0.1:27017/forum");

var commentSchema=new mongodb.Schema({
    authorId: String,
    postId: String,
    commentContent: String,
    commentDate: String,
    commentHeaderId: String,
    commentLastId: String,
    newCom: String,
    lastAuthorId: String
})

commentSchema.statics.addComment= function (json,callback) {
    this.model("comment").create(json, function (err,result) {
        if(err){
            console.log(err);
            return
        }
        callback(result)
    })

}

commentSchema.statics.findComment= function (json,callback) {
    this.model("comment").find(json).sort({commentDate:-1}).exec(function (err,result) {
        if(err){
            console.log(err);
            return
        }
        callback(result)
    })
}

commentSchema.statics.findAllCommentCount= function (json,callback) {
    this.model("comment").find(json).count().exec(function (err,result) {
        if(err){
            console.log(err);
            return
        }
        callback(result)
    })
}

commentSchema.statics.findOneComment= function (json,callback) {
    this.model("comment").findOne(json).exec(function (err,result) {
        if(err){
            console.log(err);
            return
        }
        callback(result)
    })
}

commentSchema.statics.delComment= function (json,callback) {
    this.model("comment").remove(json,function (err,result) {
        if(err){
            console.log(err);
            return
        }
        callback(result)
    })
}

commentSchema.statics.replyComment= function (json,callback) {
    this.model("comment").create(json, function (err,result) {
        if(err){
            console.log(err);
            return
        }
        callback(result)
    })
}

commentSchema.statics.updateComment= function (json,condition,callback) {
    this.model("comment").update(json,condition, function (err,result) {
        if(err){
            console.log(err);
            return
        }
        callback(result)
    })
}


var  commentModel=db.model("comment",commentSchema);


module.exports=commentModel