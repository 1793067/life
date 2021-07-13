import {Grid, random, plus} from "./grid.js";
import {Animal, World, actions} from "./world.js"

let grid = {};
let world ={};


const encyclopedia = {
	"plantEater" : ["plantEater", "field", 20, "o", actions.slice(1,2)],
	"croc" : ["predator", "water", 10, "^", []],
	"lion" : ["predator", "field", 50, "@", actions.slice(2, 3)],
	"tree" : ["tree", "field", 5, "*", actions.slice(0,1)],
	"hyppo" : ["bigPlantEater", "field", 200, "o", actions.slice(3)]
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
			  //div.innerHTML = ""+grid.hasElem([i,j]).coords[0]+","+grid.hasElem([i,j]).coords[1];
			  elem.appendChild(div);		  
			}
		}
	
	return [grid, new World(grid)];
}

function paintField(grid, count, fieldClassName) {
	grid.create("field", count);
		grid.hasElem("field")
			.forEach(
				({coords}) => document.querySelector('div.elements[x="'+coords[0]+'"][y="'+coords[1]+'"]').classList.add("activeCell")
			)
	return [grid, new World(grid)];
}

function paintAnimal() {
	let oldWorld = Array.prototype.slice.call(document.querySelectorAll('div.elements'));
	let animals = Array.from(new Set(Object.keys(encyclopedia).map(key => encyclopedia[key][0])));
	
	animals.forEach(animal => oldWorld.forEach(elem => elem.classList.remove(animal)));
	
	world.journal.forEach(animal => document.querySelector('div.elements[x="'+animal.coords[0]+'"][y="'+animal.coords[1]+'"]').classList.add(animal.name))
}

	
window.genElement = function genElement() { //declaring variables In a module context, variables don't automatically get declared globally
	let elType = document.getElementById("type").value;
	let elCount = document.getElementById("count").value.split(",");
	let [x,y = x] = elCount;
	
	if (!x) return;
	
	if (elType == "grid" || (!grid.size && elCount)) {
		[grid, world] = paintWater(grid, +x, +y, "elements");
	}
	if (elType == "field" && grid.size) {
		[grid, world] = paintField(grid, +x, "activeCell");
	}
	if  (~Object.keys(encyclopedia).indexOf(elType) && grid.size) {
		world.createAnimal(new Animal(...encyclopedia[elType]), +x);
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

	  
	  