const fs = require('fs');
const parser = require('@babel/parser');
const t = require('@babel/types');
const traverse = require("@babel/traverse").default;
const generate = require('@babel/generator').default;
const Cases = require('./Cases');

let script = fs.readFileSync('./ticket.js', 'utf-8');

const AST = parser.parse(script, {})

traverse(AST, {
  ForStatement(path){
    new Cases(path);
  }
})