import {model, models, Schema} from "mongoose";

const StatSchema = new Schema({
  source: String,
  phrase: String,
  quantity: Number,
}, {timestamps:true});

const Stat = models?.Stat || model('Stat', StatSchema);

export default Stat;