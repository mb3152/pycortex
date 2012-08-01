function Websock() {
    this.ws = new WebSocket("ws://"+location.host+"/wsconnect/");
    this.ws.onopen = function(evt) {
        this.ws.send("connect");
    }.bind(this);
    this.ws.onmessage = function(evt) {
        var jsdat = JSON.parse(evt.data);
        var func = this[jsdat.method];
        var resp = func.apply(this, jsdat.params);
        //Don't return jquery objects, 
        if (resp instanceof $) {
            this.ws.send(JSON.Stringify(null));
        } else {
            this.ws.send(JSON.stringify(resp))
        }
    }.bind(this);
}
Websock.prototype.get = function(name) {
    var last;
    var o = window;
    var names = name.split(".");
    for (var i = 1; i < names.length; i++) {
        last = o;
        o = o[names[i]];
    }
    return [last, o];
}
Websock.prototype.query = function(name) {
    var names = [];
    for (var name in this.get(name)[1])
        names.push(name)
    return names;
}
Websock.prototype.run = function(name, params) {
    for (var i = 0; i < params.length; i++) {
        if (params[i]['__class__'] !== undefined) {
            params[i] = window[params[i]['__class__']].fromJSON(params[i]);
        }
    }
    var resp = this.get(name);
    var obj = resp[0], func = resp[1];
    try {
        resp = func.apply(obj, params);
    } catch (e) {
        resp = {error:e.message};
    }
    return resp === undefined ? null : resp;
}
Websock.prototype.index = function(name, idx) {

}
