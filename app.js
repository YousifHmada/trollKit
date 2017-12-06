const express = require("express");
const _ = require("lodash");
var bodyParser = require('body-parser');
const { exec } = require('child_process');
var fs = require('fs');

/*	cd /d C:\Users\Waleed\Desktop\trollMe ;
	vlib Work;
	vmap work work ;
	vlog "Co Project.v";
	vsim testbench -c -do "run 6000;quit;"
*/
pathToVerilogFile = "";
verilogFile = "";
let app = express();

app.use(bodyParser.json());
app.use(express.static('build'));
app.use(bodyParser.urlencoded({
  extended: true
})); 

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
instructions['sub'] = {format:'R',op:0,funct:34};
instructions['and'] = {format:'R',op:0,funct:36};
instructions['or'] = {format:'R',op:0,funct:37};
instructions['lw'] = {format:'I',op:35};
instructions['sw'] = {format:'I',op:43};
instructions['sll'] = {format:'R',op:0,funct:0};
instructions['beq'] = {format:'I',op:4};

var decode = (command)=>{
	var output = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
	command = command.trim()
	command = command.replace(/;/g,($s0)=>'')
	command = command.split(/[\s, \(\))]+/);
	if(command[0].match(/(add$)|(and$)|(sub$)|(or$)/) != null){
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
		if(arr.length == 0)reject();
		resolve(arr.map(decode));
	});
}

app.post('/setPath', (req, res)=>{
	let arr = req.body.data;
	arr = arr.split(/[\\\/](?!.*[\\\/])/g);
	arr = arr.map((value)=>{
		return value.trim();
	}); 
	if(arr[1].match(/.+.v/g) == null)
	{
		return res.status(400).json({
			successed: false
		});
	}
	arr[0] = arr[0].replace(/[\\\/]/g,($s0)=>"\\");
	// console.log(arr);
	fs.exists(arr[0] + '\\' + arr[1], function(exists) { 
	  if (exists) { 
	  		pathToVerilogFile = arr[0];
	  		verilogFile = arr[1];	    
			res.status(200).json({
				successed: true
			}); 
	  }else{
		res.status(400).json({
			successed: false
		});
	  }
	});
});

app.post('/compile', (req, res)=>{
	let arr = req.body.data;
	var newArr = [];
	var cleanArr = [];
	arr.forEach((item)=>{
		let i = item.search(/.(?=(add)|(sub)|(and)|(or)|(lw)|(sw)|(beq)|(sll))/);
		while(i != -1){
			let temp = item.substring(0,i+1);
			temp = temp.trim();
			newArr.push(temp);
			cleanArr.push(temp);
			if(temp.search(/lw/) != -1)
			{
				newArr.push("sll $zero $zero 0");
				newArr.push("sll $zero $zero 0");
				newArr.push("sll $zero $zero 0");
			}
			item = item.substring(i+1);	
			i = item.search(/.(?=(add)|(sub)|(and)|(or)|(lw)|(sw)|(beq)|(sll))/);
		}
		item = item.trim();
		cleanArr.push(item);
		newArr.push(item);
		if(item.search(/lw/) != -1)
			{
				newArr.push("sll $zero $zero 0");
				newArr.push("sll $zero $zero 0");
				newArr.push("sll $zero $zero 0");
			}
	});
	// console.log(newArr, cleanArr);
	arr = newArr;		
	compile(arr)
		.then((result)=>{
			result.result = result;
			result.text = '';
			result.result.map((item)=>{
				let temp = '';
				for (let i = 0; i < 32; i+=8) {
					temp += item.substring(i,i+8);
					temp +='\r\n';
				}
				result.text += temp;
			})
			return result;
		})
		.then((result)=>{
			return new Promise((resolve, reject)=>{
				fs.writeFile(pathToVerilogFile+"\\"+"test.txt", result.text, function(err) {
			    if(err) {
			        // console.log(err);
			    	return reject(err);
			    }
			    // console.log(result);
			    // console.log("The file was saved!");
			    return resolve(result.result);
				})
			});
		}).then(()=>compile(cleanArr))
		.then((result)=>{
			res.status(200).send({
				success: true,
				input: cleanArr,
				output: result
			}); 
		})
		.catch(()=>{
			res.status(400).send({
				success: false
			});
		});
		
});

app.get('/compile', (req, res)=>{
	let arr = ["add $s0 $s0 $s1", "and $s0 $s0 $s1", "or $s0 $s0 $s1", "beq $s1, $s2      6"];
	compile(arr)
		.then((result)=>{
			result.result = result;
			result.text = '';
			result.result.map((item)=>{
				let temp = '';
				for (let i = 0; i < 32; i+=8) {
					temp += item.substring(i,i+8);
					temp +='\r\n';
				}
				result.text += temp;
			})
			return result;
		})
		.then((result)=>{
			return new Promise((resolve, reject)=>{
				fs.writeFile(pathToVerilogFile+"\\"+"test.txt", result.text, function(err) {
			    if(err) {
			        // console.log(err);
			    	return reject(err);
			    }
			    // console.log(result);
			    // console.log("The file was saved!");
			    return resolve(result.result);
				})
			});
		})
		.then((result)=>{
			// console.log(result);
			res.status(200).send({
				success: true,
				input: arr,
				output: result
			}); 
		})
		.catch(()=>{
			res.status(400).json({
				success: false
			});
		})
});

app.get('/all', (req, res)=>{
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

app.get('/run', (req, res)=>{
	exec('cd /d '+ pathToVerilogFile +' & vlib Work & vmap work work & vlog ' + verilogFile + ' & vsim testbench -c -do "run 6000;quit;"', (error, stdout, stderr) => {
	  if (error) {
	    console.error(`exec error: ${error}`);
	    return res.status(400).json({
		  	success: false,
		  });;
	  }
	  var result= [];
	  stdout.split(/#(?= *.* *RunMonitor)/g).forEach((item, index)=>{
	  	if(index == 0);
	  	else
	  		result.push(item.match(/.*(?=RunMonitor)/g)[0]);
	  });
	  if(result.length == 0){
	  	return res.status(400).json({
		  	success: false,
		  });
	  }
	  res.status(200).json({
	  	success: true,
	  	results: result
	  })
	});
});



app.listen('8000',()=>{
	console.log('app is listening on port 8000');
});