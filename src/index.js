var sift = require('sift');
var ObjectId = require('bson').ObjectID;

var LocalDB = function(tableName){
  var getTable = function(name){
    var data;
    if(!localStorage[name]) localStorage[name] = '[]';
    try{
      data = JSON.parse(localStorage[name]);
    } catch(e){
      this.debug && console.info('Table ' + name + ' is broken creating new. All data is lost.');
      localStorage[name] = '[]';
      data = [];
    }
    return data;
  };

  getTable(tableName);

  var self = this;
  this.debug = false;

  this.update = function(query, item){
    var table = getTable(tableName);
    var records = sift(query, table);
    records.forEach(function(el){
      var recordIndex = table.indexOf(el);
      item.id = el.id;
      table[recordIndex] = item;
    });
    this.debug && console.log(records.length + ' record(s) updated', records);
    localStorage[tableName] = JSON.stringify(table);
  };

  this.insert = function(object){
    if(object.id) {
      var record = self.query({ id: object.id });
      if(record.length) {
        self.update({ id: object.id }, object);
        // ok we did what we came for, go home
        return;
      }
    }

    // we either don't have object with object.id or object doesn't have id
    var table = getTable(tableName);
    record.id = record.id || new ObjectId(); // respect user's id
    table.push(record);
    localStorage[tableName] = JSON.stringify(table);
    this.debug && console.log('Record inserted', record);
  };

  this.remove = function(query){
    var table = getTable(tableName);
    const records = sift(query, table);
    records.forEach(function(el) {
      var elementIndex = table.indexOf(el);
      table.splice(elementIndex, 1);
    });
    localStorage[tableName] = JSON.stringify(table);
    this.debug && console.log(records.length + ' records deleted', records);
  };

  this.find = function(q){
    if(typeof q !== 'object') {
      q = {};
    }
    var records = sift(q, JSON.parse(localStorage[tableName]));
    this.debug && console.table(records.length + ' record(s) found', records);
    return records;
  };

  this.findOne = function(q) {
    const records = this.find(q);
    return (records instanceof Array) ? records[0] : records;
  };

  this.drop = function() {
    localStorage[name] = '[]';
    this.debug && console.log('Table ' + name + ' dropped.');
  };

};
// Export to global scope if running on the browser
module.exports = LocalDB;
if(window) window.DB = LocalDB;
