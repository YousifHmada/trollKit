import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor() {
    super();
    document.execCommand("DefaultParagraphSeparator", false, "p");
    this.state = {
      'code': [],
      'breaks': [26],
      'compiledCode': [],
      'runCode': [],
      'fileExists': true,
      'errorStory': 'please add a valid path',
      'compileError': false,
      'runError': false,
      'isCompiling': false,
      'isRunning': false
    }
  }

  replaceTextWith(value) {
    document.getElementById('textarea').innerHTML = '';
    document.getElementById('textarea').innerHTML = value;
    var el = document.getElementById('textarea');
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el.getElementsByClassName('rest')[el.getElementsByClassName('rest').length -1], 1);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
  }

  inputCodeChanged(e) {
    console.log(e.target.innerHTML);
    //let text = e.target.value.replace(/c/g,'0011');
    if(e.target.innerHTML.match(/((and)|(or)|(add)|(sub)|(sll))(?=(\&nbsp;| ))(?!<span class="terminate">)/g)!= null){
      var text = e.target.innerHTML.replace(/((and)|(or)|(add)|(sub)|(sll))(?=(\&nbsp;| ))(?!<span class="terminate">)/g,  function($0){
        return '<span class="schema-light-color-0" contentEditable="true">'+$0+'<span class="terminate"></span></span><span class="rest schema-light-white-1">&nbsp;</span>'
      });
      this.replaceTextWith(text);   
    }else if(e.target.innerHTML.match(/((sw)|(lw)|(beq))(?=(\&nbsp;| ))(?!<span class="terminate">)/g)!= null){
      var text = e.target.innerHTML.replace(/((sw)|(lw)|(beq))(?=(\&nbsp;| ))(?!<span class="terminate">)/g,  function($0){
        return '<span class="schema-light-color-2" contentEditable="true">'+$0+'<span class="terminate"></span></span><span class="rest schema-light-color-3">&nbsp;</span>'
      });
     this.replaceTextWith(text);   
    }else if(e.target.innerHTML.match(/(\([^\(]*\))(?!<span class="terminate">)/g)!= null){
      console.log('yes');
      var text = e.target.innerHTML.replace(/(\([^\(]*\))(?!<span class="terminate">)/g,  function($0){
        return '<span class="schema-light-color-4" contentEditable="true">'+$0+'<span class="terminate"></span></span><span class="rest schema-light-white-1">&nbsp;</span>'
      });
      this.replaceTextWith(text);   
    }else if(e.target.innerHTML.match(/(\/\*[^(\/\*)]*\*\/)(?!<span class="terminate">)/g)!= null){
      console.log('yes');
      var text = e.target.innerHTML.replace(/(\/\*[^(\/\*)]*\*\/)(?!<span class="terminate">)/g,  function($0){
        return '<span class="schema-light-white-0" contentEditable="true">'+$0+'<span class="terminate"></span></span><span class="rest schema-light-white-1">&nbsp;</span>'
      });
      this.replaceTextWith(text);   
    }
    var code = [];
    var text = '';
    var breaks = [];
    breaks.push(26);
    document.getElementById('textarea').childNodes.forEach(function(node){
      if(node.tagName == 'SPAN')
      {
        text+= node.textContent.replace(/(\/\*[^(\/\*)]*\*\/)/g, '');
      }else if(node.tagName == 'P'){
        breaks.push((node.clientHeight) <= 27 ? 26 : 52)
        if(text.trim() != ''){
          code.push(text.trim(';'));
        }
        text = '';
        text = node.textContent.replace(/(\/\*[^(\/\*)]*\*\/)/g, '');
        if(text.trim() != ''){
          code.push(text.trim(';'));
        }
        text = '';
      }else{
        var temp_text = node.textContent.replace(/(\/\*[^(\/\*)]*\*\/)/g, '');
        if(temp_text.trim().length > 0){
          text = temp_text;
          console.log('text', text);
        }
      }
    });
    if(text.trim() != ''){
      code.push(text.trim(';'));
    }
    console.log(code);
    this.setState({
      'code': code,
      'breaks': breaks
    });
  }

  goCompile(){
    var temp = this;
    console.log(temp.state.code);
    temp.setState({
      isCompiling: true,
      compileError: false
    });
    fetch('http://localhost:8000/compile',{
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'Accept':'application/json',
      },
      body:JSON.stringify({
        data: temp.state.code
      })
    }).then(function(data){
      data.json()
      .then(function(res){
          console.log(res);
          if(!res.success)  Promise.reject();
          var data = [];
          for (var i = 0; i < res.input.length; i++) {
            data.push({input:res.input[i],output:res.output[i]});
          }
          return data;
        })
        .then(function(res) {
          temp.setState({
            'compiledCode': res,
            isCompiling: false,
            compileError: false
          })
        })
      }).catch(function(){
        temp.setState({
            'compiledCode': [],
            isCompiling: false,
            compileError: true
          })
      });
  }

  goRun(){
    var temp = this;
    temp.setState({
      isRunning: true,
      runError: false
    });
    fetch('http://localhost:8000/run').then(function(data){
      data.json()
      .then(function(res){
          if(!res.success) Promise.reject();
          console.log(res);
          var data = [];
          for (var i = 0; i < res.results.length; i++) {
            data.push(res.results[i]);
          }
          return data;
        })
        .then(function(res) {
          temp.setState({
            'runCode': res,
            isRunning: false,
            runError: false
          })
        })
      }).catch(function(){
          temp.setState({
            'runCode': [],
            isRunning: false,
            runError: true
          })
      });
  }

  pathChanged(e){
    if(e.target.value.trim().length > 0){
      fetch('http://localhost:8000/setPath',{
        method: 'POST',
        headers: {
          'Content-Type':'application/json',
          'Accept':'application/json',
        },
        body:JSON.stringify({
          data: e.target.value.trim()
        })
      }).then((data)=>{
        return data.json();
      }).then((res)=>{
          if(res.successed){       
            this.setState({
              fileExists: true
            });
          }else{
            this.setState({
              fileExists: false,
              errorStory: 'path isn\'t valid'
            });
          }
        }).catch((err)=>{
          this.setState({
            fileExists: false,
            errorStory: 'path isn\'t valid'
          }); 
        });
    }else{
      this.setState({
        fileExists: false,
        errorStory: 'please add a valid path'
      });
    };
  }

  render() {
    var listOflines = function(breaks){
      return breaks.map(function(item, index){
        return <p key={index} style={{height: item + 'px' }}>{index}</p> 
      });
    }
    var codeLines = function(arr, flag){
      if(flag){
        return <p style={{textAlign: 'left', color: '#ec5f67'}}>error occured</p>
      }
      else if(arr.length == 0){
        return <p style={{textAlign: 'left'}}>compile your code</p>
      }
      return arr.map(function(item, index){
        if(item.output == 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'){
          return <p key={ index } style={{color: '#ec5f67'}}>{ item.input }</p>
        }
        return <p key={ index }>{ item.output }</p>
      });
    }
    var runLines = function(arr, flag){
      if(flag){
        return <p style={{textAlign: 'left', color: '#ec5f67'}}>error occured</p>
      }
      else if(arr.length == 0){
        return <p style={{textAlign: 'left'}}>run your code</p>
      }
      return arr.map(function(item, index){
        return <p key={ index }>{ item }</p>
      });
    }
    var foucsOnInputBar = function(){

    };
    var getButtons = function(){
      if(!this.state.fileExists){
        return(
          <div className="btn-group btn-group-justified">
            <a className={"btn btn-custom Disabled" } onClick={ foucsOnInputBar() }>{ this.state.errorStory }</a>
          </div>
        )
      }else{
        return(
          <div className="btn-group btn-group-justified">
              <a className={this.state.isCompiling ? "btn btn-custom Disabled" : "btn btn-custom" } onClick={ this.goCompile.bind(this) }>{ this.state.isCompiling ? 'compiling ...' : 'Compile' }</a>
              <a className={this.state.isRunning ? "btn btn-custom Disabled" : "btn btn-custom" } onClick={ this.goRun.bind(this) }>{ this.state.isRunning ? 'running ...' : 'Run' }</a>
          </div>
        )
      }
    }
    document.execCommand("DefaultParagraphSeparator", false, "p");
    return (
      <div className="container board">
        <div className="header">
          <h1>TrollKit</h1>
        </div>
        <div className="pathInput">
          <input type="text" autofocus='true' id="path" onKeyUp={ this.pathChanged.bind(this) } placeholder="Example Path: C:\Users\Waleed\Desktop\trollMe\Co Project.v"/>
        </div>
        <div className="flexContainer schema-light-white-1">
          <div className="input">
            <div className="inputCodeWrapper">
              <div className="numbersList schema-light-white-0">{ listOflines(this.state.breaks) }</div>
              <div onKeyUp={ this.inputCodeChanged.bind(this) } id="textarea" spellCheck="false" contentEditable data-text="Enter your code here"></div>
            </div>
            { (getButtons.bind(this))() }
          </div>
          <div className="output">
              <div className="compiledCodeWrapper">{ codeLines(this.state.compiledCode, this.state.compileError) }</div>
              <div className="afterRun">{ runLines(this.state.runCode, this.state.runError) }</div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;