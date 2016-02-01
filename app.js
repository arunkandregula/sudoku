(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var puzzle = require('./puzzle');
// register event handlers necessary for UI interaction
module.exports = function(){

        $("#newPuzzleButton").bind('click', function(){
            $("#congratulationsDiv").hide();
            puzzle.model.lastDisplayedMatrix = puzzle.newInstance();
        });

        $("#solveButton").bind('click', function(){
            puzzle.displayPuzzle(puzzle.model.lastDisplayedMatrix, true);
        });

        $("#validateButton").bind('click', function(){
            var isSolved = true;
            puzzle.model.lastDisplayedMatrix.forEach(function(eachRow, eachRowIndex){

                eachRow.forEach(function(expectedNumberInEachCell, eachCellIndex){

                    var id = "row" + (eachRowIndex+1) + "col" + (eachCellIndex+1);

                    var actualNumber = $("#" + id).html();
                    if(actualNumber != expectedNumberInEachCell){
                    	// if already being edited 
                    	if( $("#" + id).html().indexOf("input") !== -1) {
                    		$("#textBox").css("background-color","red")
                    	}
                        $("#" + id).css("background-color","red");
                        isSolved = false;

                    } else {
                        $("#" + id).css("background-color","white");
                    }
                });

            });
            if( isSolved ){
              $("#congratulationsDiv").show();
            }

        });


	    var isEditableCell = function(id){
	        return $("#"+id).css("background-color") != "rgb(221, 221, 221)";
	    }

        $(".cell").bind('click',function(event){
            var id = event.target.id;
            var clickedCell = $("#"+id);
            var currentValue = clickedCell.html();
            if(isEditableCell(id)) {
                var lastLastClickedCell = puzzle.model.lastClickedCell;
                if( lastLastClickedCell ) {
                    lastLastClickedCell.html( $("#textBox").val() );
                    $("#textBox").remove();
                    lastLastClickedCell.css("background-color","white");
                }

                var isValidValue = function(currentValue){
                    return currentValue.length == 1;
                }
                var textBoxStr = '<input type="tel" id="textBox" class="editTextBox" size="1" maxlength="1" autofocus="autofocus" >';
                if( isValidValue(currentValue) ){
                    textBoxStr = '<input type="tel" id="textBox" class="editTextBox" size="1" maxlength="1" autofocus="autofocus" value="'+ currentValue +'">';
                }
                clickedCell.html(textBoxStr);
                puzzle.model.lastClickedCell = clickedCell;
                $('input[autofocus="autofocus"]').focus()
            }

        });


    };
},{"./puzzle":3}],2:[function(require,module,exports){
var puzzle = require('./puzzle');
var eventListeners = require('./eventListeners');

$(function(){
    puzzle.newInstance();
    eventListeners.call();
});

 var template = require("../templates/main.hbs");

 // This is how we pass context into Handlebars. But due to lack of time, I am just showing you how to pass model into handlebars
 // template. I dont want to spend more time on this.
 var str = template({
 	congratulationsText : "Congratulations!!"
 });
  $("body").html(str);

},{"../templates/main.hbs":5,"./eventListeners":1,"./puzzle":3}],3:[function(require,module,exports){
var utilities = require('./utilities');
// This will generate the 9x9 Puzzle singleton object
module.exports = new function(){
   var generateRandomNumberBetweenMinAnMax = utilities.generateRandomNumberBetweenMinAnMax;

   var createPuzzle = function(matrix){
	  var matrix = [];
	   // choose a random number between 1 and 9
	   var randomNumber = Math.floor(Math.random()*9 + 1);
	   // We use a staring number, sn
	   for(var sn = randomNumber; sn < randomNumber + 3; sn ++){
	        for(var i = 0 ; i < 3 ; i++ ){
	            var row = [];
	            for(var j = 0; j < 9 ; j++){
	                var num = (sn + j + i*3 )%9 + 1;
	                row.push( num );
	            }
	            matrix.push(row);
	        }
	    }
	    return matrix;
	};

    var shuffleColumns = function(matrix, startCol, endCol){
        var len = matrix.length;
        for(var c = startCol-1 ; c < endCol ; c++ ){
            // generate random column between 1 and len(9)
            var randomColumn = generateRandomNumberBetweenMinAnMax(startCol-1,endCol-1);

            for( var r= 0 ; r < len ; r++ ){
                var temp = matrix[r][c];
                matrix[r][c] = matrix[r][randomColumn];
                matrix[r][randomColumn] = temp;
            }
        }

    };
    var shuffleRows = function(matrix, startRow, endRow){
        var len = matrix.length;
        for(var r = startRow-1 ; r < endRow ; r++ ){
            // generate random column between 1 and len(9)
            var randomRow = generateRandomNumberBetweenMinAnMax(startRow-1,endRow-1);

            for( var c= 0 ; c < len ; c++ ){
                var temp = matrix[r][c];
                matrix[r][c] = matrix[randomRow][c];
                matrix[randomRow][c] = temp;
            }
        }

    };


    var printMatrix = function(matrix, heading){
        if( heading ) {
          $( ".sudoku" ).append("<br />****************" + heading + "****************</br>");
        }

        matrix.forEach(function(eachRow){
            $( ".sudoku" ).append("<br />" + eachRow);
        });


    };

    var shuffle = function(matrix){
        shuffleColumns(matrix,1,3);
        shuffleColumns(matrix,4,6);
        shuffleColumns(matrix,7,9);
        printMatrix(matrix, "After shuffling columns");

        shuffleRows(matrix,1,3);
        shuffleRows(matrix,4,6);
        shuffleRows(matrix,7,9);
        printMatrix(matrix, "After shuffling rows");

    };

    var isEditableCell = function(id){
        return $("#"+id).css("background-color") != "rgb(221, 221, 221)";
    }

    this.model = {
      matrix: [],
      lastDisplayedMatrix : null,
   	  lastClickedCell : null  
    };
   
    this.newInstance = function(){
    	this.model.matrix = createPuzzle();
        shuffle(this.model.matrix);
        this.displayPuzzle(this.model.matrix, false);
        this.model.lastDisplayedMatrix = this.model.matrix;
        return this.model.matrix;
    };

    this.displayPuzzle = function( matrix, isSolved ){

        matrix.forEach(function(eachRow, eachRowIndex){

            // Before iterating each row, generate 3 random indices which show numbers. Rest are left as blank.
            var visiblePositions = [];
            if( !isSolved ) {
                visiblePositions.push(generateRandomNumberBetweenMinAnMax(1,9));
                visiblePositions.push(generateRandomNumberBetweenMinAnMax(1,9));
                visiblePositions.push(generateRandomNumberBetweenMinAnMax(1,9));
            }
            eachRow.forEach(function(expectedNumberInEachCell, eachCellIndex){

               var id = "row" + (eachRowIndex+1) + "col" + (eachCellIndex+1);
               // show the number only when it is in visiblepositions
               if(visiblePositions.indexOf(eachCellIndex) !== -1) {
                   $("#" + id).html( expectedNumberInEachCell );
                   $("#" + id).css( "background-color", "#dddddd" );
               } else {
                   if(isSolved ) {
                     $("#" + id).html( expectedNumberInEachCell );
                     $("#" + id).css( "background-color", "#ffffff" );
                   } else {
                     $("#" + id).html(  "&nbsp;&nbsp;" );
                     $("#" + id).css( "background-color", "#ffffff" );
                   }

               }
            });

        });
    };

};


},{"./utilities":4}],4:[function(require,module,exports){
module.exports = new function(){
      this.generateRandomNumberBetweenMinAnMax = function(min, max){
        if(min > max) {
            var temp = min;
            min = max;
            max = temp;
        }
        var diff = max - min;
        return (min - 1) + Math.floor(Math.random()*(diff + 1)+1);
    };
}
},{}],5:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"outer-div\">\n    <div class=\"inner-div\">\n        <div class=\"action-div\">\n            <input type=\"button\" id=\"newPuzzleButton\" value=\"New Puzzle\" />\n            <input type=\"button\" id=\"validateButton\" value=\"Validate my solution\" />\n            <input type=\"button\" id=\"solveButton\" value=\"Solve it\" />\n\n        </div>\n        <div class=\"text-div\">\n            <span>\n            Sudoku is one of the most popular puzzle games of all time.\n            The goal of Sudoku is to fill a 9×9 grid with numbers so that each row, column and 3×3 section contain all of the digits between 1 and 9.\n            </span>\n\n        </div>\n        <div class=\"game-div\">\n            <table id=\"sudoku-table\">\n              <tbody>\n                  <tr>\n                      <td>\n                          <table class=\"square-3-by-3\">\n                              <tr>\n                                  <td id=\"row1col1\" class=\"cell\">1</td>\n                                  <td id=\"row1col2\" class=\"cell\">1</td>\n                                  <td id=\"row1col3\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row2col1\" class=\"cell\">1</td>\n                                  <td id=\"row2col2\" class=\"cell\">1</td>\n                                  <td id=\"row2col3\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row3col1\" class=\"cell\">1</td>\n                                  <td id=\"row3col2\" class=\"cell\">1</td>\n                                  <td id=\"row3col3\" class=\"cell\">1</td>\n                              </tr>\n                          </table>\n                      </td>\n                      <td>\n                          <table class=\"square-3-by-3\">\n                              <tr>\n                                  <td id=\"row1col4\" class=\"cell\">1</td>\n                                  <td id=\"row1col5\" class=\"cell\">1</td>\n                                  <td id=\"row1col6\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row2col4\" class=\"cell\">1</td>\n                                  <td id=\"row2col5\" class=\"cell\">1</td>\n                                  <td id=\"row2col6\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row3col4\" class=\"cell\">1</td>\n                                  <td id=\"row3col5\" class=\"cell\">1</td>\n                                  <td id=\"row3col6\" class=\"cell\">1</td>\n                              </tr>\n                          </table>\n                      </td>\n                      <td>\n                          <table class=\"square-3-by-3\">\n                              <tr>\n                                  <td id=\"row1col7\" class=\"cell\">1</td>\n                                  <td id=\"row1col8\" class=\"cell\">1</td>\n                                  <td id=\"row1col9\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row2col7\" class=\"cell\">1</td>\n                                  <td id=\"row2col8\" class=\"cell\">1</td>\n                                  <td id=\"row2col9\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row3col7\" class=\"cell\">1</td>\n                                  <td id=\"row3col8\" class=\"cell\">1</td>\n                                  <td id=\"row3col9\" class=\"cell\">1</td>\n                              </tr>\n                          </table>\n                      </td>\n                  </tr>\n                  <tr>\n                      <td>\n                          <table class=\"square-3-by-3\">\n                              <tr>\n                                  <td id=\"row4col1\"  class=\"cell\">1</td>\n                                  <td id=\"row4col2\"  class=\"cell\">1</td>\n                                  <td id=\"row4col3\"  class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row5col1\"  class=\"cell\">1</td>\n                                  <td id=\"row5col2\"  class=\"cell\">1</td>\n                                  <td id=\"row5col3\"  class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row6col1\"  class=\"cell\">1</td>\n                                  <td id=\"row6col2\"  class=\"cell\">1</td>\n                                  <td id=\"row6col3\" class=\"cell\">1</td>\n                              </tr>\n                          </table>\n                      </td>\n                      <td>\n                          <table class=\"square-3-by-3\">\n                              <tr>\n                                  <td id=\"row4col4\" class=\"cell\">1</td>\n                                  <td id=\"row4col5\" class=\"cell\">1</td>\n                                  <td id=\"row4col6\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row5col4\" class=\"cell\">1</td>\n                                  <td id=\"row5col5\" class=\"cell\">1</td>\n                                  <td id=\"row5col6\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row6col4\" class=\"cell\">1</td>\n                                  <td id=\"row6col5\" class=\"cell\">1</td>\n                                  <td id=\"row6col6\" class=\"cell\">1</td>\n                              </tr>\n                          </table>\n                      </td>\n                      <td>\n                          <table class=\"square-3-by-3\">\n                              <tr>\n                                  <td id=\"row4col7\" class=\"cell\">1</td>\n                                  <td id=\"row4col8\" class=\"cell\">1</td>\n                                  <td id=\"row4col9\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row5col7\" class=\"cell\">1</td>\n                                  <td id=\"row5col8\" class=\"cell\">1</td>\n                                  <td id=\"row5col9\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row6col7\" class=\"cell\">1</td>\n                                  <td id=\"row6col8\" class=\"cell\">1</td>\n                                  <td id=\"row6col9\" class=\"cell\">1</td>\n                              </tr>\n                          </table>\n                      </td>\n                  </tr>\n                  <tr>\n                      <td>\n                          <table class=\"square-3-by-3\">\n                              <tr>\n                                  <td id=\"row7col1\" class=\"cell\">1</td>\n                                  <td id=\"row7col2\" class=\"cell\">1</td>\n                                  <td id=\"row7col3\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row8col1\" class=\"cell\">1</td>\n                                  <td id=\"row8col2\" class=\"cell\">1</td>\n                                  <td id=\"row8col3\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row9col1\" class=\"cell\">1</td>\n                                  <td id=\"row9col2\" class=\"cell\">1</td>\n                                  <td id=\"row9col3\" class=\"cell\">1</td>\n                              </tr>\n                          </table>\n                      </td>\n                      <td>\n                          <table class=\"square-3-by-3\">\n                              <tr>\n                                  <td id=\"row7col4\" class=\"cell\">1</td>\n                                  <td id=\"row7col5\" class=\"cell\">1</td>\n                                  <td id=\"row7col6\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row8col4\" class=\"cell\">1</td>\n                                  <td id=\"row8col5\" class=\"cell\">1</td>\n                                  <td id=\"row8col6\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row9col4\" class=\"cell\">1</td>\n                                  <td id=\"row9col5\" class=\"cell\">1</td>\n                                  <td id=\"row9col6\" class=\"cell\">1</td>\n                              </tr>\n                          </table>\n                      </td>\n                      <td>\n                          <table class=\"square-3-by-3\">\n                              <tr>\n                                  <td id=\"row7col7\" class=\"cell\">1</td>\n                                  <td id=\"row7col8\" class=\"cell\">1</td>\n                                  <td id=\"row7col9\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row8col7\" class=\"cell\">1</td>\n                                  <td id=\"row8col8\" class=\"cell\">1</td>\n                                  <td id=\"row8col9\" class=\"cell\">1</td>\n                              </tr>\n                              <tr>\n                                  <td id=\"row9col7\" class=\"cell\">1</td>\n                                  <td id=\"row9col8\" class=\"cell\">1</td>\n                                  <td id=\"row9col9\" class=\"cell\">1</td>\n                              </tr>\n                          </table>\n                      </td>\n                  </tr>\n              </tbody>\n            </table>\n\n        </div>\n    </div>\n</div>\n<div id=\"congratulationsDiv\">\n   ";
  if (helper = helpers.congratulationsText) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.congratulationsText); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\n</div>\n";
  return buffer;
  });

},{"hbsfy/runtime":13}],6:[function(require,module,exports){
"use strict";
/*globals Handlebars: true */
var base = require("./handlebars/base");

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)
var SafeString = require("./handlebars/safe-string")["default"];
var Exception = require("./handlebars/exception")["default"];
var Utils = require("./handlebars/utils");
var runtime = require("./handlebars/runtime");

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
var create = function() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = SafeString;
  hb.Exception = Exception;
  hb.Utils = Utils;

  hb.VM = runtime;
  hb.template = function(spec) {
    return runtime.template(spec, hb);
  };

  return hb;
};

var Handlebars = create();
Handlebars.create = create;

exports["default"] = Handlebars;
},{"./handlebars/base":7,"./handlebars/exception":8,"./handlebars/runtime":9,"./handlebars/safe-string":10,"./handlebars/utils":11}],7:[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];

var VERSION = "1.3.0";
exports.VERSION = VERSION;var COMPILER_REVISION = 4;
exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '>= 1.0.0'
};
exports.REVISION_CHANGES = REVISION_CHANGES;
var isArray = Utils.isArray,
    isFunction = Utils.isFunction,
    toString = Utils.toString,
    objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials) {
  this.helpers = helpers || {};
  this.partials = partials || {};

  registerDefaultHelpers(this);
}

exports.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: logger,
  log: log,

  registerHelper: function(name, fn, inverse) {
    if (toString.call(name) === objectType) {
      if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
      Utils.extend(this.helpers, name);
    } else {
      if (inverse) { fn.not = inverse; }
      this.helpers[name] = fn;
    }
  },

  registerPartial: function(name, str) {
    if (toString.call(name) === objectType) {
      Utils.extend(this.partials,  name);
    } else {
      this.partials[name] = str;
    }
  }
};

function registerDefaultHelpers(instance) {
  instance.registerHelper('helperMissing', function(arg) {
    if(arguments.length === 2) {
      return undefined;
    } else {
      throw new Exception("Missing helper: '" + arg + "'");
    }
  });

  instance.registerHelper('blockHelperMissing', function(context, options) {
    var inverse = options.inverse || function() {}, fn = options.fn;

    if (isFunction(context)) { context = context.call(this); }

    if(context === true) {
      return fn(this);
    } else if(context === false || context == null) {
      return inverse(this);
    } else if (isArray(context)) {
      if(context.length > 0) {
        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      return fn(context);
    }
  });

  instance.registerHelper('each', function(context, options) {
    var fn = options.fn, inverse = options.inverse;
    var i = 0, ret = "", data;

    if (isFunction(context)) { context = context.call(this); }

    if (options.data) {
      data = createFrame(options.data);
    }

    if(context && typeof context === 'object') {
      if (isArray(context)) {
        for(var j = context.length; i<j; i++) {
          if (data) {
            data.index = i;
            data.first = (i === 0);
            data.last  = (i === (context.length-1));
          }
          ret = ret + fn(context[i], { data: data });
        }
      } else {
        for(var key in context) {
          if(context.hasOwnProperty(key)) {
            if(data) { 
              data.key = key; 
              data.index = i;
              data.first = (i === 0);
            }
            ret = ret + fn(context[key], {data: data});
            i++;
          }
        }
      }
    }

    if(i === 0){
      ret = inverse(this);
    }

    return ret;
  });

  instance.registerHelper('if', function(conditional, options) {
    if (isFunction(conditional)) { conditional = conditional.call(this); }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function(conditional, options) {
    return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
  });

  instance.registerHelper('with', function(context, options) {
    if (isFunction(context)) { context = context.call(this); }

    if (!Utils.isEmpty(context)) return options.fn(context);
  });

  instance.registerHelper('log', function(context, options) {
    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    instance.log(level, context);
  });
}

var logger = {
  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

  // State enum
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  level: 3,

  // can be overridden in the host environment
  log: function(level, obj) {
    if (logger.level <= level) {
      var method = logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};
exports.logger = logger;
function log(level, obj) { logger.log(level, obj); }

exports.log = log;var createFrame = function(object) {
  var obj = {};
  Utils.extend(obj, object);
  return obj;
};
exports.createFrame = createFrame;
},{"./exception":8,"./utils":11}],8:[function(require,module,exports){
"use strict";

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var line;
  if (node && node.firstLine) {
    line = node.firstLine;

    message += ' - ' + line + ':' + node.firstColumn;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  if (line) {
    this.lineNumber = line;
    this.column = node.firstColumn;
  }
}

Exception.prototype = new Error();

exports["default"] = Exception;
},{}],9:[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];
var COMPILER_REVISION = require("./base").COMPILER_REVISION;
var REVISION_CHANGES = require("./base").REVISION_CHANGES;

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = REVISION_CHANGES[currentRevision],
          compilerVersions = REVISION_CHANGES[compilerRevision];
      throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
            "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
            "Please update your runtime to a newer version ("+compilerInfo[1]+").");
    }
  }
}

exports.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

function template(templateSpec, env) {
  if (!env) {
    throw new Exception("No environment passed to template");
  }

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
    var result = env.VM.invokePartial.apply(this, arguments);
    if (result != null) { return result; }

    if (env.compile) {
      var options = { helpers: helpers, partials: partials, data: data };
      partials[name] = env.compile(partial, { data: data !== undefined }, env);
      return partials[name](context, options);
    } else {
      throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    }
  };

  // Just add water
  var container = {
    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,
    programs: [],
    program: function(i, fn, data) {
      var programWrapper = this.programs[i];
      if(data) {
        programWrapper = program(i, fn, data);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = program(i, fn);
      }
      return programWrapper;
    },
    merge: function(param, common) {
      var ret = param || common;

      if (param && common && (param !== common)) {
        ret = {};
        Utils.extend(ret, common);
        Utils.extend(ret, param);
      }
      return ret;
    },
    programWithDepth: env.VM.programWithDepth,
    noop: env.VM.noop,
    compilerInfo: null
  };

  return function(context, options) {
    options = options || {};
    var namespace = options.partial ? options : env,
        helpers,
        partials;

    if (!options.partial) {
      helpers = options.helpers;
      partials = options.partials;
    }
    var result = templateSpec.call(
          container,
          namespace, context,
          helpers,
          partials,
          options.data);

    if (!options.partial) {
      env.VM.checkRevision(container.compilerInfo);
    }

    return result;
  };
}

exports.template = template;function programWithDepth(i, fn, data /*, $depth */) {
  var args = Array.prototype.slice.call(arguments, 3);

  var prog = function(context, options) {
    options = options || {};

    return fn.apply(this, [context, options.data || data].concat(args));
  };
  prog.program = i;
  prog.depth = args.length;
  return prog;
}

exports.programWithDepth = programWithDepth;function program(i, fn, data) {
  var prog = function(context, options) {
    options = options || {};

    return fn(context, options.data || data);
  };
  prog.program = i;
  prog.depth = 0;
  return prog;
}

exports.program = program;function invokePartial(partial, name, context, helpers, partials, data) {
  var options = { partial: true, helpers: helpers, partials: partials, data: data };

  if(partial === undefined) {
    throw new Exception("The partial " + name + " could not be found");
  } else if(partial instanceof Function) {
    return partial(context, options);
  }
}

exports.invokePartial = invokePartial;function noop() { return ""; }

exports.noop = noop;
},{"./base":7,"./exception":8,"./utils":11}],10:[function(require,module,exports){
"use strict";
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = function() {
  return "" + this.string;
};

exports["default"] = SafeString;
},{}],11:[function(require,module,exports){
"use strict";
/*jshint -W004 */
var SafeString = require("./safe-string")["default"];

var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

function escapeChar(chr) {
  return escape[chr] || "&amp;";
}

function extend(obj, value) {
  for(var key in value) {
    if(Object.prototype.hasOwnProperty.call(value, key)) {
      obj[key] = value[key];
    }
  }
}

exports.extend = extend;var toString = Object.prototype.toString;
exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
var isFunction = function(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
if (isFunction(/x/)) {
  isFunction = function(value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
var isFunction;
exports.isFunction = isFunction;
var isArray = Array.isArray || function(value) {
  return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
};
exports.isArray = isArray;

function escapeExpression(string) {
  // don't escape SafeStrings, since they're already safe
  if (string instanceof SafeString) {
    return string.toString();
  } else if (!string && string !== 0) {
    return "";
  }

  // Force a string conversion as this will be done by the append regardless and
  // the regex test will do this transparently behind the scenes, causing issues if
  // an object's to string has escaped characters in it.
  string = "" + string;

  if(!possible.test(string)) { return string; }
  return string.replace(badChars, escapeChar);
}

exports.escapeExpression = escapeExpression;function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

exports.isEmpty = isEmpty;
},{"./safe-string":10}],12:[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime');

},{"./dist/cjs/handlebars.runtime":6}],13:[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":12}]},{},[1,2,3,4]);
