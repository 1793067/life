import {random, plus, Grid, same} from "./grid.js";
export { Animal, World, actions}

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
//-----------------------------------

/*	window.print = function() {
		let grid = new Grid(10, 10);
		grid.create("water");	
		grid.create("field", 50);

		//grid.toString();
		
		let world = new World(grid);
 		let plantEater = new Animal("plantEater", "field", 10, "o", []);
		let croc = new Animal("crocodile", "water", 10, "^", []);
		let tree = new Animal("tree", "field", 5, "*", actions);
		
		//world.createAnimal(plantEater, [2,2]);
		world.createAnimal(plantEater, 3);
		world.createAnimal(croc, 1);
		world.createAnimal(tree, 5);
		
		world.toString();
		
		let randomPlantEater = randomElem( world.existAnimal(i => i.name == "plantEater") ).coords;
		world.destroyAnimal(randomPlantEater);
		
		for (let i = 0; i < 10; i++) {
			world.turn();
			world.toString();
		};
		
	};
	
	print();*/