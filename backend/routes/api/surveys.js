const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const auth = require("../../middleware/auth");
const validateShema = require("../../middleware/validate-schema");

const Survey = require("../../models/Survey");

const defaultSurvey = {
  name: "New Survey",
  json: {
    elements: [
      { type: "radiogroup", name: "question1", choices: ["item1", "item2", "item3"] },
    ],
  },
};

// @route    POST api/surveys demo
// @desc     Create a survey
// @access   Private
router.post(
  "/",
  [auth, [check("name", "Text is required").not().isEmpty()]],
  validateShema,
  async (req, res) => {
    try {
      const { name, json } = req.body;
      let survey = await Survey.findOne({ name });

      if (survey) {
        console.log("already exist");
        return res.status(400).json({
          errors: [{ msg: "Survey already exists" }],
        });
      }
      newSurvey = new Survey({
        name,
        json,
      });

      await newSurvey.save();
      res.json(newSurvey);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/surveys
// @desc     Get all surveys
// @access   Private
router.get("/", auth, async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ date: 1 });
    res.json(surveys);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/surveys/create
// @desc     Create default survey
// @access   Private

router.get("/create", auth, async (req, res) => {
  try {
    newSurvey = new Survey({
      name: defaultSurvey.name,
      json: defaultSurvey.json,
    });
    await newSurvey.save();
    res.json(newSurvey);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/surveys/:id
// @desc     Get survey by ID
// @access   Private
router.get("/:id", async (req, res) => {
  try {
    const survey = await Survey.find({ id: req.params.id });
    // const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({ msg: "Survey not found" });
    }

    res.json(survey[0]);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Survey not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/surveys/:id
// @desc     Delete a survey
// @access   Private
router.delete("/:id", auth, async (req, res) => {
  try {
    await Survey.deleteOne({ id: req.params.id }).then(() => {
      res.json({ msg: "Survey removed" });
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Survey not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/surveys/:id
// @desc     Update survey
// @access   Private
router.put("/changeJson", auth, async (req, res) => {
  try {
    if (req.body.json.title) {
      newName = req.body.json.title;
      survey = await Survey.findOneAndUpdate(
        { id: req.body.id },
        { $set: { name: newName, json: req.body.json } },
        { new: true, upsert: true }
      );
    } else
      survey = await Survey.findOneAndUpdate(
        { id: req.body.id },
        { $set: { json: req.body.json } },
        { new: true, upsert: true }
      );
    res.json(survey);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
