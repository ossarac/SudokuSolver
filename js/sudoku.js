  /*
  * This is a sudoku solver created by 'Omer Sinan Sarac',   email: sinansarac@gmail.com
  *
  */
  class SudokuCell {
    constructor(val = 0) {
      this.val = val;
      if (val > 0) {
        this.cand = new Set();
      } else {
        this.cand = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      }
      this.type = "EMPTY"  // Possible types: "EMPTY", "GIVEN", "SOLVED", "GUESSED" .. Last one may not be used at all
    }

    setVal(value, type="GIVEN") {
      //Sets the value of the cell, sets how the value is found (type) and clears the candidates
      this.val = value;
      this.type = type;
      this.cand.clear();
    }

  }

  class Sudoku {
    constructor() {
      let i;
      this.sud = Array(81);
      for(i=0; i<81; i++){
        this.sud[i] = new SudokuCell();
      }
      this.unset = 81;
    }

    initWithArray(x) {
      let i;
      if(x.length != 81) {
        throw("initWithArray: argument should be an array of length 81")
      }
      for(i = 0; i< 81; i++ ){
        if(x[i] > 0) {
          this.setVal(i, x[i], "GIVEN");
        }
      }
    }

    makeCopy() {
      let nS = new Sudoku();
      let i;
      for(i=0; i<81; i++) {
        nS.sud[i].val = this.sud[i].val;
        nS.sud[i].cand = new Set(this.sud[i].cand);
        nS.sud[i].type = this.sud[i].type;
      }
      nS.unset = this.unset;
      return(nS);
    }

    setVal(index, value, type) {
      let res;
      this.sud[index].setVal(value, type);
      this.unset--;
      res = this.eliminateCandidatesAll();
      if(res == 0 ){
        this.mustCandidates();
      }
      return(res);
    }

    unsetVal(index) {
      let i;
      if(this.sud[index].val > 0) {
        this.sud[index] = new SudokuCell();
        this.unset++;
      }
      for(i=0; i<81; i++) {
        if(this.sud[i].val == 0){
          this.sud[i] = new SudokuCell();
        }
      }
      this.eliminateCandidatesAll();
      this.mustCandidates();
      this.eliminateNullifyingCandidates(0);
    }

    validateCell(index, val) {
      let colSet = this.getColSet(index);
      let rowSet = this.getRowSet(index);
      let regSet = this.getRegionSet(index);

      if(colSet.has(val) || rowSet.has(val) || regSet.has(val)){
        return false;
      }
      return true;
    }

    getIndex(row, col) {
      if (row > 8 || col > 8)
        throw ("Out of sudoku bounds");
      return row * 9 + col;
    }

    getRowCol(index) {
      let row = Math.trunc(index / 9);
      let col = index % 9;
      return [row, col];
    }

    getRegionSet(index) {
      let c,r,v, row,col;
    //Returns the set of values in the region of the cell with given index 'index'
      let res = new Set();
      //First we need to find the top-left corner of the region of the cell
      [row,col] = this.getRowCol(index);
      col = col - (col % 3);  //This is the col index for the top left corner of the region
      row = row - (row % 3);  //This is the row index for the top left corner of the region

      let sindex = this.getIndex(row, col);

      for(c=sindex; c<(sindex+3); c++){
        for(r=c; r<(c + 27); r +=9 ){
          if (r == index) { continue } // skip the value of the given cell
          v = this.sud[r].val;
          if(v > 0) { res.add(v) }  // only add the value if it is not 0, which means value is set for the cell
        }
      }
      return(res);
    }

    getRowSet(index) {
      //Returns the set of values in the row of the cell with given index 'index'
      let res = new Set();
      let i,v;

      let rowStart = index - (index % 9);
      let rowEnd = rowStart + 9;

      for(i = rowStart; i<rowEnd; i++) {
        if(i == index) { continue }  // skip the value of the given cell
        v = this.sud[i].val;
        if (v > 0) { res.add(v) }  // only add the value if it is not 0, which means value is set for the cell
      }    
      return (res);
    }
    
    getColSet(index) {
      //Returns the set of values in the column of the cell with given index 'index'
      let res = new Set();
      let i, v;

      let colStart = index % 9;

      for(i = colStart; i<81; i += 9){
        if(i == index) { continue } //skip the value of the given cell
        v = this.sud[i].val;
        if (v > 0) { res.add(v) }  // only add the value if it is not 0, which means value is set for the cell
      }    
      return (res);
    }

    
    candSizes() {
      let i;
      let res = [];
      for(i=0; i<81; i++) {
        res[i] = this.sud[i].cand.size;
      }
      return(res);
    }

    eliminateCandidatesAll() {
      let i;
      let retval;
      for(i=0; i<81; i++) {   //loop through all cells
        retval = this.eliminateCandidates(i)
        if (retval == -1) {
//          console.log("there is an invalid entry.. eliminated all candidates of cell" + i);
          return(-1); 
        }
      }
      return(0); // eliminated candidates without any problems
    }

    eliminateCandidates(index) {

      if(this.sud[index].val == 0) { // this is cell is empty. we can continue 
        let colSet = this.getColSet(index);
        let rowSet = this.getRowSet(index);
        let regSet = this.getRegionSet(index);

        let union = colSet;
        rowSet.forEach(value => {union.add(value);});
        regSet.forEach(value => {union.add(value);});

        let newCands = new Set(
        [...this.sud[index].cand].filter(x => !union.has(x)));
  
        if(newCands.size == 0) {
          return(-1)  // means nullified
        } 
        this.sud[index].cand = newCands;     
      }
      return(this.sud[index].cand.size)
    }

/*     fillSolved(){
      let i;
      let changed = false;
      for(i=0; i < 81; i++) {
        if(this.sud[i].cand.size == 1) {  //Only one candidate left.. we solved this cell
          this.setVal(i, [...this.sud[i].cand][0], "SOLVED");
          changed = true;
          i=0;
        }
      }
      return(changed);
    } */
    
    fillOne(){
      let i;
      let changed = -1;
      for(i=0; i < 81; i++) {
        if(this.sud[i].cand.size == 1) {  //Only one candidate left.. we solved this cell
          if(this.setVal(i, [...this.sud[i].cand][0], "SOLVED") == -1){
            console.log("There is a problem with index " + i + "invalid single candidate");
            return(-2)
          }
          return(i);
        }
      }
      return(changed);
    }

    eliminateNullifyingCandidates(level) {
      let i,j;
      let res;
      let changed = false;
      let toBeEliminated;
      let tmpSud;
      let candArr;
      for(i =0; i<81; i++) {
        toBeEliminated = [];
        candArr = [...this.sud[i].cand];
        for(j = 0; j < candArr.length; j++) {

          tmpSud = this.makeCopy();
          res = tmpSud.setVal(i, candArr[j], "GUESSED");
 //         console.log("Level: " + level + ": guessing for cell: ", i, "candidate: ", candArr[j]);
          if(res === -1) {
            toBeEliminated.push(candArr[j]);
            changed = true;
 //           console.log("Level " + level + ": Cell " + i + "Candidate " + candArr[j] + " will be eliminated.. it invalidates sudoku");
          }
        }
        toBeEliminated.forEach(x => this.sud[i].cand.delete(x));
      }
      return(changed);
    } 

    mustCandidates() {
      //this function eliminiates the other candidates of a cell if one of the candidates is the only option for
      //a row/col/region
      let founds;
      let possib;
      let i,j,k;
      let changed = false;
      //First do it for cols
      for(i=0; i<9; i++) { //for each col
        founds = new Set();
        possib = new Set([1,2,3,4,5,6,7,8,9]);
        for(j=i; j<81; j += 9){
          founds.add(this.sud[j].val);
        }
        founds.delete(0);  // if it is added just remove it
        founds.forEach(x => possib.delete(x));
        possib.forEach(x => {
          let count = 0;
          let pos;
          for(j=i; j<81; j+=9){
            if(this.sud[j].cand.has(x)) { count++; pos=j; }
          }
          if(count == 0) {
            console.log("mustCandidates: there is a problem with sudoku... no cell can have a must value for column");
          }
          if(count == 1) {
            this.sud[pos].cand = new Set([x]);
            changed=true;
          }
        })
      }

      //Now do it for rows
      for(i=0; i<81; i+=9){  //for each row
        founds = new Set();
        possib = new Set([1,2,3,4,5,6,7,8,9]);
        for(j=i; j<i+9; j++){
          founds.add(this.sud[j].val);
        }
        founds.delete(0);
        founds.forEach(x => possib.delete(x));
        possib.forEach(x => {
          let count = 0;
          let pos;
          for(j=i; j<i+9; j++){
            if(this.sud[j].cand.has(x)) { count++; pos=j; }
          }
          if(count == 0) {
            console.log("mustCandidates: there is a problem with sudoku... no cell can have a must value for row");
          }
          if(count == 1) {
            this.sud[pos].cand = new Set([x]);
            changed=true;
          }
        })
      }

      //Now do it for regions
      let regCorners = [0, 3, 6, 27, 30, 33, 54, 57, 60];
      let ind;

      for(k = 0; k < regCorners.length; k++) { //for each region
        founds = new Set();
        possib = new Set([1,2,3,4,5,6,7,8,9]);
        for(i=0; i<3; i++) {
          for(j=0; j<3; j++){
            ind = regCorners[k] + i + j*9;
            founds.add(this.sud[ind].val);
          }
        }
        founds.delete(0);
        founds.forEach(x => possib.delete(x));
        possib.forEach(x => {
          let count = 0;
          let pos;
          for(i=0; i<3; i++) {
            for(j=0; j<3; j++){
              ind = regCorners[k] + i + j*9;
              if(this.sud[ind].cand.has(x)) {count++; pos=ind;}
            }
          }
          if(count == 0) {
            console.log("mustCandidates: there is a problem with sudoku... no cell can have a must value for region");
          }
          if(count == 1) {
            this.sud[pos].cand = new Set([x]);
            changed=true;
          }
        })
      }
      return(changed);
    }

  



    solve(level) {

      let i,j;
      let changed;
      let tmpSud;
      let candArr;
      let res;
      let maxLevel=3;

      if(level > maxLevel) return(false);

      while(this.unset > 0) {
        changed = this.fillOne();
        if(changed > -1) { continue }  // There are no cells with one candidate.. we have to search
        if(changed == -2) {// This means there is a problem and we can't solve this sudoku
          return(false);
        }
        // If we are here, this means nothing changed in one pass (no cells solved). 
        // We have to eliminate the nullifying candidates
        
        changed = this.eliminateNullifyingCandidates(level);
        if(changed === true) { continue }  // we managed to eliminate some candidates. We can continue with oneStep

        // If we are here, we can't solve without guessing some candidates with more than one depth
        for(i = 0; i<81; i++) {
          if(this.sud[i].val >0) {continue}
          candArr = [...this.sud[i].cand];
          for(j = 0; j<candArr.length; j++) {
            tmpSud = this.makeCopy();
            tmpSud.setVal(i, candArr[j], "GUESSED");  // all candidates that would return a -1 should have been eliminated
            res = tmpSud.solve(level+1);
            if(res === true) {
              this.sud = tmpSud.sud;
              this.unset = tmpSud.unset;
              return(true);
            }
          }
        }
        return(false);        
      }
      return(true);
    }

  } // end of class Sudoku


