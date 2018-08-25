var i;
var myObj;
var mySudoku = new Sudoku();

for(i=0; i< 81; i++){
    myObj = document.getElementById("cell-"+i);
    myObj.addEventListener("input", valueEntered);
    myObj.addEventListener("dblclick", doubleClicked);
    myObj.addEventListener("mouseover", showCandidates);
    myObj.addEventListener("mouseleave", hideCandidates);
}

myObj = document.getElementById("solve_button");
myObj.addEventListener("click", solveClicked);
myObj = document.getElementById("step_button");
myObj.addEventListener("click", stepClicked);

function showCandidates(evt){
    let myObj;
    let index = parseInt(evt.target.id.split("-")[1]);

    myObj = document.getElementById("ttip");
    myObj.innerHTML = "Candidates: " + [...mySudoku.sud[index].cand].join(" ");
    myObj.visibility = true;

}

function hideCandidates(evt){
    document.getElementById("ttip").visibility = false;
}

function valueEntered(evt) {
    let index = parseInt(evt.target.id.split("-")[1]);
    let val = parseInt(evt.target.value);
    let retval;

    if ( val == NaN || val < 1 || val > 9) {
        evt.target.value="";
        alert("Invalid Value");
    } else {
        retval = mySudoku.setVal(index, val, "GIVEN");
        evt.target.readOnly=true;
        if(retval == -1 || mySudoku.validateCell(index, val)==false) {
            alert("This entry invalidates sudoku");
            mySudoku.unsetVal(index);
            evt.target.value="";
            evt.target.readOnly = false;
        }
        mySudoku.eliminateNullifyingCandidates(0);
        colorizeCells();
    }
}

function doubleClicked(evt) {
    evt.target.readOnly = false;
    evt.target.value = "";
    index = parseInt(evt.target.id.split("-")[1]); 

    if(mySudoku.sud[index].val > 0) {
        mySudoku.unsetVal(index);
        evt.target.classList.remove("solved");
    }
}

function colorizeCells() {
    let i;
    let id;
    let myObj;

    for(i = 0; i<81; i++){
        id = "cell-" + i;
        if (mySudoku.sud[i].cand.size === 1) {
            myObj = document.getElementById(id);
            myObj.classList.add("oneCand");
            myObj.classList.remove("twoCand");   
        } else if (mySudoku.sud[i].cand.size === 2) {
            document.getElementById(id).classList.add("twoCand");
        } else if (mySudoku.sud[i].cand.size > 2) {
            document.getElementById(id).classList.remove("oneCand");
            document.getElementById(id).classList.remove("twoCand");
        }

    }
}

function solveClicked() {
    let i, id, myObj;
    let retval = mySudoku.solve(0);
    if(retval === false){
        alert("Can not solve this Sudoku.. sorry");
        return(false);
    }
    for(i = 0 ; i < 81; i++) {
        if (mySudoku.sud[i].val > 0){
            id = "cell-" + i;
            myObj = document.getElementById(id);
            myObj.value = mySudoku.sud[i].val;
            myObj.readOnly = true;
            myObj.classList.add("solved");
        }
    }
}

function stepClicked() {
    let i, id, myObj;
    mySudoku.eliminateNullifyingCandidates(0);
    i = mySudoku.fillOne();
    mySudoku.eliminateNullifyingCandidates(0);
    if (i > -1){
        id = "cell-" + i;
        myObj = document.getElementById(id);
        myObj.value = mySudoku.sud[i].val;
        myObj.readOnly = true;
        myObj.classList.add("solved");
        colorizeCells();
    } else {
        alert("There are no cells that can be filled immediately");
    }

}