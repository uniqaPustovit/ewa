import mongoose from "mongoose"

const ResultSchema = new mongoose.Schema({
    contractNumber: {
        type: String,
        required: true,
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    environment: {
        type: String,
        enum: ['production', 'test'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true
})

// Prevent mongoose from creating a new model if it already exists
const Result = mongoose.models.Result || mongoose.model('Result', ResultSchema)

export default Result
