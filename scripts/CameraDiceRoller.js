var sio;
const ID ='Camera-Dice-Roller';
const ENABLED = 'enabled';
const IP_SETTING = "ip address"
const RECOGNITION_TYPE = "recognition type"

Hooks.on('init', () => {

    Die.prototype._evaluate = _dieEvaluate;



    game.settings.register(ID,ENABLED,{
      name: 'Enable Camera Read',
      default: true,
      scope: 'client',
      config: true,
      type: Boolean,
      hint: 'enable or disable reading of camera for dice rolls',
      onChange: value =>{
        if(value){
          sio.connect();
          set_recognition_type();
        }
        else{
          sio.disconnect();
        }
      }
    })
    
    game.settings.register(ID,IP_SETTING,{
      name: 'IP Adress:',
      default: 'localhost',
      scope: 'client',
      config: true,
      type: String,
      hint: 'enter the ip address of the raspberry pi',
      onChange: value => {
        sio.disconnect();
        create_socket_io(value);
      }
    })

    game.settings.register(ID, RECOGNITION_TYPE,{
      name: 'Recognition Type',
      default: 'QR code',
      scope: 'client',
      config: true,
      type: String,
      choices :{
        'QR code' : 'QR code',
        'colour' : 'colour',
        'colour HSV' : 'colour HSV',
        'number recognition' : 'number recognition'
      },
      hint: 'select the type of recognition to be used',
      onChange: value =>{
        if(sio.connected){
          set_recognition_type();
        }
      }
    })



//192.168.1.230
    
    create_socket_io(game.settings.get(ID,IP_SETTING))
    
});

function create_socket_io(ip_address){
  sio = io('http://' + ip_address + ':8080',{
    autoConnect: false
  });
  sio.on('connect',(_) =>{
    set_recognition_type();
  })
  if(game.settings.get(ID,ENABLED)){
    sio.connect();
  }

}

function set_recognition_type(){
  sio.emit('set_recognition_type', game.settings.get(ID,RECOGNITION_TYPE))
}

 async function _dieEvaluate(options){
    if ( (this.number > 999) ) {
        throw new Error(`You may not evaluate a DiceTerm with more than 999 requested results`);
      }
      if (game.settings.get(ID,ENABLED)){
        var x = await asyncEmit("get_roll",{"number":this.number,"type":options.maximum});
      }
      for ( let n=1; n <= this.number; n++ ) {
        this.roll(options);
        if(game.settings.get(ID,ENABLED)){
          this.results[n - 1].result = x[n-1];
        }
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