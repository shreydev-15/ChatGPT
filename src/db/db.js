const mongoosen= require('mongoose');

// Connect the application to MongoDB and report connection failures.
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