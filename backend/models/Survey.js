const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SurveySchema = new Schema({
  id: {
    type: String,
    default: mongoose.Types.ObjectId
  },
  name: {
    type: String,
    required: true,
  },
  json: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Survey = mongoose.model("survey", SurveySchema);
