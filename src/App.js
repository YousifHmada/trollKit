import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor() {
    super();
    document.execCommand("DefaultParagraphSeparator", false, "p");
    this.state = {
      'code': [],
      'breaks': [26]
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
    //let text = e.target.value.replace(/c/g,'0011');
    if(e.target.innerHTML.match(/((\$add)|(\$sub))(?!<span class="terminate">)/g)!= null){
      var text = e.target.innerHTML.replace(/((\$add)|(\$sub))(?!<span class="terminate">)/g,  function($0){
        return '<span class="schema-light-color-0" contentEditable="true">'+$0+'<span class="terminate"></span></span><span class="rest schema-light-white-1">&nbsp;</span>'
      });
      this.replaceTextWith(text);   
    }
    if(e.target.innerHTML.match(/((\$sw)|(\$lw))(?!<span class="terminate">)/g)!= null){
      var text = e.target.innerHTML.replace(/((\$sw)|(\$lw))(?!<span class="terminate">)/g,  function($0){
        return '<span class="schema-light-color-2" contentEditable="true">'+$0+'<span class="terminate"></span></span><span class="rest schema-light-color-3">&nbsp;</span>'
      });
     this.replaceTextWith(text);   
    }
    if(e.target.innerHTML.match(/(\(.*\))(?!<span class="terminate">)/g)!= null){
      var text = e.target.innerHTML.replace(/(\(.*\))(?!<span class="terminate">)/g,  function($0){
        return '<span class="schema-light-color-4" contentEditable="true">'+$0+'<span class="terminate"></span></span><span class="rest schema-light-white-1">&nbsp;</span>'
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
        text+= node.textContent.replace(/(\/\*.?\*\/)/g, '');
      }else if(node.tagName == 'P'){
        breaks.push((node.clientHeight) <= 27 ? 26 : 52)
        if(text != null){
          code.push(text);
        }
        text = null;
        text = node.textContent.replace(/(\/\*.*\*\/)/g, '');
        if(text != null){
          code.push(text);
        }
        text = null;
      }else{
        text = node.textContent.replace(/(\/\*.*\*\/)/g, '');
      }
    });
    if(text != null){
      code.push(text);
    }
    this.setState({
      'code': code,
      'breaks': breaks
    });
  }
  render() {
    var listOflines = function(breaks){
      return breaks.map(function(item, index){
        return <p key={index} style={{height: item + 'px' }}>{index}</p> 
      });
    }
    var codeLines = function(arr){
      return arr.map(function(item, index){
        return <p key={ index }>{ item }</p>
      });
    }
    return (
      <div className="container board">
        <div className="header">
          <h1>TrollKit</h1>
        </div>
        <div className="flexContainer schema-light-white-1">
          <div className="input">
            <div className="inputCodeWrapper">
              <div className="numbersList schema-light-white-0">{ listOflines(this.state.breaks) }</div>
              <div onKeyUp={ this.inputCodeChanged.bind(this) } id="textarea" spellCheck="false" contentEditable data-text="Enter your code here"></div>
            </div>
            <div className="btn-group btn-group-justified">
              <a className="btn btn-custom">Compile</a>
              <a className="btn btn-custom">Run</a>
            </div>
          </div>
          <div className="output">
              <div className="compiledCodeWrapper">{ codeLines(this.state.code) }</div>
              <div className="afterRun">{ codeLines(this.state.code) }</div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;