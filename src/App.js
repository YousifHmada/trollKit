import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor() {
    super();
    document.execCommand("DefaultParagraphSeparator", false, "p");
    this.state = {
      'code': [],
      'breaks': [26],
      'compiledCode': []
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
    if(e.target.innerHTML.match(/((and)|(or)|(add)|(sll))(?=\&nbsp;)(?!<span class="terminate">)/g)!= null){
      var text = e.target.innerHTML.replace(/((and)|(or)|(add)|(sll))(?=\&nbsp;)(?!<span class="terminate">)/g,  function($0){
        return '<span class="schema-light-color-0" contentEditable="true">'+$0+'<span class="terminate"></span></span><span class="rest schema-light-white-1">&nbsp;</span>'
      });
      this.replaceTextWith(text);   
    }else if(e.target.innerHTML.match(/((sw)|(lw))(?=\&nbsp;)(?!<span class="terminate">)/g)!= null){
      var text = e.target.innerHTML.replace(/((sw)|(lw))(?=\&nbsp;)(?!<span class="terminate">)/g,  function($0){
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
          code.push(text);
        }
        text = '';
        text = node.textContent.replace(/(\/\*[^(\/\*)]*\*\/)/g, '');
        if(text.trim() != ''){
          code.push(text);
        }
        text = '';
      }else{
        text = node.textContent.replace(/(\/\*[^(\/\*)]*\*\/)/g, '');
      }
    });
    if(text.trim() != ''){
      code.push(text);
    }
    this.setState({
      'code': code,
      'breaks': breaks
    });
  }

  goCompile(){
    var temp = this;
    console.log(temp.state.code);
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
          var data = [];
          for (var i = 0; i < res.input.length; i++) {
            data.push({input:res.input[i],output:res.output[i]});
          }
          return data;
        })
        .then(function(res) {
          temp.setState({
            'compiledCode': res
          })
        })
      }).catch(function(){
        console.log('failed');
      });
  }

  render() {
    var listOflines = function(breaks){
      return breaks.map(function(item, index){
        return <p key={index} style={{height: item + 'px' }}>{index}</p> 
      });
    }
    var codeLines = function(arr){
      if(arr.length == 0){
        return <p style={{textAlign: 'left'}}>compile your code</p>
      }
      return arr.map(function(item, index){
        if(item.output == 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'){
          return <p key={ index } style={{color: '#ec5f67'}}>{ item.input }</p>
        }
        return <p key={ index }>{ item.output }</p>
      });
    }
    var runLines = function(arr){
      if(0 == 0){
        return <p style={{textAlign: 'left'}}>run your code</p>
      }
      return arr.map(function(item, index){
        if(item.output == 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'){
          return <p key={ index } style={{color: '#ec5f67'}}>{ item.input }</p>
        }
        return <p key={ index }>{ item.output }</p>
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
              <a className="btn btn-custom" onClick={ this.goCompile.bind(this) }>Compile</a>
              <a className="btn btn-custom">Run</a>
            </div>
          </div>
          <div className="output">
              <div className="compiledCodeWrapper">{ codeLines(this.state.compiledCode) }</div>
              <div className="afterRun">{ runLines(this.state.code) }</div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;