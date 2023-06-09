import { useParams } from 'react-router'
import React, { useEffect } from 'react';
import { useReduxDispatch, useReduxSelector } from '../redux'
import { post } from '../redux/results'
import { Model, StylesManager } from 'survey-core'
import { Survey } from 'survey-react-ui'
import { get } from '../redux/surveys';
import 'survey-core/defaultV2.css';
import '../components/animation.css';
import '../components/Creator.css';
// StylesManager.applyTheme("defaultV2");

function animate(show: boolean) {
    // const element = document.getElementById("surveyElement");
    const x = document.querySelectorAll("div.sd-body");
    const y = document.querySelectorAll("span.sd-item__decorator");
    const z = document.querySelectorAll("div.sd-radio");

    // For animation
    const element = x[0];
    if (!!element) {
        const list = element.classList;
        
        if(direct === 1 && old_direct === 1 ){
            if (!list.contains("expandable")) {
                list.add("expandable");
                if(list.contains("down")) list.remove("down");
            }
            if (show) {
                list.add("expandable_show");
                if(list.contains("down_show")) list.remove("down_show");                
            } else {
                list.remove("expandable_show");
            }
        }
        
        if(direct === 0 && old_direct === 0 ){
            if (!list.contains("down")) {
                list.add("down");
                if(list.contains("expandable")) list.remove("expandable");
            }
            if (show) {
                list.add("down_show");
                if(list.contains("expandable_show")) list.remove("expandable_show");                
            } else {
                list.remove("down_show");
            }
        }

        if(direct === 1 && old_direct === 0 ){
            if (!list.contains("expandable")) {
                list.add("expandable");
                if(list.contains("down")) list.remove("down");
            }
            if (show) {
                list.add("expandable_show");
                if(list.contains("down_show")) list.remove("down_show");                
            } else {
                list.remove("expandable_show");
            }
        }
        
        if(direct === 0 && old_direct === 1 ){
            if (!list.contains("down")) {
                list.add("down");
                if(list.contains("expandable")) list.remove("expandable");
            }
            if (show) {
                list.add("down_show");
                if(list.contains("expandable_show")) list.remove("expandable_show");                
            } else {
                list.remove("down_show");
            }
        }

    }

    // For A, B, C ...
    for (let j = 0; j < y.length; j++) {
        const myspan = y[j];
        if (!!myspan) {
            const list = myspan.classList;
            if (list.contains("sd-radio__decorator")) {
                list.remove("sd-radio__decorator");
            }
            if(show){
                list.remove("sd-radio__decorator");
                // console.log("num>>>>>>>", list);
            }
        }
    }

    for (let i = 0; i < z.length; i++) {
        const mydiv = z[i];
        if (!!mydiv) {
            const mylabel = mydiv.firstChild as HTMLInputElement;
            const divclass = mydiv.classList;
            let num = i+1;
            let letter :string = "";
            switch (num){
                case 1:
                    letter = "A";
                    break;
                case 2:
                    letter = "B";
                    break;
                case 3:
                    letter = "C";
                    break;

                case 4:
                    letter = "D";
                    break;

                case 5:
                    letter = "E";
                    break;

                case 6:
                    letter = "F";
                    break;

                case 7:
                    letter = "G";
                    break;

                case 8:
                    letter = "H";
                    break;

                case 9:
                    letter = "I";
                    break;

                case 10:
                    letter = "J";
                    break;

                case 11:
                    letter = "K";
                    break;

                case 12:
                    letter = "L";
                    break;
                case 13:
                    letter = "M";
                    break;
                case 14:
                    letter = "N";
                    break;

                case 15:
                    letter = "O";
                    break;

                case 16:
                    letter = "P";
                    break;

                case 17:
                    letter = "Q";
                    break;

                case 18:
                    letter = "R";
                    break;

                case 19:
                    letter = "S";
                    break;

                case 20:
                    letter = "T";
                    break;

                case 21:
                    letter = "U";
                    break;

                case 22:
                    letter = "V";
                    break;        
                
                case 23:
                    letter = "W";
                    break;

                case 24:
                    letter = "X";
                    break;

                case 25:
                    letter = "Y";
                    break;

                case 26:
                    letter = "Z";
                    break;     

                default:
                    letter = "...";
            }

            if(show){
                // console.log("num>>>>>>>", mydiv);
                if(divclass.contains("sd-item--checked")){
                    var svgspan = document.createElement("span");
                    svgspan.style.width = "100%";
                    svgspan.innerHTML='<div data-qa="icon-check-svg" style="float:right;"><svg height="13" width="16"><path d="M14.293.293l1.414 1.414L5 12.414.293 7.707l1.414-1.414L5 9.586z"></path></svg></div>';
                    mylabel.appendChild(svgspan);
                }
                
                let spans = mylabel.childNodes
                let span_add = spans[1] as HTMLSpanElement;
                span_add.innerHTML=letter;

            }

           
        }
    }
}

var doAnimantion = true;
var direct = 1;
var old_direct= 1;


const Run = () => {
    const { id } = useParams();
    const dispatch = useReduxDispatch()
    const postStatus = useReduxSelector(state => state.surveys.status)
    const surveys = useReduxSelector(state => state.surveys.surveys)
    useEffect(() => {
        if (postStatus === 'idle' && id) {
            dispatch(get(id))
        }
    }, []);

    let survey = surveys.filter(s => s.id === id)[0]
    if (!survey) {
        survey = surveys[0]
    }
    // console.log(survey)
    const model = new Model(survey?.json || {});

    ///////////////    Scrolling    /////////////////////
    
    function handleScroll(event: WheelEvent): void {
        if(event.deltaY > 30){
            model.nextPage();
        }
        if(event.deltaY < -30){
            model.prevPage();
        }
    }
    
    useEffect(() => {
        window.addEventListener('wheel', handleScroll);
        return () => window.removeEventListener('wheel', handleScroll);
    }, []);

    ///////////////////   Animation Effect  ///////////////////
    
    model.onCurrentPageChanging.add(function (sender: Model, options:any) {
        if (!doAnimantion) return;
        options.allowChanging = false;
        setTimeout(function () {
            doAnimantion = false;
            sender.currentPage = options.newCurrentPage;            
            doAnimantion = true;
        }, 500);
        if(options.isNextPage) {old_direct = direct; direct = 1;}
        if(options.isPrevPage) {old_direct = direct; direct = 0;}
        if(sender.isFirstPage) {old_direct = 1; direct = 1;}
        if(sender.isLastPage) {old_direct = 0; direct = 0;}
        
        animate(false);
    });
    model.onCurrentPageChanged.add(function (sender: Model, options:any) {
        // if(sender.isFirstPage) {old_direct = 1; direct = 1;}
        animate(true);
    });
    model.onCompleting.add(function (sender: Model, options:any) {
        if (!doAnimantion) return;
        options.allowComplete = false;
        setTimeout(function () {
            doAnimantion = false;
            sender.doComplete();
            doAnimantion = true;
        }, 500);
        animate(false);
    });
    model.onAfterRenderSurvey.add((sender: Model, options:any) => {
        animate(true);
    });

    model.goNextPageAutomatic = true;

    model
        .onComplete
        .add((sender: Model) => {
            dispatch(post({ postId: id as string, surveyResult: sender.data, surveyResultText: JSON.stringify(sender.data) }))
        });

    return (<>
        {/* <h1>{survey?.name}</h1> */}
        <Survey model={model} />
    </>);
}

export default Run;