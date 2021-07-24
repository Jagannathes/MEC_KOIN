require('dotenv').config();
var mongoose = require('mongoose')
mongoose.connect(process.env.mongodbUrl, {
  useUnifiedTopology: true,
  useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true
}).then(() => console.log('DB Connected!'))
  .catch(err => {
    console.log(err.message);
  });



var KoinSchema = new mongoose.Schema({
  id: { type: Number ,unique:true},
  name: { type: String },
   phone: { type: String  },
  address: { type: String },
  privateKey: { type: String },
  college : {type: String}
});
var Koin = mongoose.model('Koin', KoinSchema);


  async function exist(id)
  {

    return Koin.findOne({id:id})
    .then(result => {
      if(result) {
        console.log(`Successfully found document: ${result}.`);
        return result;
      } else {
        console.log("No document matches the provided query.");
        return false; //changed "hi" to false.
      }
    })
    .catch(err => console.error(`Failed to find document: ${err}`));
  }

  async function existNumber(number)
  {

    return Koin.findOne({phone:number})
    .then(result => {
      if(result) {
        console.log(`Successfully found document: ${result}.`);
        return result;
      } else {
        console.log("No document matches the provided query.");
        return false; //changed "hi" to false.
      }
    })
    .catch(err => console.error(`Failed to find document: ${err}`));
  }


  async function createAccount(id,name,phone,address,privatekey,college)
  {
      
      let newKoin = new Koin({
                  id: id,
	                name: name,
	                phone: phone,
	                address: address,
	                privateKey: privatekey,
                  college : college 
	         }).save((err, data) => {
             if(err){
               console.log(err)
               return false;
             }
             console.log(data);
             return(data);
          })
  }
module.exports = {exist, createAccount, existNumber};
