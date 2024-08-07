import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const postSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    body:{
        type: String,
        required:true
    },
    createdAt:{
        type: Date,
        default:Date.now
    },
    updatedAt:{
        type: Date,
        default:Date.now
    },

});

const posts = mongoose.model('posts',postSchema)
export default posts;