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
  }

  setVal(value) {
    this.val = value;
    this.cand.clear();
  }
}

class Sudoku {
  constructor() {
    this.sud = Array(81).fill(new SudokuCell());
  }

  setVal(index, value) {
    sud[index].setVal(value);
  }

  getIndex(x, y) {
    if (x > 8 || y > 8)
      throw ("Out of sudoku bounds");
    return x * 9 + y;
  }

  getRowCol(index) {
    var x = Math.trunc(index / 9);
    var y = index % 9;
    return [x, y];
  }

  regionSet(index) {
  }

  rowSet(index) {
    //Returns the set of values in the row of the cell with given index 'index'
    var res = new Set();

    rowStart = index - (index % 9);
    rowEnd = rowStart + 9;

    for(i = rowStart; i<rowEnd; i++) {
      if(i == index) { continue }  // skip the value of the given cell
      v = this.sud[i].val;
      if (v > 0) { res.add(v) }  // only add the value if it is not 0, which means value is set for the cell
    }    
    return (res);
  }
  
  colSet(index) {
    //Returns the set of values in the column of the cell with given index 'index'
    var res = new Set();

    colStart = index % 9;

    for(i = colStart; i<81; i += 9){
      if(i == index) { continue } //skip the value of the given cell
      v = this.sud[i].val;
      if (v > 0) { res.add(v) }  // only add the value if it is not 0, which means value is set for the cell
    }    
    return (res);
  }


} // end of class Sudoku






