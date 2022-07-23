import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

export const idea = new Schema({
    id: ObjectId,
    title: String,
    description: String,
    date: Date
})