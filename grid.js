export { random, plus, Grid, same}

function random(num){
	return Math.floor(Math.random() * num)
};
		
function plus(arr1,arr2){
	return [ arr1[0]+arr2[0], arr1[1]+arr2[1] ]
};

function same(arr1,arr2){
	return ( arr1[0] == arr2[0] && arr1[1] == arr2[1] )
};

//------------------------------------------------------------
class Grid {
    constructor(width,height) {
      this.width = width;
      this.height = height;
      this.lib = [];
      this.size = this.width * this.height;
    }
  
	hasElem(exp){
	  if (Array.isArray(exp)) return this.lib.reduce((val,cur) => (cur.coords[0] == exp[0] && cur.coords[1] == exp[1]) ? cur : val, false);
	  if (typeof exp == "string") return this.lib.filter(item => item.type == exp);
	}
  
	addLib(x,y,type,mark){
	  if (!this.hasElem([x,y])) {
		this.lib.push({
		  coords: [x, y],
		  type: type,
		  mark: mark
		});

	  } else {
		  this.hasElem([x,y]).type = type;
		  this.hasElem([x,y]).mark = mark;
		}
	}
	
	water() {
	  for (let i = 1; i <= this.width; i++) {
		for (let j = 1; j <= this.height; j++) {
		  this.addLib(i,j, "water", "~")
		}
	  };
	}
	
 	field(num) {
 	  if (this.hasElem("field").length == 0) {
 		this.addLib(...this.randMove(this.randCoord()).coords, "field", " ");
 	  }
		
 	  while (this.hasElem("field").length < num) {
 		let item = this.hasElem("field")[ random(this.hasElem("field").length) ];
 		while (this.randMove(item.coords) && this.hasElem("field").length < num) {
 			this.addLib(...this.randMove(item.coords).coords, "field", " ");
 		}; 
 	  };
 	}
	
	
	randCoord() {
	  return this.size ? [ random(this.width) + 1, random(this.height) + 1 ] : "no map"
	}
	
	
	randMove(elem){
	  let directions = [[0, -1],  [1, -1],  [1,  0],  [1, 1],  [0, 1],  [-1, 1],  [-1, 0],  [-1, -1]];
	  
	  if (directions.every(item => {
		let quest = this.hasElem(plus(elem,item));
		return (!quest || quest.type == "field")
	  })) return false;

	  let quest = this.hasElem(plus(elem, directions[random(directions.length)]));
						
	  while (!quest || quest.type == "field") {
		quest = this.hasElem(plus(elem, directions[random(directions.length)]));
	  };
	  
	  return quest;                      
	}

	create(type, count) {
	   this[type] ? this[type](count) : console.log("no such type")
	 }
	 
	 toString() {
		let str = " ";
		let k = 0;
		for (let i = 0; i < this.height; i++) {
			for (let j = 0; j < this.width; j++) {
			  str+= this.lib[k].mark + " "
			  k+=1;
			}
		  console.log(str + " "+k/10);
		  //console.log("");
		  str=" ";
		  };
	 }
	
};

