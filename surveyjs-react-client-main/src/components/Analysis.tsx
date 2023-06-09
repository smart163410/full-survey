import React, { useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import { create, load, remove } from '../redux/surveys';
import { useReduxDispatch, useReduxSelector } from '../redux';
import { Link } from 'react-router-dom';
import setAuthToken from '../utils/setAuthToken';
import * as XLSX from 'xlsx';
import './Analysis.css';
import { json } from 'msw/lib/types/context';
import { IQuestion } from '../models/survey'
import { IChoice } from '../models/survey'
import { loadAll } from '../redux/results';
import { isNumber, sampleSize } from 'lodash';

const Analysis = (): React.ReactElement => {
    const surveys = useReduxSelector(state => state.surveys.surveys)
    const surveyallresults = useReduxSelector(state => state.results.surveyallresults)
    const dispatch = useReduxDispatch()
    const postStatus = useReduxSelector(state => state.surveys.status)

    interface TableItem {
        tbNum: number
        choiceNum: number
        num: number
    }

    const initialTableData: TableItem[] = [
        { tbNum : 0, choiceNum: 0, num: 0 }
    ]


    const [data, setData] = useState("");
    const [survey, setSurvey] = useState(0);
    const [tbJson, setTbJson] = useState("");
    const [SampleSize, setSampleSize] = useState(0);
    const [ques_list, setQuesList] = useState<Array<IQuestion>>([{id:"", name: "Select the question", json: ""}]);
    const [stepNum, setStepnum] = useState(1); 
    const [calcTable, setSampleTB] = useState("");
    const [qId, setQId] = useState<number[]>([]);
    const [quesNum, setQuesNum] = useState(1);
    const [nQues, setNQues] = useState(0);
    const [flagNonResponse, setFlagNonRes] = useState(true);
    const [tableData, setTableData] = useState(initialTableData) //Population data
    const [PopulationSize, setPopulSize] = useState(150000);
    const [popul_list, setPopullist] = useState<TableItem[]>([{tbNum : 0, choiceNum: 0, num: 0}]);
    const [totalQSum, setTotalQSum] = useState<number[]>([]);
    const [sampleCalcTb, setSampleCalcTb] = useState<number[][]>();
    const [populationCalcTb, setPopulationCalcTb] = useState<number[][]>();

    const [resultTb, setResultTb] = useState("");
    const [cellWeightTb, setCellWeightTb] = useState<number[][]>();
    const [rakingTb, setRakingTb] = useState<number[][]>();
    const [linearRegressionTb, setLinearRegressionTb] = useState<number[][]>();
    const [logisticRegressionTb, setLogisticRegressionTb] = useState<number[][]>();

    useEffect(() => {
        setAuthToken();
        if (postStatus === 'idle') {
            dispatch(load());
            dispatch(loadAll(surveys[0]?.id));
        }            
    }, [postStatus, dispatch]);

    useEffect(() => {
        // Load of Survey from Database
        dispatch(loadAll(String(survey)));
    }, [survey]);

    useEffect(() => {
        // Load of survey data
        setData(JSON.stringify(surveyallresults));
    }, [surveyallresults]);

    useEffect(() => {
        // Display of table with survey data & make ques_list
        try {
            setTbJson(buildHtmlTable(JSON.parse(data)));
            setCalcTable(JSON.parse(data));
        } catch (error) {
            if (error instanceof SyntaxError && error.message.includes('JSON')) {
              console.error('Error: Invalid JSON input');
            } else {
              console.error(`Error: Other error`);
            }
        }
    }, [data]);

    useEffect(()=>{
        // console.log("NQ", nQues);
    }, [nQues]);

    useEffect(() => {
        console.log("QN", quesNum);
    }, [quesNum]);

    useEffect(()=>{
        // console.log("QID", flagNonResponse);
        setSampleTB(buildSampleTable(qId));
        populTable(qId);

        if(qId.length === 2){
            let row = ques_list[qId[0]]?.json.length;
            let col = ques_list[qId[1]]?.json.length
            let populationCalcTb1: number[][] = create2DArray(row, col);
            let sampleCalcTb1: number[][] = create2DArray(row, col);
            for(let i = 0; i<row; i++){
                for(let j = 0; j<col; j++){
                    let rr = Number(ques_list[qId[0]].json[i].count);
                    let cc = Number(ques_list[qId[1]].json[j].count);
                    sampleCalcTb1[i][j] = rr * cc / SampleSize ;                    
                }
            }

            for(let i = 0; i<row; i++){
                for(let j = 0; j<col; j++){
                    let rr=0, cc=0;
                    for(let k = 0; k<popul_list.length; k++){
                        let tb = popul_list[k].tbNum;
                        let ch = popul_list[k].choiceNum;
                        if(i === ch && tb === qId[0]){
                            rr = Number(popul_list[k].num);
                        }
                        if(j === ch && tb === qId[1]){
                            cc = Number(popul_list[k].num);
                        }
                        
                    }
                    populationCalcTb1[i][j] = rr * cc / PopulationSize;
                    // console.log("len", populationCalcTb1[i][j]);
                }
            }

            setSampleCalcTb(sampleCalcTb1);
            setPopulationCalcTb(populationCalcTb1);
        }

        let totalQSum1 = [];
        for(let i=0; i<ques_list.length; i++)
            totalQSum1[i] = 0;

        setTotalQSum(totalQSum1);

        // console.log("CAC", populationCalcTb);
    }, [qId, flagNonResponse]);

    useEffect(()=>{
        // console.log("QID", qId);
        setPopulSize(PopulationSize);
        // populTable(qId);
    }, [PopulationSize]);

    useEffect(() => {
        changePopulTb();
    }, [tableData]);

    



    ////////////////////////////////////////////////////
    /////////////////   Main Part   ////////////////////
    ////////////////////////////////////////////////////

    //////////////////////////  STEP 1  /////////////////////////////
    //--------------  when admin clicks 'download' button  --------------
    const onChangeFile = (e: any) => {
        // var name = e.target.files[0].name;
        const reader = new FileReader();
        reader.onload = (evt) => { // evt = on_file_select event
            /* Parse data */
            const bstr = evt?.target?.result;
            const wb = XLSX.read(bstr, {type:'binary'});
            /* Get first worksheet */
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            /* Convert array of arrays */

            // const largestCell = maxArray(Object.keys(ws));
            const cells = Object.keys(ws);
            const largestCell = cells[cells.length-2];
            
            var lastRow = Number(largestCell.slice(1));
            const lastColumn = largestCell.slice(0,1)
            var colNum = lastColumn.charCodeAt(0) - 64;
            
            // const ddata = XLSX.utils.sheet_to_csv(ws);
            const data_json = XLSX.utils.sheet_to_json(ws);
            setData(JSON.stringify(data_json));
            
        };
        reader.readAsBinaryString(e.target.files[0]);
        
    }

    //--------------  when admin clicks 'surveychange' select form  --------------
    const onSurveyChange = (e: any) => {
        // sc means survey.id
        let sc = e.target.value;

        // initialization of variables
        var popul_list1:Array<TableItem> = [{tbNum : 0, choiceNum: 0, num: 0}];
        quesId = [];
        setPopullist(popul_list1);
        setQuesNum(1);
        setQId(quesId);
        setSurvey(sc);
    }

    // *******  display of table, making of ques_list (id, name, json), set of 'SampleSize' constant   *********
    const buildHtmlTable = (myList:any[]) => {
        setSampleSize(myList.length);  // set of 'SampleSize' constant

        let columns:string[];
        columns=[];

        let res = '<table class="sjs-table">';
        let headerTr = '';
        let k = 0; // added for ques_list.id
        ques_list.splice(0, ques_list.length); // Clear Ques

        for (var i = 0; i < myList.length; i++) {
            var rowHash = myList[i];
            for (var key in rowHash) {
                if (!columns.some(x=>x==key)) {
                    columns.push(key);
                    headerTr+='<th>'+key+'</th>';
    
                    let ques: IQuestion={id:"", name: "", json:""};
                    ques.id = String(k);
                    ques.name = key;
                    ques_list.push(ques);
                    k++;
                }
            }
        }
        
        res += "<tr>"+headerTr+"</tr>";
        
        for (var i = 0; i < myList.length; i++) {
          let row = '';
          for (var colIndex = 0; colIndex < columns.length; colIndex++) {
            var cellValue = myList[i][columns[colIndex]];
            if (cellValue == null) cellValue = "";
            row+='<td>'+cellValue+'</td>';
          }
          res += "<tr>"+row+"</tr>";
        }
        res += "</table>";
        
        return res;
    }

    // *******  edit of ques_list's json to add choices (person, name, count)   *********
    const setCalcTable = (myList:any[]) => {

        let columns:string[];
        columns=[];
        
        for (let k = 0; k < myList.length; k++) {
            var rowHash = myList[k];
            for (var ques in rowHash) {
                if (!columns.some(x=>x==ques)) {
                    columns.push(ques);
                }
            }
        }

        let choices: Array<IChoice> =[{person:"", name: "", count: 0}];
        for (let i = 0; i < myList.length; i++) {
            choices.splice(0, choices.length);
          for (var colIndex = 0; colIndex < columns.length; colIndex++) {
            var cellValue = myList[i][columns[colIndex]];
            if (cellValue == null) cellValue = "";
            
            let choice_temp: IChoice = {person:"", name: "", count: 0};
            choice_temp.person=String(i);
            choice_temp.name=cellValue;
            choice_temp.count=1;

            let rowFound = false;
            
            if(ques_list[colIndex].json === "") {
                ques_list[colIndex].json= choice_temp;
            }
            else{
                if(ques_list[colIndex].json.length === undefined) {
                    if(ques_list[colIndex].json.name === cellValue){
                        ques_list[colIndex].json.count ++;
                        ques_list[colIndex].json.name = choice_temp.name;
                        ques_list[colIndex].json.person += `,${choice_temp.person}`;
                    }
                    else {
                        var choice_list: Array<IChoice> = [{person:"", name: "", count: 0}];
                        choice_list.splice(0, choice_list.length);
                        
                        let choice : IChoice = {person:"", name: "", count: 0};
                        choice.person = ques_list[colIndex].json.person;
                        choice.name = ques_list[colIndex].json.name;
                        choice.count = ques_list[colIndex].json.count;
                        choice_list.push(choice);
                        choice_list.push(choice_temp);

                        ques_list[colIndex].json = choice_list;
                    }
                }
                else{
                    for (let r = 0; r < ques_list[colIndex].json.length; r++) {
                        let row = ques_list[colIndex].json[r];
                        if (row.name === choice_temp.name) {
                            ques_list[colIndex].json[r].count ++;
                            ques_list[colIndex].json[r].name = choice_temp.name;
                            ques_list[colIndex].json[r].person += `,${choice_temp.person}`;
                            rowFound = true;
                            break;
                        }
                    }
                    if (!rowFound){
                        ques_list[colIndex].json.push(choice_temp);
                    }
                }
            }
          }
        }

    }

    //////////////////////////  STEP 2  /////////////////////////////
    //--------------  when admin clicks 'noticed question' select form  --------------
    const onNQuesChange = (e: any) =>{
        let nq = e.target.value;// noticed question's id
        setNQues(nq);

        // initialization of variables
        var popul_list1:Array<TableItem> = [{tbNum : 0, choiceNum: 0, num: 0}];
        setPopullist(popul_list1);
        setQuesNum(1);
        quesId = [];
        setQId(quesId);

    }

    //--------------  when admin clicks '2~3 questions to calculate' select form  --------------
    var expanded = false;
    const showCheckboxes = () => {
        var checkboxes = document.getElementById("checkboxes");
        if (!expanded && checkboxes !== null) {
            checkboxes.style.display = "block";
            expanded = true;
        } else {
            if(checkboxes !== null) checkboxes.style.display = "none";
            expanded = false;
        }
    }
    
    //------------ When admin selects questions for calculation of results ------------
    var quesId:number[];
    quesId=[];
    const changeCheckBox = (e:any) => {
        if(e.target.checked) {
            setQuesNum((c) => c+1);
            if(quesNum < 4){
                quesId[quesNum-1] = Number(e.target.id);
                for(let i = 0; i < qId.length; i++){
                    quesId[i] = qId[i];
                }
            }
            else{
                alert("You can't select over 3 questions!");
                setQuesNum(5);
                for(let i = 0; i < qId.length; i++){
                    quesId[i] = qId[i];
                }
            }
            setQId(quesId);
                
        }
        else{
            if(Number(e.target.id) !== Number(nQues)){
                if(quesNum <= 4){
                    var tempId:number[];
                    tempId=[];
                    for(let i = 0; i < qId.length; i++){
                        quesId[i] = qId[i];
                    }
                    let delId = Number(e.target.id);
                    
                    var delFlag = false;
                    for(let i = 0; i < quesNum-1; i++){
                        if(delId === i){
                            delFlag = true;
                        }
                        if(delFlag){
                            quesId[i]=quesId[i+1];
                        }
                    }
                    for(let i = 0; i < quesId.length-1; i++){
                        tempId[i] = quesId[i];
                    }
                    setQuesNum((c) => c-1);
                    setQId(tempId);
                }
                else{
                    for(let i = 0; i < qId.length; i++){
                        quesId[i] = qId[i];
                    }
                    setQuesNum((c) => c-1);
                }
            }
        }   
    }

    //-----------  Flag whether non-response data is included  ------------
    const setNonResponse = (e:any) => {
        if(e.target.checked) {
            setFlagNonRes(true);
        }
        else{
            setFlagNonRes(false);
        }
    }

    //----- build sample table with sample data as many as number of selected questions ------
    const buildSampleTable = (quesId:number[]) => {

        let res = `<div><h4>Sample Size :${SampleSize}</h4></div>`;
        if(quesId.length < 4){
            for(let tb = 0; tb < quesId.length; tb++){
                
                res += '<table class="sjs-table">';
                let headerTr = '';
                headerTr+='<th>'+ques_list[quesId[tb]]?.name+'</th>';
                headerTr += '<th>'+'Number of people'+'</th>';
                headerTr += '<th>'+'Percentage (%)'+'</th>';
                res += "<tr>"+headerTr+"</tr>";
                let sumRows = 0;

                for (var i = 0; i < ques_list[quesId[tb]]?.json.length; i++) {
                    let row = '';
                    ////////  Choices of answer  ///////////
                    var cellValue1 = ques_list[quesId[tb]].json[i].name;
                    if (cellValue1 === "") {
                        if(flagNonResponse){
                            cellValue1 = "non-response";
                        } else {
                            continue;
                        }
                    }
                    row+='<td>'+cellValue1+'</td>';

                    ////////  Number of people  ///////////
                    var cellValue2 = ques_list[quesId[tb]].json[i].count;
                    sumRows += Number(cellValue2);
                    if (cellValue2 == null) cellValue2 = "";
                    row+='<td>'+cellValue2+'</td>';
                    
                    ////////  Percent  ///////////
                    var cellValue3 = Number(ques_list[quesId[tb]].json[i].count)/SampleSize*100;
                    if (cellValue3 == null) cellValue3 = 0;
                    row+='<td>'+cellValue3.toFixed(2) +'</td>';
                    
                    res += "<tr>"+row+"</tr>";
                }
                let row ='<td>'+"Total"+'</td>';
                row+='<td>'+sumRows+'</td>';
                row+='<td>'+(sumRows/SampleSize*100).toFixed(2) +'</td>';
                res += "<tr style='font-weight:bold'>"+row+"</tr>";

                res += "</table><br />";
            }
              
        }

        return res;
    }

    //----- build sample table with sample data as many as number of selected questions ------
    const populTable = (quesId:number[]) => {
        var popul_list1:Array<TableItem> = [{tbNum : 0, choiceNum: 0, num: 0}];
        popul_list1.splice(0, popul_list1.length);
        
        if(quesId.length < 4){
            for(let tb = 0; tb < quesId.length; tb++){
                
                for (var i = 0; i < ques_list[quesId[tb]]?.json.length; i++) {
                    var cellValue1 = ques_list[quesId[tb]].json[i].name;
                    if (cellValue1 === "") {
                        if(flagNonResponse){
                        } else {
                            continue;
                        }
                    }
                    var popul_temp: TableItem = {tbNum : quesId[tb], choiceNum: i, num: 0};
                    popul_list1.push(popul_temp);
                }
            }
              
        }
        
        setPopullist(popul_list1);
    }

    ///////////   Dynamic population table    ///////////
    // ********** Here, field is used as table number avoidably
    const handleTableDataChange = (index: number, field: number, value: string) => {
        let num = Number(value) * PopulationSize /100;
        const updatedTableData = [...tableData];
        updatedTableData[index] = {
            ...updatedTableData[index],
            ['choiceNum']: index,
            ['tbNum']: field,
            ['num']: num
        };
        setTableData(updatedTableData);
    }

    // ********** Create 2D Array
    const create2DArray = (rows: number, cols: number): number[][] => {
        let arr: number[] = new Array(rows * cols);
        let result: number[][] = [];
        for (let i = 0; i < rows; i++) {
          result[i] = arr.slice(i * cols, (i + 1) * cols);
        }
        return result;
    }

    // ********** Change population size
    const changePopulSize = (e: any) => {

        let sc = Number(e.target.value);
        setPopulSize(sc);
        var popul_list1:Array<TableItem> = popul_list;
        for(let j = popul_list1.length - 1; j >=0; j--){
            popul_list1[j].num = popul_list1[j].num / PopulationSize * sc;
        }
        setPopullist(popul_list1);

    }

    // ********** Change population table content
    const changePopulTb = () =>{
        setTotalQSum(totalQSum);
        let totalQSum1 = [];
        for(let i = 0; i<ques_list.length; i++){
            totalQSum1[i] = 0;
        }

        var popul_list1:Array<TableItem> = popul_list;
        for(let i = 0; i < tableData.length; i++){
            let temp;
            if(tableData[i]?.num !== undefined){
                temp = Number(tableData[i]?.num);
            }
            else{
                temp = NaN;
            }
            
            if(!isNaN(temp)){
                let col = tableData[i]['choiceNum'];
                let row = tableData[i]['tbNum'];
                
                for(let j = 0; j < popul_list1.length; j++){
                    if(col === popul_list1[j].choiceNum && row === popul_list1[j].tbNum){
                        popul_list1[j].num = temp;
                    }
                }
            }
        }

        for(let j = 0; j < popul_list1.length; j++){
            for(let i=0; i<qId.length; i++)
            if(qId[i] === popul_list1[j].tbNum){
                totalQSum1[qId[i]] += popul_list1[j].num;
            }
        }

        console.log("SUm", totalQSum1);
        setTotalQSum(totalQSum1);
        setPopullist(popul_list1);
    }

    //----------- Create result table when admin clicks 'confirm' button  ----------
    const confirmPopulationTb = () => {
        setResultTb(resultTb);
        if(qId.length === 2){
            let row = ques_list[qId[0]]?.json.length;
            let col = ques_list[qId[1]]?.json.length;

            ////////  For percent  ///////
            let populationCalcTb1: number[][] = create2DArray(row, col);
            ////////  For count  ///////
            let populationCalcTb2: number[][] = create2DArray(row, col);
            ////////  For percent  ///////
            let sampleCalcTb1: number[][] = create2DArray(row, col);
            ////////  For count  ///////
            let sampleCalcTb2: number[][] = create2DArray(row, col);

            let tempTb: number[][] = create2DArray(row, col);

            let cellWeightTb1: number[][] = create2DArray(row, col);
            let rakingTb1: number[][] = create2DArray(row, col);
            let linearRegressionTb1: number[][] = create2DArray(row, col);
            let logisticRegressionTb1: number[][] = create2DArray(row, col);

            /////////////  For Raking  ///////////////
            let rakingFlag = true;
            let rowSum: number[] = Array(row);
            let temp_rowSum: number[] = Array(row);
            let sample_rowSum: number[] = Array(row);
            for(let i = 0; i<row; i++){
                rowSum[i] = 0;
                temp_rowSum[i] = 0;
                sample_rowSum[i] = 0;
            }
            let colSum: number[] = Array(col);
            let temp_colSum: number[] = Array(col);
            let sample_colSum: number[] = Array(col);
            for(let i = 0; i<col; i++){
                colSum[i] = 0;
                temp_colSum[i] = 0;
                sample_colSum[i] = 0;
            }

            ////////////  For Regression  ////////////
            let MeanSample = SampleSize / row /col;
            let MeanPopulation = PopulationSize / row / col;
            let B0 = 0;
            let B1 = 0;
            let numerator = 0;
            let denominator = 0;
            

            if(sampleCalcTb !== undefined){
                sampleCalcTb1 = sampleCalcTb; //For percent
                sampleCalcTb2 = sampleCalcTb;  // For count
            }
            
            for(let i = 0; i<row; i++){
                for(let j = 0; j<col; j++){
                    let rr=0, cc=0;
                    for(let k = 0; k<popul_list.length; k++){
                        let tb = popul_list[k].tbNum;
                        let ch = popul_list[k].choiceNum;
                        if(i === ch && tb === qId[0]){
                            rr = Number(popul_list[k].num);
                        }
                        if(j === ch && tb === qId[1]){
                            cc = Number(popul_list[k].num);
                        }
                        
                    }
                    populationCalcTb1[i][j] = rr * cc / PopulationSize / PopulationSize * 100;
                    populationCalcTb2[i][j] = rr * cc / PopulationSize;
                    tempTb[i][j] = rr * cc / PopulationSize;
                    cellWeightTb1[i][j] = populationCalcTb2[i][j] / sampleCalcTb2[i][j];

                    ///////////  For Regression  /////////
                    numerator += (populationCalcTb2[i][j] - MeanPopulation) * (sampleCalcTb2[i][j] - MeanSample);
                    denominator += (populationCalcTb2[i][j] - MeanPopulation) * (populationCalcTb2[i][j] - MeanPopulation);

                    ////////////    For Raking    ////////////
                    rowSum[i] += populationCalcTb2[i][j];
                    colSum[j] += populationCalcTb2[i][j];

                    sample_rowSum[i] += sampleCalcTb2[i][j];
                    sample_colSum[j] += sampleCalcTb2[i][j];
                }
            }

            ////////////  For raking  //////////////
            for(let i = 0; i<row; i++){
                for(let j = 0; j<col; j++){
                    tempTb[i][j] = rowSum[i] * sampleCalcTb2[i][j] / sample_rowSum[i];
                    temp_colSum[j] += tempTb[i][j];
                }
            }

            let k = 0;
            while(rakingFlag){
                k++;
                for(let i = 0; i<row; i++){
                    for(let j = 0; j<col; j++){
                        if(k % 2 === 0){
                            tempTb[i][j] = rowSum[i] * tempTb[i][j] / temp_rowSum[i];
                            temp_colSum[j] += tempTb[i][j];
                        }
                        else{
                            tempTb[i][j] = colSum[j] * tempTb[i][j] / sample_colSum[i];
                            temp_rowSum[i] += tempTb[i][j];
                        }
                    }
                }
                let bias = 0;
                for(let i = 0; i<row; i++){
                    bias += rowSum[i] - temp_rowSum[i]
                }
                if(bias < 1e-2) rakingFlag = false;
            }

            for(let i = 0; i<row; i++){
                for(let j = 0; j<col; j++){
                    rakingTb1[i][j] = populationCalcTb2[i][j] / tempTb[i][j];
                }
            }

            
            //////////  For Regression  //////////
            B1 = numerator / denominator;
            B0 = MeanSample - B1 * MeanPopulation;
            // console.log("MEAN", B0);
            for(let i = 0; i<row; i++){
                for(let j = 0; j<col; j++){
                    populationCalcTb2[i][j] = B0 + B1 * populationCalcTb2[i][j];
                    let odds = 1 + Math.exp(-(B0 + B1 * populationCalcTb2[i][j]));
                    linearRegressionTb1[i][j] = populationCalcTb2[i][j] / sampleCalcTb2[i][j];
                    logisticRegressionTb1[i][j] = odds / sampleCalcTb2[i][j];
                    console.log("len2", linearRegressionTb1[i][j]);
                }
            }
            


            setSampleCalcTb(sampleCalcTb1);
            setPopulationCalcTb(populationCalcTb2);   
            setCellWeightTb(cellWeightTb1);
            setRakingTb(rakingTb1);
            setLinearRegressionTb(linearRegressionTb1);
            setLogisticRegressionTb(logisticRegressionTb1);
        }

        let resultTb1 = resultTable(JSON.parse(data));
        // console.log("result", cellWeightTb);
        setResultTb(resultTb1);
    }

    const resultTable = (myList:any[]) => {
        var algos = ["Non weighted", "Cell Weighting", "Raking", "Linear Regression", "Logistic Regression"];

        let columns:string[];
        columns=[];
        

        ////////////////   Calculation for sum   //////////////////

        for (var i = 0; i < myList.length; i++) {
            var rowHash = myList[i];
            for (var key in rowHash) {
                if (!columns.some(x=>x==key)) {
                    columns.push(key);
                }
            }
        }
        let cellSum: number[][] = create2DArray(algos.length, ques_list[nQues]?.json.length);
        let algoSum: number[] = new Array(algos.length);
        for(let a = 0; a < algos.length; a ++){
            for(let c = 0; c<ques_list[nQues].json.length; c++){
                if(a === 0) cellSum[a][c] = Number(ques_list[nQues].json[c].count);
                else cellSum[a][c] = 0;
            }
            algoSum[a] = 0;
        }
        
        for(let a = 0; a<algos.length; a++){
            for (var i = 0; i < myList.length; i++) {
                let rc = 0, cc = 0;
                let nqc = 0;
                // console.log("COLs", columns);
                for (var colIndex = 0; colIndex < columns.length; colIndex++) {
                    var cellValue = myList[i][columns[colIndex]];
                    // console.log("NQName", nQues == colIndex);
                    if(nQues == colIndex){
                            
                        for(let c = 0; c < ques_list[nQues].json.length; c++){
                            
                            if(cellValue === ques_list[nQues].json[c].name){
                                nqc = c;
                                // console.log("NQC", nqc);
                                break;
                            }
                        }
                        continue;
                    }
                    for(let q = 0; q < qId.length; q++){
                        
                        if(q === 0){
                            for(let c = 0; c < ques_list[qId[q]].json.length; c++){
                                
                                if(colIndex === qId[q] && cellValue === ques_list[qId[q]].json[c].name){
                                    rc = c;
                                    break;
                                }
                            }
                            continue;
                        }
                        if(q === 1){
                            for(let c = 0; c < ques_list[qId[q]].json.length; c++){
                                
                                if(colIndex === qId[q] && cellValue === ques_list[qId[q]].json[c].name){
                                    cc = c;
                                    break;
                                    // console.log("cell", ques_list[qId[q]].json[c].name);
                                }
                            }
                        }

                    }
                    
                }
                
                if(cellWeightTb !== undefined && linearRegressionTb !== undefined && logisticRegressionTb !== undefined && rakingTb !== undefined){
                    let weight = 0;
                    if(a === 1) weight = cellWeightTb[rc][cc];
                    if(a === 2) weight = rakingTb[rc][cc];
                    if(a === 3) weight = linearRegressionTb[rc][cc];
                    if(a === 4) weight = logisticRegressionTb[rc][cc];
                    
                    cellSum[a][nqc] = cellSum[a][nqc] + weight;
                }
                
            }
            for(let nqc = 0; nqc < ques_list[nQues].json.length; nqc++){
                algoSum[a] += cellSum[a][nqc];
            }
        }

        // console.log("CELLSUM", algoSum);
        
        ////////////   Building resultTB   ////////////

        let noticedRes = ques_list[nQues].json;
        let res = '<table class="sjs-table">';
        let headerTr = '';
        headerTr += '<th>'+ques_list[nQues].name+'</th>';
        
        for (var key of algos) {
            headerTr+='<th>'+key+'</th>';
        }
        res += "<tr>"+headerTr+"</tr>";
        for (var i = 0; i < noticedRes.length; i++) {
            let row ='<td>'+ noticedRes[i]?.name +'</td>';
            for (var colIndex = 0; colIndex < algos.length; colIndex++) {
            if(colIndex === 0) var cell = (cellSum[colIndex][i]/ SampleSize *100).toFixed(2);
            else var cell = (cellSum[colIndex][i]/ algoSum[colIndex] *100).toFixed(2);
            if (cell == null) cell = (0).toFixed(2);
            row+='<td>'+cell+'</td>';
            }
            res += "<tr>"+row+"</tr>";
        }
        res += "</table>";
        console.log("Q------", res);
        return res;
    }
        

    const stepDiv1 = (
        <div id='step1'>
            <u><h2 id='stepHead' style={{display: 'inline'}}>Step 1: Take your survey result</h2></u>
            <form>
                <h3 style={{display: 'inline-block'}}>Import Excel File:  </h3>
                <input type='file' name='myfile' onChange={onChangeFile} />
                <br></br>
                <h3 style={{display: 'inline-block'}}>Or select your survey result table from database:  </h3>
                <select id="survey" name="survey" onChange={onSurveyChange}>
                {surveys.map(survey =>
                        <option value={survey.id}>
                            <span>{survey.name}</span>
                        </option>
                )}                
                </select>
            </form>
            <h3>Survey Result (Scroll with <code>"Shift"</code> key for horizontal scrolling): </h3>
            <div style={{overflowX: 'auto', overflowY: 'auto', height:'500px'}}>
                <div dangerouslySetInnerHTML={{ __html: tbJson }} />
            </div>
        </div>
    );
    

    const stepDiv2 = (
        <div id='step2'>
            <u><h2 id='stepHead' style={{display: 'inline'}}>Step 2: Take your settings for analytics</h2></u>
            <br/>
            <h3 style={{display: 'inline-block'}}>Select your noticed question:  </h3>
            <select id="ql" name="ql" onChange={onNQuesChange}>
            {ques_list.map(ques =>
                    <option value={ques.id}>
                        <span>{ques.name}</span>
                    </option>
            )}                
            </select>
            <br/>
            <h3 style={{display: 'inline-block'}}>Select your questions used as variables:  </h3>
            <form>
                <div>
                    <div className="selectBox" onClick={showCheckboxes}>
                        <select>
                            <option>Select 2 or 3 questions to calculate</option>
                        </select>
                        <div className="overSelect"></div>
                    </div>
                    <div id="checkboxes" >
                        {ques_list.map(ques =>
                            Number(ques.id) != nQues &&
                            <label htmlFor={ques.id}>
                                <input type="checkbox" id={ques.id}  onChange={changeCheckBox} />{ques.name}</label>
                        )}    
                    </div>
                </div>
            </form>
            <h3 style={{display: 'block'}}>Settings for calculation: (Fill in all the gaps and click "confirm" button.) <span style={{marginLeft: '250px', fontSize: '0.8em'}}><input onChange={setNonResponse} defaultChecked type='checkbox' id='fnr' /><label htmlFor='fnr'> show the non-response data</label></span> </h3>
            <div style={{margin:'10px', float: 'left', overflowX: 'auto', overflowY: 'auto', height:'500px', width: '48%'}}>
                <div dangerouslySetInnerHTML={{ __html: calcTable }} />
            </div>
            <div style={{margin:'10px',float: 'left', overflowX: 'auto', overflowY: 'auto', height:'500px', width: '48%'}}>
                <div>
                    <h4>Population Size : <input type="text" value={PopulationSize} onChange={changePopulSize} />
                        <button className='confirm-btn' onClick={confirmPopulationTb}> Confirm</button>        
                    </h4>
                </div>
                
                {
                    qId?.map(tb => <>
                        <table key={tb} className='sjs-table'>
                        <tbody>
                          <tr>
                            <th> {ques_list[tb]?.name}</th>
                            <th> Number of people</th>
                            <th> Percentage (%)</th>
                          </tr>
                        
                          {   
                            popul_list.map((item:any, i:number) => 
                                    
                                    item.tbNum == tb && 
                                    (
                                        <>
                                        <tr key={item.choiceNum}>
                                            <td onBlur={(e) => handleTableDataChange( item.choiceNum, tb, e.target.textContent || '')}>
                                                {ques_list[tb]?.json[item.choiceNum]?.name || "non-response"}
                                            </td>
                                               
                                            <td  onBlur={(e) => handleTableDataChange( item.choiceNum, tb, e.target.textContent || '')}>
                                                { item.num || 0}
                                            </td>
                                            
                                            <td contentEditable  onBlur={(e) => handleTableDataChange(item.choiceNum, tb, e.target.textContent || '')}>
                                                {(Number(item.num) / PopulationSize * 100).toFixed(2) || 0}
                                            </td>
                                        </tr>
                                    
                                        {
                                            item.choiceNum === ques_list[tb]?.json.length-1 ?
                                            <tr style={{fontWeight:'bold'}}>
                                                <td>Total</td>
                                                {
                                                    totalQSum[tb]>PopulationSize ?
                                                        <>
                                                        <td style={{color: 'red'}}>{totalQSum[tb]}</td>
                                                        <td style={{color: 'red'}}>{(totalQSum[tb]/PopulationSize*100).toFixed(2)}</td>
                                                        </>
                                                    :
                                                        <>
                                                        <td >{totalQSum[tb]}</td>
                                                        <td >{(totalQSum[tb]/PopulationSize*100).toFixed(2)}</td>
                                                        </>
                                                }
                                                
                                            </tr>
                                            :
                                            <></>
                                        }
                                        </>
                                    )
                            
                            )
                          }
                        
                        </tbody></table>
                        <br/>
                        </>
                    )
                }
                
            </div>
        </div>
    );

    const stepDiv3 = (
        <div id='step3'>
            <u><h2 id='stepHead' style={{display: 'inline'}}>Step 3: Take your analytics results</h2></u>
            <br/>
            <h3 style={{display: 'inline-block'}}>This table shows results according to algorithms:  </h3>
            <div style={{margin:'10px', float: 'left', overflowX: 'auto', overflowY: 'auto', height:'500px', width: '100%'}}>
                <div dangerouslySetInnerHTML={{ __html: resultTb }} />
            </div>
            <br/>
            
        </div>
    );

    const onPagination = (e: any) =>{
        const name = e.target.name;

        switch(name){
            case "prevButton":
                stepNum>1?setStepnum(stepNum-1):setStepnum(1);
                break;
            case "stepButton1":
                setStepnum(1);
                break;
            case "stepButton2":
                setStepnum(2);
                break;
            case "stepButton3":
                setStepnum(3);
                break;
            case "nextButton":
                stepNum<3?setStepnum(stepNum+1):setStepnum(3);
                break;
            default:
                console.log("no button signal");
        }
        
    }

    // console.log(stepNum);
    return (<>
        
       {stepNum == 1 &&<div className="pagination">
            <button name='prevButton' onClick={onPagination}>&laquo;</button>
            <button name='stepButton1' onClick={onPagination} className="active">1</button>
            <button name='stepButton2' onClick={onPagination}>2</button>
            <button name='stepButton3' onClick={onPagination}>3</button>
            <button name='nextButton' onClick={onPagination}>&raquo;</button>
        </div>} 
        {stepNum == 2 &&<div className="pagination">
            <button name='prevButton' onClick={onPagination}>&laquo;</button>
            <button name='stepButton1' onClick={onPagination} >1</button>
            <button name='stepButton2' onClick={onPagination} className="active">2</button>
            <button name='stepButton3' onClick={onPagination}>3</button>
            <button name='nextButton' onClick={onPagination}>&raquo;</button>
        </div>} 
        {stepNum == 3 &&<div className="pagination">
            <button name='prevButton' onClick={onPagination}>&laquo;</button>
            <button name='stepButton1' onClick={onPagination} >1</button>
            <button name='stepButton2' onClick={onPagination}>2</button>
            <button name='stepButton3' onClick={onPagination} className="active">3</button>
            <button name='nextButton' onClick={onPagination}>&raquo;</button>
        </div>} 

       {stepNum == 1 &&stepDiv1}
       {stepNum == 2 &&stepDiv2}
       {stepNum == 3 &&stepDiv3}

    </>)
}

export default Analysis