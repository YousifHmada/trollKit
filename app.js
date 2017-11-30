const express = require("express");
const _ = require("lodash");
var conv = require('binstring');

let app = express();

app.use(express.static('build'));


var registers = [];
var flag = 0;
registers['$zero'] = flag;
flag++;
registers['$at'] = flag;
flag++;
for (var i = 0; i <= 1; i++) {
	registers['$v'+i] = flag;
	flag++;
}
for (var i = 0; i <= 3; i++) {
	registers['$a'+i] = flag;
	flag++;
}
for (var i = 0; i <= 7; i++) {
	registers['$t'+i] = flag;
	flag++;
}
for (var i = 0; i <= 7; i++) {
	registers['$s'+i] = flag;
	flag++;
}
for (var i = 8; i <= 9; i++) {
	registers['$t'+i] = flag;
	flag++;
}
for (var i = 0; i <= 1; i++) {
	registers['$k'+i] = flag;
	flag++;
}
registers['$gp'] = flag;
flag++;
registers['$sp'] = flag;
flag++;
registers['$fp'] = flag;
flag++;
registers['$$ra'] = flag;

var instructions = [];
instructions['add'] = {format:'R',op:0,funct:32};
instructions['and'] = {format:'R',op:0,funct:36};
instructions['or'] = {format:'R',op:0,funct:37};
instructions['lw'] = {format:'I',op:35};
instructions['sw'] = {format:'I',op:43};
instructions['sll'] = {format:'R',op:0,funct:0};
instructions['beq'] = {format:'I',op:4};

var decode = (command)=>{
	var output = '';
	command = command.split(/[\s, \(\))]+/);
	if(command[0].match(/(add$)|(and$)|(or$)/) != null){
		var op = 0, shift = 0;
		output = ("000000" + op.toString(2)).slice(-6);
		output += ("00000" + registers[command[2]].toString(2)).slice(-5);
		output += ("00000" + registers[command[3]].toString(2)).slice(-5);
		output += ("00000" + registers[command[1]].toString(2)).slice(-5);
		output += ("00000" + shift.toString(2)).slice(-5);
		output += ("000000" + instructions[command[0]]['funct'].toString(2)).slice(-6);
	}else if(command[0].match(/(sll$)/) != null){
		var op = 0, shift = parseInt(command[3]);
		output = ("000000" + op.toString(2)).slice(-6);
		output += ("00000" + op.toString(2)).slice(-5);
		output += ("00000" + registers[command[2]].toString(2)).slice(-5);
		output += ("00000" + registers[command[1]].toString(2)).slice(-5);
		output += ("00000" + shift.toString(2)).slice(-5);
		output += ("000000" + instructions[command[0]]['funct'].toString(2)).slice(-6);
	}else if(command[0].match(/(sw$)|(lw$)/) != null){
		var op = instructions[command[0]]['op'], immediateValue = parseInt(command[2]);
		output = ("000000" + op.toString(2)).slice(-6);
		output += ("00000" + registers[command[3]].toString(2)).slice(-5);
		output += ("00000" + registers[command[1]].toString(2)).slice(-5);
		output += ("0000000000000000" + immediateValue.toString(2)).slice(-16);
	}else if(command[0].match(/(beq$)/) != null){
		var op = instructions[command[0]]['op'], immediateValue = parseInt(command[3]);
		output = ("000000" + op.toString(2)).slice(-6);
		output += ("00000" + registers[command[1]].toString(2)).slice(-5);
		output += ("00000" + registers[command[2]].toString(2)).slice(-5);
		output += ("0000000000000000" + immediateValue.toString(2)).slice(-16);
	}
	return output;
};

var compile = function(arr){
	return new Promise((resolve, reject)=>{
		resolve(arr.map(decode));
	});
}


app.get('/compile', (req, res)=>{
	let arr = ["add $t0, $s2, $t0", "lw $t0, 1200 ($t1)", "beq $s3, $s4, 3", "sw $t0, 1200 ($t1)"];
	compile(arr)
		.then((result)=>{
			res.status(200).json({
				success: true,
				results: result
			});
		})
		.catch(()=>{
			res.status(400).json({
				success: false
			});
		})
});

app.get('/compile/all', (req, res)=>{
	var arrRegisters = [];
	for(var key in registers){
		var object = {};
		object[key] = registers[key];
		arrRegisters.push(object);
	}
	var arrInstructions = [];
	for(var key in instructions){
		var object = {};
		object[key] = instructions[key];
		arrInstructions.push(object);
	}
	res.status(200).json({
		success: true,
		registers: arrRegisters,
		instructions: arrInstructions
	});
});


app.listen('8000',()=>{
	console.log('app is listening on port 8000');
});