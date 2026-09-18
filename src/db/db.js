const mongoosen= require('mongoose');

function connectDB(){
    mongoosen.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('MongoDB connected');
    })
    .catch((err)=>{
        console.error('Error connecting to MongoDB:', err);
    });
}

module.exports = connectDB; 