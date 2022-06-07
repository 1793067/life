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
  
  /* lib [
	  { coords: [x1, y1], type: "type1", mark: "mark1" }, 
	  { coords: [X2, y2], type: "type2", mark: "mark2" },
	  ....
  ]
  */
  
  
  
	hasElem(exp){
//Принимает на вход координаты [x,y] или тип элемента "field"
//если элемент - координаты, то возвращает true/false в зависимости от их наличия в библиотеке Grid.lib
//если аргумент - строка, то возвращается массив координат с данным типом из библиотеки Grid.lib
	  if (Array.isArray(exp)) return this.lib.reduce((val,cur) => same(cur.coords, exp) ? cur : val, false);
	  if (typeof exp == "string") return this.lib.filter(item => item.type == exp);
	}
  
	addLib(x,y,type,mark){
//добавление или корректировка элементов в библиотеке lib
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
/*-----------------------------------------------------------------------------------------------------------*/

function randomElem(arr){return arr[random(arr.length)]};

function coordsInJournal(coords,journal){
	if (!coords || journal.length == 0) return;
	const [x,y] = coords;
	return journal.some(([jx,jy]) => jx == x && jy == y )
}

function getCloseFrom(freeCells, [x2,y2]){
  const arr = freeCells.map(([x1,y1]) => Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2)));
  let index = arr.indexOf(Math.min.apply(Math,arr));
  return freeCells[index];
}

function getFarFrom(freeCells, [x2,y2]){
  const arr = freeCells.map(([x1,y1]) => Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2)));
  let index = arr.indexOf(Math.max.apply(Math,arr));
  return freeCells[index];
}

const actions = ["treeReproduct", "plantEaterMove", "predatorMove", "hyppoMove"];


//-----------------------------------
class Animal {
	constructor(name, type, energy, face, actions) {
			  this.name = name;
			  this.type = type;
			  this.energy = energy;
			  this.face = face;
			  this.coords = [];
			  this.actions = actions;
			}
	
	treeReproduct(view){
		this.energy+=2;
		let place = view.r1['field'];
		if (place && this.energy > 15 && place.length > 0) {
			this.energy = 1;
			return {pop: null, push: randomElem(place)}
		}
		return {pop: null, push: [null,null]};
	}
	
	plantEaterMove(view) {
		this.energy-=1;
		if (this.energy == 0) return {pop: view.me, push: [null,null]};
		
		let predatorNear = view.r1['predator'];
		let predatorFar = view.r2['predator'];
		
		let treeNear = view.r1['tree'];
		let treeFar = [].concat(view.r2['tree'] || []).concat(view.r3['tree'] || []);
		
		let plantEaterNear = view.r1['plantEater'];
		
		let place = view.r1[this.type];
		
		if (treeNear && treeNear.length == 8) return {pop: view.me, push: [null,null]};
		
		if (predatorNear && place) return {pop: view.me, push: getFarFrom(place, randomElem(predatorNear))};
		if (predatorFar && place) return {pop: view.me, push: getFarFrom(place, randomElem(predatorFar))};
		
		if (plantEaterNear && place && this.energy > 25) {
			this.energy -= 10;
			return {pop: null, push: randomElem(place), newCreatureEnergy: 10};
		}
		
		if (treeNear) {
			this.energy+=5;
			return {pop: randomElem(treeNear), push: [null,null]};
		}
		
		if (treeFar.length && place) return {pop: view.me, push: getCloseFrom(place, randomElem(treeFar))};
		
		if (place) return {pop: view.me, push: randomElem(place)};
		
		return {pop: null, push: [null,null]};
	}
	
  	predatorMove(view) {
		this.energy-=0.5;
		if (this.energy == 0) return {pop: view.me, push: [null,null]};
		
		let treeNear = view.r1['tree'];
		
		let predatorNear = [].concat(view.r1['predator'] || []).concat(view.r2['predator'] || []).concat(view.r3['predator'] || []);
		//let predatorFar = view.r2['predator'];
		
		let plantEaterNear = view.r1['plantEater'];
		let plantEaterFar = [].concat(view.r2['plantEater'] || []).concat(view.r3['plantEater'] || []);
		
		let place = view.r1[this.type];
		
		//if (treeNear && treeNear.length == 8) return {pop: view.me, push: [null,null]};
		
		if (predatorNear.length && place && this.energy > 100) {
			this.energy -= 50;
			return {pop: null, push: randomElem(place), newCreatureEnergy: 10};
		} 
		
		if (plantEaterNear) {
			this.energy = this.energy < 50 ? this.energy + 100 : this.energy;
			return {pop: view.me, push: randomElem(plantEaterNear)};
		}
		
		//hyppo hunting none
		
		if (plantEaterFar.length && this.energy < 50 && place) return {pop: view.me, push: getCloseFrom(place, randomElem(plantEaterFar))};
		
		if (place) return {pop: view.me, push: randomElem(place)};
		
		return {pop: null, push: [null,null]};
	}
	
}
//-----------------------------------
class World {
			constructor(grid) {
			  this.grid = grid;
			  this.journal = [];
			}
			
 			toString() {
			console.log("----------------------------------")
				let legend = this.grid.lib.slice().map(item => ({...item}));
				legend.forEach(item => {			
					let sameEl = this.existAnimal(i => same(i.coords, item.coords))[0];
					if (sameEl) item.mark = sameEl.face;
				});
				
				let str = " ";
				let k = 0;
				for (let i = 0; i < this.grid.height; i++) {
					for (let j = 0; j < this.grid.width; j++) {
					  str+= legend[k].mark + " "
					  k+=1;
					}
				  console.log(str + "  ."+k/10);
				  str=" ";
				  };
				  console.log(this.journal.length)
			} 
			
			existAnimal (fn) {
				return this.journal.filter(item => fn(item));
			}
			
 			createAnimal(animal, numOrCoords){
				if (!arguments[0] || !arguments[1]) return;
				
				if(Array.isArray(numOrCoords)) {
					if (!this.grid.hasElem(numOrCoords)) return;
					animal.coords = numOrCoords;
					this.journal.push(animal);
					return;
				}
				
				let busiedLength = this.existAnimal(i => i.type == animal.type).length;
				let fieldsArr = this.grid.hasElem(animal.type)
				let num = Math.min( fieldsArr.length - busiedLength , numOrCoords);
				let place = randomElem(fieldsArr).coords;
				while (num > 0) {
 					while (this.existAnimal(i => same(i.coords, place))[0] && busiedLength < fieldsArr.length) {
						place = randomElem(this.grid.hasElem(animal.type)).coords;
					}
					const createdAnimal = new Animal(animal.name, animal.type, animal.energy, animal.face, animal.actions);
					createdAnimal.coords = place;
					this.journal.push(createdAnimal);
					busiedLength++;
					num--;
				}
			}
			
			destroyAnimal(coords) {
				if (arguments[0] == null) return;
				this.journal = this.existAnimal(i => !same(i.coords, coords));
			}
			
			 turn(){
				let actedAnimalJournal = [];
				this.journal.forEach(animal => {
					if (coordsInJournal(animal.coords, actedAnimalJournal)) return;
					let view = this.view(animal.coords);					
					animal.actions.forEach(act => {
						const {pop, push, newCreatureEnergy} = animal[act](view);
						this.destroyAnimal(pop);
						if (newCreatureEnergy) animal.energy = newCreatureEnergy;
						this.createAnimal(new Animal(animal.name, animal.type, animal.energy, animal.face, animal.actions), push);
						if (!push) actedAnimalJournal.push(push);
					});
				});
				
				if (this.existAnimal(i => i.name == "tree").length > 80)
				this.createAnimal(new Animal("tree", "field", 5, "*", actions.slice(0,1)), 1);	
			} 
			
			view(coords) {
				let viewObj = {me: coords, r1:{}, r2:{}, r3:{} };
				let r1 = [ [0, -1],[1, -1],[1,  0],[1,  1],[0,  1],[-1, 1],[-1, 0],[-1,-1] ];
				
				let r2 = [ [-2,-1],[-2, 0],[-2, 1],[-1,-2],[-1, 2],[0, -2],[0,  2],[1, -2],[1,  2],[2, -1],[2,  0],[2,  1] ];
				
				let r3 = [ [-3,-1],[-3, 0],[-3, 1],[-2,-2],[-2, 2],[-1,-3],[-1, 3],[0, -3],[0,  3],[1, -3],[1,  3],[2, -2],[2,  2],[3, -1],[3,  0],[3,  1],
[-4,-4],[-4,-3],[-4,-2],[-4,-1],[-4,-0],[-4,1],[-4,2],[-4,3],[-4,4],[-3,4],[-2,4],[-1,4],[0,4],[1,4],[2,4],[3,4],[4,4],[4,3],[4,2],[4,1],[4,0],[4,-1],[4,-2],[4,-3],[4,-4],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],[2,-4],[3,-4],
				[-2,-5],[-1,-5],[0,-5],[1,-5],[2,-5],[5,-2],[5,-1],[5,0],[5,1],[5,2],[-2,5],[-1,5],[0,5],[1,5],[2,5],[-5,-2],[-5,-1],[-5,0],[-5,1],[-5,2]];
				
				r1.forEach(item => {
					let look = plus(coords, item);
					let type = this.existAnimal(i => same(i.coords, look))[0] ? this.existAnimal(i => same(i.coords, look))[0].name :
							   this.grid.hasElem(look).type;
					viewObj.r1[type] ? viewObj.r1[type].push(look) : viewObj.r1[type] = [look]
				});
				
				r2.forEach(item => {
					let look = plus(coords, item);
					let type = this.existAnimal(i => same(i.coords, look))[0] ? this.existAnimal(i => same(i.coords, look))[0].name :
							   this.grid.hasElem(look).type;
					viewObj.r2[type] ? viewObj.r2[type].push(look) : viewObj.r2[type] = [look]
				});
				
				r3.forEach(item => {
					let look = plus(coords, item);
					let type = this.existAnimal(i => same(i.coords, look))[0] ? this.existAnimal(i => same(i.coords, look))[0].name :
							   this.grid.hasElem(look).type;
					viewObj.r3[type] ? viewObj.r3[type].push(look) : viewObj.r3[type] = [look]
				});
				return viewObj;
			}

		}


let grid = {};
let world ={};


const encyclopedia = {
	"plantEater" : ["plantEater", "field", 20, "o", actions.slice(1,2)],
	"predator" : ["predator", "field", 50, "@", actions.slice(2, 3)],
	"tree" : ["tree", "field", 5, "*", actions.slice(0,1)],
};


function paintWater(grid, x, y, waterClassName) {
	if (grid.size) 	document.querySelector('div.gameField').innerHTML = '';
		
	grid = new Grid(x,y);
	grid.create("water");		
	
	if (!grid.size) return;

	let elem = document.querySelector('div.gameField');
		for (let j = 1; j <= grid.width; j++) {
			for (let i = 1; i <= grid.height; i++) {
			  let div = document.createElement('div');
			  div.className = waterClassName;
			  div.style.width = 100/grid.width +'%';
			  div.style.height = 100/grid.height +'%';
			  div.setAttribute("x", i);
			  div.setAttribute("y", j);
			  div.setAttribute("onclick", "addAnimal(this)");
			  /*div.innerHTML = ""+grid.hasElem([i,j]).coords[0]+","+grid.hasElem([i,j]).coords[1];*/
			  elem.appendChild(div);		  
			}
		}
	
	return [grid, new World(grid)];
}

function paintField(grid, count, fieldClassName) {
	grid.create("field", count);
		grid.hasElem("field")
			.forEach(
				({coords}) => document.querySelector('div.elements[x="'+coords[0]+'"][y="'+coords[1]+'"]').classList.add(fieldClassName)
			)
	return [grid, new World(grid)];
}

function paintAnimal() {
	let oldWorld = Array.prototype.slice.call(document.querySelectorAll('div.elements'));
	let animals = Array.from(new Set(Object.keys(encyclopedia).map(key => encyclopedia[key][0])));
	
	animals.forEach(animal => oldWorld.forEach(elem => elem.classList.remove(animal)));
	
	world.journal.forEach(animal => document.querySelector('div.elements[x="'+animal.coords[0]+'"][y="'+animal.coords[1]+'"]').classList.add(animal.name))
}

function addAnimal(el) {
	const coords = [+el.getAttribute("x"), +el.getAttribute("y")];
	world.createAnimal(new Animal(...encyclopedia[document.getElementById("animalType").value]), coords);
	paintAnimal();
}

	
function genElement() { //declaring variables In a module context, variables don't automatically get declared globally
//обработчик кнопки "create world"
	let [gridX, gridY = gridX] = document.getElementById("gridCount").value.split(",");
	let fieldCount = document.getElementById("fieldCount").value;
	let treeCount = document.getElementById("treeCount").value;
	let animalCount = document.getElementById("animalCount").value;
	let animalType = document.getElementById("animalType").value;
	
//если а поле gridCount указано значение и карта еще не создана -> создаем карту нужного размера
	if (gridX && !grid.size || (grid.size && +gridX !== grid.size)) {
		[grid, world] = paintWater(grid, +gridX, +gridY, "elements");
	}

	if (fieldCount && grid.size && !grid.hasElem("field").length) {
//если в поле fieldCount указано значение, карта Grid создана, но "земля" еще не размечена на карте	
	[grid, world] = paintField(grid, +fieldCount*grid.size/100, "activeCell");
	}

	if  (treeCount && fieldCount && grid.size && grid.hasElem("field")) {
		//если в поле указано значение tree, карта Grid создана, и "земля" размечена на карте
			world.createAnimal(new Animal(...encyclopedia["tree"]), +treeCount/100*fieldCount/100*grid.size);
				paintAnimal();
			}
	
	if  (~Object.keys(encyclopedia).indexOf(animalType) && grid.size && grid.hasElem("field")) {
//если в поле animalType указано значение, карта Grid создана, и "земля" размечена на карте
	world.createAnimal(new Animal(...encyclopedia[animalType]), +animalCount);
		paintAnimal();
	}	
};
	
window.start = function start() {
	window.timerId = window.setInterval(timer, 500);
}

window.stop = function stop() {
	window.clearInterval(window.timerId);
}

window.timer = function timer() {
	var elem = document.getElementById('test');
	elem.value = parseInt(elem.value)+1;
	world.turn();
	paintAnimal();
}	

	  
	  