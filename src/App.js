import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor() {
    super();
    document.execCommand("DefaultParagraphSeparator", true, "p");
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
    if(e.target.innerHTML.match(/match/g)!=null){
      var text = e.target.innerHTML.replace(/match/g,  '<span class="special" contentEditable="false">special</span><span class="rest">&nbsp;</span>')
      this.replaceTextWith(text);
      
    }
    var code = [];
    var text = '';
    var breaks = [];
    breaks.push(26);
    document.getElementById('textarea').childNodes.forEach(function(node){
      if(node.tagName == 'SPAN')
      {
        text+= node.textContent;
      }else if(node.tagName == 'P'){
        breaks.push((node.clientHeight) <= 27 ? 26 : 52)
        if(text != null){
          code.push(text);
        }
        text = null;
        text = node.textContent;
        if(text != null){
          code.push(text);
        }
        text = null;
      }else{
        text = node.textContent;
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
      <div className="container">
        <h1>Assembly Board</h1>
        <div className="flexContainer">
          <div className="inputCodeWrapper">
            <div className="numbersList">{ listOflines(this.state.breaks) }</div>
            <div onKeyUp={ this.inputCodeChanged.bind(this) } id="textarea" contentEditable data-text="Enter your code here"></div>
          </div>
          <div className="compiledCodeWrapper">{ codeLines(this.state.code) }</div>
        </div>
      </div>
    );
  }
}

export default App;
