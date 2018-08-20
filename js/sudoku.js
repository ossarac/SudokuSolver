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
      this.sud[index].setVal(value, type);
      this.unset--;
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

    fillSolved(){
      let i;
      let changed = false;
      for(i=0; i < 81; i++) {
        if(this.sud[i].cand.size == 1) {  //Only one candidate left.. we solved this cell
          this.setVal(i, [...this.sud[i].cand][0], "SOLVED");
          changed = true;
        }
      }
      return(changed);
    }
    
    oneStep(){
      
      let retval = this.eliminateCandidatesAll();
      if(retval == -1) {
        return(retval);
      }
      return(this.fillSolved());

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
          tmpSud.setVal(i, candArr[j], "GUESSED");
          console.log("Level: " + level + ": guessing for cell: ", i, "candidate: ", candArr[j]);
          res = tmpSud.solve(level+1);
          if(res === -1) {
            toBeEliminated.push(candArr[j]);
            changed = true;
            console.log("Level " + level + ": this will be eliminated.. it invalidates sudoku");
          }
          if(res === true) {
            console.log("Level " + level + ": this candidate solves the sudoku");
            return(tmpSud);
          }
        }
        toBeEliminated.forEach(x => this.sud[i].cand.delete(x));
      }
      return(changed);
    } 

    solve(level) {
      let changed;

      while(this.unset > 0) {
        changed = this.oneStep();
        if(changed == -1) {
          return(-1) //invalid sudoku
        }
        if(changed) { continue }  // there are some solved cells. We have to continue with the oneStep again

        // If we are here, this means nothing changed in one pass (no cells solved). 
        // We have to eliminate the nullifying candidates

        changed = this.eliminateNullifyingCandidates(level);
        if(typeof(changed) === "object") {
          console.log("Level " + level + ":  ************************************Solved in recursive call");
          this.sud = changed.sud;
          this.unset = changed.unset;
          return(true);
        }
        if(changed === true) { continue }  // we managed to eliminate some candidates. We can continue with oneStep

        // If we are here, we can't solve without guessing some candidates with more than one depth (is it possible?)

        console.log("Couldn't solve this sudoku.. sorry");
        return(false);
        
      }
      return(true);
    }

  } // end of class Sudoku


