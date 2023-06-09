const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const auth = require("../../middleware/auth");
const validateShema = require("../../middleware/validate-schema");

const Post = require("../../models/Post");
const Survey = require("../../models/Survey")
const User = require("../../models/User");

// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.post("/", [], validateShema, async (req, res) => {
  try {
    // const user = await User.findById(req.user.id).select('-password');

    const newPost = new Post({
      postId: req.body.postId,
      surveyResult: req.body.surveyResult,
      surveyResultText: req.body.surveyResultText,
    });

    const post = await newPost.save();

    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/posts/surveyresults
// @desc     Get surveyresults
// @access   Private
router.post("/surveyallresults/:id", async (req, res) => {
  try {
    // const user = await User.findById(req.user.id).select('-password');
    const SurveyAllResults = await Post.find({ postId: req.params.id });
    const surveyTitle = await Survey.find({ id: req.params.id });
    
    var resResults = [];
    var row;
    var temp;
    // console.log("QQQ", JSON.stringify(surveyTitle[0].json.pages));
    SurveyAllResults.forEach(element => {
      if(element.surveyResult){
        row = '{';
        for (const ques in element.surveyResult) {
          if(ques) {
            for (const page of surveyTitle[0].json.pages) {
              
              for (const elem of page.elements) {
                if(elem.name === ques){
                  
                  for (const choice of elem.choices) {
                    
                    if(element.surveyResult[ques] === choice.value){
                      temp = '"' + elem.title +'":"' + choice.text+'",';
                      row += temp;
                      // console.log("TMP", String(temp));
                      break;
                    }
                    
                  }
                  break;
                }
              }
              
            }
          }
        }
        // surveyTitle.
        // let ques = element.surveyResult.
        row = row.slice(0,-1);
        row += '}'

        resResults.push(JSON.parse(String(row)));
        // console.log("ROW", JSON.parse(String(row)));
      }
          
    });
    // console.log(resResults);
    res.json(resResults);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/posts/calc cell weighing
// @desc     Get calculation
// @access   Private
router.get("/calc/:id", auth, async (req, res) => {
  try {
    const populationNumber = [
      [9408, 4032, 7526.4, 5913.6, 26880.0],
      [8820, 3780, 7056, 5544.0, 25200.0],
      [6762, 2898, 5410, 4250.4, 19320.0],
      [4410, 1890, 3528, 2772.0, 12600.0],
      [7392, 3168, 5913.6, 4646.4, 21120.0],
      [6930, 2970, 5544.0, 4356.0, 19800.0],
      [5313, 2277, 4250.4, 3339.6, 15180.0],
      [3465, 1485, 2772.0, 2178.0, 9900.0],
    ];
    var populationPercentage = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var samplePercentage = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var linearStep7 = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var logisticStep7 = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var AdjustRow = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var AdjustCol = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var sample = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    var voteValueCell = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var voteValueLinear = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var voteValueLogistic = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var voteValueRaking = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var totalPopulation = 0;
    var totalSample = 0;
    var populationMean = 0,
      sampelMean;
    totalSamRow = [0, 0, 0, 0, 0, 0, 0, 0];
    totalSamCol = [0, 0, 0, 0];
    totalPopRow = [0, 0, 0, 0, 0, 0, 0, 0];
    totalPopCol = [0, 0, 0, 0];
    var logisticReg = [0, 0];
    var linearReg = [0, 0];
    var cellWeightMethod = [0, 0];
    var rakingMethod = [0, 0];

    location = ["item1", "item2", "item3", "item4"];
    age = ["item1", "item2", "item3", "item4"];
    gender = ["1", "2"];
    vote = ["item1", "item2"];
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 8; j++) {
        totalPopulation += populationNumber[j][i];
        await Post.countDocuments(
          {
            "postId": req.params.id,
            "surveyResult.question1": gender[(j - (j % 4)) / 4],
            "surveyResult.question2": location[i],
            "surveyResult.question3": age[j % 4],
          },
          (err, cnt) => {
            sample[j][i] = cnt;
            totalSample += cnt;
            totalPopRow[j] += populationNumber[j][i];
            totalPopCol[i] += populationNumber[j][i];
            AdjustCol[j][i] = cnt;
            totalSamRow[j] += cnt;
          }
        );
      }
    var flag = true;
    while (flag) {
      for (let i = 0; i < 4; i++) totalSamCol[i] = 0;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
          AdjustRow[j][i] = (AdjustCol[j][i] * totalPopRow[j]) / totalSamRow[j];
          totalSamCol[i] += AdjustRow[j][i];
        }
      }

      for (let j = 0; j < 8; j++) totalSamRow[j] = 0;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
          AdjustCol[j][i] = (AdjustRow[j][i] * totalPopCol[i]) / totalSamCol[i];
          totalSamRow[j] += AdjustCol[j][i];
        }
      }

      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
          if (Math.abs(totalSamRow[j] - totalPopRow[j]) < 0.001) {
            flag = false;
          }
        }
      }
    }

    sampelMean = totalSample / 32;
    populationMean = totalPopulation / 32;

    B1Num = 0;
    B1Den = 0;
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 8; j++) {
        B1Num +=
          (populationNumber[j][i] - populationMean) *
          (sample[j][i] - sampelMean);
        B1Den +=
          (populationNumber[j][i] - populationMean) *
          (populationNumber[j][i] - populationMean);

        await Post.countDocuments(
          {
            "postId": req.params.id,
            "surveyResult.question1": gender[(j - (j % 4)) / 4],
            "surveyResult.question2": location[i],
            "surveyResult.question3": age[j % 4],
          },
          (err, cnt) => {
            populationPercentage[j][i] =
              (populationNumber[j][i] / totalPopulation) * 100;
            samplePercentage[j][i] = cnt * 2;
            voteValueCell[j][i] =
              populationPercentage[j][i] / samplePercentage[j][i];
          }
        );
      }

    B1 = B1Num / B1Den;
    B0 = sampelMean - B1 * populationMean;
    // console.log("voteValue=====>>>>>", voteValue);

    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 8; j++)
        for (let k = 0; k < 2; k++) {
          linearStep7[j][i] = B0 + B1 * populationNumber[j][i];
          voteValueLinear[j][i] = linearStep7[j][i] / sample[j][i];

          logisticStep7[j][i] =
            1 + Math.exp(-(B0 + B1 * populationNumber[j][i]));
          voteValueLogistic[j][i] = logisticStep7[j][i] / sample[j][i];

          voteValueRaking[j][i] =
            AdjustCol[j][i] / totalPopulation / sample[j][i];

          await Post.countDocuments(
            {
              "postId": req.params.id,
              "surveyResult.question1": gender[(j - (j % 4)) / 4],
              "surveyResult.question2": location[i],
              "surveyResult.question3": age[j % 4],
              "surveyResult.question4": vote[k],
            },
            (err, cnt) => {
              cellWeightMethod[k] += cnt * voteValueCell[j][i];
              linearReg[k] += cnt * voteValueLinear[j][i];
              logisticReg[k] += cnt * voteValueLogistic[j][i];
              rakingMethod[k] += cnt * voteValueRaking[j][i];
            }
          );
        }
    sum = cellWeightMethod[0] + cellWeightMethod[1];
    cellWeightMethod[0] = Math.round((cellWeightMethod[0] / sum) * 1000) / 10;
    cellWeightMethod[1] = Math.round((cellWeightMethod[1] / sum) * 1000) / 10;
    sum = linearReg[0] + linearReg[1];
    linearReg[0] = Math.round((linearReg[0] / sum) * 1000) / 10;
    linearReg[1] = Math.round((linearReg[1] / sum) * 1000) / 10;
    sum = logisticReg[0] + logisticReg[1];
    logisticReg[0] = Math.round((logisticReg[0] / sum) * 1000) / 10;
    logisticReg[1] = Math.round((logisticReg[1] / sum) * 1000) / 10;
    sum = rakingMethod[0] + rakingMethod[1];
    rakingMethod[0] = Math.round((rakingMethod[0] / sum) * 1000) / 10;
    rakingMethod[1] = Math.round((rakingMethod[1] / sum) * 1000) / 10;
    // console.log(cellWeightMethod);
    // console.log(linearReg);
    // console.log(logisticReg);
    // console.log(rakingMethod);

    resJson = {
      cellWeighting: cellWeightMethod,
      linearReg: linearReg,
      logisticReg: logisticReg,
      rakingMethod: rakingMethod,
    };

    res.status(200).send(resJson);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/posts/calc linear regression
// @desc     Get calculation
// @access   Private
router.get("/calc/linear", auth, async (req, res) => {
  try {
    const populationNumber = [
      [9408, 4032, 7526, 5914],
      [8820, 3780, 7056, 5544],
      [6762, 2898, 5410, 4250],
      [4410, 1890, 3528, 2772],
      [7392, 3168, 5914, 4646],
      [6930, 2970, 5544, 4356],
      [5313, 2277, 4250, 3340],
      [3465, 1485, 2772, 2178],
    ];

    var step7 = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    var sample = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var voteValue = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var totalPopulation = 0,
      totalSample = 0;
    var populationMean = 0,
      sampelMean;
    var linearReg = [0, 0];

    location = ["item1", "item2", "item3", "item4"];
    age = ["item1", "item2", "item3", "item4"];
    gender = ["1", "2"];
    vote = ["item1", "item2"];
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 8; j++) {
        totalPopulation += populationNumber[j][i];
        await Post.countDocuments(
          {
            "surveyResult.question1": gender[(j - (j % 4)) / 4],
            "surveyResult.question2": location[i],
            "surveyResult.question3": age[j % 4],
          },
          (err, cnt) => {
            sample[j][i] = cnt;
            totalSample += cnt;
          }
        );
      }
    sampelMean = totalSample / 32;
    populationMean = totalPopulation / 32;
    // console.log(populationMean);

    B1Num = 0;
    B1Den = 0;

    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 8; j++) {
        B1Num +=
          (populationNumber[j][i] - populationMean) *
          (sample[j][i] - sampelMean);
        B1Den +=
          (populationNumber[j][i] - populationMean) *
          (populationNumber[j][i] - populationMean);
      }

    B1 = B1Num / B1Den;
    B0 = sampelMean - B1 * populationMean;
    // console.log(B0);

    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 8; j++)
        for (let k = 0; k < 2; k++) {
          step7[j][i] = B0 + B1 * populationNumber[j][i];
          voteValue[j][i] = step7[j][i] / sample[j][i];
          await Post.countDocuments(
            {
              "surveyResult.question1": gender[(j - (j % 4)) / 4],
              "surveyResult.question2": location[i],
              "surveyResult.question3": age[j % 4],
              "surveyResult.question4": vote[k],
            },
            (err, cnt) => {
              linearReg[k] += cnt * voteValue[j][i];
            }
          );
        }

    sum = linearReg[0] + linearReg[1];
    linearReg[0] = (linearReg[0] / sum) * 100;
    linearReg[1] = (linearReg[1] / sum) * 100;
    // console.log("voteValue======>>>>>>>>", voteValue);

    res.status(200).send(JSON.stringify(linearReg));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/posts/calc logistic regression
// @desc     Get calculation
// @access   Private
router.get("/calc/logistic", auth, async (req, res) => {
  try {
    const populationNumber = [
      [9408, 4032, 7526, 5914],
      [8820, 3780, 7056, 5544],
      [6762, 2898, 5410, 4250],
      [4410, 1890, 3528, 2772],
      [7392, 3168, 5914, 4646],
      [6930, 2970, 5544, 4356],
      [5313, 2277, 4250, 3340],
      [3465, 1485, 2772, 2178],
    ];

    var step7 = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    var sample = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var voteValue = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var totalPopulation = 0,
      totalSample = 0;
    var populationMean = 0,
      sampelMean;
    var logisticReg = [0, 0];

    location = ["item1", "item2", "item3", "item4"];
    age = ["item1", "item2", "item3", "item4"];
    gender = ["1", "2"];
    vote = ["item1", "item2"];
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 8; j++) {
        totalPopulation += populationNumber[j][i];
        await Post.countDocuments(
          {
            "surveyResult.question1": gender[(j - (j % 4)) / 4],
            "surveyResult.question2": location[i],
            "surveyResult.question3": age[j % 4],
          },
          (err, cnt) => {
            sample[j][i] = cnt;
            totalSample += cnt;
          }
        );
      }
    sampelMean = totalSample / 32;
    populationMean = totalPopulation / 32;
    // console.log(populationMean);

    B1Num = 0;
    B1Den = 0;

    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 8; j++) {
        B1Num +=
          (populationNumber[j][i] - populationMean) *
          (sample[j][i] - sampelMean);
        B1Den +=
          (populationNumber[j][i] - populationMean) *
          (populationNumber[j][i] - populationMean);
      }

    B1 = B1Num / B1Den;
    B0 = sampelMean - B1 * populationMean;
    console.log(B0);

    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 8; j++)
        for (let k = 0; k < 2; k++) {
          step7[j][i] = 1 + Math.exp(-(B0 + B1 * populationNumber[j][i]));
          voteValue[j][i] = step7[j][i] / sample[j][i];
          await Post.countDocuments(
            {
              "surveyResult.question1": gender[(j - (j % 4)) / 4],
              "surveyResult.question2": location[i],
              "surveyResult.question3": age[j % 4],
              "surveyResult.question4": vote[k],
            },
            (err, cnt) => {
              logisticReg[k] += cnt * voteValue[j][i];
            }
          );
        }
    // console.log(voteValue);
    sum = logisticReg[0] + logisticReg[1];
    logisticReg[0] = (logisticReg[0] / sum) * 100;
    logisticReg[1] = (logisticReg[1] / sum) * 100;
    //   console.log("voteValue======>>>>>>>>", voteValue);

    res.status(200).send(JSON.stringify(logisticReg));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/posts/calc raking
// @desc     Get calculation
// @access   Private
router.get("/calc/raking", auth, async (req, res) => {
  try {
    const populationNumber = [
      [9408, 4032, 7526, 5914],
      [8820, 3780, 7056, 5544],
      [6762, 2898, 5410, 4250],
      [4410, 1890, 3528, 2772],
      [7392, 3168, 5914, 4646],
      [6930, 2970, 5544, 4356],
      [5313, 2277, 4250, 3340],
      [3465, 1485, 2772, 2178],
    ];
    var AdjustRow = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var AdjustCol = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var rakedSample = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var sample = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    var voteValue = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    totalSamRow = [0, 0, 0, 0, 0, 0, 0, 0];
    totalSamCol = [0, 0, 0, 0];
    totalPopRow = [0, 0, 0, 0, 0, 0, 0, 0];
    totalPopCol = [0, 0, 0, 0];
    var totalPopulation = 0,
      totalSample = 0;
    var populationMean = 0,
      sampelMean;
    var logisticReg = [0, 0];

    location = ["item1", "item2", "item3", "item4"];
    age = ["item1", "item2", "item3", "item4"];
    gender = ["1", "2"];
    vote = ["item1", "item2"];
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 8; j++) {
        totalPopulation += populationNumber[j][i];
        await Post.countDocuments(
          {
            "surveyResult.question1": gender[(j - (j % 4)) / 4],
            "surveyResult.question2": location[i],
            "surveyResult.question3": age[j % 4],
          },
          (err, cnt) => {
            sample[j][i] = cnt;
            totalSample += cnt;
            totalPopRow[j] += populationNumber[j][i];
            totalPopCol[i] += populationNumber[j][i];
            AdjustCol[j][i] = cnt;
            totalSamRow[j] += cnt;
          }
        );
      }
    // for (let i = 0; i < 4; i++) {
    //   for (let j = 0; j < 8; j++) {
    //     AdjustRow[j][i] = (AdjustCol[j][i] * totalPopRow[j]) / totalSamRow[j];
    //     //   totalSamCol[i] += AdjustCol[j][i];
    //   }
    // }
    // console.log(AdjustRow);

    var flag = true;
    while (flag) {
      for (let i = 0; i < 4; i++) totalSamCol[i] = 0;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
          AdjustRow[j][i] = (AdjustCol[j][i] * totalPopRow[j]) / totalSamRow[j];
          totalSamCol[i] += AdjustRow[j][i];
        }
      }

      for (let j = 0; j < 8; j++) totalSamRow[j] = 0;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
          AdjustCol[j][i] = (AdjustRow[j][i] * totalPopCol[i]) / totalSamCol[i];
          totalSamRow[j] += AdjustCol[j][i];
        }
      }

      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
          if (Math.abs(totalSamRow[j] - totalPopRow[j]) < 0.001) {
            flag = false;
          }
        }
      }
    }
    sampelMean = totalSample / 32;
    populationMean = totalPopulation / 32;

    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 8; j++)
        for (let k = 0; k < 2; k++) {
          voteValue[j][i] = AdjustCol[j][i] / totalPopulation / sample[j][i];
          await Post.countDocuments(
            {
              "surveyResult.question1": gender[(j - (j % 4)) / 4],
              "surveyResult.question2": location[i],
              "surveyResult.question3": age[j % 4],
              "surveyResult.question4": vote[k],
            },
            (err, cnt) => {
              logisticReg[k] += cnt * voteValue[j][i];
            }
          );
        }
    // console.log(voteValue);
    sum = logisticReg[0] + logisticReg[1];
    logisticReg[0] = (logisticReg[0] / sum) * 100;
    logisticReg[1] = (logisticReg[1] / sum) * 100;
    //   console.log("voteValue======>>>>>>>>", voteValue);

    res.status(200).send(JSON.stringify(logisticReg));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/posts
// @desc     Get all posts
// @access   Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Like a post
// @access   Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }

    // Get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  validateShema,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }

    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Get remove index
    const removeIndex = post.comments
      .map((comment) => comment.id)
      .indexOf(req.params.comment_id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
