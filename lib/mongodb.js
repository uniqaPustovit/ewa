import mongoose from "mongoose"

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGO_URI || "mongodb://localhost:27017/ewa"

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_URI environment variable inside .env.local"
    )
}

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

async function connectToDatabase() {
    try {
        if (cached.conn) {
            return cached.conn
        }

        if (!cached.promise) {
            const opts = {
                bufferCommands: false,
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }

            cached.promise = mongoose.connect(MONGODB_URI, opts)
                .then((mongoose) => {
                    console.log('MongoDB connected successfully')
                    return mongoose
                })
                .catch((error) => {
                    console.error('MongoDB connection error:', error)
                    throw error
                })
        }

        cached.conn = await cached.promise
        return cached.conn
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
        throw error
    }
}

export default connectToDatabase
