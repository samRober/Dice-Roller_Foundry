var _rollEvaluateOriginal;
var _dieEvaluateOriginal;
var sio;


Hooks.on('init', () => {
    _rollEvaluateOriginal = Roll.prototype._evaluate;
    _dieEvaluateOriginal = Die.prototype._evaluate;
    Roll.prototype._evaluate = _rollEvaluate;

    Die.prototype._evaluate = _dieEvaluate;

    sio = io("http://localhost:8080");
});



 async function _rollEvaluate(options) {
    console.log("roll");
    return _rollEvaluateOriginal.call(this, options);
}

 async function _dieEvaluate(options){
    if ( (this.number > 999) ) {
        throw new Error(`You may not evaluate a DiceTerm with more than 999 requested results`);
      }
      for ( let n=1; n <= this.number; n++ ) {
        this.roll(options);
        let x = await asyncEmit("get_roll");
        this.results[n - 1].result = x;
      }
      this._evaluateModifiers();
      return this;
 }

 function asyncEmit(eventName, data) {
    return new Promise(function (resolve, reject) {
        sio.emit(eventName, data, (result)=>{
            console.log(result)
            resolve(result)
        });
        
    });
  }