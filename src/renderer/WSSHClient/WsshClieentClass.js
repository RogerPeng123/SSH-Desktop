class WsshClient {

    _generateEndpoint() {
        let protocol = '';
        if (window.location.protocol === 'https') {
            protocol = 'wss://';
        } else {
            protocol = 'ws://';
        }

        return protocol + '127.0.0.1:8080/webssh';
    }

    connect(options) {
        let endpoint = this._generateEndpoint();

        if (window.WebSocket) {
            this._connection = new WebSocket(endpoint);
        } else {
            console.error("WebSocket Not Supported!");
            options.onError("WebSocket Not Supported!");
            return;
        }

        this._connection.onopen = function () {
            options.onConnect();
        };

        this._connection.onmessage = function (evt) {
            let data = evt.data.toString();
            options.onData(data);
        };

        this._connection.onclose = function (evt) {
            options.onClose();
        }
    }

    send(data) {
        this._connection.send(JSON.stringify(data));
    }

    sendInitData(options) {
        this._connection.send(JSON.stringify(options));
    }

    sendClientData(data) {
        this._connection.send(JSON.stringify({
            "operate": "command",
            "command": data
        }))
    }
}

export default WsshClient;
